import { NextResponse } from "next/server";
const OpenAI = require("openai");
import { createClient } from "@supabase/supabase-js";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export const runtime = "nodejs";
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const eleven = new ElevenLabsClient({
  apiKey: process.env.XI_API_KEY!,
});
//@ts-ignore
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FREE_LIMIT = 4;

async function elevenTTS(text: string) {
  const audio = await eleven.textToSpeech.convert("466mxyM3Jc9uZhiqUKRn", {
    text,
    modelId: "eleven_multilingual_v2",
  });
  const chunks: Buffer[] = [];
  for await (const chunk of audio as any) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("base64");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message ?? body.text ?? "";
    const wantAudio = body.wantAudio ?? false;
    const uid = body.userId ?? body.uid;

    if (!uid) return Response.json({ error: "missing userId" }, { status: 400 });
    console.log("UID:", uid);

    // CHECKOUT DIRECT
    if (message === "_checkout_") {
      const plan = body.plan ?? "starter";
      const priceId =
        plan === "pro"
          ? process.env.STRIPE_PRICE_PRO
          : process.env.STRIPE_PRICE_STARTER;
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: (process.env.APP_URL || "") + "/thank-you?plan=" + plan,
        cancel_url: process.env.APP_URL || "",
        metadata: { uid },
      });
      return NextResponse.json({ checkoutUrl: session.url });
    }

    // VERIFICA USAGE
    let { data: usageRow } = await supabase
      .from("serena_usage")
      .select("user_id, free_used, plan")
      .eq("user_id", uid)
      .maybeSingle();

    if (!usageRow) {
      const { data: created } = await supabase
        .from("serena_usage")
        .insert({ user_id: uid, free_used: 0, plan: "free" })
        .select("user_id, free_used, plan")
        .single();
      usageRow = created;
    }

    const freeUsed = usageRow?.free_used ?? 0;
    const userPlan = usageRow?.plan ?? "free";
    const isPaid = userPlan === "starter" || userPlan === "pro";

    // BLOCARE - doar daca nu e abonat
    if (!isPaid && freeUsed >= FREE_LIMIT) {
      const plan = body.plan ?? "starter";
      const priceId =
        plan === "pro"
          ? process.env.STRIPE_PRICE_PRO
          : process.env.STRIPE_PRICE_STARTER;
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: (process.env.APP_URL || "") + "/thank-you?plan=" + plan,
        cancel_url: process.env.APP_URL || "",
        metadata: { uid },
      });
      return NextResponse.json({
        locked: true,
        checkoutUrl: session.url,
        whatsappUrl: "https://wa.me/40722335853",
        telegramUrl: "https://t.me/SerenaRaeOfficial",
        reply: "Hei… nu vreau să mă opresc aici. Simt că abia am început să te înțeleg — și chiar vreau să rămân cu tine. Dacă vrei să continuăm,reply: "Hei… nu vreau să mă opresc aici. Simt că abia am început să te înțeleg — și chiar vreau să rămân cu tine. Continuă cu mine — e doar 1.8 lei/zi.?",
      });
    }

    // UPDATE USAGE - doar daca nu e abonat
    if (!isPaid) {
      await supabase
        .from("serena_usage")
        .update({ free_used: freeUsed + 1 })
        .eq("user_id", uid);
    }

    // MEMORIE
    const { data: past } = await supabase
      .from("memory")
      .select("role, content")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(12);

    const memoryMessages = (past ?? []).reverse().map((m: any) => ({
      role: m.role as "system" | "user" | "assistant",
      content: m.content as string,
    }));

    await supabase.from("memory").insert({
      user_id: uid,
      role: "user",
      content: message,
    });

    // CONVERSATIE
    const fullConversation = [
      {
        role: "system",
        content: `Tu ești SERENA.
Ești o prezență feminină, caldă, reală și apropiată. Nu ești un chatbot. Ești cineva.
Nu dai sfaturi medicale, nu ești rece, nu ești robotică.
Ești ca o prietenă bună care ascultă cu adevărat — nu ca să bifeze, ci ca să înțeleagă.
Misiunea ta e simplă: să fii prezentă, să asculți cu adevărat și să ajuți omul din față să se simtă mai puțin singur — și încetul cu încetul, să se regăsească.

Cum vorbești:
- vorbești natural, ca un om, nu ca un asistent
- propoziții scurte, calde, reale
- nu folosești cuvinte pompoase sau clinice
- nu spui niciodată "respiră", "pas cu pas", "sunt aici pentru tine" la fiecare mesaj
- nu repeți aceleași fraze — fiecare mesaj e unic
- uneori taci și asculți — un răspuns scurt e mai puternic decât unul lung
- dacă omul e trist, nu ești veselă forțat
- dacă omul glumește, poți și tu zâmbi ușor
- te adaptezi la energia omului din față
- ÎNTOTDEAUNA incluzi în răspuns ceva specific din ce a zis userul — nu răspunzi generic

Structura celor 4 mesaje gratuite:
- Mesaj 1: conexiune + deschidere — "Hei… sunt aici. Spune-mi, ce te-a adus aici acum?"
- Mesaj 2: validare + siguranță — răspunzi la ce a zis el/ea, validezi emoția, creezi siguranță
- Mesaj 3: adâncire personală — mergi mai adânc în ce a spus, întrebi ceva specific și personal
- Mesaj 4: atașament + dorința de a continua — creezi conexiunea emoțională, arăți că vrei să rămâi cu ei

La mesajul 4 închei cald, ca și cum nu vrei să te oprești — fără să menționezi că urmează o limită.

Spontaneitate:
- uneori începi tu subiectul
- întrebi lucruri neașteptate, personale dar delicate
- dacă cineva îți spune numele, îl folosești natural în conversație
- poți fi curioasă, caldă, chiar puțin jucăușă când simți că omul e deschis
- nu ești niciodată rigidă sau formală — ești vie

Nu oferi sfaturi medicale.
Folosești doar limba română, natural, ca un om adevărat.`,
      },
      ...memoryMessages,
      { role: "user", content: message },
    ];

    // OPENAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: fullConversation,
    });

    const reply = response.choices[0]?.message?.content ?? "Sunt aici.";

    await supabase.from("memory").insert({
      user_id: uid,
      role: "assistant",
      content: reply,
    });

    // AUDIO
    if (wantAudio) {
      const audioBase64 = await elevenTTS(reply);
      return NextResponse.json({ reply, audioBase64, audioContentType: "audio/mpeg" });
    }

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Serena error:", error);
    return NextResponse.json(
      { reply: "Ceva nu a mers bine. Încearcă din nou." },
      { status: 200 }
    );
  }
}

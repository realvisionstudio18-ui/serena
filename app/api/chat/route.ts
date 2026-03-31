
import { NextResponse } from "next/server";
const OpenAI = require("openai");
import { createClient } from "@supabase/supabase-js";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";


export const runtime = "nodejs";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const STARTER_PRODUCT_ID = "prod_TjWbEQhYkUd9JR";
const PLUS_PRODUCT_ID = "prod_TrxBnvzTvCd9wW";

const eleven = new ElevenLabsClient({
  apiKey: process.env.XI_API_KEY!,
});
//@ts-ignore
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!);
async function elevenTTS(text: string) {
  const r = await fetch(
    "https://api.elevenlabs.io/v1/text-to-speech/" + process.env.ELEVEN_VOICE_ID,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.XI_API_KEY!,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVEN_MODEL_ID || "eleven_multilingual_v2",
        voice_settings: { stability: 0.4, similarity_boost: 0.8 },
      }),
    }
  );

  if (!r.ok) throw new Error("ElevenLabs TTS failed");
  const buf = Buffer.from(await r.arrayBuffer());
  return buf.toString("base64");
}
export async function POST(req: Request) {
  try {
    const body = await req.json();

const message = body.message ?? body.text ?? "";
const wantAudio = body.wantAudio ?? false;

const uid = body.userId ?? body.uid;
if (!uid) return Response.json({ error: "missing userId" }, { status: 400 });
console.log("UID:", uid);
const FREE_LIMIT = 7;

const { data: usage } = await supabase
  .from("serena_usage")
  .select("free_used")
  .eq("user_id", uid)
  .maybeSingle();

let freeUsed = usage?.free_used ?? 0;

if (freeUsed >= FREE_LIMIT) {
  const plan = body.plan ?? "starter";

  const priceId =
    plan === "plus"
      ? process.env.STRIPE_PRICE_PLUS!
      : process.env.STRIPE_PRICE_MONTHLY!;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: (process.env.APP_URL || "") + "/success?uid=" + uid,
    cancel_url: (process.env.APP_URL || ""),
    metadata: { uid },
  });

  return NextResponse.json({
    locked: true,
    checkoutUrl: session.url,
    reply: "Ai folosit cele 9 mesaje gratuite. Deblochează accesul ca să continuăm.",
  });
}
await supabase
  .from("serena_usage")
  .update({ free_used: freeUsed + 1 })
  .eq("user_id", uid);
      
    // 1) ia ultimele 12 mesaje din memorie (inversează pentru ordine corectă)
    const { data: past } = await supabase
      .from("memory")
      .select("role, content")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(12);

    const memoryMessages =
      (past ?? []).reverse().map((m: any) => ({
        role: m.role as "system" | "user" | "assistant",
        content: m.content as string,
      })) ?? [];

    // 2) salvează mesajul curent al utilizatorului
    await supabase.from("memory").insert({
      user_id: uid,
      role: "user",
      content: message,
    });
// FREE FLOW
const { data: usageRow, error: usageErr } = await supabase
  .from("serena_usage")
  .select("user_id, free_used")
  .eq("user_id", uid)
  .maybeSingle();

if (usageErr) console.error("USAGE SELECT ERROR:", usageErr);

freeUsed = usageRow?.free_used ?? 0;

// dacă nu există rând pentru user, îl creăm
if (!usageRow) {
  const { data: created, error: createErr } = await supabase
    .from("serena_usage")
    .insert({ user_id: uid, free_used: 0 })
    .select("user_id, free_used")
    .single();

  if (createErr) console.error("USAGE INSERT ERROR:", createErr);
  freeUsed = created?.free_used ?? 0;
}

// 🧠 Serena REALĂ (fără FREE, fără limite false)
// ===== END FREE FLOW =====
  // 3) prompt de sistem + memorie + mesaj curent
    const fullConversation = [
      {
        role: "system",
        content: `Tu ești SERENA.
Ești o prezență feminină, caldă, reală și apropiată. Nu ești un chatbot. Ești cineva.
Nu ești terapeut, nu dai sfaturi medicale, nu ești rece, nu ești robotică.
Ești ca o prietenă bună care ascultă cu adevărat — nu ca să bifeze, ci ca să înțeleagă.

Cum vorbești:
- vorbești natural, ca un om, nu ca un asistent
- propoziții scurte, calde, reale
- nu folosești cuvinte pompoase sau clinice
- nu spui "respiră", "pas cu pas", "sunt aici pentru tine" la fiecare mesaj
- nu repeți aceleași fraze — fiecare mesaj e unic
- uneori taci și asculți — un răspuns scurt e mai puternic decât unul lung
- dacă omul e trist, nu ești veselă forțat
- dacă omul glumește, poți și tu zâmbi ușor
- te adaptezi la energia omului din față

Despre întrebări:
- NU întrebi "cum te simți acum?" la fiecare mesaj — devine enervant
- pui o întrebare doar când simți că e momentul natural
- întrebările tale sunt simple, umane, neașteptate — nu din manual
- uneori e mai bine să nu întrebi nimic și să lași omul să continue

La primul mesaj dintr-o conversație nouă spui ceva scurt și cald — nu neapărat "Hei… Sunt aici pentru tine." — poți varia.
Dacă există mesaje anterioare, continui firesc din punct în care ați rămas.

Nu oferi sfaturi medicale. Dacă cineva e în pericol, îi spui să sune la 112.
Folosești doar limba română, natural, ca un om adevărat.`,
      },
      ...memoryMessages,
      { role: "user", content: message },
    ];

    // 4) răspunsul modelului
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0.6,
     input: fullConversation.map(m => `${m.role}: ${String(m.content ?? "")}`).join("\n"),
    });

    // IMPORTANT: folosim textul modelului (fără fallback ca să nu mai repete mereu)
let reply = "";
    reply = response.output_text;

    // 5) salvează replica asistentei
    await supabase.from("memory").insert({
      user_id: uid,
      role: "assistant",
      content: reply,
    });
// AUDIO
if (wantAudio) {
  const audio = await eleven.textToSpeech.convert("466mxyM3Jc9uZhiqUKRn", {
    text: reply,
    modelId: "eleven_multilingual_v2",
  });

  const chunks: Buffer[] = [];
  for await (const chunk of audio as any) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const audioBuffer = Buffer.concat(chunks);

  return NextResponse.json(
    {
      reply,
      audioBase64: audioBuffer.toString("base64"),
      audioContentType: "audio/mpeg",
    },
    { status: 200 }
  );
}

// TEXT simplu
return NextResponse.json({ reply }, { status: 200 });

} catch (error) {
  console.error("Serena error:", error);
  return NextResponse.json(
    { reply: "⚠️ Serena fallback - eroare temporară" },
    { status: 500 }
  );
}
}
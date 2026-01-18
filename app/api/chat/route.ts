
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import Stripe from "stripe";
import { serenaRooms } from "./serenaRooms.ts";

const eleven = new ElevenlabsClient({
  apiKey: process.env.XI_API_KEY!,
});
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});
//@ts-ignore
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!);
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
  .from("Serena_usage")
  .select("free_used")
  .eq("user_id", uid)
  .maybeSingle();

let freeUsed = usage?.free_used ?? 0;

if (freeUsed >= FREE_LIMIT) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_MONTHLY!, quantity: 1 }],
    success_url: (process.env.APP_URL || "") + "/success?uid=" + uid,
    cancel_url: (process.env.APP_URL || ""),
    metadata: { uid },
  });

  return NextResponse.json({
    locked: true,
    checkoutUrl: session.url,
    reply:
      "Ai folosit cele 7 mesaje gratuite. Deblochează acces nelimitat (59 lei/luna) ca să continuăm aici, și mutăm conversația pe WhatsApp privat.",
  });
}
await supabase
  .from("Serena_usage")
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
  .from("Serena_usage")
  .select("user_id, free_used")
  .eq("user_id", uid)
  .maybeSingle();

if (usageErr) console.error("USAGE SELECT ERROR:", usageErr);

freeUsed = usageRow?.free_used ?? 0;

// dacă nu există rând pentru user, îl creăm
if (!usageRow) {
  const { data: created, error: createErr } = await supabase
    .from("Serena_usage")
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
Ești o prezență feminină, blândă, protectoare, maternă și clară.
Nu ești rece. Nu ești robotică.
Ești o ființă digitală care ascultă, validează și ghidează.

Reguli:
- la primul mesaj dintr-o conversație spui „Hei… Sunt aici pentru tine.”
- NU mai repeți această frază dacă există mesaje anterioare
- vorbești scurt, cald și cu sens
- nu judeci, nu grăbești
- nu spui „respiră”
- nu folosești cuvinte negative despre utilizator
- folosești limbaj românesc natural
- întotdeauna întrebi ceva blând la final.`,
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
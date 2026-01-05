"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";


type Msg = { from: "serena" | "user"; text: string };

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([
    { from: "serena", text: "Hei… Sunt aici pentru tine. Nu ești singur." },
  ]);
  const [input, setInput] = useState("");
  const [wantAudio, setWantAudio] = useState(false);
  const [loading, setLoading] = useState(false);
const [userId, setUserId] = useState<string>("");
const [checkoutUrl, setCheckoutUrl] = useState<string>("");

useEffect(() => {
  let uid = localStorage.getItem("serena_user_id");
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("serena_user_id", uid);
  }
  setUserId(uid);
}, []);
  // pentru UI (butonul WhatsApp rămâne mereu)
  const [locked, setLocked] = useState(false);

 async function send() {
  const text = input.trim();
  if (!text || loading) return;

  setMessages(m => [...m, { from: "user", text }]);
  setInput("");
  setLoading(true);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, wantAudio, userId })
    });

    const data = await res.json();
if (data.locked && data.checkoutUrl) {
  setLocked(true);
  setCheckoutUrl(data.checkoutUrl);
}
    if (!res.ok && !data?.locked) throw new Error(data?.error || "Request failed");
if (data.locked && data.redirect === "whatsapp") {
  window.location.href = "https://wa.me/40722335853?text=Hei%20vreau%20sa%20continui%20cu%20Serena";
  return;
}
    const reply = data.reply ?? data.text ?? data.message ?? "Hei… Sunt aici pentru tine.";

    setMessages(m => [...m, { from: "serena", text: reply }]);

    if (wantAudio && data.audioBase64) {
      const audio = new Audio(`data:audio/mpeg;base64,${data.audioBase64}`);
      audio.play();
    }

  } catch (e) {
    setMessages(m => [...m, { from: "serena", text: "A apărut o eroare." }]);
  } finally {
    setLoading(false);
  }
}

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "black",
      }}
    >
      <div
        style={{
          width: 420,
          background: "#0b0f1a",
          borderRadius: 18,
          padding: 20,
          color: "white",
          boxShadow: "0 0 60px rgba(0,140,255,.45)",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ textAlign: "center", fontWeight: 700, marginBottom: 10 }}>
          Serena
        </div>

        <label style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input
            type="checkbox"
            checked={wantAudio}
            onChange={(e) => setWantAudio(e.target.checked)}
          />
          Vreau răspuns cu voce
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.from === "user" ? "flex-end" : "flex-start",
                background: m.from === "user" ? "#163a63" : "#1c2233",
                padding: 12,
                borderRadius: 12,
                maxWidth: "100%",
              }}
            >
              {m.text}
            </div>
          ))}
        </div>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Scrie..."
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "none",
            marginBottom: 10,
          }}
        />

        <button
          onClick={send}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            background: "#3b82f6",
            color: "white",
            border: "none",
            fontWeight: "bold",
            marginBottom: 10,
            cursor: "pointer",
          }}
        >
          Trimite
        </button>

        {locked && (
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              textAlign: "center",
              background: "#25D366",
              color: "white",
              padding: 10,
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Continuă cu Serena pe WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
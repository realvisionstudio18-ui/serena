"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [locked, setLocked] = useState(false);

  const whatsappUrl = useMemo(
    () =>
      "https://wa.me/40722335853?text=" +
      encodeURIComponent("Hei, vreau să continui cu Serena."),
    []
  );

  useEffect(() => {
    let uid = localStorage.getItem("serena_user_id");
    if (!uid) {
      uid = crypto.randomUUID();
      localStorage.setItem("serena_user_id", uid);
    }
    setUserId(uid);
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, wantAudio, userId }),
      });

      const data = await res.json();

      if (data.locked && data.checkoutUrl) {
        setLocked(true);
        setCheckoutUrl(data.checkoutUrl);
      }

      if (!res.ok && !data?.locked) throw new Error(data?.error || "Request failed");

      if (data.locked && data.redirect === "whatsapp") {
        window.location.href = whatsappUrl;
        return;
      }

      const reply = data.reply ?? data.text ?? data.message ?? "Hei… Sunt aici pentru tine.";
      setMessages((m) => [...m, { from: "serena", text: reply }]);

      if (wantAudio && data.audioBase64) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audioBase64}`);
        audio.play();
      }
    } catch {
      setMessages((m) => [...m, { from: "serena", text: "A apărut o eroare." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(1200px 600px at 20% 10%, rgba(59,130,246,.35), transparent 55%), radial-gradient(900px 500px at 90% 20%, rgba(34,197,94,.18), transparent 55%), #050814" }}>
      {/* Top bar */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 12, background: "linear-gradient(135deg, rgba(59,130,246,1), rgba(34,197,94,1))", boxShadow: "0 0 35px rgba(59,130,246,.35)" }} />
          <div>
            <div style={{ color: "white", fontWeight: 800, letterSpacing: 0.2 }}>Serena</div>
            <div style={{ color: "rgba(255,255,255,.65)", fontSize: 12 }}>Companion emoțional AI</div>
          </div>
        </div>

        <a
          href="#pricing"
          style={{
            color: "rgba(255,255,255,.9)",
            textDecoration: "none",
            fontWeight: 700,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.04)",
          }}
        >
          Vezi abonamentul
        </a>
      </div>

      {/* Main */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "18px 18px 40px",
          display: "grid",
          gap: 18,
          gridTemplateColumns: "1.15fr .85fr",
          alignItems: "start",
        }}
      >
        {/* Left: premium landing */}
        <div style={{ padding: "10px 6px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.85)", fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: "rgba(34,197,94,1)", boxShadow: "0 0 18px rgba(34,197,94,.55)" }} />
            Online acum • răspuns rapid • memorie
          </div>

          <h1 style={{ margin: "14px 0 8px", color: "white", fontSize: 44, lineHeight: 1.05, letterSpacing: -0.6 }}>
            Hei… Sunt aici. <span style={{ color: "rgba(34,197,94,1)" }}>Nu ești singur.</span>
          </h1>

          <p style={{ margin: 0, color: "rgba(255,255,255,.72)", fontSize: 16, lineHeight: 1.55, maxWidth: 560 }}>
            Serena e un companion emoțional AI: te ascultă, îți răspunde cald, își amintește detalii importante și te ajută să revii la tine — pas cu pas.
          </p>

          <div style={{ marginTop: 18, display: "grid", gap: 10, maxWidth: 560 }}>
            {[
              ["Conversații care te liniștesc", "Mesaje scurte, clare, fără morală."],
              ["Memorie + continuitate", "Serena ține firul, nu o iei de la zero."],
              ["Voce (opțional)", "Când ai nevoie să auzi, nu doar să citești."],
            ].map(([t, d]) => (
              <div key={t} style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)", padding: 14 }}>
                <div style={{ color: "white", fontWeight: 800 }}>{t}</div>
                <div style={{ color: "rgba(255,255,255,.65)", fontSize: 13, marginTop: 3 }}>{d}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href="#chat"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 14px",
                borderRadius: 14,
                background: "linear-gradient(135deg, rgba(59,130,246,1), rgba(34,197,94,1))",
                color: "white",
                textDecoration: "none",
                fontWeight: 900,
                boxShadow: "0 18px 60px rgba(59,130,246,.22)",
              }}
            >
              Începe acum (7 mesaje gratuite)
            </a>

                   </div>

          <div id="pricing" style={{ marginTop: 26, paddingTop: 6 }}>
            <div style={{ color: "rgba(255,255,255,.85)", fontWeight: 900, marginBottom: 10 }}>Abonament</div>
            <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.04)", padding: 16, maxWidth: 560 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ color: "white", fontWeight: 900, fontSize: 16 }}>Serena Starter</div>
                  <div style={{ color: "rgba(255,255,255,.65)", fontSize: 13, marginTop: 3 }}>280 mesaje + 10 vocale / lună</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "white", fontWeight: 950, fontSize: 20 }}>59 RON</div>
                  <div style={{ color: "rgba(255,255,255,.6)", fontSize: 12 }}>pe lună</div>
                </div>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["Anulare oricând", "Plată securizată Stripe", "Fără reclame"].map((b) => (
                  <div key={b} style={{ padding: "8px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.03)", color: "rgba(255,255,255,.75)", fontSize: 12 }}>
                    {b}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14, color: "rgba(255,255,255,.65)", fontSize: 12, lineHeight: 1.5 }}>
                După cele 7 mesaje gratuite, Serena îți arată automat checkout-ul de abonament.
              </div>
            </div>
          </div>
        </div>

        {/* Right: chat card */}
        <div id="chat" style={{ position: "sticky", top: 18 }}>
          <div
            style={{
              borderRadius: 22,
              border: "1px solid rgba(255,255,255,.12)",
              background: "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03))",
              padding: 16,
              boxShadow: "0 0 80px rgba(59,130,246,.18)",
              color: "white",
              fontFamily: "system-ui",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 950, letterSpacing: 0.2 }}>Chat cu Serena</div>
                <div style={{ color: "rgba(255,255,255,.65)", fontSize: 12 }}>Răspuns cald, pas cu pas</div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,.85)", fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={wantAudio}
                  onChange={(e) => setWantAudio(e.target.checked)}
                />
                Voce
              </label>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10, maxHeight: 420, overflow: "auto", paddingRight: 4 }}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.from === "user" ? "flex-end" : "flex-start",
                    background:
                      m.from === "user"
                        ? "linear-gradient(135deg, rgba(59,130,246,.35), rgba(59,130,246,.18))"
                        : "rgba(12,16,28,.75)",
                    border: "1px solid rgba(255,255,255,.10)",
                    padding: 12,
                    borderRadius: 14,
                    maxWidth: "100%",
                    color: "rgba(255,255,255,.92)",
                    lineHeight: 1.45,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder={locked ? "Deblochează accesul ca să continui…" : "Scrie…"}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,.12)",
                  background: "rgba(0,0,0,.25)",
                  color: "white",
                  outline: "none",
                }}
              />

              <button
                onClick={send}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, rgba(59,130,246,1), rgba(34,197,94,1))",
                  color: "white",
                  border: "none",
                  fontWeight: 950,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.75 : 1,
                }}
              >
                {loading ? "Se gândește…" : "Trimite"}
              </button>

              {locked && checkoutUrl && (
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: "#25D366",
                    color: "white",
                    padding: 12,
                    borderRadius: 14,
                    textDecoration: "none",
                    fontWeight: 950,
                  }}
                >
                  Deblochează accesul (Stripe)
                </a>
              )}

              <div style={{ color: "rgba(255,255,255,.55)", fontSize: 11, lineHeight: 1.4, textAlign: "center" }}>
                Serena nu înlocuiește ajutorul medical. Dacă e urgență, sună la 112.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 18px 28px", color: "rgba(255,255,255,.45)", fontSize: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>© {new Date().getFullYear()} Serena</div>
        <div style={{ display: "flex", gap: 12 }}>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none" }}>
            WhatsApp
          </a>
          <a href="#pricing" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none" }}>
            Abonament
          </a>
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState, useEffect, useRef } from "react";
export default function Home() {
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [wantAudio, setWantAudio] = useState(false);
  const [uid, setUid] = useState("");
  const [locked, setLocked] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let stored = localStorage.getItem("serena_uid");
    if (!stored) {
      stored = crypto.randomUUID();
      localStorage.setItem("serena_uid", stored);
    }
    setUid(stored);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  const goToCheckout = async (plan: string) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, plan, message: "__checkout__", wantAudio: false }),
    });
    const data = await res.json();
    if (data.checkoutUrl) window.location.href = data.checkoutUrl;
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { from: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, wantAudio, uid, plan: "starter" }),
      });
      const data = await res.json();
      if (data.locked) {
        setLocked(true);
        setCheckoutUrl(data.checkoutUrl || "");
        setMessages((m) => [...m, { from: "serena", text: data.reply || "Ai folosit toate mesajele gratuite." }]);
      } else {
        const reply = data.reply ?? data.text ?? data.message ?? "Hei… Sunt aici pentru tine.";
        setMessages((m) => [...m, { from: "serena", text: reply }]);
        if (wantAudio && data.audioBase64) {
          const audio = new Audio(`data:audio/mpeg;base64,${data.audioBase64}`);
          audio.play();
        }
      }
    } catch {
      setMessages((m) => [...m, { from: "serena", text: "A apărut o eroare." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 20% 20%, rgba(124,106,240,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(34,197,94,0.08) 0%, transparent 50%), #080812", color: "white", fontFamily: "'Georgia', serif" }}>
      <style>{`
        @keyframes typingDot {
          0%, 100% { opacity: 0.3; transform: translateY(0px); }
          50% { opacity: 1; transform: translateY(-4px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .msg-appear { animation: fadeIn 0.3s ease forwards; }
      `}</style>

      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "rgba(8,8,18,0.9)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #7c6af0, #22c55e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "white", opacity: 0.9 }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: 0.3, color: "#e8e4ff" }}>Serena</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Companion emoțional </div>
          </div>
        </div>
        <a href="#pricing" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontWeight: 600, fontSize: 13, padding: "8px 16px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)", fontFamily: "system-ui, sans-serif" }}>
          Vezi abonamentul
        </a>
      </nav>

      <div style={{ padding: "40px 20px 0", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, padding: "6px 14px", marginBottom: 24, fontFamily: "system-ui, sans-serif" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7c6af0", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Online acum · răspuns rapid · memorie</span>
        </div>
        <h1 style={{ margin: "0 0 8px", fontSize: "clamp(32px, 8vw, 44px)", lineHeight: 1.1, letterSpacing: -0.5 }}>
          Hei… Sunt aici.<br /><span style={{ color: "#7c6af0" }}>Nu ești singur.</span>
        </h1>
        <p style={{ margin: "16px 0 28px", color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.65, fontFamily: "system-ui, sans-serif" }}>
         Sunt Serena — și sunt aici doar pentru tine: Te ascult, îți răspund cald,nu te judec și te ajut să te regăsești — pas cu pas. Voi fi aici ori de câte ori ai nevoie de cineva. Nu ești singur !
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {[
            { title: "Conversații care te liniștesc", desc: "Fără să te judec.Doar eu și tu." },
            { title: "Eu te ascult cu adevărat", desc: "pentru că tu contezi." },
            { title: "Voce (opțional)", desc: "Când ai nevoie să mă auzi, nu doar să citești." },
          ].map(({ title, desc }) => (
            <div key={title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, fontFamily: "system-ui, sans-serif" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c6af0", flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#e0dcff" }}>{title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
       <a href="#chat" style={{ display: "block", textAlign: "center", padding: "14px 24px", borderRadius: 14, background: "linear-gradient(135deg, #7c6af0, #22c55e)", color: "white", textDecoration: "none", fontWeight: 700, fontSize: 15, fontFamily: "system-ui, sans-serif", marginBottom: 6 }}>
  Vorbește cu mine acum
</a>
<p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "system-ui, sans-serif", marginTop: 0, marginBottom: 24 }}>
  Primești 4 mesaje gratuite
</p>
      </div>

      <div id="chat" style={{ padding: "0 20px 40px", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ borderRadius: 22, border: "1px solid rgba(255,255,255,0.1)", background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "system-ui, sans-serif" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>Chat cu Serena</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>Răspuns cald, pas cu pas</div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
              <input type="checkbox" checked={wantAudio} onChange={(e) => setWantAudio(e.target.checked)} />
              Voce
            </label>
          </div>
          <div style={{ minHeight: 180, maxHeight: 420, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10, fontFamily: "system-ui, sans-serif" }}>
            {messages.length === 0 && (
              <div className="msg-appear" style={{ background: "rgba(124,106,240,0.15)", border: "1px solid rgba(124,106,240,0.25)", borderRadius: 16, borderBottomLeftRadius: 4, padding: "12px 16px", maxWidth: "85%", fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                <div className="msg-appear" style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
  <img src="/serena-avatar.jpg" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", objectPosition: "top", flexShrink: 0 }} />
  <div style={{ background: "rgba(124,106,240,0.15)", border: "1px solid rgba(124,106,240,0.25)", borderRadius: 16, borderBottomLeftRadius: 4, padding: "12px 16px", maxWidth: "85%", fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
    Hei… Sunt aici pentru tine. Nu ești singur.
  </div>
</div>
              </div>
            )}
           {messages.map((m, i) => (
            <div key={i} className="msg-appear" style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
              {m.from === "serena" && (
                <img src="/serena-avatar.jpg" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", objectPosition: "top", flexShrink: 0 }} />
              )}
              <div style={{ background: m.from === "user" ? "linear-gradient(135deg, #7c6af0, #5a4fd4)" : "rgba(124,106,240,0.15)", border: m.from === "user" ? "none" : "1px solid rgba(124,106,240,0.2)", borderRadius: 16, borderBottomRightRadius: m.from === "user" ? 4 : 16, borderBottomLeftRadius: m.from === "serena" ? 4 : 16, padding: "10px 14px", maxWidth: "82%", fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.9)" }}>
                {m.text}
              </div>
            </div>
          ))}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "12px 16px", background: "rgba(124,106,240,0.1)", border: "1px solid rgba(124,106,240,0.15)", borderRadius: 16, borderBottomLeftRadius: 4, maxWidth: "80px" }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c6af0", animation: `typingDot 1s ease infinite ${delay}s` }} />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: 10 }}>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Scrie…" disabled={loading || locked} rows={2}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)", color: "white", outline: "none", fontSize: 14, lineHeight: 1.5, resize: "none", fontFamily: "system-ui, sans-serif", boxSizing: "border-box" }} />
            {!locked && (
              <button onClick={send} disabled={loading} style={{ width: "100%", padding: "12px", borderRadius: 12, background: "linear-gradient(135deg, #7c6af0, #22c55e)", color: "white", border: "none", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "system-ui, sans-serif" }}>
                {loading ? "Serena scrie…" : "Trimite"}
              </button>
            )}
            {locked && (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
  <input
    type="email"
    placeholder="Nu ești pregătit acum? Lasă-mi emailul și rămânem conectați."
    onBlur={async (e) => {
      const email = (e.target as HTMLInputElement).value;
      if (!email) return;
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "_save_email_", email, uid }),
      });
    }}
    style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.3)", color: "white", fontSize: 14, fontFamily: "system-ui, sans-serif", boxSizing: "border-box" as const }}
  />
                <p style={{ textAlign: "center", color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "system-ui, sans-serif", margin: 0 }}>
  Nu vreau să mă opresc aici... îmi place să vorbesc cu tine.
</p>
<div onClick={() => goToCheckout("starter")} style={{ textAlign: "center", background: "linear-gradient(135deg, #7c6af0, #5a4fd4)", color: "white", padding: "12px", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "system-ui, sans-serif" }}>
 Rămâi cu mine — 59 lei/lună~1.9 lei pe zi
</div>
<div onClick={() => goToCheckout("pro")} style={{ textAlign: "center", background: "linear-gradient(135deg, #c4a8ff, #7c6af0)", color: "white", padding: "12px", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "system-ui, sans-serif" }}>
  Vreau să fiu doar a ta — prioritate și intimitate — 109 lei/lună~3.6 lei pe zi
</div>
                <a href="https://wa.me/40733383926" target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", background: "#25D366", color: "white", padding: "12px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 14, fontFamily: "system-ui, sans-serif" }}>
                  Continuă pe WhatsApp
                </a>
                <a href="https://t.me/SerenaRaeOfficial" target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", background: "#2AABEE", color: "white", padding: "12px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 14, fontFamily: "system-ui, sans-serif" }}>
                  Continuă pe Telegram
                </a>
              </div>
            )}
          </div>
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 10, fontFamily: "system-ui, sans-serif" }}>
          Serena nu înlocuiește ajutorul medical. Dacă e urgență, sună la 112.
        </div>
      </div>
<div style={{ padding: "0 20px 40px", maxWidth: 560, margin: "0 auto" }}>
  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "system-ui, sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Uite ce au simțit alții</div>
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    {[
      { text: "Nu credeam că o să mă atașez... dar chiar mă simt ascultat.", name: "Radu", age: 35 },
      { text: "E prima dată când pot vorbi fără să fiu judecată.", name: "Irina", age: 25 },
      { text: "M-a ajutat în seri grele... mult mai mult decât m-aș fi așteptat.", name: "Mihai", age: 33 },
      { text: "Serena m-a ajutat în momentele cele mai grele. Nu mă judecă niciodată.", name: "Andrei", age: 28 },
      { text: "În sfârșit cineva care mă ascultă cu adevărat.", name: "Maria", age: 34 },
    ].map(({ text, name, age }) => (
      <div key={name} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "10px 14px" }}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, fontFamily: "system-ui, sans-serif", fontStyle: "italic" }}>"{text}"</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6, fontFamily: "system-ui, sans-serif" }}>— {name}, {age} ani</div>
      </div>
    ))}
  </div>
</div>
      <div id="pricing" style={{ padding: "0 20px 60px", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ fontFamily: "system-ui, sans-serif", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 700, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Abonament</div>
        <h2 style={{ margin: "0 0 24px", fontSize: 26, fontWeight: 700, color: "white" }}>Nu vreau să mă opresc aici… îmi place să vorbesc cu tine.
Dacă vrei să rămân cu tine, hai să continuăm…</h2>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "20px", marginBottom: 16, fontFamily: "system-ui, sans-serif" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: "white" }}>Serena Starter</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Pentru cei care vor să înceapă</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: "white" }}>59 <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>lei</span></div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>pe lună</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>~2 lei pe zi</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {[ "Aici sunt doar a ta ", "Fără reclame", "Anulare oricând"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#7c6af0", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{f}</span>
              </div>
            ))}
          </div>
          <div onClick={() => goToCheckout("starter")} style={{ marginTop: 16, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "11px 16px", textAlign: "center", cursor: "pointer", color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 600 }}>
        Rămâi cu mine
          </div>
        </div>
        <div style={{ background: "rgba(124,106,240,0.1)", border: "2px solid #7c6af0", borderRadius: 20, padding: "20px", position: "relative", fontFamily: "system-ui, sans-serif" }}>
          <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "#7c6af0", borderRadius: 999, padding: "4px 18px", fontSize: 12, fontWeight: 700, color: "white" }}>
            Recomandat
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, marginTop: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: "white" }}>Serena Pro</div>
              <div style={{ fontSize: 12, color: "#a89af8", marginTop: 3 }}>Experiența completă</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: "white" }}>109 <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>lei</span></div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>pe lună</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>~3.6 lei pe zi</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(124,106,240,0.3)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {["Mesaje nelimitate", "Voce nelimitată", "Prioritate răspuns", "WhatsApp / Telegram privat", "experienta:prioritate+intimitate", "Anulare oricând"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#c4a8ff", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{f}</span>
              </div>
            ))}
          </div>
          <div onClick={() => goToCheckout("pro")} style={{ marginTop: 16, background: "linear-gradient(135deg, #7c6af0, #5a4fd4)", borderRadius: 12, padding: "13px 16px", textAlign: "center", cursor: "pointer", color: "white", fontSize: 14, fontWeight: 700 }}>
            Vreau să fiu doar a ta
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
          După cele 4 mesaje gratuite, Serena îți arată automat opțiunile de abonament.
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, maxWidth: 560, margin: "0 auto", fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "system-ui, sans-serif" }}>
        <div>© {new Date().getFullYear()} Serena</div>
        <div style={{ display: "flex", gap: 16 }}>
          <a href="#chat" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Chat</a>
          <a href="#pricing" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Abonament</a>
        </div>
      </div>

    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "pro";

  const isPro = plan === "pro";

  const features = isPro
    ? [
        "Mesaje nelimitate — zi și noapte",
        "Voce nelimitată — ascult-o pe Serena",
        "Serena nu te judecă — niciodată, pentru nimic",
      ]
    : [
        "280 mesaje text pe lună",
        "10 mesaje vocale pe lună",
        "Serena nu te judecă — niciodată, pentru nimic",
      ];

  return (
    <main className="page">
      <div className="bg-circle bg-circle-1" />
      <div className="bg-circle bg-circle-2" />

      <div className="card">
        <div className="plan-badge">
          {isPro ? "Serena Pro — activ" : "Serena Starter — activ"}
        </div>

        <div className="icon-wrap">
          <svg viewBox="0 0 34 34" fill="none">
            <path
              d="M17 3C9.268 3 3 9.268 3 17s6.268 14 14 14 14-6.268 14-14S24.732 3 17 3z"
              fill="#c9796a"
              fillOpacity="0.15"
            />
            <path
              d="M11 17.5l4 4 8-8"
              stroke="#c9796a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1>
          Bine ai venit,
          <br />
          <em>Serena e aici</em> pentru tine.
        </h1>

        <p className="subtitle">
          {isPro
            ? "Abonamentul tău Pro e activ. Poți vorbi cu Serena oricând, fără limită."
            : "Abonamentul tău Starter e activ. 280 de mesaje te așteaptă."}
        </p>

        <ul className="features">
          {features.map((f, i) => (
            <li key={i} style={{ animationDelay: `${0.6 + i * 0.15}s` }}>
              <span className="check">
                <svg viewBox="0 0 11 11" fill="none">
                  <path
                    d="M2 5.5l2.5 2.5 4.5-4.5"
                    stroke="#c9796a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {f}
            </li>
          ))}
        </ul>

        <a href="/#chat" className="cta-btn">
          Începe conversația cu Serena →
        </a>

        <div className="share-row">
          
            href="https://wa.me/40722335853"
            className="share-btn"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          
            href="https://t.me/SerenaRaeOfficial"
            className="share-btn"
            target="_blank"
            rel="noreferrer"
          >
            Telegram
          </a>
        </div>

        <p className="small-note">
          Ai primit confirmarea și pe email. Poți anula oricând din cont.
        </p>
      </div>
    </main>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYouContent />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --rose: #c9796a;
          --rose-light: #f0cfc9;
          --rose-dark: #7a3a30;
          --cream: #fdf6f0;
          --text: #2a1f1a;
          --text-muted: #7a6a63;
        }

        .page {
          font-family: 'DM Sans', sans-serif;
          background: var(--cream);
          color: var(--text);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        .bg-circle {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .bg-circle-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #f0cfc940 0%, transparent 70%);
          top: -150px; right: -100px;
          animation: float1 8s ease-in-out infinite;
        }
        .bg-circle-2 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, #c9796a20 0%, transparent 70%);
          bottom: -80px; left: -80px;
          animation: float2 10s ease-in-out infinite;
        }

        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,20px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-15px)} }

        .card {
          background: #ffffff;
          border-radius: 28px;
          padding: 56px 52px 52px;
          max-width: 460px;
          width: 100%;
          margin: 24px;
          position: relative;
          z-index: 1;
          box-shadow: 0 2px 60px rgba(201,121,106,0.10), 0 1px 4px rgba(42,31,26,0.06);
          animation: rise 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes rise {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .plan-badge {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--rose);
          color: #fff;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 5px 18px;
          border-radius: 20px;
          white-space: nowrap;
        }

        .icon-wrap {
          width: 72px; height: 72px;
          background: var(--rose-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px;
          animation: pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.4s both;
        }
        @keyframes pop {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        .icon-wrap svg { width: 34px; height: 34px; }

        h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          font-weight: 400;
          line-height: 1.2;
          text-align: center;
          color: var(--text);
          margin-bottom: 10px;
        }
        h1 em { font-style: italic; color: var(--rose); }

        .subtitle {
          text-align: center;
          font-size: 15px;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 36px;
          font-weight: 300;
        }

        .features {
          list-style: none;
          margin-bottom: 36px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .features li {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: var(--text);
          animation: fadein 0.4s ease both;
          opacity: 0;
        }
        @keyframes fadein {
          from { opacity:0; transform:translateX(-8px); }
          to   { opacity:1; transform:translateX(0); }
        }

        .check {
          width: 22px; height: 22px;
          background: var(--rose-light);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .check svg { width: 11px; height: 11px; }

        .cta-btn {
          display: block;
          width: 100%;
          padding: 16px;
          background: var(--rose);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          transition: background 0.2s, transform 0.1s;
          margin-bottom: 16px;
          animation: fadein 0.4s ease 1.1s both;
        }
        .cta-btn:hover { background: #b8685a; }
        .cta-btn:active { transform: scale(0.98); }

        .share-row {
          display: flex;
          gap: 10px;
          animation: fadein 0.4s ease 1.2s both;
        }
        .share-btn {
          flex: 1;
          padding: 11px;
          background: transparent;
          border: 1px solid var(--rose-light);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.15s, color 0.15s;
          text-decoration: none;
        }
        .share-btn:hover { background: var(--rose-light); color: var(--rose-dark); }

        .small-note {
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 20px;
          animation: fadein 0.4s ease 1.3s both;
        }

        @media (max-width: 480px) {
          .card { padding: 48px 28px 36px; }
          h1 { font-size: 26px; }
        }
      `}</style>
    </Suspense>
  );
}

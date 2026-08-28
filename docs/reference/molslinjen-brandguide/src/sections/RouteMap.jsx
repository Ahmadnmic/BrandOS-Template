import { useState } from "react";

// "Rutekortet" — s. 50–51. A fixed, restricted palette: the smart route line
// is always Smart Blå, the alternative is always Hvid Slørsky, the land is
// Dyb Havblå, and the sea is the one place --havbla-60 is allowed to appear.
export default function RouteMap({ dark }) {
  const [showSmart, setShowSmart] = useState(true);

  return (
    <section id="rutekort" className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">04.25 / Grafisk element · s. 50</p>
          <h2>Rutekortet</h2>
          <p>
            Rutekortet spiller på, at "vejen man kender" føles kortere. Havet
            må <em>kun</em> her males i 60% Havblå — det er den ene undtagelse i
            hele farvesystemet. Slå den smarte vej til og fra.
          </p>
        </div>

        <div className="routemap" data-reveal>
          <svg viewBox="0 0 400 220" className="routemap__svg" role="img" aria-label="Rutekort">
            <defs>
              <linearGradient id="routemap-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--dyb-havbla)" />
                <stop offset="0.5" stopColor="var(--havbla-60)" />
                <stop offset="1" stopColor="var(--dyb-havbla)" />
              </linearGradient>
            </defs>
            <rect width="400" height="220" fill="url(#routemap-fade)" />
            <path
              d="M0 60 C60 90 120 40 180 70 C230 95 260 55 320 75 C360 88 380 70 400 80 L400 0 L0 0 Z"
              fill="var(--dyb-havbla)"
            />
            <path
              d="M0 150 C80 120 140 175 220 150 C280 130 330 165 400 145 L400 220 L0 220 Z"
              fill="var(--dyb-havbla)"
            />
            <path
              d="M40 70 Q 200 40 340 90"
              className="routemap__route routemap__route--unsmart"
              style={{ opacity: showSmart ? 0.35 : 1 }}
            />
            <path
              d="M40 70 Q 200 170 340 90"
              className="routemap__route routemap__route--smart"
              style={{ opacity: showSmart ? 1 : 0.35 }}
            />
            <circle cx="40" cy="70" r="5" fill="var(--hvid-slorsky)" />
            <circle cx="340" cy="90" r="5" fill="var(--hvid-slorsky)" />
            <text x="30" y="55" className="routemap__label">odden</text>
            <text x="300" y="115" className="routemap__label">ebeltoft</text>
          </svg>

          <div className="routemap__controls">
            <button
              className={`routemap__toggle ${showSmart ? "is-active" : ""}`}
              onClick={() => setShowSmart(true)}
            >
              Den smarte vej
            </button>
            <button
              className={`routemap__toggle ${!showSmart ? "is-active" : ""}`}
              onClick={() => setShowSmart(false)}
            >
              Den vante vej
            </button>
            <ul className="routemap__legend">
              <li>
                <span className="routemap__swatch" style={{ background: "var(--dyb-havbla)" }} />
                Landkort — Dyb Havblå
              </li>
              <li>
                <span className="routemap__swatch" style={{ background: "var(--smart-bla)" }} />
                Smart vej — Smart Blå
              </li>
              <li>
                <span className="routemap__swatch" style={{ background: "var(--hvid-slorsky)", border: "1px solid var(--line-on-dark)" }} />
                Vant vej — Hvid Slørsky
              </li>
              <li>
                <span className="routemap__swatch routemap__swatch--restricted" style={{ background: "var(--havbla-60)" }} />
                Hav — 60% Havblå (kun her)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import Wave from "../components/Wave";

// Only three lockup combinations are approved. Clicking through them is
// faster than describing them, and it makes the restriction obvious.
const combos = [
  { key: "havbla-sort", label: "Havblå–sort", bg: "#ffffff", name: "var(--dyb-havbla)", wave: "var(--havbla)" },
  { key: "havbla-hvid", label: "Havblå–hvid", bg: "var(--dyb-havbla)", name: "#ffffff", wave: "var(--havbla)" },
  { key: "hvid-hvid", label: "Hvid–hvid", bg: "var(--havbla)", name: "#ffffff", wave: "#ffffff" },
];

export default function LogoColors({ dark }) {
  const [active, setActive] = useState(combos[0]);

  return (
    <section className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">04.4 / Logofarver</p>
          <h2>Tre kombinationer. Ikke flere.</h2>
          <p>
            Linjenavnet må kun være hvidt eller Dyb Havblå, og bølgen kun hvid
            eller Havblå. Det giver præcis tre lovlige sammensætninger.
          </p>
        </div>

        <div className="logocolors" data-reveal>
          <div className="logocolors__stage" style={{ background: active.bg }}>
            <Wave size={44} color={active.wave} />
            <span style={{ color: active.name }}>Molslinjen</span>
          </div>
          <div className="logocolors__picker">
            {combos.map((c) => (
              <button
                key={c.key}
                className={active.key === c.key ? "is-active" : ""}
                onClick={() => setActive(c)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <p className="cpage__note" data-reveal>
          <span>Bemærk</span> Kombinationer ud over disse tre skal godkendes af
          brand-teamet — de er ikke en fortolkningssag.
        </p>
      </div>
    </section>
  );
}

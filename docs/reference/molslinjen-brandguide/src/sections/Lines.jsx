import { useState } from "react";
import Wave from "../components/Wave";
import { lines, mindsets } from "../data/brand";

export default function Lines({ dark }) {
  const [activeKey, setActiveKey] = useState(lines[0].key);
  const active = lines.find((l) => l.key === activeKey);
  const mindset = mindsets[active.mindset];

  return (
    <section id="linjer" className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">01.3 / Brand hierarki · s. 9</p>
          <h2>Ét brand, mange linjer</h2>
          <p>
            Hver rute har sit eget navnetræk sat sammen med bølgen — samme bølge,
            samme font, samme blå. Det binder porteføljen sammen under
            Molslinjen A/S. Vælg en linje for at se den.
          </p>
        </div>

        <div className="lines">
          <ul className="lines__list">
            {lines.map((l) => (
              <li key={l.key}>
                <button
                  className={`lines__item ${activeKey === l.key ? "is-active" : ""}`}
                  onClick={() => setActiveKey(l.key)}
                >
                  <Wave
                    size={20}
                    color={
                      activeKey === l.key
                        ? "var(--smart-bla)"
                        : "var(--havbla)"
                    }
                  />
                  <span>{l.name}</span>
                  <small>{l.tag}</small>
                </button>
              </li>
            ))}
          </ul>

          <div className={`lines__detail ${active.variant ? "lines__detail--variant" : ""}`}>
            <div className="lines__detail-logo">
              <Wave size={32} color={active.variant ? "var(--smart-bla)" : "#fff"} />
              <span>{active.name.split(" ")[0]}</span>
            </div>
            <p className="lines__detail-route">{active.route}</p>
            <p className="lines__detail-desc">{active.desc}</p>
            <p className="lines__detail-mindset">
              <strong>Mindset: {mindset.label}.</strong> {mindset.desc}
            </p>
          </div>
        </div>

        <p className="lines__rule">
          <strong>Navneregel.</strong> Når det er virksomheden, vi henviser til,
          skrives Molslinjen med små bogstaver — også selvom der ikke står A/S
          bagved. Ruterne, inkl. Molslinjen, skrives med store bogstaver.
        </p>
      </div>
    </section>
  );
}

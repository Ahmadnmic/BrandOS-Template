import { useState } from "react";
import { imageryCategories } from "../data/brand";

export default function Imagery({ dark }) {
  const [activeKey, setActiveKey] = useState(imageryCategories[0].key);
  const active = imageryCategories.find((c) => c.key === activeKey);

  return (
    <section id="billedstil" className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">04.25–29 / Billed- og videostil · s. 66</p>
          <h2>Fem kontekster, fem regelsæt</h2>
          <p>
            Lyse, autentiske billeder med naturligt lys og nordiske toner —
            men reglerne skærper sig efter hvor billedet skal bruges. Vælg en
            kontekst.
          </p>
        </div>

        <div className="imagery" data-reveal>
          <div className="imagery__tabs" role="tablist">
            {imageryCategories.map((c) => (
              <button
                key={c.key}
                role="tab"
                aria-selected={activeKey === c.key}
                className={activeKey === c.key ? "is-active" : ""}
                onClick={() => setActiveKey(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="imagery__body">
            <ul className="imagery__rules">
              {active.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {active.photo ? (
              <figure className="imagery__photo">
                <img src={active.photo.url} alt={active.photo.alt} loading="lazy" />
                <figcaption>Hentet fra molslinjen.dk</figcaption>
              </figure>
            ) : (
              <div className="imagery__photo imagery__photo--missing">
                Intet billede fra denne kategori fundet på forsiden — hent fra
                brand.molslinjen.dk.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

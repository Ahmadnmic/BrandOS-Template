import { useState } from "react";
import Logo from "../components/Logo";
import { logoPlacement } from "../data/brand";

export default function LogoPlacement({ dark }) {
  const [key, setKey] = useState(logoPlacement[0].key);
  const format = logoPlacement.find((f) => f.key === key);
  const isPortrait = format.key === "portrait";

  return (
    <section id="placering" className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">04.10 / Logo placering · s. 36</p>
          <h2>Bredden er en andel af formatet</h2>
          <p>
            Logoets bredde er altid en fast andel af formatets bredde,
            centreret øverst — men det er altid formatets aktuelle safe zones,
            der afgør det endelige mål.
          </p>
        </div>

        <div className="placement" data-reveal>
          <div className={`placement__frame ${isPortrait ? "is-portrait" : "is-landscape"}`}>
            <div className="placement__logo" style={{ width: `${format.widthPct}%` }}>
              <Logo width="100%" color="#fff" className="placement__logo-svg" />
            </div>
          </div>
          <div className="placement__controls">
            {logoPlacement.map((f) => (
              <button
                key={f.key}
                className={key === f.key ? "is-active" : ""}
                onClick={() => setKey(f.key)}
              >
                {f.label} — {f.widthPct}%
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

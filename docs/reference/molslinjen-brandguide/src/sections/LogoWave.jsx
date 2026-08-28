import { useState } from "react";
import Wave from "../components/Wave";

const combos = [
  { key: "havbla-sort", label: "Havblå–sort", bg: "#fff", nameColor: "var(--dyb-havbla)", waveColor: "var(--havbla)" },
  { key: "havbla-hvid", label: "Havblå–hvid", bg: "var(--dyb-havbla)", nameColor: "#fff", waveColor: "var(--havbla)" },
  { key: "hvid-hvid", label: "Hvid–hvid", bg: "var(--havbla)", nameColor: "#fff", waveColor: "#fff" },
];

function LineLogo({ combo, name = "Molslinjen" }) {
  return (
    <div className="line-logo" style={{ background: combo.bg }}>
      <Wave size={30} color={combo.waveColor} />
      <span style={{ color: combo.nameColor }}>{name}</span>
    </div>
  );
}

export default function LogoWave({ dark }) {
  const [combo, setCombo] = useState(combos[0]);
  const [crop, setCrop] = useState(50);

  return (
    <section id="logo" className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">04.9 / Grafisk element · s. 39</p>
          <h2>Bølgen</h2>
          <p>
            Vores logosymbol kalder vi bølgen. Den er inviterende og venlig i sin
            runde form og vinker velkommen ombord — ligesom en hånd. Den er
            samtidig moderne og har tempo på, som en smart vej der forbinder
            landsdele.
          </p>
        </div>

        <div className="wave-lab" data-reveal>
          <div className="wave-lab__stage">
            <div
              className="wave-lab__crop"
              style={{ "--crop": `${crop}%` }}
              aria-hidden="true"
            >
              <Wave size={280} color="var(--smart-bla)" />
            </div>
          </div>
          <div className="wave-lab__controls">
            <label htmlFor="crop">
              Beskær toppen af bølgen — brug maks. 50%, så kompleksiteten i
              grafikken reduceres.
            </label>
            <input
              id="crop"
              type="range"
              min="15"
              max="90"
              value={crop}
              onChange={(e) => setCrop(Number(e.target.value))}
            />
            <p className={`wave-lab__verdict ${crop > 50 ? "is-warn" : "is-ok"}`}>
              {crop > 50
                ? "Don't — for meget af bølgen er synlig, fokus flytter til bunden."
                : "Do — et rent udsnit, der stadig læses som bølgen."}
            </p>
          </div>
        </div>

        <div className="logo-combos" data-reveal>
          <div className="logo-combos__picker">
            <p>Logofarver — alle linje-logoer må sammensættes i disse kombinationer.</p>
            <div className="logo-combos__buttons">
              {combos.map((c) => (
                <button
                  key={c.key}
                  className={combo.key === c.key ? "is-active" : ""}
                  onClick={() => setCombo(c)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <LineLogo combo={combo} />
        </div>

        <div className="logo-rules" data-reveal>
          <div className="logo-rules__do">
            <h4>Do</h4>
            <p>Brug kun brand-farver. Linjenavn må kun være hvid eller Dyb Havblå. Kontrasten skal altid være høj og læsbar.</p>
          </div>
          <div className="logo-rules__dont">
            <h4>Don't</h4>
            <p>Rotér ikke logoet. Beskær ikke logoet, så det ikke er læsbart.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

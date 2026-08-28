import { useState } from "react";
import { colors } from "../data/brand";

function Swatch({ c }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(c.hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      className="swatch"
      onClick={copy}
      style={{ "--swatch-color": c.hex }}
      title={`Kopiér ${c.hex}`}
      data-reveal
    >
      <span className={`swatch__block ${c.on === "dark" ? "swatch__block--bordered" : ""}`}>
        <span className="swatch__copy">{copied ? "Kopieret!" : "Klik for hex"}</span>
      </span>
      <span className="swatch__meta">
        <strong>{c.name}</strong>
        {c.restricted && <em className="swatch__flag">Begrænset brug</em>}
        <span>{c.note}</span>
        <code>
          {c.hex} · RGB {c.rgb} · CMYK {c.cmyk}
          {c.pantone !== "—" ? ` · PMS ${c.pantone}` : ""}
        </code>
      </span>
    </button>
  );
}

export default function Colors({ dark }) {
  return (
    <section id="farver" className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">04.12 / Farver · s. 48</p>
          <h2>Farvesystemet</h2>
          <p>
            Blå er ikke bare en farve for os. Det er stemningen ombord, roen i
            overfarten og udsigten, der møder vores gæster hver eneste dag. Når
            du ser vores blå, ser du havet og himlen forenet.
          </p>
        </div>

        <div className="colors-group">
          <h3 className="colors-group__label">Primære</h3>
          <div className="colors-grid">
            {colors.primary.map((c) => (
              <Swatch key={c.name} c={c} />
            ))}
          </div>
        </div>

        <div className="colors-group">
          <h3 className="colors-group__label">Sekundære</h3>
          <div className="colors-grid">
            {colors.secondary.map((c) => (
              <Swatch key={c.name} c={c} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

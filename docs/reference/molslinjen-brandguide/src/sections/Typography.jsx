import { useState } from "react";
import { typeScale } from "../data/brand";

const HEADLINE_SIZE = 64;

export default function Typography({ dark }) {
  const [sample, setSample] = useState("Kombardo!");

  const subheadSize = Math.round(HEADLINE_SIZE * 0.75);
  const bodySize = 20;
  const bodyLineHeight = Math.round(bodySize * 1.5);

  return (
    <section id="typografi" className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">04.16 / Typografi · s. 55</p>
          <h2>Sat i Korolev</h2>
          <p>
            Med sine rene, markante linjer udstråler Korolev selvsikkerhed,
            retning og energi. Bold Italic til overskrifter tilfører en direkte
            reference til Molslinjens rolle som forbindelsen, der bringer
            mennesker videre. Skriv din egen linje herunder.
          </p>
          <p className="type-note">
            Denne side viser typografien i <strong>Oswald/Barlow</strong> — en
            gratis erstatning, fordi Korolev ikke er en webfont og guiden ikke
            angiver en digital fallback. Hent de rigtige fontfiler via
            brand.molslinjen.dk, før dette bruges i en reel leverance.
          </p>
        </div>

        <input
          className="type-input"
          value={sample}
          maxLength={40}
          onChange={(e) => setSample(e.target.value || " ")}
          aria-label="Skriv en overskrift for at se den i Korolev Bold Italic"
        />
        <h3 className="type-preview">{sample}</h3>
        <p className="type-preview__formula">
          Overskrift: Bold Italic, versaler, kerning 0, linjehøjde = punktstørrelse
        </p>

        <div className="type-formula-demo">
          <div className="type-formula-demo__row">
            <span className="type-formula-demo__tag">Underoverskrift = 75% af overskrift</span>
            <p
              className="type-formula-demo__sub"
              style={{ fontSize: subheadSize }}
            >
              {sample.toLowerCase()}
            </p>
          </div>
          <div className="type-formula-demo__row">
            <span className="type-formula-demo__tag">
              Brødtekst: linjehøjde = skriftstørrelse × 1,5 ({bodySize}px → {bodyLineHeight}px)
            </span>
            <p
              className="type-formula-demo__body"
              style={{ fontSize: bodySize, lineHeight: `${bodyLineHeight}px` }}
            >
              {sample} — korolev bruges som gennemgående typografi i
              Molslinjens kommunikation, fra overskrift til brødtekst.
            </p>
          </div>
        </div>

        <div className="type-scale">
          {typeScale.map((t) => (
            <div className="type-scale__row" key={t.label}>
              <span className="type-scale__label">{t.label}</span>
              <span
                className="type-scale__sample"
                style={{ fontSize: t.size }}
              >
                {t.sample}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

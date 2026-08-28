import { useState } from "react";
import { liveObserved, liveIcons } from "../data/brand";

export default function Components({ dark }) {
  const [height, setHeight] = useState(56);
  const radius = Math.round(height * 0.6);
  const [price, setPrice] = useState(249);
  const [lowPrice, setLowPrice] = useState(false);

  return (
    <section id="komponenter" className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">04.21–22 / Grafik · s. 60</p>
          <h2>Knapper &amp; pris-splash</h2>
          <p>
            Knapper laves som en kasse med afrundede hjørner — hjørneradius
            fastsættes til ca. 60% af kassens højde. Priser sættes i Korolev med
            stor kontrast mellem tekststørrelse og pris.
          </p>
        </div>

        <div className="components-grid">
          <div className="component-card" data-reveal>
            <h4>Knap</h4>
            <div className="btn-demo">
              <button
                className="btn-demo__pill"
                style={{ height, borderRadius: radius }}
              >
                Køb billet
              </button>
            </div>
            <label htmlFor="height">Kassens højde: {height}px</label>
            <input
              id="height"
              type="range"
              min="32"
              max="88"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
            <p className="component-card__formula">
              Hjørneradius = højde × 0,60 = {radius}px
            </p>
          </div>

          <div className="component-card" data-reveal style={{ transitionDelay: "0.04s" }}>
            <h4>Sådan ser den ud i praksis</h4>
            <div className="btn-demo">
              <button
                className="btn-demo__pill btn-demo__pill--live"
                style={{
                  background: liveObserved.ctaMint,
                  color: liveObserved.primaryDark,
                }}
              >
                Køb billet
              </button>
            </div>
            <p className="component-card__formula component-card__formula--warn">
              Hentet direkte fra molslinjen.dk: CTA er {liveObserved.ctaMint},
              tekst er {liveObserved.primaryDark}, hjørnerne er fuldt runde
              uanset knappens højde. {liveObserved.note}
            </p>
          </div>

          <div className="component-card" data-reveal style={{ transitionDelay: "0.08s" }}>
            <h4>Pris-splash</h4>
            <div className="price-demo">
              <div
                className={`price-demo__circle ${lowPrice ? "price-demo__circle--low" : ""}`}
              >
                <span>{lowPrice ? "Book lavpris-billet fra" : "Fra"}</span>
                <strong>{price},-</strong>
              </div>
            </div>
            <label htmlFor="price">Pris: {price},-</label>
            <input
              id="price"
              type="range"
              min="49"
              max="999"
              step="10"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
            <label className="price-demo__toggle">
              <input
                type="checkbox"
                checked={lowPrice}
                onChange={(e) => setLowPrice(e.target.checked)}
              />
              Lavpris-budskab (Lavpris Orange)
            </label>
          </div>

          <div className="component-card component-card--tbd" data-reveal style={{ transitionDelay: "0.16s" }}>
            <h4>Ikonstil</h4>
            <p>
              Guiden markerer selv ikonstilen som <strong>(TBD)</strong> — men i
              praksis kører molslinjen.dk allerede med et fast ikonsæt. Hentet
              direkte fra sitet:
            </p>
            <div className="icon-set">
              {liveIcons.map((icon) => (
                <div className="icon-set__item" key={icon.label}>
                  <img src={icon.url} alt="" loading="lazy" />
                  <span>{icon.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

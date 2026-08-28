import { subBrands } from "../data/brand";

export default function SubBrands({ dark }) {
  return (
    <section id="ombord" className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">01 / Ombord-koncepter · s. 10</p>
          <h2>Café, bar & restaurant</h2>
          <p>
            Hvert ombord-koncept har sin egen brand- og designguide som
            appendiks til denne — de er selvstændige undermærker, ikke bare
            menupunkter.
          </p>
        </div>

        <div className="subbrands-grid">
          {subBrands.map((s, i) => (
            <div
              className="subbrand-card"
              key={s.name}
              data-reveal
              style={{ transitionDelay: `${(i % 3) * 0.06}s` }}
            >
              <h4>{s.name}</h4>
              <span className="subbrand-card__line">{s.line}</span>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

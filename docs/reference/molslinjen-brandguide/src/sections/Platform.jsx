import { platform } from "../data/brand";

export default function Platform({ dark }) {
  return (
    <section id="platform" className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">02.4 / Brand platform · s. 13</p>
          <h2>{platform.position}</h2>
          <p>
            <strong>Ambition:</strong> {platform.ambition} <strong>Målgruppe:</strong>{" "}
            {platform.target}
          </p>
        </div>

        <div className="platform-values">
          {platform.values.map((v, i) => (
            <div
              className="platform-value"
              key={v.name}
              data-reveal
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <span className="platform-value__num">0{i + 1}</span>
              <h3>{v.name}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

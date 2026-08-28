import { graphicDevices, categoryAssets, aiPolicy } from "../data/brand";

export default function GraphicDevices() {
  return (
    <section id="grafik" className="section">
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">04.20 · 04.28 / Øvrige elementer · s. 59</p>
          <h2>Flere byggeklodser</h2>
        </div>

        <div className="devices-grid">
          {graphicDevices.map((d, i) => (
            <div
              className="device-card"
              key={d.name}
              data-reveal
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <h4>{d.name}</h4>
              <p>{d.desc}</p>
            </div>
          ))}
        </div>

        <div className="section-head" data-reveal style={{ marginTop: "3rem" }}>
          <p className="eyebrow">01 / Brand assets · s. 28</p>
          <h3>Det, folk genkender os på</h3>
        </div>
        <ul className="assets-list" data-reveal>
          {categoryAssets.map((a) => (
            <li key={a.name}>
              <strong>{a.name}.</strong> {a.desc}
            </li>
          ))}
        </ul>

        <div className="ai-policy" data-reveal>
          <p className="ai-policy__label">06 / AI som værktøj</p>
          <p>{aiPolicy.summary}</p>
          <p className="ai-policy__disclosure">{aiPolicy.disclosure}</p>
        </div>
      </div>
    </section>
  );
}

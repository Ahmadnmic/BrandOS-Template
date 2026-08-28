import { brandIdea } from "../data/brand";

export default function Idea({ dark }) {
  return (
    <section id="ide" className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">02.2–02.3 / Brand idé · s. 17</p>
          <h2>{brandIdea.idea}</h2>
          <p>{brandIdea.desc}</p>
        </div>

        <div className="idea-promise" data-reveal>
          <p className="idea-promise__label">Kommunikationsløfte</p>
          <p className="idea-promise__text">{brandIdea.promise}</p>
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { voice, voiceDial, voiceExamples } from "../data/brand";

export default function Voice({ dark }) {
  const [mode, setMode] = useState("on");
  const [dial, setDial] = useState(0);

  return (
    <section id="stemme" className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">03 / Tekst & tone-of-voice · s. 23</p>
          <h2>Vores stemme</h2>
          <p>
            Molslinjen taler, som mennesker taler til hinanden. Ligefremt,
            uformelt hverdagssprog. Positive, veloplagte, med glimt i øjet — men
            aldrig platte. Skub kontakten og hør forskellen.
          </p>
        </div>

        <div className="voice-tonedial" data-reveal>
          <p className="voice-tonedial__hint">
            Vores stemme ligger altid til venstre på skalaen. Klik en akse.
          </p>
          <div className="voice-tonedial__axes">
            {voiceDial.map((d, i) => (
              <button
                key={d.left}
                className={`voice-tonedial__axis ${dial === i ? "is-active" : ""}`}
                onClick={() => setDial(i)}
              >
                <span className="voice-tonedial__on">{d.left}</span>
                <span className="voice-tonedial__track" aria-hidden="true">
                  <span className="voice-tonedial__thumb" />
                </span>
                <span className="voice-tonedial__off">{d.right}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="voice-toggle" role="tablist" aria-label="Tone of voice">
          <button
            role="tab"
            aria-selected={mode === "on"}
            className={mode === "on" ? "is-active" : ""}
            onClick={() => setMode("on")}
          >
            Sådan lyder vi
          </button>
          <button
            role="tab"
            aria-selected={mode === "off"}
            className={mode === "off" ? "is-active" : ""}
            onClick={() => setMode("off")}
          >
            Sådan lyder vi ikke
          </button>
        </div>

        <ul className="voice-list">
          {voice.map((v, i) => (
            <li
              key={v.trait}
              className="voice-list__item"
              data-reveal
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <span className="voice-list__trait">{v.trait}</span>
              <p className={`voice-list__quote ${mode === "off" ? "is-off" : ""}`}>
                “{mode === "on" ? v.on : v.off}”
              </p>
            </li>
          ))}
        </ul>

        <div className="voice-examples" data-reveal>
          <p className="voice-examples__label">Eksempler fra guiden, pr. kontekst</p>
          <div className="voice-examples__grid">
            {voiceExamples.map((e) => (
              <div className="voice-example" key={e.context}>
                <span className="voice-example__context">{e.context}</span>
                <strong className="voice-example__headline">{e.headline}</strong>
                <span className="voice-example__copy">{e.copy}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

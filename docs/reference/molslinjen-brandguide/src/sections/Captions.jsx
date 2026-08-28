import { useState } from "react";

// The caption box radius is a ratio, not a fixed value — so a slider shows
// the rule better than a number does.
export default function Captions({ dark }) {
  const [height, setHeight] = useState(160);
  const radius = Math.round(height * 0.15);

  return (
    <section className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">04.18 / Undertekster</p>
          <h2>Radius følger højden</h2>
          <p>
            Undertekster sættes i en boks med afrundede hjørner. Radius er ca.
            15% af boksens højde, så proportionen holder ved enhver størrelse.
          </p>
        </div>

        <div className="captions" data-reveal>
          <div className="captions__stage">
            <div
              className="captions__box"
              style={{ height, borderRadius: radius }}
            >
              Ta' den smarte vej
            </div>
          </div>
          <div className="captions__controls">
            <label htmlFor="cap-h">Boksens højde: {height}px</label>
            <input
              id="cap-h"
              type="range"
              min="80"
              max="240"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
            <p className="captions__formula">
              Hjørneradius = højde × 0,15 = {radius}px
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

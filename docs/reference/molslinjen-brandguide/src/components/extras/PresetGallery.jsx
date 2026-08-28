import { useState } from "react";

// Button-driven preset picker — for "turn this fixed example into a
// clickable gallery" ideas. `render(active)` draws the current preset.
// `keyFn` defaults to `.label`; pass one explicitly when presets don't have
// a unique label field (e.g. route data keyed by `.key`).
export default function PresetGallery({ presets, render, keyFn = (p) => p.label }) {
  const [i, setI] = useState(0);
  return (
    <div className="presetgallery">
      <div className="presetgallery__stage">{render(presets[i])}</div>
      <div className="presetgallery__buttons">
        {presets.map((p, idx) => (
          <button key={keyFn(p)} className={idx === i ? "is-active" : ""} onClick={() => setI(idx)}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

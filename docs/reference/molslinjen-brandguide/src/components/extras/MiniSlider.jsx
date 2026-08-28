import { useState } from "react";

// Generic labeled slider + live-computed formula readout. Reused for every
// "add a slider that shows X = Y × formula" idea.
export default function MiniSlider({ label, min, max, initial, unit = "px", formulaLabel, compute, preview }) {
  const [value, setValue] = useState(initial);
  const computed = compute(value);

  return (
    <div className="minislider">
      {preview && preview(value, computed)}
      <label>
        {label}: {value}{unit}
      </label>
      <input type="range" min={min} max={max} value={value} onChange={(e) => setValue(Number(e.target.value))} />
      <p className="minislider__formula">{formulaLabel} = {computed}{unit}</p>
    </div>
  );
}

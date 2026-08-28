import { useState } from "react";

// Generic checkable list, persisted per-viewer in localStorage. Used for
// every "turn this into a checklist" idea across the raw PDF pages.
export default function Checklist({ storageKey, items }) {
  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggle = (i) => {
    const next = { ...checked, [i]: !checked[i] };
    setChecked(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // private browsing / storage blocked — nothing to persist to
    }
  };

  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="checklist">
      <p className="checklist__progress">{doneCount} / {items.length} afkrydset</p>
      <ul>
        {items.map((item, i) => (
          <li key={item}>
            <label>
              <input type="checkbox" checked={!!checked[i]} onChange={() => toggle(i)} />
              <span className={checked[i] ? "is-done" : ""}>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useState } from "react";

// Before/after style toggle between two labeled states.
export default function ToggleCompare({ left, right }) {
  const [showRight, setShowRight] = useState(false);
  const active = showRight ? right : left;

  return (
    <div className="togglecompare">
      <div className="togglecompare__stage">{active.render()}</div>
      <div className="togglecompare__switch">
        <button className={!showRight ? "is-active" : ""} onClick={() => setShowRight(false)}>
          {left.label}
        </button>
        <button className={showRight ? "is-active" : ""} onClick={() => setShowRight(true)}>
          {right.label}
        </button>
      </div>
    </div>
  );
}

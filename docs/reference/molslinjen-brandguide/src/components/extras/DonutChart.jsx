import { useMemo, useState } from "react";

// Hoverable donut chart for percentage-split ideas.
export default function DonutChart({ segments }) {
  const [active, setActive] = useState(null);
  const r = 60;
  const circumference = 2 * Math.PI * r;

  const arcs = useMemo(() => {
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    let offset = 0;
    return segments.map((seg) => {
      const dash = (seg.value / total) * circumference;
      const arc = { ...seg, dash, offset };
      offset += dash;
      return arc;
    });
  }, [segments, circumference]);

  return (
    <div className="donutchart">
      <svg viewBox="0 0 160 160" width="160" height="160">
        <g transform="translate(80,80) rotate(-90)">
          {arcs.map((seg, i) => (
            <circle
              key={seg.label}
              r={r}
              cx="0"
              cy="0"
              fill="none"
              stroke={seg.color}
              strokeWidth={active === i ? 26 : 20}
              strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
              strokeDashoffset={-seg.offset}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              style={{ transition: "stroke-width 0.2s var(--ease-spatial)", cursor: "pointer" }}
            />
          ))}
        </g>
      </svg>
      <ul className="donutchart__legend">
        {segments.map((seg, i) => (
          <li
            key={seg.label}
            className={active === i ? "is-active" : ""}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <span style={{ background: seg.color }} /> {seg.label} — {seg.value}%
          </li>
        ))}
      </ul>
    </div>
  );
}

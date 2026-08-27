import { useState } from "react";
import { ChapterHead, TokenTable, CodeBlock } from "../components/guide/Guide";

export function meta() {
  return [{ title: "Motion · Odense Basket BrandOS" }];
}

const EASINGS = [
  {
    name: "ease-out",
    value: "cubic-bezier(0.16, 1, 0.3, 1)",
    use: "Alt der kommer IND: paneler, kort, indhold",
  },
  {
    name: "ease-in",
    value: "cubic-bezier(0.55, 0, 0.85, 0.36)",
    use: "Alt der forlader fladen",
  },
  {
    name: "ease-in-out",
    value: "cubic-bezier(0.65, 0, 0.35, 1)",
    use: "Flytninger på fladen: sidebar, tabs",
  },
  {
    name: "ease-emphasized",
    value: "cubic-bezier(0.2, 0, 0, 1)",
    use: "Hero-øjeblikke og temaskift",
  },
];

const DURATIONS = [
  { name: "duration-instant", value: "80ms", use: "Hover og fokus" },
  { name: "duration-fast", value: "140ms", use: "Knapper, chips, små skift" },
  { name: "duration-base", value: "220ms", use: "Paneler, kort, tabs" },
  { name: "duration-slow", value: "360ms", use: "Sideskift og store flader" },
];

function EasingDemo(props: { name: string; value: string }) {
  const [run, setRun] = useState(0);
  return (
    <button
      type="button"
      onClick={() => setRun((r) => r + 1)}
      className="w-full rounded-md border border-line bg-panel p-4 text-left hover:border-accent"
      title="Klik for at afspille"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-wider">
          --sys-{props.name}
        </span>
        <span className="label text-[8.5px]">AFSPIL ▸</span>
      </div>
      <div className="relative h-2 rounded-full bg-line/40">
        <span
          key={run}
          className="motion-ball absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-signal"
          style={{
            animationTimingFunction: props.value,
            animationPlayState: run > 0 ? "running" : "paused",
          }}
        />
      </div>
      <div className="mt-3 font-mono text-[9.5px] text-dim">{props.value}</div>
    </button>
  );
}

export default function Motion() {
  return (
    <div className="mx-auto max-w-4xl">
      <ChapterHead
        num="08"
        title="Motion"
        steps="PRINCIP → REGLER → EKSEMPLER → MISBRUG → DOWNLOADS"
      />
      <p className="mb-8 max-w-xl text-sm text-dim">
        Afledt af sitets egen adfærd: Odense Basket bevæger sig hurtigt og
        lander hårdt. Ingen bounce, ingen langsom elegance. Ind med ease-out, ud
        med ease-in, flyt med ease-in-out. Al bevægelse respekterer
        prefers-reduced-motion.
      </p>

      <div className="label mb-3 text-[9px]">
        EASINGS · KLIK FOR AT AFSPILLE
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {EASINGS.map((e) => (
          <EasingDemo key={e.name} name={e.name} value={e.value} />
        ))}
      </div>

      <div className="mt-8">
        <TokenTable
          rows={[
            ...DURATIONS.map((d) => ({
              token: "--sys-" + d.name,
              role: d.use,
              light: d.value,
              dark: d.value,
            })),
            ...EASINGS.map((e) => ({
              token: "--sys-" + e.name,
              role: e.use,
              light: "kurve",
              dark: "kurve",
            })),
            {
              token: "--sys-distance-sm",
              role: "Mikro-flyt (hover, fokus)",
              light: "6px",
              dark: "6px",
            },
            {
              token: "--sys-distance-md",
              role: "Indslag (kort, paneler)",
              light: "14px",
              dark: "14px",
            },
          ]}
        />
      </div>

      <div className="mt-8">
        <CodeBlock
          title="KODE · INDSLAG"
          code={`.enter {
  animation: enter var(--sys-duration-base) var(--sys-ease-out) both;
}
@keyframes enter {
  from { opacity: 0; transform: translateY(var(--sys-distance-md)); }
}
@media (prefers-reduced-motion: reduce) {
  .enter { animation: none; }
}`}
        />
      </div>
    </div>
  );
}

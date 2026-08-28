import { useState } from "react";
import {
  ChapterHead,
  Rules,
  TokenTable,
  CodeBlock,
} from "../components/guide/Guide";
import { useTx } from "../lens";

const EASINGS = [
  {
    name: "ease-out",
    value: "cubic-bezier(0.16, 1, 0.3, 1)",
    use: {
      da: "Alt der kommer IND: paneler, kort, indhold",
      en: "Everything coming IN: panels, cards, content",
    },
  },
  {
    name: "ease-in",
    value: "cubic-bezier(0.55, 0, 0.85, 0.36)",
    use: {
      da: "Alt der forlader fladen",
      en: "Everything leaving the surface",
    },
  },
  {
    name: "ease-in-out",
    value: "cubic-bezier(0.65, 0, 0.35, 1)",
    use: {
      da: "Flytninger på fladen: paneler, tabs",
      en: "Moves on the surface: panels, tabs",
    },
  },
  {
    name: "ease-emphasized",
    value: "cubic-bezier(0.2, 0, 0, 1)",
    use: {
      da: "Hero-øjeblikke og temaskift",
      en: "Hero moments and theme changes",
    },
  },
];

const DURATIONS = [
  {
    name: "duration-instant",
    value: "80ms",
    use: { da: "Hover og fokus", en: "Hover and focus" },
  },
  {
    name: "duration-fast",
    value: "140ms",
    use: {
      da: "Knapper, chips, små skift",
      en: "Buttons, chips, small changes",
    },
  },
  {
    name: "duration-base",
    value: "220ms",
    use: { da: "Paneler, kort, tabs", en: "Panels, cards, tabs" },
  },
  {
    name: "duration-slow",
    value: "360ms",
    use: {
      da: "Sideskift og store flader",
      en: "Page turns and large surfaces",
    },
  },
];

function EasingDemo(props: { name: string; value: string }) {
  const tx = useTx();
  const [run, setRun] = useState(0);
  return (
    <button
      type="button"
      onClick={() => setRun((r) => r + 1)}
      className="group grid w-full grid-cols-[10rem_1fr_auto] items-center gap-6 border-t border-line py-4 text-left"
      title={tx({ da: "Klik for at afspille", en: "Click to play" })}
    >
      <span className="font-mono text-[11px] tracking-wider group-hover:text-accent">
        {props.name}
      </span>
      <span className="relative block h-px bg-line">
        <span
          key={run}
          className="motion-ball absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-signal"
          style={{
            animationTimingFunction: props.value,
            animationPlayState: run > 0 ? "running" : "paused",
          }}
        />
      </span>
      <span className="font-mono text-[9.5px] text-dim">{props.value}</span>
    </button>
  );
}

export function Motion() {
  const tx = useTx();
  return (
    <>
      <ChapterHead num="08" title="Motion" />
      <p className="mb-8 max-w-xl text-sm text-dim">
        {tx({
          da: "Odense Basket bevæger sig hurtigt og lander hårdt. Ingen bounce, ingen langsom elegance.",
          en: "Odense Basket moves fast and lands hard. No bounce, no slow elegance.",
        })}
      </p>

      <div className="label mb-1 text-[9px]">
        EASINGS · {tx({ da: "KLIK FOR AT AFSPILLE", en: "CLICK TO PLAY" })}
      </div>
      <div className="border-b border-line">
        {EASINGS.map((e) => (
          <EasingDemo key={e.name} name={e.name} value={e.value} />
        ))}
      </div>

      <div className="mt-12">
        <Rules
          dos={[
            tx({
              da: "Ind med ease-out, ud med ease-in, flyt med ease-in-out.",
              en: "In with ease-out, out with ease-in, move with ease-in-out.",
            }),
            tx({
              da: "Én bevægelse ad gangen pr. flade.",
              en: "One movement at a time per surface.",
            }),
            tx({
              da: "Respektér prefers-reduced-motion i alt.",
              en: "Respect prefers-reduced-motion in everything.",
            }),
          ]}
          donts={[
            tx({
              da: "Bounce, elastik og overshoot.",
              en: "Bounce, elastic and overshoot.",
            }),
            tx({
              da: "Bevægelse som dekoration.",
              en: "Motion as decoration.",
            }),
            tx({
              da: "Varigheder over 360 ms.",
              en: "Durations above 360 ms.",
            }),
          ]}
        />
      </div>

      <div className="mt-8">
        <TokenTable
          rows={[
            ...DURATIONS.map((d) => ({
              token: "--sys-" + d.name,
              role: tx(d.use),
              light: d.value,
              dark: d.value,
            })),
            ...EASINGS.map((e) => ({
              token: "--sys-" + e.name,
              role: tx(e.use),
              light: tx({ da: "kurve", en: "curve" }),
              dark: tx({ da: "kurve", en: "curve" }),
            })),
            {
              token: "--sys-distance-sm",
              role: tx({
                da: "Mikro-flyt (hover, fokus)",
                en: "Micro-move (hover, focus)",
              }),
              light: "6px",
              dark: "6px",
            },
            {
              token: "--sys-distance-md",
              role: tx({
                da: "Indslag (kort, paneler)",
                en: "Entrances (cards, panels)",
              }),
              light: "14px",
              dark: "14px",
            },
          ]}
        />
      </div>

      <div className="mt-8">
        <CodeBlock
          title={tx({ da: "KODE · INDSLAG", en: "CODE · ENTRANCE" })}
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
    </>
  );
}

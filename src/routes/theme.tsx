import { ChapterHead } from "../components/guide/Guide";

export function meta() {
  return [{ title: "Theme QA · Odense Basket BrandOS" }];
}

const SWATCH_VARS = [
  "surface",
  "panel",
  "ink",
  "dim",
  "line",
  "action",
  "on-action",
  "accent",
  "signal",
  "on-signal",
];

export default function ThemeQA() {
  return (
    <div className="mx-auto max-w-4xl">
      <ChapterHead
        num="QA"
        title="Theme"
        steps="ALLE TOKENS · ALLE TILSTANDE"
      />
      <p className="mb-6 max-w-xl text-sm text-dim">
        QA-fladen efter hver generate-theme-kørsel: alle sys-roller malet live
        fra CSS-variablerne. Skift Lys/Mørk i headeren og se hele fladen følge
        med.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5">
        {SWATCH_VARS.map((name) => (
          <div key={name}>
            <div
              className="h-16 border border-line"
              style={{
                background: `var(--sys-${name})`,
                marginLeft: -1,
                marginTop: -1,
              }}
            />
            <div className="py-2 pr-2 font-mono text-[9.5px] text-dim">
              --sys-{name}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <button
          type="button"
          className="btn-demo rounded-md bg-action px-4.5 py-2.5 text-on-action"
        >
          PRIMÆR
        </button>
        <button
          type="button"
          className="btn-demo rounded-md border border-line px-4.5 py-2.5 text-accent"
        >
          SEKUNDÆR
        </button>
        <button
          type="button"
          className="btn-demo rounded-md bg-signal px-4.5 py-2.5 text-on-signal"
        >
          SIGNAL
        </button>
        <span className="label">LABEL</span>
        <span className="display text-xl font-bold">DISPLAY AA 09</span>
      </div>
    </div>
  );
}

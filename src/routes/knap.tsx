import { useState } from "react";
import { ChapterHead, CodeBlock, TokenTable } from "../components/guide/Guide";
import { useLens } from "../lens";

export function meta() {
  return [{ title: "Knap · Komponenter · Odense Basket BrandOS" }];
}

const TABS = ["ANVENDELSE", "SPECS", "KODE", "TILGÆNGELIGHED"] as const;

const BUTTON_CSS = `.btn-primary {
  background: var(--sys-action);
  color: var(--sys-on-action);
  border-radius: var(--sys-radius-md);
}`;

export default function Knap() {
  const { lens } = useLens();
  const [tab, setTab] = useState<(typeof TABS)[number]>(
    lens === "dev" ? "KODE" : "ANVENDELSE",
  );

  return (
    <div className="mx-auto max-w-4xl">
      <ChapterHead num="11" title="Knap" steps="KOMPONENTER" />
      <div className="mb-5 flex gap-1 border-b border-line" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={
              "border-b-2 px-3.5 py-2 font-mono text-[10px] tracking-wider " +
              (tab === t
                ? "border-signal text-accent"
                : "border-transparent text-dim hover:text-ink")
            }
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "ANVENDELSE" && (
        <p className="max-w-xl text-sm text-dim">
          Én primær knap pr. flade. Tekst i versaler, maks. to ord. Signal
          bruges kun til live-situationer, aldrig til navigation.
        </p>
      )}

      {(tab === "ANVENDELSE" || tab === "KODE" || tab === "SPECS") && (
        <div className="mt-5 flex min-h-36 flex-wrap items-center justify-center gap-3 border border-line p-6">
          <button
            type="button"
            className="btn-demo rounded-md bg-action px-4.5 py-2.5 text-on-action"
          >
            KØB BILLET
          </button>
          <button
            type="button"
            className="btn-demo rounded-md border border-line px-4.5 py-2.5 text-accent"
          >
            SE KAMPPROGRAM
          </button>
          <button
            type="button"
            className="btn-demo rounded-md bg-signal px-4.5 py-2.5 text-on-signal"
          >
            LIVE NU
          </button>
        </div>
      )}

      {(tab === "KODE" || tab === "SPECS") && (
        <div className="mt-5 space-y-5">
          <CodeBlock title="KODE · KNAP · PRIMÆR" code={BUTTON_CSS} />
          <TokenTable
            rows={[
              {
                token: "--sys-action",
                role: "Primær handling",
                light: "#0A1526",
                dark: "#BFD9F2",
              },
              {
                token: "--sys-on-action",
                role: "Tekst på handling",
                light: "#F4F7FB",
                dark: "#0A1526",
              },
              {
                token: "--sys-radius-md",
                role: "Hjørner",
                light: "6px",
                dark: "6px",
              },
            ]}
          />
        </div>
      )}

      {tab === "TILGÆNGELIGHED" && (
        <div className="max-w-xl space-y-3 text-sm text-dim">
          <p>
            Tastatur: Tab fokuserer, Enter/Space aktiverer. Fokusring følger
            --sys-accent.
          </p>
          <p>
            Minimum målflade 44×44 px. Kontrast på alle tilstande er AA-checket
            i validate.
          </p>
          <p>
            Reduceret bevægelse: hover-overgange slås fra ved
            prefers-reduced-motion.
          </p>
        </div>
      )}
    </div>
  );
}

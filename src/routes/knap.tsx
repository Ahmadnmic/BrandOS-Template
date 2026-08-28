import { useEffect, useState } from "react";
import { brand } from "../../brand/brand.config";
import {
  ChapterHead,
  CodeBlock,
  Rules,
  TokenTable,
  DownloadChip,
} from "../components/guide/Guide";
import { Button } from "../components/ui/Button";
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
  const [tab, setTab] = useState<(typeof TABS)[number]>("ANVENDELSE");

  // The lens re-weights the page: Dev opens on code, Design on specs,
  // Generel and HR on usage.
  useEffect(() => {
    if (lens === "dev") setTab("KODE");
    else if (lens === "design") setTab("SPECS");
    else setTab("ANVENDELSE");
  }, [lens]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:px-10">
      <a
        href="/#komponenter"
        className="label mb-6 inline-block text-[9px] hover:text-accent"
      >
        ← KOMPONENTER
      </a>
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
        <Rules
          dos={[
            "Én primær knap pr. flade.",
            "Tekst i versaler, maks to ord.",
            "Signal kun til live-øjeblikke.",
          ]}
          donts={[
            "To primære side om side.",
            "Signal til navigation eller dekoration.",
            "Egen styling uden for de tre varianter.",
          ]}
        />
      )}

      {(tab === "ANVENDELSE" || tab === "KODE" || tab === "SPECS") && (
        <div className="mt-5 flex min-h-36 flex-wrap items-center justify-center gap-3 border border-line p-6">
          <Button>KØB BILLET</Button>
          <Button variant="sekundaer">SE KAMPPROGRAM</Button>
          <Button variant="signal">LIVE NU</Button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <CodeBlock title="KODE · KNAP · PRIMÆR" code={BUTTON_CSS} />
        <DownloadChip label="KNAP.TSX" href="/exports/knap.tsx" />
        <DownloadChip label="TOKENS.CSS" href="/exports/tokens.css" />
        <DownloadChip label="FIGMA-BIBLIOTEK" href={brand.figma?.fileUrl} />
      </div>

      {(tab === "KODE" || tab === "SPECS") && (
        <div className="mt-6">
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
            Minimum målflade 44×44 px. Kontrast i alle tilstande er WCAG AA.
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

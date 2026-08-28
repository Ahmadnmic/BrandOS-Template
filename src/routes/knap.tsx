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
import { useLens, useTx } from "../lens";

export function meta() {
  return [{ title: "Knap · Komponenter · " + brand.name + " BrandOS" }];
}

const TABS = [
  { id: "ANVENDELSE", da: "ANVENDELSE", en: "USAGE" },
  { id: "SPECS", da: "SPECS", en: "SPECS" },
  { id: "KODE", da: "KODE", en: "CODE" },
  { id: "TILGÆNGELIGHED", da: "TILGÆNGELIGHED", en: "ACCESSIBILITY" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const BUTTON_CSS = `.btn-primary {
  background: var(--sys-action);
  color: var(--sys-on-action);
  border-radius: var(--sys-radius-md);
}`;

export default function Knap() {
  const { lens } = useLens();
  const tx = useTx();
  const [tab, setTab] = useState<TabId>("ANVENDELSE");

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
        ← {tx({ da: "KOMPONENTER", en: "COMPONENTS" })}
      </a>
      <ChapterHead
        num="11"
        title={tx({ da: "Knap", en: "Button" })}
        steps={tx({ da: "KOMPONENTER", en: "COMPONENTS" })}
      />
      <div className="mb-5 flex gap-1 border-b border-line" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={
              "border-b-2 px-3.5 py-2 font-mono text-[10px] tracking-wider " +
              (tab === t.id
                ? "border-signal text-accent"
                : "border-transparent text-dim hover:text-ink")
            }
          >
            {tx(t)}
          </button>
        ))}
      </div>

      {tab === "ANVENDELSE" && (
        <Rules
          dos={[
            tx({ da: "Én primær knap pr. flade.", en: "One primary button per surface." }),
            tx({ da: "Tekst i versaler, maks to ord.", en: "Text in uppercase, two words at most." }),
            tx({ da: "Signal kun til live-øjeblikke.", en: "Signal only for live moments." }),
          ]}
          donts={[
            tx({ da: "To primære side om side.", en: "Two primaries side by side." }),
            tx({ da: "Signal til navigation eller dekoration.", en: "Signal for navigation or decoration." }),
            tx({ da: "Egen styling uden for de tre varianter.", en: "Custom styling outside the three variants." }),
          ]}
        />
      )}

      {(tab === "ANVENDELSE" || tab === "KODE" || tab === "SPECS") && (
        <div className="mt-5 flex min-h-36 flex-wrap items-center justify-center gap-3 border border-line p-6">
          <Button>{tx({ da: "KØB BILLET", en: "BUY TICKETS" })}</Button>
          <Button variant="sekundaer">
            {tx({ da: "SE KAMPPROGRAM", en: "SEE SCHEDULE" })}
          </Button>
          <Button variant="signal">{tx({ da: "LIVE NU", en: "LIVE NOW" })}</Button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <CodeBlock
          title={tx({ da: "KODE · KNAP · PRIMÆR", en: "CODE · BUTTON · PRIMARY" })}
          code={BUTTON_CSS}
        />
        <DownloadChip label="KNAP.TSX" href="/exports/knap.tsx" />
        <DownloadChip label="TOKENS.CSS" href="/exports/tokens.css" />
        <DownloadChip
          label={tx({ da: "FIGMA-BIBLIOTEK", en: "FIGMA LIBRARY" })}
          href={brand.figma?.fileUrl}
        />
      </div>

      {(tab === "KODE" || tab === "SPECS") && (
        <div className="mt-6">
          <TokenTable
            rows={[
              {
                token: "--sys-action",
                role: tx({ da: "Primær handling", en: "Primary action" }),
                light: "#0A1526",
                dark: "#BFD9F2",
              },
              {
                token: "--sys-on-action",
                role: tx({ da: "Tekst på handling", en: "Text on action" }),
                light: "#F4F7FB",
                dark: "#0A1526",
              },
              {
                token: "--sys-radius-md",
                role: tx({ da: "Hjørner", en: "Corners" }),
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
            {tx({
              da: "Tastatur: Tab fokuserer, Enter/Space aktiverer. Fokusring følger --sys-accent.",
              en: "Keyboard: Tab focuses, Enter/Space activates. The focus ring follows --sys-accent.",
            })}
          </p>
          <p>
            {tx({
              da: "Minimum målflade 44×44 px. Kontrast i alle tilstande er WCAG AA.",
              en: "Minimum target size 44×44 px. Contrast in every state is WCAG AA.",
            })}
          </p>
          <p>
            {tx({
              da: "Reduceret bevægelse: hover-overgange slås fra ved prefers-reduced-motion.",
              en: "Reduced motion: hover transitions are disabled under prefers-reduced-motion.",
            })}
          </p>
        </div>
      )}
    </div>
  );
}

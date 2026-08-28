import {
  ChapterHead,
  Palette,
  RatioBar,
  Rules,
  CopyValue,
  DownloadChip,
  TokenTable,
} from "../components/guide/Guide";
import { useTx } from "../lens";

export function Farver() {
  const tx = useTx();
  return (
    <>
      <ChapterHead num="03" title={tx({ da: "Farver", en: "Colors" })} />
      <p className="mb-10 max-w-xl text-sm leading-relaxed text-dim">
        {tx({
          da: "Dybhav bærer identiteten. Is skaber kontrast og luft. Signal markerer handling.",
          en: "Dybhav carries the identity. Is creates contrast and air. Signal marks action.",
        })}
      </p>
      <Palette
        colors={[
          {
            name: "Dybhav",
            hex: "#0A1526",
            onHex: "#BFD9F2",
            cmyk: "96 79 43 60",
            pms: "296 C",
          },
          {
            name: "Is",
            hex: "#BFD9F2",
            onHex: "#0A1526",
            cmyk: "24 7 0 0",
            pms: "545 C",
          },
          { name: "Kridt", hex: "#F4F7FB", onHex: "#0A1526", cmyk: "3 1 0 0" },
          {
            name: "Signal",
            hex: "#E8B84B",
            onHex: "#0A1526",
            cmyk: "8 28 80 0",
            pms: "142 C",
          },
        ]}
      />
      <div className="mt-12">
        <RatioBar
          parts={[
            { name: "Dybhav", pct: 58, bg: "#0A1526", fg: "#6C82A3" },
            { name: "Is", pct: 22, bg: "#BFD9F2", fg: "#0A1526" },
            { name: "Kridt", pct: 14, bg: "#F4F7FB", fg: "#0A1526" },
            { name: "Signal", pct: 6, bg: "#E8B84B", fg: "#0A1526" },
          ]}
        />
      </div>
      <div className="mt-12">
        <Rules
          dos={[
            tx({
              da: "Dybhav som primær flade, Is som kontrast og luft.",
              en: "Dybhav as the primary surface, Is as contrast and air.",
            }),
            tx({
              da: "Signal til handling og live-øjeblikke.",
              en: "Signal for action and live moments.",
            }),
            tx({
              da: "Tekstfarve fra token-parret, aldrig på øjemål.",
              en: "Text color from the token pair, never by eye.",
            }),
          ]}
          donts={[
            tx({
              da: "Signal som baggrund, dekoration eller store flader.",
              en: "Signal as background, decoration or large surfaces.",
            }),
            tx({
              da: "Sort, grå eller andre mørke erstatninger for Dybhav.",
              en: "Black, grey or other dark substitutes for Dybhav.",
            }),
            tx({
              da: "Nye nuancer uden for paletten.",
              en: "New shades outside the palette.",
            }),
          ]}
        />
      </div>
      <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <CopyValue
          value="#0A1526 #BFD9F2 #F4F7FB #E8B84B"
          label={tx({
            da: "KOPIÉR HELE PALETTEN",
            en: "COPY THE WHOLE PALETTE",
          })}
        />
        <DownloadChip label="TOKENS.CSS" href="/exports/tokens.css" />
        <DownloadChip label="TOKENS.JSON" href="/exports/tokens.json" />
      </div>
      <div className="mt-8">
        <TokenTable
          rows={[
            {
              token: "--sys-surface",
              role: tx({ da: "Flade", en: "Surface" }),
              light: "#F4F7FB",
              dark: "#0A1526",
            },
            {
              token: "--sys-ink",
              role: tx({ da: "Tekst", en: "Text" }),
              light: "#0A1526",
              dark: "#F2F6FC",
            },
            {
              token: "--sys-action",
              role: tx({ da: "Primær handling", en: "Primary action" }),
              light: "#0A1526",
              dark: "#BFD9F2",
            },
            {
              token: "--sys-signal",
              role: "Signal",
              light: "#8A6407",
              dark: "#E8B84B",
            },
          ]}
        />
      </div>
    </>
  );
}

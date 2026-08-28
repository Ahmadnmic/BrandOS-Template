import {
  ChapterHead,
  Palette,
  RatioBar,
  Rules,
  CopyValue,
  DownloadChip,
  TokenTable,
} from "../components/guide/Guide";

export function Farver() {
  return (
    <>
      <ChapterHead num="03" title="Farver" />
      <p className="mb-10 max-w-xl text-sm leading-relaxed text-dim">
        Dybhav bærer identiteten. Is skaber kontrast og luft. Signal markerer
        handling.
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
            "Dybhav som primær flade, Is som kontrast og luft.",
            "Signal til handling og live-øjeblikke.",
            "Tekstfarve fra token-parret, aldrig på øjemål.",
          ]}
          donts={[
            "Signal som baggrund, dekoration eller store flader.",
            "Sort, grå eller andre mørke erstatninger for Dybhav.",
            "Nye nuancer uden for paletten.",
          ]}
        />
      </div>
      <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <CopyValue
          value="#0A1526 #BFD9F2 #F4F7FB #E8B84B"
          label="KOPIÉR HELE PALETTEN"
        />
        <DownloadChip label="TOKENS.CSS" href="/exports/tokens.css" />
        <DownloadChip label="TOKENS.JSON" href="/exports/tokens.json" />
      </div>
      <div className="mt-8">
        <TokenTable
          rows={[
            {
              token: "--sys-surface",
              role: "Flade",
              light: "#F4F7FB",
              dark: "#0A1526",
            },
            {
              token: "--sys-ink",
              role: "Tekst",
              light: "#0A1526",
              dark: "#F2F6FC",
            },
            {
              token: "--sys-action",
              role: "Primær handling",
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

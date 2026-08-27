import { ChapterHead, ColorSwatch, RatioBar, CopyValue } from "../components/guide/Guide";

export function meta() {
  return [{ title: "Farver · Odense Basket BrandOS" }];
}

export default function Farver() {
  return (
    <div className="mx-auto max-w-4xl">
      <ChapterHead num="03" title="Farver" steps="PRINCIP → REGLER → EKSEMPLER → MISBRUG → DOWNLOADS" />
      <p className="mb-8 max-w-xl text-sm text-dim">
        Dybhav bærer identiteten. Is skaber kontrast og luft. Signal bruges kun til handling, aldrig
        til dekoration. Alle værdier kan kopieres med ét klik.
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <ColorSwatch name="Dybhav" hex="#0A1526" cmyk="96 79 43 60" pms="296 C" />
        <ColorSwatch name="Is" hex="#BFD9F2" cmyk="24 7 0 0" pms="545 C" />
        <ColorSwatch name="Kridt" hex="#F4F7FB" cmyk="3 1 0 0" />
        <ColorSwatch name="Signal" hex="#E8B84B" cmyk="8 28 80 0" pms="142 C" />
      </div>
      <div className="mt-8">
        <RatioBar
          parts={[
            { name: "Dybhav", pct: 58, bg: "#0A1526", fg: "#6C82A3" },
            { name: "Is", pct: 22, bg: "#BFD9F2", fg: "#0A1526" },
            { name: "Kridt", pct: 14, bg: "#F4F7FB", fg: "#0A1526" },
            { name: "Signal", pct: 6, bg: "#E8B84B", fg: "#0A1526" },
          ]}
        />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded-sm border border-line px-2.5 py-1">
          <CopyValue value="#0A1526 #BFD9F2 #F4F7FB #E8B84B" label="⧉ KOPIÉR HELE PALETTEN" />
        </span>
      </div>
    </div>
  );
}

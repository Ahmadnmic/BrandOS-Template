import {
  ChapterHead,
  Palette,
  RatioBar,
  CopyValue,
} from "../components/guide/Guide";

export function meta() {
  return [{ title: "Farver · Odense Basket BrandOS" }];
}

export default function Farver() {
  return (
    <div className="mx-auto max-w-3xl">
      <ChapterHead
        num="03"
        title="Farver"
        steps="PRINCIP → REGLER → EKSEMPLER → MISBRUG → DOWNLOADS"
      />
      <p className="mb-10 max-w-xl text-sm leading-relaxed text-dim">
        Dybhav bærer identiteten. Is skaber kontrast og luft. Signal bruges kun
        til handling, aldrig til dekoration. Alle værdier kan kopieres med ét
        klik.
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
      <div className="mt-8 border-t border-line pt-4">
        <CopyValue
          value="#0A1526 #BFD9F2 #F4F7FB #E8B84B"
          label="KOPIÉR HELE PALETTEN"
        />
      </div>
    </div>
  );
}

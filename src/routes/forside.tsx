import type { ReactNode } from "react";
import { brand } from "../../brand/brand.config";
import { GuidePage } from "../components/guide/GuidePage";
import tokens from "../../brand/tokens.json";
import { useTx } from "../lens";
import { Cover, Indhold } from "../sections/Hero";
import { Farver, FarverRegler } from "../sections/Farver";
import { Typografi, TypografiRegler } from "../sections/Typografi";
import { Billedstil, BilledstilRegler } from "../sections/Billedstil";
import { Motion, MotionRegler } from "../sections/Motion";
import {
  Komponenter,
  KomponentBadge,
  KomponentFelt,
  KomponentBanner,
} from "../sections/Komponenter";
import { Tokens } from "../sections/Tokens";

export function meta() {
  return [{ title: brand.name + " · BrandOS" }];
}

interface PageDef {
  chapter: string;
  anchor?: string;
  label: { da: string; en: string };
  wide?: boolean;
  render: () => ReactNode;
}

// One substantial block per viewport page. The first page of a chapter
// carries its anchor (the slug from brand.config), so the top nav and the
// index land on the chapter opening; the pager walks every page.
const PAGES: PageDef[] = [
  {
    chapter: "00",
    anchor: "top",
    label: { da: "Forside", en: "Cover" },
    render: () => <Cover />,
  },
  {
    chapter: "00",
    label: { da: "Indhold", en: "Contents" },
    render: () => <Indhold />,
  },
  {
    chapter: "03",
    anchor: "farver",
    label: { da: "Farver", en: "Colors" },
    render: () => <Farver />,
  },
  {
    chapter: "03",
    label: { da: "Farveregler", en: "Color rules" },
    render: () => <FarverRegler />,
  },
  {
    chapter: "04",
    anchor: "typografi",
    label: { da: "Typografi", en: "Typography" },
    wide: true,
    render: () => <Typografi />,
  },
  {
    chapter: "04",
    label: { da: "Typografiregler", en: "Type rules" },
    wide: true,
    render: () => <TypografiRegler />,
  },
  {
    chapter: "07",
    anchor: "billedstil",
    label: { da: "Billedstil", en: "Imagery" },
    render: () => <Billedstil />,
  },
  {
    chapter: "07",
    label: { da: "Billedregler", en: "Image rules" },
    render: () => <BilledstilRegler />,
  },
  {
    chapter: "08",
    anchor: "motion",
    label: { da: "Motion", en: "Motion" },
    wide: true,
    render: () => <Motion />,
  },
  {
    chapter: "08",
    label: { da: "Motionregler", en: "Motion rules" },
    wide: true,
    render: () => <MotionRegler />,
  },
  {
    chapter: "11",
    anchor: "komponenter",
    label: { da: "Knap", en: "Button" },
    render: () => <Komponenter />,
  },
  {
    chapter: "11",
    label: { da: "Badge", en: "Badge" },
    render: () => <KomponentBadge />,
  },
  {
    chapter: "11",
    label: { da: "Felt", en: "Field" },
    render: () => <KomponentFelt />,
  },
  {
    chapter: "11",
    label: { da: "Banner", en: "Banner" },
    render: () => <KomponentBanner />,
  },
  {
    chapter: "12",
    anchor: "tokens",
    label: { da: "Tokens", en: "Tokens" },
    wide: true,
    render: () => <Tokens />,
  },
];

// The page rhythm is a composition token: alternating brands get a clean
// panel break between pages, continuous brands one unbroken surface.
const RHYTHM =
  tokens.sys?.composition?.rhythm?.$value === "continuous"
    ? "continuous"
    : "alternating";

export default function Forside() {
  const tx = useTx();
  return (
    <div>
      {PAGES.map((p, i) => (
        <GuidePage
          key={i}
          id={p.anchor ?? "side-" + (i + 1)}
          page={i + 1}
          label={tx(p.label)}
          chapter={p.chapter}
          tone={
            RHYTHM === "alternating" && (i + 1) % 2 === 0 ? "panel" : "surface"
          }
          wide={p.wide}
        >
          {p.render()}
        </GuidePage>
      ))}
    </div>
  );
}

import type { ReactNode } from "react";
import { brand } from "../../brand/brand.config";
import { GuidePage } from "../components/guide/GuidePage";
import { Hero } from "../sections/Hero";
import { Farver } from "../sections/Farver";
import { Typografi } from "../sections/Typografi";
import { Motion } from "../sections/Motion";
import { Komponenter } from "../sections/Komponenter";
import { Tokens } from "../sections/Tokens";

export function meta() {
  return [{ title: brand.name + " · BrandOS" }];
}

// The chapter sections of the document, keyed by slug. A chapter renders
// when brand.config marks it built and a section exists for it; page
// numbers and order come from the chapter map alone.
const SECTIONS: Record<string, { render: () => ReactNode; wide?: boolean }> = {
  farver: { render: () => <Farver /> },
  typografi: { render: () => <Typografi />, wide: true },
  motion: { render: () => <Motion />, wide: true },
  komponenter: { render: () => <Komponenter /> },
  tokens: { render: () => <Tokens />, wide: true },
};

export default function Forside() {
  const chapters = brand.chapters.filter(
    (c) => c.built && !c.gated && c.slug !== "" && SECTIONS[c.slug],
  );

  return (
    <div>
      <GuidePage id="top" page={1} label="Forside" chapter="00">
        <Hero />
      </GuidePage>
      {chapters.map((c, i) => {
        const n = i + 2;
        const section = SECTIONS[c.slug];
        return (
          <GuidePage
            key={c.num}
            id={c.slug}
            page={n}
            label={c.title}
            chapter={c.num}
            tone={n % 2 === 0 ? "panel" : "surface"}
            wide={section.wide}
          >
            {section.render()}
          </GuidePage>
        );
      })}
    </div>
  );
}

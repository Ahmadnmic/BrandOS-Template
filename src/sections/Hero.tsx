import { brand } from "../../brand/brand.config";
import { IndexRow, ImageFrame } from "../components/guide/Guide";
import { Mark } from "./Mark";
import { useTx } from "../lens";
import tokens from "../../brand/tokens.json";

// The front page composition follows sys.composition.coverStyle, read from
// the brand's own material (the CVI document's cover above all): mark-led
// (the seed), image-led (a captured cover photo above the name) or type-led
// (the name alone). Layout is a build outcome, not a template constant.
const COVER_STYLE: string =
  tokens.sys?.composition?.coverStyle?.$value ?? "mark-led";
// A brand build points this at a captured image under public/; image-led
// falls back to mark-led without one.
const COVER_IMAGE: string | undefined = undefined;

export function Cover() {
  const tx = useTx();
  if (COVER_STYLE === "image-led" && COVER_IMAGE) {
    return (
      <>
        <ImageFrame src={COVER_IMAGE} motif={brand.name} ratio="21/9" />
        <h1 className="display mt-8 text-5xl font-bold leading-[1.02] md:text-7xl">
          {brand.name}
        </h1>
        <p className="label mt-6 text-[12px] text-accent">
          {brand.tagline.toUpperCase()}
        </p>
        <p className="label mt-10 text-[10px]">
          {tx({ da: "DESIGNGUIDE", en: "DESIGN GUIDE" })} · VER. {brand.version}{" "}
          · {tx({ da: "OPDATERET", en: "UPDATED" })} {brand.updated}
        </p>
      </>
    );
  }
  return (
    <>
      {COVER_STYLE !== "type-led" && <Mark size={72} />}
      <h1 className="display mt-10 text-6xl font-bold leading-[1.02] md:text-8xl">
        {brand.name}
      </h1>
      <p className="label mt-8 text-[12px] text-accent">
        {brand.tagline.toUpperCase()}
      </p>
      <p className="label mt-16 text-[10px]">
        {tx({ da: "DESIGNGUIDE", en: "DESIGN GUIDE" })} · VER. {brand.version} ·{" "}
        {tx({ da: "OPDATERET", en: "UPDATED" })} {brand.updated}
      </p>
    </>
  );
}

export function Indhold() {
  const tx = useTx();
  return (
    <>
      <p className="label mb-8 text-[10px] text-accent">
        {tx({ da: "INDHOLD", en: "CONTENTS" })}
      </p>
      <p className="mb-10 max-w-lg text-sm leading-relaxed text-dim">
        {tx({
          da: `Sådan ser ${brand.name} ud, og sådan bruges identiteten: farver, typografi, komponenter og kode fra én kilde.`,
          en: `This is how ${brand.name} looks, and how the identity is used: colors, typography, components and code from one source.`,
        })}
      </p>
      <nav
        aria-label={tx({ da: "Indhold", en: "Contents" })}
        className="border-b border-line"
      >
        {brand.chapters
          .filter((c) => (c.built && c.slug !== "") || c.gated)
          .map((c) => {
            if (c.gated)
              return (
                <IndexRow
                  key={c.num}
                  num={c.num}
                  title={c.title}
                  meta={tx({ da: "LÅST", en: "LOCKED" })}
                  muted
                />
              );
            return (
              <a
                key={c.num}
                href={"#" + c.slug}
                className="block hover:text-accent"
              >
                <IndexRow num={c.num} title={c.title} />
              </a>
            );
          })}
      </nav>
    </>
  );
}

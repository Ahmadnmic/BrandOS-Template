import { brand } from "../../brand/brand.config";
import { IndexRow } from "../components/guide/Guide";
import { Mark } from "./Mark";
import { useTx } from "../lens";

// The front page: the mark and the words that carry the brand, nothing else.
export function Cover() {
  const tx = useTx();
  return (
    <>
      <Mark size={72} />
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

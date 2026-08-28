import { brand } from "../../brand/brand.config";
import { IndexRow } from "../components/guide/Guide";
import { useTx } from "../lens";

export function Hero() {
  const tx = useTx();
  return (
    <>
      <p className="label mb-6 text-[10px]">
        {tx({ da: "DESIGNGUIDE", en: "DESIGN GUIDE" })} · VER. {brand.version} ·{" "}
        {tx({ da: "OPDATERET", en: "UPDATED" })} {brand.updated}
      </p>
      <h1 className="display text-6xl font-bold leading-[1.05] md:text-7xl">
        {brand.name}
        <br />
        Brand OS
      </h1>
      <p className="label mt-6 text-[11px]">{brand.tagline.toUpperCase()}</p>

      <p className="mt-12 max-w-lg text-sm leading-relaxed text-dim">
        {tx({
          da: `Sådan ser ${brand.name} ud, og sådan bruges identiteten: farver, typografi, komponenter og kode fra én kilde.`,
          en: `This is how ${brand.name} looks, and how the identity is used: colors, typography, components and code from one source.`,
        })}
      </p>

      <nav
        aria-label={tx({ da: "Indhold", en: "Contents" })}
        className="mt-14 border-b border-line"
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

import { brand } from "../../brand/brand.config";
import { IndexRow } from "../components/guide/Guide";

export function Hero() {
  return (
    <>
      <p className="label mb-6 text-[10px]">
        DESIGNGUIDE · VER. {brand.version} · OPDATERET {brand.updated}
      </p>
      <h1 className="display text-6xl font-bold leading-[1.05] md:text-7xl">
        {brand.name}
        <br />
        Brand OS
      </h1>
      <p className="label mt-6 text-[11px]">{brand.tagline.toUpperCase()}</p>

      <p className="mt-12 max-w-lg text-sm leading-relaxed text-dim">
        Sådan ser {brand.name} ud, og sådan bruges identiteten: farver,
        typografi, komponenter og kode fra én kilde.
      </p>

      <nav aria-label="Indhold" className="mt-14 border-b border-line">
        {brand.chapters
          .filter((c) => c.slug !== "" && (c.built || c.gated))
          .map((c) => {
            if (c.gated)
              return (
                <IndexRow
                  key={c.num}
                  num={c.num}
                  title={c.title}
                  meta="LÅST"
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

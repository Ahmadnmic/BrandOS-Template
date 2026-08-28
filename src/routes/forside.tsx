import { Link } from "react-router";
import { brand } from "../../brand/brand.config";
import { IndexRow } from "../components/guide/Guide";

export function meta() {
  return [{ title: brand.name + " · BrandOS" }];
}

export default function Forside() {
  return (
    <div className="mx-auto max-w-3xl py-10">
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
        Ét levende system for {brand.name}: identitet, sprog, komponenter og
        tokens i én kilde. Forstået af mennesker, brugbart for AI.
      </p>

      <nav aria-label="Indhold" className="mt-14 border-b border-line">
        {brand.chapters
          .filter((c) => c.slug !== "")
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
            if (!c.built)
              return (
                <IndexRow
                  key={c.num}
                  num={c.num}
                  title={c.title}
                  meta="FASE 2"
                  muted
                />
              );
            return (
              <Link
                key={c.num}
                to={"/" + c.slug}
                className="block hover:text-accent"
              >
                <IndexRow num={c.num} title={c.title} />
              </Link>
            );
          })}
      </nav>
    </div>
  );
}

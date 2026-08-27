import { Link } from "react-router";
import { brand } from "../../brand/brand.config";

export function meta() {
  return [{ title: brand.name + " · BrandOS" }];
}

export default function Forside() {
  const built = brand.chapters.filter((c) => c.built && c.slug !== "");
  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="display text-5xl font-bold leading-tight md:text-6xl">
        {brand.name}
        <br />
        Brand OS
      </h1>
      <p className="label mt-4 text-[11px]">{brand.tagline.toUpperCase()}</p>
      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {built.map((c) => (
          <Link
            key={c.num}
            to={"/" + c.slug}
            className="rounded-md border border-line bg-panel p-4 transition-colors hover:border-accent"
          >
            <div className="label text-[9px]">{c.num}</div>
            <div className="display mt-1.5 text-sm font-bold">{c.title}</div>
          </Link>
        ))}
      </div>
      <p className="mt-10 max-w-lg text-sm text-dim">
        Ét levende system for {brand.name}: identitet, sprog, komponenter og tokens i én kilde.
        Kapitler uden link er under opbygning (Fase 2).
      </p>
    </div>
  );
}

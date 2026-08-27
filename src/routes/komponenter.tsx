import { Link } from "react-router";
import { ChapterHead } from "../components/guide/Guide";

export function meta() {
  return [{ title: "Komponenter · Odense Basket BrandOS" }];
}

const COMPONENTS = [
  {
    slug: "knap",
    title: "Knap",
    desc: "Primær, sekundær og signal. Én primær pr. flade.",
  },
];

export default function Komponenter() {
  return (
    <div className="mx-auto max-w-4xl">
      <ChapterHead
        num="11"
        title="Komponenter"
        steps="ANVENDELSE · SPECS · KODE · TILGÆNGELIGHED"
      />
      <p className="mb-6 max-w-xl text-sm text-dim">
        Hver komponent følger samme kontrakt med fire faner. Flere komponenter
        lander i Fase 2 (Kort, Navigation, Formular, Badge, Tabel).
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {COMPONENTS.map((c) => (
          <Link
            key={c.slug}
            to={"/komponenter/" + c.slug}
            className="rounded-md border border-line bg-panel p-4 transition-colors hover:border-accent"
          >
            <div className="display text-sm font-bold">{c.title}</div>
            <div className="mt-1.5 text-xs text-dim">{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

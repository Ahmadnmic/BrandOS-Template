import { Link } from "react-router";
import { ChapterHead, IndexRow } from "../components/guide/Guide";

export function meta() {
  return [{ title: "Komponenter · Odense Basket BrandOS" }];
}

const COMPONENTS = [{ slug: "knap", title: "Knap", meta: "4 FANER" }];

const PLANNED = ["Kort", "Navigation", "Formular", "Badge", "Tabel"];

export default function Komponenter() {
  return (
    <div className="mx-auto max-w-3xl">
      <ChapterHead
        num="11"
        title="Komponenter"
        steps="ANVENDELSE · SPECS · KODE · TILGÆNGELIGHED"
      />
      <p className="mb-10 max-w-xl text-sm leading-relaxed text-dim">
        Hver komponent følger samme kontrakt med fire faner. Specs taler i
        tokens, aldrig rå værdier.
      </p>
      <div className="border-b border-line">
        {COMPONENTS.map((c) => (
          <Link
            key={c.slug}
            to={"/komponenter/" + c.slug}
            className="block hover:text-accent"
          >
            <IndexRow title={c.title} />
          </Link>
        ))}
        {PLANNED.map((t) => (
          <IndexRow key={t} title={t} meta="FASE 2" muted />
        ))}
      </div>
    </div>
  );
}

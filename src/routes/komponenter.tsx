import { Link } from "react-router";
import {
  ChapterHead,
  CodeBlock,
  DownloadChip,
  IndexRow,
} from "../components/guide/Guide";
import { Button } from "../components/ui/Button";

export function meta() {
  return [{ title: "Komponenter · Odense Basket BrandOS" }];
}

const BUTTON_CSS = `.btn-primary {
  background: var(--sys-action);
  color: var(--sys-on-action);
  border-radius: var(--sys-radius-md);
}`;

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

      <section className="border-t border-line pt-4">
        <div className="flex items-baseline justify-between">
          <Link
            to="/komponenter/knap"
            className="display text-xl font-bold hover:text-accent"
          >
            Knap →
          </Link>
        </div>
        <div className="mt-4 flex min-h-28 flex-wrap items-center justify-center gap-3 border border-line p-5">
          <Button>KØB BILLET</Button>
          <Button variant="sekundaer">SE KAMPPROGRAM</Button>
          <Button variant="signal">LIVE NU</Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CodeBlock title="KODE · KNAP · PRIMÆR" code={BUTTON_CSS} />
          <DownloadChip label="KNAP.TSX" href="/exports/knap.tsx" />
          <DownloadChip label="FIGMA-KIT" />
        </div>
      </section>

      <div className="mt-10 border-b border-line">
        {PLANNED.map((t) => (
          <IndexRow key={t} title={t} meta="FASE 2" muted />
        ))}
      </div>
    </div>
  );
}

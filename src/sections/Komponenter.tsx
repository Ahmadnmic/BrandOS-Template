import { Link } from "react-router";
import { brand } from "../../brand/brand.config";
import {
  ChapterHead,
  CodeBlock,
  DownloadChip,
} from "../components/guide/Guide";
import { Button } from "../components/ui/Button";

const BUTTON_CSS = `.btn-primary {
  background: var(--sys-action);
  color: var(--sys-on-action);
  border-radius: var(--sys-radius-md);
}`;

export function Komponenter() {
  return (
    <>
      <ChapterHead num="11" title="Komponenter" />
      <p className="mb-10 max-w-xl text-sm leading-relaxed text-dim">
        Komponenter bruges som de står her. Farve, form og typografi kommer fra
        tokens, aldrig fra lokale værdier.
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
          <DownloadChip label="FIGMA-BIBLIOTEK" href={brand.figma?.fileUrl} />
        </div>
      </section>
    </>
  );
}

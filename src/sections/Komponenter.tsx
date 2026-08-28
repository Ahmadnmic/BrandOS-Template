import { Link } from "react-router";
import { brand } from "../../brand/brand.config";
import {
  ChapterHead,
  CodeBlock,
  DownloadChip,
} from "../components/guide/Guide";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Felt } from "../components/ui/Felt";
import { Banner } from "../components/ui/Banner";
import { useTx } from "../lens";

const BUTTON_CSS = `.btn-primary {
  background: var(--sys-action);
  color: var(--sys-on-action);
  border-radius: var(--sys-radius-md);
}`;

const BADGE_CSS = `.badge-signal {
  background: var(--sys-signal);
  color: var(--sys-on-signal);
  border-radius: var(--sys-radius-sm);
}`;

const FELT_CSS = `.felt input {
  border-bottom: 1px solid var(--sys-line);
}
.felt input:focus {
  border-color: var(--sys-accent);
}`;

const BANNER_CSS = `.banner {
  border-top: 1px solid var(--sys-line);
  border-bottom: 1px solid var(--sys-line);
}`;

export function Komponenter() {
  const tx = useTx();
  return (
    <>
      <ChapterHead
        num="11"
        title={tx({ da: "Komponenter", en: "Components" })}
      />
      <p className="mb-10 max-w-xl text-sm leading-relaxed text-dim">
        {tx({
          da: "Komponenter bruges som de står her. Farve, form og typografi kommer fra tokens, aldrig fra lokale værdier.",
          en: "Components are used as they stand here. Color, form and typography come from tokens, never from local values.",
        })}
      </p>

      <section className="border-t border-line pt-4">
        <div className="flex items-baseline justify-between">
          <Link
            to="/komponenter/knap"
            className="display text-xl font-bold hover:text-accent"
          >
            {tx({ da: "Knap", en: "Button" })} →
          </Link>
        </div>
        <div className="mt-4 flex min-h-28 flex-wrap items-center justify-center gap-3 border border-line p-5">
          <Button>{tx({ da: "KØB BILLET", en: "BUY TICKETS" })}</Button>
          <Button variant="sekundaer">
            {tx({ da: "SE KAMPPROGRAM", en: "SEE SCHEDULE" })}
          </Button>
          <Button variant="signal">{tx({ da: "LIVE NU", en: "LIVE NOW" })}</Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CodeBlock
            title={tx({
              da: "KODE · KNAP · PRIMÆR",
              en: "CODE · BUTTON · PRIMARY",
            })}
            code={BUTTON_CSS}
          />
          <DownloadChip label="KNAP.TSX" href="/exports/knap.tsx" />
          <DownloadChip
            label={tx({ da: "FIGMA-BIBLIOTEK", en: "FIGMA LIBRARY" })}
            href={brand.figma?.fileUrl}
          />
        </div>
      </section>

      <section className="mt-10 border-t border-line pt-4">
        <h3 className="display text-xl font-bold">Badge</h3>
        <div className="mt-4 flex min-h-20 flex-wrap items-center justify-center gap-3 border border-line p-5">
          <Badge variant="signal">LIVE</Badge>
          <Badge>{tx({ da: "UDSOLGT", en: "SOLD OUT" })}</Badge>
          <Badge>{tx({ da: "HJEMMEKAMP", en: "HOME GAME" })}</Badge>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CodeBlock
            title={tx({ da: "KODE · BADGE", en: "CODE · BADGE" })}
            code={BADGE_CSS}
          />
          <DownloadChip label="BADGE.TSX" href="/exports/badge.tsx" />
        </div>
      </section>

      <section className="mt-10 border-t border-line pt-4">
        <h3 className="display text-xl font-bold">
          {tx({ da: "Felt", en: "Field" })}
        </h3>
        <div className="mt-4 grid gap-6 border border-line p-5 md:grid-cols-2">
          <Felt
            label={tx({ da: "DIN E-MAIL", en: "YOUR EMAIL" })}
            placeholder={tx({ da: "navn@klub.dk", en: "name@club.dk" })}
            type="email"
          />
          <Felt
            label={tx({ da: "SØG I KAMPE", en: "SEARCH GAMES" })}
            placeholder={tx({
              da: "Modstander, dato …",
              en: "Opponent, date …",
            })}
            type="search"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CodeBlock
            title={tx({ da: "KODE · FELT", en: "CODE · FIELD" })}
            code={FELT_CSS}
          />
          <DownloadChip label="FELT.TSX" href="/exports/felt.tsx" />
        </div>
      </section>

      <section className="mt-10 border-t border-line pt-4">
        <h3 className="display text-xl font-bold">Banner</h3>
        <div className="mt-4 border border-line p-5">
          <Banner
            label={tx({ da: "KAMPDAG", en: "GAME DAY" })}
            action={
              <Button variant="signal">{tx({ da: "LIVE NU", en: "LIVE NOW" })}</Button>
            }
          >
            {tx({
              da: "Odense Basket møder Bakken Bears i aften kl. 19.00.",
              en: "Odense Basket meets Bakken Bears tonight at 19.00.",
            })}
          </Banner>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CodeBlock
            title={tx({ da: "KODE · BANNER", en: "CODE · BANNER" })}
            code={BANNER_CSS}
          />
          <DownloadChip label="BANNER.TSX" href="/exports/banner.tsx" />
        </div>
      </section>
    </>
  );
}

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
import { Vaelger } from "../components/ui/Vaelger";
import { Dialog } from "../components/ui/Dialog";
import { useState } from "react";
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

const VAELGER_CSS = `.vaelger ul {
  animation: pop var(--sys-duration-base) var(--sys-ease-out) both;
  border: 1px solid var(--sys-line);
  background: var(--sys-panel);
}`;

const DIALOG_CSS = `.dialog-backdrop {
  animation: fade var(--sys-duration-fast) var(--sys-ease-out) both;
}
.dialog {
  animation: pop var(--sys-duration-base) var(--sys-ease-out) both;
  border: 1px solid var(--sys-line);
  background: var(--sys-panel);
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
    </>
  );
}

export function KomponentBadge() {
  const tx = useTx();
  return (
    <>
      <section className="border-t border-line pt-4">
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
    </>
  );
}

export function KomponentFelt() {
  const tx = useTx();
  return (
    <>
      <section className="border-t border-line pt-4">
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
    </>
  );
}

export function KomponentBanner() {
  const tx = useTx();
  return (
    <>
      <section className="border-t border-line pt-4">
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

export function KomponentVaelger() {
  const tx = useTx();
  return (
    <>
      <section className="border-t border-line pt-4">
        <h3 className="display text-xl font-bold">
          {tx({ da: "Vælger", en: "Selector" })}
        </h3>
        <p className="mt-2 max-w-xl text-sm text-dim">
          {tx({
            da: "Åbner med brandets indslag, lukker på Esc og klik udenfor. Prøv den.",
            en: "Opens with the brand's entrance motion, closes on Esc and outside click. Try it.",
          })}
        </p>
        <div className="mt-4 flex min-h-36 flex-wrap items-start justify-center gap-6 border border-line p-6">
          <Vaelger
            label={tx({ da: "SÆSON", en: "SEASON" })}
            options={["2026/27", "2025/26", "2024/25"]}
          />
          <Vaelger
            label={tx({ da: "HJEMMEBANE", en: "HOME COURT" })}
            options={[
              tx({ da: "Odense Idrætshal", en: "Odense Arena" }),
              tx({ da: "Udebane", en: "Away" }),
            ]}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CodeBlock
            title={tx({ da: "KODE · VÆLGER", en: "CODE · SELECTOR" })}
            code={VAELGER_CSS}
          />
          <DownloadChip label="VAELGER.TSX" href="/exports/vaelger.tsx" />
        </div>
      </section>
    </>
  );
}

export function KomponentDialog() {
  const tx = useTx();
  const [open, setOpen] = useState(false);
  return (
    <>
      <section className="border-t border-line pt-4">
        <h3 className="display text-xl font-bold">Dialog</h3>
        <p className="mt-2 max-w-xl text-sm text-dim">
          {tx({
            da: "Bagtæppe, indslag, Esc og kryds lukker. Vinduet handler aldrig; det viser bevægelsen.",
            en: "Backdrop, entrance, Esc and the cross close it. The window never acts; it shows the motion.",
          })}
        </p>
        <div className="mt-4 flex min-h-24 items-center justify-center border border-line p-6">
          <Button onClick={() => setOpen(true)}>
            {tx({ da: "KØB SÆSONKORT", en: "BUY SEASON PASS" })}
          </Button>
        </div>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title={tx({ da: "SÆSONKORT", en: "SEASON PASS" })}
          closeLabel={tx({ da: "Luk", en: "Close" })}
        >
          <p className="text-dim">
            {tx({
              da: "Et demo-vindue: indhold, bevægelse og lukning er ægte, men intet sendes nogen steder hen.",
              en: "A demo window: content, motion and closing are real, but nothing is sent anywhere.",
            })}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="sekundaer" onClick={() => setOpen(false)}>
              {tx({ da: "FORTRYD", en: "CANCEL" })}
            </Button>
            <Button onClick={() => setOpen(false)}>
              {tx({ da: "BEKRÆFT", en: "CONFIRM" })}
            </Button>
          </div>
        </Dialog>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CodeBlock
            title={tx({ da: "KODE · DIALOG", en: "CODE · DIALOG" })}
            code={DIALOG_CSS}
          />
          <DownloadChip label="DIALOG.TSX" href="/exports/dialog.tsx" />
        </div>
      </section>
    </>
  );
}

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { brand } from "../../../brand/brand.config";
import { useLens, useTx, type Lens, type Theme, type Lang } from "../../lens";

const LENSES: { id: Lens; da: string; en: string }[] = [
  { id: "generel", da: "GENEREL", en: "GENERAL" },
  { id: "design", da: "DESIGN", en: "DESIGN" },
  { id: "dev", da: "DEV", en: "DEV" },
  { id: "hr", da: "HR", en: "HR" },
];

const THEMES: { id: Theme; da: string; en: string }[] = [
  { id: "default", da: "STANDARD", en: "STANDARD" },
  { id: "light", da: "LYS", en: "LIGHT" },
  { id: "dark", da: "MØRK", en: "DARK" },
];

function SettingRow(props: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="label mb-1.5 text-[9px]">{props.title}</div>
      <div className="flex gap-1">{props.children}</div>
    </div>
  );
}

function SettingButton(props: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={
        "flex-1 rounded-sm border px-1 py-1 font-mono text-[9px] tracking-wider transition-colors " +
        (props.active
          ? "border-accent bg-accent font-bold text-surface"
          : "border-line text-dim hover:text-ink")
      }
    >
      {props.children}
    </button>
  );
}

// Page control docked bottom-right: flips through the guide one page at a
// time and names the chapter you're in, reading straight off the rendered
// [data-page] sections so it stays correct when pages are added or
// reordered. Also hosts the settings gear (lens, theme, language).
export function PageNav() {
  const location = useLocation();
  const { lens, setLens, theme, setTheme, lang, setLang } = useLens();
  const tx = useTx();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [meta, setMeta] = useState({ label: "", chapter: "" });
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setSettingsOpen(false);
    const targets = Array.from(document.querySelectorAll("[data-page]"));
    setTotal(targets.length);
    if (targets.length < 2) return;

    // Seed the status synchronously from whichever page fills most of the
    // viewport right now; the observer only handles changes from scrolling.
    let seedEl: HTMLElement | null = null;
    let seedPx = -1;
    targets.forEach((t) => {
      const r = (t as HTMLElement).getBoundingClientRect();
      const px = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      if (px > seedPx) {
        seedPx = px;
        seedEl = t as HTMLElement;
      }
    });
    if (seedEl) {
      const el: HTMLElement = seedEl;
      setPage(Number(el.dataset.page));
      setMeta({
        label: el.dataset.label ?? "",
        chapter: el.dataset.chapter ?? "",
      });
    }

    const visible = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          visible.set(
            Number((e.target as HTMLElement).dataset.page),
            e.intersectionRect.height,
          );
        });
        let best: number | null = null;
        visible.forEach((px, num) => {
          if (px > 0 && (best === null || px > (visible.get(best) ?? 0)))
            best = num;
        });
        if (best !== null) {
          setPage(best);
          const el = targets.find(
            (t) => Number((t as HTMLElement).dataset.page) === best,
          ) as HTMLElement | undefined;
          if (el)
            setMeta({
              label: el.dataset.label ?? "",
              chapter: el.dataset.chapter ?? "",
            });
        }
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);

  function goTo(n: number): void {
    const clamped = Math.max(1, Math.min(total, n));
    const el = document.querySelector<HTMLElement>(`[data-page="${clamped}"]`);
    if (!el) return;
    // Update the status immediately; the observer confirms it as the
    // scroll settles.
    setPage(clamped);
    setMeta({
      label: el.dataset.label ?? "",
      chapter: el.dataset.chapter ?? "",
    });
    el.scrollIntoView({ behavior: "smooth" });
  }

  const paged = total > 1;

  return (
    <div className="fixed bottom-4 right-4 z-20">
      {settingsOpen && (
        <div
          className="absolute bottom-full right-0 mb-2 w-48 space-y-3 rounded-md border border-line bg-panel p-3.5 shadow-xl"
          role="dialog"
          aria-label={tx({ da: "Indstillinger", en: "Settings" })}
        >
          <SettingRow title={tx({ da: "LINSE", en: "LENS" })}>
            {LENSES.map((l) => (
              <SettingButton
                key={l.id}
                active={lens === l.id}
                onClick={() => setLens(l.id)}
              >
                {tx(l)}
              </SettingButton>
            ))}
          </SettingRow>
          <SettingRow title={tx({ da: "TEMA", en: "THEME" })}>
            {THEMES.map((t) => (
              <SettingButton
                key={t.id}
                active={theme === t.id}
                onClick={() => setTheme(t.id)}
              >
                {tx(t)}
              </SettingButton>
            ))}
          </SettingRow>
          <SettingRow title={tx({ da: "SPROG", en: "LANGUAGE" })}>
            {brand.langs.map((l) => (
              <SettingButton
                key={l}
                active={lang === l}
                onClick={() => setLang(l as Lang)}
              >
                {l.toUpperCase()}
              </SettingButton>
            ))}
          </SettingRow>
        </div>
      )}
      <div
        role="navigation"
        aria-label={tx({ da: "Sidenavigation", en: "Page navigation" })}
        className="flex items-center gap-2 rounded-md border border-line bg-panel/95 px-2 py-1.5 backdrop-blur"
      >
        {paged && (
          <>
            <button
              type="button"
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
              aria-label={tx({ da: "Forrige side", en: "Previous page" })}
              className="px-1.5 font-mono text-sm text-dim hover:text-ink disabled:opacity-30"
            >
              ‹
            </button>
            <div className="min-w-24 text-center leading-tight">
              <div className="font-mono text-[9.5px] tracking-wider">
                {meta.label.toUpperCase()}
              </div>
              <div className="label text-[8px]">
                {meta.chapter} · {page} / {total}
              </div>
            </div>
            <button
              type="button"
              onClick={() => goTo(page + 1)}
              disabled={page === total}
              aria-label={tx({ da: "Næste side", en: "Next page" })}
              className="px-1.5 font-mono text-sm text-dim hover:text-ink disabled:opacity-30"
            >
              ›
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => setSettingsOpen((o) => !o)}
          aria-label={tx({ da: "Indstillinger", en: "Settings" })}
          aria-expanded={settingsOpen}
          className="flex size-6 items-center justify-center rounded-sm border border-line text-accent hover:bg-line/30"
        >
          ⚙
        </button>
      </div>
    </div>
  );
}

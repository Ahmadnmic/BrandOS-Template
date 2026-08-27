import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { brand } from "../../../brand/brand.config";
import { useLens, type Lens, type Theme } from "../../lens";

const LENSES: { id: Lens; label: string }[] = [
  { id: "generel", label: "GENEREL" },
  { id: "design", label: "DESIGN" },
  { id: "dev", label: "DEV" },
  { id: "hr", label: "HR" },
];

const THEMES: { id: Theme; label: string }[] = [
  { id: "light", label: "LYS" },
  { id: "dark", label: "MØRK" },
  { id: "auto", label: "AUTO" },
];

function BallMark() {
  return (
    <span
      aria-hidden
      className="inline-block size-5 rounded-full border-[1.5px] border-accent relative shrink-0
      before:absolute before:inset-0 before:rounded-full before:border-l-[1.5px] before:border-accent before:scale-x-50
      after:absolute after:inset-0 after:rounded-full after:border-t-[1.5px] after:border-accent after:scale-y-50"
    />
  );
}

function SettingRow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="label mb-1.5 text-[9px]">{title}</div>
      <div className="flex gap-1">{children}</div>
    </div>
  );
}

function SettingButton(props: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={
        "flex-1 rounded-sm border px-1 py-1 font-mono text-[9px] tracking-wider transition-colors " +
        (props.active
          ? "border-accent bg-accent text-surface font-bold"
          : "border-line text-dim hover:text-ink")
      }
    >
      {props.children}
    </button>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { lens, setLens, theme, setTheme } = useLens();
  const location = useLocation();
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === "\\" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCollapsed((c) => !c);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setSettingsOpen(false);
  }, [location.pathname]);

  const visibleChapters = brand.chapters.filter((c) => !c.gated);
  const gatedChapters = brand.chapters.filter((c) => c.gated);

  return (
    <div className="flex min-h-screen">
      {collapsed ? (
        <aside className="flex w-11 shrink-0 flex-col items-center gap-4 border-r border-line bg-panel py-4">
          <BallMark />
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Åbn panel"
            className="mt-auto font-mono text-dim hover:text-ink"
          >
            ⟩⟩
          </button>
        </aside>
      ) : (
        <aside className="relative flex w-56 shrink-0 flex-col border-r border-line bg-panel">
          <div className="flex items-center gap-2.5 border-b border-line px-4 pb-4 pt-5">
            <BallMark />
            <span className="label text-[10px] text-accent">{brand.name}</span>
          </div>
          <nav className="flex-1 overflow-y-auto py-3" aria-label="Kapitler">
            {visibleChapters.map((c) => {
              const href = "/" + c.slug;
              const active = location.pathname === href || (c.slug === "" && location.pathname === "/");
              return (
                <Link
                  key={c.num}
                  to={href}
                  className={
                    "flex items-center gap-2.5 px-4 py-1.5 font-mono text-[10.5px] tracking-wider " +
                    (active ? "text-accent" : c.built ? "text-dim hover:text-ink" : "text-dim/50 pointer-events-none")
                  }
                >
                  <span
                    className={
                      "rounded-sm px-1 text-[9.5px] " + (active ? "bg-accent text-surface" : "bg-line/40")
                    }
                  >
                    {c.num}
                  </span>
                  {c.title.toUpperCase()}
                </Link>
              );
            })}
            {gatedChapters.map((c) => (
              <span
                key={c.num}
                className="flex items-center gap-2.5 px-4 py-1.5 font-mono text-[10.5px] tracking-wider text-dim/40"
              >
                <span className="rounded-sm bg-line/30 px-1 text-[9.5px]">{c.num}</span>
                {c.title.toUpperCase()} · LÅST
              </span>
            ))}
          </nav>

          {settingsOpen && (
            <div
              ref={settingsRef}
              className="absolute bottom-14 left-3 z-10 w-48 space-y-3 rounded-md border border-line bg-panel p-3.5 shadow-xl"
              role="dialog"
              aria-label="Indstillinger"
            >
              <SettingRow title="LINSE">
                {LENSES.map((l) => (
                  <SettingButton key={l.id} active={lens === l.id} onClick={() => setLens(l.id)}>
                    {l.label}
                  </SettingButton>
                ))}
              </SettingRow>
              <SettingRow title="TEMA">
                {THEMES.map((t) => (
                  <SettingButton key={t.id} active={theme === t.id} onClick={() => setTheme(t.id)}>
                    {t.label}
                  </SettingButton>
                ))}
              </SettingRow>
              <SettingRow title="SPROG">
                {brand.langs.map((l) => (
                  <SettingButton key={l} active onClick={() => undefined}>
                    {l.toUpperCase()}
                  </SettingButton>
                ))}
              </SettingRow>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="label text-[9px] hover:text-ink"
            >
              ⟨⟨ SKJUL · ⌘\
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen((o) => !o)}
              aria-label="Indstillinger"
              aria-expanded={settingsOpen}
              className="flex size-6 items-center justify-center rounded-sm border border-line text-accent hover:bg-line/30"
            >
              ⚙
            </button>
          </div>
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-3 md:px-10">
          <span className="label rounded-sm border border-line px-2.5 py-1 text-[9px]">
            DESIGNGUIDE · VER. {brand.version} · OPDATERET {brand.updated}
          </span>
          <div className="flex overflow-hidden rounded-md border border-line" role="group" aria-label="Tema">
            {THEMES.filter((t) => t.id !== "auto").map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={
                  "px-3 py-1 font-mono text-[9px] tracking-widest " +
                  (theme === t.id ? "bg-accent font-bold text-surface" : "text-dim hover:text-ink")
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>
        <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
        <footer className="flex flex-wrap justify-between gap-2 border-t border-line px-6 py-4 md:px-10">
          <span className="label text-[9px]">NØRGÅRD MIKKELSEN · BRANDOS</span>
          <span className="label text-[9px]">FORSTÅET AF MENNESKER · BRUGBART FOR AI</span>
        </footer>
      </div>
    </div>
  );
}

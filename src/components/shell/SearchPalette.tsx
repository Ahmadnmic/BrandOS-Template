import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useTx } from "../../lens";
import { HelpDocs } from "./HelpDocs";

interface Hit {
  el: HTMLElement;
  text: string;
  chapter: string;
  weight: number;
}

const CANDIDATES = "h1, h2, h3, h4, p, li, dt, dd, td, blockquote";

// Ctrl/Cmd+F opens a centered search over the guide, Spotlight-style. It
// indexes the rendered document (nothing is registered twice), so it finds
// exactly what is on the page: rules, values, token names, table cells.
export function SearchPalette() {
  const location = useLocation();
  const tx = useTx();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const indexRef = useRef<Hit[]>([]);

  const close = useCallback((): void => {
    setOpen(false);
    setQuery("");
    setHits([]);
    setActive(0);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      } else if (e.key === "Escape") {
        close();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(close, [location.pathname, close]);

  // Build the index from the live document each time the palette opens.
  useEffect(() => {
    if (!open) return;
    const scope = document.querySelector("main") ?? document.body;
    const pages = scope.querySelectorAll<HTMLElement>("[data-page]");
    const roots: { root: HTMLElement; chapter: string }[] = pages.length
      ? Array.from(pages).map((p) => ({
          root: p,
          chapter: [p.dataset.chapter, p.dataset.label]
            .filter(Boolean)
            .join(" · "),
        }))
      : [{ root: scope as HTMLElement, chapter: document.title.split("·")[0] }];
    const seen = new Set<HTMLElement>();
    const index: Hit[] = [];
    roots.forEach(({ root, chapter }) => {
      root.querySelectorAll<HTMLElement>(CANDIDATES).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        const text = (el.innerText ?? "").replace(/\s+/g, " ").trim();
        if (text.length < 2 || text.length > 400) return;
        index.push({
          el,
          text,
          chapter,
          weight: /^H[1-4]$/.test(el.tagName) ? 0 : 1,
        });
      });
    });
    indexRef.current = index;
  }, [open]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      setHits([]);
      setActive(0);
      return;
    }
    const found = indexRef.current
      .filter((h) => h.text.toLowerCase().includes(q))
      .sort((a, b) => a.weight - b.weight)
      .slice(0, 10);
    setHits(found);
    setActive(0);
  }, [query]);

  function jumpTo(hit: Hit): void {
    close();
    // A target below the fold may still be waiting for its scroll reveal;
    // make it visible before jumping so the reader never lands on nothing.
    hit.el
      .closest("[data-page]")
      ?.querySelectorAll("[data-reveal]")
      .forEach((r) => r.classList.add("is-visible"));
    hit.el.scrollIntoView({ behavior: "smooth", block: "center" });
    hit.el.classList.add("search-flash");
    setTimeout(() => hit.el.classList.remove("search-flash"), 1800);
  }

  function onInputKey(e: React.KeyboardEvent): void {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && hits[active]) {
      e.preventDefault();
      jumpTo(hits[active]);
    }
  }

  function snippet(text: string): { pre: string; hit: string; post: string } {
    const q = query.trim();
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return { pre: text.slice(0, 90), hit: "", post: "" };
    const start = Math.max(0, i - 32);
    return {
      pre: (start > 0 ? "…" : "") + text.slice(start, i),
      hit: text.slice(i, i + q.length),
      post: text.slice(i + q.length, i + q.length + 60),
    };
  }

  if (!open) return null;

  const helpMode = /^\/(help|hjælp|hjaelp)\b/i.test(query.trim());

  return (
    <div
      className="fixed inset-0 z-30 bg-black/30"
      onClick={close}
      role="presentation"
    >
      <div
        className="mx-auto mt-[14vh] w-[min(90vw,36rem)] overflow-hidden rounded-md border border-line bg-panel shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={tx({ da: "Søg i guiden", en: "Search the guide" })}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4">
          <span aria-hidden className="font-mono text-sm text-dim">
            ⌕
          </span>
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder={tx({ da: "Søg i guiden …", en: "Search the guide …" })}
            aria-label={tx({ da: "Søg i guiden", en: "Search the guide" })}
            className="w-full bg-transparent py-3.5 text-base text-ink placeholder:text-dim focus:outline-none"
          />
        </div>
        {helpMode && <HelpDocs />}
        {!helpMode && hits.length > 0 && (
          <ul
            role="listbox"
            aria-label="Resultater"
            className="border-t border-line"
          >
            {hits.map((h, i) => {
              const s = snippet(h.text);
              return (
                <li key={i} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onClick={() => jumpTo(h)}
                    onMouseEnter={() => setActive(i)}
                    className={
                      "block w-full border-t border-line px-4 py-2.5 text-left first:border-t-0 " +
                      (i === active ? "bg-line/30" : "")
                    }
                  >
                    <span className="label block text-[8.5px]">
                      {h.chapter}
                    </span>
                    <span className="block truncate text-sm">
                      {s.pre}
                      <span className="bg-signal/30 font-bold">{s.hit}</span>
                      {s.post}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {!helpMode &&
          query.trim().length >= 2 &&
          !query.trim().startsWith("/") &&
          hits.length === 0 && (
            <p className="border-t border-line px-4 py-3 text-sm text-dim">
              {tx({ da: "Ingen resultater for", en: "No results for" })} "
              {query.trim()}".
            </p>
          )}
        <div className="flex gap-4 border-t border-line px-4 py-2">
          <span className="label text-[8.5px]">
            ↑↓ {tx({ da: "NAVIGER", en: "NAVIGATE" })}
          </span>
          <span className="label text-[8.5px]">
            ENTER {tx({ da: "GÅ TIL", en: "GO TO" })}
          </span>
          <span className="label text-[8.5px]">
            ESC {tx({ da: "LUK", en: "CLOSE" })}
          </span>
          <span className="label ml-auto text-[8.5px] text-accent">
            /HELP {tx({ da: "DOKUMENTATION", en: "DOCUMENTATION" })}
          </span>
        </div>
      </div>
    </div>
  );
}

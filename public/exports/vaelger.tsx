// Odense Basket brand tokens · vaelger.tsx
// Styles flow only through var(--sys-*) tokens. Never introduce raw values.
import { useEffect, useRef, useState } from "react";

// Dropdown selector. Fully working: opens with the brand's entrance
// motion, selects, closes on outside click and Escape. It never
// navigates; the behavior IS the demo.
export function Vaelger(props: { label: string; options: string[] }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(props.options[0] ?? "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block min-w-48">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="btn-demo flex w-full items-center justify-between gap-3 border border-line px-3.5 py-2 text-left hover:border-accent"
      >
        <span className="flex flex-col">
          <span className="label text-[8.5px]">{props.label}</span>
          <span className="text-ink">{value}</span>
        </span>
        <span
          aria-hidden
          className={
            "text-dim transition-transform " + (open ? "rotate-180" : "")
          }
          style={{ transitionDuration: "var(--sys-duration-fast)" }}
        >
          ⌄
        </span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={props.label}
          className="anim-pop absolute left-0 top-full z-10 mt-1 w-full border border-line bg-panel shadow-xl"
        >
          {props.options.map((o) => (
            <li key={o}>
              <button
                type="button"
                role="option"
                aria-selected={o === value}
                onClick={() => {
                  setValue(o);
                  setOpen(false);
                }}
                className={
                  "block w-full px-3.5 py-2 text-left font-mono text-[11px] tracking-wider " +
                  (o === value
                    ? "text-accent"
                    : "text-dim hover:bg-line/20 hover:text-ink")
                }
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

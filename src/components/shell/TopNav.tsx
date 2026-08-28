import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { brand } from "../../../brand/brand.config";
import { Mark } from "../../sections/Mark";
import { useLens, useTx } from "../../lens";

// Scroll-spy top bar: brand mark, one anchor link per chapter, the theme
// toggle. It observes the section anchors to highlight the chapter in view
// and turns solid after a little scroll.
export function TopNav() {
  const { theme, setTheme } = useLens();
  const tx = useTx();
  const location = useLocation();
  const onDocument = location.pathname === "/";
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const chapters = brand.chapters.filter(
    (c) => c.built && !c.gated && c.slug !== "",
  );
  const gated = brand.chapters.filter((c) => c.gated);

  useEffect(() => {
    function onScroll(): void {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!onDocument) return;
    const sections = chapters
      .map((c) => document.getElementById(c.slug))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDocument]);

  return (
    <nav
      aria-label={tx({ da: "Kapitler", en: "Chapters" })}
      className={
        "fixed inset-x-0 top-0 z-20 flex h-14 items-center gap-6 px-6 transition-colors md:px-10 " +
        (scrolled
          ? "border-b border-line bg-surface/95 backdrop-blur"
          : "border-b border-transparent bg-surface")
      }
    >
      <Link
        to="/"
        className="label flex shrink-0 items-center gap-2 text-[10px] text-accent"
      >
        <Mark size={16} />
        {brand.name}
      </Link>
      <ul className="hidden min-w-0 flex-1 items-center gap-5 overflow-x-auto md:flex">
        {chapters.map((c) => (
          <li key={c.num} className="shrink-0">
            <a
              href={onDocument ? "#" + c.slug : "/#" + c.slug}
              className={
                "font-mono text-[10px] tracking-wider " +
                (active === c.slug ? "text-accent" : "text-dim hover:text-ink")
              }
            >
              {c.title.toUpperCase()}
            </a>
          </li>
        ))}
        {gated.map((c) => (
          <li key={c.num} className="shrink-0">
            <span className="font-mono text-[10px] tracking-wider text-dim/40">
              {c.title.toUpperCase()} · {tx({ da: "LÅST", en: "LOCKED" })}
            </span>
          </li>
        ))}
      </ul>
      <div
        className="ml-auto flex shrink-0 overflow-hidden rounded-md border border-line"
        role="group"
        aria-label={tx({ da: "Tema", en: "Theme" })}
      >
        {(
          [
            { id: "default", label: { da: "STANDARD", en: "STANDARD" } },
            { id: "light", label: { da: "LYS", en: "LIGHT" } },
            { id: "dark", label: { da: "MØRK", en: "DARK" } },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            title={
              t.id === "default"
                ? tx({
                    da: "Brandets eget udtryk",
                    en: "The brand's own appearance",
                  })
                : tx({ da: "Kontrastvisning", en: "Contrast view" })
            }
            className={
              "px-3 py-1 font-mono text-[9px] tracking-widest " +
              (theme === t.id
                ? "bg-accent font-bold text-surface"
                : "text-dim hover:text-ink")
            }
          >
            {tx(t.label)}
          </button>
        ))}
      </div>
    </nav>
  );
}

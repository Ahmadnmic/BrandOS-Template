import { useEffect, useState } from "react";

// Page control docked to the bottom — flips through the guide one page at a
// time and names the chapter you're in, reading straight off the rendered
// pages so it stays correct when pages are added or reordered.
export default function PageNav() {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [meta, setMeta] = useState({ label: "Forside", chapter: "" });

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll("[data-page]"));
    setTotal(targets.length);

    const visible = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          visible.set(Number(e.target.dataset.page), e.intersectionRect.height);
        });
        let best = null;
        visible.forEach((px, num) => {
          if (px > 0 && (best === null || px > visible.get(best))) best = num;
        });
        if (best !== null) {
          setPage(best);
          const el = targets.find((t) => Number(t.dataset.page) === best);
          if (el) setMeta({ label: el.dataset.label, chapter: el.dataset.chapter });
        }
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const goTo = (n) => {
    const clamped = Math.max(1, Math.min(total, n));
    document
      .querySelector(`[data-page="${clamped}"]`)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="pagenav" role="navigation" aria-label="Sidenavigation">
      <button
        className="pagenav__arrow"
        onClick={() => goTo(page - 1)}
        disabled={page === 1}
        aria-label="Forrige side"
      >
        ‹
      </button>
      <div className="pagenav__status">
        <span className="pagenav__label">{meta.label}</span>
        <span className="pagenav__page">
          {meta.chapter} · {page} / {total}
        </span>
      </div>
      <button
        className="pagenav__arrow"
        onClick={() => goTo(page + 1)}
        disabled={page === total}
        aria-label="Næste side"
      >
        ›
      </button>
    </div>
  );
}

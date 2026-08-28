import { useEffect } from "react";

// Watches every [data-reveal] element and adds .is-visible the first time it
// enters the viewport, then stops watching it. CSS owns the motion and
// prefers-reduced-motion turns it off. Re-runs when the route changes.
export function useScrollReveal(pathKey: string): void {
  useEffect(() => {
    const targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    // Elements already in view reveal synchronously; the observer only
    // handles what scrolling brings in later.
    targets.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add("is-visible");
      } else {
        observer.observe(el);
      }
    });
    return () => observer.disconnect();
  }, [pathKey]);
}

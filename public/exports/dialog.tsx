// Odense Basket brand tokens · dialog.tsx
// Styles flow only through var(--sys-*) tokens. Never introduce raw values.
import { useEffect } from "react";
import type { ReactNode } from "react";

// Modal window. Fully working: backdrop fade, panel entering with the
// brand's motion, Escape and backdrop close. It never navigates; the
// caller owns the open state so the demo stays a demo.
export function Dialog(props: {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel?: string;
  children: ReactNode;
}) {
  const { open, onClose } = props;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="anim-fade fixed inset-0 z-40 bg-black/40"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={props.title}
        onClick={(e) => e.stopPropagation()}
        className="anim-pop mx-auto mt-[22vh] w-[min(90vw,26rem)] border border-line bg-panel"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <span className="label text-[9px] text-accent">{props.title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={props.closeLabel ?? "Luk"}
            className="btn-demo px-1 text-dim hover:text-ink"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4 text-sm leading-relaxed">
          {props.children}
        </div>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

// One page of the guide document: a full-height section, one idea per page.
// The data attributes are the only registration a page needs; the bottom
// pager and the top nav read them straight off the DOM, so pages can be
// added, removed or reordered without touching navigation code.
export function GuidePage(props: {
  id: string;
  page: number;
  label: string;
  chapter: string;
  tone?: "surface" | "panel";
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={props.id}
      data-page={props.page}
      data-label={props.label}
      data-chapter={props.chapter}
      className={
        "page scroll-mt-14 py-24 " + (props.tone === "panel" ? "bg-panel" : "")
      }
    >
      <div
        data-reveal
        className={
          "mx-auto w-full px-6 md:px-10 " +
          (props.wide ? "max-w-4xl" : "max-w-3xl")
        }
      >
        {props.children}
      </div>
    </section>
  );
}

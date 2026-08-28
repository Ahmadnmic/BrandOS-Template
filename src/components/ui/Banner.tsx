import type { ReactNode } from "react";

// Announcement strip: hairlines above and below, flush left, no box.
export function Banner(props: {
  label: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-y border-line py-3">
      <span className="label shrink-0 text-[9px] text-accent">
        {props.label}
      </span>
      <span className="text-sm">{props.children}</span>
      {props.action ? (
        <span className="ml-auto shrink-0">{props.action}</span>
      ) : null}
    </div>
  );
}

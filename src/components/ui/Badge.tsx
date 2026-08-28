import type { HTMLAttributes } from "react";

type Variant = "standard" | "signal";

const styles: Record<Variant, string> = {
  standard: "border border-line text-dim",
  signal: "bg-signal text-on-signal",
};

export function Badge(
  props: { variant?: Variant } & HTMLAttributes<HTMLSpanElement>,
) {
  const { variant = "standard", className = "", ...rest } = props;
  return (
    <span
      className={
        "inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest " +
        styles[variant] +
        " " +
        className
      }
      {...rest}
    />
  );
}

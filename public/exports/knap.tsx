// Odense Basket brand tokens · knap.tsx
// Styles flow only through var(--sys-*) tokens. Never introduce raw values.
import type { ButtonHTMLAttributes } from "react";

type Variant = "primaer" | "sekundaer" | "signal";

const styles: Record<Variant, string> = {
  primaer: "bg-action text-on-action",
  sekundaer: "border border-line text-accent",
  signal: "bg-signal text-on-signal",
};

export function Button(
  props: { variant?: Variant } & ButtonHTMLAttributes<HTMLButtonElement>,
) {
  const { variant = "primaer", className = "", ...rest } = props;
  return (
    <button
      type="button"
      className={
        "btn-demo rounded-md px-4.5 py-2.5 " + styles[variant] + " " + className
      }
      {...rest}
    />
  );
}

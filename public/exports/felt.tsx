import type { InputHTMLAttributes } from "react";
import { useId } from "react";

// Ruled input: a hairline under the value, no box. The label sits above
// in mono caps; focus moves the line to accent.
export function Felt(
  props: { label: string } & InputHTMLAttributes<HTMLInputElement>,
) {
  const { label, className = "", ...rest } = props;
  const id = useId();
  return (
    <div className={"flex flex-col gap-1.5 " + className}>
      <label htmlFor={id} className="label text-[9px]">
        {label}
      </label>
      <input
        id={id}
        className="border-b border-line bg-transparent py-1.5 text-sm text-ink placeholder:text-dim focus:border-accent focus:outline-none"
        {...rest}
      />
    </div>
  );
}

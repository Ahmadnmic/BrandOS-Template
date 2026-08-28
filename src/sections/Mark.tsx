// The brand mark, drawn from tokens. A brand build replaces this with the
// captured logo (brand/logos/) and never draws one from memory; the seed's
// ball is demo artwork for Odense Basket.
export function Mark(props: { size?: number }) {
  const s = props.size ?? 20;
  return (
    <span
      aria-hidden
      style={{ width: s, height: s }}
      className="relative inline-block shrink-0 rounded-full border-[1.5px] border-accent
      before:absolute before:inset-0 before:scale-x-50 before:rounded-full before:border-l-[1.5px] before:border-accent
      after:absolute after:inset-0 after:scale-y-50 after:rounded-full after:border-t-[1.5px] after:border-accent"
    />
  );
}

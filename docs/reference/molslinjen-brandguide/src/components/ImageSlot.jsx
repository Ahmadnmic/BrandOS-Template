// Marks a spot where a real photo or illustration belongs. Nothing is
// faked or stand-in-stocked here — the slot names the shot that's needed
// and where to get it, so it's obvious what's still missing.
export default function ImageSlot({ label, note, ratio = "16 / 9" }) {
  return (
    <figure className="imageslot" style={{ aspectRatio: ratio }}>
      <svg className="imageslot__icon" viewBox="0 0 48 48" aria-hidden="true">
        <rect x="4" y="9" width="40" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="16" cy="20" r="3.5" fill="currentColor" />
        <path d="M7 34l10.5-11 7.5 8 6-5.5L41 34" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <figcaption>
        <strong>{label}</strong>
        <span>{note || "Hentes på brand.molslinjen.dk"}</span>
      </figcaption>
    </figure>
  );
}

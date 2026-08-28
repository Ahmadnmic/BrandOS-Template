// Honest placeholder for ideas that can't actually be built in this
// prototype — missing photos/audio/video, real customer cases, or
// persondata that shouldn't be fabricated. Shows the *shape* of the
// intended control in a disabled state rather than faking content.
export default function BlockedFeature({ label, reason, control }) {
  return (
    <div className="blocked">
      <div className="blocked__control" aria-disabled="true">
        {control}
      </div>
      <p className="blocked__label">{label}</p>
      <p className="blocked__reason">{reason}</p>
    </div>
  );
}

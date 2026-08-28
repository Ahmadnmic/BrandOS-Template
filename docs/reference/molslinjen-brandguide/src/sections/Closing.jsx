import { closing } from "../data/brand";
import Wave from "../components/Wave";

export default function Closing() {
  return (
    <section id="afslutning" className="section dark closing">
      <div className="closing__waves" aria-hidden="true">
        <Wave size={460} color="rgba(255,255,255,0.05)" className="closing__wave" />
      </div>
      <div className="section-inner">
        <p className="eyebrow" data-reveal>Guiden slutter her</p>
        <h2 className="closing__line" data-reveal>{closing.line}</h2>
        <p className="closing__contact" data-reveal>
          Spørgsmål til indhold eller anvendelse? Skriv til brand-teamet.
          Materialet — logoer, billeder, illustrationer og InDesign-filer —
          ligger på brand.molslinjen.dk.
        </p>
      </div>
    </section>
  );
}

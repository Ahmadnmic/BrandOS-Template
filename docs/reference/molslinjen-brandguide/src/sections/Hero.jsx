import Wave from "../components/Wave";

export default function Hero() {
  return (
    <header id="top" className="hero">
      <div className="hero__waves" aria-hidden="true">
        <Wave size={520} color="rgba(255,255,255,0.05)" className="hero__wave-a" />
        <Wave size={360} color="rgba(0,181,237,0.16)" className="hero__wave-b" />
      </div>
      <div className="hero__content">
        <p className="eyebrow">Brand- og designguide · 2026</p>
        <h1 className="hero__title">
          Kombardo! <br /> Den smarte vej
        </h1>
        <p className="hero__lede">
          En levende designguide — ikke en pdf, du bladrer forbi, men et sted hvor
          Molslinjens regler og assets opfører sig, som de gør i virkeligheden.
          Scroll, klik, og prøv bølgen selv.
        </p>
        <a className="hero__scroll" href="#brandet">
          Kom ombord
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v11M3 9l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </header>
  );
}

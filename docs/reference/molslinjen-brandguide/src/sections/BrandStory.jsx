export default function BrandStory({ dark }) {
  return (
    <section id="brandet" className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">01 / Brandet · s. 6</p>
          <h2>Én bro har vi ikke. Vi har en bedre vej.</h2>
          <p>
            Molslinjen A/S forbinder Danmark til lands og til vands med færger og
            lynbusser. Uanset om det er arbejdet, der kalder, eller ferien der
            venter, sikrer vi den smarte vej mellem landsdele, øer og mennesker.
          </p>
        </div>
        <div className="story-grid">
          <div className="story-card" data-reveal>
            <span className="story-card__num">01</span>
            <h3>Manifestet</h3>
            <p>
              Tager du broen, er du bare bilist. Rejser du med os, er du en
              velkommen gæst. "Kom bar', du" har lydt i velkomsten siden
              1960'erne — derfra kommer ordet Kombardo.
            </p>
          </div>
          <div className="story-card" data-reveal style={{ transitionDelay: "0.08s" }}>
            <span className="story-card__num">02</span>
            <h3>Ambitionen</h3>
            <p>Vi vil være den rejsendes foretrukne valg — hver eneste overfart.</p>
          </div>
          <div className="story-card" data-reveal style={{ transitionDelay: "0.16s" }}>
            <span className="story-card__num">03</span>
            <h3>Kombardo-ånden</h3>
            <p>
              Servicemindet, nytænkende, effektiv, kompetent — "en stærk
              kultur skaber stærke resultater", som guiden selv formulerer det.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

import DonutChart from "../components/extras/DonutChart";

// The guide states the split as 45 / 10 / 45 without labelling which colour
// each share belongs to in its text layer — so the ratio is shown as fact
// and the mapping is flagged rather than guessed.
export default function ColorSplit({ dark }) {
  return (
    <section className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">04.13 / Farvefordeling</p>
          <h2>45 / 10 / 45</h2>
          <p>
            Farverne fordeles ikke jævnt. To flader bærer layoutet, og en
            tredje bruges som accent — det er dét, der holder udtrykket roligt.
          </p>
        </div>

        <div className="colorsplit" data-reveal>
          <DonutChart
            segments={[
              { label: "Bærende flade", value: 45, color: "var(--dyb-havbla)" },
              { label: "Accent", value: 10, color: "var(--smart-bla)" },
              { label: "Modflade", value: 45, color: "var(--havbla)" },
            ]}
          />
          <div className="colorsplit__text">
            <p>
              Accentfarven fylder lidt, netop fordi den skal kunne ses. Bruges
              Smart Blå på store flader, holder den op med at fungere som CTA.
            </p>
            <p className="cpage__note">
              <span>Bemærk</span> Guiden angiver tallene, men koblingen mellem
              hvert tal og hver farve fremgår kun af et diagram. Bekræft
              fordelingen med brand-teamet, før den bruges som facit.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

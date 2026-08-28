import Checklist from "../components/extras/Checklist";
import { aiPolicy } from "../data/brand";

// A policy page where the checklist earns its place: these are the points
// you actually have to clear before publishing, not just background reading.
export default function AiPolicy({ dark }) {
  return (
    <section className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">06 / Brug af AI</p>
          <h2>AI må hjælpe. Ikke afsende.</h2>
          <p>{aiPolicy.summary}</p>
        </div>

        <div className="aipolicy" data-reveal>
          <div className="aipolicy__col">
            <h3>Sådan bruger vi det</h3>
            <ul className="cpage__list">
              <li>Idéudvikling, konceptudforskning og hurtige udkast.</li>
              <li>Varianter af noget, vi allerede har besluttet retningen på.</li>
              <li>Research, der efterfølgende bliver kontrolleret.</li>
            </ul>
            <h3>Sådan bruger vi det ikke</h3>
            <ul className="cpage__list">
              <li>Som endelig afsender uden menneskelig redigering.</li>
              <li>Til at generere fakta, priser eller sejlplaner.</li>
              <li>Til materiale, der publiceres uden den påkrævede mærkning.</li>
            </ul>
          </div>

          <div className="aipolicy__col">
            <h3>Før du publicerer</h3>
            <Checklist
              storageKey="checklist-ai-final"
              items={[
                "Resultatet er kurateret og kvalitetstjekket af et menneske",
                "AI står ikke alene som afsender",
                "Fakta og tal er verificeret ved kilden",
                "Gældende regler for AI-mærkning er fulgt",
              ]}
            />
            <p className="cpage__note">
              <span>Bemærk</span> {aiPolicy.disclosure}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

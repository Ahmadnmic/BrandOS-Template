import {
  ChapterHead,
  TypeSpecimen,
  Rules,
  TokenTable,
} from "../components/guide/Guide";
import { useTx } from "../lens";

export function Typografi() {
  const tx = useTx();
  return (
    <>
      <ChapterHead num="04" title={tx({ da: "Typografi", en: "Typography" })} />
      <p className="mb-8 max-w-xl text-sm text-dim">
        {tx({
          da: "To snit, ingen undtagelser: JetBrains Mono til overskrifter, Public Sans til brødtekst.",
          en: "Two faces, no exceptions: JetBrains Mono for headings, Public Sans for body text.",
        })}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <TypeSpecimen
          face={tx({
            da: "DISPLAY · JETBRAINS MONO · 700 · VERSALER",
            en: "DISPLAY · JETBRAINS MONO · 700 · UPPERCASE",
          })}
          sample="ALL IN. AA BB 09"
        />
        <TypeSpecimen
          face={tx({
            da: "BRØDTEKST · PUBLIC SANS · 400-700",
            en: "BODY · PUBLIC SANS · 400-700",
          })}
          sample="Aa Bb Cc 0123"
        />
      </div>
      <div className="mt-12">
        <Rules
          dos={[
            tx({
              da: "Overskrifter i versaler med fast tracking.",
              en: "Headings in uppercase with fixed tracking.",
            }),
            tx({
              da: "Flush venstre, ragget højre.",
              en: "Flush left, ragged right.",
            }),
            tx({
              da: "Maks to typografiske niveauer pr. flade.",
              en: "At most two typographic levels per surface.",
            }),
          ]}
          donts={[
            tx({ da: "Andre snit end de to.", en: "Faces beyond the two." }),
            tx({
              da: "Kursiv, skygger eller outline i display.",
              en: "Italics, shadows or outlines in display.",
            }),
            tx({
              da: "Centreret tekst og hele afsnit i versaler.",
              en: "Centered text and whole paragraphs in uppercase.",
            }),
          ]}
        />
      </div>
      <div className="mt-8">
        <TokenTable
          rows={[
            {
              token: "--sys-font-display",
              role: tx({ da: "Overskrifter", en: "Headings" }),
              light: "JetBrains Mono",
              dark: "JetBrains Mono",
            },
            {
              token: "--sys-font-body",
              role: tx({ da: "Brødtekst", en: "Body text" }),
              light: "Public Sans",
              dark: "Public Sans",
            },
            {
              token: "--sys-tracking-display",
              role: "Display-tracking",
              light: "0.08em",
              dark: "0.08em",
            },
            {
              token: "--sys-case-display",
              role: "Display-versaler",
              light: "uppercase",
              dark: "uppercase",
            },
          ]}
        />
      </div>
    </>
  );
}

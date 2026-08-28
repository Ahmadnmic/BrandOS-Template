import {
  ChapterHead,
  TypeSpecimen,
  Rules,
  TokenTable,
} from "../components/guide/Guide";

export function meta() {
  return [{ title: "Typografi · Odense Basket BrandOS" }];
}

export default function Typografi() {
  return (
    <div className="mx-auto max-w-4xl">
      <ChapterHead num="04" title="Typografi" />
      <p className="mb-8 max-w-xl text-sm text-dim">
        To snit, ingen undtagelser: JetBrains Mono til overskrifter, Public Sans
        til brødtekst.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <TypeSpecimen
          face="DISPLAY · JETBRAINS MONO · 700 · VERSALER"
          sample="ALL IN. AA BB 09"
        />
        <TypeSpecimen
          face="BRØDTEKST · PUBLIC SANS · 400-700"
          sample="Aa Bb Cc 0123"
        />
      </div>
      <div className="mt-12">
        <Rules
          dos={[
            "Overskrifter i versaler med fast tracking.",
            "Flush venstre, ragget højre.",
            "Maks to typografiske niveauer pr. flade.",
          ]}
          donts={[
            "Andre snit end de to.",
            "Kursiv, skygger eller outline i display.",
            "Centreret tekst og hele afsnit i versaler.",
          ]}
        />
      </div>
      <div className="mt-8">
        <TokenTable
          rows={[
            {
              token: "--sys-font-display",
              role: "Overskrifter",
              light: "JetBrains Mono",
              dark: "JetBrains Mono",
            },
            {
              token: "--sys-font-body",
              role: "Brødtekst",
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
    </div>
  );
}

import type { ReactNode } from "react";
import { brand } from "../../../brand/brand.config";
import { useTx } from "../../lens";

function Section(props: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line px-4 py-3">
      <h3 className="label mb-1.5 text-[9px] text-accent">{props.title}</h3>
      <div className="space-y-2 text-[13px] leading-relaxed">
        {props.children}
      </div>
    </section>
  );
}

function Key(props: { children: ReactNode }) {
  return (
    <kbd className="rounded-sm border border-line px-1 font-mono text-[10px]">
      {props.children}
    </kbd>
  );
}

// The portal's documentation, opened with /help in the search field.
// Written for the person using the portal, in plain language, in the
// language chosen under the gear.
export function HelpDocs() {
  const tx = useTx();
  const contact = brand.contacts[0];
  return (
    <div className="max-h-[55vh] overflow-y-auto">
      <Section title={tx({ da: "Portalen", en: "The portal" })}>
        <p>
          {tx({
            da: `Det her er ${brand.name}s levende designguide. Den samler identiteten ét sted: farver, typografi, bevægelse, komponenter og kode, alt hentet fra samme kilde, så guiden og det byggede aldrig er i utakt.`,
            en: `This is ${brand.name}'s living design guide. It keeps the identity in one place: colors, typography, motion, components and code, all drawn from the same source, so the guide and the built product never drift apart.`,
          })}
        </p>
        <p>
          {tx({
            da: "Guiden læses som ét dokument. Rul, eller brug kapitellinjen øverst. Sidetælleren nederst til højre bladrer én side ad gangen og viser hvor du er.",
            en: "The guide reads as one document. Scroll, or use the chapter bar at the top. The page control in the lower right flips one page at a time and shows where you are.",
          })}
        </p>
      </Section>

      <Section title={tx({ da: "Søgning", en: "Search" })}>
        <p>
          <Key>Ctrl</Key>+<Key>F</Key> (Mac: <Key>Cmd</Key>+<Key>F</Key>){" "}
          {tx({
            da: "åbner søgefeltet. Skriv mindst to tegn, så søges der i alt det, der står på siden: regler, værdier, tokens, tabeller. Overskrifter rangeres først.",
            en: "opens the search field. Type at least two characters and everything on the page is searched: rules, values, tokens, tables. Headings rank first.",
          })}
        </p>
        <p>
          <Key>↑</Key> {tx({ da: "og", en: "and" })} <Key>↓</Key>{" "}
          {tx({
            da: "flytter mellem resultater, ",
            en: "move between results, ",
          })}
          <Key>Enter</Key>{" "}
          {tx({
            da: "hopper til det valgte og markerer det kort på siden. ",
            en: "jumps to the selected hit and marks it briefly on the page. ",
          })}
          <Key>Esc</Key> {tx({ da: "lukker.", en: "closes." })}{" "}
          {tx({
            da: "Skriv /help for at åbne denne dokumentation.",
            en: "Type /help to open this documentation.",
          })}
        </p>
      </Section>

      <Section title={tx({ da: "Linser", en: "Lenses" })}>
        <p>
          {tx({
            da: "Alle ser det samme indhold, men linsen vægter det forskelligt. Skift linse under tandhjulet nederst til højre.",
            en: "Everyone sees the same content, but the lens weights it differently. Switch lens under the gear in the lower right.",
          })}
        </p>
        <p>
          <strong>{tx({ da: "Generel", en: "General" })}</strong>{" "}
          {tx({
            da: "er til at læse guiden: kode og token-tabeller er foldet væk bag knapper, så reglerne står renest.",
            en: "is for reading the guide: code and token tables are folded away behind buttons so the rules stand cleanest.",
          })}{" "}
          <strong>Design</strong>{" "}
          {tx({
            da: "viser specimener større og åbner komponentsider på Specs.",
            en: "shows specimens larger and opens component pages on Specs.",
          })}{" "}
          <strong>Dev</strong>{" "}
          {tx({
            da: "viser kode direkte på siden, folder alle token-tabeller ud og åbner komponentsider på Kode.",
            en: "shows code directly on the page, expands every token table and opens component pages on Code.",
          })}{" "}
          <strong>HR</strong>{" "}
          {tx({
            da: "vægter anvendelse og tone, til onboarding og alle der skriver eller taler for brandet.",
            en: "weights usage and tone, for onboarding and everyone who writes or speaks for the brand.",
          })}
        </p>
        <p>
          {tx({
            da: "Valget huskes i din browser. Et link kan bære en linse med: tilføj ?lens=dev til adressen.",
            en: "Your choice is remembered in your browser. A link can carry a lens: add ?lens=dev to the address.",
          })}
        </p>
      </Section>

      <Section title={tx({ da: "Tema", en: "Theme" })}>
        <p>
          <strong>Standard</strong>{" "}
          {tx({
            da: "er brandets eget udtryk, som identiteten er defineret.",
            en: "is the brand's own appearance, the way the identity is defined.",
          })}{" "}
          <strong>{tx({ da: "Lys", en: "Light" })}</strong>{" "}
          {tx({ da: "og", en: "and" })}{" "}
          <strong>{tx({ da: "Mørk", en: "Dark" })}</strong>{" "}
          {tx({
            da: 'er kontrastvisninger: brug dem til at se identiteten på begge flader og til at tjekke læsbarhed. Alle tre trækker på de samme tokens, så intet er "off brand", de er blot forskellige visninger af samme system.',
            en: 'are contrast views: use them to see the identity on both surfaces and to check readability. All three draw on the same tokens, so nothing is "off brand", they are simply different views of the same system.',
          })}
        </p>
      </Section>

      <Section
        title={tx({ da: "Downloads og kode", en: "Downloads and code" })}
      >
        <p>
          {tx({
            da: "Knapper med ⇩ henter filer: tokens som CSS og JSON, komponentkode som TSX. Knapper med ↗ åbner eksterne værktøjer, fx Figma-biblioteket. Værdier med ⧉ kopieres med ét klik, det gælder hex-koder, token-navne og hele paletten.",
            en: "Buttons with ⇩ download files: tokens as CSS and JSON, component code as TSX. Buttons with ↗ open external tools, such as the Figma library. Values with ⧉ copy with one click, including hex codes, token names and the whole palette.",
          })}
        </p>
        <p>
          {tx({
            da: `Kodeblokke ligger bag </> KODE i Generel og Design. I Dev-linsen står de direkte på siden.`,
            en: `Code blocks sit behind </> CODE in General and Design. In the Dev lens they appear directly on the page.`,
          })}
        </p>
      </Section>

      <Section title={tx({ da: "Komponenter", en: "Components" })}>
        <p>
          {tx({
            da: "Hver komponent har fire faner: Anvendelse (hvornår og hvordan), Specs (mål og tokens), Kode (den færdige komponent) og Tilgængelighed (tastatur, kontrast, målflader). Linsen vælger hvilken fane der åbner først. Det du ser i eksemplerne, er den rigtige komponent, ikke et billede af den.",
            en: "Every component has four tabs: Usage (when and how), Specs (measurements and tokens), Code (the finished component) and Accessibility (keyboard, contrast, target sizes). The lens picks which tab opens first. What you see in the examples is the real component, not a picture of it.",
          })}
        </p>
      </Section>

      <Section title={tx({ da: "Låste kapitler", en: "Locked chapters" })}>
        <p>
          {tx({
            da: "Kapitler mærket LÅST indeholder materiale, der kræver adgang, fx persondata og licensbelagte filer.",
            en: "Chapters marked LOCKED hold material that requires access, such as personal data and licensed files.",
          })}{" "}
          {contact
            ? tx({
                da: `Skriv til ${contact.email} for at få adgang.`,
                en: `Write to ${contact.email} for access.`,
              })
            : tx({
                da: "Kontakt brand-ansvarlig for adgang.",
                en: "Contact the brand owner for access.",
              })}
        </p>
      </Section>

      <Section title={tx({ da: "Til udviklere", en: "For developers" })}>
        <p>
          {tx({
            da: "Tokens er den eneste kilde til farve og form. Hent /exports/tokens.css og byg med var(--sys-...)-rollerne, aldrig med rå værdier. Lys og mørk ligger i samme fil og styres af data-theme på html-elementet.",
            en: "Tokens are the only source of color and form. Download /exports/tokens.css and build with the var(--sys-...) roles, never with raw values. Light and dark live in the same file, driven by data-theme on the html element.",
          })}
        </p>
        <p>
          {tx({
            da: "Portalen har også et maskinlag: llms.txt og AGENTS.md ligger i roden af det byggede site, så AI-værktøjer kan læse guiden og arbejde efter dens regler.",
            en: "The portal also has a machine layer: llms.txt and AGENTS.md sit at the root of the built site, so AI tools can read the guide and work by its rules.",
          })}
        </p>
      </Section>

      <Section title={tx({ da: "Genveje", en: "Shortcuts" })}>
        <p>
          <Key>Ctrl</Key>+<Key>F</Key> {tx({ da: "søg", en: "search" })} ·{" "}
          <Key>Esc</Key> {tx({ da: "luk", en: "close" })} · <Key>↑</Key>
          <Key>↓</Key> {tx({ da: "vælg resultat", en: "select result" })} ·{" "}
          <Key>Enter</Key> {tx({ da: "hop til", en: "jump to" })} ·{" "}
          {tx({
            da: "‹ og › i sidetælleren bladrer kapitelsider.",
            en: "‹ and › on the page control flip chapter pages.",
          })}
        </p>
      </Section>
    </div>
  );
}

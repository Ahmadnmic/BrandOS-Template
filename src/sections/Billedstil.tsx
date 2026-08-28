import { ChapterHead, ImageFrame, Rules } from "../components/guide/Guide";
import { useTx } from "../lens";

export function Billedstil() {
  const tx = useTx();
  return (
    <>
      <ChapterHead num="07" title={tx({ da: "Billedstil", en: "Imagery" })} />
      <p className="mb-8 max-w-xl text-sm text-dim">
        {tx({
          da: "Billeder er kampens virkelighed: hårdt hallys, ægte øjeblikke, ingen opstillinger.",
          en: "Images are the reality of the game: hard arena light, real moments, nothing staged.",
        })}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <ImageFrame
          motif={tx({
            da: "Kampens afgørende sekund, tæt på kurven.",
            en: "The deciding second of the game, close to the basket.",
          })}
        />
        <ImageFrame
          motif={tx({
            da: "Holdet samlet, sved og koncentration.",
            en: "The team together, sweat and concentration.",
          })}
        />
      </div>
      <div className="mt-4">
        <ImageFrame
          ratio="21/9"
          motif={tx({
            da: "Hallen før kampen, tom og spændt.",
            en: "The arena before the game, empty and tense.",
          })}
        />
      </div>
    </>
  );
}

export function BilledstilRegler() {
  const tx = useTx();
  return (
    <>
      <Rules
        dos={[
          tx({
            da: "Ægte øjeblikke fra kamp og træning.",
            en: "Real moments from games and practice.",
          }),
          tx({
            da: "Hårdt hallys som det er, ingen filtre.",
            en: "Hard arena light as it is, no filters.",
          }),
          tx({
            da: "Beskær tæt og følg bolden.",
            en: "Crop tight and follow the ball.",
          }),
        ]}
        donts={[
          tx({
            da: "Opstillede fotos og stockbilleder.",
            en: "Staged photos and stock imagery.",
          }),
          tx({
            da: "Bløde pastelfiltre og udvasket lys.",
            en: "Soft pastel filters and washed-out light.",
          }),
          tx({
            da: "Logo klistret hen over billeder.",
            en: "The logo pasted across photos.",
          }),
        ]}
      />
    </>
  );
}

import { useMemo, useState } from "react";

// "Os eller ikke os" — guesses whether a line matches the brand voice.
// Built entirely from data we already have (voice.on / voice.off pairs).
export default function Quiz({ pairs }) {
  const rounds = useMemo(() => {
    return pairs.flatMap((p) => [
      { text: p.on, answer: "os" },
      { text: p.off, answer: "ikke os" },
    ]);
  }, [pairs]);

  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);
  const done = i >= rounds.length;
  const round = rounds[i];

  const guess = (choice) => {
    if (result) return;
    const correct = choice === round.answer;
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
  };

  const next = () => {
    setResult(null);
    setI((n) => n + 1);
  };

  if (done) {
    return (
      <div className="quiz">
        <p className="quiz__score">Du fik {score} / {rounds.length} rigtige.</p>
        <button
          onClick={() => {
            setI(0);
            setScore(0);
            setResult(null);
          }}
        >
          Prøv igen
        </button>
      </div>
    );
  }

  return (
    <div className="quiz">
      <p className="quiz__question">“{round.text}”</p>
      <div className="quiz__choices">
        <button className={result === "wrong" && round.answer === "os" ? "is-missed" : ""} onClick={() => guess("os")}>
          Os
        </button>
        <button className={result === "wrong" && round.answer === "ikke os" ? "is-missed" : ""} onClick={() => guess("ikke os")}>
          Ikke os
        </button>
      </div>
      {result && (
        <div className="quiz__feedback">
          <p className={result === "correct" ? "is-ok" : "is-warn"}>
            {result === "correct" ? "Rigtigt!" : `Forkert — det er ${round.answer}.`}
          </p>
          <button onClick={next}>Næste</button>
        </div>
      )}
    </div>
  );
}

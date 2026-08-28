import Wave from "./Wave";
import ImageSlot from "./ImageSlot";

// A normal page of the guide. Most pages are this: real content, laid out
// properly. Interactivity is added only on the pages where clicking
// something actually teaches you the rule (see App.jsx).
function Block({ b }) {
  switch (b.type) {
    case "p":
      return <p className="cpage__p">{b.text}</p>;

    case "lead":
      return <p className="cpage__lead">{b.text}</p>;

    case "list":
      return (
        <ul className="cpage__list">
          {b.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      );

    case "cards":
      return (
        <div className="cpage__cards">
          {b.items.map((c, i) => (
            <div className="cpage__card" key={c.title}>
              {b.numbered && <span className="cpage__card-num">{String(i + 1).padStart(2, "0")}</span>}
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      );

    case "specs":
      return (
        <dl className="cpage__specs">
          {b.items.map((s) => (
            <div key={s.k}>
              <dt>{s.k}</dt>
              <dd>{s.v}</dd>
            </div>
          ))}
        </dl>
      );

    case "rules":
      return (
        <div className="cpage__rules">
          <div className="cpage__rule cpage__rule--do">
            <h4>Do</h4>
            <ul>
              {b.dos.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div className="cpage__rule cpage__rule--dont">
            <h4>Don't</h4>
            <ul>
              {b.donts.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      );

    case "quote":
      return (
        <blockquote className="cpage__quote">
          {b.text}
          {b.by && <cite>{b.by}</cite>}
        </blockquote>
      );

    case "images":
      return (
        <div className="cpage__images" style={{ "--cols": b.cols || 2 }}>
          {b.items.map((im) => (
            <ImageSlot key={im.label} label={im.label} note={im.note} ratio={im.ratio} />
          ))}
        </div>
      );

    case "note":
      return (
        <p className="cpage__note">
          <span>Bemærk</span> {b.text}
        </p>
      );

    case "custom":
      return b.render();

    default:
      return null;
  }
}

export default function ContentPage({ page }) {
  const dark = page.dark;
  return (
    <section className={`cpage ${dark ? "cpage--dark" : "cpage--light"}`}>
      <div className="cpage__waves" aria-hidden="true">
        <Wave size={480} color={dark ? "rgba(255,255,255,0.045)" : "rgba(0,91,169,0.05)"} className="cpage__wave" />
      </div>
      <div className="cpage__inner">
        <header className="cpage__head">
          <p className="cpage__kicker">{page.kicker}</p>
          <h2 className="cpage__title">{page.title}</h2>
        </header>
        <div className="cpage__body">
          {page.blocks.map((b, i) => (
            <Block b={b} key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

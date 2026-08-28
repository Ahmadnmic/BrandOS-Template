import { useState } from "react";
import { messagingHouse } from "../data/brand";

export default function MessagingHouse({ dark }) {
  const [active, setActive] = useState(messagingHouse.pillars[0].key);
  const pillar = messagingHouse.pillars.find((p) => p.key === active);

  return (
    <section id="budskabshus" className={`section ${dark ? "dark" : ""}`}>
      <div className="section-inner">
        <div className="section-head" data-reveal>
          <p className="eyebrow">02.1 / Budskabshus · s. 20</p>
          <h2>Ét løfte, to mindsets</h2>
          <p>Samme løfte, samme reason to believe — men to forskellige måder at være relevant for den rejsende på.</p>
        </div>

        <div className="house" data-reveal>
          <div className="house__top">
            <span className="house__promise">{messagingHouse.promise}</span>
            <span className="house__rtb">Reason to believe: {messagingHouse.reasonToBelieve}</span>
          </div>
          <div className="house__pillars">
            {messagingHouse.pillars.map((p) => (
              <button
                key={p.key}
                className={`house__pillar ${active === p.key ? "is-active" : ""}`}
                onClick={() => setActive(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="house__detail">
            <p>{pillar.desc}</p>
            <p className="house__lines">{pillar.lines}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

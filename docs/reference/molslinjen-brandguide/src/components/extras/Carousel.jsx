import { useState } from "react";

// Click-through carousel for quote/example rotation ideas.
export default function Carousel({ items }) {
  const [i, setI] = useState(0);
  const item = items[i];

  return (
    <div className="carousel">
      <div className="carousel__stage">
        {item.title && <strong>{item.title}</strong>}
        <p>{item.text}</p>
      </div>
      <div className="carousel__dots">
        {items.map((it, idx) => (
          <button
            key={it.text}
            className={idx === i ? "is-active" : ""}
            aria-label={`Vis ${idx + 1}`}
            onClick={() => setI(idx)}
          />
        ))}
      </div>
    </div>
  );
}

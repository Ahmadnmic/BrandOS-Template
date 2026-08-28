import { useEffect, useState } from "react";
import Logo from "./Logo";

const links = [
  { id: "brandet", label: "Brandet" },
  { id: "linjer", label: "Linjerne" },
  { id: "platform", label: "Platform" },
  { id: "budskabshus", label: "Budskabshus" },
  { id: "stemme", label: "Tone of voice" },
  { id: "logo", label: "Bølgen" },
  { id: "farver", label: "Farver" },
  { id: "rutekort", label: "Rutekort" },
  { id: "typografi", label: "Typografi" },
  { id: "komponenter", label: "Komponenter" },
  { id: "billedstil", label: "Billedstil" },
];

export default function Nav() {
  const [active, setActive] = useState("brandet");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className={`nav ${scrolled ? "nav--solid" : ""}`}>
      <a href="#top" className="nav__brand">
        <Logo width={118} color={scrolled ? "var(--havbla)" : "#fff"} />
      </a>
      <ul className="nav__links">
        {links.map((l) => (
          <li key={l.id}>
            <a href={`#${l.id}`} className={active === l.id ? "is-active" : ""}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

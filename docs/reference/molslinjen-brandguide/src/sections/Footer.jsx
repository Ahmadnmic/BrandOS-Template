import Logo from "../components/Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__sound" data-reveal>
        <p className="footer__sound-label">05 / Lyd</p>
        <div className="footer__sound-items">
          <span className="footer__sound-item">
            <strong>Kombardo-sangen</strong> — brandets jingle, gen-versioneres
            efter sæson, anledning og linje.
          </span>
          <span className="footer__sound-item">
            <strong>Færgehornet</strong> — lydlogoet, bruges som åbner/lukker
            på musik, radiospots og anden lyd.
          </span>
        </div>
        <p className="footer__sound-note">
          Ingen lydfiler er tilgængelige i denne prototype — konceptuelt vist.
        </p>
      </div>
      <Logo width={110} color="var(--havbla)" />
      <p>Molslinjen A/S · Brand- og designguide 2026 · Interaktivt bygget som referenceprojekt</p>
    </footer>
  );
}

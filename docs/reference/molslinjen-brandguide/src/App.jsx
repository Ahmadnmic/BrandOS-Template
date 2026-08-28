import Nav from "./components/Nav";
import PageNav from "./components/PageNav";
import ContentPage from "./components/ContentPage";
import Hero from "./sections/Hero";
import BrandStory from "./sections/BrandStory";
import Lines from "./sections/Lines";
import SubBrands from "./sections/SubBrands";
import Platform from "./sections/Platform";
import Idea from "./sections/Idea";
import MessagingHouse from "./sections/MessagingHouse";
import Voice from "./sections/Voice";
import LogoColors from "./sections/LogoColors";
import LogoWave from "./sections/LogoWave";
import LogoPlacement from "./sections/LogoPlacement";
import Colors from "./sections/Colors";
import ColorSplit from "./sections/ColorSplit";
import RouteMap from "./sections/RouteMap";
import Typography from "./sections/Typography";
import Captions from "./sections/Captions";
import Components from "./sections/Components";
import Imagery from "./sections/Imagery";
import AiPolicy from "./sections/AiPolicy";
import Closing from "./sections/Closing";
import Footer from "./sections/Footer";
import useScrollReveal from "./hooks/useScrollReveal";
import { guidePages } from "./data/guide";

// Pages that need a control to make their point. Everything else is a
// normal content page rendered from src/data/guide.js.
const INTERACTIVE = {
  BrandStory,
  Lines,
  SubBrands,
  Platform,
  Idea,
  MessagingHouse,
  Voice,
  LogoColors,
  LogoWave,
  LogoPlacement,
  Colors,
  ColorSplit,
  RouteMap,
  Typography,
  Captions,
  Components,
  Imagery,
  AiPolicy,
};

export default function App() {
  useScrollReveal();

  return (
    <>
      <Nav />

      <div className="page" data-page="1" data-label="Forside" data-chapter="Forside">
        <Hero />
      </div>

      {guidePages.map((p, i) => {
        const n = i + 2;
        const Comp = p.interactive ? INTERACTIVE[p.interactive] : null;
        const label = p.label || p.title;
        // Strict alternation: the Hero is dark, so every odd page is dark and
        // every even one light. Two pale pages never end up back to back, and
        // each page reads as a clean break from the one before it.
        const dark = n % 2 === 1;
        return (
          <div
            className="page"
            data-page={n}
            data-label={label}
            data-chapter={p.chapter}
            key={p.id || p.interactive}
          >
            {Comp ? <Comp dark={dark} /> : <ContentPage page={{ ...p, dark }} />}
          </div>
        );
      })}

      <div
        className="page"
        data-page={guidePages.length + 2}
        data-label="Afslutning"
        data-chapter="Afslutning"
      >
        <Closing />
      </div>

      <Footer />
      <PageNav />
    </>
  );
}

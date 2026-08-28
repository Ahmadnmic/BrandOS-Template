import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import tokens from "../brand/tokens.json";

export type Lens = "generel" | "design" | "dev" | "hr";
// "default" is the brand's own appearance, declared in sys.theme.default.
// Lys and moerk are contrast views on top of it.
export type Theme = "light" | "dark" | "default";

export const BRAND_DEFAULT_THEME: "light" | "dark" =
  tokens.sys?.theme?.default?.$value === "dark" ? "dark" : "light";

// The brand's first language is the portal's default; "en" is offered for
// external developers and partners. Every user-facing string goes through
// tx() so the whole portal follows the switch.
export type Lang = "da" | "en";

interface LensState {
  lens: Lens;
  setLens: (l: Lens) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<LensState>({
  lens: "generel",
  setLens: () => undefined,
  theme: "default",
  setTheme: () => undefined,
  lang: "da",
  setLang: () => undefined,
});

export function useLens(): LensState {
  return useContext(Ctx);
}

// Pick the current language's variant of a string pair.
export function useTx(): (m: { da: string; en: string }) => string {
  const { lang } = useContext(Ctx);
  return (m) => (lang === "en" ? m.en : m.da);
}

function readInitialLens(): Lens {
  if (typeof window === "undefined") return "generel";
  const fromUrl = new URLSearchParams(window.location.search).get("lens");
  if (
    fromUrl === "generel" ||
    fromUrl === "design" ||
    fromUrl === "dev" ||
    fromUrl === "hr"
  )
    return fromUrl;
  try {
    const stored = localStorage.getItem("brandos-lens");
    if (
      stored === "generel" ||
      stored === "design" ||
      stored === "dev" ||
      stored === "hr"
    )
      return stored;
  } catch {
    /* storage unavailable */
  }
  return "generel";
}

function stamp(t: Theme): void {
  const resolved = t === "default" ? BRAND_DEFAULT_THEME : t;
  document.documentElement.setAttribute("data-theme", resolved);
}

export function LensProvider({ children }: { children: ReactNode }) {
  const [lens, setLensState] = useState<Lens>("generel");
  const [theme, setThemeState] = useState<Theme>("default");
  const [lang, setLangState] = useState<Lang>("da");

  useEffect(() => {
    setLensState(readInitialLens());
    let t: Theme = "default";
    try {
      const stored = localStorage.getItem("brandos-theme");
      if (stored === "light" || stored === "dark") t = stored;
    } catch {
      /* storage unavailable */
    }
    setThemeState(t);
    stamp(t);
    try {
      const l = localStorage.getItem("brandos-lang");
      if (l === "da" || l === "en") {
        setLangState(l);
        document.documentElement.lang = l;
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  function setLang(l: Lang): void {
    setLangState(l);
    document.documentElement.lang = l;
    try {
      localStorage.setItem("brandos-lang", l);
    } catch {
      /* storage unavailable */
    }
  }

  function setLens(l: Lens): void {
    setLensState(l);
    try {
      localStorage.setItem("brandos-lens", l);
    } catch {
      /* storage unavailable */
    }
  }

  function setTheme(t: Theme): void {
    setThemeState(t);
    stamp(t);
    try {
      if (t === "default") localStorage.removeItem("brandos-theme");
      else localStorage.setItem("brandos-theme", t);
    } catch {
      /* storage unavailable */
    }
  }

  return (
    <Ctx.Provider value={{ lens, setLens, theme, setTheme, lang, setLang }}>
      {children}
    </Ctx.Provider>
  );
}

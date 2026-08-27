import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Lens = "generel" | "design" | "dev" | "hr";
export type Theme = "light" | "dark" | "auto";

interface LensState {
  lens: Lens;
  setLens: (l: Lens) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<LensState>({
  lens: "generel",
  setLens: () => undefined,
  theme: "auto",
  setTheme: () => undefined,
});

export function useLens(): LensState {
  return useContext(Ctx);
}

function readInitialLens(): Lens {
  if (typeof window === "undefined") return "generel";
  const fromUrl = new URLSearchParams(window.location.search).get("lens");
  if (fromUrl === "generel" || fromUrl === "design" || fromUrl === "dev" || fromUrl === "hr") return fromUrl;
  try {
    const stored = localStorage.getItem("brandos-lens");
    if (stored === "generel" || stored === "design" || stored === "dev" || stored === "hr") return stored;
  } catch {
    /* storage unavailable */
  }
  return "generel";
}

export function LensProvider({ children }: { children: ReactNode }) {
  const [lens, setLensState] = useState<Lens>("generel");
  const [theme, setThemeState] = useState<Theme>("auto");

  useEffect(() => {
    setLensState(readInitialLens());
    try {
      const t = localStorage.getItem("brandos-theme");
      if (t === "light" || t === "dark") setThemeState(t);
    } catch {
      /* storage unavailable */
    }
  }, []);

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
    const el = document.documentElement;
    if (t === "auto") el.removeAttribute("data-theme");
    else el.setAttribute("data-theme", t);
    try {
      if (t === "auto") localStorage.removeItem("brandos-theme");
      else localStorage.setItem("brandos-theme", t);
    } catch {
      /* storage unavailable */
    }
  }

  return <Ctx.Provider value={{ lens, setLens, theme, setTheme }}>{children}</Ctx.Provider>;
}

import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { brand } from "../../../brand/brand.config";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { TopNav } from "./TopNav";
import { PageNav } from "./PageNav";
import { SearchPalette } from "./SearchPalette";

// The portal is one scrolling document: fixed scroll-spy nav on top, the
// guide as full-height pages in the middle, a page control bottom-right
// that also holds the settings gear. Detail routes (component pages, QA)
// share the same frame without the pager arrows.
export function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();
  useScrollReveal(location.pathname);

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="pt-14">{children}</main>
      <footer className="flex flex-wrap justify-between gap-2 border-t border-line px-6 py-4 md:px-10">
        <span className="label text-[9px]">NØRGÅRD MIKKELSEN · BRANDOS</span>
        <span className="label text-[9px]">{brand.tagline.toUpperCase()}</span>
      </footer>
      <PageNav />
      <SearchPalette />
    </div>
  );
}

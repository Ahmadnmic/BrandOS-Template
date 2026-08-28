export interface Chapter {
  num: string;
  slug: string;
  title: string;
  group: "Brandet" | "Identitet" | "Sprog" | "System" | "Brand data";
  gated?: boolean;
  built?: boolean;
}

export interface BrandConfig {
  name: string;
  tagline: string;
  version: string;
  updated: string;
  templateVersion: string;
  langs: string[];
  contacts: { role: string; email: string }[];
  chapters: Chapter[];
  changelog: { version: string; date: string; note: string }[];
  // Set by the figma-kit skill after it generates the brand's Figma
  // library. Absent until the kit exists; the portal's FIGMA-BIBLIOTEK
  // chips render only when it is set.
  figma?: { fileUrl: string };
}

export const brand: BrandConfig = {
  name: "Odense Basket",
  tagline: "All in. All together.",
  version: "0.1",
  updated: "2026-08-27",
  templateVersion: "0.1.0",
  langs: ["da"],
  contacts: [{ role: "Brand", email: "brand@odensebasket.dk" }],
  chapters: [
    { num: "00", slug: "", title: "Forside", group: "Brandet", built: true },
    { num: "01", slug: "brandet", title: "Brandet", group: "Brandet" },
    { num: "02", slug: "logo", title: "Logo", group: "Identitet" },
    {
      num: "03",
      slug: "farver",
      title: "Farver",
      group: "Identitet",
      built: true,
    },
    {
      num: "04",
      slug: "typografi",
      title: "Typografi",
      group: "Identitet",
      built: true,
    },
    { num: "05", slug: "grid", title: "Grid & layout", group: "Identitet" },
    { num: "06", slug: "grafik", title: "Grafik & ikoner", group: "Identitet" },
    { num: "07", slug: "billedstil", title: "Billedstil", group: "Identitet" },
    {
      num: "08",
      slug: "motion",
      title: "Motion",
      group: "Identitet",
      built: true,
    },
    { num: "09", slug: "tone", title: "Tone of voice", group: "Sprog" },
    { num: "10", slug: "anvendelse", title: "Anvendelse", group: "System" },
    {
      num: "11",
      slug: "komponenter",
      title: "Komponenter",
      group: "System",
      built: true,
    },
    {
      num: "12",
      slug: "tokens",
      title: "Tokens",
      group: "System",
      built: true,
    },
    { num: "13", slug: "assets", title: "Assets", group: "System" },
    { num: "14", slug: "ai", title: "AI", group: "System" },
    {
      num: "15",
      slug: "brand-data",
      title: "Brand data",
      group: "Brand data",
      gated: true,
    },
  ],
  figma: {
    fileUrl: "https://www.figma.com/design/UYuxd7T5NKJZLFmnOJzveJ/",
  },
  changelog: [
    {
      version: "0.1",
      date: "2026-08-27",
      note: "Fase 1 skeleton: shell, token pipeline, first chapters.",
    },
  ],
};

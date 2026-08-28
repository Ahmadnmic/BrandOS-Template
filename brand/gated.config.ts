// Gated-chapter routing, kept OUT of the client bundle. brand.config.ts
// (which the client imports) carries gated chapters with an empty slug so
// the public JS never contains a gated route string; the real slugs live
// here and are read only by build scripts and the gated build.
export const gatedSlugs: Record<string, string> = {
  "15": "brand-data",
};

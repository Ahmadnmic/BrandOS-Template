# Upstream queue

Template improvements built in the field (inside brand repos, under the
missing-machinery exception) that belong in this template. Pull them in,
adapt, delete the entry.

## From the POWER build (power.dk, 2026-08-28, branch brandos/power-dk)

- `scripts/validate.mjs`: DONE at template level (2026-08-28, after the
  LIFE ACT build also had to rewrite it): now ten checks with
  PASS / FAIL / BLOCKED semantics (writing rules, key hygiene, seed
  leak, route-aware prerender completeness, gated leak incl. bare slugs,
  print truth, licensed manifest, token-level contrast, build stamp,
  template version). Still to pull
  from the field implementations: axe/contrast/keyboard passes, token
  deprecation-alias lint, asset license expiry, application coverage.
- `scripts/build-gated.mjs` + the `BRANDOS_GATED=1` routes split: gated
  chapters as a second build grafted into `output/client/gated/`, because
  React Router's client route manifest otherwise leaks gated slugs into
  public JS chunks. Implements the gating design for real.
- `scripts/stratify.mjs`: classifies every mapped URL into a page type and
  spreads the crawl cap across all of them. Should become part of the
  fetch-site map stage.
- build-tokens namespace fix: never alias brand scale tiers into Tailwind
  theme namespaces that back utilities (`--spacing-*` hijacked
  `leading-none` to 0px; `--font-weight-*` would redefine `font-black`).
  Alias into `@theme` only when the brand scale REPLACES Tailwind's;
  otherwise keep tiers as `--sys-*` custom properties.
- Leak-scan hardening: also catch BARE gated slugs used as public hrefs,
  not only `gated/`-prefixed paths.
- Fonts are template-hardcoded in `src/root.tsx` (Public Sans had to be
  hand-removed for POWER). Font loading must move to the brand surface so
  a rebrand never edits src/.
- Windows serving note: killing an `npx serve` wrapper orphans the child
  process; find and kill the child PID (or the port holder) when
  restarting servers.

## From the LIFE ACT build (SDU Climate Cluster, 2026-08-28)

- FIXED at template level: `.display`/`.label`/`.btn-demo` were
  unlayered in app.css and silently beat every Tailwind utility
  (`label text-accent` rendered dim, `text-[9px]` rendered 11px). Now in
  `@layer components`.
- FIXED at template level: route meta titles hardcoded the seed brand;
  now derived from brand.config. Seed-leak validate check enforces the
  rest.
- Dynamic component detail routes need explicit prerender() entries; the
  build derived slugs from the component registry in
  react-router.config. When the template grows its own registry module,
  ship that wiring (import the registry, never regex the source).
- Per-brand answer skill (`.claude/skills/brand/SKILL.md` in the client
  repo) worked well as a handover artifact; consider templating it.

## From the desktop audit of all four run repos (2026-08-28)

DONE at template level in the same pass: dead `npm run intake` removed,
gated slugs split into brand/gated.config.ts with bare-slug output scan,
/theme excluded from prerender, validate report file + build-stamp +
template-version checks, GUIDE.md reconciled with reality, *.log
ignored, git-discipline/statics-first/multi-domain/capture-hardening/
extraction-gate rules in AGENTS.md.

Still to pull, in priority order:

- Elgiganten ADR-001 content architecture: brand/content/ typed modules
  (one per chapter, types.ts, mark.tsx), src/tokenValues.ts ({ref.*}
  resolver so no brand literal lives in src/), registry-derived
  component routes (brand/content/komponenter.ts + generic
  routes/komponent.tsx; 33 detail pages prerendered without a hand
  list). docs/adr/001-brand-content-modules.md IN THE ELGIGANTEN BRAND REPO documents it.
- POWER scripts: stratify.mjs (generic, type-map as config; make the
  cap a hard invariant, SDU overshot 156/150), generate-theme.mjs
  (--evidence mode binds ref to captured values; AA failure exits
  nonzero), build-gated.mjs + BRANDOS_BUILD_DIR (leak-free second
  build), build-inventory.mjs (inventory generated from evidence, feeds
  a coverage check), extract-components.mjs + extract-scales.mjs (SPA
  fallbacks: custom-element tags, inline-style mining).
- LIFE ACT validate checks to port: WCAG AA contrast pairs, token lint
  (hex-in-src must exist in tokens), CVI-rule coverage, component
  coverage, voice lint, font-licence scan (closed-font pattern list
  from config, not hardcoded); add a brand-extension hook
  (brand/validate.checks.mjs) so builds extend without forking.
- SDU intake scripts: capture-cvi.mjs (validate-before-write, magic
  bytes, resume), color-evidence.mjs + idiom.mjs (evidence ladder tier
  1 automated with vendor exclusion), scaffold-inventory.mjs
  (status-preserving inventory generation), deep-pass.mjs (fast/deep
  runner; fold into a future scripts/intake.mjs).
- build-ai.mjs should emit the per-brand answer skill
  (.claude/skills/brand/SKILL.md) from brand.config + cvi-rules.
- Pick one canonical evidence home (intake/crawl/_meta/) and write all
  evidence artifacts there.

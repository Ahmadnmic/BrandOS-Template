# Upstream queue

Template improvements built in the field (inside brand repos, under the
missing-machinery exception) that belong in this template. Pull them in,
adapt, delete the entry.

## From the POWER build (power.dk, 2026-08-28, branch brandos/power-dk)

- `scripts/validate.mjs`: nine checks with PASS / FAIL / BLOCKED semantics.
  BLOCKED (input missing, e.g. no CVI) is reported and never counts as a
  pass. This is the reference implementation of recipe step 5.
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

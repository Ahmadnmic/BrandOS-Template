# Field log

Every problem found and every fix landed, in order. One line of context,
what went wrong, what changed because of it. Newest at the bottom.

## Elgiganten run (2026-08-27, first real build)

- Firecrawl credits exhausted mid-run: 500/500 pages billed through
  Firecrawl with no preflight. Fix: credit preflight before every paid
  batch, hybrid scrape (direct-first, escalate only JS shells), local
  captures never re-billed, 150-page cap with mandatory stratified
  sampling.
- Meta-tag evidence mis-weighted: theme-color counted across 500 pages
  drove a wrong navy, reversed only after the CSS backfill. Fix: the
  evidence quality ladder (painted values first, meta tags last) and the
  statics-first crawl rule.
- The build invented the brand/content module architecture (ADR-001)
  and registry-driven component routes; queued for upstreaming.
- The whole v1.2 build sat uncommitted on its branch. Fix (later): git
  discipline rule with milestone commits, build-stamp check in validate.

## POWER run (2026-08-28, no-CVI build)

- Firecrawl key pasted into a tracked file by mistake. Fix: key-pattern
  scan of tracked files at Q0 and before every commit, rotation
  recommended whenever a key touches a tracked file.
- A second capture dir (crawl-b2b) nearly got committed because the
  gitignore enumerated folder names. Fix: `intake/*` with explicit
  un-ignores.
- The template lacked validate, stratify and gating machinery; the run
  wrote its own (BLOCKED semantics, build-gated second build,
  stratify.mjs). Fix: missing-machinery exception with mandatory
  "Template drift" handover section, docs/UPSTREAM.md queue.
- AGENTS.md said "do not proceed without the CVI" while the GUIDE
  allowed site-only. Fix: NO-CVI MODE codified (UDKAST stamp, BLOCKED
  checks, no-data-no-section).
- Tailwind namespace collision: brand spacing aliased into --spacing-*
  hijacked leading-none. Queued as a build-tokens rule.
- The portal narrated its own making. Fix: THE GUIDE SPEAKS AS THE
  BRAND rule; provenance lives in the audit trail only.

## Template work between runs (2026-08-28)

- Guide read as an AI report with FASE 2 labels and recipe breadcrumbs.
  Fix: THE GUIDE IS USAGE, NOT INVENTORY; GØR/UNDGÅ rules component;
  unbuilt content is absent, never announced.
- Sidebar layout replaced with the document-scroll structure from the
  Molslinjen reference (kept in docs/reference as a structural
  reference, never a template).
- Ctrl+F search palette added (DOM-indexed, Spotlight-style); /help
  documentation lives inside it.
- Live CVI mode: web-hosted guides captured with the same pipeline into
  intake/cvi-site as guide-grade truth.
- Licensed material intake: intake/licensed/ offered at build start,
  LICENSES.md manifest enforced by validate.
- Figma design handover: figma-kit skill generates the brand's Figma
  library from tokens.json; proof kit generated for the Odense seed.
  Field lessons encoded: planKey rejection, account mismatch,
  Starter-tier caps (1 mode, 3 pages, MCP rate limit).

## LIFE ACT run (2026-08-28, SDU Climate Cluster)

- Unlayered .display/.label CSS silently beat every Tailwind utility:
  chips rendered dim instead of accent, size utilities dead. Fix:
  @layer components in the template, confirmed live before and after.
- Seed content leaked into the client build (Odense Basket strings in
  meta titles and demo routes). Fix: chrome derives brand strings from
  brand.config; seed-leak check in validate; seed-replacement rule.
- prerender:true shipped 3 pages next to a 16-component registry. Fix:
  registry-driven prerender contract + prerender completeness check.
- npm run validate was a stub; second run in a row wrote the gate from
  scratch. Fix: real scripts/validate.mjs in the template with
  PASS/FAIL/BLOCKED.
- The run correctly refused to invent Pantone values (BLOCKED, not
  converted from hex) and pushed back with evidence when the build's
  ownership was questioned (SDU vs LIFE ACT).

## Desktop audit of all four run repos (2026-08-28)

- Dead `npm run intake` script advertised in every repo. Fix: removed.
- Gated chapter slug shipped in the public JS bundle via brand.config
  in all builds; the leak scan only matched href-shaped strings. Fix:
  gated slugs split into brand/gated.config.ts (never bundled), empty
  slug in the public config, bare-slug scan over output JS.
- /theme QA page prerendered into client deliverables while the GUIDE
  called it hidden. Fix: excluded from prerender, GUIDE corrected.
- GUIDE promised npm run release, upgrade-template and full validate
  coverage that did not exist. Fix: reconciled with reality, roadmap
  marked as roadmap.
- No validate run left evidence anywhere. Fix: the gate writes
  docs/validate-report.md with commit hash on every run.
- Stale clones cannot tell they are stale. Fix: templateVersion bumped
  to 0.2.0 and checked by the gate.
- Two builds sat entirely uncommitted. Fix: git-discipline rule,
  build-stamp check.
- SDU capture corrupted by a throttling host answering 200 with a
  challenge page. Fix: capture-hardening rule (validate before write,
  magic bytes, resume) and the reconciliation extraction gate.
- Large machinery (content architecture, stratify, generate-theme,
  build-gated, extra validate checks, evidence scripts) inventoried in
  docs/UPSTREAM.md with priorities.

## Portal features added on request (2026-08-28)

- Theme control is now STANDARD · LYS · MØRK: standard resolves to the
  brand's own appearance (sys.theme.default in tokens), lys and mørk
  are contrast views.
- Language layer: Danish default, English switch in settings for
  external developers; chrome, documentation and seed content all
  follow.
- /help in the search palette opens the portal documentation, written
  as human text in both languages.
- The seed component library grew to Knap, Badge, Felt and Banner, each
  with live preview, code popup and downloadable source.
- Browser verification loop made mandatory (AGENTS step 6.7): after
  every build the agent drives the served portal, checks pages,
  console, fonts, themes, language, lenses, search, pager, downloads
  and components, and fixes-and-rebuilds until clean.
- Cost gate added: Firecrawl credits and AI tokens estimated after
  mapping, one continue question before any paid work.
- Contrast gate (the Terrazzo idea, implemented natively): six sys
  text/surface pairs checked at AA 4.5:1 in both modes, at token level.
  The seed theme passes 12/12.
- /brandos-update command: pulls the latest template from GitHub into a
  brand repo with a strict ownership map (template-owned overlaid,
  brand-owned untouched, conflicts diffed), then gate + browser loop.
- Search made site-wide: the palette indexes the live page plus every
  other route's HTML (routes discovered from the document's own links),
  and cross-page hits navigate and flash on arrival.
- agnix evaluated for the local gate: its native-binary spawn is
  blocked in sandboxed runs, so it belongs in CI (agnix-action), noted
  in TOOLS.md.
- docs/TOOLS.md: credits and build-vs-use reasoning for every adopted
  or recommended tool.

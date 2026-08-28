# Field snapshots

Filtered local copies of every test-run repo, kept here for reference
and dev archaeology. LOCAL ONLY: everything except this index is
gitignored, because the snapshots hold client brand material that does
not belong in the public template repo.

What each snapshot keeps: source and machinery drift (src/, scripts/,
.claude/skills/), configs and tokens, the intake audit trail
(reconciliation.md, cvi-rules.json, inventories, _meta strata and
credit records, capture logs), docs and handover files, plus a
GIT-SNAPSHOT.txt with branch, status and the last 50 commits. What it
drops: node_modules, .git, built output, bulk captures (pages, assets,
components), all binaries, anything over 300 KB, and .env files. Every
copied file was scanned for key patterns before landing here.

## The runs

- **elgiganten/** (2026-08-27): the first real build. 500-page
  full-Firecrawl crawl that exhausted credits mid-run and taught the
  hybrid scrape, the 150-cap and stratification. Invented the ADR-001
  content-module architecture and registry-driven component routes
  (queued in docs/UPSTREAM.md).
- **power/** (2026-08-28): the no-CVI build. Wrote the reference
  validate (BLOCKED semantics), build-gated second build, stratify and
  the credit preflight. Its _evidence logs show the preflight working
  (~161 credits across two 30k-URL maps).
- **lifeact-sdu/** (2026-08-28): the LIFE ACT / SDU Climate Cluster
  build from a design manual plus crawl. Found the CSS layering bug and
  the prerender SPA-shell trap; its validate rewrite and generate-theme
  are upstream candidates.
- **sdu-intake/** (2026-08-28): the SDU intake that stopped mid-flight.
  Its _meta scripts (stratify, deep-pass, color-evidence, idiom,
  capture-cvi with magic-byte validation) are the intake machinery
  queued for the template; its capture logs document the
  200-with-challenge throttling failure mode.

Lessons distilled from all four live in docs/FIELD-LOG.md; machinery
worth pulling is inventoried in docs/UPSTREAM.md. When a snapshot has
served its purpose (everything pulled or superseded), delete it and
strike it here.

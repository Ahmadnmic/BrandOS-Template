---
name: brandos
description: Start a full BrandOS build for a new client brand. Use when the user types /brandos [site-url], says "rebuild for <brand>", "new brand", "start brandos", or hands over a client site to turn into a brand portal. Orchestrates intake (site capture via fetch-site), CVI handover, theme generation, chapter authoring, validation and build.
---

# /brandos — start a Brand OS build

You have been asked to build a Brand OS for a new client brand. `$ARGUMENTS`
may contain the client's landing-site URL. Follow this orchestration exactly.
The full contract lives in `AGENTS.md` at the repo root — read it before
starting and obey its hard rules throughout.

**Doctrine (overrides everything): when you are not 100% sure about any brand
fact or decision — a color value, a rule interpretation, which logo variant is
primary, whether a conflict matters — STOP and ask the user. Questions are
cheap; wrong brand facts are not. Never invent a value found in neither
intake input.**

## Flow

### 0. Preflight
- Read `AGENTS.md` (root). Confirm you are in build mode, not read mode.
- Check `.env` for `FIRECRAWL_API_KEY`.
  - Missing → ask: "Paste your Firecrawl API key (fc-…) — I'll store it in
    `.env`, which is gitignored. (Static/SSR sites can run keyless in direct
    mode — say 'direct' to skip.)"
  - Write the key to `.env` yourself as `FIRECRAWL_API_KEY=…`.
  - Key hygiene, non-negotiable: the key lives ONLY in `.env`. Never echo it,
    never commit it, never place it anywhere else. Verify `.env` is untracked
    before any commit.

### 1. Q1 — the site
- If `$ARGUMENTS` contains a URL, use it. Otherwise ask exactly:
  "What is the client's site URL?"
- Run the bundled **fetch-site** skill (`.claude/skills/fetch-site/`) against
  that URL with output directed to `intake/crawl/` and `--max-pages 500`
  (default cap — a sufficient sample; raise only if the user asks). Follow
  that skill's own SKILL.md for the other flags (`--url`, `--out`,
  `--asset-hosts`, `--direct`). All seven stages: map → scrape → assets → components → brand →
  offline rewrite → AI index.
- When it completes, scaffold `intake/components-inventory.md` from
  `intake/crawl/components.json`: one row per component (name, source pages,
  status: to-rebuild).
- Report a one-paragraph capture summary (pages, assets, components found).

### 2. Q2 — the CVI
- Ask exactly: "Hand me the CVI / brand guide (PDF, deck or files) — I'll put
  it in `intake/cvi/`." Wait for it. Do not proceed without it.

### 3. Build autonomously
From here, run the `AGENTS.md` rebuild recipe steps 1–6 without further
questions, with exactly two exceptions:
- a **reconciliation conflict** (crawl vs CVI disagree) → write it to
  `intake/reconciliation.md` and ask for a decision;
- the **not-100%-sure doctrine** above.

Order: extract & reconcile (incl. typesetting idiom → composition profile,
and print truth PMS/CMYK from the CVI) → generate theme (seeds + personality
profile; confirm the profile with the user before generating) → bind identity
→ author chapters (every inventoried component rebuilt; every CVI rule
homed) → `npm run validate` until green → build & report.

### 4. Hand over
Finish with: what was built, the reconciliation decisions made, validation
results, and the preview/build location. Never claim green checks you did not
run.

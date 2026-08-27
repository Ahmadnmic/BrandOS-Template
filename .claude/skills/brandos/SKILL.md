---
name: brandos
description: Start a full BrandOS build for a new client brand. Use when the user types /brandos [site-url], says "rebuild for <brand>", "new brand", "start brandos", or hands over a client site to turn into a brand portal. Orchestrates intake (site capture via fetch-site), CVI handover, theme generation, chapter authoring, validation and build.
---

# /brandos, start a Brand OS build

You have been asked to build a Brand OS for a new client brand. `$ARGUMENTS`
may contain the client's landing-site URL. Follow this orchestration exactly.
The full contract lives in `AGENTS.md` at the repo root, read it before
starting and obey its hard rules throughout.

**Doctrine (overrides everything): when you are not 100% sure about any brand
fact or decision, a color value, a rule interpretation, which logo variant is
primary, whether a conflict matters, STOP and ask the user. Questions are
cheap; wrong brand facts are not. Never invent a value found in neither
intake input.**

## Flow

### 0. Preflight

- Read `AGENTS.md` (root). Confirm you are in build mode, not read mode.
- Confirm the session is rooted in this repo (AGENTS.md and this skill must
  be at the root). If the user opened a parent folder, tell them to restart
  the agent from inside the repo before continuing.
- If `node_modules/` is missing, run `npm install` before anything else.
- Check that `.env` exists and contains `FIRECRAWL_API_KEY`.
  - Missing → say: "Copy `.env.example` to `.env` and paste your Firecrawl
    key into it yourself (`FIRECRAWL_API_KEY=fc-…`), then tell me 'done'.
    (Static/SSR sites can run keyless in direct mode, say 'direct' to
    skip.)"
  - NEVER ask for the key in chat, never echo it, never export it on a
    shell command line (shell commands are logged), the fetch-site scripts
    load `.env` themselves. You only verify the file exists. Verify `.env`
    is untracked before any commit.

### 1. Q1, the site

- If `$ARGUMENTS` contains a URL, use it. Otherwise ask exactly:
  "What is the client's site URL?"
- Run the bundled **fetch-site** skill (`.claude/skills/fetch-site/`) against
  that URL with output directed to `intake/crawl/` and `--max-pages 150`
  (default cap; raise only if the user asks). Stratification is mandatory
  every time: the 150 must cover every page type the site has (recover the
  structure from its HTML sitemap and hub navs first), never 150 of one
  type. Follow
  that skill's own SKILL.md for the other flags (`--url`, `--out`,
  `--asset-hosts`, `--direct`). All seven stages: map → scrape → assets → components → brand →
  offline rewrite → AI index.
- When it completes, scaffold `intake/components-inventory.md` from
  `intake/crawl/components.json`: one row per component (name, source pages,
  status: to-rebuild).
- Report a one-paragraph capture summary (pages, assets, components found).

### 2. Q2, the CVI

- Ask exactly: "Hand me the CVI / brand guide (PDF, deck or files), I'll put
  it in `intake/cvi/`." Wait for it. Do not proceed without it.

### 3. Build autonomously

From here, run the `AGENTS.md` rebuild recipe steps 1-6 without further
questions, with exactly three exceptions:

- a **reconciliation conflict** (crawl vs CVI disagree) → write it to
  `intake/reconciliation.md` and ask for a decision;
- the **not-100%-sure doctrine** above;
- the **one-time personality-profile confirmation** before theme generation.

Order: extract & reconcile (incl. typesetting idiom → composition profile,
and print truth PMS/CMYK from the CVI) → generate theme (seeds + personality
profile; confirm the profile with the user before generating) → bind identity
→ author chapters (every inventoried component rebuilt; every CVI rule
homed, ADDING new chapters for CVI sections the 16-chapter map doesn't
cover) → `npm run validate` until green → build & report.

### 4. Hand over

Finish with: what was built, the reconciliation decisions made, validation
results, and the preview/build location. Never claim green checks you did not
run.

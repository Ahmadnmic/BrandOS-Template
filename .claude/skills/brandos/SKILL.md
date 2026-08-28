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

- With Q1, offer the licensed drop (never wait for it): "If the brand
  has licensed material (bought fonts, image packs, purchased
  templates), drop it into `intake/licensed/` any time before step 3
  and give each item a line in `intake/licensed/LICENSES.md`."
  Scaffold the folder and the manifest header when offering:
  `| Item | Licensor | License | Scope | Udløber |`. Licensed binaries
  never get committed; the manifest does (audit trail). Validate's
  licensed-manifest check enforces one line per dropped file.
- If `$ARGUMENTS` contains a URL, use it. Otherwise ask exactly:
  "What is the client's site URL?"
- COST GATE: after the map and strata plan, before any paid batch,
  present the estimate and wait for one yes: Firecrawl (remaining
  credits, planned pages per pass, best case ~1-5 credits for SSR sites
  via the hybrid, worst case fast+deep fully escalated) and AI tokens
  (model + effort, observed 2-4M for a fast-pass build, 6-12M full).
  Ask "fortsæt?", then run without asking again unless the estimate
  grows past what was approved. Record actual spend in the handover.
- Run the bundled **fetch-site** skill (`.claude/skills/fetch-site/`) against
  that URL with output directed to `intake/crawl/`, in TWO stages per
  AGENTS.md Q1: first the blocking FAST PASS (one page per discovered page
  type, ~15-25 pages, full extraction on the subset → provisional
  inventory), then, after it finishes, the background DEEP PASS
  (`--max-pages 150`, stratified across all page types, never 150 of one
  type). Build starts on the fast pass; the deep pass is the verification
  backstop consumed in recipe step 6. Follow
  that skill's own SKILL.md for the other flags (`--url`, `--out`,
  `--asset-hosts`, `--direct`). All seven stages: map → scrape → assets → components → brand →
  offline rewrite → AI index.
- When it completes, scaffold `intake/components-inventory.md` from
  `intake/crawl/components.json`: one row per component (name, source pages,
  status: to-rebuild).
- Report a one-paragraph capture summary (pages, assets, components found).

### 2. Q2, the CVI

- Ask exactly: "Hand me the CVI / brand guide: PDF, deck or files (I'll
  put them in `intake/cvi/`), or the URL if the guide lives on the web."
  Wait for it. A URL means LIVE CVI MODE: capture the guide site with
  fetch-site into `intake/cvi-site/` (`--max-pages 60`, one blocking
  pass, Firecrawl hybrid; see AGENTS.md Q2). Do not proceed without one
  of the two, except explicit no-CVI mode.

### 3. Build autonomously

From here, run the `AGENTS.md` rebuild recipe steps 1-7 without further
questions, with exactly four exceptions:

- a **reconciliation conflict** (crawl vs CVI disagree) → write it to
  `intake/reconciliation.md` and ask for a decision;
- the **not-100%-sure doctrine** above;
- the **one-time personality-profile confirmation** before theme generation;
- the **cost gate**, re-presented only if the estimate grows past what
  the user approved.

Execute via AGENTS.md's "Parallel build plan": if your harness supports
subagents, fan out one subagent per unit (each SCOPED to ~10 minutes, but
with no timeout: a unit takes the time it takes, never abort or rush one
for running long) exactly as the plan's waves specify; otherwise run the
same units in order. Never let two units write the same file; you own the
shared files and the merge.

Order: extract & reconcile (two parallel extractors: crawl analysis + CVI
parsing; then human reconciliation; incl. typesetting idiom → composition
profile, and print truth PMS/CMYK from the CVI) → generate theme (seeds +
personality profile; confirm the profile with the user before generating) →
bind identity
→ author chapters (every inventoried component rebuilt; every CVI rule
homed, ADDING new chapters for CVI sections the 16-chapter map doesn't
cover) → `npm run validate` until green → build, stamped "foreløbig" →
when the background deep pass completes: deep verification (recipe step 6:
diff, add missed components, reconcile at-scale token evidence, re-validate
against the full inventory, update the stamp) → design handover: when the
Figma MCP is authenticated, run the `figma-kit` skill (recipe step 6.5) to
generate the brand's Figma library from tokens.json and light the
FIGMA-BIBLIOTEK chips; no auth → skip cleanly and say so in the handover →
report.

### 4. Auto-build, open, hand over

When validate is green, DO NOT stop at a report. Automatically:

1. `npm run build` (the portal lands in `output/`).
2. Serve it in the background: `npm run preview` (serves `output/client`).
3. RUN THE BROWSER VERIFICATION LOOP (AGENTS.md step 6.7): drive the
   served portal in the browser, check every item on the checklist
   (pages, console, fonts, theme states, language, lenses, search,
   pager, downloads, components), and when a check fails, fix the
   source, rebuild and re-verify. Loop until clean. This is automatic:
   never hand a broken check to the user to find.
4. OPEN it for the user without being asked: in Claude Code use the
   browser/preview pane and front the tab; in a plain terminal harness use
   the OS opener (`open <url>` on macOS, `start <url>` on Windows,
   `xdg-open <url>` on Linux). Always print the exact URL too.

Then hand over: what was built, the reconciliation decisions made,
validation results, and the URL now open in front of the user. Never claim
green checks you did not run.

Serving rules: BEFORE starting or reporting any dev server, confirm the
repo you are serving is the client's build (check the `name` in
brand.config.ts), not the template or another brand on the same machine.
Run servers in the background and read their log file; never pipe a
long-running server through `head`/`tail` in the foreground, the closed
pipe kills the process.

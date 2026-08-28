# BrandOS Template

One brand system. Two audiences: people and AI.

BrandOS is a template for **living brand portals**: CVI, brand guide,
component library and code handoff in one static React site, with the
rebuild instructions for AI built into the repo. Every new client brand is a
token swap and a content pass, not a new build: hand an agent a site URL and
the official design guide, get back a validated portal in the brand's own
design language.

Built by Nørgård Mikkelsen. For clients' internal and external use, a
working tool, not a marketing site.

**Two inputs. Two questions. One validated Brand OS.**

## Install & build

Works with Claude Code, Codex, Cursor, Copilot, Gemini CLI, anything that
reads `AGENTS.md`. The agent asks two questions (site URL, then the CVI) and
builds the rest itself, stopping only when it isn't 100% sure.

### Claude Code

```bash
git clone https://github.com/Ahmadnmic/BrandOS-Template.git brandos-client
cd brandos-client
npm install
claude
```

Then type:

```
/brandos https://client.dk
```

Two setup rules that trip people up: start the agent **from inside the
cloned folder** (if the session is rooted one level up, `/brandos` and the
repo's AGENTS.md never register), and run `npm install` before the first
build (the agent will do it for you if you forget, but it's faster up
front).

### Codex CLI (and other agents)

```bash
git clone https://github.com/Ahmadnmic/BrandOS-Template.git brandos-client
cd brandos-client
npm install
codex
```

Then paste:

```
Read AGENTS.md and start a Brand OS build for https://client.dk.
Ask me for anything you need, never guess a brand fact.
```

### One-shot prompts

Paste into any agent, from an empty folder, it downloads the system and
starts the build itself:

```
Clone https://github.com/Ahmadnmic/BrandOS-Template.git into ./brandos-client
and open it. Read AGENTS.md, then start a Brand OS build for
https://client.dk. I'll hand you the CVI / brand guide when you ask, and my
Firecrawl API key if you need it (store it only in .env). Ask me whenever
you are not 100% sure, never guess.
```

Already inside a cloned repo:

```
Read AGENTS.md. Rebuild for https://client.dk.
```

Using a finished portal as brand context (any AI tool, no repo needed):

```
Before producing anything for this brand, fetch <portal-url>/llms.txt and
follow it. Colors and typography only from tokens.json; tone from voice.md;
templates per their .instructions.md files.
```

### Recommended model

BrandOS builds are long, judgment-heavy agent runs (extraction, reconciliation,
theme generation, 16+ chapters). Use a frontier model with real reasoning
headroom:

- **Claude:** Opus 5 (or Fable 5) with thinking set to **medium or higher**.
- **Codex:** **GPT-5.6 Sol** (the flagship reasoning tier), or GPT-5.6 Terra
  with reasoning set to high as the budget option.

Smaller/faster tiers produce plausible-but-wrong brand facts, exactly what
the validate gate exists to catch, so start with the strong model instead of
paying for the retries.

Tested on: Claude Code with Haiku 4.5, Sonnet 5 (low, medium, high and
ultracode), Opus 5 (medium, high and ultracode) and Fable 5 (ultracode),
plus Cursor Pro.

### By hand

1. Clone, then copy `.env.example` to `.env` and paste your Firecrawl API
   key (optional, static/SSR sites work keyless in direct mode). The key
   never leaves `.env`. Note for macOS: dotfiles are hidden in Finder and
   plain `ls`, so `.env.example` looks missing when it isn't. Use
   `cp .env.example .env` in Terminal (or `Cmd+Shift+.` in Finder to show
   hidden files).
2. `/brandos https://client.dk` (or "rebuild for a new brand").
3. Hand over the CVI when asked; decide any reconciliation conflicts the
   agent surfaces. Done.

### Updating an existing brand portal

`/brandos-update` in the brand repo pulls the latest template from this
GitHub repository and applies it automatically, in two passes. First
the overlay: template-owned machinery (scripts, shell, guide
components, skills, the contract) is replaced with the latest;
everything brand-owned (tokens, chapters, sections, intake, the
per-brand skill) is left alone, and conflict-prone files are merged
with their diffs shown. Then the migration: the agent reads the
template's [docs/MIGRATIONS.md](docs/MIGRATIONS.md) and rewrites the
brand's own config, sections and routes to the new APIs, so new
functions actually reach the portal (new theme states, the language
layer, site-wide search) and changed or removed ones are replaced. It
never invents brand content: anything needing new content (like
translations) gets the documented fallback and a list in the handover.
The full gate plus the browser verification loop run before anything
is committed. `npm run validate` tells you when a repo is behind the
template. In Codex, say "run the brandos-update skill".

The template's own skills follow the open Agent Skills layout, so a
client team can pull them into any agent with
`npx skills add Ahmadnmic/BrandOS-Template`.

Full operator walkthrough: [docs/GUIDE.md](docs/GUIDE.md). The open
tools the template builds on, with credits and the build-vs-use
reasoning: [docs/TOOLS.md](docs/TOOLS.md).

## How a build actually works

What happens between `/brandos https://client.dk` and a finished portal,
step by step. The full contract is `AGENTS.md`; this is the tour.

### 0. Preflight

The agent confirms it is rooted in the repo, installs dependencies if
`node_modules/` is missing, and checks `.env` for a Firecrawl key. If the
key is missing it asks you to add it yourself (the key never passes through
the agent or the chat; the scripts read `.env` directly). Static and
server-rendered sites work without any key.

### 1. Capture the site (question 1: the URL)

The bundled **fetch-site** engine runs in two stages:

- **Fast pass (blocking, minutes).** It maps the site (sitemap.xml,
  robots.txt sitemaps, Firecrawl deep map), recovers the real structure
  from the site's own HTML sitemap and hub-page navigation, enumerates the
  **page types** (home, hubs, listings, products, customer service,
  magazine, corporate, stores, campaigns, brand pages, B2B, ...), then
  captures ONE representative page per type. Assets, components and brand
  data are extracted from that subset immediately. The build starts here.
- **Deep pass (background).** After the fast pass, a stratified crawl of up
  to 150 pages runs behind the build, every page type represented in
  proportion, never 150 of one kind. It becomes the verification set later.

Scraping is **credit-optimized hybrid**: pages already captured are never
re-fetched, everything gets a free plain-HTTP fetch first, and only pages
that prove they need JavaScript rendering are billed through Firecrawl.
Dead URLs are never escalated. An SSR site costs about 1 credit total.

What the capture extracts:

- **Components as they really exist**: the site's own CSS component
  boundaries (or semantic sections on ordinary sites) with real rendered
  HTML per component, deduplicated by DOM structure. This becomes
  `components-inventory.md`: the checklist every one of them must be
  rebuilt against.
- **De facto brand data**: every CSS custom property, font-face, color
  with usage counts, logos and header SVGs. This is what the brand
  _actually does_, as data.
- **All assets at full resolution**: images (including lazy-loaded and
  srcset variants, CDN resize parameters stripped), fonts, self-hosted
  video, poster frames; platform video embeds are indexed, not ripped.
- **The typesetting idiom**: alignment, whether the brand boxes content or
  works in rules and whitespace, corner language, density, image framing.
  This feeds the composition profile that decides what the portal itself
  looks like.
- **The copy corpus** for voice analysis, and the site's information
  architecture.

### 2. Hand over the CVI (question 2)

The official design guide goes into `intake/cvi/` (PDF, deck or files).
A guide that lives on the web (a designguide subdomain, Frontify,
Corebook, Brandpad) is captured instead: hand over its URL and the same
Firecrawl-backed pipeline mirrors it into `intake/cvi-site/` as its own
corpus, with the guide's shipped stylesheets, font files and
downloadable brand packs treated as guide-grade truth.
The agent extracts the official rules: palette with print values (PMS,
CMYK, RAL), typefaces and licenses, logo construction and clearspace, tone
of voice. Every rule is written into `cvi-rules.json` with an ID and its
assigned chapter, so coverage is checked mechanically later, not
self-assessed.

### 3. Reconcile the two sources

The site is evidence of reality; the CVI is the official rules. Where they
disagree (the site uses a blue the guide doesn't contain, the guide
mandates a font the site never loads), the agent weighs the evidence and
asks you, per element: "should I use this from the site or from the
guide?", showing both values and the evidence for each. Only with
overwhelming evidence one way does it decide itself. Every conflict, the
evidence and who decided is committed to `intake/reconciliation.md`. No
value in the finished portal may come from anywhere but these two inputs
or the theme generator.

### 4. Generate the theme

From the reconciled seed colors and a **personality profile** on six axes
(skarp/blød, tæt/luftig, teknisk/menneskelig, rolig/kinetisk, rå/poleret,
bokset/åben), confirmed with you once, the generator produces the complete
token system in `brand/tokens.json` (W3C DTCG format):

- **Color**: full light and dark contexts derived through Material's HCT
  engine so every generated pairing passes WCAG AA by construction, with
  the CVI's print values attached to each core color.
- **Everything else a design language is**: radius scale, spacing density,
  letter casing and tracking, border weight versus shadow depth, a full
  motion set (four easings, four durations, distances), and the
  composition profile (boxed, ruled or open containment).

One generated `tokens.css` feeds Tailwind and the runtime custom
properties, so the entire portal, every component and every code sample
re-skins itself from this single file. A hidden `/theme` route renders
every token and state as the QA surface.

### 5. Author the sixteen chapters (in parallel)

Once the theme is locked, the chapters are independent, so the agent fans
out **subagents**, one per unit scoped to roughly ten minutes of work (a
sizing guideline, not a timeout; a unit takes the time it takes):
strategy, logo, color+tokens, type+grid, graphics+motion, imagery, voice,
applications, the Office pack, the SoMe masters, and the component
inventory split into batches of at most four components each. Each subagent
owns only its own files, returns its open questions instead of guessing,
and the main agent merges, batches questions to you, and registers the
chapters. (Harnesses without subagents run the same units in order; the
plan lives in AGENTS.md.)

One section module per chapter (src/sections/, registered in the index
route), each following the same skeleton: Princip →
Regler (exact values, never adjectives) → Eksempler → Misbrug (wrong usage
quoted verbatim) → Downloads. The chapter map is a floor, not a ceiling:
a CVI section with no home gets a new chapter; a chapter the guide lacks
is built only when the intake data supports it, labeled as derived and
pending sign-off. Every component from the inventory is rebuilt with the
four-tab contract (Anvendelse / Specs / Kode / Tilgængelighed). Every
marketing application ships its native program templates (.potx, .dotx,
Figma+PSD, .idml, HTML mail), a generated in-situ mockup, and an embedded
`{name}.instructions.md` telling any AI how to fill it. All copy follows
the brand's voice, with AI-tell phrases banned.

### 6. Validate

`npm run validate` is the gate, and "on-brand" is a test, not an opinion:
WCAG 2.2 AA (contrast plus axe and keyboard passes over the prerendered
output), token lint (no raw hex outside tokens.json, no exported token
name disappears without a deprecation alias), print truth on every core
color, asset license and expiry checks, application coverage (every
scenario backed by a template, its instructions and a mockup), a
gated-content leak scan over every public file, and full coverage against
the component inventory and the CVI rule map. Red means fix, not ship.

### 6.5 Design handover: the generated Figma library

When a Figma MCP is connected, the build ends with a real Figma library,
generated from the same source as everything else. The `figma-kit` skill
reads `brand/tokens.json` and creates variable collections in Figma (Ref
primitives plus Sys roles with the brand's light/dark themes as native
Figma modes, correct scopes, and `var(--sys-*)` code syntax matching the
shipped CSS), text styles, foundation pages, and one component per
inventory entry with every fill, stroke and radius bound to those
variables. The file URL lands in `brand.config.ts`, which lights the
FIGMA-BIBLIOTEK links in the portal. One direction only: designers get a
kit that mirrors production, and edits made in Figma count as drift to
flag, never silently merged back. Without Figma auth the step skips
cleanly and the handover says so; the build never blocks on it.

### 7. Build and verify deep

`npm run build` prerenders every chapter into `output/`: a light,
few-file static React site (instant first paint, hydrates into the full
app) that carries its own machine layer: `llms.txt`, `tokens.json`, an
`AGENTS.md` with rules for any AI that edits the deployed portal, and an
append-only `changes.json` journal so post-deploy agent edits stay
readable. The portal is stamped **provisional** until the background deep
crawl is diffed against it: missed components get added, at-scale evidence
gets reconciled, validate re-runs against the full inventory, and the
stamp becomes "verificeret på N sider". Then it ships. And the agent does
not stop at a report: when validate is green it builds, serves and opens
the portal in your browser by itself; the build is done when the portal is
on your screen.

## The logic

Every design decision in BrandOS follows from a handful of rules:

1. **One source, two audiences.** A brand now serves people and AI. Both are
   fed from the same `brand/` + `content/` source at build time, so the
   human guide and the machine layer can never drift apart.
2. **Two inputs, everything else derived.** The live site is _evidence of
   reality_ (the components actually in production, the values actually
   used, the real voice). The CVI is _the official rules_. A build needs
   exactly these two; no value may come from anywhere else.
3. **Capture in two stages.** A fast pass scrapes one page per page type
   (minutes) so the build starts immediately; the deep stratified crawl
   (150 pages, every page type represented, never 150 of one kind) runs in
   the background as the verification backstop. The portal is stamped
   provisional until it has been verified against the deep set.
4. **Conflicts are decided by evidence, recorded forever.** When site and
   guide disagree, the builder is shown both values and chooses. The agent
   decides alone only on overwhelming evidence. Every conflict, the
   evidence and who decided lands in a committed audit trail.
5. **The theme is a design language, not a color swap.** A personality
   profile drives radius, density, casing, motion, borders and composition
   alongside color and type. Layout idiom is read from the brand's own
   material; the generic AI look (rounded card grids, centered heroes,
   uniform radius) is banned outright.
6. **The chapter map is a floor, not a ceiling.** A CVI section with no
   home gets a new chapter. The inverse holds too: a missing standard
   chapter is built only when the intake data supports it. No data, no
   section, never speculation.
7. **One content, four lenses.** Generel, Design, Dev and HR re-weight what
   is zero clicks away versus one click away. Nothing is hidden, nothing is
   forked, so audience versions cannot drift.
8. **On-brand is a test, not an opinion.** Rules are exact values, never
   adjectives. Styling flows only through tokens. `npm run validate` checks
   contrast and accessibility, print truth, coverage (every crawled
   component rebuilt, every CVI rule homed, every application backed by a
   template and mockup) and scans for gated-content leaks.
9. **The output governs its own future.** The built portal ships its own
   AGENTS.md (rules for any AI that edits it after deploy) and an
   append-only `changes.json` journal, so what one agent changes, the next
   agent reads.
10. **Ask when not 100% sure.** Questions are cheap. Wrong brand facts are
    not.

## What a finished portal contains

- **16 chapters** across four layers, Brandet (journey + platform),
  Identitet (logo, farver, typografi, grid, grafik, billedstil, motion),
  Sprog (tone of voice with a per-channel matrix), System (komponenter,
  tokens, anvendelse, assets, AI) and Brand Data (gated).
- **A generated global design language**, not a color swap. A personality
  profile (skarp/blød, tæt/luftig, teknisk/menneskelig, rolig/kinetisk,
  rå/poleret, bokset/åben) drives radius, density, casing, motion, borders
  and composition. Layout idiom is read from the brand's own material,
  never the generic "AI look".
- **One scrolling document**, the way the best printed guides read: every
  chapter part is a full-height page, a scroll-spy top nav names where you
  are, and a bottom-right pager flips page by page (structure modeled on
  the reference in `docs/reference/molslinjen-brandguide/`).
- **Brand-true light & dark themes**, a ⚙ Settings panel in the pager
  (lens: Generel/Design/Dev/HR · theme · language), and an anchored code
  console so the default view stays brand-book calm.
- **The Everyday & Print pack**, Office templates (.potx/.dotx on a
  token-generated theme), email-signature generator, curated image pack,
  print-grade logo packs (EPS/PDF-CMYK, 1-color pos/neg), named SoMe /
  newsletter / OOH template set, PMS/CMYK print truth on every core color.
- **A generated Figma library**, when a Figma MCP is connected: token
  variables with native light/dark modes, text styles, foundations and
  variable-bound components, linked from the portal's FIGMA-BIBLIOTEK
  chips (see step 6.5).
- **The agent interface**, a built-in Agent Skill (open agentskills.io
  standard; works in Claude, Codex, Cursor, Gemini, Copilot and ~40 more),
  per-page `.md` twins + `llms.txt` / `llms-full.txt`, DTCG `tokens.json`,
  a shadcn-compatible component registry, and an npx-runnable MCP wrapper.
- **A validation gate**, `npm run validate`: WCAG 2.2 AA (contrast + axe +
  keyboard), token lint with deprecation-alias continuity, print-value and
  license/expiry checks, and full coverage (every crawled component rebuilt,
  every CVI rule mapped in `cvi-rules.json`, every application scenario
  backed by a downloadable template and a generated in-situ mockup), plus a
  gating leak scan so gated chapters never bleed into the public bundle or
  machine files. The finished portal builds into `output/`, a light,
  few-file static React site you can deploy anywhere.

## The brand MCP: the brand as executable tools

Every brand repo ships an MCP server (`npm run mcp`, stdio, built on the
official MCP SDK) that turns the brand's contract into tools any
MCP-capable app can call: Claude Code, Claude Desktop, Cursor, Codex.
It completes the agent interface's three tiers: context (`llms.txt` in
the built portal), instructions (the generated per-brand skill in
`.claude/skills/brand/`), and now executable checks, answers computed
from the brand's own files with the same math the validation gate runs,
never from a model's recollection.

### The tools

| Tool             | What it answers                                                                                                                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brand_info`     | Name, tagline, versions, languages, contacts, chapter map. Start here.                                                                                                                                           |
| `get_token`      | The exact value of any sys token, per mode, with its CSS variable.                                                                                                                                               |
| `list_tokens`    | The complete design contract in one call, colors resolved for both modes.                                                                                                                                        |
| `check_contrast` | WCAG ratio between two colors (role names or hex), judged against the brand's contrast matrix. On failure it suggests the nearest BRAND color that passes, picked from the tone ladders by perceptual distance.  |
| `check_copy`     | Deterministic scan against the writing rules and the termbank: banned phrases, dashes-as-pauses, known term mistakes, casing. Returns violations and, where the termbank declares autofixes, the corrected text. |
| `get_ladder`     | A core color's 12-step tone ladder with each step's job, CSS variable and perceptual tone. The anchor step is the exact evidence hex.                                                                            |
| `get_rules`      | Every GØR/UNDGÅ usage rule from the guide as data, both languages, filterable by chapter.                                                                                                                        |
| `list_exports`   | The downloadable artifacts (tokens, ladders, component sources) with their portal paths.                                                                                                                         |

It also serves the contract files as MCP resources (`brand://tokens`,
`brand://ladders`, `brand://contrast-matrix`, `brand://terms`,
`brand://rules`). All reads are per-call from disk, so a token edit is
live on the next question without restarting.

### Where the data comes from

`brand/tokens.json` and `brand/ladders.json` for values,
`brand/contrast-matrix.json` for the contrast contract,
`brand/terms.json` for the termbank (the Writer.com-style schema:
approved/banned terms, known mistakes, per-term autofix flags), and
`brand/rules.json`, which `build-ai` regenerates every build by
extracting the guide's own GØR/UNDGÅ rows, so the sections stay the
single source and the data can never drift from the portal.

### Registering it

Claude Code, from the brand repo:

```bash
claude mcp add odense-basket -- node scripts/mcp-server.mjs
```

Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "odense-basket": {
      "command": "node",
      "args": ["C:/path/to/brand-repo/scripts/mcp-server.mjs"]
    }
  }
}
```

Codex CLI (`~/.codex/config.toml`):

```toml
[mcp_servers.odense-basket]
command = "node"
args = ["C:/path/to/brand-repo/scripts/mcp-server.mjs"]
```

The server is template-owned machinery (updated by `/brandos-update`)
that reads only `brand/` files, so one implementation serves every
brand and never drifts from the portal it ships with. A designer asking
"is #4A90D9 okay on our surface?" gets the matrix's verdict and the
nearest on-brand alternative; a writer pasting copy gets the termbank's
corrections. The brand stops being a PDF someone half-remembers and
becomes a capability their tools have.

## What actually makes it hold

The portal is the visible part. These are the mechanisms underneath,
each one built because a real test run failed without it:

- **Evidence over invention.** Everything starts from two captured
  inputs (the site crawl, the CVI) weighed on an explicit evidence
  ladder: painted production values first, meta tags last. Captured
  colors are ranked by a scoring formula (interactive-background
  weight, saturation, usage), and a confidence score decides when the
  agent asks instead of deciding. Nothing brand-shaped is ever invented:
  no painted logos, no stock photos, no colors from memory.
- **Anchors are immutable.** Any value traced to evidence is a locked
  input; theme generation only infills around it (12-step perceptual
  tone ladders with the exact evidence hex pinned at its measured
  lightness). The gate proves anchors survive verbatim.
- **One contract, two readers.** The contrast matrix is a file read by
  both the theme generator and the validation gate, so they cannot
  disagree. The same principle everywhere: rules live as data
  (tokens.json, rules.json, terms.json, contrast-matrix.json), and
  prose is only the human view of it.
- **The gate.** Twelve checks with PASS/FAIL/BLOCKED semantics, where
  BLOCKED (missing input) is never a pass: writing rules, key hygiene,
  seed leak, prerender completeness, gated leak, print truth, licensed
  manifest, contrast pairs, imagery usage, theme integrity, build
  stamp, template version. Every check exists because a test run
  shipped the defect it now catches.
- **Self-correcting verification.** After every build the agent drives
  the served portal in a real browser (pages, console, fonts by
  computed style, all theme states, language switch, search,
  downloads) and fixes-rebuilds until clean; headless harnesses run
  the same list through Playwright.
- **The journal.** Every built portal carries an append-only
  changes.json: agents record every post-build edit, and unrecorded
  change is by definition drift. The build stamp ties output to a
  commit.
- **Cost honesty.** Before any paid work the build estimates Firecrawl
  credits and AI tokens and asks once. The hybrid scrape keeps most
  runs at a few credits (a 43,000-URL site captured for ~2).
- **Pictures as build inputs.** The capture guarantees usable imagery
  and a verified logo (lazy-load harvesting, sprite files, escalation
  ladder), curation into the portal is a mandatory step, and the gate
  fails a build that ships zero photographs while usable captures
  exist.
- **Update without loss.** /brandos-update overlays template-owned
  machinery, never touches brand-owned files, and replays the
  migrations ledger so new functions reach old portals; the gate warns
  any clone that falls behind.

## Drift defense: staying true for years

A handed-over portal faces five kinds of decay: agents editing the
output, the client's live site moving away from the captured evidence,
brand repos falling behind the template, the stack rotting (Node EOL,
dependency CVEs), and the AI ecosystem shifting (model retirements,
spec revisions). The defense is layered by timeline, from the gate and
journal that run on every edit, through scheduled still-green rebuilds
and golden visual baselines, monthly sampling of the client's live
site diffed against the tokens, annual scored brand audits appended to
the journal as a trend line, up to multi-year mechanisms: token
deprecation lifecycles with compatibility windows, a runtime manifest
where the repo knows its own expiry dates, and a named accountable
owner, which the research literature identifies as the single
strongest predictor of long-term consistency. The full architecture,
with what exists versus what is queued, lives in
[docs/DRIFT-DEFENSE.md](docs/DRIFT-DEFENSE.md).

## Built on open tools

BrandOS builds what carries brand judgment (evidence weighing, theme
generation, guide voice) and stands on the ecosystem for solved
infrastructure. Full reasoning per tool in
[docs/TOOLS.md](docs/TOOLS.md); the credits:

**The pipeline**

- [Firecrawl](https://github.com/firecrawl/firecrawl): rendering and
  crawling JS-heavy sites during intake; the hybrid scrape keeps most
  runs at a few credits.
- [React Router](https://github.com/remix-run/react-router),
  [Vite](https://github.com/vitejs/vite),
  [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss): the
  portal stack; static prerender, one CSS file, token-driven utilities.
- [Fontsource](https://github.com/fontsource/fontsource): versioned
  self-hosted open fonts, no CDN calls from a client portal.
- [cheerio](https://github.com/cheeriojs/cheerio): HTML parsing in the
  intake scripts.
- [Figma's MCP server](https://www.figma.com/): the design handover
  generates the brand's Figma library through Figma's own agent
  interface.

**Verification and CI**

- [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp):
  the browser verification loop in harnesses without a built-in browser
  pane.
- [axe-core](https://github.com/dequelabs/axe-core): the accessibility
  rules engine behind the roadmap a11y pass; writing our own WCAG rule
  set would be worse and irresponsible.
- [agnix](https://github.com/agent-sh/agnix): lints AGENTS.md and
  SKILL.md files across Claude Code and Codex; runs as a CI action
  (its native binary is blocked in sandboxed local runs).
- [Agent Skills spec](https://github.com/agentskills/agentskills): the
  open standard the bundled skills follow, so one skill folder loads in
  Claude Code, Codex, Cursor and the rest.
- [skills CLI](https://github.com/vercel-labs/skills): the standard
  layout our skills use; `npx skills add Ahmadnmic/BrandOS-Template`
  installs them into 76+ agents.
- [anthropics/skills](https://github.com/anthropics/skills): the
  official docx/pptx/pdf document skills for Office deliverables,
  instruct-installed (their license permits use, not bundling).

**Ideas credited, implemented natively**

- [Terrazzo](https://github.com/terrazzoapp/terrazzo): pioneered
  token-level contrast linting; our gate implements the same check
  against our token shape, the idea is theirs.
- [Style Dictionary](https://github.com/style-dictionary/style-dictionary):
  the canonical token build system, queued to replace the hand-rolled
  generator once our tokens move to standard DTCG modes.
- [Pagefind](https://github.com/Pagefind/pagefind) and
  [subfont](https://github.com/Munter/subfont): static search and font
  subsetting, queued for when portals grow many pages and raw client
  fonts.
- The Molslinjen guide in `docs/reference/` is the structural reference
  for the document-scroll layout: a reference, never a template; its
  brand belongs to Molslinjen.

## Repository layout

```
.claude/skills/brandos/     the /brandos startup command
.claude/skills/fetch-site/  bundled intake engine (map → scrape → assets →
.claude/skills/figma-kit/   design handover: generated Figma library
.claude/skills/brandos-update/  /brandos-update: template upgrade + migrations
                            components → brand → offline mirror → AI index)
intake/                     per-client inputs: crawl/ + cvi/ or cvi-site/ + licensed/ (gitignored)
brand/                      ── REBRAND SURFACE ── tokens.json · brand.config.ts ·
                            voice.md · assets/
content/                    REBRAND SURFACE: brand copy modules per chapter
src/                        invariant template machinery (shell, guide
                            components, UI library)
scripts/                    build-tokens · build-ai · validate
                            validate
AGENTS.md                   the rebuild contract every agent follows
```

Only `brand/` and `content/` change per brand. Everything else is template.

## Status

Template in active development. The plan (research, chapter map, mockups,
architecture decisions, roadmap) is maintained as the BrandOS Blueprint;
current phase: Fase 1, skeleton + token pipeline.

© Nørgård Mikkelsen. All rights reserved.

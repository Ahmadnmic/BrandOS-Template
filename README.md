# BrandOS Template

One brand system. Two audiences: people and AI.

BrandOS is a template for **living brand portals**, CVI, brand guide,
component library and code handoff in one static React site, with the
rebuild instructions for AI built into the repo. Every new client brand is a
token swap and a content pass, not a new build: hand an agent a site URL and
the official design guide, get back a validated portal in the brand's own
design language.

Built by Nørgård Mikkelsen. For clients' internal and external use, a
working tool, not a marketing site.

## The promise

```
/brandos https://client.dk
```

The agent asks for the client's site URL (already answered above), captures
the entire site with the bundled **fetch-site** engine (pages, assets,
components, de facto brand data, as an offline mirror plus machine-readable
indexes), then asks for one more thing: the official CVI / brand guide. From
those two inputs it builds the whole portal autonomously, asking a question
only when it is not 100% sure.

**Two inputs. Two questions. One validated Brand OS.**

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
- **Brand-true light & dark themes**, a Figma-style collapsible sidebar,
  a ⚙ Settings panel (lens: Generel/Design/Dev/HR · theme · language), and an
  anchored code console so the default view stays brand-book calm.
- **The Everyday & Print pack**, Office templates (.potx/.dotx on a
  token-generated theme), email-signature generator, curated image pack,
  print-grade logo packs (EPS/PDF-CMYK, 1-color pos/neg), named SoMe /
  newsletter / OOH template set, PMS/CMYK print truth on every core color.
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

## Build a Brand OS with an AI agent

Works with Claude Code, Codex, Cursor, Copilot, Gemini CLI, anything that
reads `AGENTS.md`. The agent asks two questions (site URL, then the CVI) and
builds the rest itself, stopping only when it isn't 100% sure.

### Claude Code

```bash
git clone https://github.com/Ahmadnmic/BrandOS-Template.git brandos-client
cd brandos-client
claude
```

Then type:

```
/brandos https://client.dk
```

### Codex CLI (and other agents)

```bash
git clone https://github.com/Ahmadnmic/BrandOS-Template.git brandos-client
cd brandos-client
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

### By hand

1. Clone, then copy `.env.example` to `.env` and paste your Firecrawl API
   key (optional, static/SSR sites work keyless in direct mode). The key
   never leaves `.env`.
2. `/brandos https://client.dk` (or "rebuild for a new brand").
3. Hand over the CVI when asked; decide any reconciliation conflicts the
   agent surfaces. Done.

Full operator walkthrough: [docs/GUIDE.md](docs/GUIDE.md).

## Repository layout

```
.claude/skills/brandos/     the /brandos startup command
.claude/skills/fetch-site/  bundled intake engine (map → scrape → assets →
                            components → brand → offline mirror → AI index)
intake/                     per-client inputs: crawl/ + cvi/ (gitignored)
brand/                      ── REBRAND SURFACE ── tokens.json · brand.config.ts ·
                            voice.md · assets/
content/                    ── REBRAND SURFACE ── one MDX per chapter
src/                        invariant template machinery (shell, guide
                            components, UI library)
scripts/                    intake · generate-theme · build-tokens · build-ai ·
                            validate
AGENTS.md                   the rebuild contract every agent follows
```

Only `brand/` and `content/` change per brand. Everything else is template.

## Status

Template in active development. The plan (research, chapter map, mockups,
architecture decisions, roadmap) is maintained as the BrandOS Blueprint;
current phase: Fase 1, skeleton + token pipeline.

© Nørgård Mikkelsen. All rights reserved.

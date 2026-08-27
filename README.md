# BrandOS Template

One brand system. Two audiences: people and AI.

BrandOS is a template for **living brand portals** — CVI, brand guide,
component library and code handoff in one static React site — with the
rebuild instructions for AI built into the repo. Every new client brand is a
token swap and a content pass, not a new build: hand an agent a site URL and
the official design guide, get back a validated portal in the brand's own
design language.

Built by Nørgård Mikkelsen. For clients' internal and external use — a
working tool, not a marketing site.

## The promise

```
/brandos https://client.dk
```

The agent asks for the client's site URL (already answered above), captures
the entire site with the bundled **fetch-site** engine (pages, assets,
components, de facto brand data — as an offline mirror plus machine-readable
indexes), then asks for one more thing: the official CVI / brand guide. From
those two inputs it builds the whole portal autonomously — asking a question
only when it is not 100% sure.

**Two inputs. Two questions. One validated Brand OS.**

## What a finished portal contains

- **16 chapters** across four layers — Brandet (journey + platform),
  Identitet (logo, farver, typografi, grid, grafik, billedstil, motion),
  Sprog (tone of voice with a per-channel matrix), System (komponenter,
  tokens, anvendelse, assets, AI) and Brand Data (gated).
- **A generated global design language** — not a color swap. A personality
  profile (skarp/blød, tæt/luftig, teknisk/menneskelig, rolig/kinetisk,
  rå/poleret, bokset/åben) drives radius, density, casing, motion, borders
  and composition. Layout idiom is read from the brand's own material —
  never the generic "AI look".
- **Brand-true light & dark themes**, a Figma-style collapsible sidebar,
  a ⚙ Settings panel (lens: Generel/Design/Dev · theme · language), and an
  anchored code console so the default view stays brand-book calm.
- **The Everyday & Print pack** — Office templates (.potx/.dotx on a
  token-generated theme), email-signature generator, curated image pack,
  print-grade logo packs (EPS/PDF-CMYK, 1-color pos/neg), named SoMe /
  newsletter / OOH template set, PMS/CMYK print truth on every core color.
- **The agent interface** — a built-in Agent Skill (open agentskills.io
  standard; works in Claude, Codex, Cursor, Gemini, Copilot and ~40 more),
  per-page `.md` twins + `llms.txt` / `llms-full.txt`, DTCG `tokens.json`,
  a shadcn-compatible component registry, and an npx-runnable MCP wrapper.
- **A validation gate** — `npm run validate`: WCAG 2.2 AA (contrast + axe +
  keyboard), token lint with deprecation-alias continuity, print-value and
  license/expiry checks, and full coverage (every crawled component rebuilt,
  every CVI rule homed, every application scenario backed by a downloadable
  artifact).

## Quickstart

1. Clone this repo and open it in an AI coding agent (Claude Code, Cursor,
   Codex — anything that reads `AGENTS.md`).
2. Create your env file: copy `.env.example` to `.env` and paste your
   Firecrawl API key (optional for static/SSR sites — direct mode works
   keyless). The key never leaves `.env`.
3. Type `/brandos https://client.dk` (or just say "rebuild for a new brand").
4. Hand over the CVI when asked. Decide any reconciliation conflicts the
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
current phase: Fase 1 — skeleton + token pipeline.

© Nørgård Mikkelsen. All rights reserved.

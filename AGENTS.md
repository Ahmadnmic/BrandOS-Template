# BrandOS — rebuild instructions for AI agents

This repo is a TEMPLATE for living brand portals: CVI + brand guide +
component library + code handoff in one static React site, generated per
client brand. To produce a new client's Brand OS you edit ONLY `brand/` and
`content/`. Never restyle components directly — everything visual flows from
`brand/tokens.json`.

Build status: the template app (Vite + React Router 7 + Tailwind 4) is being
built per the plan (see README). Intake and this contract are live now.

## Entry: reading vs building

- Answering questions about this brand → use `.claude/skills/brand/` and the
  guide; never touch `intake/`.
- Building for a NEW brand → build mode below. Fastest entry in Claude Code:
  the `/brandos` command (`.claude/skills/brandos/`) — `/brandos
  https://client.dk` starts build mode with Q1 already answered.

AGENT PORTABILITY: this file is the contract and works in ANY agent that
reads AGENTS.md (Codex, Cursor, Copilot, Gemini CLI, …). The `/brandos`
slash command is only a Claude Code convenience — in other agents, the user
saying "rebuild for https://client.dk" (or similar) enters the exact same
flow: treat the URL as Q1 answered and proceed. The skill files under
`.claude/skills/` are plain Markdown with spec-only frontmatter
(agentskills.io) — if your tool does not auto-load them, READ them as files:
before the intake step, read `.claude/skills/fetch-site/SKILL.md` and run its
scripts with plain node; before any brand work, read
`.claude/skills/brand/SKILL.md` if it exists.

DOCTRINE: when you are not 100% sure about any brand fact or decision — ask.
Questions are cheap; wrong brand facts are not. Never invent a value found in
neither intake input.

You ask exactly TWO questions; everything between them is automatic:

**Q0, only if needed** — check `.env` for `FIRECRAWL_API_KEY`. Missing? Ask:
"Paste your Firecrawl API key (fc-…) — I'll store it in `.env`, which is
gitignored." Write it there yourself (`FIRECRAWL_API_KEY=fc-…`).
Key hygiene, non-negotiable: the key lives ONLY in `.env` — never in code,
`brand.config.ts`, chat output, logs, or commits. `.env` is gitignored;
`.env.example` is the committed empty template. Before any git commit, verify
`.env` is untracked. No key? Static/SSR sites run keyless in the fetch-site
skill's direct mode — never hand-scrape.

**Q1, immediately** — "What is the client's site URL?"
→ run the bundled fetch-site skill (`.claude/skills/fetch-site/`) with output
to `intake/crawl/` and `--max-pages 500` (the default cap — a big enough
sample; raise it only if the user explicitly asks): map → scrape → assets →
components → brand → offline rewrite → AI index. Output: the offline mirror, full-res `assets/`,
`components.json` (real HTML+CSS per component), `brand.json` (root vars,
fonts, color counts), `pages.json`, `manifest.json`. Scaffold
`intake/components-inventory.md` from `components.json`.

**Q2, when intake completes** — "Hand me the CVI / brand guide."
→ place it in `intake/cvi/`. From here run steps 1–6 AUTONOMOUSLY — the only
permitted stops are a reconciliation conflict and the doctrine above.

## Rebuild recipe

1. **Extract & reconcile.**
   From the CRAWL: finalize the component inventory (every distinct UI
   pattern in production), de facto colors/fonts/spacing, real copy for voice
   analysis, the site's IA — and the TYPESETTING IDIOM: alignment,
   containment (boxes vs hairline rules vs whitespace), corner language,
   density, image framing → the `sys.composition` profile.
   From the CVI: official palette, typefaces + licenses, logo rules,
   clearspace, tone of voice — and PRINT TRUTH: authoritative PMS-C/PMS-U,
   CMYK and RAL per core color into `tokens.json` `$extensions` (if the CVI
   lacks them, flag in `intake/reconciliation.md` — never soft-convert from
   hex).
   Reconcile: the CVI is law for rules; the crawl is evidence of what exists.
   Write every conflict to `intake/reconciliation.md` and get a human
   decision. Never silently pick a side.

2. **Generate the theme.** Derive the personality profile from the brand
   platform (skarp/blød · tæt/luftig · teknisk/menneskelig · rolig/kinetisk ·
   rå/poleret · bokset/åben) and confirm it with a human. Then:
   `npm run generate-theme -- --seed "#0A1526" --profile profile.json`
   → writes ref+sys tiers (color, type, radius, space, case, motion, border,
   composition) into `brand/tokens.json`. Keep AA pairs. Review the `/theme`
   route before moving on.

3. **Bind identity.** Fonts + logos into `brand/assets/`; fill
   `brand.config.ts` (chapters on/off, version "1.0", contacts, partner
   allowlist, langs, campaign overlays).

4. **Write chapters.** One MDX per chapter. Follow each chapter's REQUIRED
   blocks (Princip → Regler → Eksempler → Misbrug → Downloads). Rules must be
   testable: exact values, ratios, approved phrases — never adjectives. Write
   in the brand's own voice (`brand/voice.md`) and language. Every component
   in the inventory gets rebuilt in Komponenter with the 4-tab contract.
   For every marketing application: generate its native program template(s)
   (.potx / .dotx / Figma+PSD / .idml / HTML mail) AND an in-situ mockup —
   the brand composited into phone/feed/print/OOH scenes from the template,
   the tokens and the crawl assets. Every template ships with an embedded AI
   instruction — `{name}.instructions.md`: purpose, slots/placeholders, what
   may change, what must never change — embedded in the file where the
   format allows (deck notes master, registry docs field) and aggregated
   into the brand skill's `references/templates.md` and llms.txt.

5. **Validate.** `npm run validate` —
   - WCAG 2.2 AA: contrast on all sys pairs + axe-core and keyboard-nav
     smoke tests on every library component
   - token lint (no raw hex outside tokens.json); an exported token name may
     never disappear without a deprecation alias (rename = major)
   - print truth: every core palette color carries PMS/CMYK from the CVI
   - assets: none missing, none past license expiry; fonts carry license
     notes; deprecated assets flagged, not silently served
   - applications: every scenario in Ch.10 (deck, offer, signature, SoMe
     formats, OOH) has a matching downloadable native template in Ch.13
     (with its `{name}.instructions.md` sidecar) AND a generated in-situ
     mockup on its page
   - COVERAGE: every component in `intake/components-inventory.md` exists in
     the library; every CVI rule has a home chapter
   Fix until green.

6. **Publish.** `npm run build` → deploy `build/client`. Stamp the version
   and add a changelog entry in `brand.config.ts`.

## Hard rules

- Theming happens ONLY at the sys token tier. comp → sys → ref, never values.
- Every color shown in the guide must exist in `tokens.json`.
- `brand/voice.md` is law for all copy this repo produces, including commit
  messages.
- NEVER the generic AI look: rounded-card grids, centered-everything,
  gradient heroes, uniform radius, emoji headers. Containment, radius and
  alignment must cite evidence from `intake/` (the `sys.composition`
  profile). A brand that boxes nothing gets a portal that boxes nothing —
  default to rules and whitespace, not cards.

## Repo map

- `.claude/skills/brandos/` — the /brandos startup command
- `.claude/skills/fetch-site/` — bundled intake engine (7 stages)
- `.claude/skills/brand/` — per-brand knowledge skill (generated in step 4)
- `intake/` — the two rebuild inputs (per client; never committed)
- `brand/` + `content/` — the ONLY rebrand surface
- `src/` — invariant template machinery (shell, guide components, UI library)
- `scripts/` — intake / generate-theme / build-tokens / build-ai / validate

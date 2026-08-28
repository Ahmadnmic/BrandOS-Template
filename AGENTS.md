# BrandOS, rebuild instructions for AI agents

This repo is a TEMPLATE for living brand portals: CVI + brand guide +
component library + code handoff in one static React site, generated per
client brand. To produce a new client's Brand OS you edit ONLY `brand/` and
`content/`. Never restyle components directly, everything visual flows from
`brand/tokens.json`.

Build status: the template app (Vite + React Router 7 + Tailwind 4) is being
built per the plan (see README). Intake and this contract are live now.

## Entry: reading vs building

- Answering questions about this brand → use `.claude/skills/brand/` and the
  guide; never touch `intake/`.
- Building for a NEW brand → build mode below. Fastest entry in Claude Code:
  the `/brandos` command (`.claude/skills/brandos/`), `/brandos
https://client.dk` starts build mode with Q1 already answered.

AGENT PORTABILITY: this file is the contract and works in ANY agent that
reads AGENTS.md (Codex, Cursor, Copilot, Gemini CLI, …). The `/brandos`
slash command is only a Claude Code convenience, in other agents, the user
saying "rebuild for https://client.dk" (or similar) enters the exact same
flow: treat the URL as Q1 answered and proceed. The skill files under
`.claude/skills/` are plain Markdown with spec-only frontmatter
(agentskills.io), if your tool does not auto-load them, READ them as files:
before the intake step, read `.claude/skills/fetch-site/SKILL.md` and run its
scripts with plain node; before any brand work, read
`.claude/skills/brand/SKILL.md` if it exists.

DOCTRINE: when you are not 100% sure about any brand fact or decision, ask.
Questions are cheap; wrong brand facts are not. Never invent a value found in
neither intake input.

You ask two brand questions (plus a one-time environment check); everything
between them is automatic:

**Q0, only if needed**, check that `.env` exists and contains
`FIRECRAWL_API_KEY`. Missing? Say: "Copy `.env.example` to `.env` and paste
your Firecrawl key into it yourself (`FIRECRAWL_API_KEY=fc-…`), then tell me
'done'." NEVER ask the user to paste the key into chat, and never echo,
export or log it, you only verify the file exists; you never read the value
aloud. Key hygiene, non-negotiable: the key lives ONLY in `.env`, never in
code, `brand.config.ts`, chat output, logs, or commits. Before any git
commit, verify `.env` is untracked. No key? Static/SSR sites run keyless in
the fetch-site skill's direct mode, never hand-scrape.

**Q1, immediately**, "What is the client's site URL?"
→ run the bundled fetch-site skill (`.claude/skills/fetch-site/`) with output
to `intake/crawl/`. THE SCRAPE RUNS IN TWO STAGES:

FAST PASS (blocking, minutes): map the site and recover its real structure
(its HTML sitemap page plus the navs of the main hub pages), enumerate the
page TYPES (home, hubs, listings, products, customer service, magazine,
corporate, stores, campaigns, brand pages, B2B, services, ...), then scrape
ONE representative page per type (~15-25 pages) and run assets → components
→ brand → AI index on that subset. This yields the provisional component
inventory and capture summary. Proceed to Q2 and the build on this basis.

DEEP PASS (background): AFTER the fast pass finishes (never in parallel
with it, they share rate limits), launch the full stratified crawl with
`--max-pages 150` (default cap; raise only if the user explicitly asks),
spread so every page type is represented in proportion. Never 150 of one
type, never the map's first N. It runs while you build. Record strata and
counts for both passes in the audit trail.
BLOCKED-FETCH LADDER when a public site throttles or blocks: (1) plain
fetch → (2) Firecrawl's proxies → (3) browser-context capture: load the
public page in a real browser and save its same-origin resources (CSS,
fonts, logos), which is what any visitor's browser does and costs no
credits. HARD BOUNDARY: never bypass logins, paywalls or CAPTCHAs, and
never automate around explicit bot checks; if the ladder is exhausted,
ask the user. Save fetched evidence artifacts (e.g. production CSS) into
intake/ so decisions stay reproducible.
CREDIT POSTURE: the scrape stage is hybrid by default. Free plain-HTTP
fetch first, Firecrawl only for pages that prove they need JS rendering,
already-captured pages never re-billed, dead URLs never escalated. Never
use Firecrawl's json format, PDF parsing or prompt-injection check (all
surcharged); extraction happens locally. Report the credit estimate the
scrape stage prints in your capture summary. The stage checks remaining
credits (a free endpoint) before any paid batch and STOPS with a clear
message rather than dying mid-run; on a stop, ask the user to top up or
lower the cap; never continue on a partial corpus without saying so. Output: the offline mirror, full-res `assets/`,
`components.json` (real HTML+CSS per component), `brand.json` (root vars,
fonts, color counts), `pages.json`, `manifest.json`. Scaffold
`intake/components-inventory.md` from `components.json`.

**Q2, when intake completes**, "Hand me the CVI / brand guide."
→ place it in `intake/cvi/`. From here run steps 1-7 AUTONOMOUSLY, the only
permitted stops are: (a) a reconciliation conflict, (b) the ask-when-unsure
doctrine above, (c) the one-time personality-profile confirmation in step 2.

## Rebuild recipe

1. **Extract & reconcile.**
   From the CRAWL: finalize the component inventory (every distinct UI
   pattern in production), de facto colors/fonts/spacing, real copy for voice
   analysis, the site's IA, and the TYPESETTING IDIOM: alignment,
   containment (boxes vs hairline rules vs whitespace), corner language,
   density, image framing → the `sys.composition` profile.
   From the CVI: official palette, typefaces + licenses, logo rules,
   clearspace, tone of voice, and PRINT TRUTH: authoritative PMS-C/PMS-U,
   CMYK and RAL per core color into `tokens.json` `$extensions` (if the CVI
   lacks them, flag in `intake/reconciliation.md`, never soft-convert from
   hex).
   Reconcile by WEIGHING EVIDENCE. When the guide and the site disagree on
   an element, ask the builder, "should I use this element from the site or
   from the guide?", showing both values and the evidence for each (how
   consistently the site uses it across pages; how explicit and recent the
   guide is).
   EVIDENCE QUALITY LADDER (rank evidence by what actually paints UI):
   1. computed/painted values: production CSS custom properties in :root,
      computed styles of real rendered elements, hex frequency in the
      shipped stylesheets;
   2. authored content: markup attributes, actual copy;
   3. head/meta tags LAST: <meta name="theme-color"> tints browser chrome
      and paints no UI; counting how many pages carry a tag is NOT evidence
      of UI usage. Before opening a conflict, verify the two values truly
      disagree at the same tier; a meta tag vs a stylesheet value is often
      no conflict at all. Beware third-party values in the bundle (payment
      SDKs, cookie banners, chat widgets ship their own palettes): a hex
      being frequent does not make it the brand's. Exception: with OVERWHELMING evidence against one side (e.g. a
      value used consistently across hundreds of live pages while the guide's
      variant appears nowhere in production, or a guide that explicitly
      supersedes the old site), you may decide yourself. Either way, record
      every conflict, the evidence weights, and who decided in
      `intake/reconciliation.md`. Never decide silently.
      reconciliation.md is APPEND-ONLY: a closed decision may be reversed
      only on new evidence, recorded as a NEW entry referencing the old
      one. Never rewrite or delete a past entry.
      Also produce `intake/cvi-rules.json`, every rule in the CVI as
      {id, verbatim rule, assigned chapter}, so the coverage check in step 5
      is mechanical, not self-assessed. reconciliation.md,
      components-inventory.md and cvi-rules.json ARE committed (they are the
      audit trail); the bulk capture and the CVI files are not.

2. **Generate the theme.** Derive the personality profile from the brand
   platform (skarp/blød · tæt/luftig · teknisk/menneskelig · rolig/kinetisk ·
   rå/poleret · bokset/åben) and confirm it with a human. Then:
   `npm run generate-theme -- --seed "#0A1526" --profile profile.json`
   → writes ref+sys tiers (color, type, radius, space, case, motion, border,
   composition) into `brand/tokens.json`. Keep AA pairs. Review the `/theme`
   route before moving on.

3. **Bind identity.** Fonts + logos into `brand/assets/`; fill
   `brand.config.ts` (chapters on/off, gated-chapter list, version "1.0",
   role-alias contacts, langs, campaign overlays). The partner access
   allowlist (external emails = PII) goes in the gitignored
   `access.config.json`, NEVER in brand.config.ts or git, the deploy script
   provisions it to the edge access layer. Public pages use role aliases
   only (brand@client.dk); personal contacts live in the gated area.

4. **Write chapters.** Execute via the Parallel build plan below (waves 1
   and 2); a 10-minute-per-unit fan-out instead of a serial crawl through
   sixteen chapters. One MDX per chapter. The 16-chapter map is a FLOOR,
   not a ceiling: if the CVI contains a section no chapter accounts for
   (vehicle livery, uniforms, packaging, sonic DNA, wayfinding, whatever the
   guide holds), ADD a chapter for it in brand.config.ts and build it with
   the same skeleton. Never drop or shoehorn CVI content; every entry in
   cvi-rules.json must map to a chapter, adding chapters as needed.
   The inverse rule: if you evaluate that the GUIDE is missing a standard
   chapter (no motion rules, no co-branding, no imagery direction), build
   it ONLY when the intake data supports it (site evidence, generated
   tokens), and label it "derived from site evidence, not in the official
   guide, pending client sign-off". No supporting data means NO new
   section. Never pad with speculative content.
   Follow each chapter's REQUIRED
   blocks (Princip → Regler → Eksempler → Misbrug → Downloads). Rules must be
   testable: exact values, ratios, approved phrases, never adjectives. Write
   in the brand's own voice (`brand/voice.md`) and language. Every component
   in the inventory gets rebuilt in Komponenter with the 4-tab contract.
   For every marketing application: generate its native program template(s)
   (.potx / .dotx / Figma+PSD / .idml / HTML mail) AND an in-situ mockup,
   the brand composited into phone/feed/print/OOH scenes from the template,
   the tokens and the crawl assets. Every template ships with an embedded AI
   instruction, `{name}.instructions.md`: purpose, slots/placeholders, what
   may change, what must never change, embedded in the file where the
   format allows (deck notes master, registry docs field) and aggregated
   into the brand skill's `references/templates.md` and llms.txt.

5. **Validate.** `npm run validate`,
   - WCAG 2.2 AA: contrast on all sys pairs; axe via vitest-axe
     (component-level, contrast rules disabled in jsdom) plus an
     @axe-core/playwright + keyboard-tab pass over the prerendered output/
     HTML. The a11y/keyboard specs live in src/ (template, written once),
     a brand build never authors tests.
   - token lint (no raw hex outside tokens.json); an exported token name may
     never disappear without a deprecation alias (rename = major)
   - print truth: every core palette color carries PMS/CMYK from the CVI
     (DTCG $extensions under the `com.nm.brandos.print` key)
   - assets: none missing, none past license expiry (30-day warnings);
     deprecated assets flagged, not silently served; NO font binary in
     public output unless its license is explicitly open (OFL/Apache),
     licensed font packs default to the gated area
   - applications: every scenario in Ch.10 (deck, offer, signature, SoMe
     formats, OOH) has a matching downloadable native template in Ch.13
     (with its `{name}.instructions.md` sidecar) AND a generated in-situ
     mockup on its page (.idml is designer-supplied and presence-checked;
     mockups are Playwright screenshots of token-styled scene templates)
   - GATING LEAK SCAN: no gated-chapter slug, content canary string, or
     personal email appears anywhere in the public output (llms*.txt, .md
     twins, sitemap, Pagefind index, JS chunks), gated chapters build into
     the /gated/ subtree only
   - COVERAGE: every component in `intake/components-inventory.md` exists in
     the library; every rule in `intake/cvi-rules.json` maps to a chapter
     Fix until green.

6. **Deep verification.** Until the deep pass has been checked, the portal
   is PROVISIONAL: stamp it "foreløbig, verificeret på fast-set" and say so
   in your handover. When the deep crawl completes, diff it against what
   you built:
   - components in the deep set missing from the inventory → add and build
     them (coverage re-check);
   - de facto token values whose at-scale frequencies contradict a
     fast-pass reading → reconcile with the standard evidence rules;
   - page types the fast pass missed → new chapters per the floor-not-
     ceiling rule (and only with supporting data).
     Record every adjustment in the audit trail, re-run `npm run validate`
     against the FULL inventory, and update the stamp to "verificeret på N
     sider". A brand build is not done before this step.

7. **Publish.** `npm run build` → the finished portal lands in `output/` as
   a static React site, as light and few-file as the stack allows
   (prerendered HTML per route, one CSS file, minimal JS chunks, the AI
   files). Deploy that folder. Then `npm run release`, it bumps the version
   stamp, the changelog and the tokens export version atomically and refuses
   on mismatch. Token exports ship as versioned tarballs under
   /exports/ (URL-installable); npm publishing is an explicit opt-in via CI
   under the NM org, never a default.
   The output governs its own future: build-ai writes AGENTS.md (rules for
   any AI editing the deployed portal: tokens-only values, no new colors or
   fonts, no AI-tell prose, never touch the machine files or /gated/),
   changes.json (an append-only journal every post-build agent edit MUST be
   recorded in: read first, append after) and llms.txt + tokens.json into
   output/. What one agent changes after deploy, the next agent can read.

## Parallel build plan (subagents)

If your harness supports subagents or parallel tasks (Claude Code Task
tool, Codex parallel runs, etc.), BUILD IN PARALLEL: after the theme is
locked, chapters are independent of each other, and serializing them wastes
most of the wall clock. If your harness has no subagents, run the same
units sequentially in the order below; the unit contracts are identical.

Sizing rule: every unit is SCOPED to roughly 10 minutes of agent work.
If a unit looks bigger (a fat component inventory, a huge image harvest),
split it further; if trivial, merge it with its neighbor.
This is a sizing guideline, NOT a timeout. There is no time limit on a
subagent: a unit takes the time it takes. Never abort, rush or restart a
subagent for running long, and never trade correctness for speed to hit
the guideline.

Subagent contract (every unit):

- Input: brand/tokens.json, the reconciled facts, intake/cvi-rules.json
  entries assigned to its chapters, and only the intake slices it needs.
- Output: ONLY its own listed files. No unit ever edits brand/tokens.json,
  brand.config.ts, or another unit's files; the MAIN agent owns shared
  files and does all merging and chapter registration.
- A subagent that is not 100% sure RETURNS the question in its summary
  instead of guessing; the main agent batches questions to the human.
- Every unit returns: files written, decisions made, open questions.

WAVE 0, sequential (main agent, human in the loop): preflight → Q1 fast
pass → Q2 CVI. Then fan out TWO extractors in parallel: (0a) crawl
analysis: component inventory, de facto tokens, typesetting idiom, copy
corpus; (0b) CVI parsing: cvi-rules.json, official values, print truth.
Main agent reconciles (human decisions), confirms the personality profile,
runs generate-theme. The theme lock ends wave 0.

WAVE 1, fan out in parallel (one subagent per unit):

- U1 Ch. 01 Brandet + Forside copy
- U2 Ch. 02 Logo (construction, clearspace, misuse, chooser data,
  print-grade logo pack manifest)
- U3 Ch. 03 Farver + Ch. 12 Tokens page (token-table work, one voice)
- U4 Ch. 04 Typografi + Ch. 05 Grid & layout
- U5 Ch. 06 Grafik & ikoner + Ch. 08 Motion (easing demos from profile)
- U6 Ch. 07 Billedstil (image curation from the harvest, rights flags,
  operator sign-off list)
- U7 Ch. 09 Tone of voice: voice.md, channel matrix,
  references/channels.md (works from the copy corpus, not tokens)
- U8 Ch. 10 Anvendelse: platform spec tables, co-branding toolkit,
  campaign scaffolding, Godkendelse blocks
- U9 Office pack: .thmx from tokens, .potx deck, .dotx offer/letter,
  email signature, each with {name}.instructions.md
- U10 SoMe/newsletter/OOH masters + generated in-situ mockups, each with
  {name}.instructions.md
- U11+ Komponenter: split intake/components-inventory.md into batches of
  AT MOST 4 components per subagent; each batch delivers the rebuilt
  components, their 4-tab pages, and demo items. A 20-component
  inventory means 5 parallel component units.

WAVE 2, after wave 1 lands (parallel where possible):

- V1 Ch. 14 AI + the brand skill (SKILL.md router + references built
  from U7's voice files and the token exports)
- V2 Ch. 13 Assets: download center wired to every pack from U2/U9/U10,
  license/expiry metadata on every asset
- V3 Consistency sweep: one slug per entity, identical section skeletons,
  terminology drift, AI-tell scan across all chapters

WAVE 3, sequential (main agent): merge, register chapters, `npm run
validate`, fix until green (fan the fixes out if there are many), build,
provisional handover. When the deep crawl lands: deep verification
(step 6), which may itself fan out one diff unit per page type.

## Hard rules

- Theming happens ONLY at the sys token tier. comp → sys → ref, never values.
- Every color shown in the guide must exist in `tokens.json`.
- `brand/voice.md` is law for all copy this repo produces, including commit
  messages.
- WRITING: never use em or en dashes as pause marks; use commas, colons and
  periods. Banned AI-tell phrases in any generated copy: "delve", "dive
  into", "unlock", "unleash", "elevate", "seamless", "robust", "leverage",
  "game-changer", "cutting-edge", "in today's fast-paced world",
  "landscape" (figurative), "tapestry", "testament to", "it's not just X,
  it's Y", "not only X but also Y", "Moreover"/"Furthermore" chains, "It's
  worth noting", "In conclusion", "Let's dive in", exclamation-mark
  enthusiasm, emoji in headings, rule-of-three sentence padding. Write like
  the brand's own people: concrete nouns, short sentences, exact values.
  validate greps generated copy for the banned list.
- NEVER the generic AI look: rounded-card grids, centered-everything,
  gradient heroes, uniform radius, emoji headers. Containment, radius and
  alignment must cite evidence from `intake/` (the `sys.composition`
  profile). A brand that boxes nothing gets a portal that boxes nothing,
  default to rules and whitespace, not cards.
- PORTAL LAYOUT RULES, per brand, enforced on every content page:
  - Guide components render through the containment idiom in
    `sys.composition` (ruled | boxed | open). "boxed" is permitted ONLY
    when the brand's own material demonstrably uses carded containment;
    when evidence is ambiguous, use ruled or open, never boxed.
  - Lists and tables of contents are NUMBERED RULED INDEXES (hairline
    rows, flush-left, mono numbers), never grids of bordered cards.
  - Color is shown as COMPOSED FIELDS (continuous painted bands with
    values in a ruled table), never chips inside cards.
  - Specimens sit free on the page: type set large over a hairline,
    components on a plain hairline stage. The thing itself is the
    presentation; a box around it is noise.
  - The same bordered container repeated as page structure is the tell.
    If two adjacent sections wear identical boxes, remove the boxes.
  - Corner radius comes only from `sys.radius` tokens and belongs to
    interactive elements (buttons, inputs), not to layout containers.
  - Workspace chrome (sidebar, settings panel, code console) is exempt:
    it is a tool surface, not brand content.
- Builds are reproducible from the committed lockfile: never update
  dependencies during a brand build; `engines`/.nvmrc pin Node.
- The template is versioned: `brand.config.ts` carries `templateVersion`;
  template upgrades happen only via `npm run upgrade-template` (overlays
  src/ + scripts/, runs migrations, re-runs validate), never by hand-editing
  src/ in a brand repo.

## Repo map

- `.claude/skills/brandos/`, the /brandos startup command
- `.claude/skills/fetch-site/`, bundled intake engine (7 stages)
- `.claude/skills/brand/`, per-brand knowledge skill (generated in step 4)
- `intake/`, the two rebuild inputs (per client; never committed)
- `brand/` + `content/`, the ONLY rebrand surface
- `src/`, invariant template machinery (shell, guide components, UI library)
- `scripts/`, intake / generate-theme / build-tokens / build-ai / validate

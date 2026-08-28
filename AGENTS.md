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
commit, verify `.env` is untracked AND scan every tracked file for
key-shaped strings (pattern `fc-[A-Za-z0-9]{8,}`); users sometimes paste
the key into `.env.example` by mistake. If a real key ever lands in a
tracked file or a transcript, move it to `.env`, restore the placeholder,
and RECOMMEND ROTATION regardless: "probably never left the machine" is
not a guarantee. No key? Static/SSR sites run keyless in the fetch-site
skill's direct mode, never hand-scrape.

**LICENSED MATERIAL, offered with Q1, never blocking.** At the start of
every build say: "If the brand has licensed material (bought fonts,
image packs, purchased templates, licensed logo artwork), drop it into
`intake/licensed/` now or any time before step 3, and give each item a
line in `intake/licensed/LICENSES.md`." Scaffold the folder and a
manifest header (item · licensor · license type · scope · expiry) when
you offer it. Rules:

- The build never waits for this; binding happens at step 3 with
  whatever is there.
- Licensed binaries live ONLY under `intake/licensed/` (gitignored) and
  the surfaces their license allows; licensed fonts serve from the
  gated area unless the license is explicitly open (OFL/Apache). The
  manifest is the tracked audit artifact; the binaries never are.
- Every file dropped there MUST have a manifest line; validate fails on
  unmanifested licensed files and warns 30 days before an expiry.
- This is where foundry-CDN fonts land legally: the crawl records them
  licensed-elsewhere, the user supplies their licensed copies here.

**Q1, immediately**, "What is the client's site URL?"
→ run the bundled fetch-site skill (`.claude/skills/fetch-site/`) with output
to `intake/crawl/`. THE SCRAPE RUNS IN TWO STAGES:

COST GATE, before any paid work: after the map call (1 credit) and the
strata plan, and BEFORE scraping or building, present one short
estimate and ask "fortsæt?" (continue?):

- Firecrawl: remaining credits (free endpoint), pages planned per pass,
  and the range: best case ~1-5 credits (SSR site, hybrid direct-first),
  worst case = fast set + deep set all escalated (e.g. "~25-175 of your
  854 credits"). Never start a paid batch that the preflight says cannot
  finish.
- AI tokens: state model and effort, then the observed ranges from the
  test runs: a fast-pass build (theme + first chapters + components)
  runs roughly 2-4M tokens; a full build with deep verification and all
  chapters 6-12M. Record the actual spend in the handover so these
  numbers tighten with every run.
  This is permitted stop (d) in the autonomy rule: one question, one
  answer, then run. If the user already answered a cost gate this run,
  do not ask again unless the estimate grows past what they approved.
  IMAGES & LOGOS GUARANTEE: pictures and logos are BUILD INPUTS, not
  decoration; a capture without them is incomplete. After the assets
  stage, read `_meta/asset-summary.json`: it counts images, lists pages
  with zero <img> (a JS-lazy-loading signal) and the skipped external
  hosts. Zero images or zero usable logos (brand/logos/manifest.json) is
  a STOP, not a shrug: review the skipped hosts and re-run with
  `--asset-hosts` for confirmed brand CDNs, escalate zero-image pages to
  rendered capture (Firecrawl or the browser-context ladder), and pull
  sprite files for <use>-referenced logos. If a usable logo still cannot
  be captured, ASK the user for logo files; NEVER paint a logo or
  imagery from memory, and never build Billedstil without captured
  pictures (no data, no section).
  STATICS FIRST: before spending credits on page volume, capture the
  site's production stylesheets, root custom properties and font
  references; they are the highest evidence tier per token and nearly
  free. A run that exhausts credits before the statics (Elgiganten,
  2026-08) mis-weights meta tags and reverses decisions later.
  MULTI-DOMAIN: each additional confirmed-owned domain (a B2B site, a
  separate shop) gets its own `intake/crawl-<name>/` with its own strata
  and robots capture; the component inventories merge into one. Never mix
  two domains into one corpus.

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

**Q2, when intake completes**, ask exactly: "Hand me the CVI / brand
guide: PDF, deck or files (I'll put them in `intake/cvi/`), or the URL
if the guide lives on the web."
LIVE CVI MODE: many brands publish the guide as a site (a designguide
subdomain, Frontify, Corebook, Brandpad). Capture it with the same
fetch-site pipeline and Firecrawl hybrid, pointed at the guide URL with
`--out <repo>/intake/cvi-site --max-pages 60`, one blocking pass (no
two-stage, the guide IS the law and guide sites are small). Guide
platforms are JS shells, so expect the hybrid to escalate most pages to
Firecrawl; without a key, warn that a JS-rendered guide cannot be
captured directly and ask for exports instead. Never bypass a
login-protected guide: ask the user for exports or credentialless
access. TWO CORPORA, TWO REGISTERS: `intake/crawl/` is de facto
production evidence, `intake/cvi-site/` is de jure guide law; never
merge them into one corpus. A live guide's own shipped stylesheets,
font files and downloadable asset packs are GUIDE-grade truth, often
sharper than a PDF (exact hex, real font binaries, spacing tokens);
harvest its linked brand packs (zip/eps/svg/pdf) via the assets stage.
When a live guide and a PDF edition disagree, the newer edition wins,
recorded in `intake/reconciliation.md`. Extraction still produces the
same `intake/cvi-rules.json`, whatever form the guide arrived in.
CAPTURE HARDENING: throttled hosts sometimes answer HTTP 200 with a
challenge page (F5/bot walls), which corrupts a naive capture. Validate
every response BEFORE writing (magic bytes for binaries, content
heuristics for HTML), make the capture resumable, and pace requests
(SDU designguide, 2026-08). EXTRACTION GATE: reconciliation may not
open against a CVI capture until text extraction produced non-empty
output and the capture manifest reports zero validated-missing files;
an operator can waive this only with a logged reason.
NO-CVI MODE: if the user states there is no CVI ("go off the site only"),
proceed with the crawl as the primary source. Then: unverified chapters
carry only the status stamp UDKAST · AFVENTER GODKENDELSE in the chapter
header, nothing more (see THE GUIDE SPEAKS AS THE BRAND); chapters whose
content cannot be derived from a site (Anvendelse templates, co-branding,
print variants) are NOT built (no data, no section); print truth and
CVI-rule coverage report BLOCKED in validate, and BLOCKED is never a pass;
voice.md rules cite their site evidence IN THE AUDIT TRAIL. Say all of
this in the handover, never in the guide. From here run steps 1-7 AUTONOMOUSLY, the only
permitted stops are: (a) a reconciliation conflict, (b) the ask-when-unsure
doctrine above, (c) the one-time personality-profile confirmation in step 2,
(d) the cost gate in Q1 (credits + AI tokens estimate, once).

## Rebuild recipe

1. **Extract & reconcile.**
   From the CRAWL: finalize the component inventory (every distinct UI
   pattern in production), de facto colors/fonts/spacing, real copy for voice
   analysis, the site's IA, and the TYPESETTING IDIOM: alignment,
   containment (boxes vs hairline rules vs whitespace), corner language,
   density, image framing → the `sys.composition` profile.
   THE CVI IS LAYOUT EVIDENCE TOO: read the guide document's OWN editorial
   layout (its cover composition, image-to-text ratio, grid density, how
   rules and examples sit on its pages) into `sys.composition`:
   `coverStyle` (mark-led | image-led | type-led), `imageWeight`
   (photo-led | balanced | type-led), `rhythm` (alternating | continuous),
   alongside containment and alignment. The portal's structure consumes
   these tokens, so THE LAYOUT CHANGES FROM BUILD TO BUILD: a photo-led
   brand gets an image-led cover and photo-weighted pages, an editorial
   brand stays type-led. Never default every brand to the seed's
   composition; record the layout evidence in the audit trail.
   From the CVI: official palette, typefaces + licenses, logo rules,
   clearspace, tone of voice, and PRINT TRUTH: authoritative PMS-C/PMS-U,
   CMYK and RAL per core color into `tokens.json` `$extensions` (if the CVI
   lacks them, flag in `intake/reconciliation.md`, never soft-convert from
   hex).
   FONT PAIRING AXES: when choosing or reconciling display/body pairs
   (including fallbacks), score candidates on explicit axes (serif
   class, stroke contrast, x-height, width, weight range, mood): a good
   pair MATCHES on x-height, proportion and mood and CONTRASTS
   deliberately on class or weight. Never pick pairs by feel alone.
   Reconcile by WEIGHING EVIDENCE. When the guide and the site disagree on
   an element, ask the builder, "should I use this element from the site or
   from the guide?", showing both values and the evidence for each (how
   consistently the site uses it across pages; how explicit and recent the
   guide is).
   EVIDENCE QUALITY LADDER (rank evidence by what actually paints UI):
   1. computed/painted values: production CSS custom properties in :root,
      computed styles of real rendered elements, hex frequency in the
      shipped stylesheets;
      (a LIVE CVI's own stylesheets and font files sit at this tier too,
      but on the GUIDE side of the ledger: the guide demonstrating its
      law in code, usually sharper than a PDF's approximations);
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
   author `brand/tokens.json` from the evidence: ref tier bound to
   captured values (color-evidence.json ranks candidates by brandScore;
   confidence below 0.6 means ASK, not decide), sys tier with light/dark
   contexts, radius/space/case/motion/border/composition from the
   profile, `sys.type` as {base, ratio} (the density axis picks the
   ratio band: dense 1.125-1.2, editorial 1.333-1.5). Then run
   `npm run generate-theme`: it derives 12-step perceptual tone ladders
   per core color (evidence hex pinned VERBATIM at its measured
   lightness), the type ramp, and checks every pair in
   `brand/contrast-matrix.json` (the same matrix the gate enforces),
   exiting nonzero on any failure. Ladders land in `brand/ladders.json`
   and ship as --ref-<name>-1..12 and --sys-type-* custom properties.
   ANCHOR LOCK: any value traced to evidence (CVI or capture) is an
   IMMUTABLE input to theme generation; generation only infills the
   unevidenced slots around the anchors (ladders, dark counterparts,
   support tints). An anchor that comes out mutated downstream is a
   defect, and the gate's theme-integrity check fails on it. Keep AA pairs (the gate's
   contrast check enforces the declared text/surface pairs). Review the
   `/theme` route on the dev server before moving on.

3. **Bind identity.** Fonts + logos into `brand/assets/`, taking
   licensed items from `intake/licensed/` (each carried with its
   LICENSES.md line: license type, scope, expiry; licensed fonts to the
   gated area unless explicitly open); fill
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
   THE SITE COUNTS TOO: when the CRAWL reveals a brand-expression
   category the chapter map does not cover (sponsor walls and partner
   logo treatments, sub-brands, youth/academy identities, campaign
   styles, press/media kits, merchandise), ADD a chapter for it
   AUTOMATICALLY, built from the crawl evidence and stamped UDKAST ·
   AFVENTER GODKENDELSE when the CVI is silent on it. The boundary:
   site sections that carry brand EXPRESSION (rules, assets,
   identities) become chapters; generic site plumbing (customer
   service, checkout, cookie pages) never does. Record every added
   chapter and its evidence in the audit trail.
   The inverse rule: if you evaluate that the GUIDE is missing a standard
   chapter (no motion rules, no co-branding, no imagery direction), build
   it ONLY when the intake data supports it (site evidence, generated
   tokens), stamped UDKAST · AFVENTER GODKENDELSE in its header; the
   provenance goes in the audit trail, not the chapter. No supporting data
   means NO new section. Never pad with speculative content.
   THE GUIDE SPEAKS AS THE BRAND, never about its own making. No process
   narration in chapter content: no "derived from", "extracted", "the
   crawl showed", "sitet bruger", no mention of AI, agents, scraping,
   builds, evidence counts or this repo. Rules are stated as the brand's
   law ("Signal bruges kun til handling"), not as observations. Provenance
   and method live in reconciliation.md, cvi-rules.json and the handover;
   draft status is the one stamp in the header, never a paragraph. A
   reader must not be able to tell from the guide's prose that an AI
   built it.
   THE GUIDE IS USAGE, NOT INVENTORY. Every chapter answers "how do we use
   this", never "what exists" or "what is coming". Concretely:
   - Nothing missing or planned is ever announced on a guide surface: no
     "FASE 2", no muted placeholder rows, no disabled nav items, no chips
     for artifacts that do not exist. Unbuilt = absent. The full chapter
     map and the roadmap live in brand.config.ts and the handover only.
   - TEXT BUDGET: chapter intro is one principle, max two sentences
     (~40 words). Rules are one imperative sentence each, stated as
     GØR/UNDGÅ pairs (the Rules component). Specimens, palettes and live
     examples carry the chapter; text captions them. If a paragraph
     describes the portal, its UI ("klik for at kopiere"), its build
     system or its own guarantees, delete it.
   - The chapter skeleton (Princip → Regler → Eksempler → Misbrug →
     Downloads) is internal method: never print it as a breadcrumb, header
     line or label in the guide.
     Rules must be
     testable: exact values, ratios, approved phrases, never adjectives.
     RULE GRAMMAR for every GØR/UNDGÅ row: phrased as must/must-not over
     VISIBLE properties (color, placement, treatment, case, spacing,
     composition), conditions as If-clauses, exact token values inlined,
     no bare adjective without an example. A rule written this way is
     executable by any future compliance check. Write
     in the brand's own voice (`brand/voice.md`) and language. Every component
     in the inventory gets rebuilt in Komponenter with the 4-tab contract.
     For Office formats prefer the official Anthropic document skills
     (anthropics/skills pptx/docx/pdf): instruct-install them when
     available rather than hand-rolling OOXML (license permits use, not
     bundling; see docs/TOOLS.md).
     For every marketing application: generate its native program template(s)
     (.potx / .dotx / Figma+PSD / .idml / HTML mail) AND an in-situ mockup,
     the brand composited into phone/feed/print/OOH scenes from the template,
     the tokens and the crawl assets. Every template ships with an embedded AI
     instruction, `{name}.instructions.md`: purpose, slots/placeholders, what
     may change, what must never change, embedded in the file where the
     format allows (deck notes master, registry docs field) and aggregated
     into the brand skill's `references/templates.md` and llms.txt.

5. **Validate.** `npm run validate`. The template ships a real gate in
   `scripts/validate.mjs` (writing rules, key hygiene, seed leak,
   prerender completeness, gated leak, print truth, with PASS/FAIL/
   BLOCKED semantics and BLOCKED never passing). A brand build EXTENDS
   that file with the checks below, it never rewrites it.
   - SEED LEAK: everything under src/sections/, public/exports/, the
     Knap demo route and the seed values in brand/tokens.json are Odense
     Basket reference content. A brand build replaces ALL of it; the
     seed-leak check fails the build if the seed brand's name, copy or
     core hex survives anywhere in src/ or output/. Chrome (routes,
     shell) derives every visible brand string from brand.config, never
     hardcodes one.
   - PRERENDER COMPLETENESS: every chapter and component detail page is
     prerendered into output/. Dynamic routes need explicit entries in
     react-router.config prerender() (derive the list from the component
     registry, never maintain it by hand). 3 pages next to a 16-entry
     registry means an SPA shell shipped, not a portal.
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
   - LICENSED MANIFEST: every file under `intake/licensed/` has a line
     in `intake/licensed/LICENSES.md` (item, licensor, license type,
     scope, expiry); unmanifested files FAIL, expiries within 30 days
     warn (the template gate's licensed-manifest check)
   - applications: every scenario in Ch.10 (deck, offer, signature, SoMe
     formats, OOH) has a matching downloadable native template in Ch.13
     (with its `{name}.instructions.md` sidecar) AND a generated in-situ
     mockup on its page (.idml is designer-supplied and presence-checked;
     mockups are Playwright screenshots of token-styled scene templates)
   - GATING LEAK SCAN: no gated-chapter slug, content canary string, or
     personal email appears anywhere in the public output (llms*.txt, .md
     twins, sitemap, Pagefind index, JS chunks), gated chapters build into
     the /gated/ subtree only. Gated slugs live in `brand/gated.config.ts`
     (never bundled); gated entries in brand.config.ts carry an empty
     slug. The scan matches BARE slug strings in public .js, not only
     href-shaped ones. The personal-data denylist the scan uses is read
     from a gitignored file (e.g. `intake/pii.json`), never inlined in a
     committed script.
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

6.5. **Design handover (Figma), optional and auth-gated.** When the Figma
MCP is connected, run the `figma-kit` skill after validate passes: it
generates the brand's Figma library FROM tokens.json (Ref + Sys
variable collections with the brand's theme modes, scopes and
var(--sys-*) code syntax, text styles, foundation pages, one
variable-bound component per inventory entry) and writes the file URL
into brand.config.ts `figma.fileUrl`, which lights the portal's
FIGMA-BIBLIOTEK chips. One direction only: Figma is generated from
tokens, hand edits in Figma are drift to flag, never merge. Brand
purity: no community kits or foreign libraries in a brand kit.
Sequential tail: use_figma calls never run in the parallel waves. No
Figma auth, or file creation refused (some plans reject their own
whoami planKey, ask the builder for an empty file URL instead) →
degrade cleanly, note it in the handover, never block the build.

GIT DISCIPLINE, the whole way through: a brand build runs on a
`brandos/<brand>` branch, never on main, and commits at every
milestone: capture complete, sampling recorded, reconciliation opened,
theme generated, chapters authored, validate green. An entire build
sitting uncommitted in a working tree (seen twice in the field, both
recoverable only by luck) is a FAIL in the handover. The build stamp in
changes.json must match HEAD, and validate warns on a dirty tree.
Client repos never carry template reference material: `docs/reference/`
stays in the template repo only.

6.7. **Browser verification loop, mandatory and self-correcting.** After
every `npm run build`, the agent verifies the served output IN A REAL
BROWSER and fixes what it finds: diagnose in source, fix, rebuild,
re-verify, and repeat until every check holds. Never hand over with a
known-failing check; never ask the user to click through and report
back. The checklist, every item verified against the running portal:

- Every prerendered page loads; console has zero errors; no failed
  requests for same-origin assets (read console + network, not vibes).
- Fonts actually painted: document.fonts resolves the brand faces, no
  fallback-only rendering (the Elgiganten portal shipped its whole
  body in fallbacks without anyone noticing).
- Theme: all states paint (data-theme stamped pre-hydration, body
  background changes per state, standard resolves to the brand
  default). Computed styles checked, not assumed: the CSS-layering
  bug survived every non-computed check.
- Language switch (when the brand lists 2+ langs): chrome AND content
  flip, html lang updates.
- Lenses: dev expands token tables and inlines code; generel folds
  them; detail pages open on the lens's tab.
- Search: palette opens, a known term returns hits, Enter jumps and
  flashes the target; /help renders.
- Pager and anchors: arrows update the status, anchor jumps land
  below the fixed nav (scroll offset), gated entries show muted with
  no dead links.
- Downloads: every chip href fetches 200; external chips open in a
  new tab.
- Components: previews render the real components, code popups open
  and close, tabs switch.
  HARNESS NOTES: in Claude Code use the browser pane tools; a hidden
  pane does not composite frames, so smooth scrolling, screenshots and
  IntersectionObserver callbacks stall there. That is a pane artifact,
  not a site bug: verify those paths with computed state (scroll
  positions, class lists, seeded status) and take screenshots only when
  the pane is displayed. In Codex or headless CI, run the same
  checklist through Playwright (microsoft/playwright-mcp, or an
  @axe-core/playwright script). Record the checklist results and every
  fix the loop made in the handover.

7. **Publish.** When validate is green, build and open AUTOMATICALLY: run
   `npm run build`, serve the result in the background (`npm run preview`)
   and open the URL in the user's browser or preview pane without being
   asked; the build is not "done" until the portal is on screen in front
   of the user, verified by the loop in 6.7. `npm run build` → the finished portal lands in `output/` as
   a static React site, as light and few-file as the stack allows
   (prerendered HTML per route, one CSS file, minimal JS chunks, the AI
   files). Deploy that folder. Bump the version stamp and changelog in
   brand.config.ts by hand when publishing. (ROADMAP: `npm run release`
   will do this atomically with versioned token tarballs under /exports/;
   it does not exist yet. npm publishing stays an explicit CI opt-in under
   the NM org, never a default.)
   The output governs its own future: build-ai writes AGENTS.md (rules for
   any AI editing the deployed portal: tokens-only values, no new colors or
   fonts, no AI-tell prose, never touch the machine files or /gated/),
   extracts every GØR/UNDGÅ row into brand/rules.json (+ a copy in the
   output), and emits the per-brand skill (.claude/skills/brand/) so
   agents in the repo load the brand's law automatically.
   THE BRAND MCP is the third agent-interface tier (context: llms.txt,
   instructions: the skill, EXECUTABLE CHECKS: `npm run mcp`): eight
   tools (brand_info, get_token, list_tokens, check_contrast with
   ladder-based fix suggestions, check_copy against the termbank,
   get_ladder, get_rules, list_exports) plus the contract files as
   resources, answered from brand/ data with the gate's own math.
   Register per client: `claude mcp add <brand> -- node
scripts/mcp-server.mjs`. Template-owned machinery; reads only
   brand/ files.
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
authors the theme per step 2 (evidence-bound, AA-gated). The theme lock
ends wave 0.

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
  validate greps generated copy for the machine-checkable subset of this
  list (see C1 in scripts/validate.mjs); the full list binds the writer
  either way.
- NEVER the generic AI look: rounded-card grids, centered-everything,
  gradient heroes, uniform radius, emoji headers. Containment, radius and
  alignment must cite evidence from `intake/` (the `sys.composition`
  profile). A brand that boxes nothing gets a portal that boxes nothing,
  default to rules and whitespace, not cards.
- PORTAL STRUCTURE (the document model, same for every brand):
  - The guide is ONE scrolling document. EVERY SUBSTANTIAL BLOCK gets its
    own viewport-height page on desktop: a palette, a rules pair, a
    specimen set, each component, each rendered by `GuidePage`
    (min-height 100svh, flex-centered) with `data-page`, `data-label`
    and `data-chapter`. Those attributes are the only registration a
    page needs. Pages register in the PAGES list of the index route; the
    first page of a chapter carries the chapter's anchor slug.
  - The document OPENS WITH A COVER: the brand mark (the captured logo,
    from brand/logos/, never drawn from memory), the brand name and
    tagline, full viewport. The contents index is its own page after it.
  - Navigation is DOM-driven, never a second list to maintain: the top
    bar (`TopNav`) scroll-spies the section anchors and holds only the
    chapter links and the Lys/Mørk toggle; the bottom-right pager
    (`PageNav`) reads the rendered `[data-page]` sections and flips one
    page at a time; the settings gear (linse, tema, sprog) lives in the
    pager, bottom-right.
  - Chapter order and page numbers come from `brand.config.ts` alone;
    sections register in the `SECTIONS` map in the index route. Unbuilt
    chapters are absent, gated chapters appear muted as LÅST.
  - Component detail pages (the 4-tab contract) and the /theme QA surface
    are separate routes in the same frame; the pager shows only the gear
    there.
  - Ctrl/Cmd+F opens the search palette (`SearchPalette`): a centered
    overlay that indexes the rendered document on open, ranks headings
    first, and jumps to the hit (revealing its page and flashing the
    element). It searches what is actually on the page, never a second
    content store.
  - Content reveals once on scroll (`useScrollReveal` + `[data-reveal]`),
    driven by the brand's own motion tokens, off under
    prefers-reduced-motion.
  - `docs/reference/molslinjen-brandguide/` is the REFERENCE for this
    structure: study it for setup cleanliness (DOM-driven nav, data-first
    content pages, interactive escape hatch). It is NOT a template; never
    copy its brand, colors, graphics, fonts or copy into a build.
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
  - IMAGERY: pages use the brand's CAPTURED pictures, and CURATION IS A
    MANDATORY BUILD STEP, not an option: after intake, select the
    strongest captured images per chapter need into `public/images/`
    with a `public/images/manifest.json` (file, source page, rights
    note) and wire their `src` into `ImageFrame`. Motif slots are ONLY
    for subjects the capture genuinely lacks. A built portal with zero
    photographs while the capture holds usable ones is a DEFECT (the
    gate's imagery-usage check fails it). Rights at curation: images
    from the client's own pages are client-owned; EXCLUDE files whose
    names or sources reveal stock or press agencies (colourbox,
    shutterstock, getty, unsplash, ritzau) and any identifiable
    children; note photographer credits where visible. Never a stock
    photo, never painted imagery.
  - The same bordered container repeated as page structure is the tell.
    If two adjacent sections wear identical boxes, remove the boxes.
  - Corner radius comes only from `sys.radius` tokens and belongs to
    interactive elements (buttons, inputs), not to layout containers.
  - Workspace chrome (top nav, pager, settings panel, code console) is
    exempt: it is a tool surface, not brand content.
- Builds are reproducible from the committed lockfile: never update
  dependencies during a brand build; `engines`/.nvmrc pin Node.
- MIGRATIONS LEDGER: any template commit that changes a brand-facing
  API (component props, config shape, token contract, theme/lens/lang
  types, validate expectations) MUST add an entry to
  `docs/MIGRATIONS.md` saying what brand-owned files must do about it,
  and bump `templateVersion` in the seed config together with
  `TEMPLATE_VERSION` in scripts/validate.mjs. /brandos-update applies
  those entries to brand repos; an API change without an entry strands
  every deployed portal on the old behavior.
- The template is versioned: `brand.config.ts` carries `templateVersion`;
  template upgrades happen only via the /brandos-update skill
  (.claude/skills/brandos-update/: overlay + docs/MIGRATIONS.md migration
  pass + gate + browser loop), never by hand-editing src/ in a brand repo.
- MISSING-MACHINERY EXCEPTION: if template machinery a build needs does not
  exist yet or is broken (a validate check, a build script, a gating
  mechanism), the build agent MAY add or fix it, but MUST list every such
  change under "Template drift" in the handover so it can be upstreamed
  into the template repo. Silent template edits in a brand repo are the
  drift this rule exists to catch.

## Repo map

- `.claude/skills/brandos/`, the /brandos startup command
- `.claude/skills/fetch-site/`, bundled intake engine (7 stages)
- `.claude/skills/brand/`, per-brand knowledge skill (generated in step 4)
- `intake/`, the rebuild inputs (bulk captures never committed; the
  three audit-trail files reconciliation.md, components-inventory.md and
  cvi-rules.json are)
- `brand/` + `content/`, the ONLY rebrand surface
- `src/`, invariant template machinery (shell, guide components, UI library)
- `scripts/, build-tokens / build-ai / validate (intake machinery lives in
  .claude/skills/fetch-site/scripts/; generate-theme is queued in UPSTREAM)

# Migrations

What /brandos-update must do to BRAND-OWNED files when moving a repo
across template versions. The overlay handles template-owned machinery;
these entries handle the brand's own config, sections and routes, which
the overlay never touches. Every template change that alters a
brand-facing API gets one entry here, written when the change lands.

Apply every entry between the repo's templateVersion and the target,
oldest first. The typecheck is the first net (new types break old
usage); then the gate and the browser verification loop prove the
migration.

## 0.1.0 to 0.2.0

1. **Three-state theme.** `Theme` is now `"light" | "dark" | "default"`
   ("auto" is gone). Add `sys.theme.default` to brand/tokens.json set
   to the brand's own appearance (judge from the identity: which
   surface carries it). Any brand code referencing theme "auto" moves
   to "default".
2. **Language layer.** `useTx()` from src/lens.tsx drives every
   user-facing string. Wire brand sections and routes through
   `tx({ da, en })`. TRANSLATION POLICY: never invent brand voice in a
   new language. Wire the mechanism; where no approved translation
   exists, put the source language in both slots and list every
   untranslated string in the handover for the brand owner. Set
   brand.config `langs` to what the brand actually approves.
3. **Gated slugs out of the bundle.** Gated chapters in brand.config.ts
   get `slug: ""`; real slugs move to brand/gated.config.ts (new file,
   build-scripts only). The gate's bare-slug scan enforces it.
4. **Document-scroll shell.** Chapters are sections in src/sections/
   registered in the SECTIONS map of the index route, rendered through
   GuidePage (data-page/label/chapter). Standalone chapter routes fold
   in; component detail pages stay as routes.
5. **Rules component.** Usage guidance renders as GØR/UNDGÅ pairs via
   `Rules({ dos, donts })`, one imperative sentence each. Replace
   prose-paragraph usage sections.
6. **DownloadChip semantics.** No href renders nothing (never announce
   missing artifacts); external http(s) hrefs open in a new tab. Remove
   any muted placeholder chips.
7. **Search and /help.** Site-wide search and the /help docs come with
   the shell overlay; brand sections need nothing, but HelpDocs
   contact info reads brand.config contacts, so keep role aliases
   there.
8. **/theme is dev-only.** Remove it from any prerender list; the
   react-router.config prerender() should list "/" plus component
   detail routes only.
9. **Validate extension.** If the brand rewrote scripts/validate.mjs,
   port its extra checks on top of the template's gate (the template
   file wins; brand checks append). Never lose seed-leak, key-hygiene
   or the new contrast/build-stamp/version checks.

## 0.2.0 to 0.3.0

1. **One substantial block per viewport page.** Chapter sections split
   into page-sized components (palette / rules / each component / each
   specimen set), and the index route's SECTIONS map became a PAGES
   list: `{ chapter, anchor?, label: {da,en}, wide?, render }`, with the
   chapter's anchor on its first page. Split any brand chapter that
   packs several substantial blocks into one section accordingly.
2. **Cover page.** The document opens with a cover: the brand mark
   component (`src/sections/Mark.tsx`, replaced per brand with the
   CAPTURED logo from brand/logos/, never drawn from memory), name and
   tagline; the contents index moved to its own page. The top nav shows
   the small mark next to the brand name.

## 0.3.0 to 0.4.0

1. **Layout is a build outcome.** `sys.composition` gains `coverStyle`
   (mark-led | image-led | type-led), `imageWeight` and `rhythm`
   (alternating | continuous), read from the site AND the CVI document's
   own editorial layout. The cover component branches on coverStyle
   (image-led covers point COVER_IMAGE at a captured image), and the
   page rhythm consumes the rhythm token. Add the three tokens to
   brand/tokens.json with evidence-backed values; never keep the seed's
   defaults unexamined.
2. **ImageFrame and Billedstil.** Imagery renders through `ImageFrame`:
   a captured photo, or a motif specification slot when the photo does
   not exist yet (never stock, never painted). Build Billedstil from
   crawl imagery or motif specs, page-split per the viewport-page rule.

## 0.4.0 to 0.5.0

1. **Theme machinery.** `npm run generate-theme` now exists: add
   `sys.type` {base, ratio} to brand/tokens.json (density axis picks
   the ratio band), create `brand/contrast-matrix.json` with the
   brand's pair minimums (personality axes modulate targets, floors
   stay at 4.5 for text), run generate-theme, commit
   `brand/ladders.json`. The gate now enforces the matrix (C10) and
   theme integrity (C11: anchors verbatim in ladders, ramp monotone).
2. **Color evidence.** The intake brand stage writes
   `brand/color-evidence.json` (brandScore ranking + confidence);
   reconciliation cites its numbers, and confidence under 0.6 means
   ask the client which color is primary.

## 0.5.0 to 0.6.0

1. **The brand MCP.** New template-owned machinery: scripts/mcp-server.mjs
   (npm run mcp; deps @modelcontextprotocol/sdk + zod, run npm install
   after overlay). Register it for the client:
   `claude mcp add <brand> -- node scripts/mcp-server.mjs`.
2. **Termbank.** Create brand/terms.json (Writer-style schema) from the
   CVI's terminology; every entry needs evidence. check_copy and the
   gate's term scan read it.
3. **Rules and skill as build artifacts.** build-ai now extracts every
   GØR/UNDGÅ row into brand/rules.json and emits the per-brand skill
   (.claude/skills/brand/SKILL.md). Both regenerate every build; if the
   brand hand-wrote a skill, fold its content into the guide/config so
   the generated one carries it.

## 0.6.0 to 0.7.0

1. **Image curation is mandatory.** Select the strongest captured
   images per chapter into public/images/ with manifest.json (file,
   source page, rights note; stock/press-agency files excluded by
   name), wire src into ImageFrame; motif slots only for subjects the
   capture lacks. The gate's imagery-usage check fails a portal that
   ships zero photographs while usable captures exist.
2. **Site-evidence chapters.** Brand-expression categories the crawl
   reveals (sponsors, sub-brands, campaign styles, press kits) get
   chapters automatically, UDKAST-stamped when the CVI is silent.

---
name: figma-kit
description: Generate the brand's Figma library from brand/tokens.json via the Figma MCP. Use after validate passes, or when the user asks for the Figma kit. Creates variable collections with Lys/Mork modes, text styles, foundation pages and variable-bound components, then writes the file URL into brand.config.ts so the portal's FIGMA-BIBLIOTEK chips light up.
---

# figma-kit: the generated Figma library

One direction only: Figma is generated FROM `brand/tokens.json` and the
component inventory. Never reconcile by hand-editing the kit; a re-run
regenerates it. If someone edits the kit in Figma, that is drift: flag it
in the handover, never merge it silently back into tokens.

BRAND PURITY: never import community UI kits or foreign libraries into a
brand kit. Every variable and component comes from this repo's tokens and
inventory. Skip `search_design_system` reuse for brand kits and record
that decision in the run notes.

## Preconditions

1. The Figma MCP must be connected and authenticated. Check with the
   `whoami` tool. If it is absent or unauthenticated, SKIP this step
   cleanly: note "Figma kit: skipped, no Figma auth" in the handover and
   leave `figma` unset in brand.config.ts. A build never blocks on this.
2. Load the Figma skills BEFORE any write call, they are mandatory:
   `skill://figma/figma-use/SKILL.md` and
   `skill://figma/figma-generate-library/SKILL.md`
   (and `skill://figma/figma-create-new-file/SKILL.md` before creating a
   file). Read them via the `get_figma_skill` tool.
3. `npm run validate` has passed. The kit mirrors shipped truth only.

## Target file

Try `create_new_file` with the plan key from `whoami`
(`{Brand} · BrandOS Bibliotek`, editorType `design`, drafts).

KNOWN FAILURE: some plans reject their own whoami key with
"Invalid planKey" (observed on a Pro team, 2026-08). The syntax
`team::<id>` is correct; the rejection is server-side access. Do NOT
retry in a loop. Fall back: ask the builder to create one empty Figma
design file and paste its URL; `use_figma` needs only edit rights on an
existing file. Extract the fileKey from the URL and continue.

## Build order (sequential, never parallel use_figma writes)

Follow figma-generate-library's phases. For a BrandOS kit that means:

1. **Variables.**
   - Collection `Ref` (one mode `Værdi`): every `ref` color as a
     primitive. Scopes `[]` (hidden from pickers).
   - Collection `Sys` (modes named after the brand's theme labels, e.g.
     `Lys` / `Mørk`): one variable per sys color role. Alias to Ref where
     tokens.json references `{ref.*}`; raw value where tokens.json holds
     a literal. Scopes per role: surfaces `FRAME_FILL, SHAPE_FILL`,
     text roles `TEXT_FILL`, line `STROKE_COLOR`. Code syntax WEB:
     `var(--sys-<role>)`, matching the shipped tokens.css names exactly.
   - Collection `Radius` (one mode): sys.radius as FLOAT variables,
     scope `CORNER_RADIUS`, code syntax `var(--sys-radius-*)`.
2. **Text styles.** Display and Brød from sys.font + sys.tracking +
   sys.case. Verify exact font names with `listAvailableFontsAsync`
   first; if the brand font is unavailable in Figma, use the declared
   fallback stack's first available face and flag it in the handover.
3. **Pages.** `Cover`, `Foundations · Farver`, `Foundations · Typografi`,
   then one page per component (`Komponenter · Knap`, ...). Cover carries
   brand name, version and the UDKAST stamp when the build is unverified.
4. **Foundations docs.** Farver: one swatch row per ref color bound to
   its variable, with name + hex label. Typografi: one specimen per text
   style.
5. **Components.** One page per inventory component, in dependency
   order. Auto-layout, every fill/stroke/radius bound to Sys/Radius
   variables (never raw values), variants per the component's real API
   (Knap: `Variant=Primær | Sekundær | Signal`), a `description` with the
   usage rule from the guide. Validate each with a screenshot before the
   next.
6. **Wire the portal.** Put the file URL into `brand.config.ts`:
   `figma: { fileUrl: "https://www.figma.com/design/<key>/..." }`.
   The FIGMA-BIBLIOTEK chips read it; absent URL means no chip renders.
7. **Record.** File URL, variable/style/component counts and any
   skipped-or-flagged item go in the handover and the audit trail. The
   guide itself never mentions the generation.

## Posture

- Sequential tail of the build: use_figma calls are never parallelized
  and the Figma MCP is rate-limited, so run this AFTER the parallel
  authoring waves, alongside validate.
- Small steps: at most ~10 logical operations per use_figma call,
  validate with get_metadata / screenshots between steps, return every
  created node and variable ID.
- Failures degrade, never block: on repeated MCP errors, stop, note what
  was completed plus the resume point in the handover, and let the build
  finish without the kit.

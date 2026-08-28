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

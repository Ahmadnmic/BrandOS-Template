---
name: brandos-update
description: Update an existing BrandOS brand repo to the latest template from GitHub. Use when the user types /brandos-update, asks to "update the template", "pull the latest BrandOS", or validate warns the clone is behind the template. Overlays template-owned files, preserves everything brand-owned, re-runs the full gate and the browser verification loop, and commits the upgrade.
---

# /brandos-update: pull the latest template into a brand repo

Template source: https://github.com/Ahmadnmic/BrandOS-Template.git

## Preconditions, check in order

1. This is a brand repo: `brand/brand.config.ts` exists. In the template
   repo itself (brand name "Odense Basket"), say `git pull` is all it
   needs and stop.
2. Clean working tree. Uncommitted changes? Ask the user to commit or
   stash first; never overlay onto dirty state.
3. Read `templateVersion` from brand.config.ts and tell the user what
   they are on before fetching.

## Ownership map, the heart of the operation

TEMPLATE-OWNED, overlay from the template:

- `scripts/` (build-tokens, build-ai, validate; keep any brand-added
  scripts that do not collide by name)
- `src/components/shell/`, `src/components/guide/`, `src/hooks/`,
  `src/lens.tsx`, `src/app.css`
- `.claude/skills/brandos/`, `.claude/skills/fetch-site/`,
  `.claude/skills/figma-kit/`, `.claude/skills/brandos-update/`
- `AGENTS.md`, `docs/GUIDE.md`
- `package.json` scripts block (merge, never wholesale replace) and
  new devDependencies the template requires

BRAND-OWNED, never touched:

- `brand/` (config, tokens, assets, gated.config, voice)
- `src/sections/`, `src/routes/`, `content/`, any registry module
- `intake/`, `public/`, `output/`
- `.claude/skills/brand/` (the per-brand answer skill)
- `.env`, `access.config.json`

CONFLICT-PRONE, diff and decide (show the diff, apply only what is
machinery, keep what is brand):

- `src/root.tsx` (template machinery + brand font imports live here
  until fonts move to the brand surface)
- `react-router.config.ts` (brands wire registry-driven prerender here)
- `src/components/ui/` (template seeds components; brands rebuild them:
  keep the brand's, take only genuinely new template machinery)

## Procedure

1. `git remote add brandos-template https://github.com/Ahmadnmic/BrandOS-Template.git`
   (skip if it exists), `git fetch brandos-template`.
2. New branch: `template-update/<date>`.
3. Show the user a short summary of what changed upstream:
   `git log --oneline <merge-base>..brandos-template/main` and the new
   templateVersion.
4. Overlay template-owned paths:
   `git checkout brandos-template/main -- <each template-owned path>`.
5. Walk the conflict-prone files with diffs; merge machinery by hand,
   keep brand content. When unsure, ask, one question with both diffs.
6. `npm install` if package.json changed.
7. Update `templateVersion` in brand.config.ts to the new template
   version and add a changelog line.
8. Run the full gate: `npm run build`, `npm run validate` (must be
   green, BLOCKED only where it was BLOCKED before), then the browser
   verification loop from AGENTS.md step 6.7 against the served output.
   A check the old portal passed may never fail after the upgrade; fix
   or revert path by path until the loop is clean.
9. Commit on the branch: "Template upgrade to <version>", listing the
   overlaid paths and every manual merge decision. Merge to the brand's
   working branch when the user says go.

## Hard rules

- Never overwrite brand-owned paths, whatever the diff says.
- Never upgrade onto a dirty tree.
- Never call it done without the gate green and the browser loop clean.
- Record the upgrade (from-version, to-version, conflicts resolved) in
  the handover and the brand.config changelog.

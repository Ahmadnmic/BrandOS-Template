# BrandOS, Operator Guide

How to take a client from "we have a website and a PDF brand guide" to a
live Brand OS. Written for the NM team; the AI does the heavy lifting, you
make the calls.

## Before you start

You need exactly two things:

| Input                          | What it is                                          | Where it goes                                                                   |
| ------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------- |
| The client's site URL          | Their live website, evidence of reality             | captured automatically into `intake/crawl/`                                     |
| The official CVI / brand guide | PDF, deck or files, the law                         | `intake/cvi/` (you hand it over when asked)                                     |
| ...or a live guide site        | designguide subdomain, Frontify, Corebook, Brandpad | give the URL; it is captured into `intake/cvi-site/`                            |
| Licensed material (optional)   | bought fonts, image packs, purchased templates      | `intake/licensed/` + one line per item in `LICENSES.md`, any time before step 3 |

And once per machine: copy `.env.example` to `.env` and paste your Firecrawl
API key into the file yourself (`FIRECRAWL_API_KEY=fc-…`). The key stays in
`.env`, which is gitignored, never paste it into the chat, never commit it;
the scripts read the file directly. Static/SSR client sites work without a
key (direct mode).

Crawl scope rules: only extend `--asset-hosts` to domains the client
confirms they own or control; font binaries from foundry CDNs are never
harvested (they're licensed elsewhere); and an intake-harvested photo enters
the redistributable image pack only after you explicitly confirm its rights
(license scope, identifiable people).

## The build, step by step

### 1. Start

Open the repo in Claude Code (or any agent that reads AGENTS.md) and type:

```
/brandos https://client.dk
```

### 2. The capture (automatic)

The agent runs the bundled fetch-site engine: maps every page (sitemap +
Firecrawl deep map), scrapes them all, harvests every asset at full
resolution, extracts the components actually in production (real HTML + CSS),
pulls the de facto brand data (colors, fonts, usage counts), builds an
offline mirror and machine-readable indexes. You'll get a capture summary:
pages, assets, components found.

### 3. Hand over the CVI

Drop the design guide into `intake/cvi/` when asked (or just give the agent
the file). This is your last required action before review.

### 4. Reconciliation, the calls only you can make

Conflicts between the guide and the live site are decided by evidence
weight. Normally the agent shows you both values with the evidence for each
(how consistently the site uses it; how explicit the guide is) and asks:
"should I use this element from the site or from the guide?", you choose,
per element. Only when the evidence is overwhelming one way (a value used
consistently across hundreds of live pages while the guide's variant appears
nowhere, or a guide that explicitly supersedes the old site) does the agent
decide itself. Every conflict, the evidence, and who decided is recorded in
`intake/reconciliation.md`. The agent never decides silently, and never
invents values found in neither input.

You'll also be asked to confirm the **personality profile** (skarp/blød,
tæt/luftig, teknisk/menneskelig, rolig/kinetisk, rå/poleret, bokset/åben)
before the theme is generated, this drives the entire design language:
radius, density, casing, motion, composition. Sanity-check it against your
gut feel for the brand; the mapping is deterministic, so the same profile
always gives the same theme.

### 5. Validation (automatic, but read the report)

`npm run validate` must pass before anything ships. The template gate
covers today: writing rules, key hygiene, seed leak, prerender
completeness, gated leak (including bare slugs in public JS chunks),
print truth (CMYK), licensed manifest, build stamp and template version;
it writes its report to `docs/validate-report.md`. A brand build EXTENDS
the gate with WCAG 2.2 AA (contrast + axe + keyboard), token lint,
asset license/expiry, and full coverage: every crawled component
rebuilt, every CVI rule homed, every application scenario backed by a
downloadable artifact. BLOCKED (missing input) is never a pass.

### 6. Review & ship

Check the `/theme` route on the DEV server (the full generated theme,
every token and state; it is dev-only and excluded from the shipped
output), click through the portal in Standard, Lys and Mørk, then deploy
the static build to the client's domain (`brand.client.dk`).

## After launch

- **Updating the brand:** edits go through `brand/` + `content/`; bump
  the version stamp and changelog in `brand.config.ts`, rebuild, re-run
  validate. (ROADMAP: `npm run release` will do this atomically with a
  subscriber digest and a versioned tokens tarball; it does not exist
  yet, do it by hand until it does.)
- **Template upgrades:** never hand-edit `src/` in a brand repo.
  `templateVersion` in `brand.config.ts` records where each portal
  stands, and `npm run validate` warns when a clone is behind the
  template. (ROADMAP: `npm run upgrade-template` will overlay new
  machinery and run migrations; until it exists, pull template commits
  manually and re-run validate.)
- **Access:** manage the partner allowlist (external agencies, with expiry
  dates) in the gitignored `access.config.json`, it's PII, so it never goes
  in git; the deploy script provisions it to the access layer, and
  offboarding is deleting a line. Public pages show role aliases only
  (brand@client.dk), create those aliases at onboarding.
- **Fonts:** downloadable font packs sit in the gated area unless the
  typeface is explicitly open-licensed (OFL/Apache), a client EULA must be
  checked before ungating; validate enforces this.
- **Corrections:** every portal page has a "Meld en fejl" link that lands
  with you, prefilled with page and version.
- **Never** edit component styling directly, hardcode a hex, or resolve a
  reconciliation conflict on the agent's behalf without recording it.

## FAQ

**The client has no CVI.** Then there is nothing to reconcile against, the
crawl becomes the primary source and you flag every derived rule for client
sign-off. Expect more questions from the agent; that is correct behavior.

**The client's site is behind a login / mostly an app.** Use direct mode on
the public pages plus whatever design files exist; the component inventory
will be thinner and the Komponenter chapter is built from the CVI + Figma
instead.

**Can the client edit the portal themselves?** Not in v1 (deliberate, no
CMS, no drift). They propose changes via the portal's change-request links;
NM commits them. Revisit if a client demands self-serve.

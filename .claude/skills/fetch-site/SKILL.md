---
name: fetch-site
description: >-
  Mirror an entire website into an organized, offline-browsable, AI-indexed local folder:
  map all URLs (sitemap + Firecrawl), scrape every page, download every asset (images at
  original resolution, fonts, CSS, JS, PDFs), extract a reusable UI component library,
  extract brand design tokens (colors, typography, logos), rewrite pages for offline use,
  and generate machine-readable indexes (AGENTS.md, pages.json, components.json, assets.json,
  brand.json). Use this whenever the user wants to scrape, mirror, clone, archive, or capture
  a website; "save the whole site", "download everything from <url>", "make a component
  library from this site", "extract the brand from this site", or wants site content/assets
  organized locally, even if they don't say the word "scrape".
---

# fetch-site, mirror a website into an organized component library

Turns any public website into:

```
<out>/
├── AGENTS.md, manifest.json, pages.json, SITEMAP.md,     AI-readable indexes
│   components.json, assets.json, brand.json
├── pages/<route>/index.html (+ content.md, payload.json)  every page, offline-browsable
├── components/<Name>/                                     extracted UI components + gallery
├── css/  js/                                              the site's full build output
├── assets/images|fonts|videos|other/                      all downloadable assets
├── brand/tokens.css, colors.html, typography.md, logos/   design tokens
└── _meta/                                                 pipeline state (url list, manifests)
```

## Before you start

1. **Rights**: everything captured is the site owner's copyrighted property. Mirroring for
   reference/analysis is what this skill is for; tell the user that shipping the assets in a
   product requires permission. Refuse targets that are paywalled accounts or require
   circumventing access controls.
2. **Dependencies**: Node 18+. Run `npm install` once inside this skill's `scripts/` directory
   (installs cheerio).
3. **Firecrawl** (optional but better): if `FIRECRAWL_API_KEY` is set, mapping finds pages
   beyond the sitemap and scraping renders JavaScript. The scripts load the nearest `.env`
   automatically (cwd upward), have the user put the key in the repo's gitignored `.env`
   themselves; NEVER export it on a shell command line (shell commands are logged) and never
   write it into output files. Only extend `--asset-hosts` to hosts the client confirms they
   own/control, and never harvest font binaries from foundry CDNs (Adobe Fonts/Typekit etc.)
   , record those as licensed-elsewhere instead and point the user to `intake/licensed/`:
   they drop their own licensed copies there with a line each in `LICENSES.md`. Without a key the pipeline still works via direct fetch,
   but **only for SSR/static sites**, a client-rendered SPA will yield empty shells, so check
   the first page's HTML and warn the user if it has no real content.

## CVI-site capture mode (live brand guides)

The same pipeline captures a LIVE CVI (a designguide subdomain, or a
Frontify / Corebook / Brandpad-hosted guide) as its own corpus:

```bash
node map.mjs    --url <guide-url> --out <repo>/intake/cvi-site --max-pages 60
# then stages 2-7 with the same --out
```

- One blocking pass, no two-stage and no stratification: guide sites are
  small and the guide is the law, capture all of it.
- Guide platforms are JS shells; expect the hybrid scrape to escalate
  most pages to Firecrawl. Without `FIRECRAWL_API_KEY` a JS-rendered
  guide yields empty shells: stop and ask the user for exports instead.
- Harvest the guide's downloadable brand packs (logo zips, EPS/SVG,
  font files, PDF editions) via the assets stage; extend `--asset-hosts`
  only to hosts the guide itself serves its packs from.
- Never bypass a login-protected guide; ask for exports or access.
- Keep the corpus SEPARATE from the production crawl (`intake/crawl/`):
  the crawl is de facto evidence, the guide capture is de jure law. The
  guide's own shipped stylesheets and font binaries are guide-grade
  truth, usually sharper than a PDF's approximations.

## Pipeline, run the stages in order

All scripts live in this skill's `scripts/` dir and share the same arguments:
`--url <https://site.com> --out <absolute-output-dir>`. Run them from the `scripts/` dir.
Each stage is idempotent (re-runs skip completed downloads) and logs a summary, read it
before moving on, and fix/re-run a stage rather than continuing on top of a bad one.

```bash
node map.mjs        --url <site> --out <dir> [--max-pages N]      # 1. URL discovery
node scrape.mjs     --url <site> --out <dir> [--direct]           # 2. fetch all pages
node assets.mjs     --url <site> --out <dir> [--asset-hosts h1,h2]# 3. download all assets
node components.mjs --url <site> --out <dir>                      # 4. component library
node brand.mjs      --url <site> --out <dir>                      # 5. design tokens
node rewrite.mjs    --url <site> --out <dir>                      # 6. localize URLs
node aiindex.mjs    --url <site> --out <dir> [--name "Brand"]     # 7. AI indexes
```

Long stages (2 and 3) can take many minutes on large sites, run them in the background and
check their logs. Batch scraping 100+ pages through Firecrawl queues on plan concurrency;
that's normal, keep waiting.

### Stage notes, what to check and how to adapt

**1. map**, merges `sitemap.xml` (follows sitemap-index files), robots.txt sitemaps, and
Firecrawl `/v2/map`. Normalizes to one host, strips query/hash, drops binary URLs. Review the
count: hundreds is normal; tens of thousands means ask the user about scope or use
`--max-pages`.
TWO-STAGE PATTERN (the BrandOS default): run a blocking FAST PASS first, one page per
discovered page type (~15-25 pages), and take stages 2-7 through on that subset so
downstream work can start in minutes; then launch the full stratified crawl as a background
DEEP PASS. Never run the two in parallel, they share rate limits. The stages are idempotent,
so re-running them on the full set extends the fast-pass output in place.
CRITICAL, and this applies EVERY time a cap is in play (BrandOS default: `--max-pages 150`):
never take the first N URLs. Large sites (e-commerce especially) map to 95%+ product/detail
pages, which poisons the component inventory with one template. The capped sample must
represent every page type the site has, never N of one type. STRATIFY across page types
first: harvest the site's own HTML sitemap page and
the nav of the main hub pages to recover the real structure, then spread the cap across
every page type found (categories, content/magazine, customer service, corporate, stores,
campaigns, brand pages, B2B, services, plus products across their categories). Record the
sampling decision and the strata in the output's `_meta/` so the audit trail shows how the
sample was built.

**2. scrape**, CREDIT-OPTIMIZED HYBRID by default: (a) pages already captured on disk are
skipped (0 credits, the deep pass never re-bills fast-pass pages); (b) everything else is
plain-HTTP fetched first (0 credits) and classified; (c) only JS-shell pages and blocked
fetches (403/429/network) escalate to Firecrawl batch (1 credit/page); dead URLs (404/410)
are never escalated because Firecrawl bills processed error pages. `--direct` never calls
Firecrawl; `--force-firecrawl` bills every page (pre-hybrid behavior); `--fresh` ignores the
local capture. The final counts line shows `cached-local` / `direct` / `firecrawl` / `failed`
plus an estimated credit spend. ALWAYS persist that summary to
`_meta/credits.json` (mapped calls, scrape counts by mode, estimated credits)
so every run's spend is auditable without counting manifest lines.

### Credit economics (verified against docs.firecrawl.dev/billing, Aug 2026)

- Scrape/crawl: 1 credit per page. Map: 1 credit per call. Batch status polling: free.
- Bundled formats (rawHtml + markdown + links) cost nothing extra; surcharges only for
  json/LLM extraction (+4/page), PDF parsing (+1/PDF page, disabled here via `parsers: []`),
  prompt-injection check (+4/page), zero-data-retention (+1/page). This pipeline uses none.
- Firecrawl's maxAge cache makes re-scrapes faster but NOT cheaper: cache hits still bill
  1 credit. The local capture skip is the only real re-run saver, which is why it is the
  default.
- Pages Firecrawl processes that return 403/404 still bill; the hybrid pass filters dead
  URLs out before escalation and never blind-retries consistently blocked URLs.
- Enhanced (formerly stealth) proxies no longer carry a surcharge; the default auto mode is
  fine. Ignore third-party posts citing 5 credits per stealth request, that pricing ended.
- Expected spend per BrandOS build: 1 (map) + only the JS-rendered share of the fast pass
  (~0-25) + only the JS-rendered share of the deep pass minus everything already captured.
  SSR/static sites: ~1 credit total.

**3. assets**, three harvest rounds: (a) everything referenced in page HTML, stylesheets,
scripts, module preloads, `img`/`source`/`srcset`, video+poster, og:image, favicons, inline
`style` url(), document links; (b) `url()` refs inside downloaded CSS (fonts, background
images) resolved against each CSS file's remote URL; (c) framework data payloads (Nuxt
`__NUXT_DATA__`). Images with resize/CDN query params are stripped to the original full-res
file; Next.js `/_next/image?url=` proxies are unwrapped. Only first-party hosts (same
registrable domain) are downloaded, the log lists skipped external hosts with counts; if one
is clearly the site's CDN (e.g. `cdn.example-media.net`), re-run with `--asset-hosts`.

**4. components**, two modes, auto-detected:

- _Named mode_ (Nuxt/Vite builds that code-split CSS per component as `Name.hash.css`): each
  CSS file defines a component; its rendered HTML instances are found across all pages by
  class match (outermost element, deduped by DOM-structure hash, up to 4 variants). This is
  the high-quality path, the site's own component boundaries.
- _Generic mode_ (monolithic CSS): extracts `header`/`footer`/`nav` plus top-level page
  sections, grouped by root class signature.
  Components that only mount client-side (booking flows, logged-in areas) get CSS-only folders
  with a README. Output: `components/<Name>/` with scoped CSS, `variant-N.html` files, and a
  standalone `index.html` preview; `components/index.html` is the gallery.

**5. brand**, `:root` custom properties + `@font-face` → `brand/tokens.css`; color usage
audit → `brand/colors.html`; font stacks → `typography.md`; logo-named images, favicons and
large inline header/footer SVGs → `brand/logos/`.

**6. rewrite**, rewrites every mapped remote asset URL in the saved pages (absolute and
root-relative, including `&amp;`-encoded srcset variants) to relative local paths, and points
framework payload references at local copies. After this, pages browse offline with full
styling, but without JS hydration, so interactive widgets render static.

**7. aiindex**, generates the machine-readable layer: `AGENTS.md` (entry point),
`manifest.json` (totals, provenance, entry points), `pages.json` (route, title, meta
description, lang, section, file paths), `SITEMAP.md`, `components.json` (status, CSS class
names for search), `assets.json` (local path, bytes, source URL), `brand.json` (tokens as
data). Pass `--name` to set the brand name.

## Verify before reporting done

- Open one component preview and the homepage mirror; confirm styling and images are local
  (`grep 'https://' pages/home/index.html` should show only third-party leftovers).
- Check `pages.json` count matches the mapped URL count.
- Videos: sites rarely self-host, if video is Vimeo/YouTube embeds, the assets stage writes
  `assets/videos/embeds.md` indexing them instead of ripping streams (don't).

## Report to the user

Summarize: page count, asset counts by type + total size, component counts (rendered vs
CSS-only), brand token counts, entry points (`components/index.html`, `AGENTS.md`), failures
(404s on the site's own CDN are their dead links, report, don't retry forever), and the
rights caveat.

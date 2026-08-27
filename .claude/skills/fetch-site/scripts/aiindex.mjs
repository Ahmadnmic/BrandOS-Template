// Stage 7: machine-readable indexes — AGENTS.md, manifest.json, pages.json, SITEMAP.md,
// components.json, assets.json, brand.json
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { parseArgs, siteConfig, walk, readJSON, writeJSON } from './lib.mjs';

const cfg = siteConfig(parseArgs());
const brandName = String(cfg.args.name || cfg.host.replace(/^www\./, ''));
const COMP = path.join(cfg.out, 'components');
const CSSDIR = path.join(cfg.out, 'css');
const rel = p => path.relative(cfg.out, p).replace(/\\/g, '/');
const crawledAt = new Date().toISOString().slice(0, 10);

// ---- pages.json + SITEMAP.md ----
const pages = [];
for (const f of walk(cfg.pages)) {
  const dir = path.dirname(f);
  const route = '/' + rel(dir).replace(/^pages\//, '').replace(/^home$/, '');
  const $ = cheerio.load(fs.readFileSync(f, 'utf8'));
  pages.push({
    route,
    url: 'https://' + cfg.host + (route === '/' ? '/' : route),
    title: ($('title').first().text() || '').trim(),
    description: ($('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '').trim(),
    lang: $('html').attr('lang') || '',
    section: route === '/' ? 'home' : route.split('/')[1],
    files: {
      html: rel(f),
      markdown: fs.existsSync(path.join(dir, 'content.md')) ? rel(path.join(dir, 'content.md')) : null,
      payload: fs.existsSync(path.join(dir, 'payload.json')) ? rel(path.join(dir, 'payload.json')) : null,
    },
  });
}
pages.sort((a, b) => a.route.localeCompare(b.route));
writeJSON(path.join(cfg.out, 'pages.json'), { count: pages.length, pages });

const bySection = {};
for (const p of pages) (bySection[p.section] ||= []).push(p);
fs.writeFileSync(path.join(cfg.out, 'SITEMAP.md'), `# ${brandName} mirror — ${pages.length} routes by section\n\nEach route maps to \`pages<route>/index.html\`. Root route is \`pages/home/\`.\n\n` +
  Object.entries(bySection).sort((a, b) => b[1].length - a[1].length)
    .map(([sec, list]) => `## ${sec} (${list.length})\n` + list.map(p => `- \`${p.route}\` — ${p.title || '(no title)'}`).join('\n')).join('\n\n') + '\n');

// ---- components.json ----
const components = [];
if (fs.existsSync(COMP)) {
  for (const d of fs.readdirSync(COMP).filter(f => fs.statSync(path.join(COMP, f)).isDirectory()).sort()) {
    const dir = path.join(COMP, d);
    const files = fs.readdirSync(dir);
    const variants = files.filter(f => /^variant-\d+\.html$/.test(f)).sort();
    const cssFiles = files.filter(f => f.endsWith('.css'));
    const classes = new Set();
    for (const cf of cssFiles) {
      const selectorsOnly = fs.readFileSync(path.join(dir, cf), 'utf8').replace(/\{[^{}]*\}/g, '{}');
      for (const m of selectorsOnly.matchAll(/\.([a-zA-Z_][a-zA-Z0-9_-]*)/g)) classes.add(m[1]);
    }
    components.push({
      name: d,
      status: variants.length ? 'rendered' : 'css-only',
      preview: variants.length ? `components/${d}/index.html` : null,
      css: cssFiles.map(c => `components/${d}/${c}`),
      variants: variants.map(v => ({ file: `components/${d}/${v}`, bytes: fs.statSync(path.join(dir, v)).size })),
      classNames: [...classes].sort().slice(0, 40),
    });
  }
}
writeJSON(path.join(cfg.out, 'components.json'), {
  count: components.length,
  rendered: components.filter(c => c.status === 'rendered').length,
  cssOnly: components.filter(c => c.status === 'css-only').length,
  note: 'Rendered: real SSR HTML variants. CSS-only: client-side components — CSS captured, markup not in public SSR pages.',
  components,
});

// ---- assets.json ----
const assetMap = fs.existsSync(cfg.meta('asset-map.json')) ? readJSON(cfg.meta('asset-map.json')) : {};
const assets = [];
for (const [remote, local] of Object.entries(assetMap)) {
  const full = path.join(cfg.out, local);
  if (!fs.existsSync(full)) continue;
  assets.push({ path: local, category: local.startsWith('css/') ? 'css' : local.startsWith('js/') ? 'js' : local.split('/')[1], bytes: fs.statSync(full).size, source: remote });
}
assets.sort((a, b) => a.path.localeCompare(b.path));
writeJSON(path.join(cfg.out, 'assets.json'), {
  count: assets.length,
  note: 'Images are originals at full resolution (resize query params stripped). Videos are external embeds — see assets/videos/embeds.md if present.',
  assets,
});

// ---- brand.json ----
let allCss = '';
if (fs.existsSync(CSSDIR)) for (const f of fs.readdirSync(CSSDIR).filter(f => f.endsWith('.css'))) allCss += fs.readFileSync(path.join(CSSDIR, f), 'utf8') + '\n';
const vars = {};
for (const m of allCss.matchAll(/(--[a-zA-Z0-9-_]+)\s*:\s*([^;{}]+)[;}]/g)) if (!(m[1] in vars)) vars[m[1]] = m[2].trim();
const colorCount = new Map();
for (const m of allCss.matchAll(/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g)) colorCount.set(m[0].toLowerCase(), (colorCount.get(m[0].toLowerCase()) || 0) + 1);
const famCount = new Map();
for (const m of allCss.matchAll(/font-family\s*:\s*([^;{}]+)[;}]/g)) famCount.set(m[1].trim(), (famCount.get(m[1].trim()) || 0) + 1);
const fontsDir = path.join(cfg.out, 'assets/fonts');
const logosDir = path.join(cfg.out, 'brand/logos');
writeJSON(path.join(cfg.out, 'brand.json'), {
  brand: brandName,
  cssVariables: vars,
  colorsByUsage: [...colorCount.entries()].sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count })),
  fontFamiliesByUsage: [...famCount.entries()].sort((a, b) => b[1] - a[1]).map(([family, count]) => ({ family, count })),
  fontFiles: fs.existsSync(fontsDir) ? fs.readdirSync(fontsDir).map(f => 'assets/fonts/' + f) : [],
  logos: fs.existsSync(logosDir) ? fs.readdirSync(logosDir).map(f => 'brand/logos/' + f) : [],
  tokensCss: 'brand/tokens.css',
  colorAuditHtml: 'brand/colors.html',
});

// ---- manifest.json + AGENTS.md ----
writeJSON(path.join(cfg.out, 'manifest.json'), {
  name: brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-site-mirror',
  source: cfg.url,
  crawledAt,
  method: 'fetch-site skill: sitemap+Firecrawl map, batch scrape, direct CDN asset download',
  rights: `All content is the property of the ${brandName} site owner. Reference/analysis only.`,
  totals: { pages: pages.length, components: components.length, assets: assets.length },
  indexes: {
    'AGENTS.md': 'AI entry point — read this first',
    'pages.json': 'every route: title, description, lang, section, file paths',
    'SITEMAP.md': 'grep-friendly route list by section',
    'components.json': 'every component: status, css, variants, class names',
    'assets.json': 'every downloaded asset: local path, bytes, source URL',
    'brand.json': 'design tokens: css variables, colors, fonts, logos',
  },
  entryPoints: { componentGallery: 'components/index.html', homePage: 'pages/home/index.html', brandTokens: 'brand/tokens.css' },
});

const sections = Object.entries(bySection).sort((a, b) => b[1].length - a[1].length).map(([s, l]) => `${s} (${l.length})`).slice(0, 15).join(', ');
fs.writeFileSync(path.join(cfg.out, 'AGENTS.md'), `# ${brandName} site mirror & component library

> Offline capture of ${cfg.url}, crawled ${crawledAt}. ${pages.length} pages, ${components.length} extracted UI components, ${assets.length} assets. All content © the site owner — reference/analysis use.

Read manifest.json for totals and entry points. All paths are relative to this folder.

## Structured indexes (read these instead of crawling directories)

- [manifest.json](manifest.json): totals, entry points, provenance
- [pages.json](pages.json): all ${pages.length} routes with title, meta description, language, section, and file paths
- [SITEMAP.md](SITEMAP.md): grep-friendly route list grouped by section
- [components.json](components.json): all ${components.length} components — name, rendered vs css-only, preview path, CSS class names (search this to find a component by class)
- [assets.json](assets.json): all downloaded assets — local path, size, original URL
- [brand.json](brand.json): design tokens — CSS custom properties, color usage counts, font stacks, logo files

## Layout

- pages/<route>/index.html — HTML with asset URLs rewritten to local paths; content.md — markdown extract (best for reading page content); payload.json — structured framework data where present
- components/<Name>/ — CSS + rendered HTML variants + standalone preview (components/index.html is the gallery)
- css/, js/ — the site's build output
- assets/images|fonts|videos|other — downloaded files
- brand/ — tokens.css, colors.html swatch audit, typography.md, logos/

## Tips for AI agents

- To read page content, prefer pages/<route>/content.md over index.html (raw HTML, large).
- To find a component: search components.json classNames, or grep css/ for a selector.
- To find an image: search assets.json by filename or source URL.
- Page sections: ${sections}.
`);

console.log('[aiindex] DONE — pages:', pages.length, '| components:', components.length, '| assets:', assets.length, '| vars:', Object.keys(vars).length);

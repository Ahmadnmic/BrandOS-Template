// Stage 4: component library. Named mode when the build code-splits CSS per component
// (Nuxt/Vite "Name.hash.css"); generic mode (semantic + top-level sections) otherwise.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as cheerio from 'cheerio';
import { parseArgs, siteConfig, walk, readJSON, writeJSON } from './lib.mjs';

const cfg = siteConfig(parseArgs());
const CSSDIR = path.join(cfg.out, 'css');
const COMP = path.join(cfg.out, 'components');
const assetMap = fs.existsSync(cfg.meta('asset-map.json')) ? readJSON(cfg.meta('asset-map.json')) : {};

function rewriteAssets(html, relPrefix) {
  return html.replace(/https?:\/\/[a-z0-9.-]+\/[^"'\s)]+/gi, (m) => {
    const decoded = m.replace(/&amp;/g, '&');
    let base;
    try { const u = new URL(decoded); u.search = ''; base = u.href; } catch { return m; }
    const local = assetMap[decoded] || assetMap[base];
    return local ? relPrefix + local : m;
  });
}

function structureHash($, el) {
  const parts = [];
  (function rec(node, depth) {
    if (depth > 6 || node.type !== 'tag') return;
    parts.push(depth + node.name + '.' + ($(node).attr('class') || '').split(/\s+/).sort().join('.'));
    for (const ch of node.children || []) rec(ch, depth + 1);
  })(el, 0);
  return crypto.createHash('md5').update(parts.join('|')).digest('hex').slice(0, 10);
}

const cssFiles = fs.existsSync(CSSDIR) ? fs.readdirSync(CSSDIR).filter(f => f.endsWith('.css')) : [];
const named = new Map(); // name -> {cssFiles, classes}
let entryCss = null;
for (const f of cssFiles) {
  const m = f.match(/^([A-Za-z][A-Za-z0-9_-]*?)\.[A-Za-z0-9_-]+\.css$/);
  if (!m) continue;
  if (/^(entry|main|app|index|style|global)$/i.test(m[1])) { entryCss = entryCss || f; continue; }
  if (!named.has(m[1])) named.set(m[1], { cssFiles: [], classes: new Set() });
  const comp = named.get(m[1]);
  comp.cssFiles.push(f);
  const selectorsOnly = fs.readFileSync(path.join(CSSDIR, f), 'utf8').replace(/\{[^{}]*\}/g, '{}');
  for (const cm of selectorsOnly.matchAll(/\.([a-zA-Z_][a-zA-Z0-9_-]*)/g)) comp.classes.add(cm[1]);
}
const NAMED_MODE = named.size >= 5;
console.log(`[comp] mode: ${NAMED_MODE ? 'named (per-component css splitting)' : 'generic (semantic sections)'} — named css files: ${named.size}`);

const pageFiles = walk(cfg.pages);
const instances = new Map(); // name -> Map(hash -> {html, page, size, cssFiles})
function addInstance(name, hash, inst) {
  if (!instances.has(name)) instances.set(name, new Map());
  const store = instances.get(name);
  if (!store.has(hash) && store.size < 4) store.set(hash, inst);
}

if (NAMED_MODE) {
  const classFreq = new Map();
  for (const { classes } of named.values()) for (const c of classes) classFreq.set(c, (classFreq.get(c) || 0) + 1);
  for (const comp of named.values()) comp.match = new Set([...comp.classes].filter(c => (classFreq.get(c) || 0) <= 3 && c.length > 3));
  for (const f of pageFiles) {
    const $ = cheerio.load(fs.readFileSync(f, 'utf8'));
    const route = path.relative(cfg.pages, path.dirname(f)).replace(/\\/g, '/');
    $('[class]').each((_, el) => {
      const cls = ($(el).attr('class') || '').split(/\s+/).filter(Boolean);
      if (!cls.length) return;
      for (const [name, comp] of named) {
        if (!cls.some(c => comp.match.has(c))) continue;
        let anc = $(el).parent(), inner = false;
        while (anc.length && anc[0].type === 'tag') {
          if ((anc.attr('class') || '').split(/\s+/).some(c => comp.match.has(c))) { inner = true; break; }
          anc = anc.parent();
        }
        if (inner) continue;
        const outer = $.html(el);
        if (outer.length > 250000 || outer.length < 40) continue;
        addInstance(name, structureHash($, el), { html: outer, page: route, size: outer.length, cssFiles: comp.cssFiles });
      }
    });
  }
} else {
  // generic: top-level sections of each page, grouped by root class signature
  for (const f of pageFiles) {
    const $ = cheerio.load(fs.readFileSync(f, 'utf8'));
    const route = path.relative(cfg.pages, path.dirname(f)).replace(/\\/g, '/');
    // descend through single-wrapper layouts (e.g. one .page container holding everything)
    const isContent = el => el.type === 'tag' && !['script', 'style', 'link', 'noscript', 'template'].includes(el.name);
    let kids = ($('main').length ? $('main') : $('body')).children().toArray().filter(isContent);
    let depth = 0;
    while (kids.length === 1 && depth < 3) { kids = $(kids[0]).children().toArray().filter(isContent); depth++; }
    // unwrap layout containers (page wrappers, rows) so real sections surface
    for (let pass = 0; pass < 4; pass++) {
      kids = kids.flatMap(el => {
        const cls = $(el).attr('class') || '';
        const ch = $(el).children().toArray().filter(isContent);
        return (/(^|[\s_-])(container|wrapper|page|inner|content|row|layout|main)([\s_-]|$)|^(container|wrapper|page|inner|content|row|layout)/i.test(cls) && ch.length >= 1) ? ch : [el];
      });
    }
    kids.forEach(el => {
      const cls = ($(el).attr('class') || '').split(/\s+/).filter(Boolean);
      const token = (cls[0] || el.name).replace(/[^a-zA-Z0-9-]/g, '').replace(/-(\w)/g, (_, c) => c.toUpperCase());
      const name = 'Section-' + (token.charAt(0).toUpperCase() + token.slice(1) || el.name);
      const outer = $.html(el);
      if (outer.length > 250000 || outer.length < 120) return;
      if (instances.size >= 60 && !instances.has(name)) return;
      addInstance(name, structureHash($, el), { html: outer, page: route, size: outer.length, cssFiles: [] });
    });
  }
}

// semantic shell pieces from the entry page (both modes)
let homeFile = path.join(cfg.pages, 'home', 'index.html');
if (!fs.existsSync(homeFile)) homeFile = pageFiles[0] || homeFile;
if (fs.existsSync(homeFile)) {
  const $ = cheerio.load(fs.readFileSync(homeFile, 'utf8'));
  for (const [name, sel] of [['SiteHeader', 'header'], ['SiteFooter', 'footer'], ['SiteNav', 'nav']]) {
    const el = $(sel).first();
    if (el.length && $.html(el).length > 40) addInstance(name, 'semantic', { html: $.html(el), page: 'home', size: $.html(el).length, cssFiles: [] });
  }
}

// emit folders
fs.mkdirSync(COMP, { recursive: true });
const globalLinks = NAMED_MODE
  ? (entryCss ? [`../../css/${entryCss}`] : [])
  : cssFiles.slice(0, 10).map(f => `../../css/${f}`);
let emitted = 0;
for (const [name, store] of instances) {
  if (!store.size) continue;
  const dir = path.join(COMP, name.replace(/[^a-zA-Z0-9._-]/g, '_'));
  fs.mkdirSync(dir, { recursive: true });
  const variants = [...store.values()].sort((a, b) => b.size - a.size);
  const cssLinks = [];
  for (const cf of variants[0].cssFiles || []) {
    const clean = name + '.css';
    fs.copyFileSync(path.join(CSSDIR, cf), path.join(dir, clean));
    if (!cssLinks.includes(clean)) cssLinks.push(clean);
  }
  variants.forEach((v, i) => fs.writeFileSync(path.join(dir, `variant-${i + 1}.html`), rewriteAssets(v.html, '../../')));
  const links = [...globalLinks.map(l => `<link rel="stylesheet" href="${l}">`), ...cssLinks.map(c => `<link rel="stylesheet" href="${c}">`)].join('\n  ');
  const body = variants.map((v, i) => `
  <section style="border-bottom:2px dashed #ccc;padding:24px 0;">
    <p style="font:12px monospace;color:#888;margin:0 0 12px;">variant ${i + 1} — from /${v.page === 'home' ? '' : v.page}</p>
    ${rewriteAssets(v.html, '../../')}
  </section>`).join('\n');
  fs.writeFileSync(path.join(dir, 'index.html'), `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>${name}</title>\n  ${links}\n</head>\n<body>\n${body}\n</body>\n</html>`);
  emitted++;
}

// css-only folders for named components never rendered in SSR pages
let cssOnly = 0;
if (NAMED_MODE) {
  for (const [name, comp] of named) {
    if (instances.get(name)?.size) continue;
    const dir = path.join(COMP, name);
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(path.join(CSSDIR, comp.cssFiles[0]), path.join(dir, name + '.css'));
    fs.writeFileSync(path.join(dir, 'README.md'), `# ${name}\n\nScoped CSS captured from the live build (\`css/${comp.cssFiles[0]}\`). No rendered instance exists in the public SSR pages — this component only mounts client-side (interactive flow or behind login). Reconstruct markup from the class names in the CSS, or copy the DOM from a live browser session.\n`);
    cssOnly++;
  }
}

// gallery
const dirs = fs.readdirSync(COMP).filter(f => fs.statSync(path.join(COMP, f)).isDirectory()).sort();
const rendered = dirs.filter(d => fs.readdirSync(path.join(COMP, d)).some(f => /^variant-\d+\.html$/.test(f)));
const cssOnlyDirs = dirs.filter(d => !rendered.includes(d));
fs.writeFileSync(path.join(COMP, 'index.html'), `<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>Component library</title>\n<style>body{font-family:system-ui;max-width:820px;margin:40px auto;padding:0 20px;line-height:1.6}li{margin:4px 0}h2{margin-top:36px}</style></head>\n<body>\n<h1>${cfg.host} — extracted component library</h1>\n<h2>Rendered components (${rendered.length})</h2>\n<ul>${rendered.map(d => `<li><a href="${d}/index.html"><strong>${d}</strong></a></li>`).join('\n')}</ul>\n${cssOnlyDirs.length ? `<h2>CSS-only components (${cssOnlyDirs.length})</h2>\n<p>Client-side components — scoped CSS captured, markup not present in public SSR pages.</p>\n<ul>${cssOnlyDirs.map(d => `<li><strong>${d}</strong></li>`).join('\n')}</ul>` : ''}\n</body></html>`);
console.log('[comp] DONE — rendered:', emitted, 'css-only:', cssOnly);

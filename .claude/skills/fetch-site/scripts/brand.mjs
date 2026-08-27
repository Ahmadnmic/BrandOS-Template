// Stage 5: brand/design-token extraction from the site's CSS + logo collection
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, siteConfig } from './lib.mjs';

const cfg = siteConfig(parseArgs());
const CSSDIR = path.join(cfg.out, 'css');
const BRAND = path.join(cfg.out, 'brand');
const IMGDIR = path.join(cfg.out, 'assets', 'images');
fs.mkdirSync(path.join(BRAND, 'logos'), { recursive: true });

const cssFiles = fs.existsSync(CSSDIR) ? fs.readdirSync(CSSDIR).filter(f => f.endsWith('.css')) : [];
let allCss = '';
const perFile = {};
for (const f of cssFiles) { perFile[f] = fs.readFileSync(path.join(CSSDIR, f), 'utf8'); allCss += `\n/* ==== ${f} ==== */\n` + perFile[f]; }

const rootBlocks = [];
for (const [f, css] of Object.entries(perFile))
  for (const m of css.matchAll(/:root[^{}]*\{[^{}]*\}/g)) rootBlocks.push(`/* from ${f} */\n${m[0]}`);
const varDefs = new Map();
for (const m of allCss.matchAll(/(--[a-zA-Z0-9-_]+)\s*:\s*([^;{}]+)[;}]/g)) if (!varDefs.has(m[1])) varDefs.set(m[1], m[2].trim());

const colorCount = new Map();
for (const m of allCss.matchAll(/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g)) colorCount.set(m[0].toLowerCase(), (colorCount.get(m[0].toLowerCase()) || 0) + 1);
for (const m of allCss.matchAll(/rgba?\([^)]+\)/g)) { const c = m[0].replace(/\s+/g, ''); colorCount.set(c, (colorCount.get(c) || 0) + 1); }
const colors = [...colorCount.entries()].sort((a, b) => b[1] - a[1]);

const fontFaces = [...new Set([...allCss.matchAll(/@font-face\s*\{[^{}]*\}/g)].map(m => m[0]))];
const familyCount = new Map();
for (const m of allCss.matchAll(/font-family\s*:\s*([^;{}]+)[;}]/g)) familyCount.set(m[1].trim(), (familyCount.get(m[1].trim()) || 0) + 1);

fs.writeFileSync(path.join(BRAND, 'tokens.css'), `/* ${cfg.host} — extracted design tokens (auto-generated from live site CSS) */\n\n/* ---- :root blocks as found ---- */\n${rootBlocks.join('\n\n')}\n\n/* ---- all custom properties (deduped) ---- */\n:root {\n${[...varDefs.entries()].map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}\n\n/* ---- @font-face declarations ---- */\n${fontFaces.join('\n\n')}\n`);

const swatches = colors.filter(([, n]) => n >= 2).slice(0, 120).map(([c, n]) => `<div class="sw"><div class="chip" style="background:${c}"></div><code>${c}</code><span>×${n}</span></div>`).join('\n');
fs.writeFileSync(path.join(BRAND, 'colors.html'), `<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>${cfg.host} color audit</title>\n<style>body{font-family:system-ui;margin:40px;background:#fafafa}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}.sw{background:#fff;border:1px solid #ddd;border-radius:8px;padding:8px;font-size:12px}.chip{height:48px;border-radius:6px;border:1px solid #0002;margin-bottom:6px}code{display:block}span{color:#888}</style></head><body>\n<h1>${cfg.host} — color usage (from live CSS)</h1>\n<div class="grid">\n${swatches}\n</div></body></html>`);

fs.writeFileSync(path.join(BRAND, 'typography.md'), `# ${cfg.host} — typography (extracted from live CSS)\n\n## Font families by usage\n${[...familyCount.entries()].sort((a, b) => b[1] - a[1]).map(([f, n]) => `- \`${f}\` — used ${n}×`).join('\n')}\n\n## @font-face declarations\nSee \`tokens.css\`. Font binaries are in \`../assets/fonts/\`.\n`);

let logos = 0;
if (fs.existsSync(IMGDIR)) {
  for (const f of fs.readdirSync(IMGDIR)) {
    if (/logo|brandmark|favicon|icon-\d+x\d+|apple-touch/i.test(f)) { fs.copyFileSync(path.join(IMGDIR, f), path.join(BRAND, 'logos', f)); logos++; }
  }
}
// large inline SVGs from header/footer components are often the real logo
const COMPD = path.join(cfg.out, 'components');
if (fs.existsSync(COMPD)) {
  for (const comp of ['SiteHeader', 'SiteFooter', 'SiteNav']) {
    const dir = path.join(COMPD, comp);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
      (fs.readFileSync(path.join(dir, f), 'utf8').match(/<svg[\s\S]*?<\/svg>/g) || []).forEach((s, i) => {
        if (s.length < 300 || s.length > 60000) return;
        if (!/logo|brand/i.test(s) && s.length < 2000) return;
        const out = path.join(BRAND, 'logos', `inline-${comp}-${f.replace('.html', '')}-${i}.svg`);
        if (!fs.existsSync(out)) { fs.writeFileSync(out, s); logos++; }
      });
    }
  }
}
console.log('[brand] vars:', varDefs.size, '| colors:', colors.length, '| font-faces:', fontFaces.length, '| families:', familyCount.size, '| logos:', logos);

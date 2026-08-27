// Stage 6: rewrite saved pages to reference local assets (offline browsing)
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, siteConfig, walk, readJSON, routeToDir } from './lib.mjs';

const cfg = siteConfig(parseArgs());
const assetMap = readJSON(cfg.meta('asset-map.json'));
const manifest = fs.existsSync(cfg.meta('scrape-manifest.json')) ? readJSON(cfg.meta('scrape-manifest.json')) : {};
const routeUrl = new Map(Object.keys(manifest).map(u => [routeToDir(u), u]));

let rewritten = 0;
const misses = new Map();
for (const f of walk(cfg.pages)) {
  const relPrefix = path.relative(path.dirname(f), cfg.out).replace(/\\/g, '/') + '/';
  let html = fs.readFileSync(f, 'utf8');
  // absolute urls
  html = html.replace(/https?:\/\/[a-z0-9.-]+\/[^"'\s)]+/gi, (m) => {
    const decoded = m.replace(/&amp;/g, '&');
    let base;
    try { const u = new URL(decoded); u.search = ''; base = u.href; } catch { return m; }
    const local = assetMap[decoded] || assetMap[base];
    if (local) return relPrefix + local;
    if (new URL(base).hostname.endsWith(cfg.baseDomain) && /\.(css|m?js|jpe?g|png|webp|avif|svg|mp4|woff2?)([?#]|$)/i.test(decoded)) misses.set(base, (misses.get(base) || 0) + 1);
    return m;
  });
  // relative + root-relative urls in attributes, resolved against the page's original url
  const route = path.relative(cfg.pages, path.dirname(f)).replace(/\\/g, '/');
  const pageUrl = routeUrl.get(route) || 'https://' + cfg.host + (route === 'home' ? '/' : '/' + route);
  const lookup = (raw) => {
    const decoded = raw.replace(/&amp;/g, '&');
    if (/^(data:|#|mailto:|tel:|javascript:)/i.test(decoded)) return null;
    try {
      const abs = new URL(decoded, pageUrl).href;
      const u = new URL(abs); u.search = '';
      return assetMap[abs] || assetMap[u.href] || null;
    } catch { return null; }
  };
  html = html.replace(/(src|href|poster|content|data-src)="([^"]+)"/g, (m, attr, p) => {
    const local = lookup(p);
    return local ? `${attr}="${relPrefix}${local}"` : m;
  });
  html = html.replace(/(srcset|data-srcset)="([^"]*)"/g, (m, attr, v) => {
    const parts = v.split(',').map(part => {
      const [u, ...desc] = part.trim().split(/\s+/);
      const local = lookup(u);
      return [local ? relPrefix + local : u, ...desc].join(' ');
    });
    return `${attr}="${parts.join(', ')}"`;
  });
  // framework payload pointer -> local copy
  if (fs.existsSync(path.join(path.dirname(f), 'payload.json'))) {
    html = html.replace(/data-src="[^"]*_payload\.json[^"]*"/, 'data-src="payload.json"');
  }
  fs.writeFileSync(f, html);
  rewritten++;
}
console.log('[rewrite] pages rewritten:', rewritten);
const top = [...misses.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
if (top.length) console.log('[rewrite] unmapped first-party asset urls (top):\n' + top.map(([u, n]) => `  ${n}x ${u}`).join('\n'));

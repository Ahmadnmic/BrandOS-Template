// Stage 3: harvest + download every asset referenced by the saved pages (3 rounds:
// HTML refs -> CSS url() refs -> framework payloads). First-party hosts only.
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { parseArgs, siteConfig, walk, download, pool, readJSON, writeJSON, routeToDir } from './lib.mjs';

const cfg = siteConfig(parseArgs());
const IMG_EXT = /\.(jpe?g|png|gif|webp|avif|svg|ico|bmp)$/i;
const VID_EXT = /\.(mp4|webm|mov|m4v|ogv)$/i;
const FONT_EXT = /\.(woff2?|ttf|otf|eot)$/i;
const DOC_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|ics|csv)$/i;
const RESIZE_PARAMS = new Set(['width', 'height', 'quality', 'format', 'rmode', 'scale', 'w', 'h', 'q', 'fm', 'fit', 'dpr', 'auto', 'crop', 'size', 'resize']);

const assetMap = new Map(); // normalized remote url -> {full, rel, category}
const externalHosts = new Map(); // skipped third-party hosts -> count

function normalizeAssetUrl(raw) {
  try {
    const u = new URL(raw);
    // Next.js image proxy: /_next/image?url=<real> — unwrap to the real asset
    if (u.pathname.includes('/_next/image') && u.searchParams.get('url')) {
      return normalizeAssetUrl(new URL(u.searchParams.get('url'), u.origin).href);
    }
    // strip resize params from image URLs to get the original file
    if (IMG_EXT.test(u.pathname) && [...u.searchParams.keys()].some(k => RESIZE_PARAMS.has(k.toLowerCase()))) {
      u.search = '';
    }
    return u.href;
  } catch { return null; }
}

function categorize(u) {
  const p = new URL(u).pathname;
  if (FONT_EXT.test(p)) return 'fonts';
  if (VID_EXT.test(p)) return 'videos';
  if (/\.css$/i.test(p)) return 'css';
  if (/\.m?js$/i.test(p)) return 'js';
  if (IMG_EXT.test(p)) return 'images';
  if (DOC_EXT.test(p)) return 'other';
  return null;
}

const taken = new Set();
function localNameFor(u, category) {
  const url = new URL(u);
  const segs = url.pathname.split('/').filter(Boolean).map(s => decodeURIComponent(s).replace(/[^a-z0-9._-]/gi, '_'));
  let name = segs.pop() || 'index';
  const prefix = segs.length ? segs[segs.length - 1] : '';
  if (['images', 'videos', 'other'].includes(category) && prefix && !/^(media|images?|img|static|assets|_next|_nuxt|uploads|files)$/i.test(prefix)) {
    name = `${prefix}--${name}`;
  }
  const dir = category === 'css' ? path.join(cfg.out, 'css')
    : category === 'js' ? path.join(cfg.out, 'js')
    : path.join(cfg.out, 'assets', category);
  let full = path.join(dir, name);
  let n = 2;
  while (taken.has(full.toLowerCase())) {
    const ext = path.extname(name);
    full = path.join(dir, `${path.basename(name, ext)}~${n}${ext}`);
    n++;
  }
  taken.add(full.toLowerCase());
  return full;
}

function register(rawUrl, base, forcedCategory = null) {
  if (!rawUrl) return;
  let u = String(rawUrl).trim();
  if (u.startsWith('data:') || u.startsWith('blob:') || u.startsWith('#')) return;
  try { u = new URL(u, base || cfg.origin).href; } catch { return; }
  if (!/^https?:/.test(u)) return;
  const host = new URL(u).hostname;
  if (!cfg.isFirstParty(host)) {
    externalHosts.set(host, (externalHosts.get(host) || 0) + 1);
    return;
  }
  const norm = normalizeAssetUrl(u);
  if (!norm || assetMap.has(norm)) return;
  const cat = forcedCategory || categorize(norm);
  if (!cat) return;
  const full = localNameFor(norm, cat);
  assetMap.set(norm, { full, category: cat, rel: path.relative(cfg.out, full).replace(/\\/g, '/') });
}

function harvestSrcset(v, base) {
  if (!v) return;
  for (const part of v.split(',')) {
    const u = part.trim().split(/\s+/)[0];
    if (u) register(u, base);
  }
}

const pageFiles = walk(cfg.pages);
console.log('[assets] scanning', pageFiles.length, 'pages');
// resolve relative refs against each page's actual original url (from the scrape manifest)
const manifest = fs.existsSync(cfg.meta('scrape-manifest.json')) ? readJSON(cfg.meta('scrape-manifest.json')) : {};
const routeUrl = new Map(Object.keys(manifest).map(u => [routeToDir(u), u]));
const payloadRefs = [];
for (const f of pageFiles) {
  const $ = cheerio.load(fs.readFileSync(f, 'utf8'));
  const route = path.relative(cfg.pages, path.dirname(f)).replace(/\\/g, '/');
  const base = routeUrl.get(route) || cfg.origin + '/';
  $('link[rel="stylesheet"]').each((_, el) => register($(el).attr('href'), base, 'css'));
  $('link[rel="modulepreload"], link[rel="preload"], link[rel="prefetch"]').each((_, el) => {
    const href = $(el).attr('href'), as = $(el).attr('as');
    if (as === 'font') register(href, base, 'fonts');
    else register(href, base);
  });
  $('link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="mask-icon"]').each((_, el) => register($(el).attr('href'), base, 'images'));
  $('link[rel="manifest"]').each((_, el) => register($(el).attr('href'), base, 'other'));
  $('script[src]').each((_, el) => register($(el).attr('src'), base, 'js'));
  $('img').each((_, el) => { register($(el).attr('src'), base); register($(el).attr('data-src'), base); harvestSrcset($(el).attr('srcset'), base); harvestSrcset($(el).attr('data-srcset'), base); });
  $('source').each((_, el) => { register($(el).attr('src'), base); harvestSrcset($(el).attr('srcset'), base); });
  $('video').each((_, el) => { register($(el).attr('src'), base, 'videos'); register($(el).attr('poster'), base, 'images'); });
  $('audio').each((_, el) => register($(el).attr('src'), base));
  $('meta[property="og:image"], meta[name="twitter:image"]').each((_, el) => register($(el).attr('content'), base, 'images'));
  $('a[href]').each((_, el) => { const h = ($(el).attr('href') || '').split('?')[0]; if (DOC_EXT.test(h)) register($(el).attr('href'), base, 'other'); });
  $('[style]').each((_, el) => {
    for (const m of ($(el).attr('style') || '').matchAll(/url\((['"]?)([^'")]+)\1\)/g)) register(m[2], base);
  });
  const dataSrc = $('#__NUXT_DATA__').attr('data-src');
  if (dataSrc) payloadRefs.push([path.dirname(f), new URL(dataSrc, base).href]);
}
console.log('[assets] discovered from HTML:', assetMap.size);

const stats = () => ({ ok: 0, exists: 0, missing: 0, failed: 0 });
async function run(entries, label) {
  const s = stats();
  await pool(entries, async ([url, meta]) => {
    const r = await download(url, meta.full, cfg.origin + '/');
    s[r] = (s[r] || 0) + 1;
    if (r === 'failed') console.log('[assets] FAILED', url);
  }, 8);
  console.log(`[assets] ${label}`, JSON.stringify(s));
}
await run([...assetMap.entries()], 'round1 (html refs)');

// round 2: url() refs inside downloaded CSS, resolved against each file's remote url
const localToRemote = new Map([...assetMap.entries()].map(([u, m]) => [m.full, u]));
const before2 = assetMap.size;
for (const [remote, meta] of [...assetMap.entries()]) {
  if (meta.category !== 'css' || !fs.existsSync(meta.full)) continue;
  const css = fs.readFileSync(meta.full, 'utf8');
  for (const m of css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) register(m[2], remote);
}
await run([...assetMap.entries()].slice(before2), `round2 (css refs, ${assetMap.size - before2} new)`);

// round 3: framework payloads (Nuxt) + media referenced inside them
for (const [dir, u] of payloadRefs) {
  const r = await download(u, path.join(dir, 'payload.json'), cfg.origin + '/');
  if (r === 'failed') console.log('[assets] payload FAILED', u);
}
if (payloadRefs.length) console.log('[assets] payloads saved:', payloadRefs.length);
const before3 = assetMap.size;
for (const [dir] of payloadRefs) {
  const p = path.join(dir, 'payload.json');
  if (!fs.existsSync(p)) continue;
  const txt = fs.readFileSync(p, 'utf8').replace(/\\u002F/gi, '/').replace(/\\\//g, '/');
  for (const m of txt.matchAll(/https?:\/\/[a-z0-9.-]+\/[^"\\\s)]+/gi)) register(m[0]);
}
await run([...assetMap.entries()].slice(before3), `round3 (payload media, ${assetMap.size - before3} new)`);

// video embeds manifest (video is usually Vimeo/YouTube — index, don't rip)
const vids = new Map();
for (const f of [...pageFiles, ...walk(cfg.pages, 'payload.json')]) {
  const txt = fs.readFileSync(f, 'utf8').replace(/\\u002F/gi, '/').replace(/\\\//g, '/');
  const route = '/' + path.relative(cfg.pages, path.dirname(f)).replace(/\\/g, '/').replace(/^home$/, '');
  for (const m of txt.matchAll(/player\.vimeo\.com\/video\/(\d+)/g)) (vids.get('vimeo:' + m[1]) || vids.set('vimeo:' + m[1], new Set()).get('vimeo:' + m[1])).add(route);
  for (const m of txt.matchAll(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/g)) (vids.get('youtube:' + m[1]) || vids.set('youtube:' + m[1], new Set()).get('youtube:' + m[1])).add(route);
}
if (vids.size) {
  fs.mkdirSync(path.join(cfg.out, 'assets', 'videos'), { recursive: true });
  const lines = [...vids.entries()].map(([k, pages]) => {
    const [pf, id] = k.split(':');
    const url = pf === 'vimeo' ? `https://player.vimeo.com/video/${id}` : `https://www.youtube.com/watch?v=${id}`;
    return `- **${pf}** \`${id}\` — ${url}\n  - used on: ${[...pages].slice(0, 6).join(', ')}${pages.size > 6 ? ` (+${pages.size - 6} more)` : ''}`;
  });
  fs.writeFileSync(path.join(cfg.out, 'assets', 'videos', 'embeds.md'),
    `# Video embeds\n\nVideo on this site is embedded from external platforms (streamed, not self-hosted files):\n\n${lines.join('\n')}\n`);
  console.log('[assets] video embeds indexed:', vids.size);
}

const mapObj = {};
for (const [u, meta] of assetMap) mapObj[u] = meta.rel;
writeJSON(cfg.meta('asset-map.json'), mapObj);
writeJSON(cfg.meta('external-hosts.json'), Object.fromEntries([...externalHosts.entries()].sort((a, b) => b[1] - a[1])));
console.log('[assets] DONE total:', assetMap.size);
const ext = [...externalHosts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
if (ext.length) console.log('[assets] skipped external hosts (rerun with --asset-hosts if one is the site\'s CDN):\n' + ext.map(([h, n]) => `  ${n}x ${h}`).join('\n'));

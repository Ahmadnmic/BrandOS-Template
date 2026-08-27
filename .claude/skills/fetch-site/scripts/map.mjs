// Stage 1: URL discovery — sitemap.xml (+ sitemap indexes, robots.txt) merged with Firecrawl /v2/map
import fs from 'node:fs';
import { parseArgs, siteConfig, UA, writeJSON } from './lib.mjs';

const cfg = siteConfig(parseArgs());
const KEY = process.env.FIRECRAWL_API_KEY;
const MAX = Number(cfg.args['max-pages'] || 0);

async function fetchText(u) {
  try {
    const res = await fetch(u, { headers: { 'User-Agent': UA }, redirect: 'follow' });
    return res.ok ? await res.text() : null;
  } catch { return null; }
}

// ---- sitemaps ----
const sitemapUrls = new Set([cfg.origin + '/sitemap.xml', cfg.origin + '/sitemap_index.xml']);
const robots = await fetchText(cfg.origin + '/robots.txt');
if (robots) for (const m of robots.matchAll(/^sitemap:\s*(\S+)/gim)) sitemapUrls.add(m[1]);

const fromSitemaps = [];
const seen = new Set();
const queue = [...sitemapUrls];
let fetched = 0;
while (queue.length && fetched < 25) {
  const sm = queue.shift();
  if (seen.has(sm)) continue;
  seen.add(sm);
  const xml = await fetchText(sm);
  if (!xml) continue;
  fetched++;
  if (/<sitemapindex/i.test(xml)) {
    for (const m of xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)) queue.push(m[1]);
  } else {
    for (const m of xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)) fromSitemaps.push(m[1]);
  }
}
console.log(`[map] sitemap urls: ${fromSitemaps.length} (from ${fetched} sitemap file(s))`);

// ---- firecrawl map ----
let fromFirecrawl = [];
if (KEY) {
  try {
    const res = await fetch('https://api.firecrawl.dev/v2/map', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: cfg.url, limit: 5000, sitemap: 'include' }),
    });
    const m = await res.json();
    if (m.success) fromFirecrawl = (m.links || []).map(l => (typeof l === 'string' ? l : l.url));
    else console.log('[map] firecrawl map failed:', JSON.stringify(m).slice(0, 300));
  } catch (err) {
    console.log('[map] firecrawl map error:', err.message);
  }
  console.log(`[map] firecrawl urls: ${fromFirecrawl.length}`);
} else {
  console.log('[map] no FIRECRAWL_API_KEY — sitemap-only discovery');
}

// ---- merge, normalize, dedupe ----
const BINARY = /\.(pdf|jpe?g|png|gif|svg|webp|avif|mp4|webm|zip|ics|css|js|woff2?|ttf|xml|txt|docx?|xlsx?)$/i;
const out = [];
const dedupe = new Set();
for (const raw of [...fromSitemaps, ...fromFirecrawl]) {
  try {
    const p = new URL(raw);
    if (!cfg.isSiteHost(p.hostname)) continue;
    if (BINARY.test(p.pathname)) continue;
    p.hash = ''; p.search = '';
    let norm = 'https://' + cfg.host + p.pathname.replace(/\/$/, '');
    if (norm === 'https://' + cfg.host) norm += '/';
    if (!dedupe.has(norm)) { dedupe.add(norm); out.push(norm); }
  } catch { /* unparseable url */ }
}
// always include the entry url, first — later stages treat it as the representative page
const entry = 'https://' + cfg.host + (new URL(cfg.url).pathname.replace(/\/$/, '') || '/');
const rest = out.filter(u => u !== entry);
const merged = [entry, ...rest];
const final = MAX > 0 ? merged.slice(0, MAX) : merged;
writeJSON(cfg.meta('urls.json'), final);
console.log(`[map] DONE — ${final.length} unique page urls${MAX && out.length > MAX ? ` (capped from ${out.length})` : ''} -> _meta/urls.json`);

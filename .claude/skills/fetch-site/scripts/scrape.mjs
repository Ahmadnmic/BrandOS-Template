// Stage 2: fetch every page — Firecrawl batch scrape (rawHtml+markdown) with direct-fetch fallback
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, siteConfig, UA, routeToDir, pool, readJSON, writeJSON } from './lib.mjs';

const cfg = siteConfig(parseArgs());
const KEY = process.env.FIRECRAWL_API_KEY;
const DIRECT = !!cfg.args.direct || !KEY;
const API = 'https://api.firecrawl.dev/v2';

const urls = readJSON(cfg.meta('urls.json'));
const manifest = {};

function savePage(u, rawHtml, markdown) {
  const dir = path.join(cfg.pages, routeToDir(u));
  fs.mkdirSync(dir, { recursive: true });
  if (rawHtml) fs.writeFileSync(path.join(dir, 'index.html'), rawHtml);
  if (markdown) fs.writeFileSync(path.join(dir, 'content.md'), markdown);
}

async function directFetch(u) {
  try {
    const res = await fetch(u, { headers: { 'User-Agent': UA }, redirect: 'follow' });
    if (!res.ok) return false;
    savePage(u, await res.text(), null);
    return true;
  } catch { return false; }
}

async function fcFetch(url, opts = {}, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        ...opts,
        headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      });
      if (res.status === 429 || res.status >= 500) { await new Promise(r => setTimeout(r, 5000 * (i + 1))); continue; }
      return await res.json();
    } catch (err) {
      if (i === tries - 1) throw err;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  throw new Error('firecrawl request exhausted retries');
}

if (DIRECT) {
  console.log(`[scrape] direct mode — ${urls.length} pages (no JS rendering; SSR/static sites only)`);
  await pool(urls, async u => { manifest[u] = (await directFetch(u)) ? 'direct' : 'failed'; }, 6);
} else {
  const CHUNK = 100;
  const jobs = [];
  for (let i = 0; i < urls.length; i += CHUNK) {
    const chunk = urls.slice(i, i + CHUNK);
    const sub = await fcFetch(`${API}/batch/scrape`, {
      method: 'POST',
      body: JSON.stringify({ urls: chunk, formats: ['rawHtml', 'markdown'], onlyMainContent: false, timeout: 60000 }),
    });
    if (sub.success && sub.id) { console.log(`[scrape] job ${jobs.length} submitted (${chunk.length} urls)`); jobs.push({ id: sub.id, chunk }); }
    else { console.log(`[scrape] job submit failed, will direct-fetch chunk:`, JSON.stringify(sub).slice(0, 200)); jobs.push({ id: null, chunk }); }
  }
  for (const [ci, job] of jobs.entries()) {
    if (job.id) {
      const deadline = Date.now() + 20 * 60 * 1000;
      while (Date.now() < deadline) {
        const s = await fcFetch(`${API}/batch/scrape/${job.id}`);
        console.log(`[scrape] job ${ci}: ${s.status} ${s.completed ?? '?'}/${s.total ?? '?'}`);
        if (s.status === 'completed' || s.status === 'failed') break;
        await new Promise(r => setTimeout(r, 12000));
      }
      const got = new Set();
      let pageUrl = `${API}/batch/scrape/${job.id}`;
      while (pageUrl) {
        const page = await fcFetch(pageUrl);
        for (const doc of page.data || []) {
          const u = doc.metadata?.url || doc.metadata?.sourceURL;
          if (!u) continue;
          const orig = job.chunk.find(c =>
            u.replace(/\/$/, '') === c.replace(/\/$/, '') ||
            (doc.metadata?.sourceURL || '').replace(/\/$/, '') === c.replace(/\/$/, ''));
          const key = orig || u;
          savePage(key, doc.rawHtml || doc.html || null, doc.markdown || null);
          got.add(key);
          manifest[key] = 'firecrawl';
        }
        pageUrl = page.next || null;
      }
      for (const u of job.chunk) if (!got.has(u)) manifest[u] = (await directFetch(u)) ? 'direct' : 'failed';
    } else {
      for (const u of job.chunk) manifest[u] = (await directFetch(u)) ? 'direct' : 'failed';
    }
    writeJSON(cfg.meta('scrape-manifest.json'), manifest);
  }
}

writeJSON(cfg.meta('scrape-manifest.json'), manifest);
const counts = {};
for (const v of Object.values(manifest)) counts[v] = (counts[v] || 0) + 1;
console.log('[scrape] DONE', JSON.stringify(counts));
if (counts.failed) console.log('[scrape] WARNING: failed urls listed in _meta/scrape-manifest.json');

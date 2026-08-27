import fs from 'node:fs';
import path from 'node:path';

export const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

export function parseArgs(argv = process.argv.slice(2)) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

export function siteConfig(args) {
  if (!args.url || !args.out) {
    console.error('Required: --url <https://site.com> --out <output-dir>');
    process.exit(1);
  }
  const u = new URL(String(args.url).startsWith('http') ? String(args.url) : 'https://' + args.url);
  const host = u.hostname;
  const parts = host.split('.');
  const baseDomain = parts.length > 2 ? parts.slice(-2).join('.') : host;
  const extraHosts = String(args['asset-hosts'] || '').split(',').map(s => s.trim()).filter(Boolean);
  const out = path.resolve(String(args.out));
  fs.mkdirSync(path.join(out, '_meta'), { recursive: true });
  return {
    url: u.href, origin: u.origin, host, baseDomain, extraHosts, out, args,
    pages: path.join(out, 'pages'),
    meta: p => path.join(out, '_meta', p),
    isFirstParty(h) {
      return h === host || h === baseDomain || h.endsWith('.' + baseDomain)
        || extraHosts.some(e => h === e || h.endsWith('.' + e));
    },
    // treat www.<base> and <base> as the same site host
    isSiteHost(h) {
      return h === host || h === baseDomain || h === 'www.' + baseDomain;
    },
  };
}

export function walk(dir, name = 'index.html', out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, name, out);
    else if (e.name === name) out.push(p);
  }
  return out;
}

export function routeToDir(u) {
  const p = new URL(u).pathname.replace(/\/$/, '').replace(/\/index\.html?$/i, '');
  if (p === '') return 'home';
  return p.slice(1).split('/').map(s => s.replace(/[^a-z0-9._-]/gi, '_')).join('/');
}

export async function download(url, dest, referer, tries = 3) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return 'exists';
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: referer }, redirect: 'follow' });
      if (res.status === 404 || res.status === 410) return 'missing';
      if (!res.ok) { await new Promise(r => setTimeout(r, 2000 * (i + 1))); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, buf);
      return 'ok';
    } catch {
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
  return 'failed';
}

export async function pool(items, worker, size = 8) {
  const q = [...items];
  await Promise.all(Array.from({ length: size }, async () => {
    while (q.length) await worker(q.shift());
  }));
}

export const readJSON = p => JSON.parse(fs.readFileSync(p, 'utf8'));
export const writeJSON = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 1));

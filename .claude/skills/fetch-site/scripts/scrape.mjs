// Stage 2: fetch every page. CREDIT-OPTIMIZED HYBRID (default):
//   1. skip URLs already captured on disk (re-runs and the deep pass never
//      re-bill pages the fast pass paid for; Firecrawl cache hits still cost
//      1 credit, so the local capture IS the credit saver)
//   2. plain HTTP fetch everything remaining (0 credits), classify results
//   3. send ONLY JS-shell pages and blocked fetches to Firecrawl batch
//      (1 credit/page; bundled rawHtml+markdown formats cost nothing extra)
//   4. never escalate dead URLs (Firecrawl bills processed 403/404 pages)
// Flags: --direct (never call Firecrawl) · --force-firecrawl (bill every
// page, pre-hybrid behavior) · --fresh (ignore the local capture and re-fetch)
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import {
  parseArgs,
  siteConfig,
  UA,
  routeToDir,
  pool,
  readJSON,
  writeJSON,
} from "./lib.mjs";

const cfg = siteConfig(parseArgs());
const KEY = process.env.FIRECRAWL_API_KEY;
const DIRECT = !!cfg.args.direct || !KEY;
const FORCE_FC = !!cfg.args["force-firecrawl"] && !!KEY;
const FRESH = !!cfg.args.fresh;
const API = "https://api.firecrawl.dev/v2";

const urls = readJSON(cfg.meta("urls.json"));
const manifest = {};

function pageDir(u) {
  return path.join(cfg.pages, routeToDir(u));
}

function htmlToMarkdownish(html) {
  try {
    const $ = cheerio.load(html);
    $("script, style, noscript, svg").remove();
    const title = $("title").first().text().trim();
    const text = $("body")
      .text()
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n\s*/g, "\n\n")
      .trim();
    return (title ? "# " + title + "\n\n" : "") + text;
  } catch {
    return null;
  }
}

function savePage(u, rawHtml, markdown) {
  const dir = pageDir(u);
  fs.mkdirSync(dir, { recursive: true });
  if (rawHtml) fs.writeFileSync(path.join(dir, "index.html"), rawHtml);
  const md = markdown || (rawHtml ? htmlToMarkdownish(rawHtml) : null);
  if (md) fs.writeFileSync(path.join(dir, "content.md"), md);
}

// A JS shell has (almost) no server-rendered content: an empty framework
// mount point and/or too little visible text to represent a real page.
function isShell(html) {
  if (!html || html.length < 600) return true;
  try {
    const $ = cheerio.load(html);
    $("script, style, noscript").remove();
    const textLen = $("body").text().replace(/\s+/g, " ").trim().length;
    if (textLen < 400) return true;
    const mount = $("#root, #app, #__nuxt, [data-reactroot]").first();
    if (
      mount.length &&
      mount.text().replace(/\s+/g, "").length < 100 &&
      textLen < 800
    )
      return true;
    return false;
  } catch {
    return html.length < 2000;
  }
}

async function directFetch(u) {
  try {
    const res = await fetch(u, {
      headers: { "User-Agent": UA },
      redirect: "follow",
    });
    const body = res.ok ? await res.text() : null;
    return { status: res.status, body };
  } catch {
    return { status: 0, body: null };
  }
}

async function fcFetch(url, opts = {}, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        ...opts,
        headers: {
          Authorization: `Bearer ${KEY}`,
          "Content-Type": "application/json",
        },
      });
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 5000 * (i + 1)));
        continue;
      }
      return await res.json();
    } catch (err) {
      if (i === tries - 1) throw err;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error("firecrawl request exhausted retries");
}

// Credit preflight: polling credit usage is free. Never start a paid batch
// that will die mid-run and leave a partial corpus; stop and ask instead.
// Already-captured pages are safe: a re-run skips them at 0 credits.
async function creditPreflight(needed) {
  if (cfg.args["ignore-credit-check"]) return true;
  for (const base of [API, "https://api.firecrawl.dev/v1"]) {
    try {
      const r = await fcFetch(`${base}/team/credit-usage`);
      const remaining = r?.data?.remainingCredits ?? r?.remainingCredits;
      if (typeof remaining !== "number") continue;
      console.log(
        `[scrape] credits: ${remaining} remaining, ~${needed} needed`,
      );
      if (remaining < needed) {
        console.error(
          `[scrape] STOP: not enough Firecrawl credits (${remaining} < ~${needed}).\n` +
            `  Top up, lower --max-pages, or re-run with --ignore-credit-check.\n` +
            `  Everything captured so far is saved and will be skipped for free on re-run.`,
        );
        writeJSON(cfg.meta("scrape-manifest.json"), manifest);
        process.exit(1);
      }
      return true;
    } catch {
      /* endpoint unavailable on this version; try next, else proceed */
    }
  }
  return true;
}

function isCreditError(res) {
  return /insufficient|credit|payment required/i.test(
    JSON.stringify(res ?? ""),
  );
}

async function firecrawlBatch(list) {
  const CHUNK = 100;
  const jobs = [];
  for (let i = 0; i < list.length; i += CHUNK) {
    const chunk = list.slice(i, i + CHUNK);
    const sub = await fcFetch(`${API}/batch/scrape`, {
      method: "POST",
      // bundled formats cost the base 1 credit; parsers:[] avoids the
      // +1/PDF-page surcharge if a PDF slips through the URL filter
      body: JSON.stringify({
        urls: chunk,
        formats: ["rawHtml", "markdown"],
        onlyMainContent: false,
        timeout: 60000,
        parsers: [],
      }),
    });
    if (sub.success && sub.id) {
      console.log(
        `[scrape] fc job ${jobs.length} submitted (${chunk.length} urls)`,
      );
      jobs.push({ id: sub.id, chunk });
    } else {
      if (isCreditError(sub)) {
        console.error(
          "[scrape] STOP: Firecrawl reports insufficient credits mid-run.\n" +
            "  Everything captured so far is saved; a re-run after top-up skips it for free.",
        );
        writeJSON(cfg.meta("scrape-manifest.json"), manifest);
        process.exit(1);
      }
      console.log(
        "[scrape] fc submit failed:",
        JSON.stringify(sub).slice(0, 200),
      );
      jobs.push({ id: null, chunk });
    }
  }
  for (const [ci, job] of jobs.entries()) {
    if (!job.id) {
      for (const u of job.chunk) if (!manifest[u]) manifest[u] = "failed";
      continue;
    }
    const deadline = Date.now() + 20 * 60 * 1000;
    while (Date.now() < deadline) {
      const s = await fcFetch(`${API}/batch/scrape/${job.id}`); // status polling is credit-free
      console.log(
        `[scrape] fc job ${ci}: ${s.status} ${s.completed ?? "?"}/${s.total ?? "?"}`,
      );
      if (s.status === "completed" || s.status === "failed") break;
      await new Promise((r) => setTimeout(r, 12000));
    }
    const got = new Set();
    let pageUrl = `${API}/batch/scrape/${job.id}`;
    while (pageUrl) {
      const page = await fcFetch(pageUrl);
      for (const doc of page.data || []) {
        const u = doc.metadata?.url || doc.metadata?.sourceURL;
        if (!u) continue;
        const orig = job.chunk.find(
          (c) =>
            u.replace(/\/$/, "") === c.replace(/\/$/, "") ||
            (doc.metadata?.sourceURL || "").replace(/\/$/, "") ===
              c.replace(/\/$/, ""),
        );
        const key = orig || u;
        savePage(key, doc.rawHtml || doc.html || null, doc.markdown || null);
        got.add(key);
        manifest[key] = "firecrawl";
      }
      pageUrl = page.next || null;
    }
    for (const u of job.chunk) if (!got.has(u)) manifest[u] = "failed";
    writeJSON(cfg.meta("scrape-manifest.json"), manifest);
  }
}

// ---- 1. local capture: skip what a previous pass already paid for ----
let todo = urls;
if (!FRESH) {
  todo = [];
  for (const u of urls) {
    const existing = path.join(pageDir(u), "index.html");
    let keep = true;
    if (fs.existsSync(existing)) {
      const html = fs.readFileSync(existing, "utf8");
      if (!isShell(html)) {
        manifest[u] = "cached-local";
        keep = false;
      }
    }
    if (keep) todo.push(u);
  }
  const skipped = urls.length - todo.length;
  if (skipped)
    console.log(
      `[scrape] ${skipped} pages already captured locally (0 credits), ${todo.length} to fetch`,
    );
}

if (FORCE_FC) {
  console.log(`[scrape] force-firecrawl: ${todo.length} pages billed`);
  await creditPreflight(todo.length);
  await firecrawlBatch(todo);
} else {
  // ---- 2. free pass: plain HTTP for everything ----
  const escalate = [];
  await pool(
    todo,
    async (u) => {
      const { status, body } = await directFetch(u);
      if (body && !isShell(body)) {
        savePage(u, body, null);
        manifest[u] = "direct";
        return;
      }
      if (status === 404 || status === 410) {
        manifest[u] = "failed";
        return;
      } // dead: never bill it
      if (DIRECT) {
        manifest[u] = body
          ? (savePage(u, body, null), "direct-shell")
          : "failed";
        return;
      }
      escalate.push(u); // JS shell, blocked (403/429), or network failure
    },
    6,
  );
  writeJSON(cfg.meta("scrape-manifest.json"), manifest);

  // ---- 3. paid pass: Firecrawl only for pages that proved they need it ----
  if (!DIRECT && escalate.length) {
    console.log(
      `[scrape] escalating ${escalate.length}/${todo.length} pages to Firecrawl (~${escalate.length} credits)`,
    );
    await creditPreflight(escalate.length);
    await firecrawlBatch(escalate);
  } else if (DIRECT) {
    console.log("[scrape] direct mode: no Firecrawl calls made");
  } else {
    console.log("[scrape] nothing to escalate: 0 Firecrawl credits spent");
  }
}

writeJSON(cfg.meta("scrape-manifest.json"), manifest);
const counts = {};
for (const v of Object.values(manifest)) counts[v] = (counts[v] || 0) + 1;
console.log("[scrape] DONE", JSON.stringify(counts));
console.log(
  `[scrape] estimated Firecrawl credits this run: ${counts.firecrawl || 0} (+1 if map used Firecrawl)`,
);
if (counts.failed)
  console.log(
    "[scrape] WARNING: failed urls listed in _meta/scrape-manifest.json",
  );
if (counts["direct-shell"])
  console.log(
    "[scrape] WARNING: direct-shell pages have no JS rendering (no API key); components on them may be missing",
  );

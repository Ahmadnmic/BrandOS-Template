// BrandOS validation gate. PASS / FAIL / BLOCKED per check:
// FAIL exits 1 (fix before shipping), BLOCKED exits 2 (missing input is
// never a pass), clean run exits 0. Brand builds EXTEND this file with
// brand-specific checks (axe, contrast, coverage); they never rewrite it.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const results = [];

function report(status, name, detail) {
  results.push({ status, name, detail });
}

function walk(dir, exts) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      out.push(...walk(p, exts));
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      out.push(p);
    }
  }
  return out;
}

function rel(p) {
  return path.relative(root, p).replace(/\\/g, "/");
}

// C1: writing rules. No em or en dashes as pause marks, no AI-tell
// phrases, in any guide-facing source.
{
  const BANNED = [
    "—",
    "–",
    "delve",
    "seamless",
    "leverage",
    "game-changer",
    "cutting-edge",
    "tapestry",
    "testament to",
    "it's worth noting",
  ];
  const files = [
    ...walk(path.join(root, "src"), [".tsx", ".ts"]),
    ...walk(path.join(root, "brand"), [".ts", ".json", ".md"]),
  ];
  const hits = [];
  for (const f of files) {
    const lines = fs.readFileSync(f, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const b of BANNED) {
        if (line.toLowerCase().includes(b))
          hits.push(
            `${rel(f)}:${i + 1} (${b === "—" ? "em dash" : b === "–" ? "en dash" : b})`,
          );
      }
    });
  }
  if (hits.length) report("FAIL", "writing rules", hits.slice(0, 8).join(", "));
  else
    report("PASS", "writing rules", "no dashes-as-pause, no AI-tell phrases");
}

// C2: key hygiene. No API keys in tracked files.
{
  let tracked = [];
  try {
    tracked = execSync("git ls-files", { cwd: root, encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
  } catch {
    report("BLOCKED", "key hygiene", "not a git repository");
  }
  if (tracked.length) {
    const hits = [];
    for (const f of tracked) {
      const p = path.join(root, f);
      if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) continue;
      const buf = fs.readFileSync(p);
      if (buf.length > 2_000_000) continue;
      const m = buf.toString("utf8").match(/fc-[A-Za-z0-9]{8,}/);
      if (m && !f.includes("AGENTS.md") && !f.includes("SKILL.md"))
        hits.push(`${f}: ${m[0].slice(0, 8)}…`);
    }
    if (hits.length)
      report(
        "FAIL",
        "key hygiene",
        hits.join(", ") + " — move to .env and ROTATE the key",
      );
    else report("PASS", "key hygiene", "no key patterns in tracked files");
  }
}

// C3: seed leak. A brand build must not ship Odense Basket seed content.
{
  const config = fs.readFileSync(
    path.join(root, "brand", "brand.config.ts"),
    "utf8",
  );
  const isSeed = config.includes('name: "Odense Basket"');
  if (isSeed) {
    report("PASS", "seed leak", "template repo itself (seed context)");
  } else {
    const SEED_MARKS = [
      "Odense Basket",
      "KØB BILLET",
      "#0A1526",
      "odensebasket",
    ];
    const targets = [
      ...walk(path.join(root, "src"), [".tsx", ".ts", ".css"]),
      ...walk(path.join(root, "output", "client"), [
        ".html",
        ".js",
        ".css",
        ".json",
        ".txt",
        ".md",
      ]),
    ];
    const hits = [];
    for (const f of targets) {
      const text = fs.readFileSync(f, "utf8");
      for (const mark of SEED_MARKS) {
        if (text.includes(mark)) hits.push(`${rel(f)} (${mark})`);
      }
    }
    if (hits.length)
      report("FAIL", "seed leak", [...new Set(hits)].slice(0, 8).join(", "));
    else report("PASS", "seed leak", "no seed-brand content in src or output");
  }
}

// C4: prerender completeness. The built output must contain every page;
// 3 prerendered pages next to a 16-chapter registry means an SPA shell
// shipped instead of a portal.
{
  const outDir = path.join(root, "output", "client");
  if (!fs.existsSync(outDir)) {
    report(
      "BLOCKED",
      "prerender completeness",
      "no output/ — run npm run build first",
    );
  } else {
    const pages = walk(outDir, ["index.html"]).length;
    const fallback = fs.existsSync(path.join(outDir, "__spa-fallback.html"));
    if (pages >= 3 && fallback)
      report("PASS", "prerender completeness", `${pages} pages prerendered`);
    else
      report(
        "FAIL",
        "prerender completeness",
        `${pages} pages, fallback=${fallback} — check react-router.config prerender()`,
      );
  }
}

// C5: gated leak. Gated chapter slugs must not appear as routes or hrefs
// anywhere in the public output.
{
  const outDir = path.join(root, "output", "client");
  if (fs.existsSync(outDir)) {
    const config = fs.readFileSync(
      path.join(root, "brand", "brand.config.ts"),
      "utf8",
    );
    const gatedSlugs = [
      ...config.matchAll(/slug: "([^"]+)"[^}]*gated: true/gs),
    ].map((m) => m[1]);
    const files = walk(outDir, [".html", ".js"]);
    const hits = [];
    for (const slug of gatedSlugs) {
      for (const f of files) {
        const text = fs.readFileSync(f, "utf8");
        if (text.includes("/" + slug) || text.includes('href="' + slug))
          hits.push(`${rel(f)} (/${slug})`);
      }
    }
    if (hits.length)
      report("FAIL", "gated leak", [...new Set(hits)].slice(0, 6).join(", "));
    else
      report(
        "PASS",
        "gated leak",
        gatedSlugs.length + " gated slug(s) absent from public output",
      );
  }
}

// C6: print truth. Core ref colors (the ones annotated for print) must
// carry CMYK; absent print data entirely is BLOCKED, never silently ok.
{
  const tokens = JSON.parse(
    fs.readFileSync(path.join(root, "brand", "tokens.json"), "utf8"),
  );
  const annotated = Object.entries(tokens.ref ?? {}).filter(
    ([k, v]) => !k.startsWith("$") && v?.$extensions?.["com.nm.brandos.print"],
  );
  if (!annotated.length) {
    report("BLOCKED", "print truth", "no ref color carries print data");
  } else {
    const missing = annotated
      .filter(([, v]) => !v.$extensions["com.nm.brandos.print"].cmyk)
      .map(([k]) => k);
    if (missing.length)
      report(
        "FAIL",
        "print truth",
        "annotated colors missing CMYK: " + missing.join(", "),
      );
    else
      report(
        "PASS",
        "print truth",
        `${annotated.length} core colors carry CMYK`,
      );
  }
}

// C7: licensed manifest. Every file dropped into intake/licensed/ must
// have a line in LICENSES.md; expiring licenses warn 30 days out.
{
  const licDir = path.join(root, "intake", "licensed");
  if (!fs.existsSync(licDir)) {
    report("PASS", "licensed manifest", "no licensed material handed over");
  } else {
    const manifestPath = path.join(licDir, "LICENSES.md");
    const files = walk(licDir, [""]).filter(
      (f) => path.basename(f) !== "LICENSES.md",
    );
    if (!files.length) {
      report(
        "PASS",
        "licensed manifest",
        "folder scaffolded, nothing dropped yet",
      );
    } else if (!fs.existsSync(manifestPath)) {
      report(
        "FAIL",
        "licensed manifest",
        `${files.length} licensed file(s) but no LICENSES.md`,
      );
    } else {
      const manifest = fs.readFileSync(manifestPath, "utf8");
      const unlisted = files
        .filter((f) => !manifest.includes(path.basename(f)))
        .map(rel);
      if (unlisted.length) {
        report(
          "FAIL",
          "licensed manifest",
          "unmanifested: " + unlisted.slice(0, 6).join(", "),
        );
      } else {
        // Only expiry-labeled dates count; purchase dates must not trip this.
        const expiryDates = [
          ...manifest.matchAll(
            /(?:expiry|udløber)[^\d\n]{0,12}(\d{4}-\d{2}-\d{2})/gi,
          ),
        ]
          .map((m) => new Date(m[1]))
          .filter((d) => !Number.isNaN(d.getTime()));
        const soon = expiryDates.filter(
          (d) =>
            d.getTime() - Date.now() < 30 * 86400000 &&
            d.getTime() > Date.now() - 86400000,
        );
        const expired = expiryDates.filter(
          (d) => d.getTime() < Date.now() - 86400000,
        );
        if (expired.length)
          report(
            "FAIL",
            "licensed manifest",
            `${expired.length} license date(s) in the past`,
          );
        else if (soon.length)
          report(
            "PASS",
            "licensed manifest",
            `all ${files.length} manifested; WARNING: ${soon.length} expiry within 30 days`,
          );
        else
          report(
            "PASS",
            "licensed manifest",
            `all ${files.length} file(s) manifested`,
          );
      }
    }
  }
}

const fails = results.filter((r) => r.status === "FAIL");
const blocked = results.filter((r) => r.status === "BLOCKED");
for (const r of results) {
  console.log(`${r.status.padEnd(7)} ${r.name}: ${r.detail}`);
}
console.log(
  `\n${results.length - fails.length - blocked.length} pass · ${fails.length} fail · ${blocked.length} blocked`,
);
if (fails.length) process.exit(1);
if (blocked.length) {
  console.log("BLOCKED is never a pass: supply the missing input and re-run.");
  process.exit(2);
}

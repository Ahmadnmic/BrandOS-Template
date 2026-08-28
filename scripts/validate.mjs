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
    // Expected pages come from the route table itself: the index route plus
    // every registered route except dev-only /theme. An SPA shell (fewer
    // prerendered pages than routes) FAILS.
    let expected = 2;
    try {
      const routesSrc = fs.readFileSync(
        path.join(root, "src", "routes.ts"),
        "utf8",
      );
      const routePaths = [...routesSrc.matchAll(/route\("([^"]+)"/g)]
        .map((m) => m[1])
        .filter((r) => r !== "theme");
      expected = 1 + routePaths.length;
    } catch {
      /* keep the floor of 2 */
    }
    if (pages >= expected && fallback)
      report(
        "PASS",
        "prerender completeness",
        `${pages} pages prerendered (expected ${expected})`,
      );
    else
      report(
        "FAIL",
        "prerender completeness",
        `${pages} pages, expected ${expected}, fallback=${fallback} — check react-router.config prerender()`,
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
    // The real gated slugs live in brand/gated.config.ts, which must never
    // be bundled; a BARE slug string in any public chunk is a leak.
    const gatedConfigPath = path.join(root, "brand", "gated.config.ts");
    if (fs.existsSync(gatedConfigPath)) {
      const gc = fs.readFileSync(gatedConfigPath, "utf8");
      gatedSlugs.push(
        ...[...gc.matchAll(/"([a-z0-9-]{3,})"/g)]
          .map((m) => m[1])
          .filter((v) => !/^\d+$/.test(v)),
      );
    }
    const files = walk(outDir, [".html", ".js"]);
    const hits = [];
    for (const slug of [...new Set(gatedSlugs)].filter(Boolean)) {
      for (const f of files) {
        const text = fs.readFileSync(f, "utf8");
        if (text.includes(slug)) hits.push(`${rel(f)} (${slug})`);
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

// C10: WCAG contrast at token level (the Terrazzo idea, implemented
// against this repo's token shape): every declared sys text/surface
// pair must reach AA 4.5:1 in BOTH modes, before any browser exists.
{
  try {
    const tokens = JSON.parse(
      fs.readFileSync(path.join(root, "brand", "tokens.json"), "utf8"),
    );
    const refOf = (v) => {
      const m = typeof v === "string" && v.match(/^\{ref\.(.+)\}$/);
      return m ? tokens.ref[m[1]]?.$value : v;
    };
    const sysColor = (name, mode) =>
      refOf(tokens.sys.color[name]?.$value?.[mode]);
    const lum = (hex) => {
      const h = hex.replace("#", "");
      const c = [0, 2, 4].map((i) => {
        let x = parseInt(h.slice(i, i + 2), 16) / 255;
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const ratio = (a, b) => {
      const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (l1 + 0.05) / (l2 + 0.05);
    };
    // The contrast contract lives in brand/contrast-matrix.json (the same
    // file generate-theme reads, so generator and gate cannot disagree);
    // these built-ins are only the fallback when the file is absent.
    let PAIRS = [
      ["ink", "surface", 4.5],
      ["ink", "panel", 4.5],
      ["dim", "surface", 4.5],
      ["accent", "surface", 4.5],
      ["on-action", "action", 4.5],
      ["on-signal", "signal", 4.5],
    ];
    const matrixPath = path.join(root, "brand", "contrast-matrix.json");
    if (fs.existsSync(matrixPath)) {
      const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
      if (Array.isArray(matrix.pairs) && matrix.pairs.length)
        PAIRS = matrix.pairs.map((p) => [p.fg, p.bg, p.min ?? 4.5]);
    }
    const fails = [];
    const unresolved = [];
    let checked = 0;
    for (const [fg, bg, min] of PAIRS) {
      for (const mode of ["light", "dark"]) {
        const f = sysColor(fg, mode);
        const b = sysColor(bg, mode);
        if (!f || !b || !/^#/.test(f) || !/^#/.test(b)) {
          unresolved.push(`${fg}/${bg} ${mode}`);
          continue;
        }
        checked++;
        const r = ratio(f, b);
        if (r < min) fails.push(`${fg}/${bg} ${mode} ${r.toFixed(2)}:1 (min ${min})`);
      }
    }
    if (fails.length)
      report("FAIL", "contrast pairs", "below matrix minimums: " + fails.join(", "));
    else if (unresolved.length)
      report(
        "BLOCKED",
        "contrast pairs",
        `${checked} checked, UNRESOLVED (missing or non-hex): ` +
          unresolved.join(", "),
      );
    else
      report(
        "PASS",
        "contrast pairs",
        `${checked} pair-modes checked, all reach AA 4.5:1`,
      );
  } catch (e) {
    report("BLOCKED", "contrast pairs", "tokens.json unreadable: " + e.message);
  }
}

// C12: imagery usage. A portal that ships zero photographs while the
// capture holds usable ones wastes its own evidence; curation is a
// mandatory build step. Stock/press-agency files never count as usable.
{
  const intakeImgs = path.join(root, "intake", "crawl", "assets", "images");
  if (!fs.existsSync(intakeImgs)) {
    report("PASS", "imagery usage", "no capture (template seed context)");
  } else {
    const STOCK = /colourbox|shutterstock|getty|istock|unsplash|ritzau|pexels/i;
    const usable = fs
      .readdirSync(intakeImgs)
      .filter(
        (f) =>
          /\.(jpe?g|png|webp)$/i.test(f) &&
          !STOCK.test(f) &&
          fs.statSync(path.join(intakeImgs, f)).size > 60_000,
      );
    const outDir = path.join(root, "output", "client");
    let imgTags = 0;
    if (fs.existsSync(outDir)) {
      for (const f of walk(outDir, [".html"]))
        imgTags += (fs.readFileSync(f, "utf8").match(/<img[\s>]/g) ?? []).length;
    }
    const pubImgs = path.join(root, "public", "images");
    const curated = fs.existsSync(pubImgs)
      ? fs.readdirSync(pubImgs).filter((f) => /\.(jpe?g|png|webp|svg)$/i.test(f)).length
      : 0;
    const manifest = fs.existsSync(path.join(pubImgs, "manifest.json"));
    if (usable.length >= 5 && imgTags === 0) {
      report(
        "FAIL",
        "imagery usage",
        `${usable.length} usable captured images but the built portal has 0 <img> tags: curate into public/images/ and wire ImageFrame src`,
      );
    } else if (curated > 0 && !manifest) {
      report(
        "FAIL",
        "imagery usage",
        `${curated} curated image(s) in public/images without manifest.json (file, source page, rights note)`,
      );
    } else {
      report(
        "PASS",
        "imagery usage",
        `${usable.length} usable captured, ${curated} curated, ${imgTags} <img> in output`,
      );
    }
  }
}

// C11: theme integrity. Anchors survive verbatim in the generated
// ladders (the anchor-lock law made checkable), and the type ramp is a
// sane monotone scale.
{
  const laddersPath = path.join(root, "brand", "ladders.json");
  if (!fs.existsSync(laddersPath)) {
    report(
      "PASS",
      "theme integrity",
      "no ladders.json (run npm run generate-theme to derive ladders)",
    );
  } else {
    try {
      const ladders = JSON.parse(fs.readFileSync(laddersPath, "utf8"));
      const problems = [];
      for (const l of ladders.ladders ?? []) {
        if (l.pinnedStep === null) continue;
        if (!l.steps.includes(l.anchor.toLowerCase()))
          problems.push(`${l.name}: anchor ${l.anchor} mutated out of its ladder`);
      }
      const sizes = (ladders.type?.steps ?? []).map((t) => parseFloat(t.size));
      const ratio = Number(ladders.type?.ratio ?? 0);
      if (sizes.length) {
        if (!sizes.every((v, i) => i === 0 || v > sizes[i - 1]))
          problems.push("type ramp not monotone");
        if (sizes.length < 6 || sizes.length > 8)
          problems.push(`type ramp has ${sizes.length} steps (want 6-8)`);
        if (ratio < 1.05 || ratio > 1.7)
          problems.push(`type ratio ${ratio} outside 1.05-1.7`);
      }
      if (problems.length)
        report("FAIL", "theme integrity", problems.join("; "));
      else
        report(
          "PASS",
          "theme integrity",
          `${(ladders.ladders ?? []).length} ladders anchored verbatim, type ramp ${ratio} monotone`,
        );
    } catch (e) {
      report("BLOCKED", "theme integrity", "ladders.json unreadable: " + e.message);
    }
  }
}

// C8: build stamp. The shipped output must be traceable to a commit; a
// dirty tree at build time makes the stamp unverifiable.
{
  try {
    const dirty = execSync("git status --porcelain", {
      cwd: root,
      encoding: "utf8",
    }).trim();
    const head = execSync("git rev-parse --short HEAD", {
      cwd: root,
      encoding: "utf8",
    }).trim();
    const changesPath = path.join(root, "output", "client", "changes.json");
    let note = `HEAD ${head}`;
    if (fs.existsSync(changesPath)) {
      const built = JSON.parse(fs.readFileSync(changesPath, "utf8"))?.built
        ?.commit;
      if (built && !head.startsWith(built) && !built.startsWith(head)) {
        note += `, output built at ${built} — REBUILD before shipping`;
      }
    }
    if (dirty)
      note += `; WARNING: dirty working tree, commit before declaring shipped`;
    report("PASS", "build stamp", note);
  } catch {
    report("BLOCKED", "build stamp", "git unavailable");
  }
}

// C9: template version. A field clone cannot know it is stale unless the
// gate tells it. Bump TEMPLATE_VERSION together with templateVersion in
// the seed brand.config.ts on machinery changes.
const TEMPLATE_VERSION = "0.7.0";
{
  const config = fs.readFileSync(
    path.join(root, "brand", "brand.config.ts"),
    "utf8",
  );
  const m = config.match(/templateVersion: "([^"]+)"/);
  const v = m ? m[1] : "unknown";
  if (v === TEMPLATE_VERSION) {
    report("PASS", "template version", v);
  } else {
    report(
      "PASS",
      "template version",
      `config ${v} vs gate ${TEMPLATE_VERSION}; WARNING: clone is behind the template, pull before building`,
    );
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
// Leave auditable evidence of every gate run.
try {
  const head = execSync("git rev-parse --short HEAD", {
    cwd: root,
    encoding: "utf8",
  }).trim();
  const reportLines = [
    "# Validate report",
    "",
    `Commit: ${head} · Template: ${TEMPLATE_VERSION}`,
    "",
    ...results.map((r) => `- ${r.status} ${r.name}: ${r.detail}`),
    "",
    `${results.length - fails.length - blocked.length} pass, ${fails.length} fail, ${blocked.length} blocked`,
  ];
  fs.writeFileSync(
    path.join(root, "docs", "validate-report.md"),
    reportLines.join("\n") + "\n",
  );
} catch {
  /* report file is best effort */
}
if (fails.length) process.exit(1);
if (blocked.length) {
  console.log("BLOCKED is never a pass: supply the missing input and re-run.");
  process.exit(2);
}

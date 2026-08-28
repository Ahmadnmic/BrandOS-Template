// Stage 5: brand/design-token extraction from the site's CSS + logo collection
import fs from "node:fs";
import path from "node:path";
import { parseArgs, siteConfig } from "./lib.mjs";

const cfg = siteConfig(parseArgs());
const CSSDIR = path.join(cfg.out, "css");
const BRAND = path.join(cfg.out, "brand");
const IMGDIR = path.join(cfg.out, "assets", "images");
fs.mkdirSync(path.join(BRAND, "logos"), { recursive: true });

const cssFiles = fs.existsSync(CSSDIR)
  ? fs.readdirSync(CSSDIR).filter((f) => f.endsWith(".css"))
  : [];
let allCss = "";
const perFile = {};
for (const f of cssFiles) {
  perFile[f] = fs.readFileSync(path.join(CSSDIR, f), "utf8");
  allCss += `\n/* ==== ${f} ==== */\n` + perFile[f];
}

const rootBlocks = [];
for (const [f, css] of Object.entries(perFile))
  for (const m of css.matchAll(/:root[^{}]*\{[^{}]*\}/g))
    rootBlocks.push(`/* from ${f} */\n${m[0]}`);
const varDefs = new Map();
for (const m of allCss.matchAll(/(--[a-zA-Z0-9-_]+)\s*:\s*([^;{}]+)[;}]/g))
  if (!varDefs.has(m[1])) varDefs.set(m[1], m[2].trim());

const colorCount = new Map();
for (const m of allCss.matchAll(
  /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g,
))
  colorCount.set(
    m[0].toLowerCase(),
    (colorCount.get(m[0].toLowerCase()) || 0) + 1,
  );
for (const m of allCss.matchAll(/rgba?\([^)]+\)/g)) {
  const c = m[0].replace(/\s+/g, "");
  colorCount.set(c, (colorCount.get(c) || 0) + 1);
}
const colors = [...colorCount.entries()].sort((a, b) => b[1] - a[1]);

// brandScore ranking (the designlang formula): rank captured colors by
// interactive-background weight + saturation + usage, so reconciliation
// weighs a NUMBER against the CVI instead of a feeling. Secondary must
// sit far from primary; the confidence gap says when to ASK, not decide.
function hexToHsl(hex) {
  const h = hex.replace("#", "");
  if (h.length < 6) return null;
  const r = parseInt(h.slice(0, 2), 16) / 255,
    g = parseInt(h.slice(2, 4), 16) / 255,
    b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    l = (max + min) / 2;
  const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
  return { s: s * 100, l: l * 100 };
}
function colorDist(a, b) {
  const pa = a.replace("#", ""),
    pb = b.replace("#", "");
  let d = 0;
  for (let i = 0; i < 6; i += 2)
    d +=
      (parseInt(pa.slice(i, i + 2), 16) - parseInt(pb.slice(i, i + 2), 16)) **
      2;
  return Math.sqrt(d) / 4.41;
}
const INTERACTIVE_SEL = /\b(btn|button|cta|primary|action)\b/i;
const interactiveBg = new Set();
for (const m of allCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  if (!INTERACTIVE_SEL.test(m[1])) continue;
  for (const c of m[2].matchAll(
    /background(?:-color)?\s*:\s*(#[0-9a-fA-F]{6})/g,
  ))
    interactiveBg.add(c[1].toLowerCase());
}
const hexOnly = colors.filter(([c]) => /^#[0-9a-f]{6}$/.test(c));
const scored = hexOnly
  .map(([hex, count]) => {
    const hsl = hexToHsl(hex) ?? { s: 0, l: 50 };
    const chromatic =
      (hsl.s > 25 && hsl.l > 5 && hsl.l < 95) || interactiveBg.has(hex);
    return {
      hex,
      count,
      saturation: Math.round(hsl.s),
      lightness: Math.round(hsl.l),
      interactiveBg: interactiveBg.has(hex),
      chromatic,
      brandScore: Math.round(
        (interactiveBg.has(hex) ? 100 : 0) +
          hsl.s * 2 +
          Math.log10(Math.max(1, count)) * 10,
      ),
    };
  })
  .filter((c) => c.chromatic)
  .sort((a, b) => b.brandScore - a.brandScore);
const primaryC = scored[0];
const secondaryC = scored.find(
  (c) => primaryC && colorDist(c.hex, primaryC.hex) > 60,
);
const confidence =
  primaryC && scored[1]
    ? Math.min(
        1,
        Math.max(
          0.3,
          0.3 +
            (1.4 * (primaryC.brandScore - scored[1].brandScore)) /
              primaryC.brandScore,
        ),
      )
    : 0.3;
fs.writeFileSync(
  path.join(BRAND, "color-evidence.json"),
  JSON.stringify(
    {
      $description:
        "brandScore ranking of captured chromatic colors (interactiveBg*100 + saturation*2 + log10(count)*10). confidence < 0.6: ASK the user which color is primary instead of deciding.",
      primary: primaryC?.hex ?? null,
      secondary: secondaryC?.hex ?? null,
      confidence: Math.round(confidence * 100) / 100,
      candidates: scored.slice(0, 20),
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "[brand] color-evidence: primary",
  primaryC?.hex,
  "secondary",
  secondaryC?.hex,
  "confidence",
  Math.round(confidence * 100) / 100,
  confidence < 0.6 ? "(LOW: ask the user)" : "",
);

const fontFaces = [
  ...new Set([...allCss.matchAll(/@font-face\s*\{[^{}]*\}/g)].map((m) => m[0])),
];
const familyCount = new Map();
for (const m of allCss.matchAll(/font-family\s*:\s*([^;{}]+)[;}]/g))
  familyCount.set(m[1].trim(), (familyCount.get(m[1].trim()) || 0) + 1);

fs.writeFileSync(
  path.join(BRAND, "tokens.css"),
  `/* ${cfg.host} — extracted design tokens (auto-generated from live site CSS) */\n\n/* ---- :root blocks as found ---- */\n${rootBlocks.join("\n\n")}\n\n/* ---- all custom properties (deduped) ---- */\n:root {\n${[...varDefs.entries()].map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}\n\n/* ---- @font-face declarations ---- */\n${fontFaces.join("\n\n")}\n`,
);

const swatches = colors
  .filter(([, n]) => n >= 2)
  .slice(0, 120)
  .map(
    ([c, n]) =>
      `<div class="sw"><div class="chip" style="background:${c}"></div><code>${c}</code><span>×${n}</span></div>`,
  )
  .join("\n");
fs.writeFileSync(
  path.join(BRAND, "colors.html"),
  `<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>${cfg.host} color audit</title>\n<style>body{font-family:system-ui;margin:40px;background:#fafafa}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}.sw{background:#fff;border:1px solid #ddd;border-radius:8px;padding:8px;font-size:12px}.chip{height:48px;border-radius:6px;border:1px solid #0002;margin-bottom:6px}code{display:block}span{color:#888}</style></head><body>\n<h1>${cfg.host} — color usage (from live CSS)</h1>\n<div class="grid">\n${swatches}\n</div></body></html>`,
);

fs.writeFileSync(
  path.join(BRAND, "typography.md"),
  `# ${cfg.host} — typography (extracted from live CSS)\n\n## Font families by usage\n${[
    ...familyCount.entries(),
  ]
    .sort((a, b) => b[1] - a[1])
    .map(([f, n]) => `- \`${f}\` — used ${n}×`)
    .join(
      "\n",
    )}\n\n## @font-face declarations\nSee \`tokens.css\`. Font binaries are in \`../assets/fonts/\`.\n`,
);

let logos = 0;
const logoManifest = [];
function takeLogo(src, name, how) {
  try {
    const st = fs.statSync(src);
    if (st.size < 80) return; // empty or corrupt capture, not a usable logo
    const dest = path.join(BRAND, "logos", name);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      logos++;
      logoManifest.push({ file: name, bytes: st.size, how });
    }
  } catch {
    /* unreadable candidate */
  }
}
if (fs.existsSync(IMGDIR)) {
  for (const f of fs.readdirSync(IMGDIR)) {
    if (/logo|brandmark|favicon|icon-\d+x\d+|apple-touch|sprite/i.test(f))
      takeLogo(path.join(IMGDIR, f), f, "filename match");
  }
}
// Second net: images the pages themselves present as the logo (header/nav
// placement or logo-ish alt/class), resolved through the asset map. Catches
// brands whose logo file is named nothing like "logo".
try {
  const cheerio = await import("cheerio");
  const assetMapPath = cfg.meta("asset-map.json");
  if (fs.existsSync(assetMapPath)) {
    const assetMap = JSON.parse(fs.readFileSync(assetMapPath, "utf8"));
    const byPath = new Map(
      Object.entries(assetMap).map(([u, rel]) => {
        try {
          return [new URL(u).pathname.split("/").pop(), rel];
        } catch {
          return [null, rel];
        }
      }),
    );
    const pagesDir = path.join(cfg.out, "pages");
    const pageFiles = [];
    (function walkDir(d) {
      if (!fs.existsSync(d)) return;
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walkDir(p);
        else if (e.name === "index.html") pageFiles.push(p);
      }
    })(pagesDir);
    for (const f of pageFiles.slice(0, 40)) {
      const $ = cheerio.load(fs.readFileSync(f, "utf8"));
      $(
        'header img, nav img, a[href="/"] img, [class*="logo" i] img, img[alt*="logo" i], img[class*="logo" i]',
      ).each((_, el) => {
        const src = $(el).attr("src") || $(el).attr("data-src") || "";
        const base = src.split("?")[0].split("/").pop();
        if (!base) return;
        const rel = byPath.get(base);
        if (rel)
          takeLogo(path.join(cfg.out, rel), base, "header/alt placement");
      });
    }
  }
} catch {
  /* placement net is best effort */
}
fs.writeFileSync(
  path.join(BRAND, "logos", "manifest.json"),
  JSON.stringify(logoManifest, null, 2),
);
// large inline SVGs from header/footer components are often the real logo
const COMPD = path.join(cfg.out, "components");
if (fs.existsSync(COMPD)) {
  for (const comp of ["SiteHeader", "SiteFooter", "SiteNav"]) {
    const dir = path.join(COMPD, comp);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".html"))) {
      (
        fs
          .readFileSync(path.join(dir, f), "utf8")
          .match(/<svg[\s\S]*?<\/svg>/g) || []
      ).forEach((s, i) => {
        if (s.length < 300 || s.length > 60000) return;
        if (!/logo|brand/i.test(s) && s.length < 2000) return;
        const out = path.join(
          BRAND,
          "logos",
          `inline-${comp}-${f.replace(".html", "")}-${i}.svg`,
        );
        if (!fs.existsSync(out)) {
          fs.writeFileSync(out, s);
          logos++;
        }
      });
    }
  }
}
console.log(
  "[brand] vars:",
  varDefs.size,
  "| colors:",
  colors.length,
  "| font-faces:",
  fontFaces.length,
  "| families:",
  familyCount.size,
  "| logos:",
  logos,
);
if (!logos)
  console.log(
    "[brand] WARNING: NO usable logo captured. Escalate per the IMAGES & LOGOS GUARANTEE (rendered capture of the header, sprite files, external hosts); never paint a logo from memory.",
  );

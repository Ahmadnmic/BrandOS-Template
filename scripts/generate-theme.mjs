// Evidence-bound theme generation. ANCHOR LOCK is the law: every color
// that carries evidence in brand/tokens.json is an immutable input; this
// script only INFILLS around the anchors:
//   1. a 12-step perceptual tone ladder per core ref color (Radix step
//      semantics, tints.dev anchor-and-interpolate, OKLCH so ramps never
//      go muddy), with the evidence hex pinned VERBATIM at the step
//      matching its measured lightness;
//   2. a type ramp derived from sys.type {base, ratio} (typescale model);
//   3. a report checking the current sys pairs against
//      brand/contrast-matrix.json, the same matrix the gate enforces.
// Output: brand/ladders.json (generated artifact; build-tokens emits it
// as --ref-<name>-1..12 custom properties and type sizes). tokens.json is
// never modified: anchors stay where the evidence put them.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hexToOklch, oklchToHex, contrastRatio } from "./color-utils.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tokens = JSON.parse(
  fs.readFileSync(path.join(root, "brand", "tokens.json"), "utf8"),
);

// Radix-style step lightness targets (OKLab L), light surfaces first.
const STEP_L = [
  0.985, 0.965, 0.93, 0.895, 0.855, 0.8, 0.73, 0.645, 0.55, 0.5, 0.42, 0.27,
];
// Step jobs, so consumers know what each number is for.
const STEP_ROLES = [
  "app background",
  "subtle background",
  "component rest",
  "component hover",
  "component pressed",
  "border subtle",
  "border interactive",
  "border strong",
  "solid",
  "solid hover",
  "text low-contrast",
  "text high-contrast",
];

function buildLadder(name, hex) {
  const anchor = hexToOklch(hex);
  // Pin the evidence hex at the step nearest its MEASURED lightness; the
  // exact brand value survives verbatim in the ladder (CVI fidelity).
  let pin = 0;
  for (let i = 1; i < STEP_L.length; i++) {
    if (Math.abs(STEP_L[i] - anchor.L) < Math.abs(STEP_L[pin] - anchor.L))
      pin = i;
  }
  const steps = STEP_L.map((L, i) => {
    if (i === pin) return hex.toLowerCase();
    // Chroma eases toward the extremes so near-white and near-black steps
    // do not wash out or oversaturate (the tints.dev re-saturation curve,
    // inverted for OKLCH where extremes need LESS chroma).
    const dist = Math.abs(L - anchor.L);
    const C = anchor.C * Math.max(0.12, 1 - dist * 1.15);
    return oklchToHex({ L, C, H: anchor.H });
  });
  return { name, anchor: hex.toLowerCase(), pinnedStep: pin + 1, steps };
}

// Core = ref colors annotated for print (the brand's canonical set);
// support colors stay single values.
const core = Object.entries(tokens.ref)
  .filter(
    ([k, v]) => !k.startsWith("$") && v?.$extensions?.["com.nm.brandos.print"],
  )
  .map(([k, v]) => [k, v.$value]);

const ladders = core.map(([name, hex]) => buildLadder(name, hex));

// Neutral ladder: the darkest core color desaturated, for greys that stay
// in the brand's temperature (Radix pairs greys with hue families).
const darkest = core.reduce((a, b) =>
  hexToOklch(a[1]).L < hexToOklch(b[1]).L ? a : b,
);
const nAnchor = hexToOklch(darkest[1]);
ladders.push({
  name: "neutral",
  anchor: darkest[1].toLowerCase(),
  pinnedStep: null,
  steps: STEP_L.map((L) =>
    oklchToHex({ L, C: Math.min(nAnchor.C * 0.18, 0.02), H: nAnchor.H }),
  ),
});

// Type ramp: size(n) = base * ratio^n, rounded to the half pixel, with
// line-height inversely tracking size (typescale practice rules).
const base = parseFloat(tokens.sys.type?.base?.$value ?? "16");
const ratio = Number(tokens.sys.type?.ratio?.$value ?? 1.25);
const TYPE_STEPS = ["caption", "body", "lead", "h3", "h2", "h1", "display"];
const type = TYPE_STEPS.map((label, i) => {
  const n = i - 1; // body = base
  const size = Math.round(base * Math.pow(ratio, n) * 2) / 2;
  const lineHeight =
    Math.round((1.6 - 0.5 * (i / (TYPE_STEPS.length - 1))) * 100) / 100;
  return { label, size: size + "px", lineHeight };
});

// Contrast report against the shared matrix (the gate enforces the same
// file; this run shows the numbers while theming).
const refOf = (v) => {
  const m = typeof v === "string" && v.match(/^\{ref\.(.+)\}$/);
  return m ? tokens.ref[m[1]]?.$value : v;
};
const matrixPath = path.join(root, "brand", "contrast-matrix.json");
const matrix = fs.existsSync(matrixPath)
  ? JSON.parse(fs.readFileSync(matrixPath, "utf8"))
  : { pairs: [] };
const report = [];
for (const p of matrix.pairs) {
  for (const mode of ["light", "dark"]) {
    const fg = refOf(tokens.sys.color[p.fg]?.$value?.[mode]);
    const bg = refOf(tokens.sys.color[p.bg]?.$value?.[mode]);
    if (!fg || !bg || !/^#/.test(fg) || !/^#/.test(bg)) continue;
    const r = contrastRatio(fg, bg);
    report.push({
      pair: `${p.fg}/${p.bg}`,
      mode,
      ratio: Math.round(r * 100) / 100,
      min: p.min,
      ok: r >= p.min,
    });
  }
}

const out = {
  $description:
    "Generated by scripts/generate-theme.mjs. Tone ladders (12 Radix-style steps, evidence hex pinned verbatim at its measured lightness) and the type ramp derived from sys.type. Regenerate after any tokens.json change; never hand-edit.",
  stepRoles: STEP_ROLES,
  ladders,
  type: { base: base + "px", ratio, steps: type },
  contrastReport: report,
};
fs.writeFileSync(
  path.join(root, "brand", "ladders.json"),
  JSON.stringify(out, null, 2) + "\n",
);

console.log(
  `[generate-theme] ${ladders.length} ladders (${core.map(([k]) => k).join(", ")}, neutral), anchors pinned verbatim`,
);
console.log(
  `[generate-theme] type ramp: base ${base}px, ratio ${ratio} -> ${type.map((t) => t.size).join(" / ")}`,
);
const bad = report.filter((r) => !r.ok);
for (const r of report)
  console.log(
    `[generate-theme] ${r.ok ? "ok  " : "FAIL"} ${r.pair} ${r.mode}: ${r.ratio}:1 (min ${r.min})`,
  );
if (bad.length) {
  console.error(
    `[generate-theme] ${bad.length} pair(s) below the matrix minimums. Fix sys bindings; anchors are immutable.`,
  );
  process.exit(1);
}
console.log("[generate-theme] brand/ladders.json written");

// tokens.json (DTCG) -> brand/tokens.css
// Emits: sys custom properties with light/dark contexts + a Tailwind v4
// @theme block so utilities and runtime vars come from one source.
// Style Dictionary can replace this emitter when export formats multiply;
// the file contract (tokens.css) stays the same.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tokens = JSON.parse(
  fs.readFileSync(path.join(root, "brand", "tokens.json"), "utf8"),
);

function resolveAlias(value, depth = 0) {
  if (depth > 8) throw new Error("Alias loop: " + value);
  if (typeof value !== "string") return value;
  const m = value.match(/^\{(.+)\}$/);
  if (!m) return value;
  const node = m[1]
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), tokens);
  if (!node || node.$value === undefined)
    throw new Error("Unresolved alias: " + value);
  return resolveAlias(node.$value, depth + 1);
}

const light = [];
const dark = [];
const theme = [];

for (const [name, node] of Object.entries(tokens.sys.color)) {
  if (name.startsWith("$")) continue;
  const v = node.$value;
  light.push(`  --sys-${name}: ${resolveAlias(v.light)};`);
  dark.push(`  --sys-${name}: ${resolveAlias(v.dark)};`);
  theme.push(`  --color-${name}: var(--sys-${name});`);
}

for (const [name, node] of Object.entries(tokens.sys.font)) {
  if (name.startsWith("$")) continue;
  light.push(`  --sys-font-${name}: ${node.$value};`);
  theme.push(`  --font-${name}: var(--sys-font-${name});`);
}

for (const [name, node] of Object.entries(tokens.sys.radius)) {
  if (name.startsWith("$")) continue;
  light.push(`  --sys-radius-${name}: ${node.$value};`);
  theme.push(`  --radius-${name}: var(--sys-radius-${name});`);
}

light.push(`  --sys-tracking-display: ${tokens.sys.tracking.display.$value};`);
light.push(`  --sys-tracking-label: ${tokens.sys.tracking.label.$value};`);
light.push(`  --sys-case-display: ${tokens.sys.case.display.$value};`);
light.push(`  --sys-space-scale: ${tokens.sys.space.scale.$value};`);
light.push(`  --sys-alignment: ${tokens.sys.composition.alignment.$value};`);

// Generated tone ladders and the type ramp (brand/ladders.json, written by
// generate-theme): full 12-step ref ladders and derived type sizes become
// real custom properties developers can build with.
const laddersPath = path.join(root, "brand", "ladders.json");
if (fs.existsSync(laddersPath)) {
  const ladders = JSON.parse(fs.readFileSync(laddersPath, "utf8"));
  for (const l of ladders.ladders ?? []) {
    l.steps.forEach((hex, i) => {
      light.push(`  --ref-${l.name}-${i + 1}: ${hex};`);
    });
  }
  for (const t of ladders.type?.steps ?? []) {
    light.push(`  --sys-type-${t.label}: ${t.size};`);
    light.push(`  --sys-leading-${t.label}: ${t.lineHeight};`);
  }
}

for (const [name, node] of Object.entries(tokens.sys.motion)) {
  if (name.startsWith("$")) continue;
  const v = Array.isArray(node.$value)
    ? `cubic-bezier(${node.$value.join(", ")})`
    : node.$value;
  light.push(`  --sys-${name}: ${v};`);
  if (name.startsWith("ease-")) theme.push(`  --${name}: var(--sys-${name});`);
}

const css = `/* GENERATED from brand/tokens.json. Do not edit by hand: npm run build:tokens.
   Theming contract: :root = light; [data-theme="dark"] overrides;
   prefers-color-scheme dark applies when no explicit choice is stamped. */
@theme inline {
  --color-*: initial;
  --font-*: initial;
${theme.join("\n")}
}
:root {
${light.join("\n")}
}
:root[data-theme="dark"] {
${dark.join("\n")}
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${dark.map((l) => "  " + l).join("\n")}
  }
}
`;

fs.writeFileSync(path.join(root, "brand", "tokens.css"), css);

// Real downloadable exports, served from /exports/ in dev and in the build.
const exportsDir = path.join(root, "public", "exports");
fs.mkdirSync(exportsDir, { recursive: true });
fs.writeFileSync(path.join(exportsDir, "tokens.css"), css);
fs.copyFileSync(
  path.join(root, "brand", "tokens.json"),
  path.join(exportsDir, "tokens.json"),
);
if (fs.existsSync(laddersPath)) {
  fs.copyFileSync(laddersPath, path.join(exportsDir, "ladders.json"));
}

// Component exports are generated from the ui sources, never maintained by
// hand, so they cannot drift. One provenance header on each.
const UI_EXPORTS = {
  "Button.tsx": "knap.tsx",
  "Badge.tsx": "badge.tsx",
  "Felt.tsx": "felt.tsx",
  "Banner.tsx": "banner.tsx",
  "Vaelger.tsx": "vaelger.tsx",
  "Dialog.tsx": "dialog.tsx",
};
const uiDir = path.join(root, "src", "components", "ui");
for (const [src, out] of Object.entries(UI_EXPORTS)) {
  const p = path.join(uiDir, src);
  if (!fs.existsSync(p)) continue;
  const header = `// ${tokens.$description?.split(".")[0] ?? "BrandOS"} · ${out}\n// Styles flow only through var(--sys-*) tokens. Never introduce raw values.\n`;
  fs.writeFileSync(
    path.join(exportsDir, out),
    header + fs.readFileSync(p, "utf8"),
  );
}
console.log(
  "tokens.css written:",
  theme.length,
  "theme vars,",
  light.length,
  "sys props",
);

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
console.log(
  "tokens.css written:",
  theme.length,
  "theme vars,",
  light.length,
  "sys props",
);

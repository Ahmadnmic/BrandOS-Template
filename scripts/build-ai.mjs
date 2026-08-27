// Emits the machine layer into output/client after the app build:
//   AGENTS.md     rules for AI agents editing the DEPLOYED portal
//   changes.json  append-only journal of post-build edits by agents
//   llms.txt      index for agents
//   tokens.json   copy of brand/tokens.json (design decisions as data)
// Idempotent; run as part of `npm run build`.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "output", "client");
if (!fs.existsSync(out)) {
  console.error("output/client missing; run the app build first");
  process.exit(1);
}

const configSrc = fs.readFileSync(
  path.join(root, "brand", "brand.config.ts"),
  "utf8",
);
function field(name) {
  const m = configSrc.match(new RegExp(name + ':\\s*"([^"]+)"'));
  return m ? m[1] : "";
}
const brandName = field("name");
const version = field("version");
const updated = field("updated");
const templateVersion = field("templateVersion");

let commit = "";
try {
  commit = execSync("git rev-parse --short HEAD", { cwd: root })
    .toString()
    .trim();
} catch {
  /* not a git checkout */
}

function pages(dir, prefix = "") {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.isDirectory() &&
      entry.name !== "assets" &&
      entry.name !== "gated"
    ) {
      found.push(
        ...pages(path.join(dir, entry.name), prefix + "/" + entry.name),
      );
    } else if (entry.name === "index.html") {
      found.push(prefix === "" ? "/" : prefix);
    }
  }
  return found.sort();
}
const routes = pages(out);

fs.copyFileSync(
  path.join(root, "brand", "tokens.json"),
  path.join(out, "tokens.json"),
);

const changesPath = path.join(out, "changes.json");
fs.writeFileSync(
  changesPath,
  JSON.stringify(
    {
      $schema: "brandos-changes-v1",
      built: {
        brand: brandName,
        version,
        templateVersion,
        date: updated,
        commit,
      },
      instructions:
        "Append-only journal of post-build edits made by AI agents. Before editing anything in this folder, read /AGENTS.md and every entry below. After editing, APPEND one entry: {date, agent, files: [paths], summary, reason}. Never rewrite or delete existing entries. Unrecorded changes are brand drift.",
      entries: [],
    },
    null,
    2,
  ),
);

const agentsMd = `# ${brandName} Brand OS, generated portal. Rules for AI agents.

This folder is BUILD OUTPUT (BrandOS template ${templateVersion}, brand
version ${version}, built from commit ${commit || "unknown"}). The source of
truth is the source repository, not these files.

## Before you change anything

1. Read /changes.json. Other agents may have edited this output after the
   build; their entries are the only record.
2. Read /llms.txt and /tokens.json. Every design decision lives there.

## If you can reach the source repository

Edit brand/ and content/ there and rebuild with npm run build. Never
hand-edit generated files when the source is available.

## If you must edit this output directly

1. Colors, fonts, radii and motion values may ONLY come from the --sys-*
   custom properties already present in the stylesheet, mirrored in
   /tokens.json. Never introduce a new color, font or radius.
2. Display text is uppercase mono; body text follows the existing type.
   No AI-tell phrases (no "delve", "seamless", "elevate", "unlock",
   "not just X but Y"); no em dashes, use commas, colons and periods.
3. Keep the structure semantic: real buttons, real links, one h1 per page.
4. Never remove or modify /tokens.json, /llms.txt, /AGENTS.md or existing
   entries in /changes.json. Never touch anything under /gated/.
5. RECORD YOUR CHANGE: append an entry to /changes.json (schema in the
   file). The next agent reads it first. An unrecorded change is exactly
   the brand drift this system exists to kill.

## Pages in this build

${routes.map((r) => "- " + r).join("\n")}
`;
fs.writeFileSync(path.join(out, "AGENTS.md"), agentsMd);

const llms = `# ${brandName} Brand OS

> Ét levende brand-system for ${brandName}: identitet, sprog, komponenter og tokens i én kilde. Version ${version}, opdateret ${updated}. Forstået af mennesker, brugbart for AI.

## Machine layer

- [AGENTS.md](/AGENTS.md): rules for AI agents reading or editing this portal. Read first.
- [tokens.json](/tokens.json): every design decision as DTCG data. Colors, type, radius, motion. The only legal source of visual values.
- [changes.json](/changes.json): append-only journal of post-build edits by agents. Read before editing, append after.

## Pages

${routes.map((r) => `- [${r === "/" ? "Forside" : r.slice(1)}](${r})`).join("\n")}
`;
fs.writeFileSync(path.join(out, "llms.txt"), llms);

console.log(
  "machine layer written:",
  routes.length,
  "pages indexed; AGENTS.md, llms.txt, changes.json, tokens.json in output/client",
);

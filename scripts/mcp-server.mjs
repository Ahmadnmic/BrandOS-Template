// The brand MCP: the third tier of the agent interface (context: llms.txt,
// instructions: skills, EXECUTABLE CHECKS: this server). It exposes the
// brand's own contract as tools any MCP client (Claude Code, Claude
// Desktop, Cursor, Codex) can call, answering from brand/ data and the
// same math the validation gate runs, never from a model's recollection.
//
// Run: npm run mcp (stdio transport). Register in Claude Code:
//   claude mcp add <brand> -- node scripts/mcp-server.mjs
// All reads are per-call from disk, so token edits reflect immediately.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { contrastRatio, deltaE, hexToOklch } from "./color-utils.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel) => {
  const p = path.join(root, ...rel.split("/"));
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null;
};
const configField = (name) => {
  const src = fs.readFileSync(
    path.join(root, "brand", "brand.config.ts"),
    "utf8",
  );
  const m = src.match(new RegExp(name + ':\\s*"([^"]+)"'));
  return m ? m[1] : "";
};
const text = (obj) => ({
  content: [
    {
      type: "text",
      text: typeof obj === "string" ? obj : JSON.stringify(obj, null, 2),
    },
  ],
});
const fail = (msg) => ({
  content: [{ type: "text", text: msg }],
  isError: true,
});

// Resolve a sys color role (or pass a hex through), honoring {ref.*}.
function resolveColor(nameOrHex, mode) {
  if (/^#[0-9a-fA-F]{6}$/.test(nameOrHex)) return nameOrHex.toLowerCase();
  const tokens = readJson("brand/tokens.json");
  const node = tokens?.sys?.color?.[nameOrHex];
  if (!node) return null;
  const v = node.$value?.[mode] ?? node.$value;
  const m = typeof v === "string" && v.match(/^\{ref\.(.+)\}$/);
  return (m ? tokens.ref[m[1]]?.$value : v)?.toLowerCase() ?? null;
}

const brandName = configField("name") || "BrandOS";
const server = new McpServer(
  {
    name: brandName.toLowerCase().replace(/\s+/g, "-") + "-brand",
    version: configField("templateVersion") || "0.0.0",
  },
  {
    instructions: `The ${brandName} brand as executable tools. Use check_contrast and check_copy to VERIFY before shipping anything; use get_token/get_ladder for exact values (never approximate a brand color from memory); get_rules returns every usage rule in Danish and English. All answers come from the brand's own contract files.`,
  },
);

server.registerTool(
  "brand_info",
  {
    title: "Brand overview",
    description:
      "Name, tagline, version, languages, contacts (role aliases) and which chapters are built. Start here.",
    inputSchema: {},
  },
  async () => {
    const src = fs.readFileSync(
      path.join(root, "brand", "brand.config.ts"),
      "utf8",
    );
    const chapters = [
      ...src.matchAll(
        /\{[^{}]*?num: "(\d+)"[^{}]*?title: "([^"]+)"[^{}]*?\}/gs,
      ),
    ].map((m) => ({
      num: m[1],
      title: m[2],
      built: /built: true/.test(m[0]),
      gated: /gated: true/.test(m[0]),
    }));
    const langs =
      (src.match(/langs: \[([^\]]*)\]/)?.[1] ?? "")
        .match(/"(\w+)"/g)
        ?.map((s) => s.replace(/"/g, "")) ?? [];
    const contacts = [
      ...src.matchAll(/\{ role: "([^"]+)", email: "([^"]+)" \}/g),
    ].map((m) => ({ role: m[1], email: m[2] }));
    return text({
      name: brandName,
      tagline: configField("tagline"),
      version: configField("version"),
      templateVersion: configField("templateVersion"),
      langs,
      contacts,
      chapters,
      defaultTheme:
        readJson("brand/tokens.json")?.sys?.theme?.default?.$value ?? "light",
    });
  },
);

server.registerTool(
  "get_token",
  {
    title: "Get a design token",
    description:
      "Exact value of a sys token. Colors take a role name (surface, ink, action, signal...) and a mode; other groups take group and name (radius md, type ratio, motion duration-base...).",
    inputSchema: {
      group: z
        .enum([
          "color",
          "radius",
          "font",
          "type",
          "motion",
          "tracking",
          "case",
          "space",
          "composition",
          "theme",
        ])
        .describe("Token group in sys"),
      name: z
        .string()
        .describe("Token name within the group, e.g. 'action' or 'md'"),
      mode: z
        .enum(["light", "dark"])
        .optional()
        .describe("For colors: which mode (default light)"),
    },
  },
  async ({ group, name, mode }) => {
    const tokens = readJson("brand/tokens.json");
    if (group === "color") {
      const v = resolveColor(name, mode ?? "light");
      if (!v)
        return fail(
          `No sys color role '${name}'. Roles: ${Object.keys(tokens.sys.color)
            .filter((k) => !k.startsWith("$"))
            .join(", ")}`,
        );
      return text({
        token: `--sys-${name}`,
        mode: mode ?? "light",
        value: v,
        cssVar: `var(--sys-${name})`,
      });
    }
    const node = tokens.sys[group]?.[name];
    if (!node)
      return fail(
        `No sys.${group}.${name}. Available: ${
          Object.keys(tokens.sys[group] ?? {})
            .filter((k) => !k.startsWith("$"))
            .join(", ") || "none"
        }`,
      );
    return text({ token: `sys.${group}.${name}`, value: node.$value });
  },
);

server.registerTool(
  "list_tokens",
  {
    title: "List all tokens",
    description:
      "Every sys token with its value(s). The complete design contract in one call.",
    inputSchema: {},
  },
  async () => {
    const tokens = readJson("brand/tokens.json");
    const outObj = {};
    for (const [group, nodes] of Object.entries(tokens.sys)) {
      if (group.startsWith("$")) continue;
      outObj[group] = {};
      for (const [name, node] of Object.entries(nodes)) {
        if (name.startsWith("$")) continue;
        if (group === "color") {
          outObj[group][name] = {
            light: resolveColor(name, "light"),
            dark: resolveColor(name, "dark"),
          };
        } else {
          outObj[group][name] = node.$value;
        }
      }
    }
    return text(outObj);
  },
);

server.registerTool(
  "check_contrast",
  {
    title: "Check contrast",
    description:
      "WCAG contrast between two colors (sys role names or hex values), judged against the brand's contrast matrix. On failure, suggests the nearest ladder step that passes. Use before putting any text on any surface.",
    inputSchema: {
      foreground: z.string().describe("Sys role name or #rrggbb"),
      background: z.string().describe("Sys role name or #rrggbb"),
      mode: z
        .enum(["light", "dark"])
        .optional()
        .describe("Mode for role resolution (default light)"),
    },
  },
  async ({ foreground, background, mode }) => {
    const m = mode ?? "light";
    const fg = resolveColor(foreground, m);
    const bg = resolveColor(background, m);
    if (!fg || !bg)
      return fail(
        `Could not resolve ${!fg ? foreground : background}. Pass a sys color role or a #rrggbb hex.`,
      );
    const ratio = Math.round(contrastRatio(fg, bg) * 100) / 100;
    const matrix = readJson("brand/contrast-matrix.json");
    const pair = matrix?.pairs?.find(
      (p) => p.fg === foreground && p.bg === background,
    );
    const min = pair?.min ?? 4.5;
    const result = {
      foreground: fg,
      background: bg,
      mode: m,
      ratio: `${ratio}:1`,
      minimum: `${min}:1`,
      passes: ratio >= min,
      matrixPair: pair
        ? `${pair.fg}/${pair.bg} (${pair.role})`
        : "not in matrix; 4.5 floor applied",
    };
    if (ratio < min) {
      const ladders = readJson("brand/ladders.json");
      let best = null;
      for (const l of ladders?.ladders ?? []) {
        for (const step of l.steps) {
          if (contrastRatio(step, bg) >= min) {
            const d = deltaE(step, fg);
            if (!best || d < best.deltaE)
              best = {
                suggestion: step,
                ladder: l.name,
                deltaE: Math.round(d * 10) / 10,
              };
          }
        }
      }
      result.fix = best
        ? `Nearest passing brand color: ${best.suggestion} (ladder ${best.ladder}, deltaE ${best.deltaE} from your foreground)`
        : "No ladder step passes on this background; change the background role.";
    }
    return text(result);
  },
);

server.registerTool(
  "check_copy",
  {
    title: "Check copy against the brand",
    description:
      "Deterministic scan of text against the writing rules (no em/en dashes as pause marks, no AI-tell phrases) and the termbank (banned terms, known mistakes, casing). Returns violations with fixes. Run on every piece of copy before it ships.",
    inputSchema: {
      copyText: z.string().describe("The text to check"),
    },
  },
  async ({ copyText }) => {
    const violations = [];
    let fixed = copyText;
    for (const ch of ["—", "–"]) {
      if (copyText.includes(ch))
        violations.push({
          rule: "writing",
          found: ch === "—" ? "em dash" : "en dash",
          fix: "use commas, colons or periods as pause marks",
        });
    }
    const BANNED = [
      "delve",
      "seamless",
      "leverage",
      "game-changer",
      "cutting-edge",
      "tapestry",
      "testament to",
      "it's worth noting",
      "unlock",
      "unleash",
      "elevate",
      "in today's fast-paced world",
    ];
    for (const b of BANNED) {
      if (copyText.toLowerCase().includes(b))
        violations.push({
          rule: "writing",
          found: b,
          fix: "rewrite with concrete nouns and short sentences",
        });
    }
    const terms = readJson("brand/terms.json");
    for (const t of terms?.terms ?? []) {
      for (const mk of t.mistakes ?? []) {
        const re = new RegExp(
          mk.mistake.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          mk.caseSensitive ? "g" : "gi",
        );
        if (re.test(copyText)) {
          violations.push({
            rule: "term",
            found: mk.mistake,
            fix: `use "${t.term}"`,
          });
          if (t.autofix?.fixCommonMistakes) fixed = fixed.replace(re, t.term);
        }
      }
      if (t.caseSensitive) {
        const wrong = new RegExp(
          t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "gi",
        );
        for (const hit of copyText.matchAll(wrong)) {
          if (hit[0] !== t.term) {
            violations.push({
              rule: "term-casing",
              found: hit[0],
              fix: `write "${t.term}"`,
            });
            if (t.autofix?.fixCase) fixed = fixed.replace(hit[0], t.term);
          }
        }
      }
    }
    return text({
      violations,
      clean: violations.length === 0,
      fixedText: fixed !== copyText ? fixed : undefined,
    });
  },
);

server.registerTool(
  "get_ladder",
  {
    title: "Get a tone ladder",
    description:
      "The 12-step perceptual ladder for a core brand color (or 'neutral'), with each step's job. The anchor step is the exact evidence hex.",
    inputSchema: {
      name: z
        .string()
        .describe("Ladder name, e.g. 'dybhav', 'signal', 'neutral'"),
    },
  },
  async ({ name }) => {
    const ladders = readJson("brand/ladders.json");
    const l = ladders?.ladders?.find((x) => x.name === name);
    if (!l)
      return fail(
        `No ladder '${name}'. Available: ${ladders?.ladders?.map((x) => x.name).join(", ") ?? "none (run npm run generate-theme)"}`,
      );
    return text({
      name: l.name,
      anchor: l.anchor,
      pinnedStep: l.pinnedStep,
      steps: l.steps.map((hex, i) => ({
        step: i + 1,
        hex,
        role: ladders.stepRoles[i],
        cssVar: `var(--ref-${l.name}-${i + 1})`,
        tone: Math.round(hexToOklch(hex).L * 100) / 100,
      })),
    });
  },
);

server.registerTool(
  "get_rules",
  {
    title: "Get usage rules",
    description:
      "Every GØR/UNDGÅ usage rule from the guide as data, in Danish and English, optionally filtered by chapter (farver, typografi, billedstil, motion, komponenter...).",
    inputSchema: {
      chapter: z
        .string()
        .optional()
        .describe("Chapter filter (section name, lowercase)"),
    },
  },
  async ({ chapter }) => {
    const rules = readJson("brand/rules.json");
    if (!rules)
      return fail(
        "brand/rules.json missing; run npm run build to generate it.",
      );
    const filtered = chapter
      ? rules.rules.filter((r) =>
          r.chapter.toLowerCase().includes(chapter.toLowerCase()),
        )
      : rules.rules;
    return text({ count: filtered.length, rules: filtered });
  },
);

server.registerTool(
  "list_exports",
  {
    title: "List downloadable artifacts",
    description:
      "The brand's downloadable files (tokens as CSS/JSON, ladders, component sources) with their paths on the served portal.",
    inputSchema: {},
  },
  async () => {
    const dir = path.join(root, "public", "exports");
    const files = fs.existsSync(dir)
      ? fs.readdirSync(dir).map((f) => ({
          file: f,
          path: "/exports/" + f,
          bytes: fs.statSync(path.join(dir, f)).size,
        }))
      : [];
    return text({ files });
  },
);

for (const [name, rel, description] of [
  ["tokens", "brand/tokens.json", "Every design decision as DTCG data"],
  ["ladders", "brand/ladders.json", "Generated tone ladders and type ramp"],
  ["contrast-matrix", "brand/contrast-matrix.json", "The contrast contract"],
  ["terms", "brand/terms.json", "The brand termbank"],
  ["rules", "brand/rules.json", "Usage rules extracted from the guide"],
]) {
  server.registerResource(
    name,
    `brand://${name}`,
    { title: name, description, mimeType: "application/json" },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: fs.existsSync(path.join(root, ...rel.split("/")))
            ? fs.readFileSync(path.join(root, ...rel.split("/")), "utf8")
            : "{}",
        },
      ],
    }),
  );
}

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`[brandos-mcp] ${brandName} brand server ready on stdio`);

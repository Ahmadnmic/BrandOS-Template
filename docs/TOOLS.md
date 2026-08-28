# Tools BrandOS builds on

Credits for the open tools the template uses, recommends or borrows
ideas from, and the reasoning for using them instead of building our
own. The default rule: build what carries brand judgment (evidence
weighing, theme generation, guide voice), use the ecosystem for solved
infrastructure. A maintained tool with real adoption beats a bespoke
reimplementation we would have to debug alone.

## In the pipeline today

- [Firecrawl](https://github.com/firecrawl/firecrawl): rendering and
  crawling JS-heavy sites is a hard, adversarial problem (proxies, bot
  walls, rendering farms). The intake uses it only where a plain fetch
  proves insufficient, which keeps most runs at a few credits.
- [React Router](https://github.com/remix-run/react-router) +
  [Vite](https://github.com/vitejs/vite) +
  [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss): the
  portal stack. Static prerender, one CSS file, token-driven utilities.
- [Fontsource](https://github.com/fontsource/fontsource): versioned,
  self-hosted open fonts; no CDN calls from a client portal.
- [Figma MCP](https://www.figma.com/): the design handover generates a
  real Figma library through Figma's own MCP server; we build the
  generation logic, Figma owns the file format.

- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
  + [zod](https://github.com/colinhacks/zod): the brand MCP server is
  built on the official SDK (spec-tracking stdio transport, typed tool
  schemas) instead of hand-rolled JSON-RPC; the protocol moves, the SDK
  moves with it.

## Recommended by the contract (verification and CI)

- [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp):
  the browser verification loop in harnesses without a built-in browser
  pane. Browser automation is a maintenance treadmill; Microsoft runs
  it so we do not have to.
- [axe-core](https://github.com/dequelabs/axe-core): the industry
  accessibility rules engine. Writing our own WCAG rule set would be
  both worse and irresponsible; validate's roadmap a11y pass drives axe
  through Playwright instead.
- [agnix](https://github.com/agent-sh/agnix): lints AGENTS.md, SKILL.md
  and agent configs against ~450 rules across Claude Code and Codex.
  Runs as a CI action; it spawns a native binary that sandboxed local
  runs may block, so it gates in CI rather than in validate.mjs.
- [Agent Skills spec](https://github.com/agentskills/agentskills): the
  open standard our bundled skills follow, so one skill folder loads in
  Claude Code, Codex, Cursor and the rest.
- [skills CLI](https://github.com/vercel-labs/skills): our skills use
  the standard layout, so any client team can pull them into their own
  agent with one command.
- [anthropics/skills](https://github.com/anthropics/skills): the
  official docx/pptx/pdf document skills for the Office deliverables.
  Their license allows use but not redistribution, so the template
  instructs agents to install them rather than bundling copies; OOXML
  generation is exactly the kind of format minefield not to rebuild.

## Ideas credited, implemented natively

- [Terrazzo](https://github.com/terrazzoapp/terrazzo) pioneered linting
  DTCG tokens for contrast before any browser exists. Our tokens use a
  light/dark context shape Terrazzo does not parse, so validate.mjs
  implements the same check natively (contrast pairs, AA 4.5:1, both
  modes); the idea is theirs.
- [Style Dictionary](https://github.com/style-dictionary/style-dictionary):
  the canonical token build system. Queued to replace the hand-rolled
  build-tokens once our token shape moves to standard DTCG modes; until
  then a 100-line generator we fully understand beats a dependency we
  fight.
- [Pagefind](https://github.com/Pagefind/pagefind) and
  [subfont](https://github.com/Munter/subfont): static search and font
  subsetting for the built output. Both queued: the portal's own Ctrl+F
  covers the single-document guide today, and Fontsource files arrive
  pre-subset. They come in when portals grow many detail pages and
  client-supplied font binaries.

## Design reference

- The Molslinjen guide in `docs/reference/molslinjen-brandguide/` is
  the structural reference for the document-scroll portal. Reference,
  never a template; its brand belongs to Molslinjen.

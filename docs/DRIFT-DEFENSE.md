# Drift defense: keeping a portal true for years

Synthesized from deep research (2026-08-28) across design-system
versioning, long-horizon software maintenance, brand governance
practice, the agent ecosystem, and live-site monitoring. This is the
architecture; EXISTS marks what the template already does, BUILD marks
the queue.

## The threat model: five drift axes

1. The portal drifts from brand truth (agents edit, nobody records).
2. The client's LIVE SITE drifts from the captured evidence (the
   fastest axis: weeks).
3. Brand repos drift from the template (fixes never reach the fleet).
4. The stack rots (Node EOL, dependency CVEs, browser changes).
5. The AI ecosystem moves (models retire, MCP/skills/DTCG specs bump,
   prompt adherence decays across model generations).

## The causal model (why drift happens)

Research consensus: drift is a SYSTEMS failure accumulating through
small good-faith decisions, via three named failure modes:
interpretation failure (prose resolves differently per reader),
enforcement failure (after-the-fact review gets skipped), learning
failure (rules frozen at publication while reality moves). And the
single strongest empirical predictor of multi-year consistency
(Van den Bosch et al., Journal of Marketing Communications): a
VISIBLE, ACCOUNTABLE OWNER. Tooling survives only as long as a human
is on the hook.

BrandOS already answers the first two by design: executable checks
instead of prose (the gate, the brand MCP) and enforcement at edit
time, not review time. The open front is learning failure and the
years where nobody is watching.

## Defense layers by timeline

### Continuous (every build and edit) — EXISTS

The 11-check gate, the brand MCP's executable checks, the append-only
changes.json journal, the browser verification loop, seed-leak and
gated-leak scans, ANCHOR LOCK with theme-integrity enforcement.

### Weekly — BUILD (P2)

- Scheduled still-green CI: a cron workflow that rebuilds and re-runs
  the gate even when nobody pushed, so the world moving fails loudly.
  (Note: schedulers auto-disable cron on inactive repos; the workflow
  must self-keepalive.)
- Golden visual baselines: after the browser loop passes at build
  time, freeze key pages in both themes as committed screenshots
  (Lost Pixel/Chromatic shape); the cron run re-renders and diffs;
  baseline updates require a changes.json entry.
- Renovate policy file: automerge patch/minor devDeps gated on the
  gate as a required check; weekly lockfile maintenance; majors manual.

### Monthly — BUILD (P3)

- Live-site sampling (the franchise-audit pattern): re-capture a small
  stratified sample of the client site (credits are cheap at this
  size), diff extracted tokens against tokens.json by stable hash IDs,
  append pass/flag to changes.json. Per-stratum cadence: homepage
  weekly, templates monthly, long tail quarterly.
- MCP contract replay: brand-mcp.contract.json (serialized tools/list
  - one golden invocation per tool) replayed; unapproved diffs fail.
- Model-pin calendar: every pinned model ID in runtime-manifest.json
  carries its published earliest-retirement date; warn at T-90.

### Quarterly — BUILD (P2)

- Doc-drift lint: parse AGENTS.md and every SKILL.md for commands,
  npm scripts and paths; each must resolve. Agents obey stale
  instructions confidently; dead references fail the gate.
- Executable docs: every token name and hex in chapter prose and the
  brand skill must resolve against tokens.json (the doctest idea).
- Frozen brand eval set (10-20 cases with mechanical assertions:
  "primary as a token reference", "headline in the brand voice");
  re-run on template updates and model migrations.

### Annual — BUILD (P3)

- /brandos-audit: full re-capture of the live site, scored on five
  dimensions (color, typography, logo, imagery, voice) against
  tokens.json; a dated consistency score appends to changes.json,
  the journal becomes the trend line.
- Edition discipline: the portal renders its edition + issue date; a
  gate check turns a last-verified capture older than 12 months into
  a visible staleness banner (same pattern as license expiry).
- Refresh-vs-rebrand routing: audit findings classify as
  refresh-scale (colors/type moved: token migrations, same portal)
  vs rebrand-scale (positioning/name/market moved: full /brandos
  re-intake, new baseline).

### Multi-year — BUILD (P1 mostly)

- Token lifecycle: DTCG `$deprecated` (stable spec 2025.10) with a
  replacement pointer; deprecated tokens warn, resolve through a
  compat alias layer for one full template major (the Carbon window:
  deprecate in one major, remove in the next), and /brandos-update
  migrations are executable rename maps replayed in order (the
  Polaris codemod rule: no breaking change without a transform).
- runtime-manifest.json: one gate-checked file pinning Node LTS line
  with its Maintenance/EOL dates, npm via packageManager/Corepack,
  MCP SDK + negotiated protocol version, DTCG spec version, and any
  model pins with retirement dates. Calendar checks mirror the
  license-expiry pattern: the repo knows its own death dates.
- Template SHA stamping (the cruft shape): record the template commit
  at generation; the cron job reports "behind by N commits,
  M migrations pending" as a failing check, making update need
  push-based, not memory-based.
- Distinctive-asset flags: `distinctive: true` on tokens/assets that
  carry the brand (Ehrenberg-Bass "use or lose"); no migration
  auto-applies to them, no agent edit passes without explicit human
  approval.
- Named owner: brand.config.ts carries the accountable brand owner;
  the gate warns when empty; every escalation (staleness, exceptions,
  expiry) addresses that person. The literature is unambiguous: this
  is the keystone.
- Capture archive: keep dated capture snapshots with simhash
  fingerprints (the Wayback pattern) so "when did it drift" is a
  cheap index lookup and "what drifted" a diff of two chosen points.

## Learning failure: closing the loop

Every gate override, MCP-check dispute and recorded exception in
changes.json is a signal that a rule and reality disagree. The annual
audit reviews them and either hardens the rule (new gate/MCP check) or
amends the guide (new edition), so the standards move with context
instead of freezing at handover.

## Implementation order

P1 (next build session): token `$deprecated` + compat aliases + gate
check; runtime-manifest.json with calendar checks; named owner field;
staleness banner wiring; template SHA stamp.
P2: cron still-green workflow + golden baselines + renovate.json;
doc-drift lint; executable-docs check; MCP contract replay.
P3: /brandos-audit with the five-dimension score; monthly stratified
site sampling; frozen eval set; distinctive flags; changedetection.io
handover recipe; migrations as executable transform maps.

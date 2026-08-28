# Reverse-engineering notes: how the other AI brand tools work

Distilled from deep research (2026-08-28) across five categories:
identity generators, brand platforms, algorithmic theme tools, LLM brand
tools and open-source extraction. What each encodes, and what BrandOS
takes. Full findings in the session research; this file is the working
steal list.

## The patterns the whole industry converges on

1. **Constrain, then generate.** Every serious tool restricts the
   model's job to filling a known schema (tweakcn's 20 shadcn slots,
   Looka's 6 layout frameworks, Huemint's slot graph) or selecting from
   a vetted pool (Brandmark's pre-generated palettes, Mojomox's curated
   faces). Free generation is where off-brand comes from.
2. **Taste is learned; correctness is a rule table.** Looka runs ~1,000
   hand-authored rules as a veto layer over ML output. The gate, not
   the generator, owns correctness.
3. **Anchors are immutable.** Colormind's decisive design: lock the
   evidenced swatches, infill only the missing ones. Brand truth is
   input, never regenerated.
4. **Enforcement beats review.** Marq/Canva/Papirfly make off-brand
   output UNREPRESENTABLE (locked templates, restricted pickers) rather
   than detected after. Structural constraints outrank checkers.
5. **Contrast by construction.** Material's HCT: tone delta >= 40
   guarantees 3:1, >= 50 guarantees 4.5:1, independent of hue. Radix:
   fixed 12-step ladders with APCA guarantees per step role. Encode
   contrast into the ladder, not into a post-hoc check.

## Steal list, prioritized

### Encoded in the contract now (AGENTS.md)

- ANCHOR LOCK (Colormind): evidenced token values are immutable inputs
  to theme generation; generation only infills unevidenced slots.
- RULE GRAMMAR (Bynder): usage rules written as must/must-not over
  visible properties with If-conditions and exact values; the gate
  lints for it.
- PAIRING RULE (Fontjoy): font pairs match on x-height/proportion/mood
  axes and contrast on class/weight axes; reconciliation scores
  candidates on explicit axes.

### Done at template level (2026-08-28, same day)

Items 1-4 below are implemented: scripts/generate-theme.mjs (tone
ladders with verbatim-pinned anchors + type ramp + matrix report),
brand/contrast-matrix.json read by generator AND gate (C10), the
gate's theme-integrity check (C11: anchors verbatim, ramp monotone),
and brandScore + confidence in the fetch-site brand stage
(color-evidence.json).

### Next builds (machinery, ordered by leverage)

1. **Tone-ladder color system** (Material HCT + Radix + tints.dev):
   store ref colors with measured perceptual tone; expand 1-3 evidence
   colors into full ladders by pinning each evidence hex at its
   MEASURED lightness stop (never forced to 500) and interpolating in
   OKLCH; sys roles pick tones per mode from the shared ladder (dark
   mode = the same ladder read from the other end); the gate asserts
   tone deltas (>= 50 body text, >= 40 large/UI) so contrast is correct
   by construction. Replaces ad-hoc palette synthesis and most pairwise
   contrast checking.
2. **Contrast matrix as a file** (Huemint): a declarative slot graph
   (page-bg, surface, text, primary, accent...) with pairwise minimum
   contrast targets in brand/, read by BOTH the generator and the gate;
   personality axes modulate the targets (bold raises accent-vs-bg,
   calm lowers it).
3. **brandScore for extraction** (designlang, MIT): rank captured
   colors by interactiveBg*100 + saturation*2 + log10(count), secondary
   requires color distance > 60 from primary, plus the confidence
   formula that tells the agent when to ASK instead of decide. Drops
   into color-evidence.mjs (SDU intake scripts, already queued).
4. **Type ramp as two numbers** (typescale + Baseline): fit
   {base, ratio} to captured font sizes, snap outliers to the fitted
   scale, density axis picks the ratio band (dense 1.125-1.2,
   editorial 1.333-1.5); gate asserts monotone 6-8 steps with
   line-height inversely tracking size.
5. **brand/terms.json** (Writer.com schema): {term, type:
   approved|banned|pending, caseSensitive, pos, mistakes[],
   examples[{text, good|bad}], autofix} feeding a deterministic lexical
   pass in the gate; the CVI's terminology section parses into it.
6. **Per-client agent skill emission** (Anthropic brand-guidelines
   skill): build-ai emits .claude/skills/brand/SKILL.md from
   tokens.json + profile + rules in threshold-imperative form, so the
   brand travels into any agent. (Already queued in UPSTREAM from LIFE
   ACT; this confirms the shape.)
7. **Compliance-percentage reporting** (Adobe GenStudio): the gate
   enumerates every named guideline, reports passed/tested as a
   percentage in three domains (brand scored, technical binary,
   accessibility binary), each failure with specific revision guidance.
8. **Delta-E drift net** (Khroma): flag any rendered color whose
   Delta-E to every canonical CVI color exceeds a threshold and that
   is not a derived ladder step; catches almost-brand-blue drift the
   exact-match seed-leak scan misses.
9. **Evidence with stable IDs** (Project Wallace): captured values get
   value-hash IDs + usage-count + which-CSS-properties extensions, so
   reconciliation cites counts ("site uses #0056B7 in 312 background
   declarations") and re-captures diff cleanly for brandos-update.
10. **Slot-constrained image extraction** (tweakcn): when reading a
    CVI's mood pages or imagery, always "fill these named sys slots,
    light and dark, from this image", never freeform palette prose.
11. **60-30-10 area check** (Realtime Colors): measure rendered area
    share of neutral vs primary vs accent on key pages; warn when
    accent exceeds ~15% or neutrals drop below ~50%. Operationalizes
    the anti-AI-look rule.
12. **Adjective vocabulary** (Hatchful): a fixed adjective chip list
    where each adjective carries a defined signature over the six
    personality axes, converting CVI voice words into axis evidence
    with explicit weights.
13. **"X, but not Y" axis phrasing** (Jasper): express each personality
    axis as a bounded pair ("confident, but not boastful") in authoring
    prompts; bounded pairs steer LLMs better than adjective lists.
14. **Legibility-under-degradation gate** (Brandmark): score the mark
    at small sizes/blur as a validate check next to contrast.

### Confirmations (we already do this; keep holding the line)

- Guide-as-token-viewer (Baseline), tokens-only styling as the
  strongest enforcement (Canva/Mistica/v0 provenance test), used-not-
  declared evidence (Superposition), locked template-owned vs editable
  brand-owned split (Marq/Canva = our brandos-update ownership map),
  AI-legible guideline authoring (Frontify: plain-text rules, task-
  named headings, inline definitions = our chapter output + llms.txt),
  do/don't as first-class indexed blocks (Frontify = GØR/UNDGÅ).

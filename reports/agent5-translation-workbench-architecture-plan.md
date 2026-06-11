# Agent 5 Translation Workbench Architecture Plan

Generated: 2026-05-31T12:13:59-04:00

## Executive Control Rule

The project is not trying to publish a conservative translation layer yet. It is building a dense workbench that can later produce translations without recollecting evidence.

Therefore the architecture rule is:

- Preserve every useful layer.
- Label every layer by role and confidence.
- Never collapse usage evidence, morphology, lexical candidates, source refs, or translation decisions into one untyped `definition` field.

## Research Inputs

External patterns checked:

- W3C Web Annotation Data Model: https://www.w3.org/TR/annotation-model/
- TEI stand-off markup guidelines: https://www.tei-c.org/release/doc/tei-p5-doc/en/html/SA.html
- TMX 1.4b specification: https://www.ttt.org/oscarStandards/tmx/tmx14b.html
- CTS URN specification: https://cite-architecture.github.io/ctsurn_spec/
- UD Ancient Hebrew: https://universaldependencies.org/hbo/index.html
- BHSA/Text-Fabric feature model: https://etcbc.github.io/bhsa/features/otype/
- Logos Bible Word Study guide: https://support.logos.com/hc/en-us/articles/360016688811-Studying-Words-Using-the-Bible-Word-Study-Guide

Relevant lessons:

- W3C Web Annotation uses selectors such as text quote and text position to attach external annotations to exact text spans. This supports our source-anchor sidecars.
- TEI stand-off markup supports keeping annotations outside the base text while pointing into it. This supports avoiding generated-page mutation as the authoritative data layer.
- TMX treats translation memory as aligned translation units and notes segmentation rules as a separate concern. This supports storing decision rows separately from segmentation/tokenization policy.
- CTS separates work/version/passage identity and supports substring references only at version/exemplar level. This supports keeping `source_ref`, `unit_id`, and occurrence anchors together.
- UD Ancient Hebrew separates morphological/syntactic parts from surface writing. This supports preserving whole surface tokens while displaying prefixes/suffixes as analysis.
- BHSA treats word occurrences as slots with multiple representations rather than one canonical string. This supports `surface_occurrence_id`, `surface_text`, `normalized`, and source quote selectors as distinct fields.
- Logos word study is faceted: lemma, translation, root, senses, examples, clause participants, and textual searches are separate sections. This supports the dense HUD as long as every lane is typed.

## Local Control Finding

The first translation-memory scaffold had stable-looking IDs, but the Orot input reused `token_index_id` for repeated surface tokens inside the same unit.

Risk:

- `surface_token_id` is not a unique occurrence identifier.
- `decision_id` was previously derived from the reusable token ID, so repeated words could produce duplicate decision rows.
- Future translation mode would be unable to distinguish the first `אֶרֶץ` from the second `אֶרֶץ` without re-reading source order.

Correction made:

- Added `surface_occurrence_id` as the unique row-level occurrence ID.
- Changed `decision_id` generation to include token position.
- Added `source_anchor` to every translation decision row.
- Added `TextQuoteSelector` exact/prefix/suffix anchors.
- Added `TextPositionSelector` anchors when recoverable.
- Added a unit text SHA-1 hash so future tools can detect stale anchors.
- Updated `scripts/validate_translation_memory.mjs` to reject duplicate `decision_id` and duplicate `surface_occurrence_id`.

Current sample state:

- 40 translation-memory rows.
- 0 duplicate `decision_id` values.
- 0 duplicate `surface_occurrence_id` values.
- 4 duplicate `surface_token_id` values remain, now understood as reusable lexical/surface IDs rather than occurrence IDs.
- 40 rows have `source_anchor`.
- 40 rows have `TextQuoteSelector`.
- 40 rows have `TextPositionSelector`.

## Target Data Stack

Layer 1: Base text identity

- `work_id`
- `source_ref`
- `unit_id`
- `anchor_id`
- unit text hash
- source/license row

Layer 2: Surface occurrence

- `surface_occurrence_id`
- `surface_token_id`
- `surface_text`
- `normalized`
- token position
- source quote selector
- source position selector

Layer 3: Analysis

- prefix/suffix segmentation
- maqaf/compound handling
- lemma/form cards
- morphology IDs
- route card IDs

Layer 4: Evidence

- definition candidates
- usage evidence rows
- phrase/commentary evidence
- source/license rows
- ranking/audit metadata

Layer 5: Translation decision

- `decision_status`
- candidate renderings
- accepted rendering only when reviewed
- ambiguity notes
- rejection/block reasons
- `not_a_translation_yet`

## Agent Coordination

Agent 2 route/data lane:

- Keep producing answer-eligible route cards, but attach cards to source occurrences through stable occurrence IDs where possible.
- Do not make reusable lexical IDs pretend to be occurrence IDs.
- Preserve card IDs and source rows because translation memory will link to them later.

Agent 3 workbench evidence lane:

- Continue usage evidence as usage, not definitions.
- Emit source refs and phrase/target anchors that can link into `source_anchor` or a compatible sidecar.
- Do not ask Agent 4 to display ambiguous usage rows as the Definition lane.

Agent 4 HUD/render lane:

- Preserve whole source surface tokens in click targets.
- Show segmentation and under-word glosses as analysis overlays, not as separate source-token identity.
- Treat `surface_occurrence_id` plus `source_anchor` as the future translation-mode bridge.

Agent 5 control lane:

- Maintain the contract and validators.
- Block any release claim where route data, usage evidence, and rendered HUD do not agree on source occurrence identity.
- Prefer additive sidecars over mutating generated HTML as the source of truth.

## Four-Hour Control Plan

Pass 1: anchor integrity

- Done: added source anchors to translation-memory rows.
- Done: fixed duplicate decision IDs caused by reusable token IDs.
- Done: validator now catches duplicate decision/occurrence IDs.

Pass 2: HUD token integrity

- Use `reports/agent5-route-hud-word-sample-audit.md` as the current failing canary.
- Agent 4 should add a split-token guard before claiming word-click integrity.

Pass 3: workbench freshness

- Keep `data/workbench-evidence/public-handoff-index.json` as current authority.
- Do not let stale `data/workbench-evidence/handoff-index.json` be used for release claims.

Pass 4: translation-mode readiness

- Expand `data/translation-memory/` only from already licensed workbench evidence.
- Do not generate public English translation rows yet.
- Require every future accepted translation row to have source anchor, source/license rows, and accepted decision provenance.

## Release Gate

No future translation-readiness claim should pass unless all are true:

- Translation-memory rows validate.
- Decision IDs are unique.
- Occurrence IDs are unique.
- Every row has a quote selector.
- Every accepted row has `license_safe=true`.
- Every accepted row has non-empty `english_rendering`.
- Every non-accepted row has `not_a_translation_yet=true`.
- HUD click targets preserve source surface tokens.
- Agent 3 evidence appears only in typed usage/evidence lanes unless separately accepted as a translation decision.

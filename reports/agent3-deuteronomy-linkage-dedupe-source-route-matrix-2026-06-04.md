# Agent 3 Deuteronomy Linkage/Dedupe/Source-Route Matrix - 2026-06-04

Status: evidence-ready_with_exact_blockers.

Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE / two-primary Spark model.

Owner: Agent 3. Runnable by Spark-1 `019e92c1-89b1-7821-898b-2106638345cb` after contract intake.

Boundary: no route publication support, no definition/answer selection, no usage-as-definition authority, no QA/source/provenance/license/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, and no public/runtime mutation.

## Inputs

- `reports/agent10-deuteronomy-pipeline-intake-state-2026-06-04.md`
- `data/lexical/deuteronomy.manifest.json`
- `data/lexical/occurrences/deuteronomy.json`
- `data/lexical/token-indexes/tanakh/deuteronomy.json`
- `data/public-lexical/by-work/deuteronomy-token-claims-min60.csv`
- `data/sources/deuteronomy.json`
- `data/overlays/deuteronomy.json`

## Counts

- Rows: 8113.
- Occurrences: 12595.
- Token-index forms: 8113.
- Token-index occurrences: 12595.
- Occurrence units: 956.
- Source units: 956.
- Manifest chunks: 9.
- Joined token-index rows: 8113.
- Safe-claim rows: 1334 / occurrences 2964.
- Below-threshold rows: 1594 / occurrences 2922.
- Unresolved rows: 5185 / occurrences 6709.
- Downstream-boundary rows: 1334 / occurrences 2964.
- Exact blocker rows: 6779 / occurrences 9631.
- Duplicate-key collision groups: 0.

## Duplicate Key Rule

work_id|token_index_id|normalized_form|export_status

## Route Buckets

- confidence_below_safe_min60_blocker: 1594 rows / 2922 occurrences.
- missing_lexical_entry_blocker: 5185 rows / 6709 occurrences.
- agent2_agent6_boundary_candidate: 1334 rows / 2964 occurrences.

## Gates

- row_count: passed; rows 8113/8113.
- occurrence_count: passed; occurrences 12595/12595.
- token_index_join_complete: passed; joined 8113/8113.
- duplicate_keys_unique: passed; duplicate-key collision groups 0.
- safe_claim_rows: passed; safe rows 1334/1334.
- below_threshold_rows: passed; below-threshold rows 1594/1594.
- unresolved_rows: passed; unresolved rows 5185/5185.
- authority_zero_gate: passed; public/runtime/source/token/lexical/answer/accepted-text mutation counters are zero.

## Stop Condition

Return Deuteronomy phase-2 linkage/dedupe/source-route matrix with row counts, duplicate-key rules, blocker rows, runnable command/input/output schema, validator gate, package owner, and downstream boundaries. No publication, answer selection, Definition authority, or acceptance claim.

## Remaining Blocked

- 6779 rows / 9631 occurrences are exact blockers: below safe confidence or unresolved lexical entry.
- 1334 rows / 2964 occurrences are downstream-boundary candidates only; Agent 2 and Agent 6 must clear any later transform/display/source/license/Definition use.
- No route publication support is available from this matrix.


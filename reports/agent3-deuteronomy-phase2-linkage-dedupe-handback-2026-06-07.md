# Agent 3 Deuteronomy Phase-2 Linkage/Dedupe Handback — 2026-06-07

Status: evidence_ready_with_exact_blockers
Goal mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE / two-primary Spark model
Publication boundary: blocked_no_render

## Target

- work_id: `deuteronomy`
- work_title: `Deuteronomy`
- workset: `deuteronomy-linkage-dedupe-source-route-matrix`
- rows checked: 8113
- occurrences checked: 12595

## Inputs

- `reports/agent10-deuteronomy-pipeline-intake-state-2026-06-04.md`
- `data/lexical/deuteronomy.manifest.json`
- `data/lexical/occurrences/deuteronomy.json`
- `data/lexical/token-indexes/tanakh/deuteronomy.json`
- `data/public-lexical/by-work/deuteronomy-token-claims-min60.csv`
- `data/sources/deuteronomy.json`
- `data/overlays/deuteronomy.json`

## Commands (runnable contract)

- `node scripts/build_agent3_deuteronomy_phase2_linkage_dedupe_source_route_matrix.mjs`
- `node scripts/validate_agent3_deuteronomy_phase2_linkage_dedupe_source_route_matrix.mjs`

## Output artifact

- JSON: `reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json`
- Markdown: `reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.md`
- Contract: `reports/agent3-spark1-pipeline-contract-deuteronomy-phase2-linkage-dedupe-source-route-2026-06-04.md`
- Contract JSON: `reports/agent3-spark1-pipeline-contract-deuteronomy-phase2-linkage-dedupe-source-route-2026-06-04.json`

## Route buckets

- `agent2_agent6_boundary_candidate`: 1334 rows / 2964 occurrences
- `confidence_below_safe_min60_blocker`: 1594 rows / 2922 occurrences
- `missing_lexical_entry_blocker`: 5185 rows / 6709 occurrences

## Matched / unmatched summary

- matched_for_boundary_candidate (mechanical): 1334 / 8113 rows
- unmatched_blockers: 6779 / 8113 rows
- exact blocker occurrences: 9631
- downstream-boundary occurrences: 2964

## Exact blockers

- 1594 rows + 5185 rows remain unresolved for route-link readiness.
- 5185 + unresolved lexical-entry rows represent exact-blockage conditions for safe downstream transform.
- No duplicate-key collision groups (0).

## Validator / gate

- Last run by Agent 3 at `2026-06-07T05:48:43.631Z`.
- Gates passed: row_count, occurrence_count, token_index_join_complete, duplicate_keys_unique, safe_claim_rows, below_threshold_rows, unresolved_rows, authority_zero_gate.
- Validation command passed with same blocker totals after rebuild.

## Handoff owner

- Agent 2: consume only `1334 / 2964` boundary-candidate rows after this matrix is accepted mechanically.
- Agent 6: required for any source/provenance/license/Definition/public-runtime/answer acceptance.
- Agent 10: consume exact blocker counts for release planning and boundary matrix continuity.

## What must NOT be accepted from this packet

- no definition answer authority
- no route publication support
- no source/license/provenance acceptance
- no runtime/publication/runtime acceptance
- no accepted-text usage claims

## Stop condition

- Continue only if `reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json` changes, or if a new exact queue command set is introduced that requires re-run.

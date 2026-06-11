# Agent 1 Old Dictionary Row-Overlap Lane Boundary - 2026-06-05

production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner

Hebrew import/source/license/custody/source-lane evidence | row-level overlap boundary for old-dictionary excluded-row license-lane reaudit | `reports/agent1-old-dictionary-row-overlap-lane-boundary-2026-06-05.json`; validator `scripts/validate_agent1_old_dictionary_row_overlap_lane_boundary.mjs` -> `reports/agent1-old-dictionary-row-overlap-lane-boundary-validation-result-2026-06-05.json` | source-family hit counts are not exclusive export rows; multi-lane overlaps require Agent 6 row/subset boundary | Stop before QA/source-license/legal/Definition/runtime/publication/product/answer acceptance; stop before candidate text, public display, runtime, queue, staging, or release mutation. | current Agent 1 `019e975d-dc9f-7020-a7c8-885d083a837e`; old Agent 1 archived/do-not-use

target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition

`old-dictionary-excluded-row-license-lane-reaudit` | `reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json`; `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`; `reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.json`; `reports/agent1-old-dictionary-klein-nc-lane-preservation-2026-06-05.json`; `reports/agent1-bdb-augmented-strong-row-linkage-probe-2026-06-05.json` | audited 500 / 8427; public-domain evidence 297 / 5747; public-domain-only 18 / 494; Klein evidence 214 / 4444; Klein-only 17 / 259; BDB Augmented Strong evidence 222 / 4435; multi-lane overlap 279 / 5253; metadata/link-only 0 / 0; no source hit 186 / 2421 | `commercial_clean_candidate`; `noncommercial_educational_candidate`; `metadata_or_link_only`; `blocked_or_needs_review` | source_family_hit_counts_are_not_exclusive_row_export_counts; multi_lane_overlap_requires_agent6_row_subset_boundary; noncommercial_educational_only_rows_remain_separate_from_commercial_clean; no_sefaria_source_hit_rows_have_no_source_lane_evidence_now | Agent 2 only after lane evidence plus Agent 6 boundary; Agent 6 for exact row/subset boundary; Agent 10 for boundary/package assembly only | Stop before QA/source-license/legal/Definition/runtime/publication/product/answer acceptance; stop before candidate text, public display, runtime, queue, staging, or release mutation.

## Row Overlap Buckets

| bucket | rows | occurrences |
| --- | ---: | ---: |
| commercial_clean_only | 18 | 494 |
| commercial_clean_plus_noncommercial_educational | 57 | 818 |
| commercial_clean_plus_blocked_review | 82 | 1068 |
| commercial_clean_plus_noncommercial_educational_plus_blocked_review | 140 | 3367 |
| noncommercial_educational_only | 17 | 259 |
| blocked_review_only | 0 | 0 |
| metadata_or_link_only | 0 | 0 |
| no_sefaria_source_hit | 186 | 2421 |

## Boundary

- `commercial_clean_candidate` source-family hit rows are not exclusive row/export counts.
- `noncommercial_educational_candidate` remains separate and not commercially authorized.
- `metadata_or_link_only` is zero for this preview; no-source-hit rows are recorded separately.
- `blocked_or_needs_review` remains exact-custody-linkage blocked for BDB Augmented Strong.
- Zero output: no candidate text, accepted gloss, answer, source-row emission, public HUD row, route JSONL row, Agent 6 delivery, queue mutation, render mutation, staging, or release action.

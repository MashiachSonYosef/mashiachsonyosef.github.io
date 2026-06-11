# Agent 4 Cross-Batch Queue Guard Gate Proof

## Target

`reports/agent3-old-dictionary-candidate-use-cross-batch-queue-guard-2026-06-06.json`

## Commands

| Command | Timeout | Result |
| --- | ---: | --- |
| `node --check scripts\validate_agent3_old_dictionary_candidate_use_cross_batch_queue_guard.mjs` | 30000 ms | passed |
| `node scripts\validate_agent3_old_dictionary_candidate_use_cross_batch_queue_guard.mjs --input=reports\agent3-old-dictionary-candidate-use-cross-batch-queue-guard-2026-06-06.json` | 30000 ms | passed |
| `node scripts\validate_agent4_changed_input_candidate_selection.mjs --input=reports\agent4-changed-input-selection-after-selector-lookback-patch-no-lookback-2026-06-06.json` | 30000 ms | passed |
| `node scripts\validate_agent4_changed_input_candidate_selection.mjs --input=reports\agent4-changed-input-selection-lookback-after-queue-batch-crossmatch-sweep-2026-06-06.json` | 30000 ms | passed |

## Counts

| Metric | Count |
| --- | ---: |
| Input queue rows | 65 |
| Input queue source links | 363 |
| Guard rows | 25 |
| Queue source links | 163 |
| Batch queue links | 54 |
| Unique source RIDs | 121 |
| Unique queue IDs | 25 |
| Unique token IDs | 27 |
| Unique batch IDs | 14 |
| Three-batch queue rows | 4 |
| Two-batch queue rows | 21 |
| Reference total | 266 |
| Occurrence total | 8811 |
| Source citation required links | 163 |
| Source citation or URL present links | 0 |
| Transform still blocked links | 163 |
| Agent 6 boundary after prereq links | 163 |
| Source-family boundary packet exists links | 0 |
| Source-family selection boundary blocker links | 163 |
| Route-write allowed links | 0 |
| Candidate-text allowed links | 0 |
| Public mutation allowed links | 0 |

## Result

The Agent 3 cross-batch queue guard artifact is validator-clean as navigation-only evidence. It does not select source families, supply source citations, authorize transform, write route data, mutate public runtime, or make acceptance claims.

## Harness Note

The selector now supports optional lookback scanning and suppresses upstream inputs already consumed by Agent 4 proof packets. Both normal and lookback selector outputs selected this cross-batch guard candidate, while already-packaged Agent 3 artifacts were not reselected.

## Blockers

`source_family_selection_boundary_not_yet_packetized_for_agent6_prereq`: 163 source RID links remain blocked pending source-family selection boundary packetization.

`source_citation_missing_for_all_guard_links`: 163 links require source citation, and 0 links include source citation or URL.

## Boundary

No QA acceptance. No source, provenance, license, legal, Definition, answer, product, publication, public/runtime, route publication, release acceptance, accepted gloss, accepted text, public reader output, public runtime mutation, or release action.

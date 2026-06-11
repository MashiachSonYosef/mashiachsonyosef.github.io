# Agent 4 Single-Batch Queue Workset Gate Proof

## Target

`reports/agent3-old-dictionary-candidate-use-single-batch-queue-workset-2026-06-06.json`

## Commands

| Command | Timeout | Result |
| --- | ---: | --- |
| `node scripts\validate_agent4_changed_input_candidate_selection.mjs --input=reports\agent4-changed-input-selection-after-selector-lookback-validator-hardening-sweep-2026-06-06.json` | 30000 ms | passed |
| `node --check scripts\validate_agent3_old_dictionary_candidate_use_single_batch_queue_workset.mjs` | 30000 ms | passed |
| `node scripts\validate_agent3_old_dictionary_candidate_use_single_batch_queue_workset.mjs --input=reports\agent3-old-dictionary-candidate-use-single-batch-queue-workset-2026-06-06.json` | 30000 ms | passed |

## Counts

| Metric | Count |
| --- | ---: |
| Input queue rows | 65 |
| Input queue source links | 363 |
| Workset rows | 40 |
| Queue source links | 200 |
| Batch queue links | 40 |
| Unique source RIDs | 200 |
| Unique queue IDs | 40 |
| Unique token IDs | 44 |
| Unique batch IDs | 11 |
| Multi-source queue rows | 36 |
| Single-source queue rows | 4 |
| Cross-batch queue rows | 0 |
| Reference total | 209 |
| Occurrence total | 3300 |
| Source citation required links | 200 |
| Source citation or URL present links | 0 |
| Transform still blocked links | 200 |
| Agent 6 boundary after prereq links | 200 |
| Source-family boundary packet exists links | 0 |
| Source-family selection boundary blocker links | 200 |
| Route-write allowed links | 0 |
| Candidate-text allowed links | 0 |
| Public mutation allowed links | 0 |

## Result

The Agent 3 single-batch queue workset is validator-clean as navigation-only evidence. It does not select source families, supply source citations, authorize transform, write route data, mutate public runtime, or make acceptance claims.

## Blockers

`single_batch_queue_still_missing_source_citation_transform_and_boundary_packet`: 200 source RID links remain blocked pending source citation and source-family boundary packetization.

`source_citation_missing_for_all_single_batch_links`: 200 links require source citation, and 0 links include source citation or URL.

## Boundary

No QA acceptance. No source, provenance, license, legal, Definition, answer, product, publication, public/runtime, route publication, release acceptance, accepted gloss, accepted text, public reader output, public runtime mutation, or release action.

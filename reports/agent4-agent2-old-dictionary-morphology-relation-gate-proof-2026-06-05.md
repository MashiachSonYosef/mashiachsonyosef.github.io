# Agent 4 Agent 2 Old-Dictionary Morphology Relation Gate Proof - 2026-06-05

Status: `validators_passed_nonpublic_morphology_planning_only`.

Boundary: validator/prereq evidence only. No QA acceptance, source/provenance acceptance, license/legal acceptance, Definition authority, answer acceptance, public/runtime acceptance, publication readiness, product/data acceptance, candidate text export, accepted gloss/text, or release action.

## target

`agent2-old-dictionary-commercial-clean-morphology-relation`

## files

| Path | SHA-256 | Role |
| --- | --- | --- |
| `reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json` | `6cf36d152dd172f2582d83ff4764ea4db8275f70ae5df1c2a4a5355823630514` | Agent 2 morphology relation matrix. |
| `reports/agent10-agent2-ready-old-dictionary-commercial-clean-morphology-relation-workset-2026-06-05.json` | `4fe7932dadcd481ae993592dd9f55350b85a4e225af6703d9d9860bbec48e0c8` | Agent 10 ready workset for Agent 2. |
| `reports/agent2-commercial-clean-boundary-held-packet-consumption-receipt-2026-06-05.json` | `eef17139e77d8a3821b97cb3eedfe5cb09b00bd536609820344a2050c1e4b370` | Boundary-held consumption receipt. |

## commands

| Command | Result |
| --- | --- |
| `node scripts\validate_agent2_old_dictionary_commercial_clean_morphology_relation_matrix.mjs reports\agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json` | pass: rows 297; planning-approved 78; transform rows 0. |
| `node scripts\validate_agent10_agent2_old_dictionary_morphology_relation_workset.mjs reports\agent10-agent2-ready-old-dictionary-commercial-clean-morphology-relation-workset-2026-06-05.json` | pass: rows 297; occurrences 5747. |
| `node scripts\validate_agent2_commercial_clean_boundary_held_packet_consumption_receipt.mjs reports\agent2-commercial-clean-boundary-held-packet-consumption-receipt-2026-06-05.json` | pass: transform rows 0; commercial-clean subsets held 3; NC separated. |

## counts

| Metric | Count |
| --- | ---: |
| Unique preview rows / occurrences | 297 / 5747 |
| Commercial-clean source families | 3 |
| Commercial-clean source-family hit rows / occurrences | 500 / 10940 |
| Morphology-planning approved rows | 78 |
| Morphology-blocked rows | 219 |
| Prefix/clitic possible rows / occurrences | 129 / 3035 |
| Exact-after-mark-strip rows / occurrences | 78 / 1461 |
| Needs-disambiguation rows / occurrences | 90 / 1251 |
| Allowed transform rows now | 0 |
| Candidate text rows now | 0 |
| Definition/lemma/reader-hint candidate rows now | 0 |
| Answer-eligible rows now | 0 |
| Public emit rows now | 0 |
| Route JSONL / route shard writes | 0 |
| Runtime/source/token-index/lexical payload changes | 0 |
| Accepted text / release rows | 0 |

## result

`target | agent2-old-dictionary-commercial-clean-morphology-relation | files in packet | commands passed: Agent2 morphology relation matrix validator, Agent10 morphology relation workset validator, Agent2 commercial-clean boundary-held receipt validator | counts: 297 unique preview rows, 5747 occurrences, 3 commercial-clean source families, 500 source-family hit rows, 10940 source-family hit occurrences, 78 morphology-planning approved rows, 219 morphology-blocked rows, 0 transform/candidate/definition/lemma/reader-hint/answer/public/route/runtime/accepted-text/release rows | result: validators passed as nonpublic morphology planning evidence only | blocker if any: future candidate-use package and Agent6 row/subset boundary still required before transform/display/export/answer/Definition/public/runtime/release use | next handoff: Agent2/Agent10 may consume as planning matrix only | stop condition: do not rerun unless morphology matrix, workset, boundary-held receipt, or validators change`

## blockers

| Blocker |
| --- |
| `missing_exact_row_subset_candidate_use_package` |
| `missing_exact_agent6_row_subset_boundary_for_any_candidate_text_package_or_display_behavior` |
| Approved morphology planning rows are nonpublic planning evidence only and do not authorize transform rows now. |

## stop condition

Stop at validator/prereq evidence. Do not rerun unless the morphology matrix, workset, boundary-held receipt, or validators change.

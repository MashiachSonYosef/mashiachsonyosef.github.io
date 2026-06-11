# Agent 4 Agent 2 Token-Source Aggregate Consumption Receipt Gate Proof - 2026-06-05

Status: `validator_passed_nonpublic_metadata_only`.

Boundary: validator/prereq evidence only. No QA acceptance, source/provenance acceptance, license/legal acceptance, Definition authority, answer acceptance, public/runtime acceptance, publication readiness, product/data acceptance, candidate-use authorization, candidate text export, route write, accepted gloss/text, or release action.

## target

`agent2-token-source-aggregate-consumption-receipt`

## files

| Path | SHA-256 | Role |
| --- | --- | --- |
| `reports/agent2-token-source-aggregate-consumption-receipt-2026-06-05.json` | `38a3c2cd685b3693a3bc00faa52f042f4cb33f193392e26a4095170e2c1b78c6` | Agent 2 receipt consuming the token-source aggregate. |
| `scripts/validate_agent2_token_source_aggregate_consumption_receipt.mjs` | `d8874697aacab42b110adb7d6234098389d8aeb5f7dbcefef52b1a0b03cd98c7` | Existing exact validator for this packet shape. |

## commands

| Command | Result |
| --- | --- |
| `node scripts\validate_agent2_token_source_aggregate_consumption_receipt.mjs reports\agent2-token-source-aggregate-consumption-receipt-2026-06-05.json` | pass: aggregate rows 1951013; candidate rows 0. |

## counts

| Metric | Count |
| --- | ---: |
| Source files selected / read | 1337 / 1337 |
| Units read | 717459 |
| Units with partition | 637508 |
| Unjoined units | 79951 |
| Token occurrences scanned | 66320359 |
| Matched token occurrences | 49791095 |
| Chunks merged | 54 |
| Aggregate edge rows | 1951013 |
| Aggregate shards | 256 |
| Candidate/definition/lemma/reader-hint rows | 0 |
| Answer/public rows | 0 |
| Route/runtime rows | 0 |
| Accepted text / release rows | 0 |

## result

`target | agent2-token-source-aggregate-consumption-receipt | files in packet | commands passed: Agent2 token-source aggregate consumption receipt validator | counts: 1337 source files read, 717459 units read, 637508 units with partition, 66320359 token occurrences scanned, 49791095 matched occurrences, 54 chunks merged, 1951013 aggregate edge rows, 256 aggregate shards, 0 candidate/definition/lemma/reader-hint/answer/public/route/runtime/accepted-text/release rows | result: validator passed and aggregate remains nonpublic metadata evidence only | blocker if any: no candidate rows or candidate-use packet from aggregate metadata alone | next handoff: Agent2 may derive a bounded candidate-use workset only if a source-lane-preserving transform target exists; Agent10/Agent6 require a separate exact candidate-use packet before downstream use | stop condition: do not rerun unless aggregate receipt, aggregate summary/report, Agent4 aggregate gate proof, Agent10 consumption, or validator changes`

## blockers

| Blocker |
| --- |
| `no_candidate_rows_or_candidate_use_packet_from_aggregate` |
| `aggregate_is_nonpublic_token_source_partition_metadata_only` |
| `separate_exact_boundary_required_for_any_candidate_use_answer_public_runtime_or_release_use` |

## stop condition

Stop at validator/prereq evidence. Do not rerun unless the aggregate receipt, aggregate summary/report, Agent4 aggregate gate proof, Agent10 consumption, or validator changes.

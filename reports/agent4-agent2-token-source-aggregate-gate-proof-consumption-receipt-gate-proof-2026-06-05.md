# Agent 4 Agent 2 Token-Source Aggregate Gate-Proof Consumption Receipt Gate Proof - 2026-06-05

Status: `validator_passed_agent4_gate_proof_consumed_nonpublic_metadata_only`.

Boundary: validator/prereq evidence only. No QA acceptance, source/provenance acceptance, license/legal acceptance, Definition authority, answer acceptance, public/runtime acceptance, publication readiness, product/data acceptance, candidate-use authorization, candidate text export, route write, accepted gloss/text, or release action.

## target

`agent2-token-source-aggregate-gate-proof-consumption-receipt`

## files

| Path | SHA-256 | Role |
| --- | --- | --- |
| `reports/agent2-token-source-aggregate-gate-proof-consumption-receipt-2026-06-05.json` | `fafe71cae07231a93b3a68b94324e45dd2bffd6873e60d94a114c442dc26fc08` | Agent 2 receipt consuming the Agent4 aggregate gate proof. |
| `scripts/validate_agent2_token_source_aggregate_gate_proof_consumption_receipt.mjs` | `b553379334304337cf92d8d1fece946e5ca049130e12a1523f18aefc83045166` | Existing exact validator for this packet shape. |

## commands

| Command | Result |
| --- | --- |
| `node scripts\validate_agent2_token_source_aggregate_gate_proof_consumption_receipt.mjs reports\agent2-token-source-aggregate-gate-proof-consumption-receipt-2026-06-05.json` | pass: aggregate rows 1951013; candidate rows 0. |

## counts

| Metric | Count |
| --- | ---: |
| Source files read | 1337 |
| Units read | 717459 |
| Units with partition | 637508 |
| Token occurrences scanned | 66320359 |
| Matched token occurrences | 49791095 |
| Chunks merged | 54 |
| Aggregate edge rows | 1951013 |
| Aggregate shards | 256 |
| Consumed Agent4 gate-proof commands | 1 |
| Candidate/definition/lemma/reader-hint rows | 0 |
| Answer/public rows | 0 |
| Route/runtime rows | 0 |
| Accepted text / release rows | 0 |

## result

`target | agent2-token-source-aggregate-gate-proof-consumption-receipt | files in packet | commands passed: Agent2 token-source aggregate gate-proof consumption receipt validator | counts: 1337 source files read, 717459 units read, 637508 units with partition, 66320359 token occurrences scanned, 49791095 matched occurrences, 54 chunks merged, 1951013 aggregate edge rows, 256 aggregate shards, 1 consumed Agent4 gate-proof command, 0 candidate/definition/lemma/reader-hint/answer/public/route/runtime/accepted-text/release rows | result: validator passed and Agent4 gate proof was consumed as nonpublic metadata/prereq evidence only | blocker if any: no candidate rows or candidate-use packet from aggregate metadata or this gate proof | next handoff: Agent2 retains metadata-only aggregate evidence; Agent10/Agent6 require a separate exact candidate-use packet before downstream use | stop condition: do not rerun unless gate-proof consumption receipt, aggregate receipt, Agent4 aggregate gate proof, or validator changes`

## blockers

| Blocker |
| --- |
| `no_candidate_rows_or_candidate_use_packet_from_aggregate` |
| `aggregate_is_nonpublic_token_source_partition_metadata_only` |
| `separate_exact_boundary_required_for_any_candidate_use_answer_public_runtime_or_release_use` |

## stop condition

Stop at validator/prereq evidence. Do not rerun unless the gate-proof consumption receipt, aggregate receipt, Agent4 aggregate gate proof, or validator changes.

# Agent 4 Gate Proof: Agent 10 Old-Dictionary Morphology Candidate-Use Boundary Packet

Generated: 2026-06-05T23:55:00Z

## result

`target | agent10-old-dictionary-morphology-candidate-use-boundary-packet | files below | commands passed: Agent10 old-dictionary morphology candidate-use boundary packet validator | counts: 78 rows, 1461 occurrences, 3 source families, 219 excluded morphology-blocked rows, 129 excluded prefix/clitic possible rows, 90 excluded morphology-disambiguation rows, zero public/runtime/route/definition/lemma/reader-hint/answer/accepted-text/release rows | result: validator passed and packet is Agent6-ready evidence only | blocker if any: await Agent6 candidate-use boundary for the exact 78 old-dictionary morphology-planning rows | next handoff: Agent 7/8/10 may route to Agent 6; Agent 4 does not self-accept | stop condition: do not rerun unless the packet, source preflight handoff, or validator changes`

## files

| Path | Role | SHA-256 |
| --- | --- | --- |
| `reports/agent10-agent6-ready-old-dictionary-morphology-candidate-use-boundary-packet-2026-06-05.json` | Changed package/input | `904b8d2b33de3e8dec06cde315bd2a15a2460b9ca6d0086c4966f36e22083ad2` |
| `reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json` | Source preflight handoff | `16524a123e1b322324f2e4c29a3dc00357b931374af38292a11eac4779816103` |
| `scripts/validate_agent10_old_dictionary_morphology_candidate_use_boundary_packet.mjs` | Validator | `56df33b0a9a414f8ea411923d850bd2164e93e7950884b2b338104ba29ba05dd` |

## command

| Command | Result |
| --- | --- |
| `node scripts\validate_agent10_old_dictionary_morphology_candidate_use_boundary_packet.mjs reports\agent10-agent6-ready-old-dictionary-morphology-candidate-use-boundary-packet-2026-06-05.json` | Passed. Rows: 78; occurrences: 1461. |

## counts

| Metric | Count |
| --- | ---: |
| Candidate-use boundary rows | 78 |
| Candidate-use boundary occurrences | 1,461 |
| Source families | 3 |
| BDB Aramaic Dictionary planning rows / occurrences | 21 / 616 |
| BDB Dictionary planning rows / occurrences | 63 / 1,271 |
| Jastrow Dictionary planning rows / occurrences | 75 / 1,417 |
| Excluded morphology-blocked rows | 219 |
| Excluded prefix/clitic possible rows | 129 |
| Excluded needs morphology disambiguation rows | 90 |
| Public HUD rows | 0 |
| Public reader output rows | 0 |
| Route JSONL rows / shard writes | 0 / 0 |
| Runtime files changed | 0 |
| Definition / lemma / reader-hint candidate rows now | 0 / 0 / 0 |
| Candidate text export rows | 0 |
| Answer / answer-eligible rows | 0 / 0 |
| Accepted text rows | 0 |
| Release actions | 0 |

## blocker

`await_agent6_candidate_use_boundary_for_78_old_dictionary_morphology_planning_rows`

This is evidence only. Agent 4 does not accept candidate use, source/license/legal status, Definition authority, answer authority, public/runtime behavior, publication readiness, route publication support, product/data status, translation output, accepted gloss/text, commercial export, or release action.

## next handoff

Agent 7/8/10 may route this Agent 10 packet plus this Agent 4 validator proof to Agent 6 if live Agent 6 delivery is needed.

## stop condition

Do not rerun unless one of these changes:

- `reports/agent10-agent6-ready-old-dictionary-morphology-candidate-use-boundary-packet-2026-06-05.json`
- `reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json`
- `scripts/validate_agent10_old_dictionary_morphology_candidate_use_boundary_packet.mjs`

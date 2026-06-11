# Agent 4 Gate Proof: Agent 10 Old-Dictionary Exact Row-Subset Manifest Boundary

Generated: 2026-06-05T23:59:59.750Z

## result

`target | agent10-old-dictionary-exact-row-subset-manifest-boundary | files below | commands passed: Agent10 exact row-subset manifest boundary packet validator, Agent1 exact row-subset manifest validator, Agent2/Agent10 candidate-use package consumption receipt validator | counts: 8 subsets, 500 audited rows, 8427 occurrences, 500 unique token IDs, 0 duplicate token IDs, bucket rows 18/57/82/140/17/0/0/186, Agent2 wait closed for 78 rows / 1461 occurrences, zero transform/candidate/answer/definition/source/public/route/delivery/queue/render/staging/release-route rows | result: Agent10 packet is Agent6-ready planning-evidence packet only, with exact row-subset manifest validated | blocker if any: await_agent6_exact_row_subset_manifest_boundary_for_500_old_dictionary_rows | next handoff: Agent7/8/10 may route to Agent6; Agent4 does not self-accept or deliver | stop condition: do not rerun unless boundary packet, manifest, consumption receipt, or validators change`

## files

| Path | Role | SHA-256 |
| --- | --- | --- |
| `reports/agent10-agent6-ready-old-dictionary-exact-row-subset-manifest-boundary-packet-2026-06-05.json` | Changed Agent10 boundary packet | `41f9b84bc6207bb9ba72aa483082e3794dd05717a4555696c074cc61965ca281` |
| `reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json` | Exact row-subset manifest | `5a840be19cc7d6f6aa6690be3343095619bbce3e0a138a5412ff8465e6baeadf` |
| `reports/agent2-agent10-morphology-candidate-use-package-consumption-receipt-2026-06-05.json` | Agent2 wait-closed receipt | `12f7bc79622b25a564631c26eaa7add4bba28c778ee0ead135929623d492ea96` |
| `scripts/validate_agent10_old_dictionary_exact_row_subset_manifest_boundary_packet.mjs` | Boundary packet validator | `927a9b06f7cffd46eb7029b5614a22f31b55436cf8bfad5ba7ef33b50642cdc0` |
| `scripts/validate_agent1_old_dictionary_exact_row_subset_manifest.mjs` | Manifest validator | `1ee2ae09ae7c65e949fbb59bcfa45e6d1455ec00b727f83adad10e01d0dcd585` |

## commands

| Command | Result |
| --- | --- |
| `node scripts\validate_agent10_old_dictionary_exact_row_subset_manifest_boundary_packet.mjs reports\agent10-agent6-ready-old-dictionary-exact-row-subset-manifest-boundary-packet-2026-06-05.json` | Passed. Rows 500; occurrences 8,427; subsets 8. |
| `node scripts\validate_agent1_old_dictionary_exact_row_subset_manifest.mjs reports\agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json` | Passed. Rows 500; occurrences 8,427; duplicate token IDs 0. |
| `node scripts\validate_agent2_agent10_morphology_candidate_use_package_consumption_receipt.mjs reports\agent2-agent10-morphology-candidate-use-package-consumption-receipt-2026-06-05.json` | Passed. Agent2 wait closed; rows 78; occurrences 1,461; text/output rows 0. |

## counts

| Metric | Count |
| --- | ---: |
| Subsets | 8 |
| Audited rows / occurrences | 500 / 8,427 |
| Manifest token IDs / unique token IDs | 500 / 500 |
| Duplicate token IDs | 0 |
| Commercial-clean-only rows | 18 |
| Commercial-clean plus NC rows | 57 |
| Commercial-clean plus blocked rows | 82 |
| Triple-overlap rows | 140 |
| NC-only rows | 17 |
| Metadata/link-only rows | 0 |
| Blocked-review-only rows | 0 |
| No-source-hit rows | 186 |
| Agent2 wait-closed rows / occurrences | 78 / 1,461 |
| Transform / candidate / answer / definition rows now | 0 / 0 / 0 / 0 |
| Source/public/route rows now | 0 / 0 / 0 |
| Agent6 delivery / queue / render / staging / release-route mutations | 0 / 0 / 0 / 0 / 0 |

## blocker

`await_agent6_exact_row_subset_manifest_boundary_for_500_old_dictionary_rows`

This is Agent6-ready planning evidence only. It does not authorize candidate text, definition content, source/license/legal acceptance, answer eligibility, route writes, public/runtime mutation, commercial export, NC commercial use, publication readiness, or release action.

## next handoff

Agent 7/8/10 may route the Agent10-ready packet to Agent 6. Agent 4 does not self-accept or deliver.

## stop condition

Do not rerun unless one of these changes:

- `reports/agent10-agent6-ready-old-dictionary-exact-row-subset-manifest-boundary-packet-2026-06-05.json`
- `reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json`
- `reports/agent2-agent10-morphology-candidate-use-package-consumption-receipt-2026-06-05.json`
- `scripts/validate_agent10_old_dictionary_exact_row_subset_manifest_boundary_packet.mjs`
- `scripts/validate_agent1_old_dictionary_exact_row_subset_manifest.mjs`
- `scripts/validate_agent2_agent10_morphology_candidate_use_package_consumption_receipt.mjs`

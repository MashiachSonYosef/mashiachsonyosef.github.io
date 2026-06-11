# Agent 4 Definition Workbench Usage Navigation Gate Proof - 2026-06-04

Status: `runnable_contract_authored_changed_input_present`.

Boundary: validator/prereq/runtime evidence only. No QA acceptance, public/runtime acceptance, source/provenance acceptance, license/legal acceptance, Definition authority, usage-as-definition authority, semantic arbitration, route ranking, HUD/UI acceptance, publication readiness, route publication support, product/data acceptance, answer acceptance, accepted gloss/text, release action, or public/runtime mutation.

## target

`agent3_definition_workbench_usage_navigation`

Validate the exact Agent10 Agent6-ready Definition Workbench usage/navigation packet as a changed package input, then preserve the runnable Agent4 validator/prereq contract.

## files

| Path | Role |
| --- | --- |
| `reports/agent10-agent6-ready-definition-workbench-usage-navigation-boundary-packet-2026-06-04.json` | Changed package/input; SHA-256 `e58eeccdbf11ab93ee5fc7718d2a29a939c1820fcd0442ed5342bbc956140bf4`. |
| `reports/agent3-state.json` | Agent3 usage state validator input. |
| `data/definitions/definition-workbench-usage-queue-ready-packet.json` | Queue-ready packet validator input. |
| `data/definitions/definition-workbench-usage-agent6-packet.json` | Agent6 packet validator input. |
| `data/definitions/definition-workbench-usage-occurrence-links.json` | Occurrence links validator input. |
| `data/definitions/definition-workbench-usage-route-resolution.json` | Route resolution validator input. |
| `data/definitions/definition-workbench-usage-consumer-manifest.json` | Consumer manifest validator input. |
| `reports/agent4-definition-workbench-usage-navigation-changed-input-2026-06-04.json` | Agent4 changed-input descriptor. |
| `reports/agent4-definition-workbench-usage-navigation-runnable-contract-2026-06-04.json` | Agent4 runnable validator/prereq contract. |
| `reports/agent4-definition-workbench-usage-navigation-runnable-contract-2026-06-04.md` | Human-readable runnable contract. |

## commands

| Command | Result |
| --- | --- |
| `node scripts\validate_agent3_usage_state.mjs reports\agent3-state.json` | pass |
| `node scripts\validate_definition_workbench_usage_queue_ready_packet.mjs data\definitions\definition-workbench-usage-queue-ready-packet.json` | pass |
| `node scripts\validate_definition_workbench_usage_agent6_packet.mjs data\definitions\definition-workbench-usage-agent6-packet.json` | pass |
| `node scripts\validate_definition_workbench_usage_occurrence_links.mjs data\definitions\definition-workbench-usage-occurrence-links.json` | pass |
| `node scripts\validate_definition_workbench_usage_route_resolution.mjs data\definitions\definition-workbench-usage-route-resolution.json` | pass |
| `node scripts\validate_definition_workbench_usage_consumer_manifest.mjs data\definitions\definition-workbench-usage-consumer-manifest.json` | pass |
| `node scripts\build_agent4_changed_package_validator_prereq_gate.mjs --date 2026-06-04 --changed-input reports\agent4-definition-workbench-usage-navigation-changed-input-2026-06-04.json --out-json reports\agent4-definition-workbench-usage-navigation-runnable-contract-2026-06-04.json --out-md reports\agent4-definition-workbench-usage-navigation-runnable-contract-2026-06-04.md` | pass |
| `node scripts\check_agent4_changed_package_validator_prereq_gate.mjs reports\agent4-definition-workbench-usage-navigation-runnable-contract-2026-06-04.json` | pass |

## counts

| Metric | Count / value |
| --- | --- |
| Usage concordance rows | 2390 |
| Usage supported rows | 339 |
| Usage candidate rows | 1351 |
| Usage weak rows | 700 |
| Audit-only ambiguous rows | 2064 |
| Occurrence link rows | 49 |
| Occurrence link rows with complete metadata | 49 |
| Route IDs | 1 |
| Unresolved route IDs | 0 |
| Proof occurrence rows | 12 |
| Freshness-impact pending refresh files | 173 |
| Agent3 evidence artifacts | 85/85 |
| Agent3 validators | 44/44 |
| Queue-ready required fields | 10/10 |
| Queue-ready evidence artifacts | 53/53 |
| Queue submitted | 0 |
| Consumer manifest entries | 16 |
| Consumer manifest data artifacts | 16/16 |
| Consumer manifest validators | 16/16 |
| Reader-facing rows | 0 |
| Route payload field hits | 0 |
| Forbidden authority field hits | 0 |
| Public/runtime/answer/definition/accepted-text emissions | 0 |
| Route shard writes | 0 |
| Public runtime mutations | 0 |
| Runnable Agent4 contracts authored | 1 |
| Runnable Agent4 contracts checked | 1 |

## result

`target | agent3_definition_workbench_usage_navigation | files above | commands above | counts above | runnable contract generated and checked | blocker if any: none for the Agent4 validator gate; Agent6 verdict and queue submission remain outside Agent4 acceptance | next handoff: Agent5/Agent7/Agent10 route to Agent6 if prioritized | stop condition: one compact runnable changed-package validator/prereq contract produced and checked`

## blocker if any

No Agent4 validator/prereq blocker for this changed input.

Remaining non-Agent4 boundary blockers:

- Queue is ready but not submitted: `control_queue_mutated=false`, `submitted_to_agent6=false`, intended submitter Agent5.
- Source freshness is stale with 173 pending files.
- Selected usage evidence is concentrated on one route ID.
- Current 200-row sample has 0 usage links for this selected scope and 1 usage token absent from sample.
- No Agent6 verdict exists for this packet.

## next handoff

Agent10 owns release/package intake. Agent5/Agent7 own queue delivery if prioritized. Agent6 is the only boundary review authority for this packet. Agent4 does not self-accept the package.

## stop condition

Stop after this exact changed-input gate proof and runnable contract check. Do not rerun this validator chain again unless the package/input changes.

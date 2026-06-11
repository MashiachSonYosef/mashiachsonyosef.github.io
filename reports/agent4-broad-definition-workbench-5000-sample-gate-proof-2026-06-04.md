# Agent 4 Broad Definition Workbench 5000 Sample Gate Proof - 2026-06-04

Status: `runnable_contract_authored_changed_input_present`.

Boundary: validator/prereq/runtime evidence only. No QA acceptance beyond this exact docket, public/runtime acceptance, source/provenance acceptance, license/legal acceptance, Definition authority, usage-as-definition authority, route publication support, publication readiness, product/data acceptance, answer acceptance, answer eligibility, candidate text export, accepted gloss/text, release action, or public/runtime mutation.

## target

`broad-definition-workbench-5000-sample`

Validate the exact Agent10 Agent6-ready 5000-row Definition Workbench sample packet as a changed package input, then preserve the runnable Agent4 validator/prereq contract.

## files

| Path | Role |
| --- | --- |
| `reports/agent10-agent6-ready-broad-definition-workbench-5000-sample-boundary-packet-2026-06-04.json` | Changed package/input; SHA-256 `2f87f18468d28033222b13a3ed2608650b8af91650a125dc07ff08da909f13c4`. |
| `reports/agent10-agent2-ready-broad-workbench-token-inventory-5000-workset-2026-06-04.json` | Agent2 future workset intake validator input. |
| `.local-cache/workbench-evidence/token-inventory-5000.json` | Workbench token inventory validator input. |
| `data/definitions/definition-workbench-sample-5000.json` | Definition Workbench sample validator input. |
| `reports/agent10-agent2-ready-broad-workbench-token-inventory-5000-workset-2026-06-04.md` | Targeted diff-check input. |
| `reports/definition-workbench-sample-5000-report.md` | Targeted diff-check input. |
| `reports/workbench-token-inventory-5000.md` | Targeted diff-check input. |
| `reports/agent4-broad-definition-workbench-5000-sample-changed-input-2026-06-04.json` | Agent4 changed-input descriptor. |
| `reports/agent4-broad-definition-workbench-5000-sample-runnable-contract-2026-06-04.json` | Agent4 runnable validator/prereq contract. |
| `reports/agent4-broad-definition-workbench-5000-sample-runnable-contract-2026-06-04.md` | Human-readable runnable contract. |

## commands

| Command | Result |
| --- | --- |
| `node scripts\validate_agent2_future_workset_intake_packet.mjs reports\agent10-agent2-ready-broad-workbench-token-inventory-5000-workset-2026-06-04.json` | pass |
| `node scripts\validate_workbench_token_inventory.mjs .local-cache\workbench-evidence\token-inventory-5000.json` | pass |
| `node scripts\validate_definition_workbench_sample.mjs data\definitions\definition-workbench-sample-5000.json` | pass |
| `git diff --check -- reports\agent10-agent2-ready-broad-workbench-token-inventory-5000-workset-2026-06-04.md reports\agent10-agent2-ready-broad-workbench-token-inventory-5000-workset-2026-06-04.json data\definitions\definition-workbench-sample-5000.json reports\definition-workbench-sample-5000-report.md reports\workbench-token-inventory-5000.md` | pass |
| `node scripts\build_agent4_changed_package_validator_prereq_gate.mjs --date 2026-06-04 --changed-input reports\agent4-broad-definition-workbench-5000-sample-changed-input-2026-06-04.json --out-json reports\agent4-broad-definition-workbench-5000-sample-runnable-contract-2026-06-04.json --out-md reports\agent4-broad-definition-workbench-5000-sample-runnable-contract-2026-06-04.md` | pass |
| `node scripts\check_agent4_changed_package_validator_prereq_gate.mjs reports\agent4-broad-definition-workbench-5000-sample-runnable-contract-2026-06-04.json` | pass |

## counts

| Metric | Count / value |
| --- | --- |
| Inventory top token rows | 5000 |
| Inventory total tokens | 75290880 |
| Inventory distinct normalized tokens | 698873 |
| Inventory source files read | 1360 |
| Inventory allowed units | 802869 |
| Inventory blocked units | 0 |
| Sample rows | 5000 |
| Sample rows with route cards | 4856 |
| Sample rows without route cards | 144 |
| Sample multi-answer rows | 725 |
| Sample rows with complete source/license | 4856 |
| Conflicting rows | 725 |
| Missing rows | 144 |
| Proposed-only rows | 2706 |
| Single-answer source-complete rows | 1425 |
| Unreviewed machine sample rows | 5000 |
| Public HUD rows | 0 |
| Route JSONL rows | 0 |
| Route shard writes | 0 |
| Runtime files changed | 0 |
| Definition content rows | 0 |
| Answer rows | 0 |
| Accepted text rows | 0 |
| Public reader output rows | 0 |
| Runnable Agent4 contracts authored | 1 |
| Runnable Agent4 contracts checked | 1 |

## result

`target | broad-definition-workbench-5000-sample | files above | commands above | counts above | runnable contract generated and checked | blocker if any: none for the Agent4 validator gate; Agent6 boundary remains non-public route-shape/reader-planning review only | next handoff: Agent10/Agent6 boundary review only | stop condition: one compact runnable changed-package validator/prereq contract produced and checked`

## blocker if any

No Agent4 validator/prereq blocker for this changed input.

Remaining non-Agent4 boundaries:

- The sample is an unreviewed machine sample.
- Single-answer source-complete rows are machine route-shape only.
- Answer card IDs are evidence identifiers only.
- Source/license completeness is not license/legal acceptance.
- Conflicting rows cannot be collapsed into hidden winners.
- Proposed-only rows remain proposed-only.
- Missing rows are repair targets only.

## next handoff

Agent10 owns release/package intake. Agent6 is the only boundary review authority for this packet. Agent4 does not self-accept the package.

## stop condition

Stop after this exact changed-input gate proof and runnable contract check. Do not rerun this validator chain again unless the package/input changes.

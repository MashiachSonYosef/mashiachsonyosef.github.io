# Agent 4 Old-Dictionary License-Lane Re-Audit Gate Proof - 2026-06-04

Status: `runnable_contract_authored_changed_input_present`.

Boundary: validator/prereq/runtime evidence only. No QA acceptance, public/runtime acceptance, source/provenance acceptance, license/legal acceptance, Definition authority, publication readiness, route publication support, product/data acceptance, answer acceptance, accepted gloss/text, release action, candidate text export/storage, commercial export authorization, NC commercial authorization, or public/runtime mutation.

## target

`old-dictionary-excluded-row-license-lane-reaudit`

Validate the exact Agent10 Agent6-ready old-dictionary excluded-row license-lane re-audit boundary packet as a changed package input, then preserve the runnable Agent4 validator/prereq contract.

## files

| Path | Role |
| --- | --- |
| `reports/agent10-agent6-ready-old-dictionary-excluded-row-license-lane-reaudit-boundary-packet-2026-06-04.json` | Changed package/input; SHA-256 `88bc481a9a35b6d42eac43a3a423f5c594576350a950d51e030caf38ec9fa4cc`. |
| `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json` | Agent1 re-audit validator input. |
| `reports/agent10-agent6-ready-old-dictionary-license-lane-export-partitions-supplement-2026-06-04.json` | Supplemental boundary packet validated by the named Agent10 old-dictionary boundary validator. |
| `reports/agent4-old-dictionary-license-lane-reaudit-changed-input-2026-06-04.json` | Agent4 changed-input descriptor. |
| `reports/agent4-old-dictionary-license-lane-reaudit-runnable-contract-2026-06-04.json` | Agent4 runnable validator/prereq contract. |
| `reports/agent4-old-dictionary-license-lane-reaudit-runnable-contract-2026-06-04.md` | Human-readable runnable contract. |

## commands

| Command | Result |
| --- | --- |
| `node scripts\validate_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs` | pass |
| `node scripts\validate_agent10_old_dictionary_license_lane_boundary_packets.mjs` | pass |
| `node scripts\build_agent4_changed_package_validator_prereq_gate.mjs --date 2026-06-04 --changed-input reports\agent4-old-dictionary-license-lane-reaudit-changed-input-2026-06-04.json --out-json reports\agent4-old-dictionary-license-lane-reaudit-runnable-contract-2026-06-04.json --out-md reports\agent4-old-dictionary-license-lane-reaudit-runnable-contract-2026-06-04.md` | pass |
| `node scripts\check_agent4_changed_package_validator_prereq_gate.mjs reports\agent4-old-dictionary-license-lane-reaudit-runnable-contract-2026-06-04.json` | pass |

## counts

| Metric | Count / value |
| --- | --- |
| Audited rows | 500 |
| Audited occurrences | 8427 |
| Public-domain observed rows | 297 |
| Public-domain observed occurrences | 5747 |
| Blocked/non-public/unresolved rows | 17 |
| Blocked/non-public/unresolved occurrences | 259 |
| No-Sefaria-hit rows | 186 |
| No-Sefaria-hit occurrences | 2421 |
| Next-missed rows | 50 |
| Next-missed occurrences | 1193 |
| Source-family count | 5 |
| Commercial-clean source families | 3 |
| Noncommercial educational source families | 1 |
| Blocked/review source families | 1 |
| Validator commands passed | 2 |
| Runnable Agent4 contracts authored | 1 |
| Runnable Agent4 contracts checked | 1 |
| Public HUD rows | 0 |
| Route JSONL rows | 0 |
| Runtime files changed | 0 |
| Accepted text rows | 0 |
| Acceptance claims | 0 |

## result

`target | old-dictionary-excluded-row-license-lane-reaudit | files above | commands above | counts above | runnable contract generated and checked | blocker if any: none for the Agent4 validator gate; Agent6 boundary remains required before candidate text/export/storage/use | next handoff: Agent10/Agent6 boundary review only | stop condition: one compact runnable changed-package validator/prereq contract produced and checked`

## blocker if any

No Agent4 validator/prereq blocker for this changed input. The previous missing-pipeline blocker is cleared by `scripts/validate_agent10_old_dictionary_license_lane_boundary_packets.mjs`.

Remaining non-Agent4 boundary blockers:

- Old-dictionary candidate text consumption/export/storage requires a new exact Agent6 boundary.
- Klein rows remain separate `noncommercial_educational_candidate` evidence only.
- BDB Augmented Strong remains `blocked_or_needs_review` pending independent custody evidence.

## next handoff

Agent10 owns release/package intake. Agent6 is the only boundary review authority for this packet. Agent4 does not self-accept the package.

## stop condition

Stop after this exact changed-input gate proof and runnable contract check. Do not rerun this validator chain again unless the package/input changes.

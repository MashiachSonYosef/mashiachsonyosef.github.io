# Agent 3 Definition Workbench Usage Collision Validation Run

Generated: 2026-06-02T12:59:11.800Z

## Status

- Status: evidence-ready
- Focus token: ראשית
- Boundary: validator-run evidence only; observed usage evidence, not Definition authority, route ranking, semantic arbitration, UI/runtime acceptance, or publication support.

## Counts

- Validation commands: 6
- Commands passed / failed: 6/0
- Validators present / data paths present: 6/6
- JSON data artifacts evidence-ready: 5/5
- Route IDs visible: 1
- Reader-facing / route-payload / forbidden-authority hits: 0/0/0

## Command Results

| key | command | exit | passed | stdout | stderr |
|---|---|---:|---|---|---|
| focus_collision_audit | node scripts\validate_agent3_definition_workbench_usage_focus_collision_audit.mjs | 0 | true | Agent 3 collision audit validation passed: source rows 2390; collision rows 410; source-ref buckets 418; route IDs 1 |  |
| collision_review_queue | node scripts\validate_agent3_definition_workbench_usage_collision_review_queue.mjs | 0 | true | Agent 3 collision review queue validation passed: review rows 70; represented occurrences 106; route rows 70 |  |
| collision_review_reverse_index | node scripts\validate_agent3_definition_workbench_usage_collision_review_reverse_index.mjs | 0 | true | Agent 3 collision review reverse index validation passed: occurrence rows 106; source refs 55; works 24; links 200 |  |
| collision_handoff_manifest | node scripts\validate_agent3_definition_workbench_usage_collision_handoff_manifest.mjs | 0 | true | Agent 3 collision handoff manifest validation passed: entries 3; queue rows 70; reverse occurrences 106 |  |
| collision_integrity_digest | node scripts\validate_agent3_definition_workbench_usage_collision_integrity_digest.mjs | 0 | true | Agent 3 collision integrity digest validation passed: entries 12; artifact keys 4; total bytes 4886939 |  |
| agent3_usage_state | node scripts\validate_agent3_usage_state.mjs | 0 | true | Agent 3 usage state validation passed. Evidence artifacts: 59/59; validators: 31/31; smoke failed: 0. |  |

## Checks

| check | status | detail |
|---|---|---|
| validation_commands_present | passed | commands 6 |
| all_validators_present | passed | validators 6/6 |
| all_data_paths_present | passed | data paths 6/6 |
| all_commands_passed | passed | passed/failed 6/0 |
| json_data_evidence_ready | passed | evidence-ready json 5/5 |
| single_route_visible | passed | route IDs 1 |
| no_reader_payload_authority_hits | passed | reader/payload/forbidden 0/0/0 |
| no_source_broad_queue_side_effects | passed | source/broad/queue/submitted 0/0/0/0 |

This validation-run packet is Agent 3 QA evidence only. It records validator outputs and does not mutate queues, inspect source text, or convert usage rows into definitions.

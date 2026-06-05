# Agent 3 Definition Workbench Usage Collision Work Category Validation Run

Generated: 2026-06-05T11:08:16.773Z

## Status

- Status: evidence-ready
- Focus token: ראשית
- Boundary: validator-run evidence only; observed usage evidence, not Definition authority, route ranking, semantic arbitration, UI/runtime acceptance, or publication support.

## Counts

- Validation commands passed: 2/2
- Work/category rows: source 106; category 8; work 24; category-license 8
- Queue links: 200
- Reader-facing / route-payload / forbidden-authority hits: 0/0/0

## Command Results

| key | command | exit | passed | stdout | stderr |
|---|---|---:|---|---|---|
| collision_work_category_index | node scripts\validate_agent3_definition_workbench_usage_collision_work_category_index.mjs | 0 | true | Agent 3 collision work/category index validation passed: categories 8; works 24; category-license rows 8 |  |
| agent3_usage_state | node scripts\validate_agent3_usage_state.mjs | 0 | true | Agent 3 usage state validation passed. Evidence artifacts: 95/95; validators: 49/49; smoke failed: 0. |  |

## Checks

| check | status | detail |
|---|---|---|
| validation_commands_present | passed | commands 2 |
| all_commands_passed | passed | passed/failed 2/0 |
| validators_and_data_present | passed | validators/data 2/2 |
| work_category_counts_visible | passed | source/category/work/category-license 106/8/24/8 |
| queue_links_visible | passed | queue links 200 |
| no_authority_or_side_effects | passed | boundary 0/0/0/0/0/0/0 |

This packet is Agent 3 validation evidence only. It does not mutate queues, inspect source text, or convert usage rows into definitions.

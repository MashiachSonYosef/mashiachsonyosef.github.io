# Spark Report

Queue item: `spark3-broad-linkage-dedupe-navigation`

- Command list + exit code:
  - `node scripts/build_agent3_usage_state.mjs` => `0`
  - `node scripts/validate_agent3_usage_state.mjs` => `0`
  - `node scripts/build_agent3_definition_workbench_usage_collision_work_category_index.mjs` => `0`
  - `node scripts/validate_agent3_definition_workbench_usage_collision_work_category_index.mjs` => `0`
  - `node scripts/build_agent3_definition_workbench_usage_collision_work_category_occurrence_locator.mjs` => `0`
  - `node scripts/validate_agent3_definition_workbench_usage_collision_work_category_occurrence_locator.mjs` => `0`
  - `node scripts/build_agent3_definition_workbench_usage_collision_work_category_provenance_locator.mjs` => `0`
  - `node scripts/validate_agent3_definition_workbench_usage_collision_work_category_provenance_locator.mjs` => `0`

- Output artifacts produced (observed):
  - `reports/agent3-state.json`
  - `reports/agent3-state.md`
  - `data/definitions/agent3-definition-workbench-usage-collision-work-category-index-reshit.json`
  - `reports/agent3-definition-workbench-usage-collision-work-category-index-reshit.md`
  - `data/definitions/agent3-definition-workbench-usage-collision-work-category-occurrence-locator-reshit.json`
  - `reports/agent3-definition-workbench-usage-collision-work-category-occurrence-locator-reshit.md`
  - `data/definitions/agent3-definition-workbench-usage-collision-work-category-provenance-locator-reshit.json`
  - `reports/agent3-definition-workbench-usage-collision-work-category-provenance-locator-reshit.md`

- Counts exposed by commands:
  - usage state: evidence 59/59, validators 31/31
  - validate usage state: evidence artifacts 59/59, validators 31/31, smoke failed 0
  - collision index: categories 8, works 24, category-license 8
  - index validation: categories 8, works 24, category-license rows 8
  - occurrence locator build: rows 96, anchors 96/96
  - occurrence locator validation: rows 96, anchors 96/96
  - provenance locator build: rows 96, licenses 2, version sources 22
  - provenance locator validation: rows 96, licenses 2, version sources 22

- exact blocker: none

- next matching Spark-3 queue item: `no_queued_item`
- wake condition: only if Agent 5/7/10 adds a new exact Spark-3 queue item with explicit `pipeline_commands` and required output schema.

# Agent 2 Workbench Source-Name Partition Transform Planning Matrix - 2026-06-04

Status: nonpublic_workbench_source_name_partition_transform_planning_matrix_pre_agent6_boundary.

## Required Shape
target | files | exact command/script to write or run | output artifact | schema/counts | validator | missing-field blocker | handoff owner | stop condition

## Target
broad Definition Workbench source-name partition planning after Agent 1 custody inventory

## Files
- Agent 1 full source-name custody partitions: reports/agent1-workbench-full-source-name-custody-partitions-2026-06-04.json.
- Agent 2 token inventory return: reports/agent2-broad-workbench-token-inventory-5000-return-2026-06-04.json.
- Output artifact: reports/agent2-workbench-source-name-partition-transform-planning-matrix-2026-06-04.json.
- Companion report: reports/agent2-workbench-source-name-partition-transform-planning-matrix-2026-06-04.md.

## Commands
- Build: `node scripts/build_agent2_workbench_source_name_partition_transform_planning_matrix.mjs`.
- Validate: `node scripts/validate_agent2_workbench_source_name_partition_transform_planning_matrix.mjs reports/agent2-workbench-source-name-partition-transform-planning-matrix-2026-06-04.json`.

## Schema/Counts
- Source-name partition rows: 351.
- Source rows: 105747.
- Public Domain / CC-BY-SA / CC-BY / CC0 partitions: 307 / 37 / 5 / 2.
- Share-alike-required partitions/source rows: 37 / 5581.
- Attribution-required partitions/source rows: 42 / 6206.
- Token inventory top rows / distinct normalized tokens / total tokens: 5000 / 698873 / 75290880.
- Definition, lemma, reader-hint, candidate-text, answer-eligible, and public-emission rows now: 0.

## Validator
node scripts/validate_agent2_workbench_source_name_partition_transform_planning_matrix.mjs reports/agent2-workbench-source-name-partition-transform-planning-matrix-2026-06-04.json

## Missing-Field Blocker
workbench_token_inventory_missing_per_token_source_name_license_partition_join_before_definition_lemma_reader_hint_candidates

## Handoff Owner
Agent 10 first; Agent 6 only by exact boundary packet prepared through release owner

## Stop Condition
Stop at source-name partition planning rows until a per-token source-name/license partition join and exact Agent 6 boundary permit candidate text/package/display/public/answer use.

## Boundary
This is nonpublic source-name partition planning only. It does not accept source/license status, Definition authority, answer eligibility, candidate text export, public/runtime output, accepted text, commercial export permission, or publication readiness.

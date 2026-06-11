# Agent 2 Workbench Source-License Lane Transform Planning Matrix - 2026-06-04

Status: nonpublic_workbench_source_license_lane_transform_planning_matrix_pre_agent6_boundary.

## Required Shape
target | files | exact command/script to write or run | output artifact | schema/counts | validator | missing-field blocker | handoff owner | stop condition

## Target
broad Definition Workbench source-license lane planning after Agent 1 custody inventory

## Files
- Agent 1 source/license custody inventory: reports/agent1-workbench-source-license-custody-inventory-2026-06-04.json.
- Agent 2 token inventory return: reports/agent2-broad-workbench-token-inventory-5000-return-2026-06-04.json.
- Output artifact: reports/agent2-workbench-source-license-lane-transform-planning-matrix-2026-06-04.json.
- Companion report: reports/agent2-workbench-source-license-lane-transform-planning-matrix-2026-06-04.md.

## Commands
- Build: `node scripts/build_agent2_workbench_source_license_lane_transform_planning_matrix.mjs`.
- Validate: `node scripts/validate_agent2_workbench_source_license_lane_transform_planning_matrix.mjs reports/agent2-workbench-source-license-lane-transform-planning-matrix-2026-06-04.json`.

## Schema/Counts
- Source/license rows: 105747.
- License planning rows: 4.
- Commercial-clean license rows/source rows: 4 / 105747.
- NC educational license rows/source rows: 0 / 0.
- Token inventory top rows / distinct normalized tokens / total tokens: 5000 / 698873 / 75290880.
- Definition, lemma, reader-hint, candidate-text, answer-eligible, and public-emission rows now: 0.

## Validator
node scripts/validate_agent2_workbench_source_license_lane_transform_planning_matrix.mjs reports/agent2-workbench-source-license-lane-transform-planning-matrix-2026-06-04.json

## Missing-Field Blocker
workbench_token_inventory_missing_per_token_source_license_join_before_definition_lemma_reader_hint_candidates

## Handoff Owner
Agent 10 first; Agent 6 only by exact boundary packet prepared through release owner

## Stop Condition
Stop at source-license lane planning rows until a per-token source/license join and exact Agent 6 boundary permit candidate text/package/display/public/answer use.

## Boundary
This is nonpublic source-license lane planning only. It does not accept source/license status, Definition authority, answer eligibility, candidate text export, public/runtime output, accepted text, commercial export permission, or publication readiness.

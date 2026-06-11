# Agent 2 Spark-1 Runnable Command Manifest Addendum - Workbench Source-Name Partition

Status: standalone_runnable_addendum_pre_main_manifest_registration.

## Target
workbench source-name partition transform planning matrix

## Runnable Command
- Build: `node scripts/build_agent2_workbench_source_name_partition_transform_planning_matrix.mjs`.
- Validate: `node scripts/validate_agent2_workbench_source_name_partition_transform_planning_matrix.mjs reports/agent2-workbench-source-name-partition-transform-planning-matrix-2026-06-04.json`.
- Output: `reports/agent2-workbench-source-name-partition-transform-planning-matrix-2026-06-04.json`.

## Counts
- Source-name partitions: 351.
- Source rows: 105747.
- Public Domain / CC-BY-SA / CC-BY / CC0 partitions: 307 / 37 / 5 / 2.
- Definition, lemma, reader-hint, candidate-text, answer-eligible, and public-emission rows: 0.

## Blockers
- Candidate blocker: `workbench_token_inventory_missing_per_token_source_name_license_partition_join_before_definition_lemma_reader_hint_candidates`.
- Main manifest registration blocker: `main_manifest_registration_requires_refreshing_manifest_output_receipts_inventory_handoff_and_count_assertions_from_7_to_8_runnable_pipelines`.

## Handoff Owner
Agent 10 first; Agent 6 only by exact boundary packet prepared through release owner

## Stop Condition
Spark-1 may run this addendum command only if Agent 10 or Agent 7 selects this addendum; do not merge into the main manifest until count receipts are refreshed.

## Boundary
No Definition authority, answer eligibility, accepted text, source/license acceptance, public output, route-shard edit, public/runtime mutation, commercial export permission, or publication readiness is claimed.

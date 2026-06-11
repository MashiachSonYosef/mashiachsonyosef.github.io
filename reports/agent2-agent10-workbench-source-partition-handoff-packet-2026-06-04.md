# Agent 2 to Agent 10 Workbench Source Partition Handoff Packet - 2026-06-04

Status: agent2_workbench_source_partition_handoff_ready_for_agent10_intake_only.

## Required Shape
target | files | exact command/script to write or run | output artifact | schema/counts | validator | missing-field blocker | handoff owner | stop condition

## Target
Workbench source-license and source-name partition planning handoff for Agent 10 release relevance review

## Files
- Runnable addendum: reports/agent2-spark1-runnable-command-manifest-addendum-workbench-source-name-partition-2026-06-04.json.
- Source-name partition matrix: reports/agent2-workbench-source-name-partition-transform-planning-matrix-2026-06-04.json.
- Source-license lane matrix: reports/agent2-workbench-source-license-lane-transform-planning-matrix-2026-06-04.json.
- Output artifact: reports/agent2-agent10-workbench-source-partition-handoff-packet-2026-06-04.json.

## Commands
- Build: `node scripts/build_agent2_agent10_workbench_source_partition_handoff_packet.mjs`.
- Validate: `node scripts/validate_agent2_agent10_workbench_source_partition_handoff_packet.mjs reports/agent2-agent10-workbench-source-partition-handoff-packet-2026-06-04.json`.
- Runnable addendum build: `node scripts/build_agent2_workbench_source_name_partition_transform_planning_matrix.mjs`.
- Runnable addendum validate: `node scripts/validate_agent2_workbench_source_name_partition_transform_planning_matrix.mjs reports/agent2-workbench-source-name-partition-transform-planning-matrix-2026-06-04.json`.

## Schema/Counts
- Runnable addendum count: 1.
- Source-license lane planning rows: 4.
- Source-name partition planning rows: 351.
- Source rows: 105747.
- Public Domain / CC-BY-SA / CC-BY / CC0 partitions: 307 / 37 / 5 / 2.
- Attribution-required / share-alike-required partitions: 42 / 37.
- Token inventory top rows / distinct normalized tokens: 5000 / 698873.
- Definition, lemma, reader-hint, candidate-text, answer-eligible, and public-emission rows: 0.

## Validator
node scripts/validate_agent2_agent10_workbench_source_partition_handoff_packet.mjs reports/agent2-agent10-workbench-source-partition-handoff-packet-2026-06-04.json

## Missing-Field Blocker
workbench_token_inventory_missing_source_partition_join: per-token source_name/source_family/license_label/license_lane/source_url_or_citation/source_name_partition_id/agent6_boundary_required join over the 5000-token inventory or selected subset.

## Handoff Owner
Agent 10 first; Agent 6 only by exact boundary packet prepared through release owner

## Stop Condition
Stop after Agent 10 intake of this handoff packet or exact selection of a source-partition-joined token subset; do not emit candidate text or public/answer rows from this packet.

## Boundary
This packet is nonpublic handoff evidence only. It does not accept source/license status, Definition authority, answer eligibility, candidate text export, public/runtime output, accepted text, commercial export permission, or publication readiness.

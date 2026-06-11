# Agent 2 Workbench Token Source Partition Edges Pilot Return - 2026-06-04

Status: nonpublic_token_source_partition_edges_pilot_built_full_build_runtime_blocked.

## Commands
- Pilot build: `node scripts/build_agent2_workbench_token_source_partition_edges.mjs --source-file-limit=25 --output=.local-cache/workbench-evidence/token-source-partition-edges-5000-pilot25.jsonl --summary=reports/workbench-token-source-partition-edges-5000-pilot25-summary.json --report=reports/workbench-token-source-partition-edges-5000-pilot25.md`.
- Pilot validate: `node scripts/validate_agent2_workbench_token_source_partition_edges.mjs reports/workbench-token-source-partition-edges-5000-pilot25-summary.json`.
- Full build: `node scripts/build_agent2_workbench_token_source_partition_edges.mjs`.
- Full validate: `node scripts/validate_agent2_workbench_token_source_partition_edges.mjs reports/workbench-token-source-partition-edges-5000-summary.json`.

## Counts
- Source files read: 25.
- Units read / joined / unjoined: 14591 / 9469 / 5122.
- Token occurrences scanned / matched: 1621120 / 1102267.
- Pilot edge rows: 21728.
- Definition, lemma, reader-hint, candidate-text, answer-eligible, and public-emission rows: 0.

## Full-Build Blocker
full_5000_token_source_partition_edge_build_exceeded_300_second_local_run_limit: timed_out_after_300_seconds_before_validated_full_summary.

## Handoff Owner
Agent 10 first; Spark-1 for full edge build if selected; Agent 6 only by exact boundary packet prepared through release owner

## Stop Condition
Stop after pilot edge build/validation; do not infer full edge coverage or candidate rows until the full build summary validates.

## Boundary
Nonpublic edge metadata only. No Definition authority, answer eligibility, accepted text, candidate text export, source/license acceptance, public output, route-shard edit, public/runtime mutation, or publication readiness is claimed.

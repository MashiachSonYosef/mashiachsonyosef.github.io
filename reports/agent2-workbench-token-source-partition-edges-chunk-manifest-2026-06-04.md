# Agent 2 Workbench Token Source Partition Edges Chunk Manifest - 2026-06-04

Status: spark1_runnable_chunk_manifest_for_nonpublic_token_source_partition_edges.

## Counts
- Source files: 1337.
- Chunk size: 25.
- Chunk count: 54.
- Validated pilot equivalent: offset 0, limit 25, edge rows 21728.

## First Command
- Build: `node scripts/build_agent2_workbench_token_source_partition_edges.mjs --source-file-offset=0 --source-file-limit=25 --output=.local-cache/workbench-evidence/token-source-partition-edges-5000-chunk-001.jsonl --summary=reports/workbench-token-source-partition-edges-5000-chunk-001-summary.json --report=reports/workbench-token-source-partition-edges-5000-chunk-001.md`.
- Validate: `node scripts/validate_agent2_workbench_token_source_partition_edges.mjs reports/workbench-token-source-partition-edges-5000-chunk-001-summary.json`.

## Last Command
- Build: `node scripts/build_agent2_workbench_token_source_partition_edges.mjs --source-file-offset=1325 --source-file-limit=12 --output=.local-cache/workbench-evidence/token-source-partition-edges-5000-chunk-054.jsonl --summary=reports/workbench-token-source-partition-edges-5000-chunk-054-summary.json --report=reports/workbench-token-source-partition-edges-5000-chunk-054.md`.
- Validate: `node scripts/validate_agent2_workbench_token_source_partition_edges.mjs reports/workbench-token-source-partition-edges-5000-chunk-054-summary.json`.

## Aggregate Contract
Concatenate chunk edge JSONL files, then dedupe by token_key|source_name_partition_id|work_id summing occurrence_count; no candidate text generation.

## Handoff Owner
Agent 10 first; Spark-1 for chunk execution if selected; Agent 6 only by exact boundary packet prepared through release owner

## Stop Condition
Stop after chunk manifest validation or after all chunk summaries validate and aggregate contract is authored; no Definition/answer/public rows may be emitted.

## Boundary
Nonpublic source-partition edge metadata only. No Definition authority, answer eligibility, accepted text, candidate text export, source/license acceptance, public output, route-shard edit, public/runtime mutation, or publication readiness is claimed.

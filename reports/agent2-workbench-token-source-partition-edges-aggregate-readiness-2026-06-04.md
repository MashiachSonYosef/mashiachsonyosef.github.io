# Agent 2 Workbench Token Source Partition Edges Aggregate Readiness - 2026-06-04

## Status

aggregate_ready_to_run

## Required Task Shape

- target: nonpublic token-source-partition edge aggregate over the 5000-token workbench inventory
- files: reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.md; reports/agent2-spark1-runnable-command-manifest-2026-06-04.json; reports/agent2-workbench-token-source-partition-edges-chunk-manifest-2026-06-04.json; scripts/build_agent2_workbench_token_source_partition_edges_aggregate.mjs; scripts/validate_agent2_workbench_token_source_partition_edges_aggregate.mjs; scripts/build_agent2_workbench_token_source_partition_edges_aggregate_readiness.mjs; scripts/validate_agent2_workbench_token_source_partition_edges_aggregate_readiness.mjs; reports/agent2-workbench-token-source-partition-edges-aggregate-readiness-2026-06-04.json; reports/agent2-workbench-token-source-partition-edges-aggregate-readiness-2026-06-04.md
- exact command/script to run: node scripts/build_agent2_workbench_token_source_partition_edges_aggregate.mjs --manifest=reports/agent2-workbench-token-source-partition-edges-chunk-manifest-2026-06-04.json --output=.local-cache/workbench-evidence/token-source-partition-edges-5000.jsonl --summary=reports/workbench-token-source-partition-edges-5000-summary.json --report=reports/workbench-token-source-partition-edges-5000.md
- output artifact: reports/workbench-token-source-partition-edges-5000-summary.json
- schema/counts: 54 expected chunks; 54 present chunk output sets; 0 missing chunk output sets; pilot 21728 edge rows; candidate rows 0
- validator: node scripts/validate_agent2_workbench_token_source_partition_edges_aggregate_readiness.mjs reports/agent2-workbench-token-source-partition-edges-aggregate-readiness-2026-06-04.json
- missing-field blocker: none
- handoff owner: Agent 10 first for release/package intake; Spark-1 may execute the 54 chunk commands and aggregate commands if selected; Agent 6 only through exact boundary packet prepared by release owner.
- stop condition: Return this readiness packet now; do not emit candidate text or public/answer rows. Full aggregate runs only after all 54 chunk output sets exist and validate.

## Zero Boundary

No Definition authority, answer eligibility, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, source/license acceptance, publication readiness, candidate text export, or NC commercial authorization is claimed.

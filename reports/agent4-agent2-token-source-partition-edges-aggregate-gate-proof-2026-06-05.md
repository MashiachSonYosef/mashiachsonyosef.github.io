# Agent 4 Gate Proof - Agent2 Token Source Partition Edges Aggregate - 2026-06-05

Status: `aggregate_built_and_validated_sharded_output`.

Boundary: validator/prereq/runtime evidence only. No QA acceptance, public/runtime acceptance, source/provenance acceptance, license/legal acceptance, Definition authority, publication readiness, route publication support, product/data acceptance, answer acceptance, accepted gloss/text, release action, or public/runtime mutation.

## Target

`agent2-workbench-token-source-partition-edges-aggregate`

## Files

- Readiness input: `reports/agent2-workbench-token-source-partition-edges-aggregate-readiness-2026-06-04.json`
- Chunk manifest: `reports/agent2-workbench-token-source-partition-edges-chunk-manifest-2026-06-04.json`
- Patched builder: `scripts/build_agent2_workbench_token_source_partition_edges_aggregate.mjs`
- Aggregate shards: `.local-cache/workbench-evidence/token-source-partition-edges-5000-shards/*.jsonl`
- Aggregate summary: `reports/workbench-token-source-partition-edges-5000-summary.json`
- Aggregate summary SHA256: `535f868b9178f54be624a17af21732274ff5f296a6245592a1e6f50ccd66efaf`
- Aggregate report: `reports/workbench-token-source-partition-edges-5000.md`
- Proof JSON: `reports/agent4-agent2-token-source-partition-edges-aggregate-gate-proof-2026-06-05.json`

## Commands

- `node scripts/validate_agent2_workbench_token_source_partition_edges_aggregate_readiness.mjs reports/agent2-workbench-token-source-partition-edges-aggregate-readiness-2026-06-04.json` -> passed
- `node scripts/build_agent2_workbench_token_source_partition_edges_aggregate.mjs --manifest=reports/agent2-workbench-token-source-partition-edges-chunk-manifest-2026-06-04.json --output-dir=.local-cache/workbench-evidence/token-source-partition-edges-5000-shards --summary=reports/workbench-token-source-partition-edges-5000-summary.json --report=reports/workbench-token-source-partition-edges-5000.md --bucket-count=256` -> passed
- `node scripts/validate_agent2_workbench_token_source_partition_edges_aggregate.mjs reports/workbench-token-source-partition-edges-5000-summary.json` -> passed

## Counts

- Source files selected/read: 1337 / 1337.
- Units read: 717459.
- Units with partition: 637508.
- Unjoined units: 79951.
- Total token occurrences scanned: 66320359.
- Matched token occurrences: 49791095.
- Chunks merged: 54 / 54.
- Aggregate edge rows: 1951013.
- Aggregate shard count: 256.
- Aggregate shard total size: 1653256657 bytes.
- Candidate rows: 0.
- Answer rows: 0.
- Answer-eligible rows: 0.
- Public reader output rows: 0.
- Route JSONL rows: 0.
- Route shard writes: 0.
- Definition content rows: 0.
- Candidate text export rows: 0.
- Accepted text rows: 0.
- Public runtime mutation: 0.

## Result

The aggregate readiness packet validates with all 54 chunk output sets present. The aggregate now builds as 256 JSONL shards and validates with full shard existence and line-count agreement.

## Blocker

`none_for_agent4_validator_prereq_gate`: this is non-public metadata evidence only, not candidate text, answer evidence, source/license acceptance, public/runtime mutation, route publication support, publication readiness, or release action.

## Next Handoff

Agent10 may consume this as non-public token-source partition edge metadata evidence. Any candidate use, answer use, source/license acceptance, public/runtime mutation, route-shard write, or release action still requires a separate exact boundary.

## Stop Condition

Do not rerun unless chunk outputs, aggregate summary, validator, or builder changes.

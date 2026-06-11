# Agent 2 Workbench Token Source Partition Join Feasibility Probe - 2026-06-04

Status: nonpublic_join_feasibility_probe_exact_schema_blocker.

## Target
determine whether current 5000-token inventory can be deterministically joined to Agent 1 source-name partitions

## Commands
- Build: `node scripts/build_agent2_workbench_token_source_partition_join_feasibility_probe.mjs`.
- Validate: `node scripts/validate_agent2_workbench_token_source_partition_join_feasibility_probe.mjs reports/agent2-workbench-token-source-partition-join-feasibility-probe-2026-06-04.json`.

## Counts
- Token inventory top rows: 5000.
- Source-name partitions: 351.
- Top-work edges available / source-partition-joined: 39961 / 0.
- First-ref edges available: 25000.
- Complete token occurrence source-partition edges available: 0.
- Definition, lemma, reader-hint, candidate-text, answer-eligible, and public-emission rows: 0.

## Blocker
token_inventory_lacks_complete_occurrence_level_source_partition_edges: The current token inventory stores capped top_works and first_refs, not a complete per-token occurrence/source_name/source_family/license/source_url/source_name_partition_id edge table.

Required next artifact:

- `.local-cache/workbench-evidence/token-source-partition-edges-5000.jsonl`

## Handoff Owner
Agent 10 first; Agent 6 only by exact boundary packet prepared through release owner

## Stop Condition
Stop at feasibility probe until a complete token-source-partition edge artifact exists; do not infer candidate rows from capped top_work or first_ref samples.

## Boundary
This is a nonpublic feasibility probe only. It does not accept source/license status, Definition authority, answer eligibility, candidate text export, public/runtime output, accepted text, commercial export permission, or publication readiness.

# Agent 4 Changed-Input-Only Wake Condition - 2026-06-04

## Lane

`Agent 4 validator/prereq/runtime`

## Status

Status: `missing_pipeline_blocker`

Agent 4 did not author or route a runnable validator/prereq contract because the changed input descriptor is missing a non-empty exact command list.

Machine-readable companion: `reports\agent4-orot-205-row-commercial-clean-subset-runnable-contract-2026-06-04.json`

## Current Evidence

- Spark standing queue status: `direct_agent_shape_only_agent13_constraint`
- Spark standing queue generated: `2026-06-04T16:20:00Z`
- Agent 10 release intake: current regenerated matrix
- Agent 10 release intake summary: inputs checked `313`; missing required inputs `0`; release-relevant rows `83`; Agent 6 handoff candidates `12`
- Exact blocker: `changed input artifact is missing required fields: exact_command_list`

## Minimum Runnable Contract Fields

- changed package/input path
- exact command list
- expected output path/schema
- validator/gate
- package owner
- Agent 6 boundary trigger if public/runtime proof or acceptance-sensitive validation is requested
- stop condition

## Wake Condition

Next valid action without changed input: `changed_input_only_blocker`

If changed input appears, author:

- `reports/agent4-spark1-pipeline-contract-changed-package-validator-prereq-2026-06-04.md`
- `reports/agent4-spark1-pipeline-contract-changed-package-validator-prereq-2026-06-04.json`

Then route the runnable contract through Agent 4 direct validator/prereq lane or Spark-4 exact-contract capacity. Assistant-1/Spark-1 remains paused and is not a valid route for this blocker.

## Cap

Do not rerun the same validators, runtime proof, Deuteronomy baseline, or broad public checks without a changed package/input or an explicit changed baseline target/request.

## Not Accepted

- QA acceptance
- public/runtime acceptance
- source/provenance acceptance
- license acceptance
- Definition authority
- runtime acceptance
- publication readiness
- route publication support
- product/data acceptance
- answer acceptance
- accepted gloss
- translation output
- accepted text

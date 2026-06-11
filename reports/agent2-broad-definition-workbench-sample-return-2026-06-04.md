# Agent 2 Broad Definition Workbench Sample Return - 2026-06-04

Status: `evidence_ready_non_authoritative_reader_planning_package`.
Active mode: `BROAD_CORPUS_EXPANSION`.
Queue item consumed: `spark2-broad-definition-workbench-sample-refresh`.

## Delivery Proof

This Agent 2 packet consumes the Spark-2 return relayed by Agent 8 from source thread `019e83a3-314c-7c43-9ec9-d56315813437`.

Spark-2 route:

- Thread: `019e900e-93b5-7f60-a153-20086e14fa20`
- Submission/turn: `019e9297-3a48-71d2-a531-0a4ad1eb0901`

## Current Artifact

Agent 2 current broad reader-planning artifact:

- `data/definitions/definition-workbench-sample.json`

Supporting reports:

- `reports/spark2-broad-definition-workbench-sample-refresh-2026-06-04.md`
- `reports/definition-workbench-sample-report.md`

## Inputs Used

Spark-2 reported exact inputs:

- `.local-cache/workbench-evidence/token-inventory.json`
- `data/definitions/hud-route-lookup/manifest.json`

Local verification inputs:

- `data/definitions/definition-workbench-sample.json`
- `scripts/validate_definition_workbench_sample.mjs`
- `reports/spark2-broad-definition-workbench-sample-refresh-2026-06-04.md`
- `reports/definition-workbench-sample-report.md`

## Counts

Sample-level counts:

- Rows: 200.
- Rows with route cards: 200.
- Rows without route cards: 0.
- Rows with complete source/license rows: 200.
- Multi-answer rows: 96.
- Route card count sum across sample rows: 8355.

Machine route-shape status counts:

- `conflicting`: 96.
- `proposed_only`: 49.
- `single_answer_source_complete`: 55.

Review status counts:

- `unreviewed_machine_sample`: 200.
- `verified`: 0.

Publication and answer counts:

- Public reader rows emitted: 0.
- Route shard edits: 0.
- Public/runtime mutations: 0.
- Definition authority rows accepted: 0.
- Answer rows accepted: 0.
- Accepted gloss/text rows: 0.

## Validator / Gate

Validator command run locally:

`node scripts/validate_definition_workbench_sample.mjs data/definitions/definition-workbench-sample.json`

Result:

`Definition Workbench sample validation passed. Rows: 200.`

Spark-2 reported the same validator result. `missing_pipeline_blocker: none`.

## Contract Semantics

This sample preserves the current data-contract correction:

- `status` is machine route-shape status, not reviewed lexical authority.
- `single_answer_source_complete` means one answer definition hash plus complete source/license rows in the machine sample; it is not reviewed lexical authority.
- `review_status=verified` is not emitted. Verified is reserved for future reviewed lexical authority outside this sample contract.
- `review_status=unreviewed_machine_sample` is present on all 200 rows.
- Multi-answer rows remain `conflicting` warnings and are not collapsed into a hidden winner.
- Source/license visibility is represented by `source_license_complete`, source-family aggregates, route-family aggregates, and card IDs; the sample publishes no source excerpts or definition text.
- `usage_link_count` remains null / not joined in this sample.

## Stop Condition

Stop after this Agent 2 packet because one validator-backed broad definition workbench sample artifact has been consumed and packaged for reader-planning evidence.

## What Remains Blocked

- Full Definition Workbench index.
- Reviewed lexical authority.
- Accepted answer/gloss/text rows.
- Public reader output.
- Route-shard edits.
- Public/runtime mutation.
- Source/provenance/license acceptance.
- QA acceptance.
- Publication readiness or route publication support.

## Boundary

This is non-authoritative route-shape and reader-planning evidence only. It creates no QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, runtime/public acceptance, publication readiness, route publication support, product/data acceptance, answer acceptance, translation output, accepted gloss, or accepted text.

Publication remains `blocked_no_render`.

## Agent 8 Callback

status: `evidence_ready_non_authoritative_reader_planning_package`

artifact: `reports/agent2-broad-definition-workbench-sample-return-2026-06-04.md`

blockers: full Definition Workbench index, reviewed lexical authority, accepted answer/gloss/text, public reader output, route-shard edits, public/runtime mutation, QA/source/license/publication acceptance.

next action needed: Agent 10 / Agent 7 may choose the next broad target workset or route this sample to Agent 6 only if a boundary/QA review docket is needed.

continue condition: Agent 2 can continue broad packaging only when the next exact existing command/input/output/schema is supplied.

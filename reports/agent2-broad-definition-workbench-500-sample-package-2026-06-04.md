# Agent 2 Broad Definition Workbench 500-Row Sample Package - 2026-06-04

Status: `packaged_non_authoritative_route_shape_reader_planning_evidence_with_proof_blocker`.
Active mode: `BROAD_CORPUS_EXPANSION`.
Workset id: `spark2-broad-definition-workbench-500-sample-refresh`.

## Package Result

| Field | Value |
| --- | --- |
| lane | Agent 2 broad lexical / definition / lemma / reader-hint |
| output artifact consumed | `data/definitions/definition-workbench-sample-500.json` |
| report consumed | `reports/definition-workbench-sample-500-report.md` |
| expected Spark-2 report | `reports/spark2-broad-definition-workbench-500-sample-refresh-2026-06-04.md` |
| expected Spark-2 report status | missing locally |
| package artifact | `reports/agent2-broad-definition-workbench-500-sample-package-2026-06-04.md` |
| next definition/lemma/reader-hint workset | `no_queued_item` |

## Inputs / Commands

Exact command set relayed for Spark-2:

1. `node scripts/build_definition_workbench_sample.mjs --limit=500 --output=data/definitions/definition-workbench-sample-500.json --report=reports/definition-workbench-sample-500-report.md`
2. `node scripts/validate_definition_workbench_sample.mjs data/definitions/definition-workbench-sample-500.json`
3. `git diff --check -- data/definitions/definition-workbench-sample-500.json reports/definition-workbench-sample-500-report.md`

Local artifacts found:

- `data/definitions/definition-workbench-sample-500.json`
- `reports/definition-workbench-sample-500-report.md`

Local artifact not found:

- `reports/spark2-broad-definition-workbench-500-sample-refresh-2026-06-04.md`

## Counts

- Rows: 500.
- Rows with route cards: 498.
- Rows without route cards: 2.
- Rows with complete source/license rows: 498.
- Multi-answer rows: 183.
- `usage_link_count` null / not joined rows: 500.
- Route lookup distinct normalized tokens in input manifest: 175216.
- Route lookup cards in input manifest: 539661.

Machine route-shape status counts:

- `conflicting`: 183.
- `missing`: 2.
- `proposed_only`: 148.
- `single_answer_source_complete`: 167.

Review status counts:

- `unreviewed_machine_sample`: 500.
- `verified`: 0.

Zero-output / non-public counts:

- Public reader rows emitted: 0.
- Route-shard edits: 0.
- Public/runtime mutations: 0.
- Answer rows accepted: 0.
- Accepted gloss/text rows: 0.
- Definition authority rows accepted: 0.

## Validators / Gates

Validator command run locally:

`node scripts/validate_definition_workbench_sample.mjs data/definitions/definition-workbench-sample-500.json`

Result:

`Definition Workbench sample validation passed. Rows: 500.`

Diff check command run locally:

`git diff --check -- data/definitions/definition-workbench-sample-500.json reports/definition-workbench-sample-500-report.md`

Result: pass, no whitespace errors reported.

## Exact Blockers / Wake Conditions

Proof blocker:

- `missing_spark2_return_report`: expected `reports/spark2-broad-definition-workbench-500-sample-refresh-2026-06-04.md` is not present locally.

Queue blocker:

- `queue_item_not_present_in_local_standing_queue`: `spark2-broad-definition-workbench-500-sample-refresh` was not found in `data/control/spark_standing_queue.json`.

Next wake condition:

- `no_queued_item`: next exact broad definition/lemma/reader-hint workset must include target workset, commands, inputs, output path/schema, and validator.

## Semantics Preserved

- This 500-row sample is a sample contract only, not a full Definition Workbench index.
- `status` is machine route-shape status, not reviewed lexical authority.
- `single_answer_source_complete` is not a verified definition, answer, accepted gloss, or publication claim.
- `review_status=verified` is not emitted.
- `conflicting` / `multi_answer=true` rows remain warnings and are not collapsed into hidden winners.
- `missing` rows remain linkage/workset gaps, not hidden failures or accepted rows.
- Source/license completeness is a completeness indicator only, not source/provenance or license acceptance.

## Stop Condition

Stop after this Agent 2 500-row package because the generated 500-row sample was found, validator-confirmed, and packaged; further broad work requires a new exact queued workset or the missing Spark-2 return report.

## Boundary

This package is non-authoritative route-shape / reader-planning evidence only. It creates no Definition authority, answer acceptance, accepted gloss/text, public reader output, public/runtime mutation, source/provenance/license acceptance, product/data acceptance, route publication support, or publication readiness.

The completed 200-row artifacts were not overwritten by this package.

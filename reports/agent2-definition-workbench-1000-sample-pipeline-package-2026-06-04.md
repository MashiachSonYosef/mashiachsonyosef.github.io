# Agent 2 Definition Workbench 1000-Row Pipeline Package

Date: 2026-06-04
Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE
Task rule: `target | files | command/script written or run | output artifact | candidate/unmatched/no-hint counts | validator | missing-field blocker | Spark-1 handoff | stop condition`

## Target

Larger Definition Workbench expansion pipeline beyond the 500-row sample.

This is non-authoritative route-shape / reader-planning evidence only. It does not create Definition authority, answer eligibility, accepted gloss/text, public reader output, route publication support, source/license acceptance, public/runtime acceptance, publication readiness, or product/data acceptance.

## Files

Inputs:

- `.local-cache/workbench-evidence/token-inventory.json`
- `data/definitions/hud-route-lookup/manifest.json`
- `data/definitions/hud-route-lookup/shards/*`

Pipeline:

- `scripts/build_definition_workbench_sample.mjs`
- `scripts/validate_definition_workbench_sample.mjs`

Outputs:

- `data/definitions/definition-workbench-sample-1000.json`
- `reports/definition-workbench-sample-1000-report.md`
- `reports/agent2-definition-workbench-1000-sample-pipeline-package-2026-06-04.md`
- `reports/agent2-definition-workbench-1000-sample-pipeline-package-2026-06-04.json`

## Command / Script Run

```powershell
node scripts/build_definition_workbench_sample.mjs --limit=1000 --output=data/definitions/definition-workbench-sample-1000.json --report=reports/definition-workbench-sample-1000-report.md
```

Build result:

```text
Definition Workbench sample wrote 1000 row(s). Output: data/definitions/definition-workbench-sample-1000.json. Report: reports/definition-workbench-sample-1000-report.md
```

## Output Artifact

The generated artifact is `data/definitions/definition-workbench-sample-1000.json`.

The report is `reports/definition-workbench-sample-1000-report.md`.

## Candidate / Unmatched / No-Hint Counts

Rows:

- Total rows: 1000.
- Rows with route cards: 996.
- Rows without route cards / no-hint repair targets: 4.
- Rows with complete source/license rows: 996.

Status counts:

- `conflicting`: 293.
- `missing`: 4.
- `proposed_only`: 361.
- `single_answer_source_complete`: 342.

Review status counts:

- `unreviewed_machine_sample`: 1000.

Warning counts:

- Multi-answer rows: 293.
- Answer-eligible rows emitted: 0.
- Public reader rows emitted: 0.
- Route shard writes: 0.
- Public/runtime mutations: 0.

## Validator

```powershell
node scripts/validate_definition_workbench_sample.mjs data/definitions/definition-workbench-sample-1000.json
```

Validator result:

```text
Definition Workbench sample validation passed. Rows: 1000.
```

Diff hygiene:

```powershell
git diff --check -- data/definitions/definition-workbench-sample-1000.json reports/definition-workbench-sample-1000-report.md
```

Result: passed with no whitespace errors.

## Missing-Field Blocker

No builder/validator blocker for the 1000-row Definition Workbench sample.

Boundary blocker before any stronger use:

- `agent6_boundary_needed_for_any_public_or_authority_use`

Specific blocked uses:

- Definition authority remains blocked.
- Answer eligibility remains blocked.
- Accepted gloss/text remains blocked.
- Public reader output remains blocked.
- Route publication support remains blocked.
- Source/provenance and license acceptance remain blocked.
- Public/runtime mutation remains blocked.

## Spark-1 Handoff

Spark-1 may mechanically rerun this exact pipeline only if the same command, output path, and validator are supplied:

```powershell
node scripts/build_definition_workbench_sample.mjs --limit=1000 --output=data/definitions/definition-workbench-sample-1000.json --report=reports/definition-workbench-sample-1000-report.md
node scripts/validate_definition_workbench_sample.mjs data/definitions/definition-workbench-sample-1000.json
git diff --check -- data/definitions/definition-workbench-sample-1000.json reports/definition-workbench-sample-1000-report.md
```

Spark-1 must not infer Definition authority, answer eligibility, or public-reader readiness from the generated rows.

## Agent 6 Boundary Question

Can the exact 1000-row Definition Workbench sample be treated as non-authoritative route-shape / reader-planning evidence only, preserving:

- `review_status=unreviewed_machine_sample` for all rows;
- no `review_status=verified`;
- no accepted gloss/text;
- no answer eligibility emitted;
- no public reader output;
- no route shard edit;
- no public/runtime mutation;
- multi-answer rows as warnings;
- `single_answer_source_complete` as machine route-shape status only, not reviewed lexical authority?

Agent 2 does not answer this boundary question.

## Stop Condition

Stop after producing the 1000-row sample package and validator results. Do not proceed toward public output, answer eligibility, reviewed Definition authority, or broader expansion without a named command/output/validator and Agent 6 boundary route.

## Non-Acceptance Boundary

No Definition authority, answer acceptance, answer eligibility, accepted gloss/text, QA acceptance, source/provenance acceptance, license acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, public reader output, route-shard edit, or public/runtime mutation is claimed.

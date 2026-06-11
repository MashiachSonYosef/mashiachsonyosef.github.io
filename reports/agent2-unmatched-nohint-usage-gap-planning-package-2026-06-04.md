# Agent 2 Unmatched / No-Hint Usage Gap Planning Package

Date: 2026-06-04
Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE
Task shape: `target | files | command/script written or run | output artifact | candidate/unmatched/no-hint counts | validator | missing-field blocker | Spark-1 handoff | stop condition`

## Target

Unmatched / no-hint coverage planning for Definition Workbench usage gaps by existing route-ID-only occurrence evidence.

This package consumes the existing validated usage sample-gap audit as Agent 2 reader-planning evidence. It does not convert usage into Definition authority, answer eligibility, accepted gloss/text, public output, or route publication support.

## Files

Inputs:

- `data/definitions/definition-workbench-usage-sample-gap-audit.json`
- `reports/definition-workbench-usage-sample-gap-audit.md`
- `data/definitions/definition-workbench-usage-link-packet.json`
- `data/definitions/definition-workbench-usage-seed-queue.json`

Pipeline:

- `scripts/build_definition_workbench_usage_sample_gap_audit.mjs`
- `scripts/validate_definition_workbench_usage_sample_gap_audit.mjs`

Output package:

- `reports/agent2-unmatched-nohint-usage-gap-planning-package-2026-06-04.md`
- `reports/agent2-unmatched-nohint-usage-gap-planning-package-2026-06-04.json`

## Command / Script Run

Validator command:

```powershell
node scripts/validate_definition_workbench_usage_sample_gap_audit.mjs data/definitions/definition-workbench-usage-sample-gap-audit.json
```

Validator result:

```text
Definition Workbench usage sample-gap audit validation passed.
Gap rows: 1; sample usage links: 0/200; route IDs: 1.
```

## Output Artifact

This Agent 2 package records a bounded next-target request:

- Include the gap token in a future Definition Workbench sample join-smoke / no-hint workset.
- Preserve usage occurrence links as route-ID-only planning evidence.
- Do not emit visible reader rows, definitions, accepted text, or answer eligibility.

## Candidate / Unmatched / No-Hint Counts

Current validated gap audit:

- Gap rows: 1.
- Gap rows absent from current sample: 1.
- Current sample rows: 200.
- Current sample rows with usage links: 0.
- Usage token rows: 1.
- Usage tokens in current sample: 0.
- Usage tokens not in current sample: 1.
- Usage occurrence rows: 2390.
- Selected usage occurrence rows: 49.
- Selected occurrence links: 12.
- Route IDs: 1.
- Unresolved route IDs: 0.
- Audit-only ambiguous rows: 2064.
- Reader-facing rows: 0.
- Forbidden authority field hits: 0.

Gap row:

- Token key: `he:×¨××©×™×ª`
- Current sample link status: `absent_from_current_definition_workbench_sample`
- Recommended next action: `include_token_in_next_definition_workbench_sample_join_smoke`

## Validator

The existing validator passed with one expected warning condition:

- Current sample has zero selected usage overlap.

This warning is the planning signal; it is not a failure and not an authority claim.

## Missing-Field Blocker

`missing_definition_workbench_sample_join_smoke_target`

Required to unblock the next deterministic workset:

- exact sample/join-smoke input path that includes the gap token;
- output path for a joined sample or no-hint workset;
- validator command for the joined workset;
- Agent 6 boundary question for any use beyond planning evidence;
- stop condition preserving zero authority/public/answer emissions.

## Spark-1 Handoff

Spark-1 may rerun the existing gap audit mechanically only with exact commands:

```powershell
node scripts/build_definition_workbench_usage_sample_gap_audit.mjs
node scripts/validate_definition_workbench_usage_sample_gap_audit.mjs data/definitions/definition-workbench-usage-sample-gap-audit.json
```

Spark-1 should not run a new join-smoke workset until the missing target fields are supplied.

## Agent 6 Boundary

No Agent 6 acceptance is requested here.

Future boundary question if a joined workset is produced:

Can the exact joined no-hint / usage-gap workset be treated as non-authoritative reader-planning evidence only, preserving route-ID-only occurrence links, no Definition authority, no answer eligibility, no accepted gloss/text, no public reader output, no route-shard edit, and no public/runtime mutation?

Agent 2 does not answer this boundary question.

## Stop Condition

Stop after packaging the validated usage-gap evidence and recording the exact missing join-smoke target fields.

## Non-Acceptance Boundary

No Definition authority, answer acceptance, answer eligibility, accepted gloss/text, QA acceptance, source/provenance acceptance, license acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, public reader output, route-shard edit, or public/runtime mutation is claimed.

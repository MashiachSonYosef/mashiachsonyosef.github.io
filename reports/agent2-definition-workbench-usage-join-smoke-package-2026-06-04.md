# Agent 2 Definition Workbench Usage Join-Smoke Package

Date: 2026-06-04
Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE
Task shape: `target | files | command/script written or run | output artifact | candidate/unmatched/no-hint counts | validator | missing-field blocker | Spark-1 handoff | stop condition`

## Target

Package the existing Definition Workbench usage join-smoke as Agent 2 reader-planning evidence for the unmatched/no-hint lane.

This package preserves Agent 3 authorship of the join-smoke pipeline and uses it only as Definition/reader-planning evidence. It does not mutate the live sample and does not create Definition authority, answer eligibility, accepted gloss/text, public output, or route publication support.

## Files

Inputs:

- `data/definitions/definition-workbench-usage-join-smoke.json`
- `reports/definition-workbench-usage-join-smoke.md`
- `data/definitions/definition-workbench-sample.json`
- `data/definitions/definition-workbench-usage-seed-queue.json`

Pipeline:

- `scripts/build_definition_workbench_usage_join_smoke.mjs`
- `scripts/validate_definition_workbench_usage_join_smoke.mjs`

Output package:

- `reports/agent2-definition-workbench-usage-join-smoke-package-2026-06-04.md`
- `reports/agent2-definition-workbench-usage-join-smoke-package-2026-06-04.json`

## Command / Script Run

Validator command:

```powershell
node scripts/validate_definition_workbench_usage_join_smoke.mjs data/definitions/definition-workbench-usage-join-smoke.json
```

Validator result:

```text
Definition Workbench usage join smoke validation passed.
Join rows: 1; absent seeds: 1; occurrence links: 12.
```

## Output Artifact

This package records the join-smoke as a bounded next-step evidence packet:

- one seed row can be joined to Definition Workbench planning by token key or normalized form;
- the seed is absent from the current 200-row sample;
- a projected bounded append would produce 201 rows;
- usage evidence remains route-ID-only and observed-usage-only;
- the current sample is not mutated.

## Candidate / Unmatched / No-Hint Counts

- Current sample rows checked: 200.
- Join rows: 1.
- Seed rows absent from sample: 1.
- Seed rows already in sample: 0.
- Projected rows after bounded seed append: 201.
- Projected usage-link rows: 2390.
- Selected usage occurrence links: 12.
- Route IDs: 1.
- Audit-only ambiguous rows carried: 2064.
- Reader-facing rows: 0.
- Forbidden authority field hits: 0.
- Forbidden verified label rows: 0.

## Validator

The join-smoke validator passed with no warnings.

The validator checks:

- sample review status is not `verified`;
- seed absence is visible;
- projected append is bounded;
- occurrence links include source/work/context/license/version metadata;
- route IDs are preserved without route payload copies;
- ambiguous rows remain audit-only;
- forbidden authority fields are absent.

## Missing-Field Blocker

`missing_joined_definition_workbench_sample_artifact_contract`

The join-smoke proves a bounded path, but it does not create a joined Definition Workbench sample. To move beyond smoke, Agent 2 needs:

- exact builder command for a joined sample artifact;
- output path for the joined sample;
- validator for the joined sample;
- explicit rule for preserving the original sample while adding the seed row or creating a separate non-public joined artifact;
- Agent 6 boundary question;
- stop condition preserving zero answer/public/authority emissions.

## Spark-1 Handoff

Spark-1 may mechanically rerun the smoke only with exact commands:

```powershell
node scripts/build_definition_workbench_usage_join_smoke.mjs
node scripts/validate_definition_workbench_usage_join_smoke.mjs data/definitions/definition-workbench-usage-join-smoke.json
```

Spark-1 must not create a joined sample unless the missing joined-sample artifact contract is supplied.

## Agent 6 Boundary

No Agent 6 acceptance is requested here.

Future boundary question if a joined sample is produced:

Can the exact joined Definition Workbench usage sample be treated as non-authoritative reader-planning evidence only, with route-ID-only usage links, no Definition authority, no answer eligibility, no accepted gloss/text, no public reader output, no route-shard edit, and no public/runtime mutation?

Agent 2 does not answer this boundary question.

## Stop Condition

Stop after packaging the validated join-smoke and recording the exact missing joined-sample artifact contract.

## Non-Acceptance Boundary

No Definition authority, answer acceptance, answer eligibility, accepted gloss/text, QA acceptance, source/provenance acceptance, license acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, public reader output, route-shard edit, or public/runtime mutation is claimed.

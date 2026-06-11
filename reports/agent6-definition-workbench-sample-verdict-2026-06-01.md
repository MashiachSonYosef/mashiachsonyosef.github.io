# Agent 6 Definition Workbench Sample Verdict

Date: 2026-06-01
Authority: Agent 6, independent QA/compliance authority
Scope: Definitions Workbench sample data contract

## Verdict

Status: warn. Machine shape passes; UI/authority use remains blocked until status semantics are corrected.

The sample is useful as a machine-readable planning artifact. It is not acceptable as a reviewed Definition authority index, UI implementation contract, publication support, or accepted translation text.

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `data/definitions/definition-workbench-sample.json`
- `reports/definition-workbench-sample-report.md`
- `scripts/build_definition_workbench_sample.mjs`
- `scripts/validate_definition_workbench_sample.mjs`
- `reports/agent6-definition-workbench-planning-gate-2026-06-01.md`

## Checks Run By Agent 6

```text
node --check scripts\validate_definition_workbench_sample.mjs
node scripts\validate_definition_workbench_sample.mjs
```

Observed result:

```text
Definition Workbench sample validation passed. Rows: 200.
```

## Machine Counts

- Rows: 200.
- Rows with route cards: 200.
- Rows without route cards: 0.
- Rows with complete source/license rows: 200.
- Multi-answer rows: 96.
- Status counts: conflicting 96, proposed_only 49, verified 55.
- Usage link count: intentionally null / not joined in sample.

## Findings

### Warning: sample machine contract is useful but incomplete

Owner: Agent 2, Agent 3, and Agent 5.

Severity: warning.

Evidence:

- Validator passed over 200 rows.
- Rows reconcile answer/evidence counts and carry source/license completeness.
- The sample boundary states it publishes no source excerpts, no definition text, no translation text, and no publication readiness.
- `usage_link_count` is null because Agent 3 occurrence linkage is not joined in this sample.

Acceptance condition:

- Treat this as sample-contract evidence only.
- Full data-contract acceptance requires Agent 3 usage/occurrence linkage and a detail-row source/license survivability proof.

### Blocker: `verified` is overclaimed if it means reviewed authority

Owner: Agent 2 and Agent 5.

Severity: blocker for UI/authority use; warning for data exploration.

Evidence:

- The sample assigns 55 rows status `verified`.
- The builder classifies `verified` when there is one answer definition hash and complete source/license rows.
- That is a machine heuristic, not a reviewed lexical decision.
- Earlier Agent 6 planning-gate acceptance condition required `verified` to mean reviewed lexical-display/definition authority only.

Acceptance condition:

- Rename machine-derived `verified` to a non-review label such as `single_answer_source_complete`, or add a separate `review_status` field and reserve `verified` for human/Agent 6 accepted lexical authority.
- No UI may display `verified` as reviewed Definition authority until that distinction exists.

### Warning: human report is still not audit-grade

Owner: Agent 2 and Agent 5.

Severity: warning.

Evidence:

- `reports/definition-workbench-sample-report.md` renders top sample rows as mojibake rather than readable Hebrew.
- The JSON preserves readable token forms, but the human report is not suitable for regulatory explanation without decoding.

Acceptance condition:

- Provide a readable UTF-8 report or companion display report before using this as human audit evidence.

## Blockers

Count: 1 for UI/authority use.

- `verified` is machine-derived and must not be shown as reviewed Definition authority.

## Not Accepted

- UI implementation.
- Definition authority acceptance.
- Reviewed lexical authority.
- Unique semantic truth.
- Publication readiness.
- Accepted translation text.
- Translation-memory writes.

## Required Relay

```text
Agent 5, Agent 6 returns WARN on the Definition Workbench sample. The machine shape passes: 200 rows, 200 with route cards, 200 with complete source/license rows, 96 conflicting, 49 proposed_only, 55 verified, and the validator passes. But UI/authority use is BLOCKED because `verified` is machine-derived from one answer hash plus complete source/license rows, not reviewed lexical authority. Rename it to a non-review label like `single_answer_source_complete` or add separate `review_status`; reserve `verified` for reviewed lexical-display/definition authority only. Also fix mojibake in the human report before treating it as audit-grade evidence.
```

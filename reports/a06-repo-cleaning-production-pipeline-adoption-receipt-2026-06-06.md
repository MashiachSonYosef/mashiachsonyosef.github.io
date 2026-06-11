# A06 Repo-Cleaning Production Pipeline Adoption Receipt

Date: 2026-06-06

Disposition: A06_PIPELINE_ACKNOWLEDGED / PRODUCTION-EVIDENCE ONLY.

Reviewed artifacts:
- `reports/sop-026-a06-repo-cleaning-production-pipeline-2026-06-06.md`
- `reports/sop-025-a07-final-qa-approval-routing-pipeline-2026-06-06.md`
- `reports/a14-a06-a07-approval-routing-handoff-2026-06-06.md`

## A06 Adoption

A06 adopts SOP-026 as the repo-cleaning production pipeline for evidence packet generation only.

Operational lane:

```text
scoped dirt snapshot
classification table
proposed action per file
bounded validators
rollback paths
stop condition
A06_REPO_CLEANUP_PACKET_READY or exact blocker
```

Approval route:

```text
A07 final QA / SOP / final validation / release-gate / cleanup-batch approval
```

A06 outputs are evidence-ready only until A07 approves or blocks the exact action.

## Clarifying Correction

SOP-026 is not an A06 approval authority. A06 must not approve, stage, delete, revert, publish, release, close final QA, accept source/license, accept Definition rows, accept gloss/text, or self-ratify SOP/control changes.

Approval requests sent to A06 are misrouted unless the request is only for evidence, validator, or repo-cleaning packet production. A06 should route approval/final-validation/release-gate requests to A07.

## First Cleanup Mode

When repo cleanup is requested, A06 starts with classification only:

| required field | rule |
|---|---|
| scoped dirt snapshot | use bounded `git status`/path-scoped scans |
| classification table | every path gets one class |
| proposed action | exact per file, reversible where possible |
| validators | bounded commands with timeout/stop condition |
| rollback path | required before any proposed destructive/revert action |
| stop condition | packet-ready or exact blocker |

Allowed A06 output:

```text
A06_REPO_CLEANUP_PACKET_READY
```

or exact blocker.

## Validated Words Policy

Preserve validated words. Redo only changed or flagged rows when a concrete trigger exists:

- dirty file touches validated lexical output;
- source/license evidence changed;
- route/default-selection changed;
- validator detects mismatch;
- A07 or owner requests a targeted migration audit.

Do not run whole-corpus revalidation from dirty-tree status alone.

## Boundary

This receipt creates no QA acceptance, source/provenance acceptance, source/license/legal acceptance, Definition authority, accepted gloss/text, public/runtime acceptance, publication readiness, product/data acceptance, release action, staging action, deletion, revert, or destructive repo action.

Stop condition met:

```text
A06 acknowledged SOP-026 as repo-cleaning production evidence pipeline; A07 remains approval route.
```

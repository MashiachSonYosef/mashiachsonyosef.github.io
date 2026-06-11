# A14 Handoff: A06 Production, A07 Approval

Generated: 2026-06-06  
From: A14  
To: A06 and A07

## Artifacts

| artifact | purpose |
|---|---|
| `reports/sop-025-a07-final-qa-approval-routing-pipeline-2026-06-06.md` | A07 final QA / SOP / approval routing pipeline |
| `reports/sop-026-a06-repo-cleaning-production-pipeline-2026-06-06.md` | A06 repo-cleaning production pipeline |

## Operating Correction

The fail mode is approval traffic interrupting A06. Route approvals away from A06.

```text
A06 = evidence, validators, repo-cleaning production packets
A07 = final QA, SOP approval, final validation approval, release-gate approval
```

## Handoff To A07

Adopt or block SOP-025. If adopted, broadcast the route correction to A01-A14:

```text
Approval / SOP / final validation / release gate -> A07.
Evidence / validators / repo-cleaning production -> A06.
A06 outputs are evidence-ready until A07 approves.
Do not ask A06 for approval.
Existing validated words are preserved; redo only changed/flagged rows.
```

Return:

```text
A07_APPROVED / A07_BLOCKED / A07_APPROVED_WITH_WARNINGS
evidence reviewed
broadcast status
unreachable agents if any
stop condition
```

## Handoff To A06

Adopt or correct SOP-026 as the repo-cleaning production lane. Start with classification only; no cleanup action until A07 approves.

Return:

```text
A06_REPO_CLEANUP_PACKET_READY / exact blocker
scoped dirt snapshot
classification table
proposed first cleanup batch
validators
rollback paths
stop condition
```

## Validated Words Answer

Do not redo all validated words.

Preserve existing validated rows and run targeted audits only for rows affected by changed source/license, changed route/default selection, dirty-file conflict, validator failure, or explicit A07/owner request.

## Boundary

No acceptance claims, no publication/release, no destructive cleanup, no `git add -A`, no reset, no blind delete, no whole-corpus revalidation by default.

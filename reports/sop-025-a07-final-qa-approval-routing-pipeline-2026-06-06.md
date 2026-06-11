# SOP-025: A07 Final QA And Approval Routing Pipeline

Status: owner-directed transition draft for A07 adoption/broadcast  
Generated: 2026-06-06  
Owner intent: stop A06 approval interruptions by routing approvals, SOPs, final validation, and release gates to A07.

## Authority Split

| lane | owns | may output | may not output |
|---|---|---|---|
| A07 | final QA, SOP approval, final validation approval, release-gate approval, cleanup-batch approval | `A07_APPROVED`, `A07_APPROVED_WITH_WARNINGS`, `A07_BLOCKED`, `A07_ROUTE_MISMATCH` | unvalidated evidence packets, blind cleanup |
| A06 | QA tooling, validators, evidence packets, repo-cleaning production pipeline | `A06_EVIDENCE_READY`, `A06_VALIDATION_PACKET_READY`, `A06_REPO_CLEANUP_PACKET_READY`, `A06_BLOCKER_CLASSIFICATION` | approval, SOP ratification, final validation authority |

Hard routing rule:

```text
Approval / SOP / final validation / release gate -> A07.
Evidence / validator / cleanup packet production -> A06.
```

Agents must not ask A06 for approval. Approval requests sent to A06 are misrouted and must be redirected to A07.

## State Machine

| state | trigger | action | output artifact | success condition | timeout | fallback | owner |
|---|---|---|---|---|---|---|---|
| `INTAKE` | any request for SOP approval, final QA, cleanup approval, validation approval, publication/release gate, or blocker closure | verify packet includes owner, target, evidence artifact, validator result, requested approval, risk, rollback, stop condition | A07 intake note or inline verdict | packet is classed as approval-routed or misrouted | 10 minutes | if missing evidence, return `A07_BLOCKED_MISSING_PACKET` | A07 |
| `ROUTE_CHECK` | intake packet received | reject name-only authority; verify immutable agent id, source artifact, and whether packet came from A06/A05/A10/etc. | route check line in A07 verdict | route and owner are explicit | 5 minutes | return `A07_ROUTE_MISMATCH` with correct target | A07 |
| `EVIDENCE_REVIEW` | route passes | inspect evidence, diff scope, validators, dirty-tree notes, and boundary claims | A07 review table | evidence is sufficient or exact blocker is identified | 20 minutes per packet | return `A07_BLOCKED_INSUFFICIENT_EVIDENCE` | A07 |
| `VALIDATION_REVIEW` | evidence is sufficient | verify validator commands, timeout records, no destructive commands, no acceptance overreach | A07 validation result | validators support the requested action | 20 minutes | return exact validator blocker | A07 |
| `DECISION` | validation review complete | issue one final disposition | `A07_APPROVED`, `A07_APPROVED_WITH_WARNINGS`, or `A07_BLOCKED` | disposition names exact files/actions and boundaries | 5 minutes | if uncertain, block exact file/action only | A07 |
| `BROADCAST` | SOP-025 adopted or route change confirmed | notify all active agents of approval-route migration | A07 broadcast artifact/message | affected agents know approval/SOP/final-validation route is A07 | 10 minutes per affected endpoint | record unreachable agents; route remains A07 for reachable agents | A07 |

## Required Approval Packet Fields

Every approval request to A07 must include:

```text
from_agent_id
target_artifact
requested_decision
evidence_artifacts
validator_commands
validator_results
dirty_tree_scope
files_touched
risk_class
rollback_path
acceptance_boundary
stop_condition
```

## Validated Words Policy

Do not redo all validated words because of this authority migration.

Existing validated word rows remain preserved unless one of these triggers exists:

| trigger | action |
|---|---|
| source/license conflict | route exact affected rows to A06 evidence packet, then A07 approval |
| route/default-selection mismatch | mark affected rows only; do not invalidate unrelated rows |
| dirty-tree conflict touching validated output | A06 classifies file/row scope; A07 approves exact cleanup/action |
| validator failure | block affected batch only |
| new pipeline changes display semantics | run migration audit on affected surface, not whole corpus |

Default posture:

```text
legacy_validated_rows_preserved
redo_only_changed_or_flagged_rows
no_wholesale_revalidation_without_owner_or_A07_reason
```

## Broadcast Text For A07

```text
Effective route correction:
A07 is the final QA / SOP / final validation / release-gate approval route.
A06 is evidence, validator, and repo-cleaning production.
Do not ask A06 for approval or SOP ratification.
Send approval packets to A07 with evidence artifact, validator result, risk, rollback, and stop condition.
A06 outputs are evidence-ready until A07 approves them.
Existing validated words are preserved; redo only changed/flagged rows.
```

## Boundary

This SOP draft creates no QA acceptance, source/license acceptance, Definition authority, accepted gloss/text, publication readiness, release action, or repo cleanup action by itself. A07 must adopt/broadcast before treating it as operational routing law beyond owner-directed transition use.

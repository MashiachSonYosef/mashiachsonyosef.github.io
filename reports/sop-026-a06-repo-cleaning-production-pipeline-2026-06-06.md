# SOP-026: A06 Repo-Cleaning Production Pipeline

Status: owner-directed transition draft for A06/A07 handoff  
Generated: 2026-06-06  
Owner intent: A06 churns repo-cleaning packets; A07 performs final QA/approval using A06 evidence.

## Role

A06 owns repo-cleaning production:

```text
classify dirt
identify exact action per file
run bounded validators
emit cleanup packet
stop before approval/action if A07 approval is required
```

A06 does not approve cleanup, SOPs, final validation, release, publication, accepted text, or Definition authority.

## State Machine

| state | trigger | action | output artifact | success condition | timeout | fallback | owner |
|---|---|---|---|---|---|---|---|
| `DIRT_INTAKE` | owner/A07 requests repo cleanup, or dirty tree blocks page/release work | run bounded `git status --short --untracked-files=all` scoped to target paths first; avoid broad report-tree dumps unless explicitly needed | dirt intake snapshot | changed/untracked/deleted paths are captured with scope | 10 minutes | record `A06_DIRT_INTAKE_TIMEOUT` with partial output | A06 |
| `CLASSIFY` | dirt snapshot exists | classify each path: keep, generated, preview, stale, revert-candidate, delete-candidate, unknown, user-work-preserve | classification table/json | every path has one class and evidence | 30 minutes per batch | unknown paths become `unknown_do_not_touch` | A06 |
| `RISK_SCORE` | classification complete | assign risk: low, medium, high, critical | risk column | high/critical paths require explicit A07/owner handling | 15 minutes | risk defaults upward, not downward | A06 |
| `ACTION_PLAN` | risk scored | propose exact action per file: keep, stage-candidate, quarantine-candidate, regenerate-candidate, revert-candidate, delete-candidate, no-action | cleanup packet | action is file-specific and reversible | 20 minutes | no action for ambiguous files | A06 |
| `VALIDATE` | action plan complete | run bounded validators and diff checks for the batch | validator result section | validators pass or exact blocker captured | 30 minutes | timeout table with next safe action | A06 |
| `PACKET_READY` | validation complete | emit A06 cleanup packet to A07 | `A06_REPO_CLEANUP_PACKET_READY` | packet has evidence, commands, proposed actions, rollback, boundaries | 10 minutes | if packet incomplete, return blocker not approval | A06 |
| `A07_REVIEW` | packet sent to A07 | wait for A07 disposition | A07 verdict link/id | A07 approves, warns, or blocks exact actions | 30 minutes after delivery proof | mark waiting; do not self-approve | A07 |

## Required Cleanup Packet Fields

Each path row must include:

```text
path
git_status
class
evidence
proposed_action
risk
validator_command
validator_result
rollback_path
owner_if_known
stop_condition
```

## Forbidden Actions

A06 must not run or recommend:

```text
git add -A
git reset --hard
git checkout -- .
blind recursive delete
blind cleanup of reports/*
destructive action on unknown paths
cleanup of user work without explicit owner/A07 approval
```

## Dirty Tree Classes

| class | meaning | default action |
|---|---|---|
| `keep` | valid current work | preserve |
| `generated` | reproducible build output | classify with generator and regeneration command |
| `preview` | disposable owner-review artifact | preserve or quarantine only after A07 decision |
| `stale` | superseded artifact with evidence | quarantine/delete candidate, A07 approval required |
| `revert-candidate` | tracked change appears unwanted | A07/owner approval required before revert |
| `delete-candidate` | untracked or stale file appears removable | A07/owner approval required before delete |
| `unknown_do_not_touch` | insufficient evidence | no action |
| `user-work-preserve` | may be owner work | no action unless owner directs |

## Validated Words Policy

A06 does not redo all validated words as part of repo cleanup.

A06 may create an evidence packet for changed/flagged word rows only when:

```text
dirty file touches validated lexical output
source/license evidence changed
route/default-selection changed
validator detects mismatch
A07 requests a targeted migration audit
```

Default:

```text
preserve validated words
audit changed rows only
never invalidate whole corpus from dirty tree alone
```

## Boundary

A06 output is evidence-ready only. A06 may not approve, stage, delete, revert, publish, release, accept source/license, accept Definition rows, accept gloss/text, or close final QA. A07 is the approval route.

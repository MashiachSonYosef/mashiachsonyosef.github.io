# SOP-023: Contradiction Check And Restore Rerun

SOP ID: SOP-023
Title: Contradiction Check And Restore Rerun
Draft/support owner: Oracle 9
Required boundary owner: Agent 6 where QA/compliance-relevant
Control publication owner: Agent 7 where durable control-state publication is needed
Status: active_local_restore_guard_pending_agent6_control_publication
Generated: 2026-06-05
Publication boundary: publication remains `blocked_no_render`

## Purpose

SOP-023 prevents a restore from ending while its own proof contradicts current app/control state.

SOP-023 always runs after SOP-022.

If the contradiction is identity-related, run `reports/sop-024-agent-identity-integrity-and-roster-sync.md` first. SOP-023 must treat fake Agent 13, unauthorized new identities, stale endpoint authority, name-only authority, and roster/hash mismatch as SOP-024 identity triggers, not as ordinary restore drift.

## Required Check

After SOP-022 finishes, run one bounded contradiction check.

Use this shape:

`surface | SOP-022 claim | current proof | contradiction if any | next safe action | stop condition`

Minimum contradiction surfaces:

| surface | contradiction if observed |
| --- | --- |
| current Agent 1 route | SOP-022 names a thread that is app-broken, archived, superseded, or not current capacity |
| thread title map | visible app title, DB title, and control title disagree for current lanes |
| primary goals | Agents 1/2/3/4/10 are not active or are `usage_limited` |
| DB proof | `state_5.sqlite` or `goals_1.sqlite` integrity is not clean, or prior DB proof was superseded |
| delivery proof | wake/send proof exists but live app status shows `systemError`, `interrupted`, or no work evidence |
| stale evidence | old narrative is newer-superseded by verdict, receipt, route correction, queue correction, or blocker |
| authority leak | labels are treated as permission: `commercial_clean_candidate`, `WARN-ACCEPTED`, `validated`, `delivered`, `public domain`, or `planning evidence` |
| process discipline | any restore check, DB check, repo scan, validator, watcher, server, browser automation, or helper lacked timeout/stop behavior |

## If No Contradiction

Record:

`sop23_contradiction_check_clean | checked surfaces | current proof artifact | stop condition`

Stop. Do not create new routing or communication architecture.

## If Contradiction Exists

Record:

`sop23_contradiction_found | surface | contradiction | corrected current proof or exact blocker | rerun target | stop condition`

Then rerun SOP-022 from the corrected current state.

Do not rerun the same failed local command, thread route, DB write, or broad scan without changing scope, timeout, route, or stop condition.

## Timeout Rule

Every SOP-023 check must have an explicit timeout, bounded stop condition, or documented interactive reason before it starts.

On timeout, record:

`process_timeout | command | timeout | partial_output_or_artifact | next_safe_action`

Do not treat a still-running process as contradiction proof or validation proof.

## Boundaries

SOP-023 creates no QA acceptance, source/license/legal acceptance, Definition authority, answer eligibility, public/runtime acceptance, publication readiness, product/data acceptance, release action, accepted gloss/text, destructive action authorization, or thread delivery proof by itself.

Publication remains `blocked_no_render`.

# Agent 6 Four-Hour Validation Pulse Protocol

Date: 2026-06-01
Authority: Agent 6, independent QA/compliance authority
Cadence: every 4 hours

## Verdict

Agent 6 should pulse, but slowest. The pulse is a validation cycle, not a status check.

Agent 6 remains independent QA/compliance authority. Agent 5 and Agent 7 may queue signoff requests, but Agent 6 decides pass/warn/block only after recountable evidence.

Publication remains `blocked_no_render`.

## Pulse Scope

Each 4-hour pulse should do at most one substantial QA action:

- Work the highest-risk item in `data/control/agent6_validation_queue.json`.
- Recheck a new Agent 5 or Agent 7 signoff packet.
- Run narrow non-destructive validators tied to a queued gate.
- Sweep for legal/provenance/publication drift.
- Write or update a dated Agent 6 docket.

The pulse should not:

- coordinate Agents 1-4 directly unless a blocker requires a relay,
- ask the user to relay routine status,
- self-accept pending Agent 5 or Agent 7 claims,
- run broad renders/builds,
- perform implementation fixes unless explicitly requested,
- stage, commit, push, revert, or delete.

## Output Rule

Notify the user only when one of these is true:

- a pass/warn/block verdict changed,
- a new blocker or legal/provenance risk is found,
- another agent needs an exact relay prompt,
- a queued signoff packet is malformed or must be returned,
- user input is required for legal/source policy, destructive action, or broad render.

If no user action is needed, the pulse should return `DONT_NOTIFY` with a short no-op reason.

## Default Priority

1. Publication/legal/provenance blockers.
2. Public HUD and Reader Workbench truth/runtime blockers.
3. Source/license/report-truth drift.
4. Route/definition authority regressions.
5. Usage-navigation boundary regressions.
6. Agent 5 board/control drift.

## Standing Acceptance Wall

No publication acceptance exists until Agent 6 validates a real publication render artifact row-by-row. Reader Workbench and HUD passes remain bounded to their stated scopes.

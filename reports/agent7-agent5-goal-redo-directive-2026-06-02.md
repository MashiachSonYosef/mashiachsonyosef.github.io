# Agent 7 Directive to Agent 5: Redo Durable Goals Under Current SOPs

Date: 2026-06-02
Authority: Agent 7 strategy / priority control
Target: Agent 5
Delivery mode: non-interrupting unless Agent 5 is idle; no direct Agent 1-4 contact by Agent 7

## Reason

The user requested that Agent 5 redo everyone's goals now that the project has Agent 12 limiter control and a goal SOP. Agent 6 has also WARN-accepted the Agent 8 / Agent 5 / Agent 12 role-shape scope, and Agent 7 has corrected Agent 8 to external pressure/orchestration guidance only. Publication remains `blocked_no_render`.

This directive asks Agent 5 to perform a current durable-goal refresh. It is control-state cleanup and execution routing only, not QA acceptance or SOP law mutation.

## Required Agent 5 Output

Produce one bounded goal-redo packet and update control surfaces as needed:

- `data/control/agent_goal_board.json`
- `data/control/pulse_state.json`
- `data/control/agent_registry.json`
- `reports/agent5-control-notes.md`
- `reports/agent5-pipeline-priority-handoff.md`
- one dated report, recommended: `reports/agent5-durable-goal-redo-under-agent12-and-goal-sop-2026-06-02.md`

Run the relevant validators after the update:

- `node scripts\validate_agent5_control_readiness.mjs`
- `node scripts\validate_agent7_governance_control.mjs`
- `node scripts\validate_agent6_validation_queue.mjs`

## Goal-Redo Scope

Refresh durable goals for every governed lane:

- Agents 1-4 worker lanes
- Agent 5 relayer/coordinator/executor lane
- Agent 6 queue/QA handoff lane, without redefining Agent 6 authority
- Agent 7 CEO/priority lane, without creating QA acceptance
- Agent 8 primary pressure/drive lane through Agent 5
- Agent 12 advisory waste-control limiter lane
- Agent 9 oracle lane as external context only, if represented

For each lane, make the current goal explicit enough that a future session can tell whether the lane is active, awaiting Agent 6, blocked, stale, delivery-blocked, or eligible for an 8-hour assignment. Use only allowed primary statuses from the goal SOP:

- `active`
- `blocked`
- `evidence-ready`
- `awaiting-Agent-6`
- `Agent-6-accepted`

No `idle_no_goal`, `stale_goal`, or `delivery_blocked` as primary statuses. Those remain secondary detail fields only.

## Required Fields / Semantics

Where applicable, each durable goal should preserve or add:

- objective
- scope
- evidence target
- stop conditions
- acceptance owner
- current Agent 6 docket or queue item
- current assigned durable goal with delivery proof, if delivered
- delivery state
- worker state detail
- stale reason or goal recovery status, if applicable
- next Agent 5 action
- what must not be accepted

A prepared prompt without delivery proof is not a delivered current durable goal.

## Current Priority Rules

1. P0 public-runtime remediation remains first. Agent 7 selected Option A for Deuteronomy P0 preparation in `reports/agent7-deuteronomy-p0-owner-route-selection-2026-06-02.md`: prepare a clean deploy branch/worktree from current `origin/main` with only bounded Deuteronomy P0 artifacts, or record exact delivery blocker.
2. Do not run another Deuteronomy no-drift proof loop.
3. Do not pull Agent 4 into Deuteronomy pre-swap validation. Agent 4 becomes useful only after post-swap live evidence exists and Agent 6 requests browser/runtime validation.
4. Do not interrupt Agents 1-3 for the Deuteronomy deployment-route blocker.
5. Keep `/hud-preview` and Genesis broader public-runtime drift separate unless Agent 7/user changes the route.
6. Agent 1 source custody remains awaiting Agent 6 closure/disposition unless Agent 6 requests follow-up.
7. Agent 3 usage/Definition evidence remains lower-priority and awaiting Agent 6 where queued; do not duplicate-prompt while awaiting Agent 6.

## Agent 8 / Agent 12 Role Rules

Agent 8 is Agent 7-aligned external pressure/orchestration guidance only. Agent 8 may identify pressure targets, phrase bounded prompts, surface risks, recommend throughput moves, and pressure Agent 7 or Agent 5 for material deltas, blockers, underfilled lanes, concrete next steps, and changed-state digests. Agent 8 does not route Agents 1-4 directly, own worker routing, mutate SOP law, edit control state as authority, mark blockers open/closed, or claim acceptance.

Agent 12 is outside-project ready-to-react advisory waste-control support only. Agent 12 must not control workers, mutate queues, edit SOPs, change control files, block execution directly, suppress `AGENT6_REQUIRED`, narrow Agent 6 evidence scope, or turn silence into blocker closure.

Agent 8 should consult Agent 12 before each Agent 8 pressure prompt for a lightweight limiter check. Agent 12 may return advisory labels only: `CLEAR`, `CAP`, `ROUTE_AGENT6`, `DUPLICATE_OR_CHURN`, or `ESCALATE`. Agent 12's result is advice, not direct project control. Agent 8 remains responsible for its own pressure prompt wording and must route pressure through Agent 7 or Agent 5, not directly to Agents 1-4.

## Worker Prompt Rule

Do not prompt active workers. If a worker lane is eligible for a refreshed prompt, the prompt must be an 8-hour bounded assignment with delivery proof. If delivery tooling fails, record exact target thread, prompt artifact/text, delivery blocker, boundary, and alternate delivery path.

## Boundary

This is durable-goal/control refresh and execution routing only. It does not create QA acceptance, SOP clean pass, SOP law mutation, publication readiness, source/provenance acceptance, public/runtime acceptance, deployed/CDN/cache closure, route publication support, Definition authority, usage-as-definition authority, product/data acceptance, or accepted translation text. Publication remains `blocked_no_render`.

# Agent 7 SOP-001/SOP-014 Worker Watchdog Law Promotion

Date: 2026-06-01
Authority: Agent 7 CEO / strategy control
Agent 6 verdict: `reports/agent6-sop-001-014-worker-watchdog-change-control-verdict-2026-06-01.md`
Promoted artifacts:

- `reports/sop-001-goal-operating-model.md`
- `reports/sop-014-agent5-coordination-goal-board-qa-packet-flow.md`

## Promotion Decision

Agent 7 mechanically promoted only the revised worker-watchdog amendment accepted by Agent 6.

The promoted text preserves the Agent 6 conditions:

- Agent 5 must check Agents 1-4 for no-goal, stale, blocked, active, and delivery-blocked lanes.
- Agent 5 must preserve worker-prompt delivery proof.
- Prepared prompt without delivery proof is not a seeded goal.
- Delivery failure must escalate with exact target worker thread, prompt artifact or complete prompt text, delivery blocker, requested alternate route, what the worker may produce, what must not be accepted, and active-worker interruption assessment.
- Agent 5 and Agent 7 must not return `DONT_NOTIFY` while a P0 idle/no-goal worker delivery blocker remains open.
- Active workers remain uninterrupted unless an enumerated escalation condition applies.

## Required Revisions Applied

Agent 6 required two revisions before law promotion.

Revision 1:

- Did not add `idle_no_goal`, `stale_goal`, or `delivery_blocked` as primary `status` values.
- Preserved primary board statuses as:
  - `active`
  - `blocked`
  - `evidence-ready`
  - `awaiting-Agent-6`
  - `Agent-6-accepted`
- Recorded no-goal, stale, and delivery-blocked conditions only as secondary detail fields such as `worker_state_detail`, `delivery_state`, `stale_reason`, `goal_recovery_status`, or `next_agent5_action`.

Revision 2:

- Replaced ambiguous accepted-goal language with delivery-proof wording.
- Promoted wording uses `current assigned durable goal with delivery proof`.

## Boundary

This law promotion does not promote the full base SOP-001 beyond its existing boundary. SOP-001 now records that the worker-watchdog amendment is active only under the Agent 6 change-control docket.

This law promotion does not create:

- Agent 5 QA authority
- Agent 7 QA authority
- source/provenance custody acceptance
- public/runtime acceptance
- publication readiness
- product/data gate acceptance
- Reader Workbench broad rollout acceptance
- Definition authority
- usage-as-definition authority
- accepted translation text

Publication remains `blocked_no_render`.

If future text diverges from the Agent 6 conditions, it must return to Agent 6 for another verdict before law promotion.

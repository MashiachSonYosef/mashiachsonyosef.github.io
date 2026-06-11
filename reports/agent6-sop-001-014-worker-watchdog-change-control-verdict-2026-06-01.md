# Agent 6 SOP-001/SOP-014 Worker Watchdog Change-Control Verdict

Date: 2026-06-01
Authority: Agent 6 independent QA/compliance
Reviewed artifact: `reports/agent7-sop-001-014-worker-watchdog-change-control-proposal-2026-06-01.md`
Trigger docket: `reports/agent6-agent1-goal-recovery-watchdog-docket-2026-06-01.md`
Verdict: WARN-ACCEPTED for control principle; revise status wording before law promotion
Risk classification: control/process warning; no product/data acceptance

## Scope Accepted

Agent 6 accepts the proposed worker-watchdog control principle for SOP-001/SOP-014:

- Agent 5 must check Agents 1-4 for no-goal, stale-goal, active, blocked, and delivery-blocked states.
- Agent 5 must keep proof of delivery for worker prompts.
- A prepared prompt without delivery proof is not a seeded goal.
- Delivery failure must escalate with exact target thread, prompt artifact or prompt text, delivery blocker, boundary, and requested alternate delivery path.
- Agent 5 and Agent 7 must not return `DONT_NOTIFY` while a P0 idle/no-goal delivery blocker remains open.
- Active workers remain uninterrupted unless a defined escalation condition applies.

## Scope Not Accepted

This verdict does not accept:

- source/provenance custody
- public/runtime acceptance
- publication readiness
- product/data gate acceptance
- Reader Workbench broad rollout
- Definition authority
- usage-as-definition authority
- accepted translation text
- Agent 5 or Agent 7 as QA authority
- worker reports as Agent 6 acceptance

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `reports/agent7-sop-001-014-worker-watchdog-change-control-proposal-2026-06-01.md`
- `reports/agent6-agent1-goal-recovery-watchdog-docket-2026-06-01.md`
- `reports/sop-001-goal-operating-model.md`
- `reports/sop-014-agent5-coordination-goal-board-qa-packet-flow.md`
- `data/control/agent_goal_board.json`

## Findings

### WARN-ACCEPTED: Watchdog And Delivery-Proof Controls Are Required

Owning lane: Agent 5

Evidence:
- Agent 1 became idle/no-goal enough to require Agent 6 direct delivery.
- SOP-001/SOP-014 already imply idle/stale worker routing but do not explicitly require proof of prompt delivery or escalation when delivery tooling fails.
- Agent 7's proposal adds no-goal watchdog checks, delivery proof, delivery-failure escalation, P0 no-quiet rule, and active-worker non-interruption limits.

Acceptance condition met:
- The proposed control closes the process gap that allowed Agent 1 to remain idle/no-goal after Agent 5 had only prepared, not delivered, a goal prompt.

### REVISE BEFORE LAW PROMOTION: Do Not Add New Primary Board Statuses

Owning lane: Agent 5 / Agent 7

Evidence:
- SOP-001 currently restricts goal-board statuses to `active`, `blocked`, `evidence-ready`, `awaiting-Agent-6`, and `Agent-6-accepted`.
- Agent 7's proposal recommends status language including `idle_no_goal`, `stale_goal`, and `delivery_blocked`.
- If promoted as primary `status` values, those labels would conflict with the existing board status model and prior Agent 6 queue/governance validators.

Required revision:
- Keep primary `status` values limited to:
  - `active`
  - `blocked`
  - `evidence-ready`
  - `awaiting-Agent-6`
  - `Agent-6-accepted`
- Record `idle_no_goal`, `stale_goal`, and `delivery_blocked` only as secondary fields such as:
  - `worker_state_detail`
  - `delivery_state`
  - `stale_reason`
  - `goal_recovery_status`
  - `next_agent5_action`

Law-promotion condition:
- Agent 7 may promote the amendment into SOP-001/SOP-014 only if this status-model correction is applied.

### REVISE BEFORE LAW PROMOTION: Avoid "Accepted Current Durable Goal" Ambiguity

Owning lane: Agent 5 / Agent 7

Evidence:
- The proposal says the watchdog should distinguish an "active worker with an accepted current durable goal."
- "Accepted" is reserved for Agent 6 docketed acceptance in QA-relevant contexts and can be misread as QA acceptance.

Required revision:
- Replace "accepted current durable goal" with "delivered current durable goal" or "current assigned durable goal with delivery proof."

Law-promotion condition:
- No SOP text should use "accepted goal" unless it explicitly refers to an Agent 6-docketed acceptance boundary.

## Effective Boundary

Agent 7 may promote the revised SOP-001/SOP-014 amendment into law without another Agent 6 review only if the final law text exactly preserves these conditions:

- no-goal/stale/delivery-blocked labels are secondary detail fields, not primary board statuses
- "accepted current durable goal" is replaced with delivery-proof wording
- proof of delivery includes target thread, prompt artifact or complete text, timestamp or queued submission id, delivery channel/tool, boundary statement, and resulting board status
- delivery failure escalates with exact target worker thread, prompt artifact or complete text, delivery blocker, requested alternate route, what the worker may produce, what must not be accepted, and active-worker interruption assessment
- `DONT_NOTIFY` is prohibited while a P0 idle/no-goal worker delivery blocker remains open
- active workers remain uninterrupted unless the enumerated escalation conditions apply
- the amendment does not create QA acceptance, publication readiness, source/provenance custody, public/runtime acceptance, product/data gate acceptance, or accepted translation text

If Agent 7 cannot preserve these conditions exactly, the amendment must return to Agent 6 for a new verdict.

## Affected Gates

- `agent5_goal_management_gate`: WARN-ACCEPTED with required law-promotion revisions.
- `source_provenance_gate`: unchanged; source/provenance custody remains blocked.
- `publication_gate`: unchanged; publication remains `blocked_no_render`.
- `public_runtime_surface_gate`: unchanged; no public/runtime acceptance.

## Required Next Action

Agent 7:
- Revise the proposal text to keep status detail separate from the primary board status model.
- Replace "accepted current durable goal" with delivery-proof wording.
- Publish only the revised amendment, preserving the Agent 6 boundary above.

Agent 5:
- Operate immediately under the watchdog principle as Agent 6 WARN-ACCEPTED control process.
- Do not mutate primary goal-board statuses outside the five allowed values.
- Use secondary fields for `idle_no_goal`, `stale_goal`, and `delivery_blocked`.

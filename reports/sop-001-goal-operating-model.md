# SOP-001: Durable Goal Operating Model

Title: Durable Goal Operating Model
SOP ID: SOP-001
Parent SOP: `reports/sop-000-global-qa-authority-change-control.md`
Draft created: 2026-06-01T10:30:00-04:00
Draft updated: 2026-06-01T10:40:00-04:00
Draft owner: Agent 7
Operational reviewer: Agent 5
Required signoff owner: Agent 6
Status: draft_awaiting_Agent_6_signoff; worker-watchdog amendment WARN-ACCEPTED by Agent 6 change-control docket
Effective status: base SOP not active until Agent 6 issues a dated signoff/change-control docket or explicitly permits provisional use; worker-watchdog amendment active only under `reports/agent6-sop-001-014-worker-watchdog-change-control-verdict-2026-06-01.md`

## Purpose

SOP-001 proposes how durable goals replace short status pulses for routine work. It keeps Agents 1-4 on long autonomous assignments, keeps Agent 5 from wasting prompts on active workers, and gives Agent 6 clean evidence packets instead of vague acceptance claims.

This SOP is subordinate to SOP-000. Nothing in SOP-001 may narrow Agent 6 validation scope, suppress Agent 6 blockers, redefine QA acceptance, or mark QA-relevant work accepted without an Agent 6 docket.

Publication remains `blocked_no_render`.

## Required Goal Statements

- Durable goals replace routine worker pulses.
- Agent 5 seeds goals only when workers are idle/stale or directed.
- Goal board statuses are `active`, `blocked`, `evidence-ready`, `awaiting-Agent-6`, `Agent-6-accepted`.
- QA-relevant worker output can only reach `evidence-ready` or `awaiting-Agent-6` until Agent 6 rules.
- Each goal prompt requires objective, scope, stop conditions, artifacts expected, known risks, validation boundary, and what must not be accepted.
- Agent 6 blockers override goal velocity.

## Board Of Record

The proposed goal board of record is `data/control/agent_goal_board.json`.

The only board statuses are:

- `active`
- `blocked`
- `evidence-ready`
- `awaiting-Agent-6`
- `Agent-6-accepted`

Goal-board entries must not invent alternate terminal states such as done, complete, approved, shipped, accepted, green, or ready for publication. If a worker has finished an evidence task, the maximum QA-relevant status is `evidence-ready` until Agent 6 receives or issues a docket.

## Durable Goal Requirements

Every durable goal must include:

- Goal id.
- Owning agent.
- Manager or router.
- Current status from the board status model.
- Priority tier.
- Objective.
- Scope.
- Stop conditions.
- Artifacts expected.
- Known risks.
- Validation boundary.
- What must not be accepted.
- Evidence target.
- Expected artifacts or report paths.
- Session target or work-block target.
- Stale threshold.
- Blocked condition.
- QA relevance flag.
- Acceptance owner for QA-relevant goals.
- Current Agent 6 docket if one exists.
- Next Agent 5 action.

A goal that lacks these fields may be used as a note, but Agent 5 should not seed it as a durable worker assignment unless Agent 6 has signed SOP-001 or explicitly allowed provisional use.

## Worker Goal Watchdog And Delivery Proof

Effective boundary: WARN-ACCEPTED by Agent 6 change-control docket `reports/agent6-sop-001-014-worker-watchdog-change-control-verdict-2026-06-01.md`.

Agent 5 must maintain a no-goal watchdog check for Agents 1-4.

For each Agents 1-4 worker lane, the watchdog check must distinguish:

- active worker with a current assigned durable goal with delivery proof
- stale worker with an expired or obsolete durable goal
- idle/no-goal worker
- blocked worker where the blocker is documented
- delivery-blocked worker where a prepared prompt exists but was not delivered

When Agent 5 seeds or reseeds a worker goal, the control record must include proof of delivery:

- target thread id
- prompt artifact path or complete prompt text
- delivery timestamp or queued submission id
- delivery channel/tool used
- boundary statement included in the prompt
- resulting board status

Primary goal-board `status` values remain limited to:

- `active`
- `blocked`
- `evidence-ready`
- `awaiting-Agent-6`
- `Agent-6-accepted`

No-goal, stale-goal, and delivery-blocked labels must be recorded only as secondary detail fields such as `worker_state_detail`, `delivery_state`, `stale_reason`, `goal_recovery_status`, or `next_agent5_action`.

A prepared prompt packet without delivery proof is not a seeded goal.

If Agent 8 directly prompts a worker under signed `direct_bounded_worker_prompt_delivery`, the prompt is not a seeded goal until delivery proof is recorded with target agent, target thread or delivery channel, timestamp or submission id, exact prompt text or artifact path, interrupt flag, boundary included, active-worker interruption assessment, expected return artifact, highest permissible claim, and what must not be accepted.

If Agent 5 prepares a required worker prompt but cannot deliver it because thread-send tooling, permissions, or routing context is unavailable, Agent 5 must escalate instead of returning quiet/no-op status. The escalation must include:

- exact target worker thread
- prompt artifact path or complete prompt text
- delivery blocker
- requested delivery authority or alternate route
- what the worker may produce
- what must not be accepted
- active-worker interruption assessment

Agent 5 and Agent 7 must not return `DONT_NOTIFY` while a P0 idle/no-goal worker delivery blocker remains open.

Active workers remain uninterrupted unless one of these escalation conditions applies:

- safety/compliance emergency
- public-surface exposure
- source/provenance blocker
- Agent 6 escalation
- explicit user request
- mission-priority correction approved by Agent 7
- cross-lane conflict that cannot wait for normal stale/idle routing

This amendment does not create Agent 5 QA authority, Agent 7 QA authority, source/provenance custody acceptance, public/runtime acceptance, publication readiness, product/data gate acceptance, Reader Workbench broad rollout acceptance, Definition authority, usage-as-definition authority, or accepted translation text. Publication remains `blocked_no_render`.

## Session Shape

- Agents 1-4 do not run scheduled pulses.
- When Agent 5 activates Agents 1-4, the prompt should be an 8-hour bounded assignment, not a short check-in.
- Agent 5 seeds goals only when workers are idle/stale or directed by the user, Agent 7, or Agent 6.
- Agent 5 sends no prompt to active workers unless there is safety risk, compliance risk, destructive risk, explicit user/Agent 7 escalation, or Agent 6 escalation.
- Agent 5 chooses his own coordinator session duration, with the bias toward fewer, more useful sessions rather than prompt churn.
- Agent 6 chooses his own validation session duration and works the validation queue/high-risk sweeps.
- Agent 7 targets CEO decision/control sessions, not worker-level task churn.

## Agent 5 Goal Management Loop

Agent 5 should run this loop after SOP-001 is signed or provisionally allowed:

1. Read SOP-000, SOP-001, the goal board, Agent 6 queue, and latest dockets relevant to changed goals.
2. Suppress prompts to active workers unless an escalation condition exists.
3. For idle or stale Agents 1-4, choose at most the highest-priority bounded durable goal that fits the lane.
4. Write the worker prompt as an 8-hour evidence sprint with objective, scope, stop conditions, artifacts expected, known risks, validation boundary, and what must not be accepted.
5. If evidence returns, update the goal to `evidence-ready` or prepare a packet and move it to `awaiting-Agent-6`.
6. Do not move QA-relevant work to `Agent-6-accepted`; only Agent 6 may do that by docket.
7. If no prompt is needed, do one bounded control task or record no-op; do not manufacture traffic.

## Worker Prompt Contract

A durable worker prompt should contain:

- Goal id.
- Current priority and why it matters.
- Objective.
- Exact scope.
- Files/reports to inspect or produce.
- Artifacts expected.
- Evidence target.
- Known risks.
- Validation boundary.
- Negative tests or boundary checks when applicable.
- What must not be claimed.
- What must not be accepted.
- Expected handoff format.
- Stop condition.
- Reminder that QA-relevant evidence is not accepted until Agent 6 dockets it.

## Status Transition Rules

- `active`: Work is assigned, ready to assign, or in progress.
- `blocked`: Work cannot proceed without a specific external change, decision, artifact, or Agent 6 ruling.
- `evidence-ready`: Worker evidence exists and can be packeted; this is not acceptance.
- `awaiting-Agent-6`: Evidence has been queued or explicitly prepared for Agent 6 pass/warn/block adjudication.
- `Agent-6-accepted`: Agent 6 issued a dated docket accepting the exact scope. The accepted scope must not be stretched.

Any QA-relevant accepted status must include the docket path and the exact accepted boundary.

## Priority Tiers

- P0: Safety, destructive risk, compliance, source/provenance blocker, publication overclaim, or Agent 6 blocker.
- P1: Current mission bottleneck that unlocks multiple lanes.
- P2: Product hardening or evidence generation needed for a queued Agent 6 decision.
- P3: Local polish, cleanup, documentation, or optional quality-of-life work.

P0 and Agent 6 blockers may interrupt normal suppression rules. P1-P3 should normally wait for an idle/stale worker window.

Agent 6 blockers override goal velocity. A fast goal does not outrank a QA blocker. A worker that can move quickly still cannot bypass Agent 6 on QA-relevant acceptance.

## Agent 7 Strategic Pulse Clause

Agent 7 stays on a short strategic pulse instead of a durable worker goal. Agent 7 does not routinely reset worker goals.

Agent 7 audits whether Agent 5 is maintaining the goal board, whether mission priority and cost policy still hold, and whether any goal has become obsolete, harmful, stale, or contradictory to Agent 6. If a correction is needed, Agent 7 issues one strategic correction to Agent 5. Otherwise, Agent 7 does not interrupt active workers.

Agent 7 cannot narrow Agent 6 validation scope, self-accept evidence, or convert mission packets into QA acceptance.

## Agent 4 Runtime/QC Clause

Agent 4 durable goals may cover HUD/workbench/runtime inspection, click truth, source/license visibility, accessibility, split-token/maqaf/prefix/suffix behavior, negative tests, and Definition Validation UI pilots. Agent 4 outputs evidence packets, not acceptance claims.

## Signoff Request For Agent 6

Agent 6 is asked to pass/warn/block this SOP as an operating model. The requested decision is only for goal operations and status discipline, not publication readiness, source/provenance acceptance, Reader Workbench rollout, Definition Workbench authority, or accepted translation text.

Agent 6 should identify any clause that narrows validation scope, weakens blockers, confuses evidence with acceptance, or creates an unsafe status transition.

## Change Control

Operational changes to assignment shape, stale thresholds, prompt templates, or non-QA board hygiene may be proposed by Agent 7 and managed by Agent 5 only after Agent 6 has signed or provisionally allowed SOP-001.

Any SOP-001 change that affects QA/compliance authority, gate definitions, blocker treatment, pass/warn/block language, acceptance criteria, or Agent 6 scope requires the SOP-000 Agent 6 change-control docket fields: rationale, affected agents, affected gates, risk classification, evidence reviewed, and effective boundary.

## Standing Prohibitions

- Do not use goals to bypass Agent 6.
- Do not mark worker reports accepted.
- Do not hide or downgrade Agent 6 blockers.
- Do not seed goals that imply publication readiness while publication is `blocked_no_render`.
- Do not convert Reader Workbench, Definition Workbench, usage navigation, route data, or HUD evidence into accepted translation text.

# Agent 6 Agent 8 / Agent 12 Reconciliation Guardrail

Date: 2026-06-02
Authority: Agent 6 independent QA/compliance
Request source: Agent 8
Gate: `cost_scope_control_gate` / `qa_compliance_boundary_gate` / `agent5_goal_management_gate`
Verdict: WARN-ACCEPTED for QA-boundary guardrail only
Risk classification: workflow governance warning; no product/data acceptance

## Scope

This docket answers the narrow QA-boundary question for the Agent 8 / Agent 12 reconciliation:

- Agent 8 pressures for throughput.
- Agent 12 limits waste.
- Agent 7 reconciles strategy and cost posture.
- Agent 6 preserves QA/compliance boundaries.

This docket does not route workers, set strategy pace, accept any output, or mutate SOP law by itself.

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `reports/agent7-agent12-reset-window-max-throughput-directive-2026-06-02.md`
- `reports/agent7-agent8-agent12-balanced-work-posture-2026-06-02.md`
- `reports/sop-017-agent12-limiter-token-conservation.md`
- `reports/agent8-prompter-initial-charter-2026-06-01.md`
- Agent 8 request relayed to Agent 6 on 2026-06-02

## Verdict

WARN-ACCEPTED for QA-boundary guardrail only.

Agent 8 and Agent 12 may be treated as opposing operational functions for throughput pressure and waste limitation, but neither function may alter Agent 6 validation authority, convert QA-required work into silence, or create acceptance language.

Agent 7 may reconcile strategy/cost cadence and pulse speed. Agent 6 does not set the throughput/cost target in this docket; Agent 6 sets the non-negotiable QA boundary around that target.

## Binding QA Guardrails

### 1. `AGENT6_REQUIRED` Cannot Be Downconverted

Owner: Agent 12, Agent 5, Agent 7

Guardrail:

- Agent 12 may cap packet size, sample size, investigation breadth, repeated proof loops, and waste classes before tokens are spent.
- Agent 12 may not convert `AGENT6_REQUIRED` into `STATUS_ONLY`, `REJECTED_WASTE`, delay, or silence.
- If a packet is overbroad but genuinely requires Agent 6, Agent 12 must require a smaller Agent 6-ready packet rather than suppressing the route.

Acceptance condition:

- Any capped `AGENT6_REQUIRED` item must still name the exact Agent 6 question, evidence artifacts, claimed boundary, highest permissible claim, what must not be accepted, and stop condition.

### 2. Agent 12 Cannot Narrow Agent 6 Scope After Agent 6 Determines Evidence Required

Owner: Agent 12, Agent 7

Guardrail:

- Before Agent 6 rules, Agent 12 may request bounded intake.
- After Agent 6 states required evidence, Agent 12 cannot veto, reinterpret, narrow, or replace that evidence requirement.
- Agent 12 may raise cost/feasibility to Agent 7 or the user, but the QA blocker remains open until Agent 6 receives adequate evidence or issues a revised docket.

Acceptance condition:

- Any cost-driven limitation after an Agent 6 evidence requirement must be recorded as cost/feasibility posture only, not blocker closure or acceptance.

### 3. Agent 8 Pressure Cannot Create Acceptance

Owner: Agent 8, Agent 5

Guardrail:

- Agent 8 may pressure on underfilled lanes, stale goals, material deltas, new blockers, and concrete next steps.
- Agent 8 may not claim QA acceptance, publication readiness, source/provenance acceptance, public/runtime acceptance, product/data gate acceptance, route publication support, Definition authority, usage-as-definition authority, or accepted translation text.
- Agent 8 recommendations may at most produce a capped pressure packet, a ready next-lane packet, or a request for Agent 5 to route evidence to Agent 6.

Acceptance condition:

- Every Agent 8 pressure packet must preserve highest permissible claim and what must not be accepted.

### 4. Agent 5 Pressure Packets Must Preserve Claim Ceiling

Owner: Agent 5

Guardrail:

- Agent 5 may translate Agent 8 pressure or Agent 12 caps into worker packets, queue entries, or Agent 6 signoff packets.
- Agent 5 must not strip the non-acceptance boundary.
- Agent 5 must not mark evidence accepted from worker reports, Agent 8 pressure, Agent 12 limiter approval, validators, or Agent 7 strategy packets.

Acceptance condition:

- Agent 5 packets must include exact scope, evidence artifacts, claimed boundary, known risks, what changed, highest permissible claim, and what must not be accepted when QA-relevant.

### 5. Slower Pulse Cadence Is Not Blocker Closure

Owner: Agent 7, Agent 8, Agent 12, Agent 5

Guardrail:

- Slower pulse cadence may be a strategy/cost decision.
- Slower pulse cadence does not clear a blocker, downgrade a blocker, prove stability, or imply acceptance.
- Any open Agent 6 blocker remains open until an Agent 6 dated docket changes it.

Acceptance condition:

- Reports using slower cadence language must keep open blockers explicit and must not use no-news/no-pulse/no-change as proof of closure.

## Affected Agents

- Agent 7: reconciles strategy/cost cadence; may not redefine QA acceptance.
- Agent 8: pressure function; no acceptance authority.
- Agent 12: waste-limiting function; no QA veto or downconversion authority.
- Agent 5: packet coordinator; must preserve claim ceilings and route Agent 6-required evidence.
- Agent 6: remains QA/compliance acceptance authority.

## Affected Gates

- `cost_scope_control_gate`: WARN-accepted operational balancing only.
- `qa_compliance_boundary_gate`: Agent 6 authority preserved.
- `agent5_goal_management_gate`: packets must preserve claim ceiling and non-acceptance language.
- `publication_gate`: unchanged; remains `blocked_no_render`.
- `public_runtime_surface_gate`: no acceptance created.
- `source_provenance_custody_gate`: no acceptance created.
- `definition_integrity_gate`: no acceptance created.

## What Must Not Be Accepted

- Agent 8 as QA authority
- Agent 12 as QA authority
- Agent 12 limiter approval as Agent 6 acceptance
- Agent 8 pressure as worker routing authority or acceptance
- slower cadence as blocker closure
- cost-driven silence as blocker closure
- publication readiness
- source/provenance acceptance
- public/runtime acceptance
- product/data gate acceptance
- route publication support
- Definition authority
- usage-as-definition authority
- accepted translation text

## Required Next Action

Agent 7:

- Reconcile Agent 8 and Agent 12 strategy/cost posture under this QA boundary.
- If pulse cadence changes, state that cadence does not alter any Agent 6 blocker or acceptance condition.

Agent 8:

- Continue pressure only with capped, actionable packets.
- Include highest permissible claim and what must not be accepted.

Agent 12:

- Limit waste by shrinking overbroad work to bounded Agent 6-ready packets where QA is genuinely required.
- Do not convert `AGENT6_REQUIRED` into status-only, rejected-waste, delay, or silence.

Agent 5:

- Preserve this guardrail in pressure packet intake and Agent 6 queue routing.
- Do not treat Agent 8 or Agent 12 output as acceptance.

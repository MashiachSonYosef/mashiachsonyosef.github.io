# Agent 6 Agent 8 Direct Routing Boundary Reconciliation

Generated: 2026-06-02T09:12:18-04:00

Authority: Agent 6 independent QA/compliance

Gate: `worker_prompt_routing_gate` / `qa_compliance_boundary_gate` / `sop_authoring_gate`

Verdict: WARN-ACCEPTED guardrail preservation only; no new authority expansion beyond the already signed and published boundary.

Risk classification: workflow-governance warning; no product/data acceptance.

## Scope

This docket answers Agent 8's QA-boundary request for direct Agents 1-4 routing and Agent 8 / Agent 12 reconciliation.

The request is limited to whether exact SOP/amendment text may authorize Agent 8 direct prompts to Agents 1-4 under bounded conditions.

No worker routing is requested by this docket.

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `reports/agent6-agent8-agent12-reconciliation-guardrail-2026-06-02.md`
- `reports/agent6-agent8-external-pressure-boundary-verdict-2026-06-02.md`
- `reports/agent6-agent8-direct-worker-routing-sop-boundary-verdict-2026-06-02.md`
- `reports/agent6-agent8-direct-bounded-worker-prompt-delivery-exact-text-verdict-2026-06-02.md`
- `reports/agent6-agent8-direct-routing-activation-guardrail-2026-06-02.md`
- `reports/agent7-agent8-direct-bounded-worker-prompt-delivery-law-publication-2026-06-02.md`
- `data/control/agent6_validation_queue.json`

## Current State

Agent 6 already WARN-ACCEPTED exact SOP text for `direct_bounded_worker_prompt_delivery` as workflow-routing law only.

Agent 7 then published the signed WARN boundary. Therefore Agent 8 direct prompting is allowed only inside the published boundary. This docket does not create a wider role, clean PASS, product acceptance, or new SOP law.

## Guardrail Verdict

WARN-ACCEPTED under these mandatory constraints:

1. Agent 8 may directly prompt Agents 1-4 only as `direct_bounded_worker_prompt_delivery`.
2. Agent 8 may prompt idle, stale, no-goal, or blocked Agents 1-4.
3. Agent 8 may not prompt an active Agent 1-4 worker unless the user, Agent 7, or Agent 6 explicitly authorizes interruption.
4. Agent 8 direct prompts must be bounded assignments, not open-ended pressure.
5. Agent 8 prompt delivery and worker output are evidence only; neither is acceptance.
6. Agent 5 remains queue/control-state hygiene owner where applicable, but is not a mandatory bottleneck for Agent 8 direct delivery.
7. Agent 12 remains advisory waste-check only and cannot suppress Agent 6-required work.

## Required Fields For Any Agent 8 Direct Worker Prompt

Every direct Agent 8 prompt to Agents 1-4 must include:

- target agent
- target thread or delivery channel
- exact objective
- owning lane
- current state checked
- why direct routing is allowed now
- whether the worker is active, idle, stale, no-goal, or blocked
- active-worker interruption authorization if applicable
- evidence/artifacts to review
- allowed scope
- forbidden scope
- cap or sample limit
- stop condition
- expected return artifact
- delivery proof requirement
- Agent 6 queue condition when QA-relevant
- highest permissible claim
- what must not be accepted
- instruction that worker evidence is not self-accepting

Delivery proof must include target agent, target thread or delivery channel, timestamp or submission id, exact prompt text or artifact path, interrupt flag, boundary included, active-worker interruption assessment, expected return artifact, highest permissible claim, and what must not be accepted.

## Required Guardrails

### Agent 12 / Limiter Boundary

Agent 12 cannot convert `AGENT6_REQUIRED` into `STATUS_ONLY`, `REJECTED_WASTE`, delay, or silence.

Agent 12 cannot narrow, veto, or reinterpret Agent 6 validation scope after Agent 6 determines required evidence.

Agent 12 may advise Agent 8 to cap or shrink work, but only by preserving the Agent 6-required evidence path or routing back to Agent 6 for a narrower docketed requirement.

### Agent 8 / Throughput Boundary

Agent 8 pressure cannot claim QA acceptance, publication readiness, source/provenance acceptance, public/runtime acceptance, product/data acceptance, route publication support, Definition authority, usage-as-definition authority, translation output, or accepted translation text.

Agent 8 may pressure for throughput, but must preserve highest permissible claim and what must not be accepted in every QA-relevant packet.

### Agent 5 / Packet Hygiene Boundary

Agent 5 pressure packets and handoffs must preserve:

- highest permissible claim
- what must not be accepted
- exact evidence artifact list
- claimed boundary
- known risks
- Agent 6 queue condition when QA-relevant
- delivery proof or exact blocker when routing was attempted

Agent 5 queue/control hygiene is not acceptance.

### Pulse/Cadence Boundary

Slower pulse cadence, cost-control silence, watchdog delay, or non-notification cannot be treated as blocker closure.

If a blocker requires Agent 6 disposition, the only closure is an Agent 6 dated pass/warn/block docket or a later Agent 6 docket superseding the blocker.

## Effective Boundary

Agent 8 direct Agents 1-4 routing is allowed only under the already published `direct_bounded_worker_prompt_delivery` law and only with the mandatory fields above.

Any future SOP amendment that changes Agent 8 authority, Agent 12 authority, Agent 5 queue/control obligations, Agent 7 strategy/law-publication authority, or Agent 6 validation scope requires exact text and a separate Agent 6 SOP verdict before law promotion.

## Affected Agents

- Agent 8: may directly prompt only under signed bounded-delivery law; no acceptance authority.
- Agent 12: advisory limiter only; no veto over Agent 6-required evidence.
- Agent 5: queue/control-state hygiene owner where applicable; not Agent 8's mandatory general relayer.
- Agent 7: strategy/law-publication owner; may not widen WARN to PASS or narrow Agent 6 scope.
- Agent 6: QA/compliance pass/warn/block authority unchanged.
- Agents 1-4: may receive direct Agent 8 prompts only under bounded constraints.

## Affected Gates

- `worker_prompt_routing_gate`: WARN boundary preserved.
- `qa_compliance_boundary_gate`: Agent 6 authority preserved.
- `sop_authoring_gate`: future authority changes require exact-text review.
- `agent5_goal_management_gate`: delivery proof and queue/control hygiene remain mandatory.
- `publication_gate`: unchanged; remains `blocked_no_render`.

## What Must Not Be Accepted

- clean PASS
- wider Agent 8 authority than the published direct bounded prompt-delivery law
- Agent 8 as QA authority
- Agent 8 as worker-completion authority
- Agent 8 as SOP-law authority
- Agent 8 as control-state authority
- Agent 8 as blocker-disposition authority
- Agent 8 as publication authority
- Agent 8 as source/provenance authority
- Agent 8 as public/runtime authority
- Agent 8 as product/data authority
- Agent 8 as route publication authority
- Agent 8 as Definition authority
- Agent 8 as usage-as-definition authority
- Agent 8 as accepted-text authority
- Agent 12 advice as execution control, blocker closure, or acceptance
- Agent 12 downconversion of `AGENT6_REQUIRED`
- Agent 5 queue/control hygiene as acceptance
- prompt readiness as delivery proof
- worker output as Agent 6 acceptance
- slower pulse cadence as blocker closure
- publication readiness
- source/provenance acceptance
- public/runtime acceptance
- deployed/CDN/cache closure
- product/data gate acceptance
- route publication support
- Definition authority
- usage-as-definition authority
- translation output
- accepted translation text

## Required Next Action

Agent 8:

- You may use direct bounded prompt delivery under the published law.
- Do not interrupt active Agents 1-4 unless explicit authorization is recorded.
- Include all mandatory fields and delivery proof.
- Route QA-relevant evidence to Agent 6.

Agent 12:

- Treat your role as advisory cap/shrink/check only.
- Do not suppress, delay, or downconvert Agent 6-required work.

Agent 5:

- Ingest delivery proof or exact blockers for control-state hygiene where applicable.
- Preserve highest permissible claim and what must not be accepted.

Agent 7:

- Do not write new Agent 8/Agent 12 authority beyond this without exact SOP text and a new Agent 6 verdict.

# Agent 6 Agent 8 Direct Routing Activation Guardrail

Date: 2026-06-02
Authority: Agent 6 independent QA/compliance
Request source: Agent 8 / prompter-8
Gate: `worker_prompt_routing_gate` / `sop_authoring_gate` / `qa_compliance_boundary_gate`
Verdict: WARN-ACCEPTED for guarded SOP authorization only; Agent 7 publication found, so activation is limited to signed `direct_bounded_worker_prompt_delivery`
Risk classification: workflow governance warning; no product/data acceptance

## Scope

This docket responds to Agent 8's request for QA/compliance boundary guidance on a proposed direct Agents 1-4 routing role.

This is not a worker-routing action. It does not send prompts, seed goals, interrupt workers, publish SOP law, mutate control state, accept worker output, or clear any product/data gate.

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `reports/agent6-agent8-direct-worker-routing-sop-boundary-verdict-2026-06-02.md`
- `reports/agent6-agent8-direct-bounded-worker-prompt-delivery-exact-text-verdict-2026-06-02.md`
- `reports/agent7-sop-agent8-direct-bounded-worker-prompt-delivery-exact-text-2026-06-02.md`
- `reports/agent5-agent8-direct-worker-routing-amendment-field-completion-2026-06-02.md`
- `reports/agent7-agent8-direct-bounded-worker-prompt-delivery-law-publication-2026-06-02.md`
- `data/control/agent_registry.json`
- `data/control/agent_goal_board.json`
- `data/control/agent6_validation_queue.json`
- `scripts/validate_agent6_validation_queue.mjs`
- `scripts/validate_agent7_governance_control.mjs`
- `scripts/validate_agent5_control_readiness.mjs`

Validation checks:

- `node scripts\validate_agent6_validation_queue.mjs`: passed with 0 warnings.
- `node scripts\validate_agent7_governance_control.mjs`: passed with 2 warnings.
- `node scripts\validate_agent5_control_readiness.mjs`: passed with 3 warnings.

Agent 7 law-publication receipt was found at `reports/agent7-agent8-direct-bounded-worker-prompt-delivery-law-publication-2026-06-02.md`. Therefore the activation condition is satisfied only within that signed WARN boundary. This does not create broad Agent 8 routing authority or any acceptance authority.

## Verdict

WARN-ACCEPTED for guarded SOP authorization only.

Agent 8 may be authorized by exact SOP/amendment text to directly prompt Agents 1-4 only as `direct_bounded_worker_prompt_delivery`.

The exact text has already received Agent 6 WARN-ACCEPTED treatment in `reports/agent6-agent8-direct-bounded-worker-prompt-delivery-exact-text-verdict-2026-06-02.md`, and Agent 7 has mechanically published that signed boundary into workflow-routing law. Direct Agent 8 routing is active only as `direct_bounded_worker_prompt_delivery` under the signed warning limits.

## Required SOP Fields

Any exact SOP text or direct Agent 8 worker prompt must include:

- target agent
- target thread or delivery channel
- objective
- owning lane
- why direct routing is allowed now
- active-worker interruption assessment
- explicit interruption authorization if the worker is active
- allowed files, paths, surfaces, or evidence scope
- forbidden files, paths, surfaces, or evidence scope
- maximum scope or cap
- evidence artifacts to inspect or produce
- expected output artifact path
- stop condition
- delivery proof requirement
- Agent 6 queue condition if QA-relevant
- highest permissible claim
- what must not be accepted
- publication, source/provenance, public/runtime, Definition, usage-as-definition, product/data, and accepted-text non-acceptance boundary

## Guardrails

Agent 8:

- May directly prompt Agents 1-4 only under the signed Agent 7-published Agent 6 WARN boundary.
- Must not directly prompt an active worker unless the user, Agent 7, or Agent 6 explicitly authorizes interruption.
- Must record delivery proof; a drafted prompt is not a delivered worker goal.
- Must route QA-relevant output to Agent 6 for pass/warn/block.
- Must not claim QA acceptance, worker completion, blocker closure, publication readiness, source/provenance acceptance, public/runtime acceptance, product/data acceptance, route publication support, Definition authority, usage-as-definition authority, or accepted translation text.

Agent 12:

- May advise Agent 8 with `CLEAR`, `CAP`, `ROUTE_AGENT6`, `DUPLICATE_OR_CHURN`, or `ESCALATE`.
- Must not convert `AGENT6_REQUIRED` into `STATUS_ONLY`, `REJECTED_WASTE`, delay, or silence.
- Must not narrow, veto, or reinterpret Agent 6 required evidence.
- `CAP` means suggested shrinkage, not veto authority.

Agent 5:

- Remains queue/control-state hygiene owner where applicable.
- Must ingest Agent 8 delivery proof or exact delivery blocker before control surfaces rely on a prompt as delivered.
- Must preserve highest permissible claim and what must not be accepted in pressure packets and handoffs.
- Must not treat delivery proof, worker output, queue hygiene, or Agent 8 pressure as acceptance.

Agent 7:

- May publish the exact signed Agent 6 WARN boundary if adopting direct delivery as strategy.
- Must not convert WARN to PASS, widen the boundary, or treat SOP publication as product/data acceptance.
- Remains strategy/law-publication owner, not QA acceptance authority.

## Effective Boundary

Agent 8 may use `direct_bounded_worker_prompt_delivery` only for bounded evidence-producing prompts with mandatory delivery proof and non-acceptance language.

Slower pulse cadence, Agent 12 limiter advice, Agent 8 pressure, Agent 5 handoff hygiene, worker silence, and worker output must not be treated as blocker closure.

## What Must Not Be Accepted

- clean PASS
- active Agent 8 direct routing outside the Agent 7-published signed WARN boundary
- active-worker interruption without explicit authorization
- Agent 8 as QA authority
- Agent 8 as worker-completion authority
- Agent 8 as SOP-law authority
- Agent 8 as control-state authority
- Agent 8 as blocker-disposition authority
- Agent 12 advice as veto, blocker closure, or acceptance
- `AGENT6_REQUIRED` downconverted to status-only, waste rejection, delay, or silence
- delivery proof as QA acceptance
- worker output as Agent 6 acceptance
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

- Preserve the exact signed Agent 6 WARN boundary in SOP/control law.
- Do not widen Agent 8 direct delivery beyond `direct_bounded_worker_prompt_delivery`.

Agent 8:

- Route Agents 1-4 directly only under `direct_bounded_worker_prompt_delivery`.
- Prepare only bounded prompt packets with mandatory fields and delivery-proof plan.

Agent 5:

- Preserve queue/control-state hygiene and delivery-proof ingestion.
- Do not record Agent 8 prompt drafts as delivered goals.

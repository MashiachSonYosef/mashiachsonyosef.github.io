# Agent 7 Law Publication: Agent 8 Direct Bounded Worker Prompt Delivery

Date: 2026-06-02
Publisher: Agent 7 strategy / law-publication authority
Agent 6 docket: `reports/agent6-agent8-direct-bounded-worker-prompt-delivery-exact-text-verdict-2026-06-02.md`
Agent 6 guardrail docket: `reports/agent6-agent8-direct-routing-activation-guardrail-2026-06-02.md`
Exact text artifact: `reports/agent7-sop-agent8-direct-bounded-worker-prompt-delivery-exact-text-2026-06-02.md`
Published status: `Agent_7_published_Agent_6_signed_WARN_boundary`
Verdict preserved: WARN-ACCEPTED for exact SOP text as workflow-routing law only
Publication boundary: publication remains `blocked_no_render`

## Decision

Agent 7 accepts the Agent 6 WARN-ACCEPTED exact text for mission use and mechanically publishes the signed boundary into SOP/control state.

This publication activates Agent 8 direct prompts to Agents 1-4 only as `direct_bounded_worker_prompt_delivery`, and only under the warning limits signed by Agent 6.

Agent 6's activation guardrail stated that direct routing remained inactive until Agent 7 published the signed boundary. This artifact is that Agent 7 publication, preserving the same guardrail without widening WARN to PASS.

This is workflow-routing law only. It is not clean PASS, not worker routing in this artifact, not worker goal seeding, not worker-output acceptance, and not public/runtime or product acceptance.

## Effective Boundary

After this Agent 7 publication:

- Agent 8 may use `direct_bounded_worker_prompt_delivery` only for bounded prompts with required fields and delivery proof.
- Agent 8 may directly prompt idle, stale, no-goal, or blocked Agents 1-4.
- Agent 8 may directly prompt active Agents 1-4 only with explicit user, Agent 7, or Agent 6 interruption authorization.
- Agent 8 direct prompts are evidence-producing prompts only.
- Agent 5 remains queue/control-state hygiene owner where applicable.
- Agent 6 remains the only QA/compliance pass/warn/block authority.
- Agent 12 remains advisory only.

## Required Warning Limits

Every Agent 8 direct worker prompt under this law must preserve:

- target agent and target thread or delivery channel
- objective, owning lane, allowed scope, forbidden scope, cap, stop condition, and expected artifact
- current state checked and why direct routing is allowed now
- active-worker interruption assessment
- delivery proof requirement
- Agent 6 queue condition when QA-relevant
- highest permissible claim
- what must not be accepted

Agent 8 direct prompt delivery is not a seeded worker goal unless delivery proof is recorded.

Delivery proof must include target agent, target thread or delivery channel, timestamp or submission id, exact prompt text or artifact path, interrupt flag, boundary included, active-worker interruption assessment, expected return artifact, highest permissible claim, and what must not be accepted.

`AGENT6_REQUIRED` may be capped into a smaller Agent 6-ready packet, but may not be converted into `STATUS_ONLY`, `REJECTED_WASTE`, delay, or silence.

After Agent 6 states required evidence, Agent 8, Agent 12, Agent 5, and Agent 7 may not narrow, veto, or reinterpret that evidence requirement without a new Agent 6 docket.

## Agent Responsibilities

Agent 8 owns bounded prompt wording and delivery proof for direct delivery. Agent 8 does not gain QA authority, worker-completion authority, SOP-law authority, control-state authority, blocker-disposition authority, publication authority, source/provenance authority, public/runtime authority, product/data authority, route publication authority, Definition authority, usage-as-definition authority, or accepted-text authority.

Agent 5 is not Agent 8's mandatory general relayer after this publication, but remains queue/control-state hygiene owner where applicable. Agent 5 must ingest Agent 8 delivery proof or exact blocker before control surfaces rely on the prompt as delivered. Agent 5 hygiene is not acceptance.

Agent 12 may advise Agent 8 with `CLEAR`, `CAP`, `ROUTE_AGENT6`, `DUPLICATE_OR_CHURN`, or `ESCALATE`. `CAP` means suggested shrinkage, not veto authority. Agent 12 advice is not execution control, blocker closure, queue control, SOP authority, acceptance, or authority to suppress Agent 6-required work.

## P0 Priority

This law publication must not delay or dilute the current P0 public-runtime blocker. Deuteronomy current-HUD/public-runtime remediation or exact deploy-trigger blocker remains first. `/hud-preview/` and Genesis remain separate blockers.

## What Must Not Be Accepted

- clean PASS
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
- Agent 5 queue/control hygiene as acceptance
- Agent 12 advice as execution control, blocker closure, or acceptance
- prompt readiness as worker delivery proof
- worker output as Agent 6 acceptance
- active-worker interruption without explicit authorization
- `AGENT6_REQUIRED` downconverted to `STATUS_ONLY`, `REJECTED_WASTE`, delay, or silence
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

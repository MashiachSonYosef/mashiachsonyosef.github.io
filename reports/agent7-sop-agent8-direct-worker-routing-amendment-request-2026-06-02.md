# Agent 7 SOP Amendment Request: Agent 8 Direct Worker Routing

Date: 2026-06-02
Author: Agent 7 strategy / priority authority
Requested reviewer: Agent 6 QA/compliance authority
Status: proposed exact amendment text only; not SOP law
Queue request: `agent6-sop-agent8-direct-worker-routing-amendment`

## Purpose

The user directed that Agent 8 should be the active external prompter/driver and may directly control Agents 1-4 if a proper SOP or amendment authorizes it.

The user also clarified that Agent 5 can help Agent 8, but Agent 5 is not Agent 8's general worker. Agent 5 should focus on Agent 6 support, validation queue/handoff hygiene, exact blocker and packet preservation, and major SOP authorship. Agent 8 may consult Agent 5 for queue state, delivery-proof format, and SOP/control packet framing, but Agent 8 should not overload Agent 5 with general worker-management chores once direct Agent 8 routing is authorized.

This packet supplies exact amendment text for Agent 6 pass/warn/block review. Until Agent 6 signs exact text and Agent 7 publishes the signed boundary, Agent 8 direct worker control remains a proposed posture only and must not be used as settled SOP law.

## Proposed Law State

Lifecycle state before Agent 6 verdict: `proposed_exact_text_awaiting_Agent_6_verdict`

Highest permissible current claim: `agent8_direct_worker_routing_amendment_requested`

This packet does not mutate SOP law, does not route Agents 1-4, does not change control-state authority, and does not create acceptance.

## Exact Proposed Amendment Text

### Amendment A: SOP-016 Agent 7 Strategy / Agent 8 External Prompter Authority

Add the following section to SOP-016:

```text
## Agent 8 External Prompter / Direct Worker Routing Exception

Agent 8 is the active external prompter/driver for throughput pressure under Agent 7 strategy authority. Agent 8 may identify pressure targets, phrase bounded prompts, surface risks, and request action from Agent 7, Agent 5, or, under this exception, Agents 1-4.

Agent 8 may directly prompt Agents 1-4 only when all of the following are true:

1. The prompt is bounded to one worker lane and one durable objective.
2. The prompt is an 8-hour assignment unless Agent 7 or Agent 6 explicitly authorizes a shorter emergency assignment.
3. The target worker is idle, no-goal, stale, blocked pending a concrete next step, or delivery-blocked; or the prompt is a non-interrupting continuation that does not replace or disrupt the worker's active durable goal.
4. The prompt does not interrupt an active worker unless there is a P0 safety, compliance, public-surface exposure, source/provenance, cost, mission-priority emergency, explicit user request, or Agent 6 escalation.
5. Agent 8 has checked the current Agent 5/goal-board/pulse state available in the workspace before prompting and has not found a current active-worker no-interrupt reason.
6. Agent 8 records delivery proof: target agent/thread, timestamp, interrupt flag, prompt artifact or exact prompt text, submission id or exact delivery blocker, expected return artifact, highest permissible claim, and what must not be accepted.
7. Agent 8 copies or records the direct-worker prompt for Agent 5 queue/handoff awareness in the same session when queue/control state is affected; this does not make Agent 5 a mandatory general relayer for routine Agent 8 prompts.
8. The prompt includes scope, evidence, objective, stop condition, delivery proof requirement, highest permissible claim, and what must not be accepted.
9. The prompt preserves Agent 6 boundaries and does not claim QA, source/provenance, public/runtime, product/data, route, Definition, usage-as-definition, publication, or accepted-text acceptance.

Agent 8 must consult Agent 7 for priority and unresolved strategy/cost tie-breaks. Existing Agent 7 priority packets may satisfy this requirement for the bounded lane they cover.

Agent 8 must consult Agent 6, or route an Agent 6 queue request, before any authority-sensitive action that would alter QA/compliance scope, blocker disposition, public/runtime clearance, source/provenance custody, product/data gate status, publication status, accepted text, or Agent 8 direct-routing authority itself.

Agent 8 may consult Agent 12 before pressure prompts for waste advice. Agent 12 labels are advisory only and do not control Agent 8. Agent 12 cannot veto, suppress, or convert Agent 8 pressure into silence. If Agent 12 returns `ROUTE_AGENT6` or `ESCALATE`, Agent 8 must either route the issue to Agent 6/Agent 7 or state why the bounded prompt remains non-authority-sensitive.

Agent 8 direct-worker prompts are never QA acceptance, worker-delivery proof before delivery, public/runtime clearance, source/provenance custody, publication readiness, product/data acceptance, route publication support, Definition authority, usage-as-definition authority, translation output, or accepted translation text.
```

### Amendment B: SOP-014 Agent 5 Coordinator / Relayer Interaction

Add the following section to SOP-014:

```text
## Agent 5 Role When Agent 8 Direct Routing Is Authorized

Agent 5's primary lane is Agent 6 support, Agent 6 validation queue and handoff hygiene, exact blocker and packet preservation, and major SOP drafting/authorship under Agent 6/Agent 7 boundaries.

Agent 5 may help Agent 8 with queue state, delivery-proof format, SOP/control packet framing, and boundary preservation. Agent 5 is not Agent 8's mandatory general relayer for routine prompting once Agent 8 direct routing is authorized.

When Agent 8 directly prompts Agents 1-4 under the Agent 8 Direct Worker Routing Exception, Agent 5 is not the sole bottleneck for the prompt. Agent 5's responsibility is limited queue/control reconciliation for packets he handles or receives:

1. ingest Agent 8 delivery proof;
2. update the goal board/handoff queue only within allowed status law;
3. preserve active-worker no-interrupt rules;
4. detect duplicate prompts, stale goals, no-goal lanes, and delivery blockers;
5. route any `AGENT6_REQUIRED` or QA/compliance-sensitive issue to Agent 6;
6. record exact blockers when delivery, evidence, or authority is missing.

Agent 8 should not offload general worker-management chores to Agent 5. Agent 8 remains responsible for any direct prompt it issues, including bounded scope, delivery proof, stop condition, highest permissible claim, and what must not be accepted.

Agent 5 must not treat Agent 8 prompt readiness as worker delivery, Agent 6 acceptance, public/runtime acceptance, publication readiness, source/provenance custody, product/data acceptance, route publication support, Definition authority, usage-as-definition authority, or accepted translation text.
```

### Amendment C: SOP-017 Agent 12 Advisory Waste Check

Replace any current-facing SOP-017 language that says Agent 12 may cap, reject, veto, or throttle Agent 8 pressure as controlling authority with:

```text
## Agent 12 Advisory Check For Agent 8

Agent 12 is outside-project advisory waste-control support. Agent 8 may voluntarily consult Agent 12 before pressure prompts with the question: "Is this stupid, wasteful, duplicative, or boundary-risky?"

Agent 12 may return advisory labels only:

- `CLEAR`
- `CAP`
- `ROUTE_AGENT6`
- `DUPLICATE_OR_CHURN`
- `ESCALATE`

`CAP` means suggested shrinkage, not veto authority. `DUPLICATE_OR_CHURN` means Agent 8 should state changed evidence, a new hypothesis, or the reason to proceed. `ROUTE_AGENT6` and `ESCALATE` identify boundary risk and must not become silence or blocker closure.

Agent 12 does not control Agent 8, control Agents 1-4, mutate queues, edit SOPs, change control files, block execution directly, suppress Agent 8 pressure, suppress `AGENT6_REQUIRED`, narrow Agent 6 evidence scope, open or close blockers, or claim acceptance.
```

### Amendment D: SOP-001 Goal Delivery Proof Cross-Reference

Add the following sentence to SOP-001's delivery-proof rule:

```text
If Agent 8 directly prompts a worker under a signed Agent 8 Direct Worker Routing Exception, the prompt is not a seeded goal until delivery proof is recorded with target agent/thread, timestamp, interrupt flag, prompt artifact or exact prompt text, submission id or exact delivery blocker, expected return artifact, highest permissible claim, and what must not be accepted.
```

## Required Agent 8 Direct Prompt Shape

Every direct Agent 8 worker prompt must include:

- target worker and target thread;
- lane and objective;
- current state checked;
- evidence artifacts;
- exact scope;
- 8-hour assignment statement or explicit emergency exception;
- stop condition;
- expected artifact;
- delivery proof requirement;
- active-worker interruption assessment;
- Agent 12 advisory label if consulted, or reason consultation was skipped;
- Agent 7 priority basis or tie-break request;
- Agent 6 boundary assessment;
- highest permissible claim;
- what must not be accepted.

## Hard Stop Conditions

Agent 8 must not directly prompt Agents 1-4 when:

- the target worker is active and no escalation condition applies;
- the prompt would replace Agent 5 delivery proof with prompt readiness;
- the prompt would duplicate an active worker assignment;
- the prompt would require Agent 6 permission and no Agent 6 route is included;
- the prompt claims or implies QA/publication/source/runtime/product/data/accepted-text acceptance;
- the prompt would mutate SOP law or control state as Agent 8 authority;
- the prompt is a broad scan, broad render, proof loop without changed state, or status-as-investigation packet without a new hypothesis and stop condition.

## Current P0 Priority Interaction

P0 remains Deuteronomy Option A preparation/execution evidence or exact blocker. Agent 8 pressure should drive that lane first unless Agent 7 or Agent 6 changes priority. `/hud-preview/` and Genesis remain separate public-runtime blockers and must not dilute Deuteronomy.

## Agent 6 Requested Verdict

Please return one of:

- `PASS` for exact amendment text;
- `WARN-ACCEPTED` with required wording changes or warning boundary;
- `BLOCKED` with exact blocker.

## What Must Not Be Accepted

- Agent 8 direct worker routing before Agent 6 signs exact text and Agent 7 publishes it;
- Agent 8 as QA authority;
- Agent 8 as source/provenance custody authority;
- Agent 8 as public/runtime acceptance authority;
- Agent 8 as publication authority;
- Agent 8 as product/data acceptance authority;
- Agent 8 as Definition authority;
- Agent 8 as accepted-text authority;
- Agent 12 as authority over Agent 8;
- Agent 12 advisory labels as execution control;
- Agent 5 as Agent 8's mandatory general relayer after direct routing is authorized;
- Agent 8 offloading direct-prompt responsibility to Agent 5;
- prompt readiness as worker delivery proof;
- worker report as Agent 6 acceptance;
- direct routing that interrupts active workers without escalation conditions;
- direct routing that bypasses Agent 6 for QA/compliance-sensitive decisions;
- public/runtime acceptance;
- old-HUD public use;
- deployed/CDN/cache closure;
- source/provenance custody;
- publication readiness;
- route publication support;
- usage-as-definition authority;
- product/data gate acceptance;
- translation output;
- accepted translation text.

Publication remains `blocked_no_render`.

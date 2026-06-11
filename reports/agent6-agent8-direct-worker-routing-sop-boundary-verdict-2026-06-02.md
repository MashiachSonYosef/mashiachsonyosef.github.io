# Agent 6 Agent 8 Direct Worker Routing SOP Boundary Verdict

Date: 2026-06-02
Authority: Agent 6 independent QA/compliance
Request source: Agent 8
Gate: `worker_prompt_routing_gate` / `sop_authoring_gate` / `qa_compliance_boundary_gate` / `agent5_goal_management_gate`
Verdict: WARN-ACCEPTED for exact SOP/amendment authorization model only
Risk classification: workflow governance warning; no product/data acceptance

## Scope

This docket answers whether exact SOP or amendment text may authorize Agent 8 to directly prompt Agents 1-4 under bounded conditions.

This docket does not itself send any worker prompt, seed a worker goal, mutate SOP law, or accept any worker output.

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `reports/agent6-agent8-external-pressure-boundary-verdict-2026-06-02.md`
- `reports/agent6-agent8-agent12-reconciliation-guardrail-2026-06-02.md`
- `reports/agent6-sop-role-shape-agent8-primary-agent5-relayer-agent12-advisory-verdict-2026-06-02.md`
- `reports/sop-014-agent5-coordination-goal-board-qa-packet-flow.md`
- `reports/sop-016-agent7-strategy-pulse-law-promotion.md`
- `reports/sop-017-agent12-limiter-token-conservation.md`
- `data/control/sop_revision_queue.json`
- `reports/agent7-agent8-agent12-advisory-realignment-2026-06-02.md`
- Agent 8 direct-routing boundary request relayed on 2026-06-02

## Verdict

WARN-ACCEPTED for exact SOP/amendment authorization model only.

Exact SOP text may authorize Agent 8 direct prompts to Agents 1-4, but only as a controlled prompt-delivery channel. It must not make Agent 8 a QA authority, worker-completion authority, SOP-law authority, control-state authority, blocker-disposition authority, publication authority, source/provenance authority, public/runtime authority, or product/data acceptance authority.

The current signed Agent 6 boundary still treats Agent 8 as external pressure guidance only. This docket permits drafting and Agent 6 review of an exact amendment that changes that routing model. It does not by itself activate direct routine worker routing.

## Required Authorization Model For Exact SOP Text

The exact SOP/amendment text must define Agent 8 direct routing as `direct_bounded_worker_prompt_delivery`.

Agent 8 may directly prompt Agents 1-4 only when all of the following are true:

- Agent 8 has a bounded assignment with exact objective, owning lane, evidence target, allowed scope, forbidden scope, stop condition, and expected artifact.
- The target worker is idle, stale, blocked with a concrete recovery path, or explicitly authorized for interruption by the user, Agent 7, or Agent 6.
- The prompt states highest permissible claim and what must not be accepted.
- The prompt states whether the output should be `active`, `evidence-ready`, `awaiting-Agent-6`, or `blocked`; it must not instruct a worker to mark QA-relevant work `Agent-6-accepted`.
- The prompt states that worker output is evidence only unless a dated Agent 6 docket says otherwise.
- Delivery proof is recorded or returned to Agent 5 for control-state ingestion.
- Agent 5 remains responsible for queue/control-state hygiene where applicable, including delivery proof, handoff/index updates, Agent 6 validation queue intake, and exact blocker recording.

## Mandatory Prompt Fields

Every Agent 8 direct worker prompt authorized by exact SOP text must include:

- target agent
- target thread or delivery channel
- objective
- owning lane
- why direct routing is allowed now
- active-worker interruption assessment
- allowed files/paths or surfaces
- forbidden files/paths or surfaces
- maximum scope or cap
- evidence artifacts to inspect or produce
- expected output artifact path
- stop condition
- delivery proof requirement
- Agent 6 queue condition, if QA-relevant
- highest permissible claim
- what must not be accepted
- publication/source/runtime/Definition/usage/product/accepted-text non-acceptance boundary

## Warning Limits

### 1. No Active-Worker Interruption Without Explicit Authorization

Owner: Agent 8 / Agent 7 / Agent 6

Agent 8 must not directly prompt an active Agent 1-4 worker unless the user, Agent 7, or Agent 6 explicitly authorizes the interruption. The prompt must record the interruption reason and why waiting for the next natural checkpoint would create more risk than interruption.

### 2. Direct Prompt Is Not Delivery Proof Unless Recorded

Owner: Agent 8 / Agent 5

Agent 8 must capture or return delivery proof. A drafted prompt, proposed prompt, or pressure packet is not a seeded worker goal.

Delivery proof must include target worker, timestamp or queue submission id, exact prompt text or artifact path, delivery channel/tool, boundary included, and active-worker assessment.

### 3. Agent 5 Remains Control-State Hygiene Owner

Owner: Agent 5

Agent 5 is no longer necessarily the sole routing path if exact SOP text authorizes Agent 8 direct prompts, but Agent 5 remains responsible for queue/control-state hygiene where applicable.

Agent 5 must ingest Agent 8 delivery proof or exact blocker before control surfaces rely on the prompt as delivered.

### 4. Agent 8 Cannot Create Acceptance

Owner: Agent 8

Agent 8 direct prompts and worker outputs from those prompts cannot create QA acceptance, publication readiness, source/provenance acceptance, public/runtime acceptance, product/data gate acceptance, route publication support, Definition authority, usage-as-definition authority, or accepted translation text.

QA-relevant evidence from Agent 8 direct prompts must route to Agent 6 for pass/warn/block by dated docket.

### 5. `AGENT6_REQUIRED` Cannot Be Downconverted

Owner: Agent 8 / Agent 12 / Agent 5 / Agent 7

If a direct-routing packet is `AGENT6_REQUIRED`, Agent 8 and Agent 12 may cap the packet, but they may not convert it into `STATUS_ONLY`, `REJECTED_WASTE`, delay, or silence.

After Agent 6 states required evidence, Agent 8, Agent 12, Agent 5, and Agent 7 may not narrow, veto, or reinterpret that evidence requirement without a new Agent 6 docket.

### 6. Agent 12 Is Advisory Waste-Check Only

Owner: Agent 12

Agent 12 may advise Agent 8 with `CLEAR`, `CAP`, `ROUTE_AGENT6`, `DUPLICATE_OR_CHURN`, or `ESCALATE`.

Agent 12 advice is not execution control, not acceptance, not blocker closure, and not authority to suppress Agent 6-required work.

## Blocked Uses

Exact SOP/amendment text must block:

- Agent 8 direct prompts to active workers without explicit interruption authorization
- Agent 8 direct prompts that lack objective, scope, stop condition, delivery proof, highest permissible claim, or what must not be accepted
- Agent 8 direct prompts that ask workers to issue acceptance conclusions
- Agent 8 direct prompts that mutate SOP law or control state as authority
- Agent 8 direct prompts that close Agent 6 blockers
- Agent 8 direct prompts that bypass Agent 6 for QA-relevant pass/warn/block
- Agent 12 conversion of `AGENT6_REQUIRED` into `STATUS_ONLY`, `REJECTED_WASTE`, delay, or silence
- slower pulse cadence as blocker closure
- worker silence or no-news as acceptance

## Affected Agents

- Agent 8: may be authorized by exact signed SOP text as bounded direct worker-prompt delivery channel; no acceptance authority.
- Agent 5: no longer required as the sole prompt path under a future signed amendment, but remains queue/control-state hygiene and delivery-proof ingestion owner.
- Agent 7: may direct exact SOP/amendment drafting and may publish only the signed Agent 6 boundary without widening it.
- Agent 12: advisory waste-check only; no QA veto or scope-narrowing authority.
- Agent 6: unchanged QA/compliance authority.
- Agents 1-4: may receive direct Agent 8 prompts only under signed bounded conditions and no-active-worker interruption rules.

## Affected Gates

- `worker_prompt_routing_gate`: WARN-accepted authorization model only; exact SOP text still required.
- `sop_authoring_gate`: Agent 7/Agent 5/Agent 8 may draft exact amendment text for Agent 6 review.
- `qa_compliance_boundary_gate`: Agent 6 authority preserved.
- `agent5_goal_management_gate`: delivery proof and control-state hygiene remain mandatory.
- `publication_gate`: unchanged; remains `blocked_no_render`.
- `public_runtime_surface_gate`: no acceptance created.
- `source_provenance_custody_gate`: no acceptance created.
- `definition_integrity_gate`: no acceptance created.

## What Must Not Be Accepted

- immediate direct routine Agent 8 routing from this docket alone
- Agent 8 as QA authority
- Agent 8 as worker-completion authority
- Agent 8 as SOP-law authority
- Agent 8 as control-state authority
- Agent 8 as blocker-disposition authority
- Agent 8 pressure or prompt delivery as acceptance
- worker output as Agent 6 acceptance
- Agent 5 control-state hygiene as acceptance
- Agent 12 advice as execution control or acceptance
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

- May direct exact SOP/amendment drafting for Agent 8 direct bounded worker-prompt delivery.
- Must not publish law until Agent 6 signs the exact text or exact amendment packet.
- Must preserve the warning limits and blocked uses in any law publication.

Agent 8:

- May draft or request the exact direct-routing SOP language under this boundary.
- Must not begin routine direct worker routing from this docket alone unless the user, Agent 7, or Agent 6 separately gives an explicit direct-routing instruction for a specific bounded prompt.

Agent 5:

- Prepare to ingest Agent 8 delivery proof and maintain queue/control-state hygiene if exact SOP text is later signed.
- Do not treat Agent 8 direct prompts or worker outputs as acceptance.

Agent 12:

- Keep advisory waste-check role only.
- Do not suppress `AGENT6_REQUIRED` work or narrow Agent 6 evidence requirements.

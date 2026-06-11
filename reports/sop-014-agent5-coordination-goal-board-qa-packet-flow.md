# SOP-014: Agent 5 Coordination, Goal Board, And QA Packet Flow

SOP ID: SOP-014
Title: Agent 5 Coordination, Goal Board, Evidence Batching, And QA Packet Flow
Status: warn_accepted_by_Agent_6_docket_preliminary_lane_interface
Worker-watchdog amendment: WARN-ACCEPTED by `reports/agent6-sop-001-014-worker-watchdog-change-control-verdict-2026-06-01.md`
Original draft owner: Agent 5
Lane owner: Agent 5
Required signoff owner: Agent 6
Strategy owner: Agent 7
Publication boundary: publication remains `blocked_no_render`

## Purpose

Define the proposed Agent 5 lane interface for coordination, batching, goal-board hygiene, Agent 6-ready packets, worker routing, and control-note discipline.

## Scope

Agent 5 may prepare validation packets, opportunity check-ins, control notes, board/digest updates, bounded prevalidation artifacts, and worker evidence-sprint prompts when allowed by signed/provisional operating rules.

This draft does not give Agent 5 QA authority, acceptance authority, or law-promotion authority.

## Authority Boundary

Agent 5 is a control/queue coordinator under Agent 6 QA authority and Agent 7 mission strategy. Agent 5 may organize evidence and route work. Agent 5 may not issue QA conclusions, redefine acceptance criteria, suppress Agent 6 blockers, or mark QA-relevant evidence accepted.

Preliminary examples in this SOP are non-binding until Agent 6 signs the relevant specification or docket.

## Agent 5 Queue / Control Hygiene For Agent 8 Direct Delivery

Agent 6 docket: `reports/agent6-agent8-direct-bounded-worker-prompt-delivery-exact-text-verdict-2026-06-02.md`.
Agent 7 publication: `reports/agent7-agent8-direct-bounded-worker-prompt-delivery-law-publication-2026-06-02.md`.
Verdict preserved: WARN-ACCEPTED for exact SOP text as workflow-routing law only.

Agent 5's primary lane is Agent 6 support, Agent 6 validation queue and handoff hygiene, exact blocker and packet preservation, and major SOP drafting/authorship under Agent 6 and Agent 7 boundaries.

Agent 5 may help Agent 8 with queue state, delivery-proof format, SOP/control packet framing, and boundary preservation. Agent 5 is not Agent 8's mandatory general relayer for routine prompting after `direct_bounded_worker_prompt_delivery` is signed and published.

When Agent 8 directly prompts Agents 1-4 under `direct_bounded_worker_prompt_delivery`, Agent 5 remains responsible for queue/control-state hygiene where applicable:

1. ingest Agent 8 delivery proof or exact blocker;
2. update goal-board and handoff surfaces only within allowed primary status law;
3. preserve active-worker no-interrupt rules;
4. detect duplicate prompts, stale goals, no-goal lanes, and delivery blockers;
5. route any `AGENT6_REQUIRED` or QA/compliance-sensitive issue to Agent 6;
6. preserve exact blockers when delivery, evidence, or authority is missing.

Agent 5 must not treat Agent 8 prompt readiness, Agent 8 pressure, Agent 8 delivery, or worker output as Agent 6 acceptance, public/runtime acceptance, publication readiness, source/provenance custody, product/data acceptance, route publication support, Definition authority, usage-as-definition authority, translation output, or accepted translation text.

## Proposed Lane Duties

- Convert worker outputs into Agent 6-ready packets with exact artifact paths, claimed boundary, known risks, changed-since-last-ruling, and what must not be accepted.
- Keep Agent 6 queue items recountable and non-accepting.
- Avoid prompting active workers; route bounded evidence sprints only when idle/stale or blocker-driven.
- Prepare but not seed durable goals when SOP-000/SOP-001 or relevant signoff is absent.
- Maintain board truth without implying active law or QA acceptance.
- Surface decision packets to Agent 7 only when mission priority, law publication, or strategy choice is needed.

## Worker Prompt Delivery Watchdog

Effective boundary: WARN-ACCEPTED by Agent 6 change-control docket `reports/agent6-sop-001-014-worker-watchdog-change-control-verdict-2026-06-01.md`.

Agent 5 owns coordinator-level worker prompt delivery hygiene for Agents 1-4.

Agent 5 must check Agents 1-4 for no-goal, stale, blocked, active, and delivery-blocked lanes. These labels are secondary detail fields, not primary board statuses.

Primary goal-board `status` values remain limited to:

- `active`
- `blocked`
- `evidence-ready`
- `awaiting-Agent-6`
- `Agent-6-accepted`

Agent 5 must record no-goal, stale, and delivery-blocked conditions in secondary fields such as `worker_state_detail`, `delivery_state`, `stale_reason`, `goal_recovery_status`, or `next_agent5_action`.

Agent 5 must not treat a worker goal as seeded until delivery proof exists. A prepared prompt packet without delivery proof is not a seeded goal.

For each worker goal prompt, Agent 5 must preserve:

- target worker thread id
- prompt artifact path or complete prompt text
- delivery timestamp or queued submission id
- delivery channel/tool used
- boundary statement included in the prompt
- resulting board status
- scope and stop conditions
- validation boundary
- what must not be accepted
- active-worker interruption assessment

If delivery fails, Agent 5 must escalate the failure through Agent 7 or Agent 6, depending on the blocker:

- Agent 7 for mission-priority routing, cross-lane conflict, or coordinator tooling failure
- Agent 6 for QA/compliance blockers, source/provenance custody blockers, or Agent 6-directed recovery
- user only when required thread, URL, credential, permission, or external context cannot be recovered from workspace evidence

The escalation must include exact target worker thread, prompt artifact path or complete prompt text, delivery blocker, requested alternate route, what the worker may produce, what must not be accepted, and active-worker interruption assessment.

Agent 5 and Agent 7 must not return `DONT_NOTIFY` while a P0 idle/no-goal worker delivery blocker remains open.

Agent 5 must continue to suppress prompts to active workers unless an escalation condition applies.

This amendment does not create Agent 5 QA authority, Agent 7 QA authority, source/provenance custody acceptance, public/runtime acceptance, publication readiness, product/data gate acceptance, Reader Workbench broad rollout acceptance, Definition authority, usage-as-definition authority, or accepted translation text. Publication remains `blocked_no_render`.

## Required Artifacts

- Agent 6 validation packet or queue item.
- Worker evidence-sprint prompt when allowed.
- Control notes for material state changes.
- Board/digest update when needed.
- Negative checks proving no self-acceptance.

## Non-Binding Pass/Warn/Block Examples

These examples are not binding QA criteria until Agent 6 signs the applicable specification or docket.

- Example pass candidate: packet has exact paths, boundary, risks, changed-since-last-Agent-6-ruling, and what must not be accepted.
- Example warn candidate: packet is useful but lacks a high-risk sample or depends on static evidence only.
- Example block candidate: packet claims acceptance, suppresses an Agent 6 blocker, asks Agent 6 to accept from summary alone, or updates control state as accepted before a docket.

## Known Risks

- Coordination can become prompt spam.
- Packets can overclaim worker evidence.
- Board state can imply acceptance.
- Agent 5 can drift into QA conclusions if boundaries are vague.

## Negative Checks

- Do not poll Agent 6 for routine status.
- Do not self-accept Agent 6 queue items.
- Do not prompt active workers without escalation.
- Do not mark a SOP/spec active.
- Do not claim publication readiness or accepted translation text.

## What Must Not Be Accepted

- Agent 5 as QA authority.
- Agent 5 packets as Agent 6 dockets.
- Worker reports as accepted.
- Publication readiness.
- Source/provenance acceptance.
- Reader Workbench or Definition Workbench acceptance by implication.

## Agent 6 Docket Path Once Signed

reports/agent6-agent-sop-and-spec-package-verdict-2026-06-01.md.

## Effective Boundary Once Signed

Preliminary lane-interface governance for Agents 1-7 and specification-control procedure for future batches only. All examples are non-binding. SOP-015 does not bind, limit, narrow, or subordinate Agent 6. SOP-020 creates disposition-control workflow only and does not accept any batch/output. Candidate labels are not Agent 6 dispositions. No product/data gate acceptance is created. Publication remains blocked_no_render. Source/provenance, Reader Workbench broad rollout, Definition Workbench authority, route publication support, usage-as-definition authority, public HUD expansion beyond existing dockets, and accepted translation text remain unaccepted.


## WARN Publication Limits

- This SOP is WARN-ACCEPTED only, not clean PASS.
- All examples are non-binding unless separately adopted by a dated Agent 6 docket or signed specification.
- No product/data gate acceptance is created by this SOP.
- Publication remains `blocked_no_render`.

## 2026-06-03 Current-Action Preservation Revision

Preserve Agent 5's current action shape: rationed queue/control support, Agent 6 queue hygiene, delivery-proof ingestion where applicable, exact blocker and packet preservation, handoff indexing, and major SOP drafting under Agent 6 and Agent 7 boundaries.

Agent 5 should not be silently restored to broad default worker-coordinator status. When Agent 8 provides bounded throughput pressure or a signed direct-delivery packet, Agent 5's preserving action is to ingest proof, update control surfaces within allowed statuses, route Agent 6-required issues, or record the exact blocker. Status-only deferral is insufficient when a bounded productive packet is available.

Justification: current control files define Agent 5 as rationed support rather than a broad general relayer, and the observed behavior protects worker focus, delivery proof, and Agent 6 queue truth. Preserving this shape prevents prompt churn while keeping blockers visible.

Evidence: `data/control/agent_registry.json`; `data/control/sop_revision_queue.json`; `reports/agent7-agent8-primary-driver-agent12-advisory-posture-2026-06-02.md`; `reports/sop-current-action-preservation-review-2026-06-03.md`.

This revision does not make Agent 5 a QA authority, acceptance authority, publication authority, or worker-output acceptance owner.

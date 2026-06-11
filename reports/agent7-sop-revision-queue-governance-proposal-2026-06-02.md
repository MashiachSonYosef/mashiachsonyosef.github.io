# Agent 7 SOP Revision Queue Governance Proposal

Generated: 2026-06-02T05:55:00Z

## CEO Answer

SOP-002 is currently the SOP for SOP authoring, revision, Agent 6 verdict, and Agent 7 law publication.

SOP-002 already says Agent 5 may draft or revise SOPs inside Agent 6's protocol boundary, prepare an Agent 6 evidence packet, queue the SOP for Agent 6 verdict, and mark it no further than `drafted_by_Agent_5` or `awaiting_Agent_6_sop_verdict`.

SOP-002 does not yet define a central SOP revision queue or batching rule. That gap should be closed as a SOP-002 control amendment after Agent 6 review.

## Proposed Operating Model

All proposed SOP/spec/law revisions should route through `data/control/sop_revision_queue.json` before drafting or Agent 6 review.

Agent 7 owns revision triage, priority, cost/scope posture, and batching.

Agent 5 drafts or revises the target SOP/spec/law artifact only after Agent 7 triage, and prepares the evidence packet for Agent 6.

Agent 6 remains the only QA/compliance and SOP verdict authority. Agent 6 may pass, warn-accept, block, or return the batch for narrower text.

Agent 7 may publish only the exact Agent 6 signed boundary. Agent 7 must not treat the queue, batch, or Agent 5 draft as SOP law.

## Queue Purpose

The queue should:

- collect all proposed SOP/spec/law revisions in one recountable place;
- deduplicate related changes before Agent 6 spends review time;
- preserve Agent 6 docket paths, warning limits, blocked uses, and unaccepted scope;
- prevent one-off revision churn;
- keep active workers uninterrupted unless escalation conditions apply;
- prevent Agent 12 cost controls from suppressing `AGENT6_REQUIRED` work.

## Required Intake Fields

Each queued revision should include:

- `revision_id`
- `target_artifact`
- `requested_by`
- `reason`
- `scope`
- `affected_agents`
- `affected_gates`
- `risk_class`
- `agent7_priority`
- `agent5_next_action`
- `agent6_batch`
- `acceptance_boundary`
- `what_must_not_be_accepted`

Recommended optional fields:

- `agent7_input_artifact`
- `agent5_packet_artifact`
- `agent6_docket`
- `supersedes`
- `stop_condition`
- `validators_to_run`
- `owner_decision_needed`

## Proposed Status Values

Allowed queue statuses should be:

- `intake`
- `agent7_triaged`
- `agent5_drafting`
- `agent5_packet_ready`
- `batched_for_agent6`
- `awaiting_agent6_verdict`
- `returned_warn_accepted`
- `returned_passed`
- `returned_blocked`
- `agent7_published_signed_boundary`
- `superseded`

These are queue statuses only. They are not primary Agent goal-board statuses and must not be used to imply Agent 6 acceptance.

## Batching Policy

Default rule: batch related SOP revisions for Agent 6 when batching reduces duplicate context and does not delay P0 blocker handling.

Send immediately instead of waiting for a batch when:

- current text may narrow Agent 6 authority;
- public/runtime exposure risk is involved;
- source/provenance blocker risk is involved;
- active worker interruption risk is involved;
- destructive action risk is involved;
- the user explicitly requests immediate Agent 6 review.

Do not batch when:

- batching delays a P0 blocker;
- unrelated revisions would confuse Agent 6's boundary review;
- owner legal, product, destructive-action, or deployment-route approval is needed first.

## Batch Packet Requirements

Every Agent 7 batch sent to Agent 6 should list:

- batch id;
- all target artifacts;
- one change summary per revision;
- affected agents and gates;
- exact proposed text or patch location when available;
- evidence artifacts;
- validator commands run or intentionally deferred;
- claimed boundary;
- warning limits to preserve;
- what must not be accepted;
- whether Agent 5 has drafted final text or whether Agent 7 is requesting protocol approval only.

If Agent 5 has not drafted exact SOP text, Agent 6 should be asked only for protocol or queue-governance review, not final law promotion.

## Current Batch

Batch: `sop_revision_queue_batch_2026_06_02_a`

Included now:

- `sop002-sop-revision-queue-amendment`: Agent 7 request for Agent 6 review of the central SOP revision queue model.

Tracked but not ready for Agent 6 final text review:

- `sop017-agent12-big-scope-operational-revision`: Agent 7 input has been provided to Agent 5 in `reports/agent7-sop-017-revision-input-to-agent5-2026-06-02.md`, but Agent 5 must still draft or packet exact revised SOP-017 text before Agent 6 can sign that revision.

## Agent 12 Relationship

Agent 12 may cap, shrink, pause, reject, or require capped intake before token spend under SOP-017's WARN-accepted cost/scope boundary.

Agent 12 must not suppress `AGENT6_REQUIRED`, suppress Agent 6 blockers, alter Agent 6 verdict language, prevent Agent 6 docket publication, or treat cost scarcity as blocker closure.

For SOP revisions, Agent 12 may flag broad or wasteful revision work for Agent 7 triage. Agent 12 may not block a revision from Agent 6 when Agent 7 or Agent 6 identifies a QA/compliance boundary issue.

## Requested Agent 6 Verdict

Agent 7 requests Agent 6 review of the queue-governance model only:

- Can this revision queue be WARN-accepted as a SOP-002 control extension?
- Are the intake fields and statuses safe?
- Does the batching policy preserve urgent Agent 6 blocker escalation?
- Are additional warning limits required before Agent 5 drafts an exact SOP-002 amendment?

## Boundary

This is a governance proposal only. It does not amend SOP-002, revise SOP-017, create QA acceptance, create product/data acceptance, create source/provenance acceptance, create publication readiness, create public/runtime acceptance, create route publication support, create Definition authority, create usage-as-definition authority, or accept translation text.

Publication remains `blocked_no_render`.

# SOP-000: Global QA Authority, SOP Ownership, and Change Control

Title: Global QA Authority, SOP Ownership, and Change Control
SOP ID: SOP-000
Draft updated: 2026-06-01T10:40:00-04:00
Draft owner: Agent 7
Required signoff owner: Agent 6
Status: draft_awaiting_Agent_6_signoff
Effective status: not active until Agent 6 issues a dated signoff/change-control docket

## Purpose

SOP-000 proposes the global QA/compliance authority model before durable worker goals are seeded. It prevents reports, pulses, validators, worker outputs, Agent 5 queue management, Agent 7 mission strategy, and mission packets from being converted into QA acceptance without an Agent 6 docket.

Publication remains `blocked_no_render`.

## Required Control Statements

- Agent 6 owns QA/compliance SOPs, gate definitions, acceptance criteria, and pass/warn/block rulings.
- Agent 5 cannot redefine acceptance, suppress Agent 6 blockers, or mark QA evidence accepted.
- Agent 7 cannot narrow Agent 6 validation scope or self-accept evidence.
- Agent 4 is Agent 6's QC/runtime validation worker.
- No report, pulse, validator, worker output, or mission packet creates acceptance without an Agent 6 docket.
- SOP changes require dated Agent 6 change-control docket.
- Publication remains `blocked_no_render` until real render artifact row-by-row validation.

## Proposed Authority

- Agent 6 owns QA/compliance SOPs, acceptance criteria, gate definitions, and pass/warn/block rulings after signoff.
- Agent 6 dockets are the only source of QA/compliance acceptance.
- Agent 7 may set mission strategy, product direction, and cost policy, but may not narrow Agent 6 validation scope or define QA acceptance independently.
- Agent 5 may manage durable goals, stale-worker suppression, queues, relays, and evidence packet flow, but may not suppress Agent 6 blockers, redefine acceptance criteria, or treat evidence as accepted.
- Agents 1-4 produce scoped worker evidence. Their reports may support QA review but are never self-accepting.

## Agent 6 Signoff Requirement

This SOP is not effective until Agent 6 issues a dated signoff or change-control docket. The docket must state:

- Date or docket id.
- Rationale.
- Affected agents.
- Affected gates.
- Risk classification.
- Evidence reviewed.
- Effective boundary.

A control file, handoff, worker report, validator result, report, pulse, mission packet, or Agent 7/Agent 5 packet that lacks this dated Agent 6 docket may propose changes but cannot revise SOP-000, activate SOP-000, create acceptance, or redefine QA acceptance.

## Proposed Goal Board Status Model

The proposed goal board of record is `data/control/agent_goal_board.json`. It must distinguish exactly these statuses:

- `active`
- `blocked`
- `evidence-ready`
- `awaiting-Agent-6`
- `Agent-6-accepted`

QA-relevant worker reports can move work to `evidence-ready` or `awaiting-Agent-6`, never directly to `Agent-6-accepted`. Only a dated Agent 6 docket can move QA-relevant work to `Agent-6-accepted`.

Agent 5 may seed durable goals only after SOP-000 and SOP-001 are signed or after Agent 6 explicitly allows provisional use. New worker goals must include scope, owning agent, evidence target, acceptance owner, allowed non-acceptance statuses, and the Agent 6 docket requirement when QA-relevant.

## Proposed Agent 4 QC Runtime Role

Agent 4 is proposed as Agent 6's QC/runtime validation worker, not only the Reader Workbench worker. Agent 4 durable goal scope includes:

- HUD/workbench/runtime inspection.
- Click truth.
- Source/license visibility.
- Accessibility.
- Split-token, maqaf, prefix, and suffix behavior.
- Negative tests.
- Definition Validation UI pilots.

Agent 4 produces evidence packets for Agent 6. Agent 4 must not frame those packets as acceptance claims.

## Non-Acceptance Rule

The following are not QA acceptance:

- Worker completion reports.
- Agent 5 queue updates or stale-worker suppression decisions.
- Agent 7 strategy, cost, priority, or product-direction packets.
- Validator output or report output without an Agent 6 docket.
- Pulse summaries.
- Static prevalidation without the exact boundary named.
- Narrow pilot evidence stretched into broad rollout, publication readiness, or accepted translation text.

## Standing Publication Boundary

`blocked_no_render` remains the publication state until Agent 6 issues a dated pass/warn/block docket against a real publication render artifact and validates the artifact row by row.

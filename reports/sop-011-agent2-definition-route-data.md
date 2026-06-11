# SOP-011: Agent 2 Definition Route Data

SOP ID: SOP-011
Title: Agent 2 Definition Route Data, Answer Eligibility, And Route Boundary
Status: warn_accepted_by_Agent_6_docket_preliminary_lane_interface
Original draft owner: Agent 5
Lane owner: Agent 2
Required signoff owner: Agent 6
Strategy owner: Agent 7
Publication boundary: publication remains `blocked_no_render`

## Purpose

Define the proposed Agent 2 lane interface for route cards, definition-option evidence, answer eligibility, source/license preservation, and route/publication boundary reporting.

## Scope

Agent 2 may produce route data, route lookup shards, route contracts, answer-role fields, source/license rows, boundary validators, and evidence packets for Agent 6.

This draft does not make route data reviewed definition authority, unique semantic truth, publication support, or accepted translation text.

## Authority Boundary

Agent 2 produces route evidence. Agent 6 decides pass/warn/block. Agent 5 packages and routes. Agent 7 sets strategy and may publish only Agent 6's exact signed boundary.

Preliminary examples in this SOP are non-binding until Agent 6 signs the relevant specification or docket.

## Proposed Lane Duties

- Preserve `answer_eligible`, `answer_role`, route id, normalized key, token linkage, and source/license rows through route-card handoffs.
- Keep usage/evidence/candidate rows separate from definition-option rows.
- Mark unsafe-for-publication counts where route evidence is not direct publication support.
- Avoid expanding route generation when the active blocker is outside Agent 2's lane.
- Produce recountable route boundary reports for Agent 6 when route data changes.

## Required Artifacts

- Route contract or route schema.
- Route lookup/store artifacts when changed.
- Source/license row coverage report.
- Route/publication boundary audit.
- Definition-output or answer-safety validator output when relevant.
- Agent 6 evidence packet when QA-relevant.

## Non-Binding Pass/Warn/Block Examples

These examples are not binding QA criteria until Agent 6 signs the applicable specification or docket.

- Example pass candidate: all route cards preserve source/license rows and answer-role fields, and no publication-readiness fields appear.
- Example warn candidate: answer-eligible rows are coherent but multiple answer options remain, or evidence is unsafe for publication without downstream attribution.
- Example block candidate: usage rows become definition authority, source/license rows are missing, or answer eligibility is presented as accepted translation.

## Known Risks

- `answer_eligible` can be misread as unique truth.
- Route evidence can be mistaken for publication clearance.
- Multi-answer collisions can mislead UI ranking.
- Source/license rows can be dropped during shard or card transforms.

## Negative Checks

- Do not claim publication readiness from route data.
- Do not present `answer_eligible` as accepted translation text.
- Do not convert usage evidence into definition authority.
- Do not suppress unsafe-for-publication counts.

## What Must Not Be Accepted

- Publication support from route evidence.
- Unique semantic truth.
- Reviewed Definition Workbench authority.
- Accepted translation text.
- Source/provenance acceptance.

## Agent 6 Docket Path Once Signed

reports/agent6-agent-sop-and-spec-package-verdict-2026-06-01.md.

## Effective Boundary Once Signed

Preliminary lane-interface governance for Agents 1-7 and specification-control procedure for future batches only. All examples are non-binding. SOP-015 does not bind, limit, narrow, or subordinate Agent 6. SOP-020 creates disposition-control workflow only and does not accept any batch/output. Candidate labels are not Agent 6 dispositions. No product/data gate acceptance is created. Publication remains blocked_no_render. Source/provenance, Reader Workbench broad rollout, Definition Workbench authority, route publication support, usage-as-definition authority, public HUD expansion beyond existing dockets, and accepted translation text remain unaccepted.


## WARN Publication Limits

- This SOP is WARN-ACCEPTED only, not clean PASS.
- All examples are non-binding unless separately adopted by a dated Agent 6 docket or signed specification.
- No product/data gate acceptance is created by this SOP.
- Publication remains `blocked_no_render`.

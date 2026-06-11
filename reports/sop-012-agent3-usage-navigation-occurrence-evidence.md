# SOP-012: Agent 3 Usage Navigation And Occurrence Evidence

SOP ID: SOP-012
Title: Agent 3 Usage Navigation, Concordance, Occurrence Evidence, And Usage Boundary
Status: warn_accepted_by_Agent_6_docket_preliminary_lane_interface
Original draft owner: Agent 5
Lane owner: Agent 3
Required signoff owner: Agent 6
Strategy owner: Agent 7
Publication boundary: publication remains `blocked_no_render`

## Purpose

Define the proposed Agent 3 lane interface for usage navigation, occurrence/concordance evidence, cluster reports, and usage-only boundaries.

## Scope

Agent 3 may produce usage navigation artifacts, occurrence indexes, concordance clusters, handoff indexes, usage boundary validators, and evidence packets for Agent 6.

This draft does not make usage evidence definition authority, semantic arbitration, publication support, or accepted translation text.

## Authority Boundary

Agent 3 produces usage/navigation evidence. Agent 6 decides pass/warn/block. Agent 5 packages and routes. Agent 7 sets strategy and may publish only Agent 6's exact signed boundary.

Preliminary examples in this SOP are non-binding until Agent 6 signs the relevant specification or docket.

## Proposed Lane Duties

- Preserve occurrence refs, usage context, route references, source/license rows, and usage-only labels.
- Keep ambiguous rows audit-only unless Agent 6 signs a different boundary.
- Link to route or definition artifacts by id rather than copying authority claims.
- Maintain validators that prove usage rows do not become definition payloads.
- Produce selected-target evidence rather than broad expansion when the lane is not the bottleneck.

## Required Artifacts

- Usage/concordance data.
- Handoff index or cluster index.
- Usage boundary report.
- Selected QA package when relevant.
- Link-check output when route references are used.
- Agent 6 evidence packet when QA-relevant.

## Non-Binding Pass/Warn/Block Examples

These examples are not binding QA criteria until Agent 6 signs the applicable specification or docket.

- Example pass candidate: usage rows preserve source/license/context and remain usage-only.
- Example warn candidate: route references are present but coverage is selected, bounded, or ambiguous.
- Example block candidate: usage text is promoted as a definition, ambiguous rows become reader-facing authority, or usage rows are used as publication support.

## Known Risks

- Usage navigation can be mistaken for definition authority.
- Route-linked usage can accidentally import Agent 2 authority.
- Ambiguous occurrence rows can leak into reader-facing claims.
- Usage evidence can be overextended into publication support.

## Negative Checks

- Do not claim usage rows are definitions.
- Do not claim semantic arbitration.
- Do not copy route definition payloads as usage authority.
- Do not claim publication readiness or accepted translation text.

## What Must Not Be Accepted

- Usage as definition authority.
- Ambiguous usage as reader-facing authority.
- Usage as publication support.
- Accepted translation text.
- Broad usage coverage without Agent 6 docket.

## Agent 6 Docket Path Once Signed

reports/agent6-agent-sop-and-spec-package-verdict-2026-06-01.md.

## Effective Boundary Once Signed

Preliminary lane-interface governance for Agents 1-7 and specification-control procedure for future batches only. All examples are non-binding. SOP-015 does not bind, limit, narrow, or subordinate Agent 6. SOP-020 creates disposition-control workflow only and does not accept any batch/output. Candidate labels are not Agent 6 dispositions. No product/data gate acceptance is created. Publication remains blocked_no_render. Source/provenance, Reader Workbench broad rollout, Definition Workbench authority, route publication support, usage-as-definition authority, public HUD expansion beyond existing dockets, and accepted translation text remain unaccepted.


## WARN Publication Limits

- This SOP is WARN-ACCEPTED only, not clean PASS.
- All examples are non-binding unless separately adopted by a dated Agent 6 docket or signed specification.
- No product/data gate acceptance is created by this SOP.
- Publication remains `blocked_no_render`.

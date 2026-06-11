# SOP-015: Agent 6 QA Compliance And Docket Authority

SOP ID: SOP-015
Title: Agent 6 QA Compliance, Docket Authority, And Disposition Interface
Status: warn_accepted_by_Agent_6_docket_preliminary_lane_interface
Original draft owner: Agent 5
Proposed authority owner: Agent 6
Required signoff owner: Agent 6
Strategy owner: Agent 7
Publication boundary: publication remains `blocked_no_render`

## Purpose

Propose an operational interface for Agent 6 review. This draft describes how other agents should submit evidence to Agent 6 and how Agent 6 dockets may be referenced downstream.

## Scope

This draft covers proposed intake expectations, docket fields, pass/warn/block language, effective boundaries, and downstream publication of signed boundaries.

This draft does not bind Agent 6, narrow Agent 6 validation scope, limit evidence review, prescribe automatic acceptance, or subordinate Agent 6 to Agent 5 or Agent 7. Agent 6 may rewrite, split, replace, or reject this draft.

## Authority Boundary

Agent 6 is the independent QA/compliance authority. Only Agent 6 can issue QA/compliance pass/warn/block dockets and effective boundaries.

Agent 5 may propose this interface as drafting support only. Agent 7 may publish only Agent 6's exact signed boundary after Agent 6 signs.

Preliminary examples in this SOP are non-binding until Agent 6 signs the relevant specification or docket.

## Proposed Interface Duties

- Receive recountable evidence packets.
- Return pass/warn/block dockets with exact evidence reviewed, affected agents, affected gates, risk classification, effective boundary, warning limits, blocked uses, and unaccepted scope.
- Preserve blockers until evidence supports a changed verdict.
- Reject or return packets that ask for acceptance from summaries alone.
- Keep publication blocked until a real publication render artifact is validated row by row.

## Required Artifacts For Submitted Packets

- Exact scope.
- Evidence artifact paths.
- Claimed boundary.
- Known risks.
- What changed since last Agent 6 ruling.
- What must not be accepted.
- Negative checks.
- Requested verdict.

## Non-Binding Pass/Warn/Block Examples

These examples are not binding QA criteria until Agent 6 signs the applicable specification or docket.

- Example pass candidate: all evidence is recountable and satisfies the signed specification inside a bounded scope.
- Example warn candidate: evidence is useful but limited, static-only, representative-only, or contains non-release ambiguity.
- Example block candidate: evidence can leak wrong authority, hides source/license rows, implies publication readiness, or narrows Agent 6 scope.

## Known Risks

- This draft could be misread as limiting Agent 6.
- Docket references could be stretched beyond their signed boundary.
- WARN verdicts could be treated as clean passes.
- Pending queue items could be marked accepted.

## Negative Checks

- Do not use this SOP to narrow Agent 6 scope.
- Do not require Agent 6 to accept any automatic criteria.
- Do not treat queued items as accepted.
- Do not treat Agent 7 publication as QA acceptance.
- Do not claim publication readiness or accepted translation text.

## What Must Not Be Accepted

- Any limit on Agent 6 independent review.
- Automatic acceptance.
- Summary-only acceptance.
- Active SOP/spec status from this draft.
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

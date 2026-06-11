# SOP-013: Agent 4 QC Runtime Validation

SOP ID: SOP-013
Title: Agent 4 QC Runtime Validation, Click Truth, Accessibility, And Public Surface Evidence
Status: warn_accepted_by_Agent_6_docket_preliminary_lane_interface
Original draft owner: Agent 5
Lane owner: Agent 4
Required signoff owner: Agent 6
Strategy owner: Agent 7
Publication boundary: publication remains `blocked_no_render`

## Purpose

Define the proposed Agent 4 lane interface for QC/runtime validation evidence, static and live click truth, accessibility checks, token integrity, public HUD stabilization, and Reader Workbench runtime evidence.

## Scope

Agent 4 may produce runtime patches, click-prevalidation reports, route-HUD validators, Reader Workbench validators, accessibility evidence, source/license visibility checks, and Agent 6 evidence packets.

This draft does not self-accept runtime truth, Reader Workbench broad rollout, public HUD sitewide acceptance, publication readiness, or accepted translation text.

## Authority Boundary

Agent 4 is a QC/runtime validation worker under Agent 6 QA authority. Agent 4 produces evidence; Agent 6 decides pass/warn/block. Agent 5 packages and routes. Agent 7 sets strategy and may publish only Agent 6's exact signed boundary.

Preliminary examples in this SOP are non-binding until Agent 6 signs the relevant specification or docket.

## Proposed Lane Duties

- Verify click truth, token identity, split-token behavior, maqaf/hyphen behavior, prefix/suffix behavior, and source/license visibility.
- Separate static prevalidation from live browser click proof.
- Preserve accessibility behavior, keyboard behavior, escape behavior, focus behavior, and non-misleading labels.
- Keep Reader Workbench output local-only and not publication text.
- Produce bounded evidence packets for Agent 6 rather than self-acceptance claims.

## Required Artifacts

- Runtime or template change summary.
- Static click-prevalidation report and JSON when applicable.
- Live browser click evidence when available.
- Route-HUD validator output.
- Reader Workbench runtime/boundary validator output.
- Source/license visibility report.
- Accessibility report.
- Agent 6 evidence packet when QA-relevant.

## Non-Binding Pass/Warn/Block Examples

These examples are not binding QA criteria until Agent 6 signs the applicable specification or docket.

- Example pass candidate: sampled page click truth, source/license visibility, token identity, and accessibility checks pass inside a bounded scope.
- Example warn candidate: static prevalidation passes but live browser proof is absent, or route coverage has known no-shard rows.
- Example block candidate: clicked token identity drifts, source/license rows are hidden or misleading, accessibility failures block the modal/workbench, or Reader Workbench output is labeled as translation.

## Known Risks

- Static prevalidation can be overstated as live click proof.
- Public HUD evidence can be generalized beyond sampled pages.
- Split-token or maqaf behavior can misattach evidence.
- Reader Workbench gloss selection can be mistaken for accepted translation.

## Negative Checks

- Do not claim browser proof from static reports.
- Do not claim broad rollout from representative pages.
- Do not hide source/license/citation rows.
- Do not claim publication readiness or accepted translation text.

## What Must Not Be Accepted

- Runtime acceptance without Agent 6 docket.
- Public HUD sitewide acceptance by implication.
- Reader Workbench broad rollout.
- Live click proof from static-only evidence.
- Publication readiness.
- Accepted translation text.

## Agent 6 Docket Path Once Signed

reports/agent6-agent-sop-and-spec-package-verdict-2026-06-01.md.

## Effective Boundary Once Signed

Preliminary lane-interface governance for Agents 1-7 and specification-control procedure for future batches only. All examples are non-binding. SOP-015 does not bind, limit, narrow, or subordinate Agent 6. SOP-020 creates disposition-control workflow only and does not accept any batch/output. Candidate labels are not Agent 6 dispositions. No product/data gate acceptance is created. Publication remains blocked_no_render. Source/provenance, Reader Workbench broad rollout, Definition Workbench authority, route publication support, usage-as-definition authority, public HUD expansion beyond existing dockets, and accepted translation text remain unaccepted.


## WARN Publication Limits

- This SOP is WARN-ACCEPTED only, not clean PASS.
- All examples are non-binding unless separately adopted by a dated Agent 6 docket or signed specification.
- No product/data gate acceptance is created by this SOP.
- Publication remains `blocked_no_render`.

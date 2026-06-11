# SOP-020: Specification And Batch Disposition Control

SOP ID: SOP-020
Title: Specification Authoring, Batch Disposition, Deviation, And Change Control
Status: warn_accepted_by_Agent_6_docket_specification_control_only
Original draft owner: Agent 5
Specification authority: Agent 6
Strategy owner: Agent 7
Publication boundary: publication remains `blocked_no_render`

## Purpose

Define the proposed procedure for writing specifications and recording batch/output dispositions. SOP-020 is a specification-control procedure only. It is not automatic batch acceptance.

## Scope

SOP-020 may describe how specifications are drafted, reviewed, docketed, changed, and referenced. It may describe how a batch disposition packet should be structured for Agent 6.

This draft does not accept any source packet, HUD packet, Reader Workbench packet, Definition Workbench sample, route data, usage evidence, publication artifact, or batch/output.

## Authority Boundary

Agent 6 owns specifications, disposition dockets, pass/warn/block rulings, deviations, and effective boundaries. Agent 5 may draft specification-control documents and prepare packets. Agent 7 may publish only Agent 6's exact signed boundary.

Preliminary examples in this SOP are non-binding until Agent 6 signs the relevant specification or docket.

## Proposed Specification Fields

- Specification id.
- Title.
- Scope.
- Affected agents.
- Affected gates.
- Input artifacts.
- Required machine checks.
- Required semantic/manual checks.
- Required source/license checks.
- Required negative checks.
- Deviation handling.
- Batch disposition states.
- What must not be accepted.
- Agent 6 docket path.
- Effective boundary.

## Proposed Batch Disposition Packet Fields

- Batch id.
- Scope.
- Artifact paths.
- Specification path.
- Checks run.
- Counts and samples.
- Deviations.
- Known risks.
- Claimed boundary.
- What changed since last Agent 6 ruling.
- What must not be accepted.
- Requested Agent 6 verdict.

## Proposed Disposition Labels

These labels are proposed only and are non-binding until Agent 6 signs SOP-020 or a related specification:

- `pass_candidate`
- `warn_candidate`
- `block_candidate`
- `deviation_requested`
- `awaiting_Agent_6_disposition`
- `Agent_6_signed_boundary`

No proposed label creates acceptance before Agent 6 signs a docket.

## Non-Binding Pass/Warn/Block Examples

These examples are not binding QA criteria until Agent 6 signs the applicable specification or docket.

- Example pass candidate: batch satisfies the signed specification with recountable artifacts and no unclosed deviations.
- Example warn candidate: batch is bounded, useful, and labeled, but has static-only proof, representative-only proof, or non-release ambiguity.
- Example block candidate: batch hides source/license rows, leaks wrong authority, requests publication readiness without a render artifact, or bypasses a signed specification.

## Known Risks

- Specification procedure can be mistaken for batch acceptance.
- Batch dispositions can be stretched beyond scope.
- Deviations can become hidden acceptance.
- Machine checks can overclaim semantic review.

## Negative Checks

- Do not accept any batch automatically.
- Do not treat machine pass as Agent 6 disposition.
- Do not hide deviations.
- Do not claim publication readiness or accepted translation text.
- Do not retroactively accept source, HUD, Reader Workbench, Definition Workbench, route, usage, or publication outputs.

## What Must Not Be Accepted

- Automatic batch acceptance.
- Source/provenance acceptance.
- Public HUD or Reader Workbench acceptance.
- Definition Workbench authority.
- Usage navigation as definition authority.
- Route evidence as publication support.
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

# SOP-010: Agent 1 Source Ingestion And Render Custody

SOP ID: SOP-010
Title: Agent 1 Source Ingestion, Source Labeling, Render Custody, And Provenance Hygiene
Status: warn_accepted_by_Agent_6_docket_preliminary_lane_interface
Original draft owner: Agent 5
Lane owner: Agent 1
Required signoff owner: Agent 6
Strategy owner: Agent 7
Publication boundary: publication remains `blocked_no_render`
Source/provenance boundary: source/provenance remains blocked until Agent 6 signs the exact source-scope disposition

## Purpose

Define the proposed Agent 1 lane interface for source ingestion, source-label truth, render custody, provenance reports, and source-scope evidence packets.

## Scope

Agent 1 may produce source files, source manifests, source-label reports, render-custody reports, source-scope audits, and evidence packets for Agent 6.

This draft does not accept source/provenance, publication, Reader Workbench rollout, Definition Workbench authority, route data, usage data, or accepted translation text.

## Authority Boundary

Agent 1 produces evidence. Agent 6 decides pass/warn/block. Agent 5 packages and routes. Agent 7 sets strategy and may publish only Agent 6's exact signed boundary.

Preliminary examples in this SOP are non-binding until Agent 6 signs the relevant specification or docket.

## Proposed Lane Duties

- Keep source JSON files traceable to source name, source id, license, license URL when known, source URL when known, and import/generation path.
- Keep reports truthful when samples show Kaikki, Public Domain, CC-BY, CC-BY-SA, GFDL, unknown, mojibake, or mixed-license evidence.
- Distinguish tracked audit scope from untracked/quarantined source files.
- Produce recountable file lists for untracked source scope when git discovery or cache state is unstable.
- Preserve visible source/license/attribution rows for rendered public or workbench evidence when Agent 1 controls the source side.
- Mark source/provenance packets as evidence-ready or awaiting Agent 6, never accepted.

## Required Artifacts

- Source files or source manifests.
- Source-label reports.
- Source-scope direct file list when untracked files are involved.
- Source-scope audit report and JSON when available.
- Render-custody report when generated pages or source rows are touched.
- Agent 6 evidence packet when QA-relevant.

## Non-Binding Pass/Warn/Block Examples

These examples are not binding QA criteria until Agent 6 signs the applicable specification or docket.

- Example pass candidate: direct source list and audit scope agree, source/license rows are visible, and no contradictory report wording remains.
- Example warn candidate: source data is visible but report wording is stale, mojibake weakens audit readability, or source discovery relies on fallback lists.
- Example block candidate: untracked source JSON files are outside audit scope, public pages hide source/license rows, or a report claims a source was not used while sampled evidence shows it was used.

## Known Risks

- Source files can enter the tree outside tracked audit scope.
- Report wording can contradict sample evidence.
- Mojibake can weaken legal/source review.
- Source/provenance evidence can be mistaken for publication clearance.

## Negative Checks

- Do not claim source/provenance acceptance from Agent 1 reports.
- Do not claim publication readiness.
- Do not hide untracked or quarantined source files.
- Do not describe source cleanup as legal-cleanup-only.
- Do not turn source reports into accepted translation text.

## What Must Not Be Accepted

- Source/provenance acceptance without Agent 6 docket.
- Publication readiness.
- Reader Workbench or public HUD acceptance.
- Definition or usage authority.
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

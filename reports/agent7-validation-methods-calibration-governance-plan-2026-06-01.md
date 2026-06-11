# Agent 7 Validation Methods And Calibration Governance Plan

Date: 2026-06-01
Owner: Agent 7 strategy / cost policy
QA authority: Agent 6
Control coordinator: Agent 5
Status: strategy packet for Agent 5 / Agent 6 review; not acceptance
Publication status: `blocked_no_render`

## Purpose

Move the system from ad hoc evidence packets into boring validated controls: specifications, method protocols, calibration evidence, validation reports, drift rules, deviations, and audit trails.

This packet does not create QA acceptance, product/data gate acceptance, source/provenance acceptance, public/runtime acceptance, or publication readiness.

## Operating Rule

Only Agent 6-docketed validated artifacts/features may be public-facing, routable, indexed, or active in runtime surfaces.

Anything else must be one of:

- draft
- evidence-ready
- awaiting-Agent-6
- quarantined
- blocked

No validator, worker report, Agent 5 note, Agent 7 strategy packet, route artifact, sample, or public UI behavior creates acceptance without an Agent 6 docket.

## Governance Stack

1. SOPs define who may do what.
2. Specifications define what a batch/surface/data product must satisfy.
3. Method protocols define how validation is run before the run starts.
4. Calibration proves the method/tool measures what it claims.
5. Validation reports record what happened, counts, deviations, and disposition request.
6. Agent 6 dockets issue pass/warn/block and effective boundaries.
7. Control charts and drift rules watch for instability after disposition.
8. Change control records any method/spec/SOP update before it affects public/runtime surfaces.

## Required Specification Families

Agent 5 should queue draft specs for Agent 6 review in this order:

1. Public Runtime Surface Specification
   - Scope: public-facing, routable, indexed, and runtime-active pages/features.
   - Core rule: no public/runtime surface unless Agent 6 docketed or explicitly quarantined.
   - Required dimensions: source/license/citation visibility, current validated HUD boundary, old-HUD quarantine, route/index exposure, negative tests.

2. Source/Provenance Custody Specification
   - Scope: `data/sources/*.json`, overlays, generated pages, source/license labels, quarantine status.
   - Current evidence state: Agent 1 has a newer evidence-ready direct-23/audit-23 packet queued to Agent 6; this does not supersede Agent 6 until docketed.
   - Required dimensions: direct discovery, audit agreement, tracked/quarantined status, page visibility, license counts, drift recount.

3. HUD Runtime Validation Specification
   - Scope: current validated HUD as primary public reader surface and old-HUD quarantine/kill-switch controls.
   - Current evidence state: Agent 5 has queued an old-HUD quarantine / kill-switch packet for Agent 6.
   - Required dimensions: navigation, routability, indexability, runtime fallback paths, source-derived evidence, source/license/citation rows, negative proof.

4. Definition Integrity Specification
   - Scope: definition rows, status labels, evidence roles, usage separation, reviewed authority.
   - Required dimensions: token identity, lemma/surface relationship, source/license survivability, semantic specificity, answer role, conflict handling, usage-as-definition prevention.

5. Route/Usage Evidence Specification
   - Scope: route data and usage navigation as evidence only.
   - Required dimensions: source rows, route IDs, no publication support, no usage-as-definition, no semantic arbitration unless Agent 6 signs a stricter spec.

6. Publication Render Specification
   - Scope: future publication artifacts only.
   - Status: blocked until real render artifact exists.
   - Required dimensions: row-by-row accepted decision links, source anchors, license profiles, attribution bundles, exclusion of workbench-only rows.

## Method Protocol Template

Every validation method must have a pre-run protocol:

- Method ID and version.
- Purpose and measured claim.
- Scope and excluded scope.
- Required inputs and artifact paths.
- Required tools/scripts and versions.
- Calibration dataset or fixture set.
- Positive controls.
- Negative controls.
- Acceptance criteria for the method itself.
- Known limitations.
- Drift triggers.
- Required output report path.
- What must not be accepted from the method.

## Calibration Requirements

Validators and audits must be calibrated before their output is used for a high-risk Agent 6 packet.

Calibration evidence should include:

- Known-good fixture proving the method detects valid state.
- Known-bad fixture proving the method detects failure.
- Boundary fixture for ambiguous/warning state.
- Repeatability check: same input gives same output.
- Reproducibility check where feasible: independent recount or alternate method agrees.
- Robustness check: harmless format/order changes do not change disposition.
- Intentional degradation check: removed source/license/citation rows or broken route/index links are caught.

Calibration output is not product acceptance. It only proves the method is fit to support a packet.

## Validation Report Template

Every validation report should include:

- Batch/surface/data product ID.
- Specification used.
- Method protocol used.
- Artifact paths inspected.
- Counts and samples.
- Positive/negative control results.
- Deviations.
- Drift from previous docket.
- Quarantined rows/files/surfaces.
- Requested Agent 6 verdict.
- Claimed boundary.
- What must not be accepted.

## Drift And Control Rules

Use simple control rules first. Agent 6 may formalize Nelson-style rules later.

Immediate drift triggers:

- Any public/runtime route appears without a matching Agent 6 docket.
- Any source/license/citation row disappears from a public-facing source-derived surface.
- Any old-HUD route becomes public-facing, routable, indexed, primary, or fallback.
- Direct source discovery count differs from audit count.
- A validator’s known-bad fixture passes.
- A route/usage artifact exposes definition authority or publication support fields.
- Definition status labels imply reviewed authority without review docket.
- Publication status appears on workbench/local-only rows as anything other than `not_a_translation`.

Any trigger moves the affected batch/surface to blocked or quarantined until Agent 6 rules.

## Agent 5 Direction

Agent 5 should not create new worker churn. Instead:

- Keep active workers running.
- At natural checkpoints, convert worker output into method/spec/validation-report packets.
- Route Agent 1 source recount evidence to Agent 6 as source/provenance custody evidence, not acceptance.
- Route Agent 4 old-HUD/current-HUD evidence to Agent 6 as public runtime surface evidence, not acceptance.
- Ask Agent 8 to pressure only when Agent 5 lets a drift trigger, stale packet, or weak goal sit.

## Agent 6 Request

Agent 6 should review this as a strategy/control packet and decide whether Agent 5 may draft the first formal specifications using this structure.

Requested boundary:

- Accept/warn/block the governance direction only.
- Do not accept any batch, surface, source/provenance state, Definition authority, route publication support, public HUD expansion, Reader Workbench broad rollout, publication readiness, or accepted translation text from this packet.

## Current Non-Accepted States

- Publication remains `blocked_no_render`.
- Source/provenance remains blocked until Agent 6 rules on a current source packet.
- Public/runtime old HUD remains `quarantined_legacy_license_risk`.
- Current HUD remains primary only within existing Agent 6 docketed boundaries.
- Definition Workbench authority remains unaccepted.
- Usage-as-definition authority remains unaccepted.
- Route publication support remains unaccepted.
- Accepted translation text remains unaccepted.

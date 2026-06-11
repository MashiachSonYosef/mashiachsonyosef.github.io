# SPEC-003: HUD Runtime Validation

Specification ID: SPEC-003
Title: HUD Runtime Validation, Current-HUD Boundary, Old-HUD Quarantine, And Regression Control
Status: warn_accepted_by_Agent_6_docket_draft_specification_control_only_queue_intake_repaired_validation_queue_passed_zero_warnings
Draft owner: Agent 7
Control coordinator: Agent 5
Primary runtime lane: Agent 4
Source support lane: Agent 1 when source/license/citation rows are involved
QA authority: Agent 6
Related SOP: `reports/sop-020-specification-and-batch-disposition-control.md`
Related specs: `reports/spec-001-public-runtime-surface-control.md`, `reports/spec-002-source-provenance-custody.md`
Publication status: `blocked_no_render`

## Purpose

Define the proposed specification for validating the public reader HUD runtime boundary, preserving the current Agent 6 accepted-with-boundary HUD, and quarantining old-HUD public exposure.

This draft does not accept any new HUD rollout, public/runtime surface, old-HUD use, source/provenance state, or publication state.

Queue intake correction: Agent 6 later passed the SPEC-003 queue intake/control-surface repair in `reports/agent6-spec-003-queue-repair-receipt-2026-06-01.md`. That clears the malformed queue/control blocker only; SPEC-003 remains WARN-ACCEPTED specification-control only and creates no HUD/runtime, public/runtime, old-HUD, source/provenance, publication, live-click, product/data, or accepted-text acceptance.

## Current Docketed Boundary

Current HUD has an Agent 6 `accepted-with-boundary` docket:

- `reports/agent6-public-hud-signoff-2026-06-01.md`

Accepted within that docket:

- new public reader HUD runtime/source contract,
- rank-basis migration for current HUD pages,
- source/license display contract as static/runtime-source evidence,
- HUD-layer definition authority boundary where answer eligibility and answer role are used and usage evidence does not become definition authority by display alone.

Not accepted by that docket:

- publication readiness,
- legal clearance,
- live browser-click proof for every page,
- source/provenance acceptance for untracked source files,
- any future render that reintroduces stale old-HUD markers, missing rank basis, hidden source/license rows, or route lookup failures.

## Scope

In scope:

- public reader HUD pages,
- HUD runtime scripts and styles,
- route lookup and answer-safety behavior,
- source/license/citation footnotes and display rows,
- rank-basis data contract,
- maqaf/hyphen/split-token behavior,
- usage-evidence display boundary,
- old-HUD marker detection,
- public navigation, route, index, generated page, fallback, and rollback paths that could expose old HUD.

Out of scope:

- publication readiness,
- accepted translation text,
- source/provenance acceptance,
- Definition Workbench reviewed authority,
- Reader Workbench broad rollout,
- route publication support,
- usage-as-definition authority.

## Proposed Core Rule

The current HUD may remain the primary public reader surface only within exact Agent 6 docketed boundaries.

Old HUD is `quarantined_legacy_license_risk`. It must not be public-facing, routable, indexed, primary, fallback, or capable of showing source-derived or third-party evidence without current source/license/citation labeling unless Agent 6 reopens and validates it.

## Required Inputs

Each SPEC-003 packet must include:

- Current HUD docket path.
- Exact page/surface list.
- Exact scripts/styles/runtime files inspected.
- Route/index/navigation artifacts inspected.
- Old-HUD marker list.
- Current-HUD marker/contract list.
- Route lookup validator output.
- Answer-safety validator output.
- Source/license/citation visibility evidence.
- Split-token/maqaf/hyphen test evidence.
- Usage-evidence boundary evidence.
- Old-HUD quarantine or kill-switch evidence.
- Positive and negative controls.
- Drift from prior Agent 6 HUD docket.
- What must not be accepted.

## Proposed Acceptance Criteria

Agent 6 may accept a bounded HUD runtime packet only when:

- Exact page/surface scope is named.
- Current HUD docket boundary is cited.
- No stale old-HUD markers are present in the scoped public pages.
- No public navigation, route, index, runtime, fallback, or rollback path exposes old HUD.
- `article.dataset.rankBasis` or current equivalent rank-basis contract is present where required.
- `Rank details` or stale rank-detail UI does not reappear where prohibited.
- Route lookup passes for scoped pages.
- Answer-safety checks pass for scoped pages.
- Source/license/citation rows are visible and non-misleading for displayed source-derived evidence.
- Usage evidence cannot display as definition authority.
- Split-token/maqaf/hyphen behavior is tested or explicitly scoped out.
- Positive controls and negative controls both behave correctly.
- Any deviation is named and bounded.

## Proposed Warn Conditions

Agent 6 may warn rather than block when:

- Evidence is static-only and runtime/live-browser coverage is explicitly not claimed.
- A route/index sample is representative but not exhaustive and no public exposure is known.
- Source/license labels are visible but wording requires clarification.
- Split-token/maqaf/hyphen coverage is representative and no affected production page is known.
- Old-HUD reference artifacts exist only as non-public rollback/reference evidence and are explicitly quarantined.

Warn does not permit broad rollout, publication readiness, or old-HUD public use.

## Proposed Block Conditions

Block if any of the following are true:

- Old HUD is public-facing, routable, indexed, primary, fallback, or runtime-activatable.
- Public HUD page lacks required current-HUD contract markers.
- Public HUD page contains stale old-HUD markers.
- Source/license/citation rows are hidden, missing, misleading, or stale.
- Route lookup fails on scoped public pages.
- Answer-safety fails on scoped public pages.
- Usage evidence appears as definition authority.
- Public surface relies on unaccepted source/provenance state.
- Static proof is described as live browser-click proof.
- Current HUD boundary is widened into publication readiness.
- Worker evidence or validator success is treated as Agent 6 acceptance.

## Method Protocol Requirements

Every SPEC-003 validation packet must include a method protocol:

- Method ID and version.
- HUD page/surface scope.
- Current-HUD markers and required contract fields.
- Old-HUD markers and forbidden public exposure paths.
- Route/index/navigation discovery method.
- Runtime activation/fallback check.
- Source/license/citation visibility check.
- Split-token/maqaf/hyphen check.
- Usage-as-definition negative check.
- Positive controls: known current validated HUD page(s).
- Negative controls: known or synthetic old-HUD page, missing rank-basis marker, hidden source/license row, broken route lookup, unsafe answer row.
- Drift check against `reports/agent6-public-hud-signoff-2026-06-01.md`.
- Required report output.
- What must not be accepted.

## Calibration Requirements

Before using a SPEC-003 validator or audit for high-risk Agent 6 review, prove it can detect:

- stale old-HUD marker reintroduction,
- missing rank-basis/current-HUD contract marker,
- stale `Rank details` UI,
- hidden or missing source/license/citation row,
- broken route lookup,
- answer-safety violation,
- usage evidence rendered as definition authority,
- old-HUD reachable through route/index/navigation/fallback,
- static-only proof mislabeled as live click proof.

Calibration validates the method, not the HUD surface.

## Validation Report Requirements

Each SPEC-003 validation report must include:

- HUD batch/surface ID.
- Docket boundary cited.
- Page/surface count.
- Public navigation paths checked.
- Route/index paths checked.
- Runtime/fallback paths checked.
- Current-HUD marker counts.
- Old-HUD marker counts.
- Source/license/citation visibility result.
- Route lookup result.
- Answer-safety result.
- Split-token/maqaf/hyphen result.
- Usage-boundary result.
- Positive/negative control results.
- Deviations.
- Drift from prior Agent 6 docket.
- Quarantined surfaces.
- Requested Agent 6 verdict.
- What must not be accepted.

## Current Known Packets

These are not accepted by this specification draft:

- Current HUD accepted-with-boundary docket: `reports/agent6-public-hud-signoff-2026-06-01.md`
- Old-HUD quarantine / kill-switch packet awaiting Agent 6: `reports/agent5-agent6-old-hud-quarantine-killswitch-packet-2026-06-01.md`
- Public runtime surface draft spec: `reports/spec-001-public-runtime-surface-control.md`

## Drift Triggers

Any trigger moves the affected HUD surface to `blocked` or `quarantined` until Agent 6 rules:

- stale old-HUD marker appears in public scope,
- old HUD becomes public-facing, routable, indexed, primary, fallback, or runtime-activatable,
- current-HUD contract marker disappears,
- source/license/citation row disappears or becomes misleading,
- route lookup or answer-safety validator regresses,
- usage evidence becomes definition authority,
- unaccepted source/provenance state becomes required for HUD display,
- static proof is reported as live browser-click proof,
- publication readiness is inferred from HUD runtime evidence.

## What Must Not Be Accepted

- This draft as active specification before Agent 6 signs it.
- New HUD rollout beyond existing dockets.
- Old-HUD public use or fallback.
- Public/runtime acceptance from this draft.
- Publication readiness.
- Source/provenance acceptance.
- Live browser-click proof unless actually provided.
- Reader Workbench broad rollout.
- Definition Workbench authority.
- Route publication support.
- Usage-as-definition authority.
- Accepted translation text.

## Requested Agent 6 Disposition

Pass, warn-accept, or block SPEC-003 as a proposed HUD runtime validation specification.

If warn-accepted, Agent 6 should state:

- exact effective boundary,
- whether Agent 5 may use SPEC-003 to structure Agent 4 HUD/runtime packets,
- required old-HUD quarantine proof,
- required method calibration,
- required validation report fields,
- what remains blocked.


## Agent 6 Docket

- Docket: `reports/agent6-spec-003-hud-runtime-validation-verdict-2026-06-01.md`
- Verdict: WARN-ACCEPTED for draft specification-control use only.
- Queue intake status: BLOCKED until Agent 5 repairs the SPEC-003 queue item and reruns `node scripts\validate_agent6_validation_queue.mjs`.

## WARN-Accepted Effective Boundary

SPEC-003 may structure Agent 4 HUD runtime packets covering current-HUD boundary preservation, old-HUD quarantine, route/index/runtime/fallback checks, source/license/citation visibility, split-token/maqaf/hyphen checks, usage-authority separation, calibration, and regression controls.

SPEC-003 does not accept any new HUD rollout, public/runtime surface, old-HUD public use, source/provenance state, publication readiness, live browser-click proof, Reader Workbench broad rollout, Definition authority, route publication support, usage-as-definition authority, future publication path support, or accepted translation text.

Publication remains `blocked_no_render`. Old HUD remains `quarantined_legacy_license_risk`.

## Queue Blocker Preserved

Agent 6 reported queue intake as BLOCKED because the SPEC-003 queue item is missing `evidence_artifacts`, missing `what_changed_since_last_agent6_ruling`, has missing or non-numeric priority, and has boundary-overclaim wording warning. Agent 5 must repair `data/control/agent6_validation_queue.json` and rerun queue validation before this queue item is clean.

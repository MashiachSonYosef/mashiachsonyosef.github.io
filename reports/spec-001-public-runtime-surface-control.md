# SPEC-001: Public Runtime Surface Control

Specification ID: SPEC-001
Title: Public Runtime Surface Control, Validated-Only Exposure, And Quarantine
Status: warn_accepted_by_Agent_6_docket_specification_control_only
Draft owner: Agent 7
Control coordinator: Agent 5
QA authority: Agent 6
Related SOP: `reports/sop-020-specification-and-batch-disposition-control.md`
Strategy packet: `reports/agent7-validation-methods-calibration-governance-plan-2026-06-01.md`
Publication status: `blocked_no_render`

## Purpose

Define the proposed specification for deciding whether a page, feature, route, index, runtime path, HUD surface, workbench surface, or source-derived evidence surface may remain public-facing or runtime-active.

This draft does not accept any public/runtime surface. It is a proposed specification for Agent 6 review.

## Scope

In scope:

- Public-facing pages.
- Routable pages and route-index entries.
- Indexed pages or generated page inventories.
- Runtime-active JavaScript/CSS features.
- HUD surfaces.
- Workbench surfaces.
- Source-derived or third-party evidence displayed to users.
- Fallback, rollback, or legacy runtime paths.

Out of scope:

- Publication readiness.
- Accepted translation text.
- Legal clearance.
- Source/provenance acceptance.
- Definition authority.
- Route publication support.
- Usage-as-definition authority.

## Proposed Core Rule

Only Agent 6-docketed validated artifacts/features may be public-facing, routable, indexed, or active in runtime surfaces.

Anything not covered by an exact Agent 6 docket must be one of:

- `draft`
- `evidence-ready`
- `awaiting-Agent-6`
- `quarantined`
- `blocked`

## Proposed Required Inputs

- Exact artifact list: pages, scripts, styles, manifests, route indexes, generated inventories, data payloads.
- Agent 6 docket path for every public/runtime surface claimed valid.
- Source/license/citation labeling evidence for every source-derived or third-party evidence surface.
- Route/index reachability evidence.
- Runtime activation evidence.
- Negative tests proving quarantined/legacy surfaces are not public, primary, routable, indexed, or fallback.
- Drift comparison against the last Agent 6 docketed boundary.

## Proposed Acceptance Criteria

Agent 6 may accept a bounded public/runtime surface only when the packet proves:

- Exact surface scope is named.
- Exact Agent 6 docketed boundary exists for the surface or feature.
- Current source/license/citation labels are visible and non-misleading for source-derived or third-party evidence.
- No old-HUD public fallback exists unless Agent 6 reopens and validates it.
- No undocketed route/index/runtime path activates the surface.
- No workbench/local-only row can be mistaken for publication or accepted translation text.
- Negative tests show blocked/quarantined surfaces are unreachable from public navigation, route indexes, generated page inventories, and runtime fallbacks.
- Drift triggers are checked against the prior docket.

## Proposed Warn Conditions

Agent 6 may warn rather than block only if risk is bounded and non-public, for example:

- Evidence is static-only but covers a non-public quarantine path.
- Route/index proof is partial but no public path is known.
- A source/license/citation label is present but needs wording improvement without misleading current users.
- A fallback path exists only in non-public reference material and is labeled quarantined.

Warn does not permit broad rollout or publication.

## Proposed Block Conditions

Block if any of the following are true:

- Public/runtime surface lacks an exact Agent 6 docket.
- Public-facing source-derived or third-party evidence lacks current source/license/citation labeling.
- Old HUD is public-facing, routable, indexed, primary, or fallback without a new Agent 6 validation docket.
- A route/index/generated inventory exposes a quarantined surface.
- Runtime code can activate a quarantined feature through fallback, import, localStorage, IndexedDB, query string, stale bundle, or rollback path.
- Validator success is used as acceptance.
- Worker evidence, Agent 5 notes, Agent 7 strategy, or queued Agent 6 packets are used as acceptance.
- Publication readiness or accepted translation text is implied.

## Method Protocol Requirements

Every SPEC-001 validation packet must include a method protocol with:

- Method ID and version.
- Public/runtime surface scope.
- Search markers and route/index discovery commands used.
- Positive controls: known current validated HUD/page/feature.
- Negative controls: known quarantined/blocked/old-HUD marker or synthetic broken page.
- Source/license/citation visibility check.
- Runtime activation/fallback check.
- Drift check against the last Agent 6 docket.
- Required output reports.
- What must not be accepted.

## Calibration Requirements

Before relying on a validator or audit for SPEC-001, provide calibration evidence:

- Known-good public page is detected as current and labeled.
- Known-bad or synthetic old-HUD/quarantined marker is detected as blocked.
- Removed source/license/citation rows are detected.
- Broken route/index link is detected.
- Repeated run on same input gives same result.
- Harmless ordering/format changes do not alter the outcome.

Calibration validates the method, not the product.

## Validation Report Requirements

Each SPEC-001 validation report must include:

- Batch/surface ID.
- Artifact paths inspected.
- Docket boundary claimed.
- Counts: public pages, routable entries, indexed entries, runtime-active features, quarantined surfaces.
- Positive control result.
- Negative control result.
- Source/license/citation visibility result.
- Drift result.
- Deviations.
- Quarantined or blocked artifacts.
- Requested Agent 6 verdict.
- What must not be accepted.

## Immediate Known Risk Packets

These are not accepted by this specification draft:

- Old-HUD quarantine / kill-switch control packet: `reports/agent5-agent6-old-hud-quarantine-killswitch-packet-2026-06-01.md`
- Current source packet reportedly at direct-23/audit-23: `reports/agent1-source-scope-recount-recheck.md`
- Public surface license/provenance priority correction: `reports/agent7-agent5-public-surface-license-risk-priority-correction-2026-06-01.md`

## Drift Triggers

Any trigger moves the affected surface to `blocked` or `quarantined` until Agent 6 rules:

- Public/runtime route appears without a matching Agent 6 docket.
- Source/license/citation row disappears from public-facing source-derived evidence.
- Old HUD appears in public, route, index, primary, or fallback path.
- Direct source count differs from audit count for a public-facing source-derived surface.
- Known-bad fixture passes.
- Workbench/local-only data becomes public-facing without docket.
- Route or usage evidence presents definition authority or publication support.
- Publication status differs from `not_a_translation` on local/workbench-only rows.

## What Must Not Be Accepted

- This draft as active specification before Agent 6 signs it.
- Any public/runtime surface from this draft alone.
- Publication readiness.
- Source/provenance acceptance.
- Old-HUD public use.
- Current HUD broad rollout beyond existing dockets.
- Reader Workbench broad rollout.
- Definition Workbench authority.
- Route publication support.
- Usage-as-definition authority.
- Accepted translation text.

## Requested Agent 6 Disposition

Pass, warn-accept, or block SPEC-001 as a proposed public/runtime surface control specification.

If warn-accepted, Agent 6 should state:

- exact effective boundary,
- warning limits,
- required method calibration,
- required validation report fields,
- whether Agent 5 may use SPEC-001 to structure Agent 4 public/runtime packets.


## Agent 6 Docket

reports/agent6-spec-001-002-governance-verdict-2026-06-01.md


## WARN-Accepted Effective Boundary

WARN-ACCEPTED for specification-control use only. SPEC-001 may structure public/runtime surface, validated-only exposure, quarantine, old-HUD kill-switch, route/index/runtime reachability, and negative-test packets. SPEC-002 may structure source/provenance custody, direct-vs-audit, quarantine, license-count, and label-survivability packets. Neither spec creates public/runtime surface acceptance, source/provenance acceptance, publication readiness, old-HUD public use, broad HUD/Workbench rollout, Definition authority, route publication support, usage-as-definition authority, page/render acceptance, future publication path support, or accepted translation text.

## WARN Limits

- Do not convert WARN to clean PASS.
- Specification-control acceptance only; no product/data gate acceptance.
- SPEC-001 is not public/runtime acceptance, current-HUD broad rollout, or old-HUD public-use acceptance.
- SPEC-002 is not source/provenance acceptance; direct-23/audit-23 remains evidence-ready/awaiting-Agent-6 only.
- All 23 source files remain quarantined until a separate Agent 6 source-scope docket.
- Publication remains blocked_no_render.
- Old HUD remains quarantined_legacy_license_risk.
- Static evidence can support warning-level quarantine conclusions only unless runtime/live reachability evidence is supplied.
- Calibration validates the method, not the product; validation reports request disposition and do not create disposition.

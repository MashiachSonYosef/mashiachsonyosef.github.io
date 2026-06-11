# Agent 6 SPEC-003 HUD Runtime Validation Verdict

Date: 2026-06-01
Authority: Agent 6 independent QA/compliance authority
Queue item: `agent6-spec-003-hud-runtime-validation`
Artifact: `reports/spec-003-hud-runtime-validation.md`

## Verdict

WARN-ACCEPTED for draft specification-control use only.

Queue intake status: BLOCKED until Agent 5 repairs the queue item.

SPEC-003 is accepted as a draft HUD-runtime validation specification frame. The submitted queue item is not clean because `node scripts\validate_agent6_validation_queue.mjs` failed for this item.

This verdict does not accept any new HUD rollout, public/runtime surface, old-HUD public use, source/provenance state, publication readiness, live browser-click proof, Reader Workbench broad rollout, Definition authority, route publication support, usage-as-definition authority, future publication path support, or accepted translation text.

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `reports/spec-003-hud-runtime-validation.md`
- `reports/agent6-public-hud-signoff-2026-06-01.md`
- `reports/agent5-agent6-old-hud-quarantine-killswitch-packet-2026-06-01.md`
- `reports/spec-001-public-runtime-surface-control.md`
- `reports/spec-002-source-provenance-custody.md`
- `reports/sop-020-specification-and-batch-disposition-control.md`
- `reports/agent6-validation-queue-health.md`
- `data/control/agent6_validation_queue.json`
- `data/control/gate_registry.json`
- `data/control/pipeline_state.json`

Machine check:

- `node scripts\validate_agent6_validation_queue.mjs`
- Result: failed with 3 issues and 2 warnings.

Queue failures:

- `agent6-spec-003-hud-runtime-validation`: missing required field `evidence_artifacts`.
- `agent6-spec-003-hud-runtime-validation`: missing required field `what_changed_since_last_agent6_ruling`.
- `agent6-spec-003-hud-runtime-validation`: `evidence_artifacts` missing or empty.

Queue warnings:

- `agent6-spec-003-hud-runtime-validation`: priority is missing or non-numeric.
- `agent6-spec-003-hud-runtime-validation`: boundary language may not clearly exclude publication/translation overclaim.

## Effective Boundary

Accepted:

- SPEC-003 may be used to structure HUD runtime validation packets.
- SPEC-003 may be used by Agent 5 to structure Agent 4 QC/runtime work.
- SPEC-003 may define required evidence for current-HUD boundary preservation, old-HUD quarantine proof, route/index/runtime checks, source/license/citation visibility, split-token/maqaf/hyphen coverage, usage-authority separation, and regression controls.

Not accepted:

- Any new HUD rollout beyond existing Agent 6 dockets.
- Public/runtime acceptance from SPEC-003 alone.
- Old-HUD public use, fallback, route exposure, or runtime activation.
- Live browser-click proof unless actual browser-click evidence is produced.
- Source/provenance acceptance.
- Publication readiness.
- Any accepted translation text.

Current HUD remains primary only within the existing Agent 6 docketed boundary in `reports/agent6-public-hud-signoff-2026-06-01.md`.

Old HUD remains `quarantined_legacy_license_risk`.

## Rationale

SPEC-003 correctly preserves the current Agent 6 HUD boundary instead of widening it. It treats the current HUD as accepted-with-boundary only and explicitly keeps publication, source/provenance, live-click proof, Reader Workbench broad rollout, route publication support, and accepted translation text outside scope.

SPEC-003 also correctly treats old HUD as a license/provenance quarantine risk, not merely an obsolete UI. The proposed block conditions are appropriate: old HUD must block if it is public-facing, routable, indexed, primary, fallback, runtime-activatable, or capable of showing source-derived evidence without current source/license/citation labeling.

The draft receives WARN rather than clean PASS because the queue intake is malformed and the spec is still a first-generation control specification. It is adequate to structure packets, but not adequate to validate any actual HUD surface without calibrated method evidence and a separate Agent 6 docket.

## Required Old-HUD Quarantine Proof

Any old-HUD quarantine / kill-switch packet under SPEC-003 must prove:

- Public navigation does not link old HUD.
- Route indexes and generated inventories do not expose old HUD.
- Generated public pages do not include stale old-HUD markers.
- Runtime imports, fallback logic, rollback paths, query-string behavior, localStorage, IndexedDB, stale bundles, and reference artifacts cannot activate old HUD publicly.
- Any retained old-HUD artifact is non-public, rollback/reference-only, and labeled quarantined.
- Any source-derived or third-party evidence surface uses current visible source/license/citation rows.
- Negative tests fail if old HUD becomes public, routable, indexed, primary, fallback, or source-evidence-capable without current labeling.

Static proof may support a warning-level packet. It is not live browser-click proof.

## Required Method Calibration

Before a high-risk SPEC-003 packet can support Agent 6 acceptance, the method must show it can detect:

- stale old-HUD marker reintroduction,
- missing rank-basis/current-HUD contract marker,
- stale `Rank details` UI,
- hidden or missing source/license/citation row,
- broken route lookup,
- answer-safety violation,
- usage evidence rendered as definition authority,
- split-token/maqaf/hyphen regression where in scope,
- old-HUD reachability through navigation, route/index, runtime, fallback, rollback, or local storage paths,
- static-only proof mislabeled as live click proof.

Calibration validates the method only. It does not accept any HUD surface.

## Required Validation Report Fields

Each SPEC-003 validation report must include:

- HUD batch/surface ID.
- Exact page/surface list.
- Current Agent 6 HUD docket cited.
- Scripts/styles/runtime files inspected.
- Public navigation paths checked.
- Route/index/generated inventory paths checked.
- Runtime/fallback/rollback paths checked.
- Current-HUD marker counts.
- Old-HUD marker counts.
- Source/license/citation visibility result.
- Route lookup result.
- Answer-safety result.
- Split-token/maqaf/hyphen result or explicit scoped exclusion.
- Usage-as-definition negative result.
- Positive and negative control results.
- Drift from `reports/agent6-public-hud-signoff-2026-06-01.md`.
- Deviations.
- Quarantined surfaces.
- Requested Agent 6 verdict.
- What must not be accepted.

## Affected Agents

- Agent 4: may use SPEC-003 as QC/runtime evidence frame for HUD packets; no self-acceptance.
- Agent 5: may use SPEC-003 to structure Agent 4 packets and queue items; must repair the malformed queue item before calling it clean.
- Agent 6: retains pass/warn/block authority and must docket any actual HUD surface verdict.
- Agent 7: may publish this WARN-ACCEPTED specification boundary only if the queue defect and warning limits are preserved.
- Agent 1: source support only where HUD-visible source/license/citation rows depend on source custody evidence; no source/provenance acceptance.

## Affected Gates

- `hud_runtime_validation_spec_gate`: WARN-ACCEPTED for draft specification-control use only.
- `hud_runtime_license_risk_gate`: unchanged; old-HUD quarantine / kill-switch packet remains queued and unaccepted.
- `hud_truth_gate`: unchanged; current HUD accepted-with-boundary remains bounded by the prior Agent 6 docket.
- `public_runtime_surface_spec_gate`: unchanged; SPEC-001 remains the broader public/runtime control frame.
- `source_provenance_custody_spec_gate`: unchanged; no source/provenance acceptance.
- `compliance_publication_gate`: unchanged; publication remains `blocked_no_render`.

## Risk Classification

Overall risk: warning for the draft specification.

Queue/control risk: blocker until Agent 5 fixes the SPEC-003 queue intake fields and reruns queue validation.

Reason: the spec text is directionally correct and necessary, but malformed queue intake is a QA control failure. A broken queue item can hide missing evidence, stale boundary language, or overclaim risk.

## Required Next Actions

1. Agent 5 must repair `data/control/agent6_validation_queue.json` for `agent6-spec-003-hud-runtime-validation`:
   - replace or supplement `evidence` with required `evidence_artifacts`,
   - add `what_changed_since_last_agent6_ruling`,
   - use numeric priority or update the validator/schema intentionally,
   - tighten boundary wording so no publication/translation, product/data, source/provenance, public/runtime, old-HUD, or live-click acceptance can be inferred.
2. Agent 5 must rerun `node scripts\validate_agent6_validation_queue.mjs` and provide the updated queue-health report.
3. Agent 5 may use SPEC-003 immediately to structure Agent 4's old-HUD quarantine / kill-switch evidence packet, but must not mark the queue clean or the packet accepted until Agent 6 dockets it.
4. Agent 4 should produce a SPEC-003-shaped old-HUD exposure report covering public navigation, route/index/generated inventories, runtime/fallback/rollback activation, source/license/citation visibility, and negative controls.
5. Agent 7 may publish this WARN-ACCEPTED SPEC-003 boundary into law/control state only if the queue blocker and warning limits remain explicit.

## What Remains Blocked Or Quarantined

- Publication remains `blocked_no_render`.
- Old HUD remains `quarantined_legacy_license_risk`.
- Old-HUD quarantine / kill-switch packet remains unaccepted.
- Public/runtime expansion remains unaccepted.
- Source/provenance remains blocked pending separate Agent 6 source docket.
- Reader Workbench broad rollout remains unaccepted.
- Definition Workbench authority remains unaccepted.
- Route publication support remains unaccepted.
- Usage-as-definition authority remains unaccepted.
- Live browser-click proof remains unclaimed.
- Accepted translation text remains unaccepted.

## Exact Boundary To Relay

```text
Agent 6 WARN-ACCEPTED SPEC-003 by docket reports/agent6-spec-003-hud-runtime-validation-verdict-2026-06-01.md for draft specification-control use only. SPEC-003 may structure Agent 4 HUD runtime packets covering current-HUD boundary preservation, old-HUD quarantine, route/index/runtime/fallback checks, source/license/citation visibility, split-token/maqaf/hyphen checks, usage-authority separation, calibration, and regression controls. It does not accept any new HUD rollout, public/runtime surface, old-HUD public use, source/provenance state, publication readiness, live browser-click proof, Reader Workbench broad rollout, Definition authority, route publication support, usage-as-definition authority, future publication path support, or accepted translation text. Publication remains blocked_no_render. Old HUD remains quarantined_legacy_license_risk. The SPEC-003 queue item is BLOCKED until Agent 5 fixes missing evidence_artifacts, missing what_changed_since_last_agent6_ruling, non-numeric priority, and boundary-overclaim wording, then reruns queue validation.
```

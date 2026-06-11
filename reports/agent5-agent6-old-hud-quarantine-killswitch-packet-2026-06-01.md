# Agent 5 -> Agent 6 Old-HUD Quarantine / Kill-Switch Packet

Generated: 2026-06-01

## Request

Request ID: `agent6-old-hud-quarantine-killswitch-coverage`

Submitted by: Agent 5

Gate: `hud_runtime_license_risk_gate`

Requested verdict: pass / warn / block for the control requirement and evidence needed to prove old-HUD public exposure is quarantined.

## Exact Scope

Validate the operational boundary that old HUD is `quarantined_legacy_license_risk`, not a public fallback or product standard.

This packet asks Agent 6 to adjudicate the control path required to prove that any old-HUD surface is pulled from public/primary use or explicitly quarantined when it is:

- Public-facing.
- Routable.
- Indexed.
- Exposed as a primary runtime path.
- Capable of showing source-derived or third-party evidence without current source/license/citation labeling.

## Evidence Artifacts

- `reports/agent6-public-hud-signoff-2026-06-01.md`
- `reports/agent5-pipeline-priority-handoff.md`
- `reports/agent5-control-notes.md`
- `data/control/pipeline_state.json`
- `data/control/gate_registry.json`
- `data/control/agent_goal_board.json`
- `reports/agent4-state.md`
- `reports/route-hud-rollout-watch.md`
- `reports/route-hud-rollout-watch.json`
- `scripts/audit_route_hud_rollout_watch.mjs`
- `scripts/validate_route_hud_page.mjs`
- `reports/agent4-reader-workbench-followup-recheck-packet-2026-06-01.md`
- `reports/reader-workbench-followup-continuity-audit.md`
- `reports/reader-workbench-followup-continuity-audit.json`

## Agent 7 Control Amendment: Dynamic / Fallback Evidence Now Queued

Added: 2026-06-01

The machine queue item `agent6-old-hud-quarantine-killswitch-coverage` in `data/control/agent6_validation_queue.json` now includes the later Agent 4 dynamic/fallback evidence packet. This amendment preserves that current queue truth so this human packet is not misread as the complete current evidence list.

Additional queued artifacts:

- `reports/agent6-old-hud-queue-preservation-receipt-2026-06-01.md`
- `reports/agent6-old-hud-static-quarantine-docket-2026-06-01.md`
- `reports/agent4-old-hud-dynamic-fallback-exposure-report-2026-06-01.md`
- `reports/agent4-old-hud-dynamic-fallback-exposure-report-2026-06-01.json`
- `reports/agent4-old-hud-dynamic-validator-evidence-2026-06-01.md`
- `reports/agent4-old-hud-dynamic-click-contract-genesis-2026-06-01.md`
- `reports/agent4-old-hud-dynamic-click-contract-genesis-2026-06-01.json`
- `scripts/audit_old_hud_dynamic_fallback.mjs`

Current queued boundary:

- Agent 6 already WARN-ACCEPTED static old-HUD quarantine evidence only in `reports/agent6-old-hud-static-quarantine-docket-2026-06-01.md`.
- Full old-HUD kill-switch control remains pending Agent 6 review of the dynamic/fallback packet.
- The dynamic/fallback packet is evidence only. It does not create live browser-click proof, public/runtime acceptance, old-HUD public-use acceptance, source/provenance acceptance, publication readiness, product/data gate acceptance, or accepted translation text.
- `hud-preview/` and `scripts/upgrade_route_hud_pages.mjs` remain quarantined reference/tooling surfaces, not public HUD acceptance.
- Deployed stale-bundle/CDN risk remains outside file evidence.

## Current Agent 5 Control Capture

- `reports/agent5-pipeline-priority-handoff.md` now names old HUD as `quarantined_legacy_license_risk`.
- `data/control/pipeline_state.json`, `data/control/gate_registry.json`, and `data/control/agent_goal_board.json` now include the old-HUD quarantine boundary.
- Agent 4 route decision is `HELD_ACTIVE_AGENT_4_NO_INTERRUPT` because `reports/agent4-state.md` shows active bounded HUD/runtime work.
- Agent 5 has not prompted Agent 4 again.

## Claimed Boundary

Control/queue packet only.

Current HUD remains primary only within the existing Agent 6 accepted-with-boundary HUD/runtime-source docket.

Old HUD may be retained only as non-public rollback/reference evidence unless Agent 6 reopens and validates it.

This packet does not claim:

- Publication readiness.
- Source/provenance acceptance.
- Broad HUD or Reader Workbench rollout.
- Live browser-click proof.
- Old-HUD public-use acceptance.
- Accepted translation text.

## Required Public Reachability Checks

Agent 4 or Agent 6 validation should produce recountable evidence for:

- Public navigation surfaces do not link old HUD as primary.
- Route/index surfaces do not expose old HUD as primary.
- Generated public pages do not expose old HUD runtime paths as primary.
- Rollback/reference artifacts are non-public or explicitly quarantined.
- Any page capable of showing source-derived evidence uses current source/license/citation labeling.

## Required Route / Index Checks

Evidence should include:

- Exact paths searched for old-HUD markers.
- Exact public route/index files checked.
- Exact generated pages sampled.
- Exact old-HUD markers used for detection.
- Whether any match is public, routable, indexed, rollback-only, or non-public reference.

## Required Source / License Row Visibility Checks

For any old-HUD exposure candidate, verify whether displayed evidence has:

- `source_name`.
- `source_id` or stable source reference.
- Citation or location label.
- License label.
- License URL where available.
- Non-misleading source/license/citation display in the current public UI.

## Negative Tests

Validation should explicitly fail or warn if:

- Old HUD is reachable by public navigation.
- Old HUD is reachable by public route/index path.
- Old HUD is used as primary runtime.
- Old HUD can render source-derived evidence without current source/license/citation rows.
- Current HUD accepted-with-boundary is widened into publication readiness.
- Old HUD is treated as a safe fallback without Agent 6 reopening and validating it.

## What Changed Since Last Agent 6 HUD Ruling

Agent 6 previously signed off on the new public reader HUD as accepted-with-boundary in `reports/agent6-public-hud-signoff-2026-06-01.md`, with explicit instruction not to restore old HUD.

New user-relayed Agent 6 operational directive clarifies that old HUD is a license/provenance risk boundary: `quarantined_legacy_license_risk` if public, routable, indexed, primary, or able to display source-derived/third-party evidence without current source/license/citation labeling.

Agent 5 has recorded this boundary in Agent 5-owned handoff/control surfaces but has not produced full route/index/public reachability proof.

## Known Risks

- Old HUD remains framed as legacy UI instead of license/provenance risk.
- Public route/index/runtime exposure of old HUD is missed.
- Current HUD accepted-with-boundary is accidentally widened into publication readiness.
- Source-derived evidence appears without current source/license/citation rows.
- Agent 4 is interrupted unnecessarily while already active.
- Rollback/reference artifacts become public by accident.

## What Must Not Be Accepted

- Publication readiness.
- Publication-path support.
- Source/provenance acceptance.
- Old HUD public use.
- Current HUD broad rollout beyond existing Agent 6 dockets.
- Live browser-click proof from static checks.
- Worker evidence as passed QA.
- Route/HUD/usage evidence as publication support.
- SOP/spec clean PASS or law changes.

## Requested Agent 6 Disposition

Please issue a pass / warn / block docket for the old-HUD quarantine / kill-switch control path, or direct Agent 4 to produce a specific old-HUD exposure report if the current evidence is insufficient.

If Agent 4 must act, recommended bounded target:

- Old-HUD exposure report.
- Public navigation/index/route checks.
- Runtime path checks.
- Source/license/citation visibility checks.
- Negative tests proving old HUD is not primary/public, or exact exposed paths requiring quarantine/removal.

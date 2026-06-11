# Agent 7 Broader Public Runtime Drift Validator Hardening - 2026-06-02

## Purpose
Keep broader live Genesis and `/hud-preview/` public-runtime drift separate from the Deuteronomy P0 owner-route blocker.

## Change
Updated `scripts/validate_agent7_governance_control.mjs` with a dedicated `broader public-runtime drift boundary` check.

The check verifies:

- Agent 6 queue status remains `returned_blocker_preserved_broader_public_runtime_drift_warn_accepted_local_hud_preview_quarantine_only`.
- Agent 6 returned docket remains `reports/agent6-hud-preview-pages-stale-after-quarantine-recheck-2026-06-02.md`.
- Agent 7 pulse broader-drift status remains `blocker_preserved_hud_preview_pages_stale_after_repo_local_quarantine_attempt`.
- Deuteronomy P0 remains first.
- Genesis and `/hud-preview/` drift stay separate from Deuteronomy P0.
- Broader drift requires post-remediation live evidence or exact Pages/deployment blocker.
- Local/raw quarantine evidence does not clear the live public surface.
- `/hud-preview/` is not resolved until live proof contains `data-public-runtime-quarantine` or an intentionally non-public status.

Updated Agent 7 validator registration mirrors in:

- `data/control/pipeline_state.json`
- `data/control/gate_registry.json`
- `data/control/agent_goal_board.json`
- `data/control/pulse_state.json`
- `data/control/agent7_pulse_state.json`
- `data/control/overnight_autonomy_state.json`

## Validation
Post-change checks:

- `node scripts\validate_agent7_governance_control.mjs` passed with 1 known warning.
- `node scripts\validate_agent6_validation_queue.mjs` passed with 0 warnings.
- `node scripts\validate_agent5_control_readiness.mjs` passed with 3 known warnings.

## Boundary
Governance validator hardening only. This does not create live Genesis public/runtime clearance, live `/hud-preview/` public/runtime clearance, public/runtime acceptance, old-HUD public use, deployment/CDN/cache closure, source/provenance custody, publication readiness, route publication support, product/data acceptance, Definition authority, usage-as-definition authority, Reader Workbench broad rollout, live Deuteronomy public-runtime clearance, or accepted translation text.

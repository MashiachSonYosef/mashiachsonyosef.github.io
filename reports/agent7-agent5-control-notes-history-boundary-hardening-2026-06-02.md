# Agent 7 Agent 5 Control Notes History Boundary Hardening - 2026-06-02

## Purpose
Prevent older Agent 5 control-note history from being reused as current guidance after later Agent 6 dockets and Agent 7 control packets superseded it.

## Change
Added a `Current Notes Boundary` section near the top of `reports/agent5-control-notes.md`.

The boundary says current operating guidance comes from the dated top sections and current control artifacts. Lower historical sections preserve prior decisions and superseded states for audit context only, especially older:

- direct-55/audit-13 source-scope states
- direct-19/audit-13 source-scope states
- direct-13/audit-13 source-scope states
- no-goal states
- proof-loop states
- old-HUD states

Updated `scripts/validate_agent7_governance_control.mjs` so `checkAgent5CurrentHandoffGuidance()` requires this history boundary in the current header.

## Validation
Post-change checks:

- `node scripts\validate_agent7_governance_control.mjs` passed with 1 known warning.
- `node scripts\validate_agent6_validation_queue.mjs` passed with 0 warnings.
- `node scripts\validate_agent5_control_readiness.mjs` passed with 3 known warnings.

## Boundary
Control-note history hardening only. This does not create public/runtime acceptance, source/provenance custody, publication readiness, route publication support, product/data acceptance, Definition authority, usage-as-definition authority, old-HUD public use, live Deuteronomy public-runtime clearance, worker-output acceptance, or accepted translation text.

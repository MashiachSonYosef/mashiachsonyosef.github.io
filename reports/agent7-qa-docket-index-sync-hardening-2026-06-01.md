# Agent 7 QA Docket Index Sync Hardening

Generated: 2026-06-01T16:53:57.109Z

## Decision

- Continue validated-only governance; no worker interruption is required from this correction.
- Treat `data/control/agent6_validation_queue.json` as the canonical Agent 6 queue and `data/control/qa_docket_index.json` as a generated recountable index.
- Do not use the QA docket index as acceptance. It is queue/docket control truth only.

## What Changed

- Added `scripts/build_qa_docket_index.mjs` so the QA docket index can be rebuilt from the Agent 6 validation queue instead of hand-maintained.
- Rebuilt `data/control/qa_docket_index.json` from queue version 19; docket count is 14.
- Added QA docket index sync coverage to `scripts/validate_agent7_governance_control.mjs`.
- Preserved Agent 6 boundaries: WARN stays WARN, PASS stays narrow, queued stays awaiting Agent 6, and blocked_no_render remains global.

## Boundary Preserved

- Publication remains `blocked_no_render`.
- Source/provenance custody remains blocked; direct-23/audit-23 is report-truth only and all 23 source files remain quarantined.
- Old HUD remains `quarantined_legacy_license_risk` pending dynamic/fallback Agent 4 evidence and Agent 6 docket.
- SPEC/SOP entries remain specification/workflow/lane-control only unless Agent 6 separately dockets product/data acceptance.
- No public/runtime surface, route publication support, Definition authority, usage-as-definition authority, or accepted translation text is accepted by this correction.

## Verification

- `node scripts\build_qa_docket_index.mjs` passed.
- `node scripts\validate_agent6_validation_queue.mjs` passed with 0 warnings.
- `node scripts\validate_agent7_governance_control.mjs` passed with 1 expected warning about legacy `data/workbench-evidence/handoff-index.json`; current authority remains `data/workbench-evidence/public-handoff-index.json`.
- `node scripts\validate_agent5_control_readiness.mjs` passed with 3 known warnings: route release pass-with-warnings/input-freeze drift, legacy workbench handoff index, and stale HUD contract marker hits covered by current validators/release stamps.

## Agent 5 Direction

- On the next natural tick, use `node scripts\build_qa_docket_index.mjs` after meaningful Agent 6 queue edits before citing `data/control/qa_docket_index.json`.
- Do not prompt active Agents 1-4 solely because of this correction.
- Route only new evidence packets, blocker changes, or drift corrections to Agent 6.

## Agent 6 Queue Need

- No new Agent 6 verdict is requested. This is a mechanical control sync, already bounded by existing Agent 6 queue/docket law.

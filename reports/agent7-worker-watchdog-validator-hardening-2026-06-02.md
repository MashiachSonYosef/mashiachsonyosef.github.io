# Agent 7 Worker Watchdog Validator Hardening - 2026-06-02

## Purpose
Harden Agent 7 governance control around the SOP-001/SOP-014 worker-watchdog law so stale/no-goal/delivery-blocked details cannot drift into primary goal-board status or be treated as seeded goals without delivery proof.

## Change
Updated `scripts/validate_agent7_governance_control.mjs` with a dedicated `worker watchdog delivery-proof boundary` check.

The check verifies:

- `idle_no_goal`, `stale_goal`, and `delivery_blocked` are not allowed primary goal-board statuses.
- Existing goals do not use those values as primary `status`.
- SOP/control surfaces document secondary detail fields: `worker_state_detail`, `delivery_state`, `stale_reason`, `goal_recovery_status`, and `next_agent5_action`.
- A prepared prompt without delivery proof is not a seeded goal.
- Agent 5/Agent 7 must not return `DONT_NOTIFY` while a P0 idle/no-goal worker delivery blocker remains open.
- Active workers remain suppressed from prompts unless escalation conditions apply.
- Agent 6's watchdog queue boundary preserves the same constraints.

Updated Agent 7 validator registration mirrors in:

- `data/control/pipeline_state.json`
- `data/control/gate_registry.json`
- `data/control/agent_goal_board.json`
- `data/control/pulse_state.json`
- `data/control/agent7_pulse_state.json`
- `data/control/overnight_autonomy_state.json`

## Queue Boundary Wording Repair
Added explicit durable wording to `data/control/agent6_validation_queue.json` for the SOP-001/SOP-014 watchdog item:

- `idle_no_goal`, `stale_goal`, and `delivery_blocked` are secondary detail fields only.
- A prepared prompt without delivery proof is not a seeded goal.
- Active workers remain uninterrupted unless escalation conditions apply.

This is a control-language repair only. It does not change Agent 6's verdict, primary status model, worker lane state, or any product/runtime boundary.

## Validation
Post-change checks:

- `node scripts\validate_agent7_governance_control.mjs` passed with 1 known warning.
- `node scripts\validate_agent6_validation_queue.mjs` passed with 0 warnings.
- `node scripts\validate_agent5_control_readiness.mjs` passed with 3 known warnings.

## Boundary
Governance validator hardening only. This does not create Agent 5 QA authority, Agent 7 QA authority, worker-report acceptance, source/provenance custody, public/runtime acceptance, publication readiness, product/data acceptance, Reader Workbench broad rollout, Definition authority, usage-as-definition authority, route publication support, or accepted translation text.

# Agent 7 Source Custody Validator Hardening - 2026-06-02

## Purpose
Prevent corrected Agent 1 custody/reliance mapping evidence from being widened into source/provenance custody acceptance.

## Change
Updated `scripts/validate_agent7_governance_control.mjs` with a dedicated `corrected source/provenance custody mapping boundary` check.

The check verifies:

- Agent 6 queue status remains `returned_warn_accepted_corrected_custody_mapping_only_source_provenance_blocked`.
- Agent 6 returned docket remains `reports/agent6-agent1-corrected-custody-recheck-verdict-2026-06-02.md`.
- Agent 1 goal and Agent 7 pulse mirror the same WARN-only custody status.
- Corrected packet evidence stays scoped to custody/reliance mapping evidence only.
- Source/provenance acceptance remains blocked.
- Key evidence counts remain present: 23 untracked quarantined sources, six modified tracked source files outside acceptance, 29/29 SHA-256 source rows, 0 visible source/license row misses, 23/23 and 6/6 downstream reliance hits, six missing lexical manifests, 242 downstream direct artifact rows, and 61 downstream content-reference rows.
- Follow-up remains limited to custody/tracking/exclusion, six modified tracked source disposition, or missing lexical manifest remediation under future Agent 6 docket.

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
Governance validator hardening only. This does not create source/provenance custody acceptance, source publication, page/render acceptance, public/runtime acceptance, publication readiness, future publication support, route publication support, Definition authority, product/data acceptance, accepted translation text, acceptance of the six modified tracked source files, or worker evidence as Agent 6 acceptance.

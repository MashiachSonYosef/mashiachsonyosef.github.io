# Agent 7 Agent 8/9 Boundary Hardening

Date: 2026-06-01
Authority: Agent 7 strategy/control

## Correction

Agent 8's charter still referenced the stale source/provenance `direct 19 vs audit 13` blocker. Agent 6 has superseded that count contradiction for source-scope/report truth only.

Updated `reports/agent8-prompter-initial-charter-2026-06-01.md` so Agent 8 watches the current boundary instead:

- direct-23/audit-23 source-scope/report-truth WARN
- all 23 untracked source files remain quarantined
- source/provenance custody and future publication reliance remain blocked
- six modified tracked source files remain outside the 23-file docket

## Validator Hardening

Expanded `scripts/validate_agent7_governance_control.mjs` with:

- Agent 8 pressure-boundary check
- Agent 9 oracle-boundary check

The validator now catches:

- Agent 8 stale direct-19/audit-13 source wording
- Agent 8 bypass of Agent 5 or QA/publication overclaim
- Agent 9 loss of external/no-thread/no-idle-prompt boundary
- Agent 9 worker-routing, goal-seeding, QA, SOP, or publication authority overclaim

## Validation

- Agent 7 governance control: pass, 1 expected warning.
- Agent 6 validation queue: pass, 0 warnings.
- Agent 5 control readiness: pass, 3 known warnings.

## Preserved Boundary

This is control hardening only. It does not create QA acceptance, source/provenance custody, public/runtime acceptance, route publication support, publication readiness, product/data gate acceptance, or accepted translation text.

Publication remains `blocked_no_render`.

# Agent 10 IT Hourly Pulse Runbook

Generated: 2026-06-01T20:43:50-04:00
Agent: Agent 10 / ITer-10
Workspace: `C:\Users\owner\Documents\translations`
Status: organizational runbook only

## Purpose

Keep IT monitoring orderly without interfering with Agent 6 QA/compliance authority or Agent 7 company/priority authority.

This runbook defines how Agent 10 should pulse, what can be touched, what must not be touched, and how every IT-side file change is disclosed.

## Authority Boundary

Agent 10 may observe, validate, and report.

Agent 10 does not accept QA work, clear blockers, promote publication, change Agent 6 rulings, or route worker lanes around Agent 5.

Agent 6 remains the QA/compliance authority. Agent 7 remains the company/priority authority.

## Hourly Pulse Checklist

Use this checklist when an active IT session or explicit scheduled runner is available:

1. Record timestamp.
2. Count git dirty paths without staging or reverting anything.
3. Record `origin/main...HEAD` ahead/behind counts.
4. Run `node scripts\validate_agent6_validation_queue.mjs`.
5. Run `node scripts\validate_agent7_governance_control.mjs`.
6. Read `reports/agent6-validation-queue-health.md`.
7. Read `reports/agent7-governance-control-health.md`.
8. Check for new `agent1-*`, `agent6-*`, `agent7-*`, and `agent10-*` reports since the last IT pulse, because Agent 1 source/provenance packets are high-risk inputs for Agent 6.
9. Write a dated `reports/agent10-it-pulse-*.md` report.
10. Update or create a dated Agent 10 change ledger entry.

## Actionability Rule

Write an Agent 7-facing memo only if a finding is actionable for priority, deployment, public-runtime exposure, authority drift, validator drift, or repo operability.

Do not write an Agent 7 memo for routine pass results or already-docketed known warnings unless the state changed.

## Safe File Classes

Agent 10 may write:

- `reports/agent10-*.md`
- `scripts/run_agent10_it_pulse.ps1`
- `scripts/run_agent10_it_pulse_scheduled.cmd`

Agent 10 may cause validator refreshes to:

- `reports/agent6-validation-queue-health.md`
- `reports/agent7-governance-control-health.md`

Any validator-refreshed files must be disclosed in the pulse report and change ledger.

## Hourly Runner And Scheduler Status

Manual runner:

- `scripts/run_agent10_it_pulse_scheduled.cmd`

Background loop:

- Start command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\start_agent10_it_pulse_loop.ps1 -IntervalMinutes 60 -RunImmediately`
- Stop command: `scripts\stop_agent10_it_pulse_loop.ps1`
- PID file: `reports/agent10-it-loop.pid`
- Heartbeat: `reports/agent10-it-loop-heartbeat.md`
- Verified status: running and sleeping after successful pulse at 2026-06-01 21:30 local time.

Windows scheduled task status:

- Task name attempted: `Agent10TranslationsITPulse`
- Status after verification: removed.
- Reason: Task Scheduler executions refreshed validator health but did not finish with a pulse report; the task was terminated and deleted to avoid hidden broken automation.

Manual run command:

- `scripts\run_agent10_it_pulse_scheduled.cmd`

The runner and loop must remain monitoring-only. They may write Agent 10 pulse, ledger, loop heartbeat/PID, scheduled-task log, and machine-triggered Agent 7 memo files, and they may refresh the two validator health reports. They must not edit Agent 6 dockets, Agent 6 queue/status JSON, public/generated pages, source/lexical/route/control data, or Agent 6/7 validator scripts.

## Restricted File Classes

Agent 10 must not modify these without explicit user instruction and a separate report:

- `data/control/*.json`
- `data/lexical/**`
- `data/sources/**`
- `data/definitions/**`
- public `index.html` pages
- public `overlay-export.*` artifacts
- Agent 6 dockets
- Agent 6 queue statuses or verdicts
- Agent 7 priority/control decisions
- scripts that enforce Agent 6 or Agent 7 validators

## Team Notice Standard

Every pulse report must include:

- Files directly authored by Agent 10.
- Files refreshed by validators.
- Commands run.
- Findings.
- Whether an Agent 7 memo was created.
- Explicit `Not Accepted` scope.

## Current Known Baseline

As of this runbook:

- Publication remains `blocked_no_render`.
- Agent 6 queue health passes with 0 warnings.
- Agent 7 governance health passes with 1 known warning.
- Known warning: legacy workbench `handoff-index.json` has 0 manifests; `public-handoff-index.json` remains current authority.
- Agent 7 has already ingested Agent 6's governance-validator drift docket and preserved the latest Agent 6 Reader Workbench follow-up boundaries.

## Not Accepted

This runbook does not accept:

- publication readiness,
- source/provenance custody,
- public/runtime clearance,
- old-HUD public use,
- Reader Workbench broad rollout,
- Definition authority,
- route publication support,
- usage-as-definition authority,
- accepted translation text.

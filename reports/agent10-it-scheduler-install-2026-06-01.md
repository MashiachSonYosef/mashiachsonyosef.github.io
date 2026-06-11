# Agent 10 IT Scheduler Install

Generated: 2026-06-01T20:58:22-04:00
Agent: Agent 10 / ITer-10
Workspace: `C:\Users\owner\Documents\translations`

## Purpose

Install a bounded hourly Agent 10 IT pulse runner in response to the user's request for hourly IT pulses and Agent 7 escalation when actionable.

## Installed Task Attempt

Final status: superseded / removed after failed verification.

Reason:

- The scheduled task launched and refreshed validator health reports but did not finish by writing a pulse report.
- A wrapper and timeout-enabled runner were tested manually and worked, but forced Task Scheduler runs still remained `Running`.
- The task was terminated and deleted to avoid hidden broken automation.

- Task name: `Agent10TranslationsITPulse`
- Command: `cmd.exe /c C:\Users\owner\Documents\translations\scripts\run_agent10_it_pulse_scheduled.cmd`
- Schedule: every 1 hour.
- Start date: 2026-06-01.
- First observed next run: 2026-06-01 21:03 local time.
- Status: Ready.
- Scheduled task state: Enabled.
- Run-as user: `owner`.
- Logon mode observed: interactive only.

Removal command used:

- `schtasks /Delete /TN Agent10TranslationsITPulse /F`

## Runner Behavior

The manual runner:

- counts dirty git paths,
- records `origin/main...HEAD`,
- records latest commit,
- runs `node scripts\validate_agent6_validation_queue.mjs`,
- runs `node scripts\validate_agent7_governance_control.mjs`,
- writes a dated `reports/agent10-it-pulse-*.md`,
- appends to the dated Agent 10 change ledger,
- creates an Agent 7 memo only for machine-detected escalation conditions.

Machine-detected Agent 7 escalation conditions:

- Agent 6 validation queue does not pass or has warnings.
- Agent 7 governance control does not pass or has issues.
- Agent 7 warning count exceeds the known one-warning baseline.
- Local branch is behind `origin/main`.

## Permitted File Effects

Direct Agent 10 runner writes:

- `reports/agent10-it-pulse-*.md`
- `reports/agent10-it-change-ledger-*.md`
- `reports/agent10-agent7-it-actionable-findings-*.md`, only if escalation conditions are detected
- `reports/agent10-scheduled-task-last.md`

Validator refreshes:

- `reports/agent6-validation-queue-health.md`
- `reports/agent7-governance-control-health.md`

## Restricted File Effects

The runner must not edit:

- Agent 6 dockets,
- Agent 6 queue/status JSON,
- Agent 7 control decisions,
- public/generated pages,
- source files,
- lexical data,
- route data,
- control-state JSON,
- Agent 6/7 validator scripts.

## Disable Command

The scheduled task has already been removed. If it is recreated later, use this command to remove it:

```powershell
schtasks /Delete /TN Agent10TranslationsITPulse /F
```

## Not Accepted

This install does not accept:

- publication readiness,
- source/provenance custody,
- public/runtime clearance,
- old-HUD public use,
- Reader Workbench broad rollout,
- Definition authority,
- route publication support,
- usage-as-definition authority,
- accepted translation text.

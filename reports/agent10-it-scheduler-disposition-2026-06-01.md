# Agent 10 IT Scheduler Disposition

Generated: 2026-06-01T21:21:26-04:00
Agent: Agent 10 / ITer-10
Workspace: `C:\Users\owner\Documents\translations`

## Verdict

Windows Scheduled Task automation is not accepted as working.

The task was removed to avoid hidden broken automation.

## Evidence

Task attempted:

- `Agent10TranslationsITPulse`

Observed behavior:

- Raw PowerShell task execution refreshed `reports/agent6-validation-queue-health.md` and `reports/agent7-governance-control-health.md`, but did not finish with an Agent 10 pulse report.
- Wrapper task execution also refreshed validator health but did not finish with an Agent 10 pulse report.
- Manual wrapper execution succeeded and wrote `reports/agent10-it-pulse-2026-06-01-2114.md`.

Action taken:

- Terminated the stuck task instance.
- Deleted scheduled task `Agent10TranslationsITPulse`.

## Current Safe Operating Mode

Use the background loop:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\start_agent10_it_pulse_loop.ps1 -IntervalMinutes 60 -RunImmediately
```

Stop the loop:

```powershell
scripts\stop_agent10_it_pulse_loop.ps1
```

Heartbeat:

- `reports/agent10-it-loop-heartbeat.md`

Manual one-shot runner:

```powershell
scripts\run_agent10_it_pulse_scheduled.cmd
```

This writes a pulse and refreshes the two validator health reports without editing Agent 6 queue/status files, Agent 6 dockets, public pages, source data, lexical data, route data, control JSON, or Agent 6/7 validator scripts.

## Remaining Gap

Windows Task Scheduler operation is not proven and remains removed.

Session-resident hourly background-loop operation is verified for startup, immediate pulse, heartbeat, and sleep state.

## Not Accepted

This disposition does not accept:

- publication readiness,
- source/provenance custody,
- public/runtime clearance,
- old-HUD public use,
- Reader Workbench broad rollout,
- Definition authority,
- route publication support,
- usage-as-definition authority,
- accepted translation text.

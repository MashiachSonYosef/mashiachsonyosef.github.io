# Agent 10 IT Loop Heartbeat

Updated: 2026-06-10T20:23:14-04:00
Process ID: 23212
Interval minutes: 60
Status: sleeping
Detail: Last pulse exit code: 0.

Stop command:

```powershell
scripts\stop_agent10_it_pulse_loop.ps1
```

Boundary: Agent 10 loop only invokes scripts\run_agent10_it_pulse_scheduled.cmd; it must not edit Agent 6 dockets, Agent 6 queue/status files, public/generated pages, source/lexical/route/control data, or Agent 6/7 validator scripts.

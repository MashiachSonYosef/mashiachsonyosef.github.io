# Agent Pulse Coverage Audit

Generated: 2026-06-01T21:56:25.073Z

Verdict: pass

Automation root: C:/Users/owner/.codex/automations
Registry: data/control/agent_registry.json

## Coverage

| agent | status | cadence | target | goal terms | note |
|---|---|---:|---|---|---|
| Agent 1 | PAUSED | none | ok | ok | scheduled pulse paused; Agent 5 activates this lane when needed |
| Agent 2 | PAUSED | none | ok | ok | scheduled pulse paused; Agent 5 activates this lane when needed |
| Agent 3 | PAUSED | none | ok | ok | scheduled pulse paused; Agent 5 activates this lane when needed |
| Agent 4 | PAUSED | none | ok | ok | scheduled pulse paused; Agent 5 activates this lane when needed |
| Agent 5 | ACTIVE | 30m | ok | ok |  |
| Agent 6 | ACTIVE | 240m | ok | ok |  |
| Agent 7 | ACTIVE | 240m | ok | ok |  |

## Issues

- none

## Warnings

- none

## Boundary

- This validates app heartbeat coverage only.
- It does not prove agent execution quality or acceptance of any project gate.
- Agent 6 remains validation/signoff authority; publication remains blocked_no_render.


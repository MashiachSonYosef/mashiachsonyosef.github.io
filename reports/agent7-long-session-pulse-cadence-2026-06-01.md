# Agent 7 Long-Session Pulse Cadence

Generated: 2026-06-01T09:00:41-04:00

## CEO Decision

Adopt the user's cap-conservation model.

Short prompt churn is now treated as a usage risk. The operating target is fewer scheduled prompts and longer useful work sessions.

## New Cadence

| agent | cadence | route | work target |
|---|---:|---|---|
| Agents 1-4 | no scheduled pulse | Agent 5 prompts when idle/stale or needed | minimum 20m when activated; prefer 60m; 2-4h ideal for hard bounded tasks |
| Agent 5 | 30m | coordinator and middle manager | minimum 20m; prefer 30-60m; can batch fanout when several lanes are stale |
| Agent 6 | 4h | validation queue/dockets | validate evidence; cannot approve what is not validated |
| Agent 7 | 4h | CEO mission oversight | priority/control artifacts, not quick status checks |

## Standing Boundaries

- Publication remains `blocked_no_render`.
- Source/provenance remains blocked by direct 55 untracked source JSON files vs audit 13.
- Reader Workbench is accepted only for eight included representative pages.
- Definition Workbench sample remains WARN until machine-derived `verified` is renamed or split from reviewed authority.
- Usage and route data remain non-publication evidence.

## Automation Changes

- Paused Agent 1 scheduled heartbeat.
- Paused Agent 2 scheduled heartbeat.
- Paused Agent 3 scheduled heartbeat.
- Paused Agent 4 scheduled heartbeat.
- Changed Agent 5 from 10m to 30m coordinator work session.
- Kept Agent 6 at 4h and strengthened validation-specific instructions.
- Changed Agent 7 from 60m to 4h mission oversight.

## Agent 5 Direction

Agent 5 now owns keeping Agents 1-4, Agent 6, and Agent 7 moving without prompt spam. Agent 5 should not send generic keepalives. Agent 5 should prompt idle/stale workers with bounded lane work, queue Agent 6 only with validation evidence, and prompt Agent 7 only with decision packets or mission-level conflicts.

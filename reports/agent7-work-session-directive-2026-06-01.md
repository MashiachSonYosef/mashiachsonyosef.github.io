# Agent 7 Work Session Directive

Generated: 2026-06-01T03:23:11-04:00

## Decision

Agent 7 should run often, but not as a worker loop that competes with Agents 1-4. The correct shape is a CEO work session: longer than a status pulse, bounded by priority control, and expected to leave one concrete artifact, validator result, queue update, or routed packet.

## Cadence

- Default CEO pulse: 60 minutes.
- Fast CEO pulse: 30 minutes only after gate change, Agent 6 docket, worker blocker, Agent 5 priority fork, or new user direction.
- Useful Agent 7 work session while active: 20-45 minutes.
- Stop only when the next safe unit is complete or the next step waits on another agent, user direction, Agent 6 co-sign, broad render, destructive action, or legal/source policy.

## Current Session Output

- Updated `data/control/pulse_state.json` with Agent 7 work-session expectations.
- Updated `reports/agent7-agent5-pulse-protocol.md` with stop conditions and the current Agent 4 routing state.
- Updated `data/control/agent7_pulse_state.json` to reflect that direct messaging is available in this session.
- Updated `data/control/agent_registry.json` so the registry no longer treats Agent 7 as only a short pulse lane.
- Updated `data/control/relay_state.json` with the Agent 4 Reader Workbench expansion relay.
- Sent Agent 4 a non-interrupting bounded Reader Workbench packet:
  - target: `019e7be8-19d9-79f3-b193-08b5f047ec86`
  - submission: `019e8210-88c0-7310-8fae-1af08efad58a`
- Added `scripts/audit_untracked_source_scope.mjs` and generated `reports/untracked-source-scope-audit.md/json`.
- Refreshed source-scope boards to 13 untracked source files, with `Public Domain: 10727` and `CC-BY: 72419`.
- Sent Agent 1 a non-interrupting source-scope correction:
  - target: `019dc487-5973-7693-aebf-fb0a75936f50`
  - first submission: `019e8216-3fd4-77b0-b3cf-0902d087fb0f`
  - follow-up submission superseding the prior prompt: `019e821a-4222-72b1-9737-7554cf0f13c6`

## Next Control Rule

Agent 7 should normally route Agents 1-4 through Agent 5. Agent 5 should not duplicate the Agent 4 prompt. The bounded Reader Workbench expansion packet is now queued for Agent 6 recheck; the next useful Agent 5 tick is to watch for Agent 6 pass/warn/block and avoid any direct Agent 4 follow-up.

Agent 4 direct Agent 7 queueing is frozen after the 2026-06-01 saturation signal unless the user or Agent 6 explicitly escalates.

Publication remains `blocked_no_render`.

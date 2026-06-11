# Oracle 9 Agent 1 Live Thread Restore Proof - 2026-06-05

Status: restored

## Restored Thread

- Agent: Agent 1
- Live thread id: `019e975d-dc9f-7020-a7c8-885d083a837e`
- Canonical title: `Agent 1 - importer`
- Lane: source/license/custody and Hebrew import/source-lane classification
- Initial target: `old-dictionary-excluded-row-license-lane-reaudit`

## Archived Thread

- Old Agent 1 thread id: `019dc487-5973-7693-aebf-fb0a75936f50`
- DB status: `archived=1`
- Policy: do not use as current capacity

## Proof Checked

- `C:\Users\owner\.codex\state_5.sqlite`: `integrity_check=ok`
- `C:\Users\owner\.codex\goals_1.sqlite`: `integrity_check=ok`
- `state_5.sqlite.threads` for new Agent 1: `archived=0`, cwd `C:\Users\owner\Documents\translations`, title `Agent 1 - importer`
- `goals_1.sqlite.thread_goals` for new Agent 1: `status=active`
- `agent-1-source-provenance-60m-pulse`: `status=ACTIVE`, `target_thread_id=019e975d-dc9f-7020-a7c8-885d083a837e`
- `agent-1-custody-recovery-goal`: still `PAUSED`, moved off the archived thread id
- `read_thread` check returned the new Agent 1 thread as active and currently in progress on source-lane work

## Repo Control Updated

- `data/control/agent_registry.json` now records the live Agent 1 id in:
  - `agents[]`
  - `current_thread_locator`
  - `current_agent1_locator`
  - `thread_title_canonical_restore_lock`
  - `agent1_live_restore_2026_06_05`
- `reports/sop-021-current-action-preservation-and-drift-control.md` records the new live id and the archived-old-id ban.
- `reports/thread-tool-timeout-rule-2026-06-05.md` records the archived-id restore failure rule and heartbeat-target proof requirement.
- `state_5.sqlite` canonical thread titles are locked for Agents 1-14 as `Agent N - role`; Agents 1, 2, 3, 4, and 10 have `goals_1.sqlite` status `active` and hourly ACTIVE heartbeat targets.

## Timeout Rule

Do not use `list_threads` for restore. Use DB-backed proof first. If any thread tool stalls, stop and emit:

`thread_tool_timeout | tool | thread_id | intended_agent | elapsed_seconds | next_safe_action`

## Boundary

No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, accepted text, publication readiness, release action, public/runtime mutation, or destructive repo action is created by this restore proof.

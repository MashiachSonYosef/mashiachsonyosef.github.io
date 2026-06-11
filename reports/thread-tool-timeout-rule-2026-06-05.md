# Thread Tool Timeout Rule

Status: active local control rule
Set by: Oracle 9
Date: 2026-06-05

## Rule

All Codex thread operations must use timeout discipline.

- Do not use `list_threads` for restore or routing unless the owner explicitly requests it.
- Use locked thread IDs from `data/control/agent_registry.json`.
- Verify actual app titles in `C:\Users\owner\.codex\state_5.sqlite`, not `session_index.jsonl` alone.
- Verify actual goal state in `C:\Users\owner\.codex\goals_1.sqlite`.
- Run one thread operation at a time.
- Do not call multiple thread tools in parallel during restore.
- If a thread operation does not return quickly, stop and report an exact blocker instead of retrying or searching paths.

## Timeout

- Default timeout: 20 seconds.
- Hard stop: 40 seconds.

## Applies To

- `send_message_to_thread`
- `set_thread_title`
- `set_thread_pinned`
- `read_thread`
- `list_threads`

## Failure Packet

Use this exact shape:

`thread_tool_timeout | tool | thread_id | intended_agent | elapsed_seconds | next_safe_action`

## Restore Meaning

Restore is not proven by clean files alone.

Minimum restore proof:

- `state_5.sqlite integrity_check=ok`.
- `goals_1.sqlite integrity_check=ok`.
- `state_5.sqlite.threads.title` matches the canonical `Agent N - role` titles.
- `state_5.sqlite.threads.archived=0` for the current target; archived thread IDs are not callable capacity.
- `goals_1.sqlite.thread_goals.status` is `active` for Agents 1, 2, 3, 4, and 10.
- Those goals use weekly lexicon expansion objectives, not stale wartime/Orot-only goals.
- Any heartbeat automation for Agents 1, 2, 3, 4, or 10 targets the same live thread ID recorded in the registry and is not pointed at an archived predecessor.
- `usage_limited` on Agents 1, 2, 3, 4, or 10 is a restore failure.

2026-06-05 Agent 1 restore proof: new Agent 1 is `019e975d-dc9f-7020-a7c8-885d083a837e`, title `Agent 1 - importer`, `archived=0`, active in `goals_1.sqlite`, and targeted by `agent-1-source-provenance-60m-pulse`. Old Agent 1 `019dc487-5973-7693-aebf-fb0a75936f50` is archived and must not be used.

2026-06-05T22:53Z SOP-022 restore proof: `state_5.sqlite integrity_check=ok`; `goals_1.sqlite integrity_check=ok`; Agents 1/2/3/4/10 have canonical titles, `archived=0`, and `thread_goals.status=active`; old Agent 1 is titled `Archived old Agent 1 - do not use` with `archived=1`. Backups were written at `C:\Users\owner\.codex\state_5.sqlite.restore-2026-06-05T22-52-02-700Z.bak` and `C:\Users\owner\.codex\goals_1.sqlite.restore-2026-06-05T22-53-06-744Z.bak`. Proof artifact: `reports/oracle9-sop22-restore-proof-2026-06-05.md`.

Superseding restore correction, 2026-06-05T23:12Z: thread `019e975d-dc9f-7020-a7c8-885d083a837e` proved app-broken with `systemError` / latest turn `interrupted`; replacement Agent 1 is `019e9a07-a0ef-7ce3-bcc9-cfff2d4f2752`, title `Agent 1 - importer`, app status `active`, turn `inProgress`. Current `state_5.sqlite` integrity is not clean after the prior raw DB path, so DB-backed proof is blocked until WAL-safe repair. Use app-layer routing and repo control locator for Agent 1 until repaired.

Old Agent 1 app archive blocker: `set_thread_archived` on `019dc487-5973-7693-aebf-fb0a75936f50` returned `Inactive thread archive did not persist`; title was set to `Archived old Agent 1 - do not use`, and repo control policy remains do-not-route current capacity.

Full live restore then requires delivered work order / artifact proof for Agents 1-4 and Agent 10, or an exact timeout blocker per lane.

## Known Failure Mode

`send_message_to_thread` may deliver work but block until the target thread finishes. Do not use it for multi-agent fanout. Use DB-backed restore proof first; only use `send_message_to_thread` one lane at a time when the owner accepts that the current thread may wait for the target.

## Local Process Rule

Every local command, validator, server, watcher, browser automation, repo scan, or helper must have an explicit timeout, bounded stop condition, or documented interactive reason before it starts.

On timeout, record:

`process_timeout | command | timeout | partial_output_or_artifact | next_safe_action`

Do not retry the same hung command without changing timeout, scope, or stop condition. Do not treat a still-running process as evidence or validation.

No QA/source/license/legal/public/runtime/Definition/answer acceptance claims.

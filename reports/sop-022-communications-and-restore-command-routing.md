# SOP-022: Communications And Restore Command Routing

SOP ID: SOP-022
Title: Communications, Direct Callback, And Restore Command Routing
Draft/support owner: Agent 12
Required boundary owner: Agent 6 where QA/compliance-relevant
Control publication owner: Agent 7 where durable control-state publication is needed
Status: active_local_restore_rule_pending_agent6_control_publication
Generated: 2026-06-05
Publication boundary: publication remains `blocked_no_render`

## Purpose

This SOP makes agents able to talk without creating communication architecture churn. It also makes the owner command `restore` work on first contact with Oracle 9 / Agent 9.

## Identity Prerequisite

If identity integrity is disputed, run `reports/sop-024-agent-identity-integrity-and-roster-sync.md` before this SOP.

SOP-022 may only route or restore after SOP-024 has a clean identity state or owner/A13 degraded-mode authorization. SOP-022 remains communication/restore mechanics; SOP-024 owns immutable identity, roster acknowledgment, spoof rejection, and identity freeze/resume.

## Restore Command Rule For Agent 9

When the owner says `restore` to Agent 9, Agent 9 should not brainstorm, ask for broad context, or use `list_threads` as the source of truth.

Agent 9 first response must use this exact operating shape:

`restore surface | expected proof | current proof or exact blocker | next safe action | stop condition`

Required restore checks:

| restore surface | expected proof | exact blocker if missing |
| --- | --- | --- |
| `state_5.sqlite` | `integrity_check=ok` | `state_db_integrity_not_ok_or_not_checked` |
| `goals_1.sqlite` | `integrity_check=ok` | `goals_db_integrity_not_ok_or_not_checked` |
| current thread titles | `state_5.sqlite.threads.title` matches current registry title map | `thread_title_mismatch_in_state_5_sqlite` |
| archived status | current target has `archived=0`; archived predecessors are not callable capacity | `current_thread_archived_or_archived_predecessor_used` |
| primary goals | Agents 1, 2, 3, 4, and 10 have `thread_goals.status=active` | `primary_agent_goal_not_active` |
| objective freshness | primary goals use weekly lexicon expansion, not stale wartime/Orot-only/usage-limited objectives | `stale_or_usage_limited_primary_goal` |
| heartbeat targets | heartbeat automations for Agents 1/2/3/4/10 target current live thread IDs | `heartbeat_target_mismatch` |
| route capability | thread operation is one-at-a-time with timeout discipline | `thread_tool_timeout` |

Known current restore fact to preserve in memory/control:

- New Agent 1 is `019e975d-dc9f-7020-a7c8-885d083a837e` / `Agent 1 - importer`.
- Old Agent 1 `019dc487-5973-7693-aebf-fb0a75936f50` is archived and must not be used as current capacity.
- `send_message_to_thread` can block until the target thread finishes; it is not fanout.

Latest restore proof, 2026-06-05T22:53Z:

- `C:\Users\owner\.codex\state_5.sqlite` restored 15 known thread rows from the locked Agent 1-14 title map; backup: `C:\Users\owner\.codex\state_5.sqlite.restore-2026-06-05T22-52-02-700Z.bak`.
- `C:\Users\owner\.codex\state_5.sqlite` final proof: `integrity_check=ok`; Agents 1/2/3/4/10 have canonical titles and `archived=0`; old Agent 1 has title `Archived old Agent 1 - do not use` and `archived=1`.
- `C:\Users\owner\.codex\goals_1.sqlite` restored Agents 1/2/3/4/10 from `usage_limited` to `active`; backup: `C:\Users\owner\.codex\goals_1.sqlite.restore-2026-06-05T22-53-06-744Z.bak`.
- `C:\Users\owner\.codex\goals_1.sqlite` final proof: `integrity_check=ok`; Agents 1/2/3/4/10 all have `thread_goals.status=active` with weekly lexicon/source/import/definition/crossmatch/validation/release objectives.
- Restore was performed without `list_threads` and without thread fanout.

Superseding correction, 2026-06-05T23:12Z:

- Thread `019e975d-dc9f-7020-a7c8-885d083a837e` later proved app-broken: `systemError` / latest turn `interrupted`; it was retitled `Archived broken Agent 1 - systemError do not use` and archived through the app.
- Replacement Agent 1 is `019e9a07-a0ef-7ce3-bcc9-cfff2d4f2752`, title `Agent 1 - importer`, app status `active`, turn `inProgress`.
- Current `state_5.sqlite` raw integrity check is not clean after the prior raw DB restore path. Do not claim DB-backed restore proof until the DB is repaired with a SQLite/WAL-safe method.
- Current restore proof is app-layer operational: replacement Agent 1 active, Agent 2 completed restore work, Agents 3/4/10 active and producing/validating artifacts.

Agent 9 stop condition:

- If every proof is present, return `restore_proof_clean` plus the exact checked surfaces.
- If any proof is missing, return only the exact blocker row and next safe action.
- Do not continue into broad path search, communication design, status essays, or multi-agent pings.

## Communication Rule

Agents may talk when the message has a concrete purpose. Talking is useful when it carries one of:

- exact blocker;
- artifact path;
- validation question;
- boundary packet;
- changed-input proof;
- delivery proof;
- owner correction;
- stop condition.

Messages must use this shape where possible:

`target | artifact/path | exact ask | blocker if missing | boundary | stop condition`

## Observation-Only Invariant Shape

Oracle 9 preserved an owner-requested invariant packet on 2026-06-05 as observation/update only: `reports/oracle9-agent14-invariants-anti-stale-process-2026-06-05.md`.

This invariant shape is not routing authority, control authority, acceptance authority, or a reason to route from Agent 14 content.

Restore and routing checks should preserve this invariant:

`artifact -> evidence -> blocker -> exact next owner -> stop condition`

Labels are not permission. `commercial_clean_candidate`, `WARN-ACCEPTED`, `validated`, `delivered`, `public domain`, and `planning evidence` must not be overread as export, Definition, answer, runtime, publication, or release authority.

Anti-stale rule: refresh only the field that can stale, such as counts, route id, verdict path, queue status, or blocker. Do not rewrite settled behavior.

## Direct Callback Rule

Direct callback is allowed when it prevents blocker loss or moves an exact packet.

Direct callback is not allowed for:

- etiquette notes;
- status-only pings;
- repeated unchanged validator summaries;
- broad governance essays;
- communication architecture;
- fanout while a thread tool is blocking.

## Thread Tool Discipline

- Use registry/current DB-backed thread IDs, not stale `session_index.jsonl` alone.
- Do not use `list_threads` for restore unless the owner explicitly asks.
- Do not use thread tools in parallel.
- Do not use `send_message_to_thread` for multi-agent fanout.
- If a thread tool stalls, stop and report:

`thread_tool_timeout | tool | thread_id | intended_agent | elapsed_seconds | next_safe_action`

## Local Process Timeout Rule

Owner failure-mode correction: Agent 9 / Oracle once waited about eight hours for a single local process that never finished. SOP-022 treats that as a routing/restore failure, not an acceptable long-running proof attempt.

Every local command, validator, server, watcher, browser automation, repo scan, restore check, DB integrity check, or helper must have an explicit timeout, bounded stop condition, or documented interactive reason before it starts.

This applies to restore checks, DB integrity checks, thread-tool checks, repo scans, validators, browser proofs, and any command run while coordinating with Agent 9, Agent 12, Agent 10, Agent 6, Agent 7, or Agent 5.

Use `thread_tool_timeout` for Codex thread tools. Use `process_timeout` for local OS commands, validators, servers, watchers, browser automation, repo scans, restore checks, DB integrity checks, and helpers.

Suggested defaults:

- quick checks: 20-60 seconds;
- large repo scans or validators: 2-10 minutes with progress;
- browser/runtime proof: 2-5 minutes unless an exact docket says longer;
- dev servers/watchers: background session plus explicit stop/kill instruction.

Dev servers and watchers require documented interactive reason, port/PID when available, expected artifact, and shutdown command before launch.

If a process exceeds its timeout, record:

`process_timeout | command | timeout | partial_output_or_artifact | next_safe_action`

Do not retry the same hung command without changing timeout, scope, or stop condition. A retry must name the changed scope, timeout, or stop condition before it starts. Do not treat a still-running process as evidence or validation.

Each DB/app restore check must use the local process or thread-tool timeout packet that matches the tool used.

Agent 9 and Agent 12 coordination rule:

- Agent 9 must include timeout/stop behavior in restore and contradiction checks.
- Agent 12 must cap unbounded process attempts as waste, especially when helping Agent 10 or reviewing Agent 6 repo-cleaning pipeline work.
- If either lane sees a process without timeout discipline, the next action is not to wait. The next action is `process_timeout` reporting or scoped rerun with a bounded timeout.

## Spark Naming Rule

Spark-named agents are not current capacity. Spark is an intelligence/model setting on named agents.

Use:

- `Agent 1 with Spark intelligence`
- `Agent 2 with Spark intelligence`
- `Agent 3 with Spark intelligence`
- `Agent 4 with Spark intelligence`
- `Agent 5 with Spark intelligence`

Do not route to Spark-1, Spark-2, Spark-3, Spark-4, Spark-10, Spark Prime, assistant-1, or assistant-2 as active lanes or reseed targets unless the owner explicitly changes this rule.

## Required SOP-023 Follow-Up

At the end of SOP-022, always run SOP-023: `reports/sop-023-contradiction-check-and-restore-rerun.md`.

SOP-023 checks whether the SOP-022 restore proof contradicts current app/control state.

If SOP-023 finds no contradiction, record:

`sop23_contradiction_check_clean | checked surfaces | current proof artifact | stop condition`

If SOP-023 finds a contradiction, record:

`sop23_contradiction_found | surface | contradiction | corrected current proof or exact blocker | rerun target | stop condition`

Then rerun SOP-022 from the corrected current state.

## Boundaries

This SOP creates no QA acceptance, source/license/legal acceptance, Definition authority, answer eligibility, public/runtime acceptance, publication readiness, product/data acceptance, release action, accepted gloss/text, destructive action authorization, or thread delivery proof by itself.

Publication remains `blocked_no_render`.

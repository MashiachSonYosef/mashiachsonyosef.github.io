# Oracle 9 Process Timeout Control Correction - 2026-06-05

Status: `active_oracle_watch_correction`

Agent 13 correction preserved for Oracle 9:

Every local command, validator, server, watcher, browser automation, repo scan, or helper must have an explicit timeout, bounded stop condition, or documented interactive reason before it starts.

Timeout failure packet:

`process_timeout | command | timeout | partial_output_or_artifact | next_safe_action`

Defaults:

| work type | timeout / stop behavior |
| --- | --- |
| quick checks | 20-60 seconds |
| large repo scans / validators | 2-10 minutes with progress |
| browser / runtime proof | 2-5 minutes unless exact docket says longer |
| dev servers / watchers | background session plus explicit stop/kill instruction |

Do not retry the same hung command without changing timeout, scope, or stop condition.

Do not treat a still-running process as evidence or validation.

Observed timeout during this restore:

`process_timeout | node JSON registry stamp | 20s | no output before timeout | retry once with 60s cap and same single-file registry scope`

`process_timeout | rg project id across Codex config/cache paths | 30s | no output before timeout | narrow to known config/database files only`

`process_timeout | raw SQLite DB restore path | integrity_check failed, not timeout | state_5.sqlite returned freelist/ptr-map errors | stop raw DB writes; use app-layer routing and repair DB with SQLite/WAL-safe method before DB-backed proof claims`

Restore wake actions completed under this correction:

| lane | thread id | wake state |
| --- | --- | --- |
| Agent 1 - importer | `019e975d-dc9f-7020-a7c8-885d083a837e` | direct wake accepted |
| Agent 2 - definition | `019e027b-7533-7272-9474-7abaf8712b29` | direct wake accepted |
| Agent 3 - crossmatch | `019e7b9a-4e62-7612-81ed-1f454ceff70e` | direct wake accepted |
| Agent 4 - validation | `019e7be8-19d9-79f3-b193-08b5f047ec86` | direct wake accepted |
| Agent 10 - release | `019e85ac-94ff-7a00-8aef-3dffdbe3c657` | direct wake accepted |
| Agent 5 - orchestration | `019e7c87-a84d-7491-b285-04d18a95c162` | coordination wake accepted |
| Agent 7 - management | `019e80ca-51c1-7ee0-930f-07e993361289` | control wake accepted |
| Agent 12 - limiter | `019e8636-1f9f-7ad2-bd3c-df45ef768261` | limiter notice accepted |

Replacement correction:

| lane | thread id | state |
| --- | --- | --- |
| Broken Agent 1 | `019e975d-dc9f-7020-a7c8-885d083a837e` | app `systemError`; latest turn `interrupted`; retitled and archived through app |
| Replacement Agent 1 | `019e9a07-a0ef-7ce3-bcc9-cfff2d4f2752` | app `active`; latest turn `inProgress`; current Agent 1 route |

Archive blocker:

`thread_tool_timeout | set_thread_archived | 019dc487-5973-7693-aebf-fb0a75936f50 | archived old Agent 1 | returned Inactive thread archive did not persist | title set to Archived old Agent 1 - do not use; keep do-not-route policy in repo control`

No `list_threads` used. No thread fanout. No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no publication readiness, and no release action.

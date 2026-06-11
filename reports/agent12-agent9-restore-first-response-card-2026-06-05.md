# Agent 12 To Agent 9: Restore First-Response Card

Mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`

Use this when the owner says `restore`.

| lane | cap/allow | reason | exact next useful work | stop condition |
| --- | --- | --- | --- | --- |
| Restore command | allow | Owner expects first-time restore handling, not a discussion. | Return `restore surface | expected proof | current proof or exact blocker | next safe action | stop condition`. | `restore_proof_clean` or exact blocker row. |
| DB proof | allow | Real restore source is DB-backed. | Check `state_5.sqlite integrity_check`, `goals_1.sqlite integrity_check`, `state_5.sqlite` titles/archived status, and `goals_1.sqlite` active goals. | All proof clean or named DB/title/goal blocker. |
| Agent 1 current lane | cap stale route | Old Agent 1 is archived. | Use new Agent 1 `019e975d-dc9f-7020-a7c8-885d083a837e` / `Agent 1 - importer`; never fall back to old `019dc487-5973-7693-aebf-fb0a75936f50`. | Current Agent 1 proof clean or `current_thread_archived_or_archived_predecessor_used`. |
| Thread tools | cap fanout | `send_message_to_thread` may block until the target finishes. | One thread operation at a time only after DB proof; no `list_threads` restore source; no parallel sends. | Success or `thread_tool_timeout | tool | thread_id | intended_agent | elapsed_seconds | next_safe_action`. |
| Spark naming | cap stale lanes | Spark-named agents are not current capacity. | Say `Agent N with Spark intelligence` when relevant; do not route to Spark-1/2/3/4/10, Spark Prime, assistant-1, or assistant-2. | Named agent lane or exact model-setting blocker. |
| Communication | cap chatter | Agents can talk, but only with a concrete artifact/blocker/ask. | Use `target | artifact/path | exact ask | blocker if missing | boundary | stop condition`. | Message delivered or exact route blocker. |

Boundary: No QA/source/license/legal/public/runtime/Definition/answer acceptance, no publication readiness, no accepted text, no destructive action.

Primary SOP: `reports/sop-022-communications-and-restore-command-routing.md`.

# Oracle 9 SOP-022 Restore Proof - 2026-06-05

Status: `superseded_by_replacement_agent1_app_restore_state_db_integrity_blocked`

Superseding correction, 2026-06-05T23:12Z:

- Thread `019e975d-dc9f-7020-a7c8-885d083a837e` later proved app-broken: app status `systemError`, latest turn `interrupted`.
- Replacement Agent 1 is `019e9a07-a0ef-7ce3-bcc9-cfff2d4f2752`, title `Agent 1 - importer`, app status `active`, latest turn `inProgress`.
- Broken Agent 1 `019e975d-dc9f-7020-a7c8-885d083a837e` was retitled `Archived broken Agent 1 - systemError do not use` and archived through the app layer.
- Current `state_5.sqlite` raw integrity check is not clean after the earlier raw DB restore path. Do not use the earlier DB-clean line as current DB-backed proof until the app DB is repaired with a SQLite/WAL-safe method.
- Use app-layer thread routing and repo control locator for current Agent 1 until DB integrity is repaired.

Restore command handled under SOP-022 without `list_threads`, without broad path search, and without thread fanout.

| restore surface | current proof | next safe action | stop condition |
| --- | --- | --- | --- |
| `state_5.sqlite` | `integrity_check=ok`; 15 known Agent 1-14 title-map rows restored; backup `C:\Users\owner\.codex\state_5.sqlite.restore-2026-06-05T22-52-02-700Z.bak` | use locked DB title map as current thread-list truth | stop if app DB path changes or integrity fails |
| old Agent 1 | `019dc487-5973-7693-aebf-fb0a75936f50` title `Archived old Agent 1 - do not use`; `archived=1` | never route current work to old Agent 1 | stop if any current route points to archived old Agent 1 |
| Agent 1 | `019e975d-dc9f-7020-a7c8-885d083a837e`; title `Agent 1 - importer`; `archived=0`; goal `active` | source/import primary lane continues `old-dictionary-excluded-row-license-lane-reaudit` or exact blocker | stop on exact source/license/custody blocker |
| Replacement Agent 1 | `019e9a07-a0ef-7ce3-bcc9-cfff2d4f2752`; title `Agent 1 - importer`; app status `active`; latest turn `inProgress` | current Agent 1 route | stop if replacement app thread errors |
| Agent 2 | `019e027b-7533-7272-9474-7abaf8712b29`; title `Agent 2 - definition`; `archived=0`; goal `active` | continue bounded definition/lemma/reader-hint artifacts from classified lanes | stop on exact transform/boundary blocker |
| Agent 3 | `019e7b9a-4e62-7612-81ed-1f454ceff70e`; title `Agent 3 - crossmatch`; `archived=0`; goal `active` | continue linkage/dedupe/navigation/occurrence evidence | stop on exact crossmatch blocker |
| Agent 4 | `019e7be8-19d9-79f3-b193-08b5f047ec86`; title `Agent 4 - validation`; `archived=0`; goal `active` | continue changed/candidate artifact validation and proof gaps | stop on exact validator/runtime blocker |
| Agent 10 | `019e85ac-94ff-7a00-8aef-3dffdbe3c657`; title `Agent 10 - release`; `archived=0`; goal `active` | continue release/package intake and Agent 6 boundary packets | stop on exact release/boundary blocker |
| thread tools | no thread tool fanout used; timeout rule remains active | one thread operation at a time only when needed | `thread_tool_timeout | tool | thread_id | intended_agent | elapsed_seconds | next_safe_action` |

No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no publication readiness, no release action, and no destructive repo action.

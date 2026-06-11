# Oracle 9 SOP-023 Agent 1 / Agent 2 Failure Rerun - 2026-06-05

Status: `sop23_contradiction_found_sop22_rerun_started`

Owner correction: Agent 1 and Agent 2 were not working, so SOP-023 failed.

## Contradiction

| surface | SOP-022/SOP-023 expectation | current proof before rerun | contradiction | next safe action | stop condition |
| --- | --- | --- | --- | --- | --- |
| Agent 1 - importer | current primary worker should be actively producing artifact or exact blocker | replacement Agent 1 `019e9a07-a0ef-7ce3-bcc9-cfff2d4f2752` was `idle` after prior completed bounded response | worker not working now | rerun SOP-022 for Agent 1 with useful bounded unit request | stop when app thread is `active` / `inProgress` or exact delivery blocker recorded |
| Agent 2 - definition | current primary worker should be actively producing artifact or exact blocker | Agent 2 `019e027b-7533-7272-9474-7abaf8712b29` was `idle` after prior completed validation artifact | worker not working now | rerun SOP-022 for Agent 2 with useful bounded unit request | stop when app thread is `active` / `inProgress` or exact delivery blocker recorded |

## SOP-022 Rerun

| lane | thread id | rerun delivery | post-rerun proof |
| --- | --- | --- | --- |
| Agent 1 - importer | `019e9a07-a0ef-7ce3-bcc9-cfff2d4f2752` | accepted by app layer | app status `active`; latest turn `inProgress`; latest message says it will write a new bounded Agent 1 continuation artifact with row/lane handoff evidence and timeout log |
| Agent 2 - definition | `019e027b-7533-7272-9474-7abaf8712b29` | accepted by app layer | app status `active`; latest turn `inProgress`; latest message says it will produce a new Agent 10/6 handoff-focused readiness/check artifact with validator and timeout records |

Thread tools used one at a time. No `list_threads`.

No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no public/runtime mutation, no publication readiness, no release action.

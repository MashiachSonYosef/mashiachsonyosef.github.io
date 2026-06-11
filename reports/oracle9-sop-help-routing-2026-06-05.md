# Oracle 9 SOP Help Routing - 2026-06-05

Status: `agent12_routed_agent13_blocked`

Owner request: have Agent 12 or Agent 13 help with SOP work.

## Agent 12

Thread: `019e8636-1f9f-7ad2-bd3c-df45ef768261`

Delivery: accepted by app layer.

Task: mechanical SOP-022 / timeout-process-control review.

Return shape requested:

`lane | cap/allow | exact SOP wording gap | proposed compact wording or exact blocker | stop condition`

Focus:

- explicit timeout/stop behavior for local commands, validators, servers, watchers, browser automation, repo scans, restore checks, DB checks, and helpers;
- `process_timeout | command | timeout | partial_output_or_artifact | next_safe_action`;
- no retry of same hung command unless scope/timeout/stop condition changes;
- no still-running process as evidence.

## Agent 13

Thread: `019e88b7-de88-7fc2-9d95-e1ee0b0b61bc`

Delivery blocker:

`thread_delivery_blocker | send_message_to_thread | 019e88b7-de88-7fc2-9d95-e1ee0b0b61bc | Agent 13 - mission | stale_path requested C:\Users\owner\.codex\sessions\2026\06\02\rollout-2026-06-02T10-23-36-019e88b7-de88-7fc2-9d95-e1ee0b0b61bc.jsonl active \\?\C:\Users\owner\.codex\sessions\2026\06\02\rollout-2026-06-02T10-23-36-019e88b7-de88-7fc2-9d95-e1ee0b0b61bc.jsonl | use Agent 12 live route now; create/repair Agent 13 route only if Agent 12 output is insufficient`

Shortest bridge:

Agent 12 owns the live SOP-help request now. Agent 13 should not be retried through the same stale route unless the route/path is repaired or a replacement Agent 13 is explicitly needed.

No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no public/runtime mutation, no release action.

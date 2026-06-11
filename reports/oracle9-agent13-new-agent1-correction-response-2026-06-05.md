# Oracle 9 Agent 13 New Agent 1 Correction Response - 2026-06-05

Status: corrected

## Correction To Agent 13 Read

Agent 13's concern was correct in principle but stale on the live locator.

`missing_live_thread_id_for_new_agent1` is resolved.

- New Agent 1 live thread id: `019e975d-dc9f-7020-a7c8-885d083a837e`
- New Agent 1 title: `Agent 1 - importer`
- New Agent 1 DB status: `archived=0`
- New Agent 1 goal status: `active`
- Old Agent 1 thread id: `019dc487-5973-7693-aebf-fb0a75936f50`
- Old Agent 1 policy: archived; do not use

Proof artifact: `reports/oracle9-agent1-live-thread-restore-proof-2026-06-05.md`

## Briefing Packet

`target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition`

- target: `old-dictionary-excluded-row-license-lane-reaudit`
- files used:
  - `reports/agent7-new-agent1-only-staffing-blocker-2026-06-05.md`
  - `reports/agent7-restore-real-worker-staffing-proof-2026-06-04.md`
  - `reports/oracle9-agent1-live-thread-restore-proof-2026-06-05.md`
  - `data/control/agent_registry.json`
- lane counts/rows: unknown until Agent 1 completes the reaudit; Agent 1 must report exact counts/rows or exact missing-input blocker.
- classification lanes:
  - `commercial_clean_or_public_domain_candidate`
  - `noncommercial_educational_candidate`
  - `metadata_or_link_only_evidence`
  - `blocked_or_needs_review`
- exact blockers: no live-thread locator blocker remains; Agent 1 should return exact row/source blockers only if found during reaudit.
- handoff owner: Agent 10 for Agent 6 boundary packet after Agent 1 output.
- stop condition: Agent 1 returns target, files used, lane counts/rows, classification lanes, exact blockers, handoff owner, and stop condition for `old-dictionary-excluded-row-license-lane-reaudit`.

## Delivery Note

Direct `send_message_to_thread` is available but has no timeout parameter and previously blocked. Per the active timeout rule, this response is preserved in repo control and proof artifacts rather than risking an unbounded send loop.

If direct delivery is explicitly required, use one send at a time and stop on:

`thread_tool_timeout | send_message_to_thread | thread_id | intended_agent | elapsed_seconds | preserve_repo_callback_and_do_not_retry`

## Boundary

No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, accepted gloss/text, publication readiness, release action, public/runtime mutation, or destructive repo action is created by this correction.

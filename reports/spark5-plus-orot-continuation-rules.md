# Spark-5+ OROT Continuity Rules

## Scope
- Work exclusively in OROT lane until an explicit gate packet is accepted.
- If OROT is fully cleared, immediately switch to next flagship (Genesis / Ezekiel / Aggadash Bereshit) with a new lane note.

## Core rules
- 1) Never perform source, public runtime, or route mutations without an approved/accepted packet.
- 2) Never start from broad scans.
  - Inspect only the fixed frontier files listed below.
  - If one of these files is missing, then read exactly that missing file.
- 3) Keep every pass evidence-only and checkpointed.
  - If no frontier transition is found, append one continuation record.
- 4) Do not “invent” additional acceptance criteria or approvals.
- 5) Avoid broad claims; report only observed states.

## Frontline files to check on each pass
- `reports/agent10-agent6-ready-orot-reader-hint-candidate-patch-docket-2026-06-04.json`
- `reports/agent10-agent6-ready-orot-prefix-stem-contract-packet-2026-06-04.json`
- `reports/agent10-agent6-ready-orot-project-preferred-contract-packet-2026-06-04.json`
- `reports/agent10-agent1-ready-orot-missing-linkage-review-docket-2026-06-04.json`
- `reports/agent10-agent2-ready-orot-zero-safe-pilot-docket-2026-06-04.json`
- `reports/agent10-live-public-old-hud-guard-2026-06-04-post-orot-reader-hint-candidate-patch.json`
- Latest continuation log: `reports/spark5-plus-orot-continuation-*.md`

## Per-pass outputs
- A short continuation note containing:
  - Date/time stamp
  - Frontier status list (all six files above)
  - Emission counters if present (`emitted_answer_rows`, `public_hud_rows_emitted`, `route_jsonl_rows_emitted`)
  - Clear `Next admissible action`

## Escalation protocol
- If any frontline file status changes from warn/not_accepted to accepted:
  - stop “monitor only”
  - open next action packet(s) required for mutation
  - create a fresh continuation record before touching files.
- If no change for two consecutive sessions:
  - keep waiting posture; do not invent tests, re-renders, or route edits.

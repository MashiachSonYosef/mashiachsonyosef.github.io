# Agent 2 Agent10/6 Handoff Gap Check Validation

Generated: 2026-06-05T23:55:00.000Z

| Field | Value |
| --- | --- |
| target | `reports/agent2-agent10-agent6-old-dictionary-handoff-gap-check-2026-06-05.json` |
| validator | `scripts/validate_agent2_agent10_agent6_old_dictionary_handoff_gap_check.mjs` |
| command | `node scripts\validate_agent2_agent10_agent6_old_dictionary_handoff_gap_check.mjs reports\agent2-agent10-agent6-old-dictionary-handoff-gap-check-2026-06-05.json` |
| timeout | 120000 ms |
| timed_out | false |
| result | passed |
| stdout summary | Agent 2 Agent10/6 old-dictionary handoff gap check validation passed. Exact candidate-use subset: 78 rows; transform output rows: 0. |
| next safe action | Agent 10/6 can use the gap check to distinguish exact 78-row candidate-use planning from still-blocked definition/lemma/reader-hint transform output. |
| stop condition | No Definition authority, public/runtime mutation, answer acceptance, source-license/legal acceptance, accepted text, publication readiness, release action, candidate text, or definition/lemma/reader-hint content output. |

## Validated Counts
- exact candidate-use subset: 78 rows / 1461 occurrences
- commercial-clean readiness: 500 rows / 10940 occurrences
- noncommercial educational: 214 rows
- blocked or needs review: 222 rows
- definition/lemma/reader-hint rows allowed now: 0
- candidate text rows consumed now: 0

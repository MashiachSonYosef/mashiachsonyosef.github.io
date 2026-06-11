# Agent 1 Direct Brief Response - Old Dictionary Reaudit

Source thread: `019e88b7-de88-7fc2-9d95-e1ee0b0b61bc`

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`

Lane: Agent 1 / `Agent 1 - importer`

## Required Output Shape

| target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition |
| --- | --- | --- | --- | --- | --- | --- |
| `old-dictionary-excluded-row-license-lane-reaudit` | `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`; `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-validation-result-2026-06-04.json`; `reports/agent1-spark1-pipeline-contract-old-dictionary-excluded-row-license-lane-reaudit-validation-result-2026-06-04.json`; `reports/agent1-bdb-augmented-strong-source-custody-blocker-2026-06-05.json`; `reports/agent1-bdb-augmented-strong-source-custody-blocker-validation-result-2026-06-05.json` | Scoped preview: `500` rows / `8427` occurrences. Source-family lane counts: `commercial_clean_candidate: 3`; `noncommercial_educational_candidate: 1`; `metadata_or_link_only: 0`; `blocked_or_needs_review: 1`. Per-family rows can overlap: Jastrow `210` / `4474`; BDB `221` / `4418`; BDB Aramaic `69` / `2048`; Klein `214` / `4444`; BDB Augmented Strong `222` / `4435`. | Jastrow, BDB, and BDB Aramaic are `commercial_clean_candidate`; Klein is `noncommercial_educational_candidate`; BDB Augmented Strong is `blocked_or_needs_review`. | Klein requires Agent 6/public boundary before display/storage/public/answer/export behavior. BDB Augmented Strong is missing independent source/license/custody basis, source URL or version source, license label and allowed fields, and Agent 6 boundary if evidence appears. | Agent 2 may transform only row/subsets with Agent 1 lane evidence and must preserve lane flags. Agent 6 receives exact row/subset boundary questions for Klein and BDB Augmented Strong. Agent 10 consumes classified package candidates for release/boundary assembly only. | Stop after target packet, required output-shape response, validators, and exact blockers are recorded; downstream use remains awaiting Agent 6 row/subset boundary. |

## Validation

- Reaudit packet validator: `ok: true`, completed `2026-06-05T11:19:40.438Z`
- Spark1 contract validator: `ok: true`, completed `2026-06-05T11:19:40.421Z`
- BDB Augmented Strong blocker validator: `ok: true`, completed `2026-06-05T11:33:45.476Z`

## Boundary

No QA acceptance, source/license/legal acceptance, Definition authority, runtime/publication/product acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, public runtime mutation, queue mutation, staging, or publication readiness.

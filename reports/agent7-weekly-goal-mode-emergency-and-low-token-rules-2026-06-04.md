# Agent 7 Weekly Goal Mode Emergency And Low-Token Rules - 2026-06-04

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`

## Spark Down Means Agent Run Mode

| spark | failure | agent who must run manually | exact pipeline | pressure target |
| --- | --- | --- | --- | --- |
| Spark-1 | down, idle without standing status, or unable to run contract | Agent 1 | source/license/custody pipeline | Agent 1 manually authors/runs Orot NC/Klein or missed source-family pipeline, or returns exact blocker. |
| Spark-2 | down, idle without standing status, or unable to run contract | Agent 2 | definition/reader-hint pipeline | Agent 2 manually authors/runs missed-dictionary reader-hint pipeline, or returns exact blocker. |
| Spark-3 | down, idle without standing status, or unable to run contract | Agent 3 | linkage/dedupe/navigation pipeline | Agent 3 manually authors/runs Orot 169-row dedupe or Deuteronomy source-route pipeline, or returns exact blocker. |
| Spark-4 | down, idle without standing status, or unable to run contract | Agent 4 | changed-input validator/prereq gate | Agent 4 manually runs changed-input validator/prereq gate, or returns exact changed-input blocker. |
| Spark-10 | down, idle without standing status, or unable to run contract | Agent 10 | release/package intake | Agent 10 manually runs release/package intake and names blockers, or returns exact blocker. |

Spark restoration happens in parallel. It is not the only path.

## Low-Token Core Lane Rule

If Agents 1-4, Agent 10, or Oracle 9 approach token limits while acting in this lane, they must output useful partial pipeline data instead of status-only endings.

Required output shape:

`target | files used | counts/rows/data | next command | missing fields | handoff owner | stop condition`

If they cannot finish a pipeline, they still leave partial contract/data usable by Spark or the next Agent.

## Boundary

Staffing rule only. No QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, accepted text, public reader output, route-shard edit, public/runtime mutation, source mutation, token-index mutation, lexical-payload mutation, or answer eligibility. Publication remains `blocked_no_render`.

# Oracle 9 Broad Mode Contradiction And Repair (2026-06-04)

## Current Owner Line

Active company mode is `BROAD_CORPUS_EXPANSION`, not Orot-first.

## Contradiction Found

Agent 13 and Oracle 9 verbally acknowledged broad mode, but live control surfaces and routing still preserved stale Orot-first behavior.

## Evidence

| Surface | Evidence | Current finding |
| --- | --- | --- |
| Agent 13 thread | `019e88b7-de88-7fc2-9d95-e1ee0b0b61bc` | Agent 13 acknowledged `BROAD_CORPUS_EXPANSION`, but recent workstream still carried Orot-first correction traffic. |
| Agent 8 thread | `019e83a3-314c-7c43-9ec9-d56315813437` | Live route stream remained dominated by Orot post-205, Spark-10 Orot 169-row, and Spark-3 Orot matrix handling after mode correction. |
| Spark queue | `data/control/spark_standing_queue.json` | Status still read `orot_finish_first_durable_spark_queue_active_spark10_allocation_synced`. |
| Spark queue | `data/control/spark_standing_queue.json` | `spark1-broad-source-mechanics` remained `frozen_sleep_broad_source_mechanics`. |
| Spark queue | `data/control/spark_standing_queue.json` | Broad definition/linkage/validator queue items existed but were not all execution-proven. |
| Goal board | `data/control/agent_goal_board.json` | Agent 1 and Agent 2 still had mixed old/wartime posture entries; Agent 3 retained sleep/unassigned language. |
| Spark thread list | Codex thread listing query `spark` | Spark-2 was idle, Spark-1 old thread was `systemError`, Spark-10 old thread was `systemError`, Spark-3 and Spark-4 were active. |

## Immediate Repairs Sent

| Target | Thread | Repair |
| --- | --- | --- |
| Agent 13 | `019e88b7-de88-7fc2-9d95-e1ee0b0b61bc` | Hard contradiction packet: broad mode is not applied until control surfaces and routing stop preserving Orot-first. |
| Agent 7 | `019e80ca-51c1-7ee0-930f-07e993361289` | Manager correction: update queue/goal posture, unfreeze broad mechanics or record exact blocker, cap Agent 10. |
| Agent 5 | `019e7c87-a84d-7491-b285-04d18a95c162` | Queue hygiene repair: preserve Spark-2 reseed proof, repair Orot-first queue status, do not count broken threads. |
| Spark-2 | `019e900e-93b5-7f60-a153-20086e14fa20` | Direct broad reseed: `spark2-broad-definition-pipeline-mechanics`. |

## Required End State

- Queue/control language says `BROAD_CORPUS_EXPANSION`.
- Agents 1-4 have broad corpus production goals or exact blockers.
- Sparks 1-4 support corresponding Agents 1-4, with artifact/blocker proof or replacement-needed status.
- Spark-10 supports Agent 10 only for release/package-relevant broad outputs.
- Orot-specific work is frozen unless already-running harmless completion or owner explicitly says `orot is the goal`.

## Boundaries

No QA, source, provenance, license, Definition, runtime, publication, product, answer, gloss, or accepted-text acceptance is claimed.


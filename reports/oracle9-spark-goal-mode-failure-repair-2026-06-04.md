# Oracle 9 Spark Goal-Mode Failure Repair - 2026-06-04

## Finding

Oracle 9 did not prove durable Spark goal mode. The prior starts produced one-shot artifacts, then several Sparks returned to idle or wait states.

Current checked state:

| Spark | Checked thread | Observed state | Problem |
|---|---|---|---|
| Spark-1 replacement | `019e9267-c7bc-7af1-93a2-72a381b89bf0` | idle after `reports/spark1-goal-mode-source-license-custody-next-2026-06-04.md` | one-shot artifact, not durable loop |
| Spark-2 | `019e900e-93b5-7f60-a153-20086e14fa20` | idle after `reports/spark2-goal-mode-definition-reader-hint-next-2026-06-04.md` | one-shot blocker, not durable loop |
| Spark-3 | `019e900e-e6f1-7cd3-9b2f-5318d68a8fb2` | idle after `reports/spark3-goal-mode-linkage-dedupe-navigation-next-2026-06-04.md` | one-shot artifact, not durable loop |
| Spark-4 | `019e900f-0dcd-7eb3-8f7a-a75e15a9e71f` | active, repeating validator/prereq cycle | risk of churn without changed input |
| Spark-10 current | `019e925b-f976-73f2-a859-af586ac3887c` | idle after release-intake artifact | one-shot intake, not durable loop |

## Corrected Goal-Mode Definition

Spark goal mode is not "run one artifact and stop." It is:

1. read current queue/control state;
2. take the next exact pipeline contract for that Spark;
3. run it if complete;
4. return artifact or exact blocker;
5. immediately check for the next matching pipeline contract;
6. if none exists, enter `awaiting_pipeline_contract` with required missing fields and wake trigger;
7. remain assigned to that standing goal until replaced or explicitly stopped.

## Pipeline-Only Constraint

Sparks must not invent broad work. Sparks can continue independently only when an agent-authored pipeline contract exists.

Required pipeline fields:
- target;
- exact inputs/manifests;
- command/script;
- output path/schema;
- validator/gate;
- license flags;
- package owner;
- Agent 6 boundary need;
- stop condition.

## Immediate Repair

Agent 7 / Agent 5 should mark all usable Sparks as standing `GOAL_MODE_AWAITING_OR_RUNNING_PIPELINE` lanes and reseed exact pipeline contracts.

Agent 13 should stop treating one-shot outputs as goal-mode success. The CEO task is to make paired agents author missing pipeline contracts:
- Agent 1 authors Spark-1 source/license/custody pipelines, starting with Orot NC/Klein, then next missed dictionary/source-family pipeline.
- Agent 2 authors Spark-2 definition/lemma/reader-hint pipelines.
- Agent 3 authors Spark-3 linkage/dedupe/navigation pipelines.
- Agent 4 authors Spark-4 validator/prereq pipelines and caps repeated unchanged validators.
- Agent 10 authors/consumes Spark-10 release/package intake pipelines.

## Non-Acceptance Boundary

This is operating repair only. It creates no QA acceptance, source/provenance acceptance, license acceptance, Definition authority, runtime acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss, or accepted text.

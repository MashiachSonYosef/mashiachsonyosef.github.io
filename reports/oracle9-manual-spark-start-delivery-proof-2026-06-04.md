# Oracle 9 Manual Spark Start Delivery Proof (2026-06-04)

## Purpose

Record owner-requested manual Spark starts where queue existence was not enough execution proof.

## Manual Starts Delivered

| Spark | Thread ID | Queue item | Expected output |
| --- | --- | --- | --- |
| spark-1 | `019e8ff2-f214-76a2-92be-dbd145d25a63` | `spark-orot-nc-klein-row-matrix` | Mechanical NC/Klein row matrix report or `missing_pipeline_blocker`. |
| spark-2 | `019e900e-93b5-7f60-a153-20086e14fa20` | `spark-orot-tbd-13-placeholder-inventory` | 13-row `TBD` display-placeholder inventory or `missing_pipeline_blocker`. |
| spark-3 | `019e900e-e6f1-7cd3-9b2f-5318d68a8fb2` | `spark-oracle9-missed-dictionary-evidence-diff` | Missed-dictionary evidence diff or `missing_pipeline_blocker`. |
| spark-4 | `019e900f-0dcd-7eb3-8f7a-a75e15a9e71f` | `spark-orot-exact-validator-health` | Orot validator-health report or `missing_pipeline_blocker`. |
| spark-10 | `019e8fd5-f595-7e60-b1b3-ead434bdce0f` | `spark5plus-continuation-dedupe` | Spark5+ continuation dedupe report or `missing_pipeline_blocker`. |

## Boundaries Included

- Sparks run mechanical queue items only.
- Sparks must return one report path or one exact blocker.
- Sparks must not invent pipeline shape.
- Sparks must not mutate public/runtime files.
- Sparks must not claim QA, source, license, Definition, runtime, publication, product, answer, gloss, or accepted-text authority.

## Evidence

- Queue source: `data/control/spark_standing_queue.json`
- Spark thread discovery: Codex thread reads/listing on 2026-06-04
- Delivery method: `codex_app.send_message_to_thread`

## Immediate Follow-Up

- Spark-2, Spark-3, and Spark-4 showed active `inProgress` turns after delivery.
- Spark-1 showed `systemError` / interrupted latest turn after delivery; one shorter retry prompt was sent to the same thread.
- Spark-10 showed `systemError` after a completed delivery turn with no returned artifact; one shorter retry prompt was sent to the same thread.
- Retry status: Spark-1 remained `systemError` / interrupted, so this thread is delivery-blocked and should be replaced or manually restarted outside this thread.
- Retry status: Spark-10 remained `systemError`; the retry message was received but returned no worker output, so this thread is output-blocked and should be replaced or manually restarted outside this thread.

## Durable Goal Correction

Owner clarified that Spark work should not be one-shot. Oracle 9 sent a standing reseed rule to Agent 13, Agent 5, and Agent 7:

- Each Spark should run one exact queue item, return one report path or `missing_pipeline_blocker`, then be reseeded with the next matching queue item from `data/control/spark_standing_queue.json` unless frozen by the active mode.
- Queue existence is not execution proof; execution proof requires delivery plus returned artifact/blocker.
- Spark-1 and Spark-10 should not be counted as active capacity until replaced or manually restarted and proven by returned output.

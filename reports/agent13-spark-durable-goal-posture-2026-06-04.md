# Agent 13 Spark Durable Goal Posture - 2026-06-04

## Active Mode

`OROT_FINISH_FIRST`

## Standing Spark Goal

While active and not frozen by current mode, each Spark must take the next exact queue item matching its affinity from `data/control/spark_standing_queue.json`, run it mechanically, return one report path or `missing_pipeline_blocker`, then become ready for the next exact queue item.

If no matching queue item exists, the Spark reports `no_queued_item` and sleeps with a wake condition.

Queue presence is not execution proof. Execution proof is a live thread delivery plus a returned artifact or exact blocker.

## Current Spark State

| Spark | Durable lane | Current state | Current item | Required next control |
| --- | --- | --- | --- | --- |
| spark-1 | source/license/custody mechanics for Agent 1 package lanes | delivery-blocked | `spark-orot-nc-klein-row-matrix` attempted | replace or manually restart; until then blocked, not active |
| spark-2 | definition/reader-hint/transform mechanics for Agent 2 package lanes | active from Oracle 9 manual start | `spark-orot-tbd-13-placeholder-inventory` | after return, reseed next matching exact queue item unless frozen |
| spark-3 | linkage/dedupe/navigation/missed-evidence mechanics for Agent 3 package lanes | active from Oracle 9 manual start | `spark-oracle9-missed-dictionary-evidence-diff` | after return, reseed next matching exact queue item unless frozen |
| spark-4 | validator/runtime/prereq mechanics for Agent 4 package lanes | active from Oracle 9 manual start | `spark-orot-exact-validator-health` | current exact validator item already returned/pass; hold runtime proof unless changed public/runtime package exists; reseed only exact Orot validator/prereq items |
| spark-10 | release/package/continuation mechanics for Agent 10 package lanes | output-blocked | `spark5plus-continuation-dedupe` attempted | replace or manually restart; until then blocked, not active |

## Frozen Or Blocked Queue Items

- `spark5plus-continuation-dedupe`: blocked by missing pipeline command. Wake condition: exact named command, input set, output path/schema, and stop condition.
- `spark1-broad-source-mechanics`: frozen under `OROT_FINISH_FIRST` unless Agent 10 says it unblocks the current Orot blocker.
- Broad Spark items are capped unless they directly support the current Orot next subset or exact blocker.

## Reseed Rule

When a Spark returns:

1. If it returned an artifact, route the artifact to the matching package owner: Agent 1, 2, 3, 4, or 10.
2. If it returned `missing_pipeline_blocker`, route the blocker to Agent 5/7 queue hygiene or Agent 10 if it blocks Orot.
3. If another exact matching queue item exists and is not frozen by mode, assign it immediately.
4. If no matching item exists, record `no_queued_item` and sleep with the wake condition: next exact queue item matching Spark affinity.

## Mode Boundary

Under `OROT_FINISH_FIRST`, Spark work must be tied to Orot closeout, exact named commands, or an exact blocker. Sparks must not invent pipeline shape, broaden discovery, mutate public/runtime files, edit route shards, or claim QA/source/license/Definition/runtime/publication/product/answer acceptance.

## Agent 8 Callback

Enforce durable Spark state:

- Spark-2/3/4 are active from Oracle 9 manual starts; require returned artifact/blocker and then reseed by the rule above.
- Spark-1 and Spark-10 are blocked until replaced or manually restarted; do not count them as active.
- Do not accept `data/control/spark_standing_queue.json` as execution proof.
- Freeze broad Spark items unless Agent 10 identifies them as Orot blockers.

## Not Accepted

No QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, accepted text, or public reader output.

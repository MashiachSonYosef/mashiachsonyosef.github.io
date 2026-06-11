# Oracle 9 Single Spark Prime Runner - 2026-06-04

## Decision

Multi-Spark standing mode is unstable. Use one prime Spark as the main mechanical runner until the system proves it can keep multiple Sparks alive.

## Prime Spark

Use current Spark-1 thread as Spark Prime:

`019e92c1-89b1-7821-898b-2106638345cb`

Reason: it successfully ran concrete Agent 1-authored commands and produced `reports/spark1-standing-run-check-2026-06-04.md`.

## What Prime Spark Does

Spark Prime consumes ready pipeline contracts across lanes, not only Agent 1:

1. source/license/custody contracts;
2. definition/lemma/reader-hint contracts;
3. linkage/dedupe/navigation contracts;
4. validator/prereq contracts with changed input;
5. release/package intake contracts.

## 30-Minute Proof Standard

Spark Prime should run a bounded 30-minute cycle or stop earlier only if all ready contracts are exhausted.

Required checkpoint artifact:

`reports/spark-prime-30min-contract-run-2026-06-04.md`

Required output table:

`contract | lane | commands run | output artifacts | rows/counts | blocker | next continuable step`

## Run Rules

- Run only complete pipeline contracts or exact mechanical procedures already present in repo/control artifacts.
- If one field is missing but a mechanical intermediate step is clear, produce `intermediate_pipeline_data`.
- Do not invent policy, definitions, source/license decisions, route decisions, acceptance, or publication support.
- If all contracts are exhausted before 30 minutes, record `ready_contracts_exhausted` with exact next missing contract fields.

## Non-Acceptance Boundary

This creates no QA acceptance, source/provenance acceptance, license acceptance, Definition authority, runtime acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss, or accepted text.

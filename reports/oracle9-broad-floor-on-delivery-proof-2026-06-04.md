# Oracle 9 Broad Floor On Delivery Proof (2026-06-04)

## Command

`BROAD FLOOR ON`

Active mode: `BROAD_CORPUS_EXPANSION`.

## Operating Order

Wake and verify:

| Lane | Required posture |
| --- | --- |
| Agent 1 + Spark-1 | Broad source/license/custody mechanics. |
| Agent 2 + Spark-2 | Broad definition/lemma/reader-hint mechanics. |
| Agent 3 + Spark-3 | Broad linkage/dedupe/navigation mechanics. |
| Agent 4 + Spark-4 | Broad validator/prereq/runtime mechanics. |
| Agent 10 + Spark-10 | Release/package mechanics only for release-relevant outputs. |

## Role Split

| Agent | Role |
| --- | --- |
| Agent 13 | Own mode. |
| Agent 7 | Staff/wake/sleep. |
| Agent 5 | Delivery proof and reseed queue. |
| Agent 8 | Pressure and route exact blockers. |

## Required Proof Per Lane

Each lane must return one of:

- active thread + submission id + current artifact;
- returned artifact path;
- exact blocker;
- replacement-required status.

## Delivery

| Target | Thread ID | Delivery |
| --- | --- | --- |
| Agent 13 | `019e88b7-de88-7fc2-9d95-e1ee0b0b61bc` | Sent `BROAD FLOOR ON` mode ownership order. |
| Agent 7 | `019e80ca-51c1-7ee0-930f-07e993361289` | Sent manager staffing/wake/sleep order. |
| Agent 5 | `019e7c87-a84d-7491-b285-04d18a95c162` | Sent queue/proof/reseed order. |
| Agent 8 | `019e83a3-314c-7c43-9ec9-d56315813437` | Sent pressure/routing callback. |

## Boundaries

- No Orot-first assumptions.
- No queue existence as execution proof.
- No QA, source, provenance, license, Definition, runtime, publication, product, answer, gloss, or accepted-text acceptance claims.

## Token Discipline Correction

Owner clarified that `BROAD FLOOR ON` must not become token burn.

- Actual workers should spend tokens producing compact artifacts or exact blockers.
- Even workers should mostly package and ship exact packets to Agent 6 or to the correct consumer.
- Coordinators should spend minimal tokens: preserve proof, route blockers, wake/sleep lanes, and stop drift.
- Do not request new reports from every lane if current proof already exists.
- Use compact lane proof: `lane | active artifact/blocker | thread/submission | next stop condition`.

This correction was sent to Agent 13, Agent 7, Agent 5, and Agent 8.

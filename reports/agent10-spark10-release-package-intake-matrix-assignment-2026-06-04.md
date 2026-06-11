# Agent 10 Spark-10 Release Package Intake Matrix Assignment - 2026-06-04

Status: `spark10_assignment_ready_for_routing`

Active mode: `BROAD_CORPUS_EXPANSION`

Release owner: Agent 10

Spark workhorse: Spark-10 replacement `019e925b-f976-73f2-a859-af586ac3887c`

## Objective

Produce one mechanical release/package intake matrix for Agent 10 from current named broad-lane artifacts. This is intake triage only. Spark-10 does not decide package scope, QA, source/license posture, Definition authority, answer eligibility, public/runtime acceptance, or publication readiness.

## Queue Item

`spark10-release-package-intake-matrix-2026-06-04`

## Exact Inputs

- `data/control/spark_standing_queue.json`
- `data/control/agent_goal_board.json`
- `reports/spark10-broad-release-relevance-intake-triage-2026-06-04.md`
- `reports/agent1-broad-source-mechanics-consumption-2026-06-04.md`
- `reports/agent2-broad-definition-reader-hint-wake-verify-2026-06-04.md`
- `reports/agent2-broad-definition-reader-hint-wake-verify-2026-06-04.json`
- `reports/agent3-broad-linkage-dedupe-navigation-package-2026-06-04.md`
- `reports/agent3-broad-linkage-dedupe-navigation-package-2026-06-04.json`
- `reports/spark3-broad-linkage-dedupe-navigation-2026-06-04-report.md`
- `reports/spark4-broad-validator-runtime-prereq-mechanics-2026-06-04T07-57-06-239-next.md`
- `data/build/orot/reader-hint-placeholder-candidates.json`

If an input is missing, return `missing_input_blocker` naming the exact missing path. Do not substitute a broader scan.

## Mechanical Commands

Run only deterministic parse/count/intake checks over the exact inputs:

1. Parse listed JSON inputs where present.
2. Extract current control mode and publication status.
3. Extract row/work/occurrence counts already present in the artifacts.
4. Extract lane owner, blocker id/class, validator status if present, and zero-emission counters if present.
5. Extract whether each artifact claims a release/package next action or only evidence/prereq/navigation status.
6. Produce the expected output artifact below.

Do not invent a validator. If a dedicated validator does not exist, record `dedicated_validator_not_found`.

## Expected Output

- `reports/spark10-release-package-intake-matrix-2026-06-04.md`
- Optional JSON only if mechanically produced without schema invention:
  - `reports/spark10-release-package-intake-matrix-2026-06-04.json`

The matrix must include one row per input artifact group with:

- artifact path;
- lane owner;
- rows / works / occurrences if present;
- license lane split if present;
- validator result if present;
- blocker class;
- release/package relevance: `yes`, `no`, or `unclear`;
- exact next Agent 10 decision needed;
- exact Agent 6 route needed, if any;
- zero public/runtime/output/answer/definition/accepted-text counters if present.

## Stop Condition

Stop after producing the intake matrix or `missing_pipeline_blocker` / `missing_input_blocker` with exact missing command, input, output, or schema.

## Forbidden Claims

No QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, accepted text, public reader output, public mutation, route shard edit, runtime mutation, source mutation, token-index mutation, lexical-payload mutation, or answer eligibility.

## Agent 8 Callback

Status: Agent 10 produced exact Spark-10 release/package mechanics assignment for routing.

Artifact: `reports/agent10-spark10-release-package-intake-matrix-assignment-2026-06-04.md`

Requested route: send queue item `spark10-release-package-intake-matrix-2026-06-04` to Spark-10 replacement `019e925b-f976-73f2-a859-af586ac3887c`.

Stop condition: Spark-10 returns `reports/spark10-release-package-intake-matrix-2026-06-04.md` or exact missing input/pipeline blocker.

Highest permissible claim: Agent 10 delegated release/package mechanics to Spark-10 and retained release sequencing authority only.

What must not be accepted: no QA/source/provenance/license/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no public reader output.

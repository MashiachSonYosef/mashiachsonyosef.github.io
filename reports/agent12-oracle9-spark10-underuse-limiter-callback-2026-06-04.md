# Agent 12 Oracle 9 Spark-10 Underuse Limiter Callback - 2026-06-04

## Verdict

`CAP`

Spark-10 is not blocked. It is usable but underused by queue design.

## Status

Spark-10 replacement capacity exists and has returned release/package mechanical artifacts, but the current standing posture leaves it waiting for exact release-relevant wake conditions instead of keeping it fed with standing release/package mechanics.

Best label: `underused_waiting_with_valid_wake_condition`.

## Evidence

- `data/control/spark_standing_queue.json` names Spark-10 as release/package mechanical support, but current release-package items are returned, blocked by missing `pipeline_commands`, or sleeping until Agent 10/5/7 supply exact command/input/output/schema.
- `reports/agent7-broad-floor-compact-staffing-proof-2026-06-04.md` says old Spark-10 `019e8fd5-f595-7e60-b1b3-ead434bdce0f` is broken/not capacity, while usable Spark-10 `019e925b-f976-73f2-a859-af586ac3887c` returned `reports/spark10-orot-186-row-nohit-inventory-health-corrected-2026-06-04.md`.
- `reports/agent13-broad-floor-proof-map-2026-06-04.md` says replacement Spark-10 returned `reports/spark10-orot-169-row-local-route-card-dedupe-source-route-matrix-2026-06-04.md` and `.json`, but its next state is wake-only for exact release-relevant broad outputs.

This is not zero use. The waste is that Agent 10 can still absorb release/package mechanics while Spark-10 waits for an exact item.

## Lowest-Token Correction

Agent 5/7 should add one standing Spark-10 queue item, not spawn more review:

`spark10-release-package-intake-matrix`

Input: latest returned Agent 1-4/Spark artifacts plus current release/package anchors named by Agent 10 or Agent 7.

Output: one compact release/package intake matrix for Agent 10:

- artifact path;
- lane owner;
- row/work/occurrence counts if present;
- license lane split if present;
- validator result if present;
- blocker class;
- whether it is release-relevant;
- exact next Agent 10 decision needed;
- exact Agent 6 route needed, if any.

Stop condition: matrix produced or `missing_pipeline_blocker` with the exact missing command/input/output/schema.

## What To Stop

- Agent 13/7/5/8 should stop asking for additional broad goal-quality approvals when the missing item is an exact Spark-10 mechanical queue assignment.
- Agent 7/5 should stop treating `available with wake condition` as sufficient if Agent 10 has release/package artifacts to inventory.
- Agent 8 should stop pressure that asks Agent 10 to manually summarize/dedupe/count release package mechanics when Spark-10 can do the mechanical pass.
- Agent 10 should stop personally doing named artifact intake matrices, count reconciliation, release-package diffs, and blocker inventories when Spark-10 has a valid thread.

## One-Line Agent 10 Rule

If the task is release/package mechanics on named artifacts, such as intake matrix, dedupe, count reconciliation, package diff, validator-result collation, or blocker inventory, Agent 10 delegates it to Spark-10 and keeps only the release sequencing decision.

## Boundary

Agent 12 limiter/advisory waste check only. No QA/source/license/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no publication readiness. Publication remains `blocked_no_render`.

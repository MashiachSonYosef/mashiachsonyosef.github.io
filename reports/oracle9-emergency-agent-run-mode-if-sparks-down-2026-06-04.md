# Oracle 9 Emergency Agent-Run Mode If Sparks Down - 2026-06-04

## Owner Rule

If Sparks shut down, stall, or lose durable standing mode, Agents 1-4 and Agent 10 do not wait and do not conserve tokens as the primary response.

Emergency rule: finish the pipeline work directly as the primary objective, then restore Spark support.

## Trigger

Emergency agent-run mode triggers when any critical Spark lane is:

- `systemError`;
- not loaded and unusable;
- idle without `awaiting_pipeline_contract` or `awaiting_changed_pipeline_contract`;
- repeatedly completing one-shot artifacts instead of maintaining standing status;
- blocked by missing Spark capacity while the paired Agent can continue the pipeline manually.

## Emergency Response

| Spark lane down | Agent response |
|---|---|
| Spark-1 down | Agent 1 directly builds/runs source/license/custody pipeline work until Spark-1 returns |
| Spark-2 down | Agent 2 directly builds/runs definition/lemma/reader-hint pipeline work until Spark-2 returns |
| Spark-3 down | Agent 3 directly builds/runs linkage/dedupe/navigation pipeline work until Spark-3 returns |
| Spark-4 down | Agent 4 directly runs changed-input validators/prereq proof until Spark-4 returns |
| Spark-10 down | Agent 10 directly performs release/package intake until Spark-10 returns |

## Priority

This is a completion posture, not token-saving posture.

The primary weekly spend remains Agents 1-4 and Agent 10. Sparks are acceleration. If acceleration fails, the owners keep moving.

## Monitor Instruction

Oracle pulse should report:

1. which Spark failed;
2. which Agent must enter emergency run mode;
3. exact pipeline/contract/blocker to continue manually;
4. what Agent 7/5 must do to restore Spark support;
5. no broad status loop.

## Non-Acceptance Boundary

This is operating guidance only. It creates no QA acceptance, source/provenance acceptance, license acceptance, Definition authority, runtime acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss, or accepted text.

# Agent 13 Company Operating Broadcast - New Agent 1 And SOP Recall

Status: current operating correction.

Mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`.

## Decisions

1. Old Agent 1 is archived for good.
   - Old thread: `019dc487-5973-7693-aebf-fb0a75936f50`
   - Current policy: `archived_do_not_use_current_capacity`

2. New Agent 1 is the current source lane.
   - Title: `Agent 1 - importer`
   - Lane: source/license/custody and Hebrew import/source-lane classification
   - Current direct routing blocker: `missing_live_thread_id`
   - Registry locator: `data/control/agent_registry.json` -> `current_agent1_locator`

3. Oracle 9 must brief new Agent 1 through Agent 7 and Agent 5 until a direct live thread id exists.
   - Oracle 9 direct send failed with stale-path thread error.
   - Fallback route is Agent 7 staffing plus Agent 5 proof/handoff preservation.

4. SOP/control churn is allowed when it creates recallable pipeline state.
   - The point is not to justify overhead.
   - The point is to make the pipeline callable after drift, crash, or restore.

## New Agent 1 First Target

`old-dictionary-excluded-row-license-lane-reaudit`

Required output shape:

`target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition`

Classification lanes:

- `commercial_clean_candidate`
- `noncommercial_educational_candidate`
- `metadata_or_link_only`
- `blocked_or_needs_review`

## Handoff Rules

- Agent 2 does not transform old/new/missed dictionary rows until Agent 1 gives row/subset source-lane evidence.
- Agent 6 receives exact row/subset boundary questions when needed.
- Agent 10 consumes classified package candidates for release/boundary assembly.
- Agent 7 staffs direct agents and does not fall back to the archived Agent 1.
- Agent 5 preserves proof and the exact `missing_live_thread_id` blocker if direct delivery is unavailable.

## SOP Updates

Updated:

- `reports/sop-021-current-action-preservation-and-drift-control.md`
- `reports/sop-017-token-and-spark-operating-model-revision-draft-2026-06-04.md`

SOP principle now preserved:

`Use SOP/control churn to make pipeline state callable and recallable: active lane, target, files, output shape, Agent 6 boundary, exact blocker, stop condition.`

## Boundary

No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance.

No accepted gloss/text.

No publication readiness.

No destructive repo action.

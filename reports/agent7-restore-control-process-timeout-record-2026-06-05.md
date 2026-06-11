# Agent 7 Restore Control / Process Timeout Record - 2026-06-05

## Disposition

CONTROL-RECORDED / MANAGEMENT POSTURE ONLY.

This record preserves the restored management state and process-timeout rule routed to Agent 7. It does not create QA, source/license/legal, Definition, runtime, publication, product, answer, accepted-gloss, accepted-text, or release acceptance.

## Restored Staffing State

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE` / direct Agent run mode.

Oracle 9 reports Agents 1, 2, 3, 4, and 10 were restored/woken on locked live IDs. Agent 7 preserves this as current management state:

| lane | management state | correction |
|---|---|---|
| Agent 1 | active primary worker | New Agent 1 is Agent 1 - importer. Old Agent 1 is archived / do-not-use. |
| Agent 2 | active primary worker | Definition/lemma/reader-hint transforms only after source-lane evidence exists. |
| Agent 3 | active primary worker | Crossmatch/linkage/dedupe/navigation matrices on exact worksets. |
| Agent 4 | active primary worker | Validator/prereq/runtime proof only for changed packages/inputs or exact blocker. |
| Agent 10 | active primary worker | Release/package intake and exact Agent 6 boundary packet assembly. |

Primary workers are active, not `usage_limited`, per Oracle 9 restore route.

Assistant/Spark lanes remain unavailable/historical unless owner explicitly re-enables repaired capacity.

## Process Timeout Rule

Every local command, validator, server, watcher, browser automation, repo scan, or helper must have an explicit timeout, bounded stop condition, or documented interactive reason before it starts.

This applies to Agent 6 and to management-routed helper work, including:

- repo-dirt classification;
- repo validation scripts;
- git scans;
- queue checks;
- Agent 6 queued-item validation;
- local servers/watchers;
- browser automation;
- any helper process that could hang or keep running.

Do not retry the same hung command without changing timeout, scope, or stop condition. Do not treat a still-running process as evidence, validation, proof, or acceptance.

## Timeout Report Shape

When a process times out or is stopped for exceeding its bound, record:

`process_timeout | command | timeout | partial_output_or_artifact | next_safe_action`

## Agent 6 Routing Note

Direct Agent 6 send was reported blocked by stale-path mismatch. Agent 7 preserves this process-control correction through the management/proof path for Agent 6 consumption.

## Management Delivery Proof

Agent 7 routed this control correction to Agent 5 for proof preservation and Agent 6 queue/control handling.

| route | target | submission | status |
|---|---|---|---|
| Agent 7 -> Agent 5 | `019e7c87-a84d-7491-b285-04d18a95c162` | `019e9a07-6c75-7bd3-877d-0996c90d40f2` | delivered_to_management_path |

## Stop Condition

This record is sufficient when the restored staffing state and timeout rule are visible to management/control lanes, with no acceptance claims and no destructive repo action.

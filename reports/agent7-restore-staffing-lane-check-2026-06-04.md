# Agent 7 Restore Staffing Lane Check - 2026-06-04

Active restore posture:

- `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`
- `Option C HYBRID`: Orot prototype hardening plus Deuteronomy replication.
- Agents 1-4 and Agent 10 are primary weekly production lanes.
- `assistant-1` = primary assistant support lane for Agents 1-6 production/compliance mechanics.
- `assistant-2` = primary assistant support lane for Agent 10 and Agents 8-13 release/support mechanics.
- Spark-2, Spark-3, and Spark-4 are overflow only unless explicitly re-enabled with exact contracts.
- Source-lane separated lexicon expansion remains active.

## Restore Map

| lane | restored goal | current evidence | status | next action / blocker |
| --- | --- | --- | --- | --- |
| Agent 1 | Source-family/license/custody lane classification and old/new dictionary row-subset evidence. | `reports/agent1-current-source-license-custody-lane-return-2026-06-04.md`; `reports/agent1-source-license-custody-command-manifest-2026-06-04.json`. | Restored on pipeline. Agent 1 has `9` runnable contracts, `9` supporting packets, and `1` exact blocker. | Continue exact source-family worksets. Contract 3 remains blocked on `third_missed_source_family` missing workset. |
| Agent 2 | Definition/lemma/reader-hint transforms only after lane evidence exists. | `reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.md`; `reports/agent2-spark1-runnable-command-manifest-2026-06-04.json`. | Restored on pipeline. Agent 2 has `7` runnable pipelines, `19` validator-only checks, and exact blockers. | Wait for classified Agent 1 lanes or a new exact workset before further transforms. |
| Agent 3 | Linkage/dedupe/navigation matrices for active worksets. | `reports/agent3-frontier-receipt-custody-boundary-observer-package-2026-06-04.md`; `reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json`. | Restored as evidence-ready/observer lane. Prior Deuteronomy matrix exists; no new executable route without changed artifact or exact linkage workset. | Wake only on changed artifact or exact linkage/dedupe/navigation workset. |
| Agent 4 | Validator/prereq/runtime only on changed packages/inputs. | `reports/agent4-lowmode-validator-prereq-cap-status-2026-06-04.md`; `reports/agent4-changed-input-only-wake-condition-2026-06-04.md`. | Restored and correctly capped. Gate builder/check/smoke test passed; validators run now: `0`. | Hold until changed package/input plus exact commands, output schema, gate, and stop condition exists. |
| Agent 10 | Release/package intake and exact Agent 6 boundary packet assembly. | `reports/agent10-weekly-lexicon-release-next-boundary-or-blocker-2026-06-04.md`; `reports/spark10-release-package-intake-matrix-current-2026-06-04.json`. | Restored on release/package integration. Spark-10 intake checked `169` inputs, `0` missing required inputs, `69` release-relevant rows, `0` Agent 6 handoff candidates. | Continue consuming returned lane evidence; no release/public/Definition action until exact boundary packet exists. |
| assistant-1 | Primary assistant support lane for Agents 1-6 production/compliance mechanics. | `reports/spark1-standing-goal-mode-status-2026-06-04.md`. | Restored as mechanical support. Ready contracts exhausted; status `awaiting_third_workset` / `awaiting_contract_component_or_wake`. | Run only complete Agent 1-6 contracts. Next blocker: `third_missed_source_family` missing workset and other missing command packets. |
| assistant-2 | Primary assistant support lane for Agent 10 and Agents 8-13 release/support mechanics. | `reports/spark10-primary-agent8-13-status-2026-06-04.md`; `reports/spark10-standing-goal-mode-status-2026-06-04.md`. | Restored as release-support mechanical lane. Status `awaiting_changed_artifact`. | Wake only when exact changed inputs or release-support contract exists. Current missing changed inputs are Agent 2 missed-dictionary and Deuteronomy reader-hint candidate package artifacts. |

## Low-Mode Staffing Rule

Agents 1-4 should receive deterministic pipeline tasks only:

`target | files | exact command/script to write or run | output artifact | schema/counts | validator | missing-field blocker | handoff owner | stop condition`

Do not ask Agents 1-4 for strategy, license doctrine, Definition authority, release readiness, public/runtime acceptance, or reception language.

## Restore Decision

No broad wake or re-ping is needed right now. Agents 1-4 and Agent 10 are primary production lanes; assistant-1 and assistant-2 are primary assistant support lanes; Spark-2/3/4 are overflow only unless explicitly re-enabled. The restored lanes are either running, holding exact blockers, or waiting on changed inputs. The next useful management action is to route only returned artifacts, exact blockers, stalls/failures, or a new exact workset.

## What Must Not Be Accepted

No QA acceptance, source/provenance acceptance, license/legal acceptance, Definition authority, usage-as-definition authority, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, release action, accepted gloss, accepted text, NC commercial authorization, public reader output, route-shard edit, public/runtime mutation, source mutation, token-index mutation, lexical-payload mutation, or answer emission is created by this restore check.

# Agent 12 Agent 3 Control-Drift Schema Unblock - 2026-06-04

| lane | cap/allow | reason | exact next useful work | stop condition |
| --- | --- | --- | --- | --- |
| Agent 3 validator mismatch | allow/fix | Agent 10 preserved a prior blocker that `reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.json.summary.rows` was undefined, but the current validator reads `counts ?? summary` and passes against `reports/agent3-current-control-drift-refresh-2026-06-04.json`. | Clear the stale schema-mismatch blocker from active routing decisions. | `node scripts/validate_agent3_current_control_drift_refresh.mjs reports/agent3-current-control-drift-refresh-2026-06-04.json` passes. |
| Agent 3 next work | allow only with exact contract | The current refresh reports `new_agent3_executable_worksets=0`; only `spark-oracle9-missed-dictionary-evidence-diff` remains blocked on missing contract fields. | Supply commands, named inputs, output path/schema, validator gate, target, package owner, Agent 6 boundary, and stop condition before running Spark-3/Agent-3 work. | Exact contract exists or missing fields remain listed. |
| Coordination/status | cap | Repeating the old validator blocker would be churn now that the validator passes. | Route only the exact missing contract fields above. | No stale blocker repeated. |

Boundary: Agent 12 waste-cap/unblock note only. No QA/source/license/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no public reader output, and no publication readiness.

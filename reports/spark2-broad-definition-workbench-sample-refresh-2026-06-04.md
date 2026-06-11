# Spark-2 Exact Broad Release Queue Item
## queue item id
- `spark2-broad-definition-workbench-sample-refresh`

## exact inputs
- `.local-cache/workbench-evidence/token-inventory.json`
- `data/definitions/hud-route-lookup/manifest.json`

## exact scripts
1. `node scripts/build_definition_workbench_sample.mjs`
2. `node scripts/validate_definition_workbench_sample.mjs data/definitions/definition-workbench-sample.json`

## results
- build command exit code: 0
- build output: wrote 200 row sample to `data/definitions/definition-workbench-sample.json`
- build report: `reports/definition-workbench-sample-report.md`
- validator command exit code: 0
- validator output: `Definition Workbench sample validation passed. Rows: 200.`

## produced artifact paths
- `data/definitions/definition-workbench-sample.json`
- `reports/definition-workbench-sample-report.md`

## blocker status
- missing_pipeline_blocker: none

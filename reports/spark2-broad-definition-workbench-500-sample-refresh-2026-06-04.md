# Spark-2 Exact Workset: spark2-broad-definition-workbench-500-sample-refresh

- queue item: `spark2-broad-definition-workbench-500-sample-refresh`
- mode: `BROAD_CORPUS_EXPANSION`

## Exact command set and exit codes
1. `node scripts/build_definition_workbench_sample.mjs --limit=500 --output=data/definitions/definition-workbench-sample-500.json --report=reports/definition-workbench-sample-500-report.md`
   - exit_code: 0
   - output: `Definition Workbench sample wrote 500 row(s). Output: data/definitions/definition-workbench-sample-500.json. Report: reports/definition-workbench-sample-500-report.md`

2. `node scripts/validate_definition_workbench_sample.mjs data/definitions/definition-workbench-sample-500.json`
   - exit_code: 0
   - output: `Definition Workbench sample validation passed. Rows: 500.`

3. `git diff --check -- data/definitions/definition-workbench-sample-500.json reports/definition-workbench-sample-500-report.md`
   - exit_code: 0
   - output: no whitespace/errors reported

## Produced artifacts
- `data/definitions/definition-workbench-sample-500.json`
- `reports/definition-workbench-sample-500-report.md`

## block status
- missing_pipeline_blocker: none
- no overwrite of 200-row artifacts detected; previous artifacts preserved:
  - `data/definitions/definition-workbench-sample.json`
  - `reports/definition-workbench-sample-report.md`

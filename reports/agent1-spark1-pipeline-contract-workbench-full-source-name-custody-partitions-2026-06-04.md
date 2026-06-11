# Agent 1 / Spark-1 Pipeline Contract - Workbench Full Source-Name Custody Partitions - 2026-06-04

Status: `pipeline_contract_runnable_validated`.

target: `workbench-full-source-name-custody-partitions`.

command:

```powershell
node scripts/build_agent1_workbench_full_source_name_custody_partitions.mjs
node scripts/validate_agent1_workbench_full_source_name_custody_partitions.mjs
node scripts/validate_agent1_spark1_workbench_full_source_name_custody_partitions_contract.mjs
```

outputs:

- JSON: `reports/agent1-workbench-full-source-name-custody-partitions-2026-06-04.json`
- MD: `reports/agent1-workbench-full-source-name-custody-partitions-2026-06-04.md`

counts:

- input files: `10`
- source rows: `105747`
- source-name partitions: `351`

Spark-1 stop condition: output plus validator pass, or exact missing input/output/schema/validator/count blocker.

Boundary: no source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, export authorization, or public/runtime mutation.

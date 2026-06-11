# Agent 1 / Spark-1 Pipeline Contract - Workbench CC-BY Attribution Boundary Map - 2026-06-04

Status: `pipeline_contract_runnable_validated`.

target: `workbench-cc-by-attribution-boundary-map`.

inputs:

- `reports/agent1-workbench-source-name-custody-partitions-2026-06-04.json`

command:

```powershell
node scripts/build_agent1_workbench_cc_by_attribution_boundary_map.mjs
node scripts/validate_agent1_workbench_cc_by_attribution_boundary_map.mjs
node scripts/validate_agent1_spark1_workbench_cc_by_attribution_boundary_contract.mjs
```

outputs:

- JSON: `reports/agent1-workbench-cc-by-attribution-boundary-map-2026-06-04.json`
- MD: `reports/agent1-workbench-cc-by-attribution-boundary-map-2026-06-04.md`

counts:

- declared CC-BY partitions: `5`
- declared CC-BY source rows: `625`
- sampled top-partition CC-BY partitions: `1`
- sampled top-partition CC-BY source rows: `239`

Spark-1 stop condition: output plus validator pass, or exact missing input/output/schema/validator/count blocker.

Boundary: no source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, CC-BY export authorization, or public/runtime mutation.

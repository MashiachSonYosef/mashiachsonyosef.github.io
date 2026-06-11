# Agent 1 / Spark-1 Pipeline Contract - Workbench CC0 Public Domain Zero Boundary Map - 2026-06-04

Status: `pipeline_contract_runnable_validated`.

target: `workbench-cc0-public-domain-zero-boundary-map`.

inputs:

- `reports/agent1-workbench-source-name-custody-partitions-2026-06-04.json`

command:

```powershell
node scripts/build_agent1_workbench_cc0_public_domain_zero_boundary_map.mjs
node scripts/validate_agent1_workbench_cc0_public_domain_zero_boundary_map.mjs
node scripts/validate_agent1_spark1_workbench_cc0_public_domain_zero_boundary_contract.mjs
```

outputs:

- JSON: `reports/agent1-workbench-cc0-public-domain-zero-boundary-map-2026-06-04.json`
- MD: `reports/agent1-workbench-cc0-public-domain-zero-boundary-map-2026-06-04.md`

counts:

- declared CC0 partitions: `2`
- declared CC0 source rows: `496`
- sampled top-partition CC0 partitions: `1`
- sampled top-partition CC0 source rows: `267`

Spark-1 stop condition: output plus validator pass, or exact missing input/output/schema/validator/count blocker.

Boundary: no source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, CC0 export authorization, or public/runtime mutation.

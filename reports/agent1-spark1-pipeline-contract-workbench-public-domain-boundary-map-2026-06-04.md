# Agent 1 / Spark-1 Pipeline Contract - Workbench Public Domain Boundary Map - 2026-06-04

Status: `pipeline_contract_runnable_validated`.

target: `workbench-public-domain-boundary-map`.

inputs:

- `reports/agent1-workbench-source-name-custody-partitions-2026-06-04.json`

command:

```powershell
node scripts/build_agent1_workbench_public_domain_boundary_map.mjs
node scripts/validate_agent1_workbench_public_domain_boundary_map.mjs
node scripts/validate_agent1_spark1_workbench_public_domain_boundary_contract.mjs
```

outputs:

- JSON: `reports/agent1-workbench-public-domain-boundary-map-2026-06-04.json`
- MD: `reports/agent1-workbench-public-domain-boundary-map-2026-06-04.md`

counts:

- declared Public Domain partitions: `307`
- declared Public Domain source rows: `99045`
- sampled top-partition Public Domain partitions: `93`
- sampled top-partition Public Domain source rows: `88100`

Spark-1 stop condition: output plus validator pass, or exact missing input/output/schema/validator/count blocker.

Boundary: no source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, Public Domain export authorization, or public/runtime mutation.

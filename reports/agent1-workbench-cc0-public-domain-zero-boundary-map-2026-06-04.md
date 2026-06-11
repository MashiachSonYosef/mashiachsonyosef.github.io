# Agent 1 Workbench CC0 Public Domain Zero Boundary Map - 2026-06-04

Status: `agent1_workbench_cc0_public_domain_zero_boundary_map_prepared_for_agent6_boundary_only`.

target: `workbench-cc0-public-domain-zero-boundary-map`.

files:

- input: `reports/agent1-workbench-source-name-custody-partitions-2026-06-04.json`
- output JSON: `reports/agent1-workbench-cc0-public-domain-zero-boundary-map-2026-06-04.json`
- output MD: `reports/agent1-workbench-cc0-public-domain-zero-boundary-map-2026-06-04.md`
- build script: `scripts/build_agent1_workbench_cc0_public_domain_zero_boundary_map.mjs`
- validator: `scripts/validate_agent1_workbench_cc0_public_domain_zero_boundary_map.mjs`
- contract JSON: `reports/agent1-spark1-pipeline-contract-workbench-cc0-public-domain-zero-boundary-map-2026-06-04.json`
- contract MD: `reports/agent1-spark1-pipeline-contract-workbench-cc0-public-domain-zero-boundary-map-2026-06-04.md`
- contract validator: `scripts/validate_agent1_spark1_workbench_cc0_public_domain_zero_boundary_contract.mjs`

command:

```powershell
node scripts/build_agent1_workbench_cc0_public_domain_zero_boundary_map.mjs
node scripts/validate_agent1_workbench_cc0_public_domain_zero_boundary_map.mjs
node scripts/validate_agent1_spark1_workbench_cc0_public_domain_zero_boundary_contract.mjs
```

counts:

- declared CC0 partitions: `2`
- declared CC0 source rows: `496`
- sampled top-partition CC0 partitions: `1`
- sampled top-partition CC0 source rows: `267`
- sampled unique works: `4`

missing-field blocker: Agent 6/release boundary treatment, package/export handling rule, and public/runtime/display authorization if any.

handoff owner: Agent 10 for release/package intake; Agent 6 only by exact boundary packet prepared through release owner.

stop condition: output plus validator pass, or exact missing input/output/schema/validator/count blocker.

## CC0 Sampled Partitions

| source name | rows | works | version source |
| --- | ---: | ---: | --- |
| `Gerlitz edition, published by Oraita` | `267` | `4` | `https://www.sefaria.org` |

## Boundary

Evidence/blocker only. No source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, CC0 export authorization, or public/runtime mutation.

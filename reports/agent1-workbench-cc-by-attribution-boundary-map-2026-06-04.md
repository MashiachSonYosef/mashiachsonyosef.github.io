# Agent 1 Workbench CC-BY Attribution Boundary Map - 2026-06-04

Status: `agent1_workbench_cc_by_attribution_boundary_map_prepared_for_agent6_boundary_only`.

## Task Shape

target: `workbench-cc-by-attribution-boundary-map`.

files:

- input: `reports/agent1-workbench-source-name-custody-partitions-2026-06-04.json`
- output JSON: `reports/agent1-workbench-cc-by-attribution-boundary-map-2026-06-04.json`
- output MD: `reports/agent1-workbench-cc-by-attribution-boundary-map-2026-06-04.md`
- build script: `scripts/build_agent1_workbench_cc_by_attribution_boundary_map.mjs`
- validator: `scripts/validate_agent1_workbench_cc_by_attribution_boundary_map.mjs`
- contract JSON: `reports/agent1-spark1-pipeline-contract-workbench-cc-by-attribution-boundary-map-2026-06-04.json`
- contract MD: `reports/agent1-spark1-pipeline-contract-workbench-cc-by-attribution-boundary-map-2026-06-04.md`
- contract validator: `scripts/validate_agent1_spark1_workbench_cc_by_attribution_boundary_contract.mjs`

exact command/script to run:

```powershell
node scripts/build_agent1_workbench_cc_by_attribution_boundary_map.mjs
node scripts/validate_agent1_workbench_cc_by_attribution_boundary_map.mjs
node scripts/validate_agent1_spark1_workbench_cc_by_attribution_boundary_contract.mjs
```

schema/counts:

- declared CC-BY partitions: `5`
- declared CC-BY source rows: `625`
- sampled top-partition CC-BY partitions: `1`
- sampled top-partition CC-BY source rows: `239`
- sampled unique works: `1`

validator: `node scripts/validate_agent1_workbench_cc_by_attribution_boundary_map.mjs`.

missing-field blocker: Agent 6/legal attribution boundary treatment, attribution display/export rule, package/export handling rule, and public/runtime/display authorization if any.

handoff owner: Agent 10 for release/package intake; Agent 6 only by exact boundary packet prepared through release owner.

stop condition: output plus validator pass, or exact missing input/output/schema/validator/count blocker.

## CC-BY Sampled Partitions

| source name | rows | works | version source |
| --- | ---: | ---: | --- |
| `Pesikta de Rav Kahana according to an Oxford manuscript, Dov Mandelbaum ed., N.Y. 1987` | `239` | `1` | `https://beta.nli.org.il/he/books/NNL_ALEPH002042999/NLI` |

## Boundary

Evidence/blocker only. No source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, CC-BY export authorization, or public/runtime mutation.

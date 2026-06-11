# Agent 1 Spark-1 Pipeline Contract - Workbench Source-Name Custody Partitions - 2026-06-04

Status: `pipeline_contract_runnable_validated`.

## Target

- workset: `workbench-source-name-custody-partitions`
- input files: `10`
- source rows: `105747`
- unique source ids: `1144`
- unique works: `1112`
- source-name partitions: `351`
- top partition sample: `100`

## Commands

- build: `node scripts/build_agent1_workbench_source_name_custody_partitions.mjs`
- validate output: `node scripts/validate_agent1_workbench_source_name_custody_partitions.mjs`
- validate contract: `node scripts/validate_agent1_spark1_workbench_source_name_custody_partitions_contract.mjs`

## Outputs

- JSON: `reports/agent1-workbench-source-name-custody-partitions-2026-06-04.json`
- Markdown: `reports/agent1-workbench-source-name-custody-partitions-2026-06-04.md`

## License Partition Basis

| license | partitions | source rows | boundary |
| --- | ---: | ---: | --- |
| Public Domain | `307` | `99045` | Agent 6 boundary still required before acceptance/use |
| CC-BY-SA | `37` | `5581` | share-alike boundary required; no commercial export authorization here |
| CC-BY | `5` | `625` | attribution boundary required |
| CC0 | `2` | `496` | Agent 6 boundary still required before acceptance/use |

## Required Separation

- commercial-clean export excludes NC rows.
- NC educational export stays separate if future NC rows appear.
- metadata/link-only emits citation or link only.
- blocked/review emits no candidate text.
- CC-BY-SA remains commercial-export false pending explicit boundary.

## Spark-1 Stop Condition

Spark-1 may run only the listed build/validator commands and must stop after output plus validator pass, or return exact missing input/output/schema/validator/count blocker.

## Boundary

This is a runnable source/license/custody contract only. It does not accept source/provenance, license/legal posture, QA, Definition authority, answer output, public/runtime behavior, publication readiness, product/data status, accepted gloss/text, NC commercial authorization, or CC-BY-SA commercial export authorization.

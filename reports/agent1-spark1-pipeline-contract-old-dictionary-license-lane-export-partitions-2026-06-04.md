# Agent 1 Spark-1 Pipeline Contract - Old Dictionary License-Lane Export Partitions - 2026-06-04

Status: `pipeline_contract_runnable_validated`.

## Target

- workset: `old-dictionary-license-lane-export-partitions`
- source artifact: `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`
- commercial-clean families: `3`
- NC educational families: `1`
- metadata/link-only families: `0`
- blocked/review families: `1`

## Commands

- build: `node scripts/build_agent1_old_dictionary_license_lane_export_partitions.mjs`
- validate output: `node scripts/validate_agent1_old_dictionary_license_lane_export_partitions.mjs`
- validate contract: `node scripts/validate_agent1_spark1_old_dictionary_license_lane_export_partitions_contract.mjs`

## Outputs

- JSON: `reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.json`
- Markdown: `reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.md`

## Partition Counts

| lane | source families | rows | occurrences |
| --- | ---: | ---: | ---: |
| commercial_clean_candidate | `3` | `500` | `10940` |
| noncommercial_educational_candidate | `1` | `214` | `4444` |
| metadata_or_link_only | `0` | `0` | `0` |
| blocked_or_needs_review | `1` | `222` | `4435` |

## Separation Rules

- commercial-clean partition excludes NC rows.
- NC/Klein remains separate `noncommercial_educational_candidate`, `derived_from_nc=true`, `commercial_export_allowed=false`.
- BDB Augmented Strong remains `blocked_or_needs_review` until independent custody evidence exists.
- no partition is answer eligible or public-emittable from this contract.

## Spark-1 Stop Condition

Spark-1 may run only the listed build/validator commands and must stop after output plus validator pass, or return exact missing input/output/schema/validator/count blocker.

## Boundary

This is a runnable source/license/custody contract only. It does not accept source/provenance, license/legal posture, QA, Definition authority, answer output, public/runtime behavior, publication readiness, product/data status, accepted gloss/text, NC commercial authorization, or candidate text export authorization.

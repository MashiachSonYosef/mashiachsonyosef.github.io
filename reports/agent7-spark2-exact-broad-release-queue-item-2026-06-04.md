# Agent 7 Spark-2 Exact Broad Release Queue Item

Date: 2026-06-04

Active mode: `BROAD_CORPUS_EXPANSION`

## Queue Item

`spark2-broad-definition-workbench-sample-refresh`

## Purpose

Repair Agent 2 / Spark-2 blocker `missing_broad_definition_reader_hint_workset_and_commands` with one exact broad definition/lemma/reader-planning workset using existing commands only.

This is a release-planning evidence item. It does not create append, public/runtime mutation, answer eligibility, Definition authority, accepted gloss/text, or publication readiness.

## Required Fields

| Field | Value |
| --- | --- |
| target workset path | `.local-cache/workbench-evidence/token-inventory.json` |
| exact input files | `.local-cache/workbench-evidence/token-inventory.json`; `data/definitions/hud-route-lookup/manifest.json` |
| exact builder/extractor commands | `node scripts/build_definition_workbench_sample.mjs` |
| exact output path | `data/definitions/definition-workbench-sample.json` |
| report output path | `reports/definition-workbench-sample-report.md` |
| schema/count definition | `artifact_type=definition_workbench_sample`; default token limit 200 rows from `token_inventory.top_tokens`; counts include rows, rows with/without route cards, multi-answer rows, rows with complete source/license rows, status counts, and review-status counts |
| validator/gate command | `node scripts/validate_definition_workbench_sample.mjs data/definitions/definition-workbench-sample.json` |
| package owner | Agent 2 |
| first consumer | Agent 10 only if release/package relevant; otherwise Agent 2 packaging evidence |
| Agent 6 review question | If submitted, does this refreshed Definition Workbench sample remain non-authoritative route-shape/reader-planning evidence only, with no Definition authority, answer acceptance, publication readiness, or public/runtime acceptance? |

## Stop Condition

Spark-2 stops after returning one artifact path plus validator result, or exact `missing_pipeline_blocker` naming the missing target workset, input file, output path/schema, or validator.

## Boundary

No QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, accepted text, public reader output, route-shard edit, or public/runtime mutation. Publication remains `blocked_no_render`.

# Agent 3 / Spark-1 Deuteronomy Phase-2 Linkage-Dedupe-Source-Route Contract - 2026-06-04

Status: runnable_contract.

Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE / two-primary Spark model.

Runnable by Spark-1 `019e92c1-89b1-7821-898b-2106638345cb`.

## Target

- Work: Deuteronomy.
- Workset: `deuteronomy-linkage-dedupe-source-route-matrix`.
- Rows: 8113.
- Occurrences: 12595.

## Inputs

- `reports/agent10-deuteronomy-pipeline-intake-state-2026-06-04.md`
- `data/lexical/deuteronomy.manifest.json`
- `data/lexical/occurrences/deuteronomy.json`
- `data/lexical/token-indexes/tanakh/deuteronomy.json`
- `data/public-lexical/by-work/deuteronomy-token-claims-min60.csv`
- `data/sources/deuteronomy.json`
- `data/overlays/deuteronomy.json`

## Commands

- `node scripts/build_agent3_deuteronomy_phase2_linkage_dedupe_source_route_matrix.mjs`
- `node scripts/validate_agent3_deuteronomy_phase2_linkage_dedupe_source_route_matrix.mjs`

## Output

- JSON: `reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json`
- Markdown: `reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.md`

## Schema

Required top-level fields: `schema_version`, `artifact_type`, `status`, `target_work`, `inputs`, `source_metadata`, `counts`, `route_bucket_counts`, `duplicate_key_summary`, `exact_blocker_summary`, `downstream_boundary_summary`, `gates`, `rows`, `stop_condition`, `what_remains_blocked`, `what_must_not_be_accepted`.

Required row fields: `token_index_id`, `clicked_surface_form`, `normalized_form`, `occurrence_count`, `export_status`, `route_bucket`, `duplicate_key`, `source_route_evidence`, `downstream_boundary`, `exact_blockers`.

Duplicate key rule: `work_id|token_index_id|normalized_form|export_status`.

## Expected Matrix Counts

- Rows: 8113.
- Occurrences: 12595.
- Token-index forms: 8113.
- Token-index occurrences: 12595.
- Occurrence units: 956.
- Source units: 956.
- Manifest chunks: 9.
- Joined token-index rows: 8113.
- Missing token-index join rows: 0.
- Safe downstream-boundary rows: 1334 / 2964 occurrences.
- Below-threshold blocker rows: 1594 / 2922 occurrences.
- Unresolved blocker rows: 5185 / 6709 occurrences.
- Exact blocker rows: 6779 / 9631 occurrences.
- Unique duplicate keys: 8113.
- Duplicate-key collision groups: 0.

## Validator Gate

Run `node scripts/validate_agent3_deuteronomy_phase2_linkage_dedupe_source_route_matrix.mjs`.

The validator must pass the row, occurrence, duplicate-key, blocker, downstream-boundary, and zero-output counts before Spark-1 returns the artifact as runnable output.

## Package Owner

Agent 3 owns this contract and matrix package.

Agent 2 is downstream only for the 1334 boundary-candidate rows and only after mechanical matrix intake. This contract accepts no transform-ready row.

Agent 6 is required before any source/provenance/license/Definition/public/runtime/answer acceptance. This contract claims none.

## Stop Condition

Spark-1 stops after running the two listed commands and returning the Deuteronomy phase-2 linkage/dedupe/source-route matrix artifact, or returns the exact command/input/output/schema blocker produced by the builder or validator.

## Boundary

No route publication support, definition/answer selection, usage-as-definition authority, QA/source/provenance/license/Definition/runtime/publication/product/answer acceptance, accepted gloss/text, or public/runtime mutation is claimed.

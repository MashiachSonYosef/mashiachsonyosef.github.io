# Agent 3 / Spark-3 Linkage-Dedupe-Navigation Pipeline Contract - 2026-06-04

Status: runnable_contract_for_first_target.

Mode: BROAD_CORPUS_EXPANSION + OROT_PROTOTYPE_HARDENING.

## Target

- Work: Orot.
- Workset: route-card/candidate-card dedupe closure.
- Rows: 169.
- Occurrences: 2148.
- Preserve blocker: 168 rows / 2117 occurrences missing package-anchor evidence.

## Inputs

- `reports/agent3-broad-linkage-dedupe-navigation-package-2026-06-04.md`
- `reports/spark10-orot-169-row-local-route-card-dedupe-source-route-matrix-2026-06-04.json`
- `reports/agent10-orot-186-row-nohit-inventory-packet-2026-06-04.json`
- `data/build/orot/reader-hint-placeholder-candidates.json`
- `reports/spark3-broad-linkage-dedupe-navigation-2026-06-04-report.md`

## Commands

- `node scripts/build_agent3_orot_route_card_candidate_card_dedupe_review.mjs`
- `node scripts/validate_agent3_orot_route_card_candidate_card_dedupe_review.mjs`

## Output

- JSON: `reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.json`
- Markdown: `reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.md`

## Schema

Required top-level fields: `schema_version`, `artifact_type`, `status`, `inputs`, `scope`, `counts`, `duplicate_key_summary`, `matched_route_card_evidence_scope`, `exact_blocker_summary`, `gates`, `rows`, `stop_condition`, `what_remains_blocked`, `what_must_not_be_accepted`.

Required row fields: `token_id`, `queue_id`, `surface`, `normalized`, `occurrences`, `duplicate_key`, `route_card_evidence`, `candidate_card_evidence`, `ambiguity_card_evidence`, `package_anchor_evidence`, `dedupe_review_status`, `exact_blockers`.

Duplicate key rule: `token_id|route:<current_route_card_count>|candidate:<current_candidate_count>|ambiguity:<current_ambiguity_count>`.

## Validator Gate

Run `node scripts/validate_agent3_orot_route_card_candidate_card_dedupe_review.mjs`.

Required pass counts: 169 rows, 2148 occurrences, 169 unique duplicate keys, 0 duplicate-key collision groups, 168 exact blocker rows, 2117 exact blocker occurrences, and zero public HUD rows, answer rows, and accepted-text rows.

## Package Owner

Agent 3 owns this contract and the package artifact.

Agent 2 is downstream only after mechanical dedupe identifies transform-ready rows; this contract accepts none.

Agent 6 is required for any source/provenance/license/Definition/public/runtime/answer acceptance; this contract claims none.

## Phase 2

Deuteronomy linkage/dedupe/source-route matrix is not runnable from this contract yet.

Status: missing_pipeline_blocker_until_seeded.

Missing fields: target rows/work manifest, route/card/provenance input matrix, output path and schema, duplicate key rules, validator/gate, and stop condition.

## Stop Condition

Spark-3 stops after running the two listed commands and returning the Orot 169-row dedupe review artifact, or returns the exact command/input/output/schema blocker produced by the builder or validator.

## Boundary

No route publication support, definition/answer selection, usage-as-definition authority, QA/source/provenance/license/Definition/runtime/publication/product/answer acceptance, accepted gloss/text, or public/runtime mutation is claimed.

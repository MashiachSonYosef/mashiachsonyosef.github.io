# Spark-10 Orot 186-Row No-Hit Inventory Health (Corrected) — 2026-06-04

## Command result
- Command run: `node -e ...` (corrected assertion check against `reports/agent10-orot-186-row-nohit-inventory-packet-2026-06-04.json`)
- Result: PASS
- Exit code: 0
- Stdout summary: `nohit inventory assertions passed`
- Stderr summary: none

## Observed assertions
- `package_anchor.rows`: 332
- `package_anchor.occurrences`: 6156
- `summary.nohit_rows`: 186
- `summary.nohit_occurrences`: 2421
- `summary.source_route_counts.local_route_card_dedupe_review.rows`: 169
- `summary.source_route_counts.local_candidate_or_ambiguity_review.rows`: 15
- `summary.source_route_counts.missing_lexicon_linkage_review.rows`: 2
- all `zero_counts` values were zero.

## Exact blocker
- None.

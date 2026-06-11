# Spark-10 Orot 186-Row No-Hit Inventory Health (2026-06-04)

## Command results

1. `node scripts/validate_agent10_orot_non_public_reader_hint_placeholder_package.mjs data/build/orot/reader-hint-placeholder-candidates.json`
- Result: PASS
- Exit code: 0
- Stdout summary: `non-public reader-hint placeholder package validation passed for data/build/orot/reader-hint-placeholder-candidates.json.`
- Stderr summary: none

2. `node -e "...frontier assertions..."`
- Result: FAIL
- Exit code: 1
- Stdout summary: none
- Stderr summary: `anchor occurrences`

3. `git diff --check -- scripts/build_agent10_orot_nohit_inventory_packet.mjs reports/agent10-orot-186-row-nohit-inventory-packet-2026-06-04.json reports/agent10-orot-186-row-nohit-inventory-packet-2026-06-04.md`
- Result: PASS
- Exit code: 0
- Stdout summary: none
- Stderr summary: none

## Observed inventory and route buckets
- Not fully assertable in this run because command 2 failed on `anchor occurrences`.
- Expected command checks requested were: 186 rows / 2421 occurrences; source routes 169 / 15 / 2.

## Emissions
- zero public/runtime/output/answer/definition/accepted-text emissions observed in this mechanical check.

## Exact blocker
- `anchor occurrences` assertion failed in command 2 (`node -e` check).

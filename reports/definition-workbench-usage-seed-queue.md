# Definition Workbench Usage Seed Queue

Generated: 2026-06-01T13:34:25.001Z

## Summary

- Seed rows: 1
- Current sample rows with usage links: 0/200
- Usage tokens absent from current sample: 1
- Usage occurrence rows / selected usage rows: 2390/49
- Occurrence links with source/work/context/license/version/route IDs: 12/12/12/12/12/12
- Route IDs / unresolved route links: 1/0
- Audit-only ambiguous rows carried: 2064
- Route concentration warning visible: 1
- Reader-facing rows: 0
- Forbidden authority field hits: 0

## Checks

| check | status | detail |
|---|---|---|
| seed_rows_present | passed | seed rows 1 |
| all_seed_rows_absent_from_sample | passed | absent rows 1/1 |
| occurrence_links_present | passed | occurrence links 12 |
| occurrence_links_complete | passed | source/work/context/license/version 12/12/12/12/12 |
| route_ids_only_resolved | passed | route IDs 1; unresolved 0; payload hits 0 |
| ambiguous_rows_audit_only | passed | audit-only ambiguous rows 2064; reader-facing rows 0 |
| route_concentration_warning_preserved | passed | route concentration warning visible 1 |
| forbidden_authority_fields_absent | passed | forbidden authority field hits 0 |

## Seeds

| seed | token | usage rows | selected rows | occurrence links | source refs | works | route IDs | next action |
|---|---|---:|---:|---:|---:|---:|---:|---|
| definition-workbench-usage-seed-001 | ראשית | 2390 | 49 | 12 | 38 | 20 | 1 | include_token_in_next_definition_workbench_sample_join_smoke |

## Boundary

Usage-only seed queue for Definition Workbench planning. Rows identify occurrence-linked usage tokens that are absent from the current sample and should be considered for the next sample join. Rows are not answer authority, semantic verdicts, publication support, translation text, or UI ranking input.

Rows are seed candidates for the next Definition Workbench sample-join smoke only. They remain observed usage links and route-ID references, not answer authority or semantic verdicts.

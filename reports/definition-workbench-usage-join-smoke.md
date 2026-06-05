# Definition Workbench Usage Join Smoke

Generated: 2026-06-01T17:25:43.680Z

## Summary

- Current sample rows checked: 200
- Rows using forbidden verified labels: 0
- Seed rows checked / join rows: 1/1
- Seeds absent from current sample / already present: 1/0
- Projected rows after bounded seed append: 201
- Projected usage-link rows: 2390
- Selected occurrence links: 12
- Occurrence links with source/work/context/license/version/route IDs: 12/12/12/12/12/12
- Route IDs: 1
- Audit-only ambiguous rows carried: 2064
- Reader-facing rows: 0
- Forbidden authority field hits: 0

## Checks

| check | status | detail |
|---|---|---|
| sample_rows_present | passed | sample rows checked 200 |
| sample_review_status_not_verified | passed | forbidden verified labels 0 |
| seed_rows_present | passed | seed rows checked 1 |
| join_rows_present | passed | join rows 1 |
| seed_absence_visible | passed | absent seeds 1; already present 0 |
| projected_sample_append_bounded | passed | projected rows 201 |
| occurrence_links_complete | passed | source/work/context/license/version 12/12/12/12/12 |
| route_ids_only | passed | route IDs 1; payload hits 0 |
| ambiguous_rows_audit_only | passed | audit-only ambiguous rows 2064; reader-facing rows 0 |
| route_concentration_warning_preserved | passed | route concentration warning visible 1 |
| forbidden_authority_fields_absent | passed | forbidden authority field hits 0 |

## Join Rows

| join | seed | token | status | projected usage links | occurrence links | source refs | works | route IDs |
|---|---|---|---|---:|---:|---:|---:|---:|
| definition-workbench-usage-join-smoke-001 | definition-workbench-usage-seed-001 | ראשית | seed_absent_from_current_sample | 2390 | 12 | 38 | 20 | 1 |

## Boundary

Tiny Agent 3 smoke artifact proving selected usage seeds can be joined to Definition Workbench planning by token key or normalized form without modifying the live sample, copying route payloads, ranking answers, or creating definition authority.

The live Definition Workbench sample is not rewritten by this artifact. The smoke only proves a bounded usage-navigation join path for the seed queue.

Definition sample boundary status: blocked_no_render
Definition sample clears publication readiness: false
Definition sample reviewed lexical authority: false
Definition sample publication claim: false

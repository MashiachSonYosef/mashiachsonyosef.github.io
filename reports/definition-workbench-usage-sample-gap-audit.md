# Definition Workbench Usage Sample Gap Audit

Generated: 2026-06-01T18:32:52.141Z

## Summary

- Status: pass_with_warnings
- Gap rows: 1
- Current sample usage links: 0/200
- Usage tokens in / not in current sample: 0/1
- Selected occurrence links with source/work/context/license/version/route IDs: 12/12/12/12/12/12
- Route IDs / unresolved: 1/0
- Audit-only ambiguous rows: 2064
- Route concentration warning visible: 1
- Reader-facing / route-payload / forbidden-authority hits: 0/0/0

## Gap Rows

| gap | token | sample status | usage rows | selected rows | occurrence links | source refs | works | route IDs | next action |
|---|---|---|---:|---:|---:|---:|---:|---:|---|
| definition-workbench-usage-gap-001 | ראשית | absent_from_current_definition_workbench_sample | 2390 | 49 | 12 | 38 | 20 | 1 | include_token_in_next_definition_workbench_sample_join_smoke |

## Checks

| check | status | detail |
|---|---|---|
| sample_rows_present | passed | sample rows 200 |
| gap_rows_present | passed | gap rows 1 |
| gap_rows_absent_from_sample | passed | absent rows 1/1 |
| sample_overlap_gap_visible | warning | sample usage links 0; usage tokens not in sample 1 |
| seed_queue_alignment | passed | seed/gap/absent 1/1/1 |
| occurrence_links_complete | passed | links/source/work/context/license/version/route 12/12/12/12/12/12/12 |
| route_ids_only_resolved | passed | route IDs 1; unresolved 0; payload hits 0 |
| ambiguous_rows_audit_only | passed | audit-only ambiguous rows 2064; reader-facing 0 |
| route_concentration_warning_preserved | passed | route concentration warning 1 |
| usage_boundary_only | passed | reader-facing 0; forbidden 0 |

## Boundary

Bounded Agent 3 sample-gap audit for Definition Workbench planning. It exposes whether the current machine sample overlaps selected usage occurrence links and preserves source/license/context route-ID-only evidence for absent usage tokens. It is usage navigation only, not answer authority, semantic arbitration, UI acceptance, publication support, or accepted text.

A warning here is intentional when the current Definition Workbench sample has zero selected usage overlap. The packet is a planning/audit signal only and must not be used as a visible answer, route rank, semantic verdict, or publication support.

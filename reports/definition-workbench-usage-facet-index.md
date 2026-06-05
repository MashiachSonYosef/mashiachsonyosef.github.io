# Definition Workbench Usage Facet Index

Generated: 2026-06-01T17:44:45.028Z

## Summary

- Status: pass_with_warnings
- Occurrence rows: 49
- Facet groups / total facets: 10/75
- Route IDs / max route share: 1/10000/10000
- Route concentration warning: true
- Metadata complete rows: source 49, work 49, context 49, focus 49, license 49, version 49
- Reader-facing / route-payload / forbidden-authority hits: 0/0/0

## Facets

| facet group | facets |
|---|---:|
| route_id | 1 |
| token_key | 1 |
| focus_normalized | 1 |
| cluster_id | 2 |
| usage_frame | 2 |
| status | 3 |
| work | 20 |
| source_ref | 38 |
| provenance | 5 |
| license | 2 |

## Route Concentration

- All selected rows same route: true
- Warning label: selected usage rows are route-linked observed usage only and are not independent semantic route diversity

## Checks

| check | status | detail |
|---|---|---|
| occurrence_rows_present | passed | rows 49 |
| facet_groups_present | passed | groups/facets 10/75 |
| metadata_complete | passed | rows/source/work/context/focus/license/version/routes 49/49/49/49/49/49/49/49 |
| route_concentration_marked | warning | route IDs 1; max share 10000/10000; warning 1 |
| usage_boundary_only | passed | reader-facing 0; route-payload 0; forbidden 0; unresolved 0 |

## Boundary

This facet index is selected-scope usage navigation only. It supports lookup/filter/navigation over occurrence links and does not rank routes, select visible answers, copy route payloads, arbitrate definitions, make publication claims, or provide accepted translation text.

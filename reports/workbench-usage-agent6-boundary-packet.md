# Workbench Usage Agent 6 Boundary Packet

Generated: 2026-05-31T23:26:36.958Z

## Summary

- Selected occurrence rows: 49
- Rows with source links: 49
- Rows with work anchors: 49
- Rows with marked context: 49
- Rows with route IDs: 49
- Rows with license metadata: 49/49
- Route links resolved/unresolved: 2390/0
- Route payload field hits: 0
- Forbidden field hits: 0
- Audit-only rows: ambiguous 2064, blocked 0, reader-facing no
- Smoke validation: steps 35, failed 0

## Policy

This packet verifies selected usage rows are source links, work anchors, marked context, provenance, and Agent 2 route IDs only. It carries no route ranking or visible-answer authority.

## Checks

| check | status | detail |
|---|---|---|
| selected_occurrences_present | passed | selected rows 49 |
| source_links_present | passed | rows with source links 49/49 |
| work_anchors_present | passed | rows with work anchors 49/49 |
| context_present | passed | rows with marked context 49/49 |
| provenance_present | passed | rows with license metadata 49/49 |
| route_ids_only | passed | route payload field hits 0 |
| route_ids_resolve | passed | resolved 2390; unresolved 0 |
| ambiguous_rows_audit_only | passed | audit rows 2064; selected audit-status rows 0 |
| handoff_not_authoritative | passed | handoff does not rank routes or select visible results |
| smoke_passed | passed | smoke steps 35; failed 0 |
| no_forbidden_fields | passed | forbidden field hits 0 |

## Route Boundary

- Route IDs resolve: yes
- Unique route IDs: 1
- Route sources: data/definitions/hud-route-store-sample.json (2390)

## Audit Boundary

- Ambiguous rows reader-facing: no
- Selected rows with audit-only status: 0

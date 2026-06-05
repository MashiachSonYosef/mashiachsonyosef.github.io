# Definition Workbench Usage Route Pointer Audit

Generated: 2026-06-02T02:43:37.055Z

## Boundary

Agent 3 route-pointer audit for Definition Workbench usage navigation. It proves usage/support/navigation rows carry Agent 2 route IDs and resolver artifact paths only; it does not copy Agent 2 route payloads, route metadata, definitions, translations, ranking, visible answers, or publication claims.

This packet is route-pointer-only. It intentionally carries route IDs and resolver paths, not Agent 2 route payloads, route metadata, definitions, translations, ranking decisions, visible answer selection, or publication claims.

## Counts

- Route pointer rows / route IDs / resolved / unresolved: 1/1/1/0
- Occurrence route rows linked: 49/49
- Support rows linked / resolved: 49/49/49
- Navigation rows linked / selected: 2390/49/2390
- Planning rows linked: 1/1
- Selected refs / works / frames: 38/20/2
- Concordance refs / works / categories: 1673/271/15
- Support supported / candidate / weak: 11/26/12
- Ambiguous audit-only available / emitted: 2064/0
- Copied route / Agent 2 / metadata rows: 0/0/0
- Reader-facing / route-payload / forbidden-authority / metadata-field hits: 0/0/0/0

## Route Pointers

| route_id | source | resolution | occurrence rows | support rows | navigation rows | planning rows | consumer action |
|---|---|---|---:|---:|---:|---:|---|
| def-kaikki-lemma-e4f94cd5131316a8 | data/definitions/hud-route-store-sample.json | resolved | 49 | 49 | 2390 | 1 | resolve_agent2_route_payloads_outside_agent3 |

## Checks

| check | status | detail |
|---|---|---|
| route_pointers_present | passed | pointers/routes 1/1 |
| single_route_scope_visible | warning | route pointers 1 |
| route_ids_resolved | passed | resolved/unresolved 1/0 |
| route_sources_exist | passed | source paths 1/1 |
| occurrence_rows_linked | passed | 49/49 |
| support_rows_linked | passed | support 49/49; resolved 49 |
| navigation_rows_linked | passed | 2390/2390 |
| planning_rows_linked | passed | 1/1 |
| selected_context_visible | passed | selected refs/works/frames 38/20/2; concordance refs/works 1673/271 |
| status_counts_cover_support | passed | support status 11/26/12; rows 49 |
| ambiguous_rows_audit_only | passed | ambiguous 2064/0 |
| route_payloads_not_copied | passed | copied route/agent2/metadata rows 0/0/0; metadata fields 0 |
| usage_only_boundary | passed | semantic/answer/rank/visible/reader 0/0/0/0/0 |
| forbidden_authority_absent | passed | route payload/forbidden 0/0 |
| no_queue_mutation | passed | 0/0 |

This is an Agent 3 pointer audit only. Downstream consumers must resolve any Agent 2 route payload outside Agent 3 artifacts and preserve observed-usage-only labels.

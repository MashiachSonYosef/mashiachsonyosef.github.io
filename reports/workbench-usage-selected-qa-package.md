# Workbench Usage Selected QA Package

Generated: 2026-06-01T03:23:53.163Z

## Summary

- Package items: 9
- Selected rows: 49
- Source refs: 38
- Works: 20
- Route IDs: 1
- Selected route links: 49
- Unresolved route IDs: 0
- Route concentration warning visible: 1
- Rows with recurring signatures: 21
- Rows with cross-cluster signatures: 9
- Crossmatch directed edges: 2352
- Crossmatch same-frame edges: 1192
- Crossmatch bridge edges: 1160
- Crossmatch neighborhoods: 49
- Mojibake rows: 0
- Reader-facing rows: 0
- Route payload-like field hits: 0
- Failed checks: 0

## Policy

This package indexes selected usage-navigation artifacts for QA. It carries counts, validation state, links to reports, and artifact paths only; it does not rank routes, select visible answers, translate, or make meaning claims.

## Checks

| check | status | detail |
|---|---|---|
| package_items_present | passed | package items 9 |
| selected_rows_consistent | passed | selected rows 49 |
| selected_route_links_complete | passed | selected route links 49; selected rows 49 |
| route_ids_resolved | passed | unresolved route IDs 0 |
| route_concentration_warning_visible | warning | route concentration warning visible 1 |
| crossmatch_partition_visible | passed | same-frame 1192; bridge 1160; directed 2352 |
| crossmatch_neighborhoods_complete | passed | neighborhoods 49; selected rows 49 |
| mojibake_absent | passed | mojibake rows 0 |
| reader_facing_zero | passed | reader-facing rows 0 |
| route_payload_absent | passed | route payload-like field hits 0 |
| package_failed_checks_zero | passed | failed checks 0 |

## Package Items

| item | artifact type | artifact | report | quality | warnings | failed | reader-facing | route payload hits | summary |
|---|---|---|---|---|---:|---:|---:|---:|---|
| selected_occurrence_cards | workbench_usage_selected_occurrence_cards | .local-cache/workbench-evidence/usage-selected-occurrence-cards.json | reports/workbench-usage-selected-occurrence-cards.md | pass_with_warnings | 1 | 0 | 0 | 0 | rows: 49<br>source_refs: 38<br>works: 20<br>route_ids: 1<br>mojibake_rows: 0 |
| selected_source_diversity | workbench_usage_selected_source_diversity | .local-cache/workbench-evidence/usage-selected-source-diversity.json | reports/workbench-usage-selected-source-diversity.md | passed | 0 | 0 | 0 | 0 | rows: 49<br>source_refs: 38<br>works: 20<br>licenses: 2 |
| selected_signature_independence | workbench_usage_selected_signature_independence | .local-cache/workbench-evidence/usage-selected-signature-independence.json | reports/workbench-usage-selected-signature-independence.md | passed | 0 | 0 | 0 | 0 | rows: 49<br>rows_with_recurring: 21<br>rows_with_cross_cluster: 9 |
| selected_route_concentration_response | workbench_usage_selected_route_concentration_response | .local-cache/workbench-evidence/usage-selected-route-concentration-response.json | reports/workbench-usage-selected-route-concentration-response.md | pass_with_warnings | 1 | 0 | 0 | 0 | rows: 49<br>route_buckets: 1<br>warning_visible: 1 |
| selected_route_resolution | workbench_usage_selected_route_resolution | .local-cache/workbench-evidence/usage-selected-route-resolution.json | reports/workbench-usage-selected-route-resolution.md | passed | 0 | 0 | 0 | 0 | selected_route_links: 49<br>route_buckets: 1<br>unresolved_route_ids: 0 |
| selected_occurrence_lookup | workbench_usage_navigation_selected_occurrence_lookup | .local-cache/workbench-evidence/usage-selected-occurrence-lookup.json | reports/workbench-usage-selected-occurrence-lookup.md | not_applicable | 0 | 0 | 0 | 0 | rows: 49<br>work_buckets: 20<br>cluster_buckets: 2<br>status_buckets: 3 |
| crossmatch_links | workbench_usage_navigation_crossmatch_links | .local-cache/workbench-evidence/usage-crossmatch-links.json | reports/workbench-usage-crossmatch-links.md | passed | 0 | 0 | 0 | 0 | occurrence_refs: 49<br>directed_edges: 2352<br>undirected_pairs: 1176 |
| crossmatch_bridge_index | workbench_usage_navigation_crossmatch_bridge_index | .local-cache/workbench-evidence/usage-crossmatch-bridge-index.json | reports/workbench-usage-crossmatch-bridge-index.md | passed | 0 | 0 | 0 | 0 | same_frame_edges: 1192<br>bridge_edges: 1160<br>bridge_buckets: 2 |
| crossmatch_neighborhoods | workbench_usage_navigation_crossmatch_neighborhoods | .local-cache/workbench-evidence/usage-crossmatch-neighborhoods.json | reports/workbench-usage-crossmatch-neighborhoods.md | passed | 0 | 0 | 0 | 0 | neighborhoods: 49<br>same_frame_neighbor_links: 1192<br>bridge_neighbor_links: 1160 |

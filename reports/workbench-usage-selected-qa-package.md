# Workbench Usage Selected QA Package

Generated: 2026-06-01T06:01:02.776Z

## Summary

- Package items: 13
- Selected rows: 49
- Source refs: 38
- Works: 20
- Collision buckets: 16
- Collision occurrence rows: 38
- Duplicate source-ref buckets: 8
- Duplicate source-ref rows: 19
- Duplicate work-anchor buckets: 8
- Duplicate work-anchor rows: 19
- Cross-frame collision buckets: 4
- Cross-frame collision rows: 14
- Route IDs: 1
- Selected route links: 49
- Unresolved route IDs: 0
- Focus context audit rows: 49
- Focus marker rows: 49
- Focus marker mismatch rows: 0
- Repeated-focus context rows: 8
- Missing Hebrew context rows: 0
- Frame summary frames: 2
- Frame summary rows: 49
- Frame summary repeated-focus rows: 8
- Frame summary samples: 16
- Work/frame matrix rows: 25
- Work/frame matrix selected rows: 49
- Work/frame matrix works: 20
- Work/frame matrix frames: 2
- Work/frame matrix samples: 48
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
| package_items_present | passed | package items 13 |
| selected_rows_consistent | passed | selected rows 49 |
| selected_collision_counts_match | passed | collision source buckets 8; work anchor buckets 8 |
| selected_cross_frame_collisions_visible | passed | cross-frame collision buckets 4 |
| selected_route_links_complete | passed | selected route links 49; selected rows 49 |
| route_ids_resolved | passed | unresolved route IDs 0 |
| selected_focus_context_complete | passed | focus context rows 49; selected rows 49 |
| selected_focus_markers_complete | passed | focus marker rows 49; selected rows 49 |
| selected_focus_marker_mismatch_zero | passed | focus marker mismatches 0 |
| selected_missing_hebrew_context_zero | passed | missing Hebrew context rows 0 |
| selected_frame_summary_complete | passed | frame summary rows 49; selected rows 49 |
| selected_frame_summary_has_frames | passed | frame summary frames 2 |
| selected_frame_summary_repeated_focus_matches | passed | frame repeated-focus 8; focus audit repeated-focus 8 |
| selected_work_frame_matrix_complete | passed | work/frame selected rows 49; selected rows 49 |
| selected_work_frame_matrix_has_buckets | passed | work/frame matrix rows 25 |
| selected_work_frame_matrix_frame_coverage | passed | work/frame frames 2; frame summary frames 2 |
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
| selected_collision_audit | workbench_usage_selected_collision_audit | .local-cache/workbench-evidence/usage-selected-collision-audit.json | reports/workbench-usage-selected-collision-audit.md | pass_with_warnings | 1 | 0 | 0 | 0 | collision_buckets: 16<br>collision_occurrence_rows: 38<br>duplicate_source_ref_buckets: 8<br>duplicate_work_anchor_buckets: 8<br>cross_frame_collision_buckets: 4 |
| selected_signature_independence | workbench_usage_selected_signature_independence | .local-cache/workbench-evidence/usage-selected-signature-independence.json | reports/workbench-usage-selected-signature-independence.md | passed | 0 | 0 | 0 | 0 | rows: 49<br>rows_with_recurring: 21<br>rows_with_cross_cluster: 9 |
| selected_route_concentration_response | workbench_usage_selected_route_concentration_response | .local-cache/workbench-evidence/usage-selected-route-concentration-response.json | reports/workbench-usage-selected-route-concentration-response.md | pass_with_warnings | 1 | 0 | 0 | 0 | rows: 49<br>route_buckets: 1<br>warning_visible: 1 |
| selected_route_resolution | workbench_usage_selected_route_resolution | .local-cache/workbench-evidence/usage-selected-route-resolution.json | reports/workbench-usage-selected-route-resolution.md | passed | 0 | 0 | 0 | 0 | selected_route_links: 49<br>route_buckets: 1<br>unresolved_route_ids: 0 |
| selected_focus_context_audit | workbench_usage_selected_focus_context_audit | .local-cache/workbench-evidence/usage-selected-focus-context-audit.json | reports/workbench-usage-selected-focus-context-audit.md | pass_with_warnings | 1 | 0 | 0 | 0 | rows: 49<br>focus_marker_rows: 49<br>focus_marker_mismatch_rows: 0<br>repeated_focus_context_rows: 8<br>missing_hebrew_context_rows: 0 |
| selected_frame_summary | workbench_usage_selected_frame_summary | .local-cache/workbench-evidence/usage-selected-frame-summary.json | reports/workbench-usage-selected-frame-summary.md | passed | 0 | 0 | 0 | 0 | frames: 2<br>selected_rows: 49<br>repeated_focus_context_rows: 8<br>sample_occurrences: 16 |
| selected_work_frame_matrix | workbench_usage_selected_work_frame_matrix | .local-cache/workbench-evidence/usage-selected-work-frame-matrix.json | reports/workbench-usage-selected-work-frame-matrix.md | passed | 0 | 0 | 0 | 0 | matrix_rows: 25<br>selected_rows: 49<br>works: 20<br>frames: 2<br>sample_occurrences: 48 |
| selected_occurrence_lookup | workbench_usage_navigation_selected_occurrence_lookup | .local-cache/workbench-evidence/usage-selected-occurrence-lookup.json | reports/workbench-usage-selected-occurrence-lookup.md | not_applicable | 0 | 0 | 0 | 0 | rows: 49<br>work_buckets: 20<br>cluster_buckets: 2<br>status_buckets: 3 |
| crossmatch_links | workbench_usage_navigation_crossmatch_links | .local-cache/workbench-evidence/usage-crossmatch-links.json | reports/workbench-usage-crossmatch-links.md | passed | 0 | 0 | 0 | 0 | occurrence_refs: 49<br>directed_edges: 2352<br>undirected_pairs: 1176 |
| crossmatch_bridge_index | workbench_usage_navigation_crossmatch_bridge_index | .local-cache/workbench-evidence/usage-crossmatch-bridge-index.json | reports/workbench-usage-crossmatch-bridge-index.md | passed | 0 | 0 | 0 | 0 | same_frame_edges: 1192<br>bridge_edges: 1160<br>bridge_buckets: 2 |
| crossmatch_neighborhoods | workbench_usage_navigation_crossmatch_neighborhoods | .local-cache/workbench-evidence/usage-crossmatch-neighborhoods.json | reports/workbench-usage-crossmatch-neighborhoods.md | passed | 0 | 0 | 0 | 0 | neighborhoods: 49<br>same_frame_neighbor_links: 1192<br>bridge_neighbor_links: 1160 |

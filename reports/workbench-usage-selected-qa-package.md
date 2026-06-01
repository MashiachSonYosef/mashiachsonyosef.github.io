# Workbench Usage Selected QA Package

Generated: 2026-06-01T08:09:03.626Z

## Summary

- Package items: 20
- Selected rows: 49
- Source refs: 38
- Works: 20
- Provenance buckets: 5
- Provenance rows: 49
- Provenance licenses: 2
- Provenance version sources: 4
- Provenance rows with license metadata: 49
- Provenance rows with version metadata: 49
- Provenance missing or unrecognized license rows: 0
- Provenance samples: 49
- Frame/provenance matrix rows: 10
- Frame/provenance selected rows: 49
- Frame/provenance frames: 2
- Frame/provenance provenance buckets: 5
- Frame/provenance missing provenance rows: 0
- Frame/provenance samples: 49
- Collision buckets: 16
- Collision occurrence rows: 38
- Duplicate source-ref buckets: 8
- Duplicate source-ref rows: 19
- Duplicate work-anchor buckets: 8
- Duplicate work-anchor rows: 19
- Cross-frame collision buckets: 4
- Cross-frame collision rows: 14
- Collision/provenance buckets: 16
- Collision/provenance occurrence rows: 38
- Collision/provenance provenance buckets: 4
- Collision/frame-provenance buckets: 7
- Collision/provenance missing rows: 0
- Collision/provenance missing frame rows: 0
- Collision/provenance samples: 38
- Route IDs: 1
- Selected route links: 49
- Unresolved route IDs: 0
- Route/provenance rows: 1
- Route/provenance links: 49
- Route/provenance buckets: 5
- Route/provenance unresolved route rows: 0
- Route/provenance missing provenance rows: 0
- Route/provenance payload copied rows: 0
- Route/provenance samples: 49
- Occurrence navigation rows: 49
- Occurrence navigation source refs: 38
- Occurrence navigation work anchors: 38
- Occurrence navigation works: 20
- Occurrence navigation frames: 2
- Occurrence navigation route IDs: 1
- Occurrence navigation provenance buckets: 5
- Occurrence navigation rows with source link: 49
- Occurrence navigation rows with work anchor: 49
- Occurrence navigation rows with Hebrew context: 49
- Occurrence navigation rows with focus marker: 49
- Occurrence navigation rows with provenance: 49
- Occurrence navigation collision-member rows: 19
- Occurrence navigation collision memberships: 38
- Navigation edge rows: 2352
- Navigation edge source occurrences: 49
- Navigation edge target occurrences: 49
- Navigation edge source refs: 38
- Navigation edge works: 20
- Navigation edge frames: 2
- Navigation edge route IDs: 1
- Navigation edge provenance buckets: 5
- Navigation edge same-frame edges: 1192
- Navigation edge bridge edges: 1160
- Navigation edge source context rows: 2352
- Navigation edge target context rows: 2352
- Navigation edge source link rows: 2352
- Navigation edge target link rows: 2352
- Navigation edge source provenance rows: 2352
- Navigation edge target provenance rows: 2352
- Occurrence adjacency rows: 49
- Occurrence adjacency target links: 2352
- Occurrence adjacency source refs: 38
- Occurrence adjacency works: 20
- Occurrence adjacency frames: 2
- Occurrence adjacency route IDs: 1
- Occurrence adjacency provenance buckets: 5
- Occurrence adjacency same-frame links: 1192
- Occurrence adjacency bridge-frame links: 1160
- Occurrence adjacency strong/moderate/weak links: 1206/1146/0
- Occurrence adjacency source context/link/provenance rows: 49/49/49
- Occurrence adjacency target context/link/provenance links: 2352/2352/2352
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
| package_items_present | passed | package items 20 |
| selected_rows_consistent | passed | selected rows 49 |
| selected_provenance_rows_complete | passed | provenance rows 49; selected rows 49 |
| selected_provenance_license_metadata_complete | passed | license metadata rows 49; selected rows 49 |
| selected_provenance_version_metadata_complete | passed | version metadata rows 49; selected rows 49 |
| selected_provenance_missing_license_zero | passed | missing or unrecognized license rows 0 |
| selected_provenance_samples_complete | passed | provenance samples 49; selected rows 49 |
| selected_frame_provenance_rows_complete | passed | frame/provenance rows 49; selected rows 49 |
| selected_frame_provenance_frame_coverage | passed | frame/provenance frames 2; frame summary frames 2 |
| selected_frame_provenance_bucket_coverage | passed | frame/provenance buckets 5; provenance buckets 5 |
| selected_frame_provenance_present | passed | missing frame/provenance rows 0 |
| selected_frame_provenance_samples_complete | passed | frame/provenance samples 49; selected rows 49 |
| selected_collision_counts_match | passed | collision source buckets 8; work anchor buckets 8 |
| selected_cross_frame_collisions_visible | passed | cross-frame collision buckets 4 |
| selected_collision_provenance_counts_match | passed | collision/provenance 16/38; collision audit 16/38 |
| selected_collision_provenance_present | passed | missing provenance 0; missing frame/provenance 0 |
| selected_collision_provenance_samples_complete | passed | collision/provenance samples 38; collision rows 38 |
| selected_route_links_complete | passed | selected route links 49; selected rows 49 |
| route_ids_resolved | passed | unresolved route IDs 0 |
| selected_route_provenance_links_complete | passed | route/provenance links 49; selected route links 49 |
| selected_route_provenance_rows_match_routes | passed | route/provenance rows 1; route IDs 1 |
| selected_route_provenance_buckets_match | passed | route/provenance buckets 5; provenance buckets 5 |
| selected_route_provenance_resolved | passed | unresolved route/provenance rows 0 |
| selected_route_provenance_present | passed | missing provenance rows 0 |
| selected_route_provenance_payload_not_copied | passed | payload copied rows 0 |
| selected_route_provenance_samples_complete | passed | route/provenance samples 49; selected route links 49 |
| selected_occurrence_navigation_rows_complete | passed | navigation rows 49; selected rows 49 |
| selected_occurrence_navigation_links_complete | passed | source links 49; work anchors 49; selected rows 49 |
| selected_occurrence_navigation_context_complete | passed | Hebrew context 49; focus markers 49; selected rows 49 |
| selected_occurrence_navigation_provenance_complete | passed | navigation provenance rows 49; selected rows 49 |
| selected_occurrence_navigation_collision_memberships_visible | passed | navigation collision memberships 38; collision rows 38 |
| selected_navigation_edge_rows_complete | passed | edge rows 2352; directed edges 2352 |
| selected_navigation_edge_occurrence_coverage | passed | source occurrences 49; target occurrences 49; selected rows 49 |
| selected_navigation_edge_partition_complete | passed | same-frame 1192; bridge 1160; edges 2352 |
| selected_navigation_edge_context_complete | passed | source context 2352; target context 2352; edges 2352 |
| selected_navigation_edge_links_complete | passed | source links 2352; target links 2352; edges 2352 |
| selected_navigation_edge_provenance_complete | passed | source provenance 2352; target provenance 2352; edges 2352 |
| selected_occurrence_adjacency_rows_complete | passed | adjacency rows 49; selected rows 49 |
| selected_occurrence_adjacency_target_links_complete | passed | adjacency target links 2352; edge rows 2352 |
| selected_occurrence_adjacency_partition_complete | passed | same-frame 1192; bridge 1160; target links 2352 |
| selected_occurrence_adjacency_strength_partition_complete | passed | strong 1206; moderate 1146; weak 0; target links 2352 |
| selected_occurrence_adjacency_source_complete | passed | source context/link/provenance 49/49/49; selected rows 49 |
| selected_occurrence_adjacency_targets_complete | passed | complete rows 49; target context/link/provenance 2352/2352/2352; target links 2352 |
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
| selected_provenance_matrix | workbench_usage_selected_provenance_matrix | .local-cache/workbench-evidence/usage-selected-provenance-matrix.json | reports/workbench-usage-selected-provenance-matrix.md | passed | 0 | 0 | 0 | 0 | provenance_buckets: 5<br>rows: 49<br>licenses: 2<br>version_sources: 4<br>rows_with_license_metadata: 49<br>rows_with_version_metadata: 49<br>missing_or_unrecognized_license_rows: 0<br>samples: 49 |
| selected_frame_provenance_matrix | workbench_usage_selected_frame_provenance_matrix | .local-cache/workbench-evidence/usage-selected-frame-provenance-matrix.json | reports/workbench-usage-selected-frame-provenance-matrix.md | passed | 0 | 0 | 0 | 0 | matrix_rows: 10<br>selected_rows: 49<br>frames: 2<br>provenance_buckets: 5<br>missing_provenance_rows: 0<br>samples: 49 |
| selected_collision_audit | workbench_usage_selected_collision_audit | .local-cache/workbench-evidence/usage-selected-collision-audit.json | reports/workbench-usage-selected-collision-audit.md | pass_with_warnings | 1 | 0 | 0 | 0 | collision_buckets: 16<br>collision_occurrence_rows: 38<br>duplicate_source_ref_buckets: 8<br>duplicate_work_anchor_buckets: 8<br>cross_frame_collision_buckets: 4 |
| selected_collision_provenance_audit | workbench_usage_selected_collision_provenance_audit | .local-cache/workbench-evidence/usage-selected-collision-provenance-audit.json | reports/workbench-usage-selected-collision-provenance-audit.md | pass_with_warnings | 1 | 0 | 0 | 0 | collision_buckets: 16<br>collision_occurrence_rows: 38<br>provenance_buckets: 4<br>frame_provenance_buckets: 7<br>missing_provenance_rows: 0<br>missing_frame_provenance_rows: 0<br>samples: 38 |
| selected_signature_independence | workbench_usage_selected_signature_independence | .local-cache/workbench-evidence/usage-selected-signature-independence.json | reports/workbench-usage-selected-signature-independence.md | passed | 0 | 0 | 0 | 0 | rows: 49<br>rows_with_recurring: 21<br>rows_with_cross_cluster: 9 |
| selected_route_concentration_response | workbench_usage_selected_route_concentration_response | .local-cache/workbench-evidence/usage-selected-route-concentration-response.json | reports/workbench-usage-selected-route-concentration-response.md | pass_with_warnings | 1 | 0 | 0 | 0 | rows: 49<br>route_buckets: 1<br>warning_visible: 1 |
| selected_route_resolution | workbench_usage_selected_route_resolution | .local-cache/workbench-evidence/usage-selected-route-resolution.json | reports/workbench-usage-selected-route-resolution.md | passed | 0 | 0 | 0 | 0 | selected_route_links: 49<br>route_buckets: 1<br>unresolved_route_ids: 0 |
| selected_route_provenance_audit | workbench_usage_selected_route_provenance_audit | .local-cache/workbench-evidence/usage-selected-route-provenance-audit.json | reports/workbench-usage-selected-route-provenance-audit.md | passed | 0 | 0 | 0 | 0 | route_rows: 1<br>selected_route_links: 49<br>provenance_buckets: 5<br>unresolved_route_rows: 0<br>missing_provenance_rows: 0<br>route_payload_copied_rows: 0<br>samples: 49 |
| selected_occurrence_navigation_index | workbench_usage_selected_occurrence_navigation_index | .local-cache/workbench-evidence/usage-selected-occurrence-navigation-index.json | reports/workbench-usage-selected-occurrence-navigation-index.md | passed | 0 | 0 | 0 | 0 | rows: 49<br>source_refs: 38<br>works: 20<br>usage_frames: 2<br>provenance_buckets: 5<br>collision_member_rows: 19<br>collision_memberships: 38 |
| selected_navigation_edge_index | workbench_usage_selected_navigation_edge_index | .local-cache/workbench-evidence/usage-selected-navigation-edge-index.json | reports/workbench-usage-selected-navigation-edge-index.md | passed | 0 | 0 | 0 | 0 | edges: 2352<br>source_occurrences: 49<br>target_occurrences: 49<br>same_frame_edges: 1192<br>bridge_edges: 1160<br>source_context_rows: 2352<br>target_context_rows: 2352 |
| selected_occurrence_adjacency_index | workbench_usage_selected_occurrence_adjacency_index | .local-cache/workbench-evidence/usage-selected-occurrence-adjacency-index.json | reports/workbench-usage-selected-occurrence-adjacency-index.md | passed | 0 | 0 | 0 | 0 | rows: 49<br>target_links: 2352<br>source_refs: 38<br>works: 20<br>same_frame_links: 1192<br>bridge_frame_links: 1160<br>complete_targets: 49 |
| selected_focus_context_audit | workbench_usage_selected_focus_context_audit | .local-cache/workbench-evidence/usage-selected-focus-context-audit.json | reports/workbench-usage-selected-focus-context-audit.md | pass_with_warnings | 1 | 0 | 0 | 0 | rows: 49<br>focus_marker_rows: 49<br>focus_marker_mismatch_rows: 0<br>repeated_focus_context_rows: 8<br>missing_hebrew_context_rows: 0 |
| selected_frame_summary | workbench_usage_selected_frame_summary | .local-cache/workbench-evidence/usage-selected-frame-summary.json | reports/workbench-usage-selected-frame-summary.md | passed | 0 | 0 | 0 | 0 | frames: 2<br>selected_rows: 49<br>repeated_focus_context_rows: 8<br>sample_occurrences: 16 |
| selected_work_frame_matrix | workbench_usage_selected_work_frame_matrix | .local-cache/workbench-evidence/usage-selected-work-frame-matrix.json | reports/workbench-usage-selected-work-frame-matrix.md | passed | 0 | 0 | 0 | 0 | matrix_rows: 25<br>selected_rows: 49<br>works: 20<br>frames: 2<br>sample_occurrences: 48 |
| selected_occurrence_lookup | workbench_usage_navigation_selected_occurrence_lookup | .local-cache/workbench-evidence/usage-selected-occurrence-lookup.json | reports/workbench-usage-selected-occurrence-lookup.md | not_applicable | 0 | 0 | 0 | 0 | rows: 49<br>work_buckets: 20<br>cluster_buckets: 2<br>status_buckets: 3 |
| crossmatch_links | workbench_usage_navigation_crossmatch_links | .local-cache/workbench-evidence/usage-crossmatch-links.json | reports/workbench-usage-crossmatch-links.md | passed | 0 | 0 | 0 | 0 | occurrence_refs: 49<br>directed_edges: 2352<br>undirected_pairs: 1176 |
| crossmatch_bridge_index | workbench_usage_navigation_crossmatch_bridge_index | .local-cache/workbench-evidence/usage-crossmatch-bridge-index.json | reports/workbench-usage-crossmatch-bridge-index.md | passed | 0 | 0 | 0 | 0 | same_frame_edges: 1192<br>bridge_edges: 1160<br>bridge_buckets: 2 |
| crossmatch_neighborhoods | workbench_usage_navigation_crossmatch_neighborhoods | .local-cache/workbench-evidence/usage-crossmatch-neighborhoods.json | reports/workbench-usage-crossmatch-neighborhoods.md | passed | 0 | 0 | 0 | 0 | neighborhoods: 49<br>same_frame_neighbor_links: 1192<br>bridge_neighbor_links: 1160 |

# Workbench Usage Navigation Handoff

Generated: 2026-06-01T00:58:45.177Z

## Summary

- Concordance rows: 2390
- Selected manifests: 55
- Reader-facing statuses: supported 339, candidate 1351, weak 700
- Audit-only rows: ambiguous 2064, blocked 0
- Route-linked rows: 2390
- Observed-only rows: 0
- Usage clusters: 2
- Unique route IDs: 1
- Sample rows: 30
- Lookup occurrence refs: 2390
- Lookup works: 271
- Work/frame matrix: rows 2390, works 271, categories 15, clusters 2
- Work/frame matrix route payload-like field hits: 0
- Search rows: rows 2390, works 271, categories 15, clusters 2
- Search rows route payload-like field hits: 0
- Search shard index: shards 74, rows 2390, categories 15, clusters 2, statuses 3
- Search shard index route payload-like field hits: 0
- Refresh priority: pending 80, known-use candidates 0, review-only 80, promoted 0
- Refresh priority blocked broad refresh files: 80
- Refresh priority route payload-like field hits: 0
- Unit density: units 1673, rows 2390, multi-occurrence units 418, max occurrences per unit 11, works 271
- Unit density route payload-like field hits: 0
- Selected slice rows: 49
- Selected slice works: 20
- Selected slices index: 2
- Selected slices index rows: 50
- Selected slices unique occurrences: 49
- Selected slices duplicate rows: 1
- Selected occurrence rows: 49
- Selected occurrence memberships: 50
- Selected occurrence duplicate memberships: 1
- Selected occurrence lookup buckets: works 20, clusters 2, statuses 3
- Crossmatch links: occurrences 49, directed edges 2352, undirected pairs 1176
- Crossmatch strengths: strong 1206, moderate 1146, weak 0
- Crossmatch route payload-like field hits: 0
- Crossmatch bridge edges: 1160, same-frame edges 1192, bridge buckets 2
- Crossmatch bridge route payload-like field hits: 0
- Crossmatch neighborhoods: 49, same-frame links 1192, bridge links 1160
- Crossmatch neighborhood route payload-like field hits: 0
- Agent 6 boundary checks: 11, failed 0
- Concentration packet: pass_with_warnings, warnings 1, failed 0
- Concentration buckets: routes 1, clusters 2
- Concentration route payload-like field hits: 0

## Validation

- Occurrence links: passed, bad source URLs 0, bad work anchors 0
- Route links: passed, resolved 2390, unresolved 0, metadata mismatches 0
- Audit review: rows 2064, reader-facing no
- Cluster index: present, rows 2390, clusters 2
- Route coverage: present, links 2390, unique route IDs 1
- Sample index: present, samples 30
- Lookup index: present, occurrence refs 2390
- Work/frame matrix: present, rows 2390, works 271, categories 15, failed 0
- Work/frame matrix route payload-like field hits: 0
- Search rows: present, rows 2390, works 271, categories 15, failed 0
- Search rows route payload-like field hits: 0
- Search shard index: present, shards 74, rows 2390, failed 0
- Search shard index route payload-like field hits: 0
- Refresh priority: present, pending 80, known-use candidates 0, promoted 0, failed 0
- Refresh priority route payload-like field hits: 0
- Unit density: present, units 1673, rows 2390, multi-occurrence units 418, failed 0
- Unit density route payload-like field hits: 0
- Selected slice: present, id tanakh-workbench-section, rows 49
- Selected slices index: present, slices 2, unique occurrences 49
- Selected occurrences: present, rows 49
- Selected occurrence lookup: present, work buckets 20
- Crossmatch links: present, occurrences 49, directed edges 2352, failed 0
- Crossmatch route payload-like field hits: 0
- Crossmatch bridge index: present, bridge edges 1160, bridge buckets 2, failed 0
- Crossmatch bridge route payload-like field hits: 0
- Crossmatch neighborhoods: present, neighborhoods 49, same-frame links 1192, bridge links 1160, failed 0
- Crossmatch neighborhood route payload-like field hits: 0
- Agent 6 boundary packet: present, checks 11, failed 0
- Concentration packet: present, quality pass_with_warnings, warnings 1, failed 0
- Concentration route payload-like field hits: 0
- Smoke validation: passed, steps 52, failed 0

## Artifacts

| artifact | path | tracked |
|---|---|---|
| concordance JSON | data/workbench-evidence/usage-concordance.json | no |
| concordance report | reports/workbench-usage-concordance.md | yes |
| manifest | data/workbench-evidence/usage-concordance-manifest.json | yes |
| occurrence link check | reports/workbench-usage-concordance-link-check.md | yes |
| route link check | reports/workbench-usage-route-link-check.md | yes |
| audit-only review | reports/workbench-usage-audit-only-review.md | yes |
| cluster index | reports/workbench-usage-cluster-index.md | yes |
| route coverage | reports/workbench-usage-route-coverage.md | yes |
| sample index | reports/workbench-usage-sample-index.md | yes |
| lookup index | reports/workbench-usage-lookup-index.md | yes |
| work/frame matrix | reports/workbench-usage-work-frame-matrix.md | yes |
| search rows | reports/workbench-usage-search-rows.md | yes |
| search shard index | reports/workbench-usage-search-shard-index.md | yes |
| refresh priority index | reports/workbench-usage-refresh-priority-index.md | yes |
| unit density index | reports/workbench-usage-unit-density-index.md | yes |
| selected slice | reports/workbench-usage-slice-tanakh.md | yes |
| selected slices index | reports/workbench-usage-selected-slices-index.md | yes |
| selected occurrences | reports/workbench-usage-selected-occurrences.md | yes |
| selected occurrence lookup | reports/workbench-usage-selected-occurrence-lookup.md | yes |
| crossmatch links | reports/workbench-usage-crossmatch-links.md | yes |
| crossmatch bridge index | reports/workbench-usage-crossmatch-bridge-index.md | yes |
| crossmatch neighborhoods | reports/workbench-usage-crossmatch-neighborhoods.md | yes |
| Agent 6 boundary packet | reports/workbench-usage-agent6-boundary-packet.md | yes |
| concentration packet | reports/workbench-usage-concentration-packet.md | yes |
| smoke validation | reports/workbench-smoke-pipeline-validation.md | yes |

## Commands

| command | value |
|---|---|
| regenerate | node scripts/build_workbench_usage_concordance.mjs --index=data/workbench-evidence/public-handoff-index.json --output=data/workbench-evidence/usage-concordance.json --report=reports/workbench-usage-concordance.md --manifest=data/workbench-evidence/usage-concordance-manifest.json |
| validate | node scripts/validate_workbench_usage_concordance.mjs data/workbench-evidence/usage-concordance.json --manifest=data/workbench-evidence/usage-concordance-manifest.json |
| validate_concordance | node scripts/validate_workbench_usage_concordance.mjs data/workbench-evidence/usage-concordance.json --manifest=data/workbench-evidence/usage-concordance-manifest.json |
| check_occurrence_links | node scripts/check_workbench_usage_concordance_links.mjs --concordance=data/workbench-evidence/usage-concordance.json --output=.local-cache/workbench-evidence/usage-concordance-link-check.json --report=reports/workbench-usage-concordance-link-check.md |
| check_route_links | node scripts/check_workbench_usage_route_links.mjs --concordance=data/workbench-evidence/usage-concordance.json --output=.local-cache/workbench-evidence/usage-route-link-check.json --report=reports/workbench-usage-route-link-check.md |
| build_audit_review | node scripts/build_workbench_usage_audit_review.mjs --index=data/workbench-evidence/public-handoff-index.json --output=.local-cache/workbench-evidence/usage-audit-only-review.json --report=reports/workbench-usage-audit-only-review.md --max-samples=80 |
| validate_smoke_pipeline | node scripts/validate_workbench_smoke_pipeline.mjs |
| build_cluster_index | node scripts/build_workbench_usage_cluster_index.mjs --concordance=data/workbench-evidence/usage-concordance.json --output=.local-cache/workbench-evidence/usage-cluster-index.json --report=reports/workbench-usage-cluster-index.md --max-samples=8 |
| validate_cluster_index | node scripts/validate_workbench_usage_cluster_index.mjs .local-cache/workbench-evidence/usage-cluster-index.json |
| build_route_coverage | node scripts/build_workbench_usage_route_coverage.mjs --concordance=data/workbench-evidence/usage-concordance.json --output=.local-cache/workbench-evidence/usage-route-coverage.json --report=reports/workbench-usage-route-coverage.md --max-samples=8 |
| validate_route_coverage | node scripts/validate_workbench_usage_route_coverage.mjs .local-cache/workbench-evidence/usage-route-coverage.json |
| build_sample_index | node scripts/build_workbench_usage_sample_index.mjs --concordance=data/workbench-evidence/usage-concordance.json --output=.local-cache/workbench-evidence/usage-sample-index.json --report=reports/workbench-usage-sample-index.md --max-samples-per-status=5 |
| validate_sample_index | node scripts/validate_workbench_usage_sample_index.mjs .local-cache/workbench-evidence/usage-sample-index.json |
| build_lookup_index | node scripts/build_workbench_usage_lookup_index.mjs --concordance=data/workbench-evidence/usage-concordance.json --output=.local-cache/workbench-evidence/usage-lookup-index.json --report=reports/workbench-usage-lookup-index.md --max-works=25 |
| validate_lookup_index | node scripts/validate_workbench_usage_lookup_index.mjs .local-cache/workbench-evidence/usage-lookup-index.json |
| build_work_frame_matrix | node scripts/build_workbench_usage_work_frame_matrix.mjs --concordance=data/workbench-evidence/usage-concordance.json --output=.local-cache/workbench-evidence/usage-work-frame-matrix.json --report=reports/workbench-usage-work-frame-matrix.md |
| validate_work_frame_matrix | node scripts/validate_workbench_usage_work_frame_matrix.mjs .local-cache/workbench-evidence/usage-work-frame-matrix.json |
| build_search_rows | node scripts/build_workbench_usage_search_rows.mjs --concordance=data/workbench-evidence/usage-concordance.json --output=.local-cache/workbench-evidence/usage-search-rows.json --report=reports/workbench-usage-search-rows.md |
| validate_search_rows | node scripts/validate_workbench_usage_search_rows.mjs .local-cache/workbench-evidence/usage-search-rows.json |
| build_search_shard_index | node scripts/build_workbench_usage_search_shard_index.mjs --search-rows=.local-cache/workbench-evidence/usage-search-rows.json --output=.local-cache/workbench-evidence/usage-search-shard-index.json --report=reports/workbench-usage-search-shard-index.md |
| validate_search_shard_index | node scripts/validate_workbench_usage_search_shard_index.mjs .local-cache/workbench-evidence/usage-search-shard-index.json |
| build_refresh_priority_index | node scripts/build_workbench_usage_refresh_priority_index.mjs --source-freshness=.local-cache/workbench-evidence/source-freshness.json --search-rows=.local-cache/workbench-evidence/usage-search-rows.json --output=.local-cache/workbench-evidence/usage-refresh-priority-index.json --report=reports/workbench-usage-refresh-priority-index.md |
| validate_refresh_priority_index | node scripts/validate_workbench_usage_refresh_priority_index.mjs .local-cache/workbench-evidence/usage-refresh-priority-index.json |
| build_unit_density_index | node scripts/build_workbench_usage_unit_density_index.mjs --search-rows=.local-cache/workbench-evidence/usage-search-rows.json --output=.local-cache/workbench-evidence/usage-unit-density-index.json --report=reports/workbench-usage-unit-density-index.md |
| validate_unit_density_index | node scripts/validate_workbench_usage_unit_density_index.mjs .local-cache/workbench-evidence/usage-unit-density-index.json |
| build_selected_slice | node scripts/build_workbench_usage_slice_index.mjs --concordance=data/workbench-evidence/usage-concordance.json --work-prefix=tanakh/ --slice-id=tanakh-workbench-section --label="Tanakh workbench section" --output=.local-cache/workbench-evidence/usage-slice-tanakh.json --report=reports/workbench-usage-slice-tanakh.md --max-samples=30 |
| validate_selected_slice | node scripts/validate_workbench_usage_slice_index.mjs .local-cache/workbench-evidence/usage-slice-tanakh.json |
| build_selected_slice_jeremiah | node scripts/build_workbench_usage_slice_index.mjs --concordance=data/workbench-evidence/usage-concordance.json --source-ref-prefix=Jeremiah --slice-id=jeremiah-workbench-section --label="Jeremiah workbench section" --output=.local-cache/workbench-evidence/usage-slice-jeremiah.json --report=reports/workbench-usage-slice-jeremiah.md --max-samples=30 |
| validate_selected_slice_jeremiah | node scripts/validate_workbench_usage_slice_index.mjs .local-cache/workbench-evidence/usage-slice-jeremiah.json |
| build_selected_slices_index | node scripts/build_workbench_usage_selected_slices_index.mjs --slices-dir=.local-cache/workbench-evidence --output=.local-cache/workbench-evidence/usage-selected-slices-index.json --report=reports/workbench-usage-selected-slices-index.md |
| validate_selected_slices_index | node scripts/validate_workbench_usage_selected_slices_index.mjs .local-cache/workbench-evidence/usage-selected-slices-index.json |
| build_selected_occurrences | node scripts/build_workbench_usage_selected_occurrences.mjs --selected-slices-index=.local-cache/workbench-evidence/usage-selected-slices-index.json --output=.local-cache/workbench-evidence/usage-selected-occurrences.json --report=reports/workbench-usage-selected-occurrences.md |
| validate_selected_occurrences | node scripts/validate_workbench_usage_selected_occurrences.mjs .local-cache/workbench-evidence/usage-selected-occurrences.json |
| build_selected_occurrence_lookup | node scripts/build_workbench_usage_selected_occurrence_lookup.mjs --selected-occurrences=.local-cache/workbench-evidence/usage-selected-occurrences.json --output=.local-cache/workbench-evidence/usage-selected-occurrence-lookup.json --report=reports/workbench-usage-selected-occurrence-lookup.md --max-samples=5 |
| validate_selected_occurrence_lookup | node scripts/validate_workbench_usage_selected_occurrence_lookup.mjs .local-cache/workbench-evidence/usage-selected-occurrence-lookup.json |
| build_crossmatch_links | node scripts/build_workbench_usage_crossmatch_links.mjs --selected-occurrences=.local-cache/workbench-evidence/usage-selected-occurrences.json --output=.local-cache/workbench-evidence/usage-crossmatch-links.json --report=reports/workbench-usage-crossmatch-links.md |
| validate_crossmatch_links | node scripts/validate_workbench_usage_crossmatch_links.mjs .local-cache/workbench-evidence/usage-crossmatch-links.json |
| build_crossmatch_bridge_index | node scripts/build_workbench_usage_crossmatch_bridge_index.mjs --crossmatch-links=.local-cache/workbench-evidence/usage-crossmatch-links.json --output=.local-cache/workbench-evidence/usage-crossmatch-bridge-index.json --report=reports/workbench-usage-crossmatch-bridge-index.md |
| validate_crossmatch_bridge_index | node scripts/validate_workbench_usage_crossmatch_bridge_index.mjs .local-cache/workbench-evidence/usage-crossmatch-bridge-index.json |
| build_crossmatch_neighborhoods | node scripts/build_workbench_usage_crossmatch_neighborhoods.mjs --crossmatch-links=.local-cache/workbench-evidence/usage-crossmatch-links.json --output=.local-cache/workbench-evidence/usage-crossmatch-neighborhoods.json --report=reports/workbench-usage-crossmatch-neighborhoods.md |
| validate_crossmatch_neighborhoods | node scripts/validate_workbench_usage_crossmatch_neighborhoods.mjs .local-cache/workbench-evidence/usage-crossmatch-neighborhoods.json |
| build_agent6_boundary_packet | node scripts/build_workbench_usage_agent6_boundary_packet.mjs --handoff=.local-cache/workbench-evidence/usage-navigation-handoff-index.json --selected-occurrences=.local-cache/workbench-evidence/usage-selected-occurrences.json --selected-occurrence-lookup=.local-cache/workbench-evidence/usage-selected-occurrence-lookup.json --route-link-check=.local-cache/workbench-evidence/usage-route-link-check.json --audit-review=.local-cache/workbench-evidence/usage-audit-only-review.json --smoke-validation=.local-cache/workbench-evidence/smoke-pipeline-validation.json --output=.local-cache/workbench-evidence/usage-agent6-boundary-packet.json --report=reports/workbench-usage-agent6-boundary-packet.md |
| validate_agent6_boundary_packet | node scripts/validate_workbench_usage_agent6_boundary_packet.mjs .local-cache/workbench-evidence/usage-agent6-boundary-packet.json |
| build_concentration_packet | node scripts/build_workbench_usage_concentration_packet.mjs --selected-occurrences=.local-cache/workbench-evidence/usage-selected-occurrences.json --selected-occurrence-lookup=.local-cache/workbench-evidence/usage-selected-occurrence-lookup.json --output=.local-cache/workbench-evidence/usage-concentration-packet.json --report=reports/workbench-usage-concentration-packet.md |
| validate_concentration_packet | node scripts/validate_workbench_usage_concentration_packet.mjs .local-cache/workbench-evidence/usage-concentration-packet.json |
| build_handoff_index | node scripts/build_workbench_usage_handoff_index.mjs --manifest=data/workbench-evidence/usage-concordance-manifest.json --occurrence-link-check=.local-cache/workbench-evidence/usage-concordance-link-check.json --route-link-check=.local-cache/workbench-evidence/usage-route-link-check.json --audit-review=.local-cache/workbench-evidence/usage-audit-only-review.json --cluster-index=.local-cache/workbench-evidence/usage-cluster-index.json --route-coverage=.local-cache/workbench-evidence/usage-route-coverage.json --sample-index=.local-cache/workbench-evidence/usage-sample-index.json --lookup-index=.local-cache/workbench-evidence/usage-lookup-index.json --work-frame-matrix=.local-cache/workbench-evidence/usage-work-frame-matrix.json --search-rows=.local-cache/workbench-evidence/usage-search-rows.json --search-shard-index=.local-cache/workbench-evidence/usage-search-shard-index.json --refresh-priority-index=.local-cache/workbench-evidence/usage-refresh-priority-index.json --unit-density-index=.local-cache/workbench-evidence/usage-unit-density-index.json --selected-slice=.local-cache/workbench-evidence/usage-slice-tanakh.json --selected-slices-index=.local-cache/workbench-evidence/usage-selected-slices-index.json --selected-occurrences=.local-cache/workbench-evidence/usage-selected-occurrences.json --selected-occurrence-lookup=.local-cache/workbench-evidence/usage-selected-occurrence-lookup.json --crossmatch-links=.local-cache/workbench-evidence/usage-crossmatch-links.json --crossmatch-bridge-index=.local-cache/workbench-evidence/usage-crossmatch-bridge-index.json --crossmatch-neighborhoods=.local-cache/workbench-evidence/usage-crossmatch-neighborhoods.json --agent6-boundary-packet=.local-cache/workbench-evidence/usage-agent6-boundary-packet.json --concentration-packet=.local-cache/workbench-evidence/usage-concentration-packet.json --smoke-validation=.local-cache/workbench-evidence/smoke-pipeline-validation.json --output=.local-cache/workbench-evidence/usage-navigation-handoff-index.json --report=reports/workbench-usage-navigation-handoff.md |
| validate_handoff_index | node scripts/validate_workbench_usage_handoff_index.mjs .local-cache/workbench-evidence/usage-navigation-handoff-index.json |

## Boundary

This handoff is for usage navigation and concordance only. It preserves observed usage, route links, validation state, and audit-only ambiguous rows without ranking routes, selecting visible answers, or making meaning claims.

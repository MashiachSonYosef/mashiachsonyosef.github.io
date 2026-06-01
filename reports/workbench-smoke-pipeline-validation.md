# Workbench Smoke Pipeline Validation

Generated: 2026-06-01T02:26:33.734Z

## Summary

- Steps: 66
- Failed steps: 0
- Smoke targets: 55
- Smoke counts: supported 339, candidate 1351, weak 700, ambiguous 2064
- Missing smoke artifacts: 0
- Zero-useful smoke targets: 0
- Source freshness: stale, count delta 77, modified after artifact 82
- Reshit source coverage: 271/271, uncovered 0
- Handoff coverage: 55 manifests, missing targets 0
- Public handoff index: 55 selected, validation failed 0, eligible 2390, ambiguous count-only 2064, zero-useful 0, ambiguous reader-facing no
- Public handoff quality/license: quality pass_with_warnings, license passed, blocked license rows 0, blocked licenses 0
- Usage concordance: rows 2390, supported 339, candidate 1351, weak 700, route-linked 2390, observed-only 0, audit-only ambiguous 2064, ambiguous reader-facing no
- Usage concordance manifest: present, JSON tracked no, report tracked yes
- Usage cluster index: present, clusters 2, rows 2390
- Usage route coverage: present, route IDs 1, links 2390
- Usage sample index: present, samples 24, clusters 2
- Usage lookup index: present, occurrence refs 2390, works 271
- Usage work/frame matrix: present, rows 2390, works 271, categories 15, clusters 2, route payload hits 0
- Usage search rows: present, rows 2390, works 271, categories 15, clusters 2, route payload hits 0
- Usage provenance: present, rows 2390, licenses 4, version sources 185, license metadata 2390, source links 2390, version metadata 2390, unsafe license rows 0, route payload hits 0
- Usage search shard index: present, shards 74, rows 2390, categories 15, clusters 2, statuses 3, route payload hits 0
- Usage refresh priority: present, pending 82, known-use candidates 0, review-only 82, promoted 0, blocked broad refresh files 82, route payload hits 0
- Usage unit density: present, units 1673, rows 2390, multi-occurrence units 418, max occurrences per unit 11, works 271, route payload hits 0
- Usage phrase recurrence: present, rows 2390, n-gram instances 32425, recurring groups 2244, rows with recurring groups 2303, skipped rows without focus 0, route payload hits 0
- Usage context offset: present, rows 2390, rows with context 2390, token observations 36525, immediate neighbor observations 4731, offsets 16, token buckets 17103, skipped rows without focus 0, route payload hits 0
- Usage context signature: present, rows 2390, rows with signatures 2390, windows 4780, groups 3642, recurring groups 394, rows with recurring signatures 1152, cross-cluster groups 76, skipped rows without focus 0, route payload hits 0
- Usage context signature lookup: present, occurrences 2390, memberships 4780, recurring memberships 1532, occurrences with recurring 1152, cross-cluster memberships 491, occurrences with cross-cluster 429, unmatched occurrence IDs 0, route payload hits 0
- Usage context signature contrast: present, cross-cluster groups 76, occurrence refs 429, reader-facing rows 0, route payload hits 0
- Usage selected slice: present, id tanakh-workbench-section, rows 49, works 20
- Usage selected slices index: present, slices 2, rows 50, unique occurrences 49, duplicate rows 1
- Usage selected occurrences: present, rows 49, memberships 50, duplicate memberships 1
- Usage selected signature independence: present, rows 49, memberships 98, recurring memberships 28, cross-cluster memberships 10, rows with recurring 21, rows with cross-cluster 9, missing lookup rows 0, reader-facing rows 0, route payload hits 0
- Usage selected occurrence lookup: present, work buckets 20, cluster buckets 2, status buckets 3
- Usage crossmatch links: present, occurrences 49, directed edges 2352, undirected pairs 1176, route payload hits 0
- Usage crossmatch strengths: strong 1206, moderate 1146, weak 0
- Usage crossmatch bridge index: present, bridge edges 1160, same-frame edges 1192, bridge buckets 2, route payload hits 0
- Usage crossmatch neighborhoods: present, neighborhoods 49, same-frame links 1192, bridge links 1160, route payload hits 0
- Usage concordance link check: passed, source URL bad 0, work anchor bad 0, issues 0
- Usage route link check: passed, links 2390, resolved 2390, unresolved 0, metadata mismatches 0, unique route IDs 1
- Usage audit-only review: rows 2064, ambiguous 2064, blocked 0, reader-facing no
- Usage handoff index: present, smoke skipped_self_reference
- Public handoff integrity: passed, files 275, matched 275, missing 0, mismatched 0, unexpected 0
- Candidate artifact audit quality: pass_with_warnings, warnings 2, broad queue blocked yes, orphan smoke review yes
- Candidate artifact audit: useful 59, zero-useful non-smoke 30, orphan smoke 2

## Steps

| step | status | output |
|---|---|---|
| validate_smoke_queue | passed | Workbench smoke target validation passed. Targets: 55. |
| report_source_freshness | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/source-freshness.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/source-freshness.md / Source freshness stale; current 1269; scanned 1192; modified after artifact 82; created after artifact 77 |
| validate_source_freshness | passed | Validated workbench source freshness .local-cache/workbench-evidence/smoke-pipeline-validation/source-freshness.json: status stale; pending 82 |
| report_reshit_smoke_coverage | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/reshit-smoke-coverage.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/reshit-smoke-coverage.md / Known nonzero source files 271; covered 271; uncovered 0; suggested gap targets 0 |
| report_workbench_smoke_counts | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/reshit-smoke-counts.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/reshit-smoke-counts.md / Targets 55; supported 339; candidate 1351; weak 700; ambiguous 2064; missing 0; zero useful 0 |
| build_complete_handoff_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/handoff-index-smoke-complete.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/handoff-index-smoke-complete.md / Target queue coverage: 55/55; missing 0 |
| validate_complete_handoff_index | passed | Workbench handoff index validation passed. Manifests: 55. Candidates: 4454. |
| build_public_handoff_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/public-handoff-index.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/public-handoff-index.md / Public handoff index selected 55; validation passed 55; failed 0; reader-facing eligible rows 2390; ambiguous count-only rows 2064 |
| validate_public_handoff_index | passed | Workbench public handoff index validation passed. Manifests: 55. Eligible rows: 2390. Ambiguous count-only rows: 2064. Quality: pass_with_warnings. Top frame: reshit-opening-time-order (1271 eligible). |
| build_usage_concordance | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-concordance.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-concordance.md / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-concordance-manifest.json / Usage concordance rows 2390; supported 339; candidate 1351; weak 700; audit-only ambiguous 2064 |
| validate_usage_concordance | passed | Workbench usage concordance validation passed. Rows: 2390. Supported: 339. Candidate: 1351. Weak: 700. Audit-only ambiguous: 2064. |
| build_usage_cluster_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-cluster-index.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-cluster-index.md / Usage cluster index clusters 2; rows 2390 |
| validate_usage_cluster_index | passed | Workbench usage cluster index validation passed. Clusters: 2. Rows: 2390. |
| build_usage_route_coverage | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-route-coverage.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-route-coverage.md / Usage route coverage route IDs 1; linked rows 2390; observed-only 0 |
| validate_usage_route_coverage | passed | Workbench usage route coverage validation passed. Route IDs: 1. Links: 2390. |
| build_usage_sample_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-sample-index.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-sample-index.md / Usage sample index samples 24; clusters 2 |
| validate_usage_sample_index | passed | Workbench usage sample index validation passed. Samples: 24. Clusters: 2. |
| build_usage_lookup_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-lookup-index.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-lookup-index.md / Usage lookup index occurrences 2390; works 271; clusters 2 |
| validate_usage_lookup_index | passed | Workbench usage lookup index validation passed. Occurrences: 2390. Works: 271. |
| build_usage_work_frame_matrix | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-work-frame-matrix.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-work-frame-matrix.md / Usage work-frame matrix works 271; categories 15; rows 2390 |
| validate_usage_work_frame_matrix | passed | Validated usage work-frame matrix .local-cache/workbench-evidence/smoke-pipeline-validation/usage-work-frame-matrix.json: works 271; rows 2390 |
| build_usage_search_rows | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-search-rows.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-search-rows.md / Usage search rows 2390; works 271; categories 15 |
| validate_usage_search_rows | passed | Validated usage search rows .local-cache/workbench-evidence/smoke-pipeline-validation/usage-search-rows.json: rows 2390; works 271 |
| build_usage_provenance_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-provenance-index.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-provenance-index.md / Usage provenance rows 2390; licenses 4; version sources 185 |
| validate_usage_provenance_index | passed | Validated usage provenance index .local-cache/workbench-evidence/smoke-pipeline-validation/usage-provenance-index.json: licenses 4; version sources 185; rows 2390 |
| build_usage_search_shard_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-search-shard-index.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-search-shard-index.md / Usage search shard index shards 74; rows 2390 |
| validate_usage_search_shard_index | passed | Validated usage search shard index .local-cache/workbench-evidence/smoke-pipeline-validation/usage-search-shard-index.json: shards 74; rows 2390 |
| build_usage_refresh_priority_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-refresh-priority-index.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-refresh-priority-index.md / Usage refresh priority pending 82; known-use candidates 0; promoted 0 |
| validate_usage_refresh_priority_index | passed | Validated usage refresh priority index .local-cache/workbench-evidence/smoke-pipeline-validation/usage-refresh-priority-index.json: pending 82; promoted 0 |
| build_usage_unit_density_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-unit-density-index.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-unit-density-index.md / Usage unit density units 1673; multi 418; rows 2390 |
| validate_usage_unit_density_index | passed | Validated usage unit density index .local-cache/workbench-evidence/smoke-pipeline-validation/usage-unit-density-index.json: units 1673; rows 2390 |
| build_usage_phrase_recurrence_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-phrase-recurrence-index.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-phrase-recurrence-index.md / Usage phrase recurrence groups 2244; instances 32425; rows 2390 |
| validate_usage_phrase_recurrence_index | passed | Validated usage phrase recurrence index .local-cache/workbench-evidence/smoke-pipeline-validation/usage-phrase-recurrence-index.json: groups 2244; rows 2390 |
| build_usage_context_offset_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-context-offset-index.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-context-offset-index.md / Usage context offsets 16; token buckets 17103; observations 36525 |
| validate_usage_context_offset_index | passed | Validated usage context offset index .local-cache/workbench-evidence/smoke-pipeline-validation/usage-context-offset-index.json: offsets 16; observations 36525 |
| build_usage_context_signature_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-context-signature-index.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-context-signature-index.md / Usage context signature groups 3642; recurring 394; windows 4780 |
| validate_usage_context_signature_index | passed | Validated usage context signature index .local-cache/workbench-evidence/smoke-pipeline-validation/usage-context-signature-index.json: groups 3642; recurring 394 |
| build_usage_context_signature_lookup | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-context-signature-lookup.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-context-signature-lookup.md / Usage context signature lookup occurrences 2390; memberships 4780; recurring occurrences 1152 |
| validate_usage_context_signature_lookup | passed | Validated usage context signature lookup .local-cache/workbench-evidence/smoke-pipeline-validation/usage-context-signature-lookup.json: occurrences 2390; memberships 4780 |
| build_usage_context_signature_contrast | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-context-signature-contrast.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-context-signature-contrast.md / Usage context signature contrast groups 76; occurrences 429 |
| validate_usage_context_signature_contrast | passed | Validated usage context signature contrast .local-cache/workbench-evidence/smoke-pipeline-validation/usage-context-signature-contrast.json: groups 76; occurrences 429 |
| build_usage_selected_slice | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-slice-tanakh.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-slice-tanakh.md / Usage slice tanakh-workbench-section rows 49; works 20; clusters 2 |
| validate_usage_selected_slice | passed | Workbench usage slice index validation passed. Slice rows: 49. Works: 20. |
| build_usage_selected_slice_jeremiah | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-slice-jeremiah.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-slice-jeremiah.md / Usage slice jeremiah-workbench-section rows 1; works 1; clusters 1 |
| validate_usage_selected_slice_jeremiah | passed | Workbench usage slice index validation passed. Slice rows: 1. Works: 1. |
| build_usage_selected_slices_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-selected-slices-index.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-selected-slices-index.md / Usage selected slices index slices 2; rows 50; unique occurrences 49 |
| validate_usage_selected_slices_index | passed | Validated usage selected slices index .local-cache/workbench-evidence/smoke-pipeline-validation/usage-selected-slices-index.json: slices 2; rows 50; unique occurrences 49 |
| build_usage_selected_occurrences | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-selected-occurrences.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-selected-occurrences.md / Usage selected occurrences rows 49; memberships 50 |
| validate_usage_selected_occurrences | passed | Validated usage selected occurrences .local-cache/workbench-evidence/smoke-pipeline-validation/usage-selected-occurrences.json: rows 49; memberships 50 |
| build_usage_selected_signature_independence | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-selected-signature-independence.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-selected-signature-independence.md / Selected signature independence rows 49; recurring 21; cross-cluster 9 |
| validate_usage_selected_signature_independence | passed | Validated usage selected signature independence .local-cache/workbench-evidence/smoke-pipeline-validation/usage-selected-signature-independence.json: rows 49; recurring 21 |
| build_usage_selected_occurrence_lookup | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-selected-occurrence-lookup.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-selected-occurrence-lookup.md / Usage selected occurrence lookup occurrences 49; works 20 |
| validate_usage_selected_occurrence_lookup | passed | Validated selected occurrence lookup .local-cache/workbench-evidence/smoke-pipeline-validation/usage-selected-occurrence-lookup.json: occurrences 49; works 20 |
| build_usage_crossmatch_links | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-crossmatch-links.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-crossmatch-links.md / Usage crossmatch links occurrences 49; directed edges 2352 |
| validate_usage_crossmatch_links | passed | Validated usage crossmatch links .local-cache/workbench-evidence/smoke-pipeline-validation/usage-crossmatch-links.json: occurrences 49; edges 2352 |
| build_usage_crossmatch_bridge_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-crossmatch-bridge-index.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-crossmatch-bridge-index.md / Usage crossmatch bridge index bridges 2; bridge edges 1160 |
| validate_usage_crossmatch_bridge_index | passed | Validated usage crossmatch bridge index .local-cache/workbench-evidence/smoke-pipeline-validation/usage-crossmatch-bridge-index.json: bridges 2; bridge edges 1160 |
| build_usage_crossmatch_neighborhoods | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-crossmatch-neighborhoods.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-crossmatch-neighborhoods.md / Usage crossmatch neighborhoods occurrences 49; same-frame links 1192; bridge links 1160 |
| validate_usage_crossmatch_neighborhoods | passed | Validated usage crossmatch neighborhoods .local-cache/workbench-evidence/smoke-pipeline-validation/usage-crossmatch-neighborhoods.json: neighborhoods 49; bridge links 1160 |
| check_usage_concordance_links | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-concordance-link-check.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-concordance-link-check.md / Usage concordance link check passed; rows 2390; source URL bad 0; work anchors bad 0 |
| check_usage_route_links | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-route-link-check.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-route-link-check.md / Usage route link check passed; rows 2390; links 2390; unresolved 0; metadata mismatches 0 |
| build_usage_audit_review | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-audit-only-review.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-audit-only-review.md / Usage audit-only review rows 2064; ambiguous 2064; blocked 0; reader-facing no |
| build_usage_handoff_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-navigation-handoff-index.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-navigation-handoff-index.md / Usage handoff index rows 2390; occurrence links passed; route links passed; smoke skipped_self_reference |
| validate_usage_handoff_index | passed | Workbench usage handoff index validation passed. Rows: 2390. Clusters: 2. |
| check_public_handoff_integrity | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/public-handoff-integrity-check.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/public-handoff-integrity-check.md / Public handoff integrity passed; files 275; matched 275; missing 0; mismatched 0; unexpected 0 |
| audit_candidate_artifacts | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/candidate-artifact-audit.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/candidate-artifact-audit.md / Artifacts 89; useful 59; zero useful 30; zero useful non-smoke 30; orphan smoke 2; quality pass_with_warnings |

## Boundary

This wrapper validates smoke-only workbench evidence, the public handoff index contract, and the usage-navigation concordance. It does not run broad target selection, expand prefix families, import source text, rank routes, make ambiguous rows reader-facing, or choose HUD winners.

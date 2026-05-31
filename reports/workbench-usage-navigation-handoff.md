# Workbench Usage Navigation Handoff

Generated: 2026-05-31T23:13:49.087Z

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
- Selected slice rows: 49
- Selected slice works: 20
- Selected slices index: 2
- Selected slices index rows: 50
- Selected slices unique occurrences: 49
- Selected slices duplicate rows: 1
- Selected occurrence rows: 49
- Selected occurrence memberships: 50
- Selected occurrence duplicate memberships: 1

## Validation

- Occurrence links: passed, bad source URLs 0, bad work anchors 0
- Route links: passed, resolved 2390, unresolved 0, metadata mismatches 0
- Audit review: rows 2064, reader-facing no
- Cluster index: present, rows 2390, clusters 2
- Route coverage: present, links 2390, unique route IDs 1
- Sample index: present, samples 30
- Lookup index: present, occurrence refs 2390
- Selected slice: present, id tanakh-workbench-section, rows 49
- Selected slices index: present, slices 2, unique occurrences 49
- Selected occurrences: present, rows 49
- Smoke validation: passed, steps 33, failed 0

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
| selected slice | reports/workbench-usage-slice-tanakh.md | yes |
| selected slices index | reports/workbench-usage-selected-slices-index.md | yes |
| selected occurrences | reports/workbench-usage-selected-occurrences.md | yes |
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
| build_selected_slice | node scripts/build_workbench_usage_slice_index.mjs --concordance=data/workbench-evidence/usage-concordance.json --work-prefix=tanakh/ --slice-id=tanakh-workbench-section --label="Tanakh workbench section" --output=.local-cache/workbench-evidence/usage-slice-tanakh.json --report=reports/workbench-usage-slice-tanakh.md --max-samples=30 |
| validate_selected_slice | node scripts/validate_workbench_usage_slice_index.mjs .local-cache/workbench-evidence/usage-slice-tanakh.json |
| build_selected_slice_jeremiah | node scripts/build_workbench_usage_slice_index.mjs --concordance=data/workbench-evidence/usage-concordance.json --source-ref-prefix=Jeremiah --slice-id=jeremiah-workbench-section --label="Jeremiah workbench section" --output=.local-cache/workbench-evidence/usage-slice-jeremiah.json --report=reports/workbench-usage-slice-jeremiah.md --max-samples=30 |
| validate_selected_slice_jeremiah | node scripts/validate_workbench_usage_slice_index.mjs .local-cache/workbench-evidence/usage-slice-jeremiah.json |
| build_selected_slices_index | node scripts/build_workbench_usage_selected_slices_index.mjs --slices-dir=.local-cache/workbench-evidence --output=.local-cache/workbench-evidence/usage-selected-slices-index.json --report=reports/workbench-usage-selected-slices-index.md |
| validate_selected_slices_index | node scripts/validate_workbench_usage_selected_slices_index.mjs .local-cache/workbench-evidence/usage-selected-slices-index.json |
| build_selected_occurrences | node scripts/build_workbench_usage_selected_occurrences.mjs --selected-slices-index=.local-cache/workbench-evidence/usage-selected-slices-index.json --output=.local-cache/workbench-evidence/usage-selected-occurrences.json --report=reports/workbench-usage-selected-occurrences.md |
| validate_selected_occurrences | node scripts/validate_workbench_usage_selected_occurrences.mjs .local-cache/workbench-evidence/usage-selected-occurrences.json |
| build_handoff_index | node scripts/build_workbench_usage_handoff_index.mjs --manifest=data/workbench-evidence/usage-concordance-manifest.json --occurrence-link-check=.local-cache/workbench-evidence/usage-concordance-link-check.json --route-link-check=.local-cache/workbench-evidence/usage-route-link-check.json --audit-review=.local-cache/workbench-evidence/usage-audit-only-review.json --cluster-index=.local-cache/workbench-evidence/usage-cluster-index.json --route-coverage=.local-cache/workbench-evidence/usage-route-coverage.json --sample-index=.local-cache/workbench-evidence/usage-sample-index.json --lookup-index=.local-cache/workbench-evidence/usage-lookup-index.json --selected-slice=.local-cache/workbench-evidence/usage-slice-tanakh.json --selected-slices-index=.local-cache/workbench-evidence/usage-selected-slices-index.json --selected-occurrences=.local-cache/workbench-evidence/usage-selected-occurrences.json --smoke-validation=.local-cache/workbench-evidence/smoke-pipeline-validation.json --output=.local-cache/workbench-evidence/usage-navigation-handoff-index.json --report=reports/workbench-usage-navigation-handoff.md |
| validate_handoff_index | node scripts/validate_workbench_usage_handoff_index.mjs .local-cache/workbench-evidence/usage-navigation-handoff-index.json |

## Boundary

This handoff is for usage navigation and concordance only. It preserves observed usage, route links, validation state, and audit-only ambiguous rows without ranking routes, selecting visible answers, or making meaning claims.

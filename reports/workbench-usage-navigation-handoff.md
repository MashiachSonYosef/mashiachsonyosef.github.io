# Workbench Usage Navigation Handoff

Generated: 2026-05-31T17:34:29.055Z

## Summary

- Concordance rows: 2390
- Selected manifests: 55
- Reader-facing statuses: supported 339, candidate 1351, weak 700
- Audit-only rows: ambiguous 2064, blocked 0
- Route-linked rows: 2390
- Observed-only rows: 0
- Usage clusters: 2

## Validation

- Occurrence links: passed, bad source URLs 0, bad work anchors 0
- Route links: passed, resolved 2390, unresolved 0, metadata mismatches 0
- Audit review: rows 2064, reader-facing no
- Cluster index: present, rows 2390, clusters 2
- Smoke validation: passed, steps 19, failed 0

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
| build_handoff_index | node scripts/build_workbench_usage_handoff_index.mjs --manifest=data/workbench-evidence/usage-concordance-manifest.json --occurrence-link-check=.local-cache/workbench-evidence/usage-concordance-link-check.json --route-link-check=.local-cache/workbench-evidence/usage-route-link-check.json --audit-review=.local-cache/workbench-evidence/usage-audit-only-review.json --cluster-index=.local-cache/workbench-evidence/usage-cluster-index.json --smoke-validation=.local-cache/workbench-evidence/smoke-pipeline-validation.json --output=.local-cache/workbench-evidence/usage-navigation-handoff-index.json --report=reports/workbench-usage-navigation-handoff.md |
| validate_handoff_index | node scripts/validate_workbench_usage_handoff_index.mjs .local-cache/workbench-evidence/usage-navigation-handoff-index.json |

## Boundary

This handoff is for usage navigation and concordance only. It preserves observed usage, route links, validation state, and audit-only ambiguous rows without ranking routes, selecting visible answers, or making meaning claims.

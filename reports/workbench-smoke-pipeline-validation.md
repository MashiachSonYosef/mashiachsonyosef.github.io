# Workbench Smoke Pipeline Validation

Generated: 2026-05-31T16:14:11.679Z

## Summary

- Steps: 16
- Failed steps: 0
- Smoke targets: 55
- Smoke counts: supported 339, candidate 1351, weak 700, ambiguous 2064
- Missing smoke artifacts: 0
- Zero-useful smoke targets: 0
- Source freshness: stale, count delta 48, modified after artifact 48
- Reshit source coverage: 271/271, uncovered 0
- Handoff coverage: 55 manifests, missing targets 0
- Public handoff index: 55 selected, validation failed 0, eligible 2390, ambiguous count-only 2064, zero-useful 0, ambiguous reader-facing no
- Public handoff quality/license: quality pass_with_warnings, license passed, blocked license rows 0, blocked licenses 0
- Usage concordance: rows 2390, supported 339, candidate 1351, weak 700, route-linked 2390, observed-only 0, audit-only ambiguous 2064, ambiguous reader-facing no
- Usage concordance manifest: present, JSON tracked no, report tracked yes
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
| report_source_freshness | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/source-freshness.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/source-freshness.md / Source freshness stale; current 1240; scanned 1192; modified after artifact 48; created after artifact 48 |
| report_reshit_smoke_coverage | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/reshit-smoke-coverage.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/reshit-smoke-coverage.md / Known nonzero source files 271; covered 271; uncovered 0; suggested gap targets 0 |
| report_workbench_smoke_counts | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/reshit-smoke-counts.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/reshit-smoke-counts.md / Targets 55; supported 339; candidate 1351; weak 700; ambiguous 2064; missing 0; zero useful 0 |
| build_complete_handoff_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/handoff-index-smoke-complete.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/handoff-index-smoke-complete.md / Target queue coverage: 55/55; missing 0 |
| validate_complete_handoff_index | passed | Workbench handoff index validation passed. Manifests: 55. Candidates: 4454. |
| build_public_handoff_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/public-handoff-index.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/public-handoff-index.md / Public handoff index selected 55; validation passed 55; failed 0; reader-facing eligible rows 2390; ambiguous count-only rows 2064 |
| validate_public_handoff_index | passed | Workbench public handoff index validation passed. Manifests: 55. Eligible rows: 2390. Ambiguous count-only rows: 2064. Quality: pass_with_warnings. Top frame: reshit-opening-time-order (1271 eligible). |
| build_usage_concordance | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-concordance.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-concordance.md / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-concordance-manifest.json / Usage concordance rows 2390; supported 339; candidate 1351; weak 700; audit-only ambiguous 2064 |
| validate_usage_concordance | passed | Workbench usage concordance validation passed. Rows: 2390. Supported: 339. Candidate: 1351. Weak: 700. Audit-only ambiguous: 2064. |
| check_usage_concordance_links | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-concordance-link-check.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-concordance-link-check.md / Usage concordance link check passed; rows 2390; source URL bad 0; work anchors bad 0 |
| check_usage_route_links | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-route-link-check.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-route-link-check.md / Usage route link check passed; rows 2390; links 2390; unresolved 0; metadata mismatches 0 |
| build_usage_audit_review | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-audit-only-review.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-audit-only-review.md / Usage audit-only review rows 2064; ambiguous 2064; blocked 0; reader-facing no |
| build_usage_handoff_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-navigation-handoff-index.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/usage-navigation-handoff-index.md / Usage handoff index rows 2390; occurrence links passed; route links passed; smoke skipped_self_reference |
| check_public_handoff_integrity | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/public-handoff-integrity-check.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/public-handoff-integrity-check.md / Public handoff integrity passed; files 275; matched 275; missing 0; mismatched 0; unexpected 0 |
| audit_candidate_artifacts | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/candidate-artifact-audit.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/candidate-artifact-audit.md / Artifacts 89; useful 59; zero useful 30; zero useful non-smoke 30; orphan smoke 2; quality pass_with_warnings |

## Boundary

This wrapper validates smoke-only workbench evidence, the public handoff index contract, and the usage-navigation concordance. It does not run broad target selection, expand prefix families, import source text, rank routes, make ambiguous rows reader-facing, or choose HUD winners.

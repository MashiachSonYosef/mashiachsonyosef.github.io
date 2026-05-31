# Workbench Smoke Pipeline Validation

Generated: 2026-05-31T15:41:10.434Z

## Summary

- Steps: 9
- Failed steps: 0
- Smoke targets: 55
- Smoke counts: supported 339, candidate 1351, weak 700, ambiguous 2064
- Missing smoke artifacts: 0
- Zero-useful smoke targets: 0
- Source freshness: stale, count delta 43, modified after artifact 43
- Reshit source coverage: 271/271, uncovered 0
- Handoff coverage: 55 manifests, missing targets 0
- Public handoff index: 55 selected, validation failed 0, eligible 2390, ambiguous count-only 2064, ambiguous reader-facing no
- Candidate artifact audit: useful 59, zero-useful non-smoke 30, orphan smoke 2

## Steps

| step | status | output |
|---|---|---|
| validate_smoke_queue | passed | Workbench smoke target validation passed. Targets: 55. |
| report_source_freshness | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/source-freshness.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/source-freshness.md / Source freshness stale; current 1235; scanned 1192; modified after artifact 43; created after artifact 43 |
| report_reshit_smoke_coverage | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/reshit-smoke-coverage.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/reshit-smoke-coverage.md / Known nonzero source files 271; covered 271; uncovered 0; suggested gap targets 0 |
| report_workbench_smoke_counts | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/reshit-smoke-counts.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/reshit-smoke-counts.md / Targets 55; supported 339; candidate 1351; weak 700; ambiguous 2064; missing 0; zero useful 0 |
| build_complete_handoff_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/handoff-index-smoke-complete.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/handoff-index-smoke-complete.md / Target queue coverage: 55/55; missing 0 |
| validate_complete_handoff_index | passed | Workbench handoff index validation passed. Manifests: 55. Candidates: 4454. |
| build_public_handoff_index | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/public-handoff-index.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/public-handoff-index.md / Public handoff index selected 55; validation passed 55; failed 0; reader-facing eligible rows 2390; ambiguous count-only rows 2064 |
| validate_public_handoff_index | passed | Workbench public handoff index validation passed. Manifests: 55. Eligible rows: 2390. Ambiguous count-only rows: 2064. |
| audit_candidate_artifacts | passed | Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/candidate-artifact-audit.json / Wrote .local-cache/workbench-evidence/smoke-pipeline-validation/candidate-artifact-audit.md / Artifacts 89; useful 59; zero useful 30; zero useful non-smoke 30; orphan smoke 2 |

## Boundary

This wrapper validates smoke-only workbench evidence and the public handoff index contract. It does not run broad target selection, expand prefix families, import source text, rank definitions, make ambiguous rows reader-facing, or choose HUD winners.

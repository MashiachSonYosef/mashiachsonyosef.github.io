# Usage Navigation Boundary Summary Validation

Generated: 2026-06-01T13:32:12.357Z

Verdict: pass_with_warnings

## Summary

- Selected rows: 49
- Observed-usage-only rows: 49
- Reader-facing rows: 0
- Route payload field hits: 0
- Unresolved route rows: 0
- Route payload copied rows: 0
- Rows with license metadata: 49
- Missing or unrecognized license rows: 0
- Collision buckets: 16
- Cross-frame collision rows: 14

## Artifacts

| id | artifact | quality | issues | warnings |
|---|---|---|---|---|
| source_diversity | .local-cache/workbench-evidence/usage-selected-source-diversity.json | [object Object] | none | none |
| provenance_matrix | .local-cache/workbench-evidence/usage-selected-provenance-matrix.json | [object Object] | none | none |
| route_provenance | .local-cache/workbench-evidence/usage-selected-route-provenance-audit.json | [object Object] | none | none |
| collision_audit | .local-cache/workbench-evidence/usage-selected-collision-audit.json | [object Object] | none | cross-frame collisions remain visible for QA |
| occurrence_navigation | .local-cache/workbench-evidence/usage-selected-occurrence-navigation-index.json | [object Object] | none | none |

## Issues

- none

## Warnings

- collision_audit: cross-frame collisions remain visible for QA

## Boundary

- This validates existing Agent 3 selected-usage artifacts only; it does not expand the usage corpus.
- Usage navigation remains evidence/navigation only, not definition authority, not accepted translation text, and not publication support.
- Cross-frame collisions remain visible as QA warnings instead of being hidden.
- Publication remains blocked_no_render.


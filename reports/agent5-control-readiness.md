# Agent 5 Control Readiness

Generated: 2026-06-06T13:16:57.232Z

## Summary

- Status: passed
- Issues: 0
- Warnings: 3

## Checks

| status | check | detail |
|---|---|---|
| pass | HUD route release stamp | release hud-route-rc-2026-05-31T16-55-29-957Z; public cards 539661; public shards 7990 |
| warn | HUD route release gate | status pass_with_warnings; route lookup integrity passed but frozen route-source reconciliation has warnings |
| pass | Workbench public handoff index | 55 selected targets; 2390 eligible usage rows; 2064 ambiguous count-only rows |
| warn | Workbench handoff authority drift | legacy data/workbench-evidence/handoff-index.json still reports 0 manifests; use public-handoff-index.json as the current authority |
| pass | Workbench usage navigation links | 2390 concordance links checked; bad URLs 0; unresolved route links 0 |
| pass | Translation memory scaffold | 40 scaffold rows; accepted 0; candidate 8; ambiguous 17; needs_review 15 |
| pass | Translation memory source anchors | 40 rows; 40 quote anchors; 40 position anchors; unique decision/occurrence IDs |
| pass | Translation memory license profiles | 37 direct-use rows; 3 publication-review rows; publication_ok_with_attribution:16, publication_ok:21, workbench_ok_publication_review:3 |
| pass | Translation attribution manifest | 48 sources; 25 attribution-required; 3 publication-review |
| pass | Route HUD page report | current static HUD-shell sweep count 1360; rank-basis, stale markers, and route lookup clear |
| pass | Route HUD accessibility audit | 0 errors, 0 warnings |
| warn | Stale HUD contract tools | 1 positive legacy marker assumption(s) remain: scripts/upgrade_route_hud_pages.mjs:142 (Best actual hit); keep scripts/validate_route_hud_page.mjs and release stamps as current authority |

## Control Interpretation

- This is a lightweight control check only. It does not hash large route inputs, run renders, run builds, or validate generated pages.
- A pass means the current architecture-level stamps exist and agree at the metadata level.
- Warnings identify bounded-scope or authority-drift risks that should be carried into Agent 5 control notes.


# Agent 1 Broad Workbench Token Inventory 5000 Source-Lane Blocker - 2026-06-04

Status: `exact_source_lane_join_blocker_returned`.

| target | files | exact command/script | output artifact | schema/counts | validator | missing-field blocker | handoff owner | stop condition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `broad-workbench-token-inventory-5000-source-lane-join` | `reports/agent10-agent2-ready-broad-workbench-token-inventory-5000-workset-2026-06-04.json`; `reports/agent2-broad-workbench-token-inventory-5000-return-2026-06-04.json`; `.local-cache/workbench-evidence/token-inventory-5000.json` | `node scripts/build_agent1_broad_workbench_token_inventory_5000_source_lane_blocker.mjs` | `reports/agent1-broad-workbench-token-inventory-5000-source-lane-blocker-2026-06-04.json` | `5000` token rows; `5000` missing source-lane rows; `0` candidate-text rows | `node scripts/validate_agent1_broad_workbench_token_inventory_5000_source_lane_blocker.mjs` | `token_inventory_rows_do_not_carry_source_family_source_name_license_lane_source_url_or_citation` | Agent 1 for source/license/custody join pipeline; Agent 10 for release intake; Agent 6 only by exact boundary packet after a joined row/subset exists. | Stop after blocker packet plus validator pass, or after exact source-lane join workset is supplied. |

## Missing Fields

- `source_family`: `5000` rows
- `source_name`: `5000` rows
- `license_label`: `5000` rows
- `license_lane`: `5000` rows
- `source_url_or_citation`: `5000` rows
- `agent6_boundary_required`: `5000` rows

## Boundary

Inventory mechanics only. No candidate text/export/storage, source/license/legal acceptance, QA acceptance, Definition authority, answer eligibility, public/runtime mutation, publication readiness, accepted gloss/text, or NC commercial authorization.

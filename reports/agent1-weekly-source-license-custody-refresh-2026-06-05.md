# Agent 1 Weekly Source/License/Custody Refresh - 2026-06-05

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE / Option C HYBRID`

## Refresh outcome

- `node scripts/validate_agent1_source_license_custody_pipeline_set.mjs` -> `ok=true`, `runnable_contract_count=22`, `supporting_packet_count=24`, `exact_blocker_count=1`, `lane_return_output_count=48`.
- `node scripts/validate_agent1_orot_third_missed_source_family_pipeline.mjs` -> `ok=true`, `runnable rows=169`, `occurrences=2148`, lane counts `138/1672 / 0/0 / 0/0 / 31/476`.
- `node scripts/validate_agent1_spark1_orot_third_missed_source_family_contract.mjs` -> `ok=true`, `spark1_routable=true`.
- `node scripts/validate_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs` -> `ok=true`, `source_family_count=5`, lane source-family counts `3/0/1/0`.
- `node scripts/validate_agent1_spark1_old_dictionary_reaudit_pipeline_contract.mjs` -> `ok=true`, `spark1_routable=true`, `audited_rows=500`, `audited_occurrences=8427`.

## Orot / nc-klein educational

- `target`: `orot_nc_klein`
- `files`: `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json`, `reports/agent1-spark1-pipeline-contract-orot-nc-klein-source-family-2026-06-04.json`
- `command/script`:
  - `node scripts/build_agent1_orot_nc_klein_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_orot_nc_klein_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_spark1_orot_nc_klein_source_family_contract.mjs`
- `output artifact`: `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json`
- `schema/counts`: `17 / 259`, lane `noncommercial_educational_candidate=17 / 259`
- `policy`: `derived_from_nc=true`, `commercial_export_allowed=false`, `attribution_required=true`, `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`, `corpus_contamination=false`, `agent6_boundary_required=true`
- `next command`: boundary packet only (`agent6_boundary_required=true`)
- `handoff owner`: Agent 10 for runnable packet, Agent 6 for boundary.

## Orot / next-missed source-family

- `target`: `orot_next_missed_source_family`
- `files`: `reports/agent1-orot-next-missed-source-family-map-2026-06-04.json`, `reports/agent1-spark1-pipeline-contract-orot-next-missed-source-family-2026-06-04.json`
- `command/script`:
  - `node scripts/build_agent1_orot_next_missed_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_orot_next_missed_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_spark1_orot_next_missed_source_family_contract.mjs`
- `output artifact`: `reports/agent1-orot-next-missed-source-family-map-2026-06-04.json`
- `schema/counts`: `50 / 1193`, lane `commercial_clean_candidate=50 / 1193`
- `next command`: boundary-only handoff
- `handoff owner`: Agent 10 for package intake, Agent 6 for candidate-text/export posture.

## Orot / third-missed source-family

- `target`: `orot_third_missed_source_family`
- `files`: `reports/agent1-orot-third-missed-source-family-map-2026-06-05.json`, `reports/agent1-spark1-pipeline-contract-orot-third-missed-source-family-2026-06-05.json`, `reports/agent1-third-missed-source-family-target-or-blocker-resolution-2026-06-05.json`
- `command/script`:
  - `node scripts/build_agent1_orot_third_missed_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_orot_third_missed_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_spark1_orot_third_missed_source_family_contract.mjs`
- `output artifact`: `reports/agent1-orot-third-missed-source-family-map-2026-06-05.json`
- `schema/counts`: `169 / 2148` with lanes `commercial_clean_candidate=138/1672`, `blocked_or_needs_review=31/476`, `noncommercial_educational_candidate=0`, `metadata_or_link_only=0`
- `exact blockers now`: no row/missing-field blockers for packet integrity; remaining `agent6_boundary_required=true` on all 31 blocked/review rows.
- `handoff owner`: Agent 6 boundary for the blocked 31 rows; Agent 10 for runnable packet intake.

## old-dictionary excluded-row reaudit

- `target`: `old_dictionary_excluded_row_license_lane_reaudit`
- `files`: `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`, `reports/agent1-spark1-pipeline-contract-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`
- `command/script`:
  - `node scripts/build_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`
  - `node scripts/validate_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`
  - `node scripts/validate_agent1_spark1_old_dictionary_reaudit_pipeline_contract.mjs`
- `output artifact`: `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`
- `schema/counts`: `500 / 8427` with lane split `commercial_clean_candidate=3`, `noncommercial_educational_candidate=1`, `blocked_or_needs_review=1`, `metadata_or_link_only=0`
- `exact blockers now`:
  - `old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong` → missing source/license evidence (`222 / 4435`), including independent custody basis and source URL/version.
  - `old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary` → `agent6_boundary_required=true` for NC educational display/storage/export.
- `handoff owner`: Agent 10 for runnable packet, Agent 6 for boundary decisions.

## stop condition

- Hold until changed inputs/occurrences or evidence fields alter any of the above worksets.
- No source/license/legal/QA/runtime/publication/product/answer acceptance is claimed.


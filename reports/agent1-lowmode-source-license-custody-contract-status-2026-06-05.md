# Agent 1 Low-Mode Source/License/Custody Contract Status - 2026-06-05

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE / Option C HYBRID`

## Snapshot

- `contracts_1_2_3_and_orot_third_missed_ready_validated`
- No acceptance claims: source/license, QA, Definition authority, runtime/public, publication, product/data, answer acceptance, or NC commercial authorization.
- Last set validation: `node scripts/validate_agent1_source_license_custody_pipeline_set.mjs` -> `agent1_source_license_custody_pipeline_set_validated_for_discovery_only`.

## Orot NC/Klein source-family

- target: `orot_nc_klein`
- source: `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json`
- contract: `reports/agent1-spark1-pipeline-contract-orot-nc-klein-source-family-2026-06-04.json`
- commands:
  - `node scripts/build_agent1_orot_nc_klein_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_orot_nc_klein_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_spark1_orot_nc_klein_source_family_contract.mjs`
- schema/counts: `17 / 259`
- lane split: `noncommercial_educational_candidate = 17 / 259`
- flags: `derived_from_nc=true`, `commercial_export_allowed=false`, `attribution_required=true`, `corpus_contamination=false`, `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`, `answer_eligible=false`, `public_emit=false`, `agent6_boundary_required=true`
- validation: map ok, contract ok, `spark1_routable=true`
- handoff: Agent 10 for packet intake, Agent 6 boundary only for NC display/storage/export posture.

## Orot next-missed source-family

- target: `orot_next_missed_source_family`
- source: `reports/agent1-orot-next-missed-source-family-map-2026-06-04.json`
- contract: `reports/agent1-spark1-pipeline-contract-orot-next-missed-source-family-2026-06-04.json`
- commands:
  - `node scripts/build_agent1_orot_next_missed_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_orot_next_missed_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_spark1_orot_next_missed_source_family_contract.mjs`
- schema/counts: `50 / 1193`
- lane split: `commercial_clean_candidate = 50 / 1193`
- validation: map ok, contract ok, `spark1_routable=true`
- handoff: Agent 10 for packet intake, Agent 6 boundary only.

## Orot third-missed source-family

- target: `orot_third_missed_source_family`
- source: `reports/agent1-orot-third-missed-source-family-map-2026-06-05.json`
- contract: `reports/agent1-spark1-pipeline-contract-orot-third-missed-source-family-2026-06-05.json`
- source blocker resolution: `reports/agent1-third-missed-source-family-target-or-blocker-resolution-2026-06-05.json`
- commands:
  - `node scripts/build_agent1_orot_third_missed_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_orot_third_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_spark1_orot_third_missed_source_family_contract.mjs`
- schema/counts: `169 / 2148`
- lane split: `commercial_clean_candidate = 138 / 1672`, `blocked_or_needs_review = 31 / 476`
- validation: map ok, contract ok, `spark1_routable=true`
- blocker status: exact workset blocker resolved; boundary-only wait remains for blocked 31/476 via `agent6_boundary_required=true`.

## Old-dictionary excluded-row reaudit

- target: `old_dictionary_excluded_row_license_lane_reaudit`
- source: `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`
- contract: `reports/agent1-spark1-pipeline-contract-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`
- commands:
  - `node scripts/build_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`
  - `node scripts/validate_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`
  - `node scripts/validate_agent1_spark1_old_dictionary_reaudit_pipeline_contract.mjs`
- schema/counts: `500 / 8427`
- lane split: `commercial_clean_candidate = 3`, `noncommercial_educational_candidate = 1`, `blocked_or_needs_review = 1`
- exact blockers now:
  - `old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong` -> missing independent source/license evidence and source URL/version fields (`222 / 4435` rows/occurrences affected)
  - `old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary` -> `agent6_boundary_required=true` for noncommercial use (`214 / 4444` rows/occurrences affected)
- validation: map ok, contract ok, `spark1_routable=true`

## Pipeline-set validation summary

- `runnable_contract_count`: `22`
- `supporting_packet_count`: `24`
- `exact_blocker_count`: `1`
- `lane_return_output_count`: `48`
- validated registry: `reports/agent1-source-license-custody-pipeline-registry-2026-06-04.json`

## Stop condition

- Hold packets until input/workset or boundary inputs change.
- rerun the four build/validate commands and the set validator on each packet update.

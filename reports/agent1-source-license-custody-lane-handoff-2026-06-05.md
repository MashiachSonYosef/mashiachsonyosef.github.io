# Agent 1 Source/License/Custody Lane Handoff - 2026-06-05

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE / Option C HYBRID`

## Runnable contracts and lane packets

- `orot_nc_klein`
  - source/contract artifacts: `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json`, `reports/agent1-spark1-pipeline-contract-orot-nc-klein-source-family-2026-06-04.json`
  - run/validate: `node scripts/build_agent1_orot_nc_klein_source_family_pipeline.mjs`, `node scripts/validate_agent1_orot_nc_klein_source_family_pipeline.mjs`, `node scripts/validate_agent1_spark1_orot_nc_klein_source_family_contract.mjs`
  - counts: `17 / 259`
  - lane split: `noncommercial_educational_candidate 17 / 259`
  - key flags: `derived_from_nc=true`, `commercial_export_allowed=false`, `attribution_required=true`, `corpus_contamination=false`, `agent6_boundary_required=true`
  - validator: ok (`spark1_routable=true`)

- `orot_next_missed_source_family`
  - source/contract artifacts: `reports/agent1-orot-next-missed-source-family-map-2026-06-04.json`, `reports/agent1-spark1-pipeline-contract-orot-next-missed-source-family-2026-06-04.json`
  - run/validate: `node scripts/build_agent1_orot_next_missed_source_family_pipeline.mjs`, `node scripts/validate_agent1_orot_next_missed_source_family_pipeline.mjs`, `node scripts/validate_agent1_spark1_orot_next_missed_source_family_contract.mjs`
  - counts: `50 / 1193`
  - lane split: `commercial_clean_candidate 50 / 1193`
  - validator: ok (`spark1_routable=true`)

- `orot_third_missed_source_family`
  - source/contract artifacts: `reports/agent1-orot-third-missed-source-family-map-2026-06-05.json`, `reports/agent1-spark1-pipeline-contract-orot-third-missed-source-family-2026-06-05.json`
  - run/validate: `node scripts/build_agent1_orot_third_missed_source_family_pipeline.mjs`, `node scripts/validate_agent1_orot_third_missed_source_family_pipeline.mjs`, `node scripts/validate_agent1_spark1_orot_third_missed_source_family_contract.mjs`
  - counts: `169 / 2148`
  - lane split: `commercial_clean_candidate 138 / 1672`, `blocked_or_needs_review 31 / 476`
  - blocker state: exact-workset blocker resolved into row-level packet; remaining boundary only (`agent6_boundary_required=true` on blocked rows)
  - validator: ok (`spark1_routable=true`)

- `old_dictionary_excluded_row_license_lane_reaudit`
  - source/contract artifacts: `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`, `reports/agent1-spark1-pipeline-contract-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`
  - run/validate: `node scripts/build_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`, `node scripts/validate_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`, `node scripts/validate_agent1_spark1_old_dictionary_reaudit_pipeline_contract.mjs`
  - counts: `500 / 8427`
  - lane split: `commercial_clean_candidate=3`, `noncommercial_educational_candidate=1`, `blocked_or_needs_review=1`
  - validator: ok (`spark1_routable=true`)

## Exact blockers to preserve

- `old_dictionary_excluded_row_license_lane_reaudit::bdb-augmented-strong`
  - missing evidence blocker (`222 / 4435`)
  - required fields missing: independent source/license evidence, source_url_or_citation, allowed fields
  - handoff owner: Agent 1 until evidence appears, then Agent 6 boundary if unresolved

- `old_dictionary_excluded_row_license_lane_reaudit::klein-dictionary`
  - boundary blocker (`214 / 4444`)
  - lane is `noncommercial_educational_candidate`
  - handoff owner: Agent 6 for exact boundary posture

- `third-missed-source-family-target-or-blocker`
  - legacy artifact `reports/agent1-third-missed-source-family-target-or-blocker-2026-06-04.json` still reports a missing_workset blocker shape mismatch
  - resolved by `reports/agent1-third-missed-source-family-target-or-blocker-resolution-2026-06-05.md` for row-level lane outputs

## Handoff owners

- Agent 10: consume all four runnable packet artifacts + contracts for release-package intake.
- Agent 6: boundary decisions for:
  - old-dictionary `bdb-augmented-strong`
  - `klein-dictionary` noncommercial boundary
  - `orot_third_missed_source_family` blocked rows
- Spark-1: rerun listed contract validators if any inputs change; no missing build/validator blocker for current packets.

## Compliance boundary

- No source/license acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, or NC commercial authorization claimed.

## Stop condition

- Hold packets now and rerun build/validate set only on input evidence changes or changed row/evidence counts.

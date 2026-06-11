# Agent 1 Source/License/Custody Missing-Blocker Capsule - 2026-06-05

Scope: Weekly lexicon expansion source-family boundary evidence handoff.

## Target 1 — Orot third-missed source-family

- map: `reports/agent1-orot-third-missed-source-family-map-2026-06-05.json`
- contract: `reports/agent1-spark1-pipeline-contract-orot-third-missed-source-family-2026-06-05.json`
- build command: `node scripts/build_agent1_orot_third_missed_source_family_pipeline.mjs`
- validate commands:
  - `node scripts/validate_agent1_orot_third_missed_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_spark1_orot_third_missed_source_family_contract.mjs`
- counts:
  - `169` rows / `2148` occ
  - lanes: `138/1672` commercial_clean_candidate, `31/476` blocked_or_needs_review, `0/0` noncommercial_educational_candidate, `0/0` metadata_or_link_only
- missing-blocker exact subsets:
  - reason `missing_lexicon_entry_id_in_input_row` (17 rows / 331 occ)
    - `tok-97b99c6afe4b`
    - `tok-4104e97f06f2`
    - `tok-3fcb5c8ebdd4`
    - `tok-2bb8d6f9c552`
    - `tok-62f0377497c9`
    - `tok-c68b190a1664`
    - `tok-0e09284cf9c6`
    - `tok-1eb755250719`
    - `tok-6adb62010da1`
    - `tok-8d841a3c9463`
    - `tok-16b6401a178f`
    - `tok-300d81e9b191`
    - `tok-4a107607d8ce`
    - `tok-819be7cee8fd`
    - `tok-123564ebcbac`
    - `tok-295b95c9aa61`
    - `tok-2a2bbb94e5ae`
  - reason `source_license_boundary_review_needed` (14 rows / 145 occ)
    - `tok-c3c61224118a`
    - `tok-6d3fee4cb833`
    - `tok-f3992c8b05fb`
    - `tok-f2725c8c9b37`
    - `tok-733d891c0a09`
    - `tok-151dd50ecca2`
    - `tok-56b00c8b7c40`
    - `tok-240da02ae730`
    - `tok-365a6de19dd7`
    - `tok-4b51da86c663`
    - `tok-af2678904a95`
    - `tok-be3a08118b74`
    - `tok-1b854daf0021`
    - `tok-37c4d88e63fc`
- exact blocker families requiring Agent 6 boundary support:
  - `OpenScriptures HebrewLexicon` (`CC_BY`)
  - `Wiktionary via Kaikki` (`CC_BY`)
  - `Project-authored abbreviation table` (`project-authored / cc0`)
- missing fields to clear 31/476:
  - exact row lexicon linkage IDs for `missing_lexicon_entry_id_in_input_row` rows
  - source/license boundary packet for CC_BY families and project-authored row class

## Target 2 — old-dictionary excluded-row re-audit

- map: `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`
- contract: `reports/agent1-spark1-pipeline-contract-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`
- build command: `node scripts/build_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`
- validate commands:
  - `node scripts/validate_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`
  - `node scripts/validate_agent1_spark1_old_dictionary_reaudit_pipeline_contract.mjs`
- counts:
  - `500` rows / `8427` occ
  - lane families: `3` commercial, `1` NC educational, `1` blocked
- exact blocked/sub-boundary families:
  - `old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary` (`Klein Dictionary`, `CC-BY-NC`, `214/4444`)  
    - lane: `noncommercial_educational_candidate`
    - flags: `derived_from_nc=true`, `commercial_export_allowed=false`, `attribution_required=true`, `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`, `corpus_contamination=false`
    - missing: Agent 6/public boundary before candidate text/display/storage/public/answer/export behavior
  - `old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong` (`BDB Augmented Strong`, `unresolved-independent-custody`, `222/4435`)  
    - lane: `blocked_or_needs_review`
    - flags: `derived_from_nc=false`, `commercial_export_allowed=false`, `attribution_required=false`, `corpus_contamination=false`
    - missing: independent source/license/custody basis, source URL/version, `license_label`, allow fields, Agent 6 boundary if evidence appears
- handoff owner:
  - Agent 10: consume runnable non-blocked families for transform/routing intake
  - Agent 6: boundary for the two rows/subsets above and all `orot_third_missed_source_family::blocked_or_needs_review` rows
- next command:
  - rerun build/validate on this workset only if source evidence or boundary packet updates.
- stop condition:
  - hold packets as-is; no downstream acceptance claims. Resume only if boundary/evidence changes.


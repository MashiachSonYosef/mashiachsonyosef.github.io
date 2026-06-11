# Agent 1 Source/License/Custody Boundary Handoff - 2026-06-05

## Target Workset State (current)

- Mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE / Option C HYBRID`
- Packet status: runnable packets exist; no runnable-blocking pipeline/script defects.
- Acceptance posture: no source/license/provenance acceptance, no QA/runtime/Definition/publication/data/answer acceptance.

## Target 1: `orot_third_missed_source_family`

- files
  - `reports/agent1-orot-third-missed-source-family-map-2026-06-05.json`
  - `reports/agent1-orot-third-missed-source-family-map-2026-06-05.md`
  - `reports/agent1-spark1-pipeline-contract-orot-third-missed-source-family-2026-06-05.json`
  - `reports/agent1-third-missed-source-family-target-or-blocker-resolution-2026-06-05.json`
- command/script
  - `node scripts/build_agent1_orot_third_missed_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_orot_third_missed_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_spark1_orot_third_missed_source_family_contract.mjs`
- schema/counts
  - candidate rows/occurrences: `169 / 2148`
  - commercial_clean_candidate: `138 / 1672`
  - noncommercial_educational_candidate: `0 / 0`
  - metadata_or_link_only: `0 / 0`
  - blocked_or_needs_review: `31 / 476`
- validator
  - map: `ok=true` (`reports/agent1-orot-third-missed-source-family-pipeline-validation-result-2026-06-05.json`)
  - contract: `ok=true`, `spark1_routable=true` (`reports/agent1-spark1-orot-third-missed-source-family-validation-result-2026-06-05.json`)
- blocker rows (exact)
  - `missing_lexicon_entry_id_in_input_row` — `17` rows / `331` occ
  - `source/license boundary review needed` (NC+export boundary/independent proof) — `14` rows / `145` occ
- exact blocked row IDs
  - missing_lexicon_entry_id_in_input_row:
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
  - source/license boundary review needed:
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
- missing evidence/blocker field(s) to Agent 6 boundary packet
  - exact lexicon linkage row IDs above with missing `lexicon_entry_id`.
  - source/license families that require boundary proof: `OpenScriptures HebrewLexicon`, `Wiktionary via Kaikki`, `Project-authored abbreviation table`.
- next command
  - no command change; rerun same build/validate only when upstream input or boundary decision changes.

## Target 2: `old_dictionary_excluded_row_license_lane_reaudit`

- files
  - `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`
  - `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.md`
  - `reports/agent1-spark1-pipeline-contract-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`
  - `reports/agent10-agent6-ready-old-dictionary-excluded-row-license-lane-reaudit-boundary-packet-2026-06-04.md`
  - `reports/agent10-agent6-ready-old-dictionary-excluded-row-license-lane-reaudit-boundary-packet-2026-06-04.json`
- command/script
  - `node scripts/build_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`
  - `node scripts/validate_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`
  - `node scripts/validate_agent1_spark1_old_dictionary_reaudit_pipeline_contract.mjs`
- schema/counts
  - source families: `5`
  - audited rows/occurrences: `500 / 8427`
  - lane family counts:
    - `commercial_clean_candidate: 3 families` (`Jastrow Dictionary`, `BDB Dictionary`, `BDB Aramaic Dictionary`)
    - `noncommercial_educational_candidate: 1 family` (`Klein Dictionary`)
    - `blocked_or_needs_review: 1 family` (`BDB Augmented Strong`)
- blocker families and exact row_subset IDs
  - `old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary` (`Klein Dictionary`, `CC-BY-NC`)
    - rows/occurrences: `214 / 4444`
    - lane: `noncommercial_educational_candidate`
    - exact missing: Agent 6/public boundary before candidate text/display/storage/public/answer/export behavior.
    - flags: `derived_from_nc=true`, `commercial_export_allowed=false`, `attribution_required=true`, `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`, `corpus_contamination=false`
  - `old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong` (`BDB Augmented Strong`, `unresolved-independent-custody`)
    - rows/occurrences: `222 / 4435`
    - lane: `blocked_or_needs_review`
    - exact missing evidence fields: independent source/license/custody basis, `source_url_or_citation`, `license_label`, allow fields; Agent 6 boundary if evidence appears.
    - flags: `derived_from_nc=false`, `commercial_export_allowed=false`, `attribution_required=false`, `corpus_contamination=false`
- validator
  - map: `ok=true`, status `agent1_old_dictionary_excluded_row_license_lane_reaudit_prepared_for_agent6_boundary_only`
  - contract: `ok=true`, `spark1_routable=true`

## Handoff and stop condition

- Agent 10: consume runnable packets + contracts for transform/routing intake (no acceptance claims).
- Agent 6: resolve exact boundary for
  - `old_dictionary_excluded_row_license_lane_reaudit::klein-dictionary` (NC lane boundary)
  - `old_dictionary_excluded_row_license_lane_reaudit::bdb-augmented-strong` (missing evidence + boundary)
  - `orot_third_missed_source_family` blocked rows (`agent6_boundary_required=true`).
- stop condition: hold packet as-is until one of: (a) missing boundary/evidence supplied, (b) upstream input row/occurrence change requires rebuild/re-validate.

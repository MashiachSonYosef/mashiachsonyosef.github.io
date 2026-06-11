# Agent 1 Weekly Source/License/Custody Lane Status - 2026-06-05

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE / Option C HYBRID`

## What is currently runnable

- Contracted/runnable Orot + old-dictionary packets are ready for Agent 10/Agent 6 boundary handoff.
- Exact runnable boundary-only open items remain in `agent6_boundary_required` fields.

## Packet: orot nc/klein educational
- `target`: `orot / nc_klein_source_family`
- `files`:
  - `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json`
  - `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.md`
  - `reports/agent1-spark1-pipeline-contract-orot-nc-klein-source-family-2026-06-04.json`
  - `reports/agent1-spark1-pipeline-contract-orot-nc-klein-source-family-validation-result-2026-06-04.json`
  - `reports/agent1-orot-nc-klein-source-family-pipeline-validation-result-2026-06-04.json`
- `command/script`:
  - `node scripts/build_agent1_orot_nc_klein_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_orot_nc_klein_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_spark1_orot_nc_klein_source_family_contract.mjs`
- `schema/counts`:
  - rows/occurrences: `17 / 259`
  - lane split: `noncommercial_educational_candidate=17/259`
  - policy flags: `derived_from_nc=true`, `commercial_export_allowed=false`, `attribution_required=true`, `corpus_contamination=false`, `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`, `answer_eligible=false`, `public_emit=false`
- `missing-field blockers`: none for the packet output
- `next command`: boundary routing only (NC educational lane)
- `handoff owner`: Agent 10 intake + Spark-1 rerun on package update; Agent 6 boundary on exact row/subset.

## Packet: orot next missed source-family
- `target`: `orot / next_missed_source_family`
- `files`:
  - `reports/agent1-orot-next-missed-source-family-map-2026-06-04.json`
  - `reports/agent1-orot-next-missed-source-family-map-2026-06-04.md`
  - `reports/agent1-spark1-pipeline-contract-orot-next-missed-source-family-2026-06-04.json`
  - `reports/agent1-spark1-pipeline-contract-orot-next-missed-source-family-validation-result-2026-06-04.json`
  - `reports/agent1-orot-next-missed-source-family-pipeline-validation-result-2026-06-04.json`
- `command/script`:
  - `node scripts/build_agent1_orot_next_missed_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_orot_next_missed_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_spark1_orot_next_missed_source_family_contract.mjs`
- `schema/counts`:
  - rows/occurrences: `50 / 1193`
  - lane split: `commercial_clean_candidate=50/1193`
- `missing-field blockers`: none for packet output
- `next command`: boundary routing only
- `handoff owner`: Agent 10 intake + Spark-1 rerun; Agent 6 boundary on export/storage confirmation.

## Packet: old-dictionary excluded-row reaudit
- `target`: `old-dictionary-excluded-row-license-lane-reaudit`
- `files`:
  - `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`
  - `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.md`
  - `reports/agent1-spark1-pipeline-contract-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`
  - `reports/agent1-spark1-pipeline-contract-old-dictionary-excluded-row-license-lane-reaudit-validation-result-2026-06-04.json`
  - `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-validation-result-2026-06-04.json`
- `command/script`:
  - `node scripts/build_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`
  - `node scripts/validate_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`
  - `node scripts/validate_agent1_spark1_old_dictionary_reaudit_pipeline_contract.mjs`
- `schema/counts`:
  - rows/occurrences: `500 / 8427`
  - lane split: `commercial_clean_candidate=3`, `noncommercial_educational_candidate=1`, `blocked_or_needs_review=1`, `metadata_or_link_only=0`
- `exact-row missing blockers`:
  - `klein-dictionary` -> missing approval posture (`agent6_boundary_required=true`) but all source fields present
  - `bdb-augmented-strong` -> missing independent source/license evidence, missing source URL/version, missing license label/allowed fields, and Agent 6 boundary
- `next command`: boundary routing only
- `handoff owner`: Agent 10 intake now; Agent 2 transform only after Agent 6 boundary decisions for allowed rows.

## Packet: orot third missed source-family
- `target`: `orot / third_missed_source_family`
- `files`:
  - `reports/agent1-orot-third-missed-source-family-map-2026-06-05.json`
  - `reports/agent1-orot-third-missed-source-family-map-2026-06-05.md`
  - `reports/agent1-spark1-pipeline-contract-orot-third-missed-source-family-2026-06-05.json`
  - `reports/agent1-orot-third-missed-source-family-pipeline-validation-result-2026-06-05.json`
  - `reports/agent1-spark1-pipeline-contract-orot-third-missed-source-family-validation-result-2026-06-05.json`
  - `reports/agent1-third-missed-source-family-target-or-blocker-resolution-2026-06-05.json`
- `command/script`:
  - `node scripts/build_agent1_orot_third_missed_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_orot_third_missed_source_family_pipeline.mjs`
  - `node scripts/validate_agent1_spark1_orot_third_missed_source_family_contract.mjs`
- `schema/counts`:
  - candidate rows/occurrences: `169 / 2148`
  - lane split: `commercial_clean_candidate=138/1672`, `noncommercial_educational_candidate=0/0`, `metadata_or_link_only=0/0`, `blocked_or_needs_review=31/476`
- `validator status`:
  - map validation: `ok=true`
  - contract validation: `ok=true`, `spark1_routable=true`
- `missing-field blockers`: none for existing packet output
- `remaining boundary blocker`: `agent6_boundary_required=true` for 31 blocked rows / 476 occurrences
- `next command`: await Agent 6 boundary output; rerun on change set.
- `handoff owner`: Agent 10 intake + Spark-1 rerun; Agent 6 for boundary packet.

## Aggregate status and handoff

- `agent10` consumes: four runnable contracts + map packets listed above for release-package intake.
- `agent6` consumes: exact boundary questions from `BDB Augmented Strong` and the `agent6_boundary_required=true` row subset rows from third-missed and prior Orot/old-dictionary outputs.
- `spark1` can rerun the runnable contracts directly; no build/validator work is currently blocked by missing script.

## exact blockers now

- No runnable-input blocker remains for `third_missed_source_family`.
- Boundary-only blockers remain:
  - `bdb-augmented-strong` evidence gap in old-dictionary reaudit.
  - `31` blocked rows in `third_missed_source_family` awaiting Agent 6 boundary posture.

## stop condition

- Hold this status after changed inputs; update only when source-family evidence counts or boundary decisions change.

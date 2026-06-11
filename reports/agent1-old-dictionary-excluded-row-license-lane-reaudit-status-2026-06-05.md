# Agent 1 Status: Old Dictionary Excluded-Row License-Lane Reaudit — 2026-06-05

## Target
- `old-dictionary-excluded-row-license-lane-reaudit`

## Source Files
- `reports/agent10-agent6-ready-old-dictionary-excluded-row-license-lane-reaudit-boundary-packet-2026-06-04.json`
- `reports/agent10-agent6-ready-old-dictionary-excluded-row-license-lane-reaudit-boundary-packet-2026-06-04.md`
- `data/control/agent_goal_board.json`
- `data/control/spark_standing_queue.json`
- `reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json`
- `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json`
- `reports/agent1-orot-next-missed-source-family-map-2026-06-04.json`
- `reports/agent6-orot-sefaria-nc-aware-family-boundary-final-verdict-2026-06-03.json`
- `reports/oracle9-dictionary-lane-classification-correction-2026-06-04.md`

## Command / Script to Run or Write
- `node scripts/build_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`
- `node scripts/validate_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`
- `node scripts/validate_agent1_spark1_old_dictionary_reaudit_pipeline_contract.mjs`
- `agent1-spark1-pipeline-contract-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`

## Output Artifact
- `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`
- `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.md`
- `reports/agent1-spark1-pipeline-contract-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`
- `reports/agent1-spark1-pipeline-contract-old-dictionary-excluded-row-license-lane-reaudit-validation-result-2026-06-04.json`
- `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-validation-result-2026-06-04.json`

## Schema / Counts
- `evidence_counts`: `500` audited rows / `8427` occurrences
- `public_domain_observed_rows`: `297` / `5747`
- `blocked_only_non_public_domain_or_unresolved_rows`: `17` / `259`
- `no_sefaria_hit_rows`: `186` / `2421`
- `lane_source_family_counts`:
  - `commercial_clean_candidate`: `3`
  - `noncommercial_educational_candidate`: `1`
  - `metadata_or_link_only`: `0`
  - `blocked_or_needs_review`: `1`
- `source_family_count`: `5`
- `zero_output_counts`: answer rows `0`, source rows `0`, public HUD rows `0`, route JSONL rows `0`, definition content rows `0`, accepted text rows `0`

## Required Row-Level Fields
- `source_family`
- `source_name`
- `license_label`
- `license_lane`
- `attribution_required`
- `derived_from_nc`
- `commercial_export_allowed`
- `source_url_or_citation`
- `agent6_boundary_required`
- `row_subset_id`
- `evidence_path`
- `corpus_contamination`

## Exact Missing-Field Blockers
- `old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary`
  - missing: `Agent 6/public boundary before any display/storage/public/answer/export behavior`
- `old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong`
  - missing: `independent source/license/custody basis`
  - missing: `source URL or version source`
  - missing: `license label and allowed fields`
  - missing: `Agent 6 boundary if evidence appears`

## Handoff
- Agent 2 may transform only rows/subsets with this packet and then only after applicable Agent 6 boundary.
- Agent 6 boundary requirement: exact row/subset behavior for Klein Dictionary and BDB Augmented Strong.
- Agent 10 consumes only classified packet candidates with no acceptance claims.

## Stop Condition
- For this workset: stop after validated contract+packet + missing blockers above.
- Third-missed source-family target remains `missing_workset_blocker` with no exact target rows; no runnable contract until upstream source-family/lane split evidence exists.

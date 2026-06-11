# Spark-1 Source-Lane Correction Run: old-dictionary-excluded-row-license-lane-reaudit

- Date: 2026-06-04
- Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE
- Scope: Spark-1 source-license/custody lane-correction run only (no acceptance claims)

## Commands run
1. `node scripts/build_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`
2. `node scripts/validate_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`

## Command result
- Build exit: 0
- Validate exit: 0
- Output artifacts:
  - `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`
  - `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.md`
  - `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-validation-result-2026-06-04.json`
- Packet status: `agent1_old_dictionary_excluded_row_license_lane_reaudit_prepared_for_agent6_boundary_only`
- Workset evidence counts: `500` rows / `8427` occurrences

## Required output shape

| source/dictionary | prior status | evidence file(s) | proposed lane | row/subset counts | NC flags (if applicable) | missing evidence | next command | handoff owner | stop condition |
|---|---|---|---|---|---|---|---|---|---|
| Jastrow Dictionary | old/excluded rows previously not Agent-1 lane-cleared for candidate text | `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json` | `commercial_clean_candidate` | 210 rows / 4474 occurrences | none | none | `Agent 2 may consume only after Agent 6 boundary if candidate text/package use is requested.` | Agent 1 for source/lane packet; Agent 6 for exact row/subset boundary | `agent6_boundary_required`
| BDB Dictionary | old/excluded rows previously not Agent-1 lane-cleared for candidate text | `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json` | `commercial_clean_candidate` | 221 rows / 4418 occurrences | none | none | `Agent 2 may consume only after Agent 6 boundary if candidate text/package use is requested.` | Agent 1 for source/lane packet; Agent 6 for exact row/subset boundary | `agent6_boundary_required`
| BDB Aramaic Dictionary | old/excluded rows previously not Agent-1 lane-cleared for candidate text | `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json` | `commercial_clean_candidate` | 69 rows / 2048 occurrences | none | none | `Agent 2 may consume only after Agent 6 boundary if candidate text/package use is requested.` | Agent 1 for source/lane packet; Agent 6 for exact row/subset boundary | `agent6_boundary_required`
| Klein Dictionary | old excluded/non-public-domain rows previously treated as blocked or unresolved in some downstream previews | `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json` | `noncommercial_educational_candidate` | 214 rows / 4444 occurrences | `derived_from_nc=true`; `commercial_export_allowed=false`; `attribution_required=true`; `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`; `corpus_contamination=false`; `answer_eligible=false`; `public_emit=false` | evidence: independent source/license/custody basis; citation/url fields remain in packet; transform blockers include missing custody and morphology evidence | `Agent 2 may consume only after Agent 6 boundary if candidate text/package use is requested.` | Agent 1 for source-lane packet; Agent 6 for exact NC boundary | `agent6_boundary_required`
| BDB Augmented Strong | old excluded / present-but-unused dictionary family | `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json` | `blocked_or_needs_review` | 222 rows / 4435 occurrences | none | independent source/license/custody basis; citation/url and source family proof requested if moved from review | `Return independent source/license/custody evidence before any Agent 2 candidate-text consumption.` | Agent 1 if evidence appears; otherwise held in blocked/review | `agent6_boundary_required`

## Blocker
- none for this run; exact mechanical blocker remains: do not route Agent 2 transform until Agent 1 lane assignment is boundary-cleared by Agent 6 for `old-dictionary-excluded-row-license-lane-reaudit`.

## Next continuable step
- Route packet + contract status through existing boundary lane: `agent1_old_dictionary_excluded_row_license_lane_reaudit_prepared_for_agent6_boundary_only` with stop condition `agent6_boundary_required`.

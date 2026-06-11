# Spark-2 report: spark2-broad-definition-pipeline-mechanics

- queue item: `spark2-broad-definition-pipeline-mechanics`
- mode: BROAD_CORPUS_EXPANSION
- run date: 2026-06-04

## exact inputs found
- `data/control/spark_standing_queue.json` (item id)
- `reports/agent7-broad-agent-spark-goals-2026-06-04.md`
- `reports/spark-2-state.md`
- `data/control/agent_goal_board.json`

## exact command list executed
1. `node scripts/build_agent2_orot_reader_hint_candidate_patch.mjs`
2. `node scripts/validate_agent2_orot_reader_hint_candidate_patch.mjs reports/agent2-orot-reader-hint-candidate-patch-2026-06-04.json`
3. `node scripts/build_agent2_orot_counterpart_hint_patch_preview.mjs`
4. `node scripts/validate_agent2_orot_counterpart_hint_patch_preview.mjs reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json`
5. `node scripts/build_orot_agent2_pilot_answer_claims.mjs`
6. `node scripts/validate_agent2_orot_pilot_answer_claims.mjs`
7. `node scripts/validate_agent2_orot_allowed_row_reader_hint_package_dry_run.mjs`

## command exit results
- cmd1 exit: `0`
  - output: `Orot reader-hint candidate patch complete (warn_candidate_patch_not_approved). Rows: 31; occurrences: 1202; report: reports/agent2-orot-reader-hint-candidate-patch-2026-06-04.md`
- cmd2 exit: `0`
  - output: `Agent 2 Orot reader-hint candidate patch validation passed for reports/agent2-orot-reader-hint-candidate-patch-2026-06-04.json.`
- cmd3 exit: `0`
  - output: `Orot counterpart hint patch preview complete (warn_candidate_patch_preview_not_approved). Rows: 31; occurrences: 1202; report: reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.md`
- cmd4 exit: `0`
  - output: `Agent 2 Orot counterpart hint patch preview validation passed for reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json.`
- cmd5 exit: `0`
  - output: JSON `{ "status": "zero_safe_output_blocker", ... }` with `json_report=reports/agent2-orot-pilot-answer-claims-2026-06-03.json`, `report=reports/agent2-orot-pilot-answer-claims-2026-06-03.md`, `top_blockers=[current_route_cards_are_non_answer(100), existing_cards_are_evidence_or_form_reference(100), missing_exact_upstream_definition_claim(100), missing_lexicon_entry_id(13), missing_orot_lexicon_entry(13), missing_orot_source_rows(13)]`
- cmd6 exit: `0`
  - output: `Agent 2 Orot pilot answer claims validation passed for reports/agent2-orot-pilot-answer-claims-2026-06-03.json.`
- cmd7 exit: `0`
  - output: `Agent 2 allowed-row reader-hint package dry-run validation passed for reports/agent2-orot-allowed-row-reader-hint-package-dry-run-2026-06-03.json.`

## observed / produced artifacts
- `reports/agent2-orot-reader-hint-candidate-patch-2026-06-04.md`
- `reports/agent2-orot-reader-hint-candidate-patch-2026-06-04.json`
- `reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.md`
- `reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json`
- `reports/agent2-orot-pilot-answer-claims-2026-06-03.md`
- `reports/agent2-orot-pilot-answer-claims-2026-06-03.json`
- `reports/agent2-orot-allowed-row-reader-hint-package-dry-run-2026-06-03.md`
- `reports/agent2-orot-allowed-row-reader-hint-package-dry-run-2026-06-03.json`

## counts / coverage (as exposed)
- reader-hint patch rows/occurrences: `31 / 1202`
- counterpart patch preview rows/occurrences: `31 / 1202`
- pilot answer emitted rows: `0` (status `zero_safe_output_blocker`)
- blocked rows: `100`
- blocked reasons (exact):
  - `current_route_cards_are_non_answer`
  - `existing_cards_are_evidence_or_form_reference`
  - `missing_exact_upstream_definition_claim`
  - `missing_lexicon_entry_id`
  - `missing_orot_lexicon_entry`
  - `missing_orot_source_rows`

## exact blocker
- missing_pipeline_blocker: no
- pipeline/input/schema missing: no

## next Agent-2 matching queue item
- `no_queued_item`
- wake condition: add next exact Spark-2 item in `data/control/spark_standing_queue.json` with explicit `pipeline_commands` and inputs

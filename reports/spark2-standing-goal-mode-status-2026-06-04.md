# Spark-2 Standing Goal Mode Status

- mode: `BROAD_CORPUS_EXPANSION`
- status: `awaiting_pipeline_contract` (after executing next runnable contract)

## Executed contracts in this cycle

### 1) `spark2-broad-definition-pipeline-mechanics`
- command set executed (all required)
  1. `node scripts/build_agent2_orot_reader_hint_candidate_patch.mjs` — exit 0
  2. `node scripts/validate_agent2_orot_reader_hint_candidate_patch.mjs reports/agent2-orot-reader-hint-candidate-patch-2026-06-04.json` — exit 0
  3. `node scripts/build_agent2_orot_counterpart_hint_patch_preview.mjs` — exit 0
  4. `node scripts/validate_agent2_orot_counterpart_hint_patch_preview.mjs reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json` — exit 0
  5. `node scripts/build_orot_agent2_pilot_answer_claims.mjs` — exit 0; status `zero_safe_output_blocker`
  6. `node scripts/validate_agent2_orot_pilot_answer_claims.mjs` — exit 0
  7. `node scripts/validate_agent2_orot_allowed_row_reader_hint_package_dry_run.mjs` — exit 0
- artifacts produced/updated:
  - `reports/agent2-orot-reader-hint-candidate-patch-2026-06-04.md`
  - `reports/agent2-orot-reader-hint-candidate-patch-2026-06-04.json`
  - `reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.md`
  - `reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json`
  - `reports/agent2-orot-pilot-answer-claims-2026-06-03.md`
  - `reports/agent2-orot-pilot-answer-claims-2026-06-03.json`
  - `reports/agent2-orot-pilot-answer-claims-2026-06-03.md`
  - `reports/agent2-orot-pilot-answer-claims-2026-06-03.json`
  - `reports/agent2-orot-allowed-row-reader-hint-package-dry-run-2026-06-03.md`
  - `reports/agent2-orot-allowed-row-reader-hint-package-dry-run-2026-06-03.json`
- counts surfaced:
  - reader-hint patch: `31` rows, `1202` occurrences
  - counterpart patch preview: `31` rows, `1202` occurrences
  - pilot answer builder: `emitted_answer_rows=0`, `blocked_rows=100`
  - blocked top reasons: `current_route_cards_are_non_answer`, `existing_cards_are_evidence_or_form_reference`, `missing_exact_upstream_definition_claim`, `missing_lexicon_entry_id`, `missing_orot_lexicon_entry`, `missing_orot_source_rows`
- report status: `warn_candidate_patch_not_approved` / `warn_candidate_patch_preview_not_approved`; zero-safe answer output.

### 2) `spark2-broad-definition-workbench-500-sample-refresh`
- command set executed
  1. `node scripts/build_definition_workbench_sample.mjs --limit=500 --output=data/definitions/definition-workbench-sample-500.json --report=reports/definition-workbench-sample-500-report.md` — exit 0
  2. `node scripts/validate_definition_workbench_sample.mjs data/definitions/definition-workbench-sample-500.json` — exit 0
  3. `git diff --check -- data/definitions/definition-workbench-sample-500.json reports/definition-workbench-sample-500-report.md` — exit 0
- generated artifacts:
  - `data/definitions/definition-workbench-sample-500.json`
  - `reports/definition-workbench-sample-500-report.md`
- counts:
  - `500` rows
  - `498` route cards
  - `2` missing route cards
  - `183` multi-answer
  - `498` complete_source_license

## status outcome
- latest exact blocker (for further Spark-2 progression): `awaiting_pipeline_contract`
- exact missing pipeline fields from `data/control/spark_standing_queue.json`:
  - `spark2_next_pipeline_sequence` expects agent-authored contract:
    - `reports/agent2-spark2-pipeline-contract-orot-missed-dictionary-reader-hints-2026-06-04.md`
    - `reports/agent2-spark2-pipeline-contract-orot-missed-dictionary-reader-hints-2026-06-04.json`
  - missing fields explicitly indicated: `builder` and `validator` (script and validator missing / non-runnable contract)

## wake trigger / next action
- wake when Agent 2 authors and returns the exact Spark-2 missed-dictionary reader-hint pipeline contract above (exact inputs, command/script, output path/schema, validator/gate), then run next bounded contract and report artifact/blocker.

# Spark-10 Hybrid Floor Release-Relevance Shadow — 2026-06-04

Mode: `BROAD_CORPUS_EXPANSION` with HYBRID split  
Status: `awaiting_changed_artifact`
Run: queued-item contract validated against latest changed-input availability check

| lane | latest checked artifact/blocker | release/package relevance | next Agent 10 action |
|---|---|---|---|
| Orot-hybrid | required queue inputs present: `reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json`, `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.md`, `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json`, `reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.md`, `reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.json`, `reports/agent6-broad-definition-workbench-500-sample-boundary-verdict-2026-06-04.md`; blocker remains: `reports/agent2-orot-missed-dictionary-reader-hint-candidate-package-2026-06-04.md` (missing), `reports/agent2-orot-missed-dictionary-reader-hint-candidate-package-2026-06-04.json` (missing) | 69 release-relevant rows from latest matrix snapshot | missing_changed_artifact_blocker; rerun contract upon exact arrival of both missing Orot candidate-package files |
| Deuteronomy-hybrid | required queue inputs present for this lane; blocker remains: `reports/agent2-deuteronomy-reader-hint-candidate-plan-2026-06-04.md` (missing), `reports/agent2-deuteronomy-reader-hint-candidate-plan-2026-06-04.json` (missing) | 69 release-relevant rows from latest matrix snapshot | missing_changed_artifact_blocker; rerun contract upon exact arrival of both missing Deuteronomy plan files |

## Run artifact

- matrix_json: `reports/spark10-release-package-intake-matrix-current-2026-06-04.json`
- matrix_md: `reports/spark10-release-package-intake-matrix-current-2026-06-04.md`
- commands:
  - `node scripts/build_spark10_release_package_intake.mjs --contract=reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json`
  - `node scripts/validate_spark10_release_package_intake.mjs reports/spark10-release-package-intake-matrix-current-2026-06-04.json`
  - `node scripts/validate_spark10_release_package-intake.mjs reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json`
  - `git diff --check -- reports/spark10-release-package-intake-matrix-current-2026-06-04.json reports/spark10-release-package-intake-matrix-current-2026-06-04.md`

Latest scan timestamp: 2026-06-04T15:25:04.7322843-04:00

Latest counts:
- inputs_checked: 169
- missing_required_inputs: 0
- release_relevant_rows: 69
- agent6_handoff_candidates: 0
- public_runtime_mutation_authorized: false
- answer_definition_release_authorized: false

Wake condition:
- Provide exact missing changed artifacts for Orot and Deuteronomy (`md/json` pairs above), then rerun exact contract commands.

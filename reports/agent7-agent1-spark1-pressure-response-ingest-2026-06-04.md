# Agent 7 Agent 1 / Spark-1 Pressure Response Ingest - 2026-06-04

Active mode: `BROAD_CORPUS_EXPANSION`

CEO mode: `HYBRID`

Status: `contracts_returned_with_exact_missing_script_validator_blockers`

| contract | present | runnable | missing fields | pressure target |
| --- | --- | --- | --- | --- |
| Orot NC/Klein educational source-family | `reports/agent1-spark1-pipeline-contract-orot-nc-klein-source-family-2026-06-04.md/json` | No | `scripts/build_agent1_orot_nc_klein_source_family_pipeline.mjs`; `scripts/validate_agent1_orot_nc_klein_source_family_pipeline.mjs` | Agent 1 authors scripts/validators or records exact blocker. |
| Orot next missed dictionary/source-family | `reports/agent1-spark1-pipeline-contract-orot-next-missed-source-family-2026-06-04.md/json` | No | `scripts/build_agent1_orot_next_missed_source_family_pipeline.mjs`; `scripts/validate_agent1_orot_next_missed_source_family_pipeline.mjs`; optional Agent 2 input `reports/agent2-orot-missed-dictionary-reader-hint-candidate-package-2026-06-04.json` if required | Agent 1 authors scripts/validators or records exact blocker; Agent 2 input remains separate if required. |
| Third missed dictionary/source-family | No exact workset | No | target rows/source family, inputs, command/script, output schema/path, validator/gate, license split, package owner, Agent 6 boundary, stop condition | Agent 1/Agent 10/Agent 13 supplies exact third workset or preserves `missing_workset_blocker`. |

## Staffing State

Spark-1 remains `awaiting_pipeline_contract` / non-runnable contract state.

Current Spark-1 thread for pressure checks: `019e92c1-89b1-7821-898b-2106638345cb`.

Do not wake Spark-1 to run these contracts until scripts/validators and all runnable fields exist.

NC posture remains explicit: `noncommercial_educational_candidate`, `derived_from_nc=true`, `commercial_export_allowed=false`, attribution required, `corpus_contamination=false`.

## Boundary

Staffing/control ingest only. No source/license acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, source mutation, token-index mutation, lexical-payload mutation, public reader output, or public/runtime mutation. Publication remains `blocked_no_render`.

# Agent 2 78-Row Transform-Output Proposal Blocker Validation

Generated: 2026-06-06T04:40:00.000Z

| Field | Value |
| --- | --- |
| target | `reports/agent2-old-dictionary-78-row-transform-output-proposal-missing-pipeline-blocker-2026-06-06.json` |
| validator | `scripts/validate_agent2_old_dictionary_78_row_transform_output_proposal_missing_pipeline_blocker.mjs` |
| command | `node scripts\validate_agent2_old_dictionary_78_row_transform_output_proposal_missing_pipeline_blocker.mjs reports\agent2-old-dictionary-78-row-transform-output-proposal-missing-pipeline-blocker-2026-06-06.json` |
| timeout | 120000 ms |
| timed_out | false |
| result | passed |
| stdout summary | Agent2 transform-output proposal missing-pipeline blocker validation passed. Rows: 78; occurrences: 1461; blocker: missing_transform_output_proposal_matrix_or_exact_transform_rule. |
| stop condition | Stop at `missing_pipeline_blocker`. No Definition authority, public/runtime mutation, answer acceptance, source-license/legal acceptance, accepted text, publication readiness, release action, commercial export authorization, candidate text, or definition/lemma/reader-hint content output. |

## Validated Blocker
- blocker: `missing_transform_output_proposal_matrix_or_exact_transform_rule`
- missing source field: `source_citation_or_url`
- missing transform rule fields: `proposed_candidate_text`, `proposed_definition_text`, `proposed_lemma_text`, `proposed_reader_hint_text`
- row-count mismatch: false
- rows / occurrences: 78 / 1461

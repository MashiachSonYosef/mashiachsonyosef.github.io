# Agent 4 Agent3 Row Lineage Matrix Gate Proof - 2026-06-06

## Target
Agent 3 old-dictionary candidate-use row lineage matrix.

## Changed input/artifact
`reports/agent3-old-dictionary-candidate-use-row-lineage-matrix-2026-06-06.json`

## Validator/proof command with timeout
`node --check scripts\validate_agent3_old_dictionary_candidate_use_row_lineage_matrix.mjs`

Timeout: 30000 ms.

Result: passed.

`node scripts\validate_agent3_old_dictionary_candidate_use_row_lineage_matrix.mjs --input=reports/agent3-old-dictionary-candidate-use-row-lineage-matrix-2026-06-06.json`

Timeout: 30000 ms.

Result: passed.

Output: `Agent 3 row lineage passed: rows=78 linked=78/78/78/78/78 gaps=0`

## Corrected command errors
`node scripts\validate_agent3_old_dictionary_candidate_use_row_lineage_matrix.mjs reports\agent3-old-dictionary-candidate-use-row-lineage-matrix-2026-06-06.json`

Timeout: 30000 ms.

Result: failed, corrected. The validator requires `--input=<path>` and rejects positional input.

`node - <<'NODE' ...`

Result: failed before Node ran. PowerShell does not support Unix heredoc syntax. Corrected with a PowerShell here-string piped to `node -`.

## Output artifact path
`reports/agent4-agent3-row-lineage-matrix-gate-proof-2026-06-06.json`

## Counts
- Row lineage rows / occurrences: 78 / 1461
- Linked continuity / source-RID / exact-subset / boundary-triage / split-closure rows: 78 / 78 / 78 / 78 / 78
- Missing lineage rows across those lanes: 0 / 0 / 0 / 0 / 0
- Pure + overlap closure: 5 + 73 = 78
- Pure + overlap occurrences: 58 + 1403 = 1461
- Blocker rows / source-family sets / lineage gaps: 4 / 4 / 0
- Source RID refs / unique / prefixes: 393 / 344 / 21
- Agent 2 queue pointer rows / handoff roles: 78 / 9
- Transform-ready / forbidden payload hits / acceptance claims: 0 / 0 / 0

## Result
Validated lineage matrix only.

This proof confirms the Agent3 row-lineage/navigation matrix is internally linked and preserves blockers. It does not authorize transform, route publication, source/license acceptance, answer selection, definition authority, accepted text, public/runtime mutation, or release action.

## Exact blockers preserved
- `commercial_clean_only_missing_future_agent6_candidate_use_boundary_and_morphology_relation`: 5 rows / 58 occurrences
- `commercial_clean_plus_blocked_overlap_missing_agent6_source_family_selection_boundary`: 8 rows / 164 occurrences
- `commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary`: 9 rows / 115 occurrences
- `triple_overlap_missing_agent6_source_family_selection_boundary`: 56 rows / 1124 occurrences

## Handoff owner
Agent 10 for release/package intake.

Agent 6 for candidate-use/source-family boundary decisions before any transform or route output.

## Stop condition
Use this row lineage matrix only to navigate candidate-use planning rows and exact blockers. Do not authorize transform, candidate text export, definition or lemma content, answer eligibility, route writes, source/license acceptance, QA acceptance, public/runtime mutation, accepted text, or release action.

## Non-acceptance boundary
No QA acceptance, public/runtime acceptance, source/provenance acceptance, license/legal acceptance, Definition authority, publication readiness, route publication support, product/data acceptance, answer acceptance, accepted gloss/text, or release action.

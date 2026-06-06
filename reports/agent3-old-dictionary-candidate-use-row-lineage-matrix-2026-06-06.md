# Agent 3 Old-Dictionary Candidate-Use Row Lineage Matrix

Generated: 2026-06-06T07:12:04.116Z

## Status

- Artifact: `agent3_old_dictionary_candidate_use_row_lineage_matrix`
- Status: `evidence-ready`
- Target: row-level lineage matrix for the 78 old-dictionary candidate-use rows across continuity, source-family, source-RID, exact-subset, triage, split-closure, and handoff packets
- Boundary: row lineage/navigation only; no transform, route publication, source/license acceptance, answer selection, definition authority, accepted text, public/runtime mutation, or release action.

## Counts

- Row lineage rows / occurrences: 78/1461
- Linked continuity/source-RID/exact-subset/triage/split rows: 78/78/78/78/78
- Missing lineage rows continuity/source-RID/exact-subset/triage/split: 0/0/0/0/0
- Pure + overlap closure: 5 + 73 = 78; occurrences 58 + 1403 = 1461
- Duplicate queue/token IDs: 0/0
- Source RID refs / unique / prefixes: 393/344/21
- Blocker rows / source-family sets / lineage gaps: 4/4/0
- Agent 2 queue pointer rows / handoff roles: 78/9
- Transform-ready / forbidden payload / acceptance claims: 0/0/0

## Blockers

| exact blocker | rows | occurrences | partitions |
|---|---:|---:|---|
| commercial_clean_only_missing_future_agent6_candidate_use_boundary_and_morphology_relation | 5 | 58 | pure_commercial_workset |
| commercial_clean_plus_blocked_overlap_missing_agent6_source_family_selection_boundary | 8 | 164 | overlap_workset |
| commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary | 9 | 115 | overlap_workset |
| triple_overlap_missing_agent6_source_family_selection_boundary | 56 | 1124 | overlap_workset |

## Stop Condition

Use this row lineage matrix only to navigate candidate-use planning rows and exact blockers. It does not authorize transform, candidate text export, definition or lemma content, answer eligibility, route writes, source/license acceptance, QA acceptance, public/runtime mutation, accepted text, or release action.

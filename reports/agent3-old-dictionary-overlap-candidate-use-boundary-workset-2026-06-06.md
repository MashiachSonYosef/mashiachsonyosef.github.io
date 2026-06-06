# Agent 3 Old-Dictionary Overlap Candidate-Use Boundary Workset

Generated: 2026-06-06T06:38:55.650Z

## Status

- Artifact: `agent3_old_dictionary_overlap_candidate_use_boundary_workset`
- Status: `evidence-ready`
- Target: NC and blocked-review overlap candidate-use boundary workset extracted from old-dictionary boundary triage navigation
- Boundary: overlap linkage/navigation workset only; no transform, route publication, source/license acceptance, answer selection, definition authority, accepted text, public/runtime mutation, or release action.

## Inputs

- Boundary triage navigation: `reports/agent3-old-dictionary-candidate-use-boundary-triage-navigation-2026-06-05.json`
- Exact-subset crossmatch: `reports/agent3-old-dictionary-candidate-use-exact-subset-crossmatch-2026-06-05.json`
- Source-RID continuity crossmatch: `reports/agent3-old-dictionary-candidate-use-source-rid-continuity-crossmatch-2026-06-05.json`

## Counts

- Workset rows / occurrences: 73/1403
- NC overlap rows / occurrences: 65/1239
- Blocked-review overlap rows / occurrences: 64/1288
- Triple-overlap rows / occurrences: 56/1124
- Source-family rows / source-family sets / bucket-family sets: 3/4/7
- Source-RID refs / unique / prefixes: 387/339/20
- Rows with Agent 1 RID metadata / missing RID metadata: 73/0
- Rows missing exact subset / missing family boundary links: 0/0
- Transform-ready rows / forbidden payload / acceptance claims: 0/0/0

## Triage Groups

| triage_group | rows | occurrences | source_family_sets | source_rid_refs | unique_source_rids |
|---|---:|---:|---:|---:|---:|
| commercial_clean_nc_overlap | 9 | 115 | 1 | 25 | 25 |
| commercial_clean_blocked_overlap | 8 | 164 | 2 | 54 | 47 |
| commercial_clean_nc_blocked_overlap | 56 | 1124 | 4 | 308 | 283 |

## Blockers

| exact_blocker | rows | occurrences | source_family_sets | source_rid_refs | status |
|---|---:|---:|---:|---:|---|
| commercial_clean_plus_blocked_overlap_missing_agent6_source_family_selection_boundary | 8 | 164 | 2 | 54 | exact_overlap_blocker_preserved_no_transform_authority |
| commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary | 9 | 115 | 1 | 25 | exact_overlap_blocker_preserved_no_transform_authority |
| triple_overlap_missing_agent6_source_family_selection_boundary | 56 | 1124 | 4 | 308 | exact_overlap_blocker_preserved_no_transform_authority |

## Stop Condition

Use this overlap workset as exact linkage/navigation evidence for source-family boundary review only. It does not authorize transform, candidate text export, definition or lemma content, answer eligibility, route writes, source/license acceptance, QA acceptance, public/runtime mutation, accepted text, or release action.

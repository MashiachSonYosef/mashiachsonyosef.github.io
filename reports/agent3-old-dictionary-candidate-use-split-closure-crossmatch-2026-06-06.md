# Agent 3 Old-Dictionary Candidate-Use Split Closure Crossmatch

Generated: 2026-06-06T06:47:15.862Z

## Status

- Artifact: `agent3_old_dictionary_candidate_use_split_closure_crossmatch`
- Status: `evidence-ready`
- Target: split closure crossmatch proving pure-commercial and overlap candidate-use worksets partition the 78-row old-dictionary triage packet
- Boundary: split closure/navigation only; no transform, route publication, source/license acceptance, answer selection, definition authority, accepted text, public/runtime mutation, or release action.

## Inputs

- Boundary triage navigation: `reports/agent3-old-dictionary-candidate-use-boundary-triage-navigation-2026-06-05.json`
- Pure commercial workset: `reports/agent3-old-dictionary-pure-commercial-candidate-use-boundary-workset-2026-06-05.json`
- Overlap workset: `reports/agent3-old-dictionary-overlap-candidate-use-boundary-workset-2026-06-06.json`

## Counts

- Triage rows / closure rows: 78/78
- Triage occurrences / closure occurrences: 1461/1461
- Pure rows / overlap rows: 5/73
- Missing / extra / duplicate queue IDs / cross-partition duplicate queue IDs: 0/0/0/0
- Source-RID refs / unique / shared across partitions: 393/344/1
- Rows with Agent 1 RID metadata / missing RID metadata: 78/0
- Transform-ready rows / forbidden payload / acceptance claims: 0/0/0

## Partitions

| partition | rows | occurrences | source_rid_refs | unique_source_rids | source_family_sets | blockers | status |
|---|---:|---:|---:|---:|---:|---:|---|
| pure_commercial_workset | 5 | 58 | 6 | 6 | 1 | 1 | agent6_candidate_use_boundary_required |
| overlap_workset | 73 | 1403 | 387 | 339 | 4 | 3 | agent6_source_family_selection_boundary_required |

## Blockers

| exact_blocker | rows | occurrences | partitions | triage_groups | status |
|---|---:|---:|---|---|---|
| commercial_clean_only_missing_future_agent6_candidate_use_boundary_and_morphology_relation | 5 | 58 | pure_commercial_workset | commercial_clean_only | exact_blocker_distribution_navigation_only_no_transform_authority |
| commercial_clean_plus_blocked_overlap_missing_agent6_source_family_selection_boundary | 8 | 164 | overlap_workset | commercial_clean_blocked_overlap | exact_blocker_distribution_navigation_only_no_transform_authority |
| commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary | 9 | 115 | overlap_workset | commercial_clean_nc_overlap | exact_blocker_distribution_navigation_only_no_transform_authority |
| triple_overlap_missing_agent6_source_family_selection_boundary | 56 | 1124 | overlap_workset | commercial_clean_nc_blocked_overlap | exact_blocker_distribution_navigation_only_no_transform_authority |

## Stop Condition

Use this closure crossmatch only to confirm split coverage and blocker distribution for Agent 10/Agent 6 review. It does not authorize transform, candidate text export, definition or lemma content, answer eligibility, route writes, source/license acceptance, QA acceptance, public/runtime mutation, accepted text, or release action.

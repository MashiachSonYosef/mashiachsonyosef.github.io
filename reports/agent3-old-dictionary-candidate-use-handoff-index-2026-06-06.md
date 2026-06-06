# Agent 3 Old-Dictionary Candidate-Use Handoff Index

Generated: 2026-06-06T06:59:11.734Z

## Status

- Artifact: `agent3_old_dictionary_candidate_use_handoff_index`
- Status: `evidence-ready`
- Target: Agent 3 handoff index for old-dictionary candidate-use linkage/navigation packets supporting Agent 10 and Agent 6 review
- Boundary: artifact discovery/navigation only; no transform, route publication, source/license acceptance, answer selection, definition authority, accepted text, public/runtime mutation, or release action.

## Counts

- Handoff entries / JSON / reports / validators: 9/9/9/9
- Candidate-use rows / occurrences: 78/1461
- Pure + overlap closure: 5 + 73 = 78; occurrences 58 + 1403 = 1461
- Closure missing / extra / duplicate queue IDs / cross-partition duplicate queue IDs: 0/0/0/0
- Source-RID refs / unique / shared across partitions: 393/344/1
- Entries with nonzero authority counters / forbidden payload / acceptance claims: 0/0/0

## Entries

| role | artifact | rows | occurrences | blockers | validator | status |
|---|---|---:|---:|---:|---|---|
| row_overlap_source_manifest_navigation | `reports/agent3-old-dictionary-row-overlap-linkage-matrix-2026-06-05.json` | 500 | 8427 | 6 | `scripts/validate_agent3_old_dictionary_row_overlap_linkage_matrix.mjs` | matched/evidence-ready |
| candidate_use_continuity_crossmatch | `reports/agent3-old-dictionary-candidate-use-continuity-crossmatch-2026-06-05.json` | 78 | 1461 | 5 | `scripts/validate_agent3_old_dictionary_candidate_use_continuity_crossmatch.mjs` | matched/evidence-ready |
| source_family_blocker_matrix | `reports/agent3-old-dictionary-candidate-use-source-family-blocker-matrix-2026-06-05.json` | 78 | 1461 | 3 | `scripts/validate_agent3_old_dictionary_candidate_use_source_family_blocker_matrix.mjs` | matched/evidence-ready |
| source_rid_continuity_crossmatch | `reports/agent3-old-dictionary-candidate-use-source-rid-continuity-crossmatch-2026-06-05.json` | 78 | 1461 | 0 | `scripts/validate_agent3_old_dictionary_candidate_use_source_rid_continuity_crossmatch.mjs` | matched/evidence-ready |
| exact_subset_crossmatch | `reports/agent3-old-dictionary-candidate-use-exact-subset-crossmatch-2026-06-05.json` | 78 | 1461 | 0 | `scripts/validate_agent3_old_dictionary_candidate_use_exact_subset_crossmatch.mjs` | matched/evidence-ready |
| boundary_triage_navigation | `reports/agent3-old-dictionary-candidate-use-boundary-triage-navigation-2026-06-05.json` | 78 | 1461 | 0 | `scripts/validate_agent3_old_dictionary_candidate_use_boundary_triage_navigation.mjs` | matched/evidence-ready |
| pure_commercial_boundary_workset | `reports/agent3-old-dictionary-pure-commercial-candidate-use-boundary-workset-2026-06-05.json` | 5 | 58 | 1 | `scripts/validate_agent3_old_dictionary_pure_commercial_candidate_use_boundary_workset.mjs` | matched/evidence-ready |
| overlap_boundary_workset | `reports/agent3-old-dictionary-overlap-candidate-use-boundary-workset-2026-06-06.json` | 73 | 1403 | 3 | `scripts/validate_agent3_old_dictionary_overlap_candidate_use_boundary_workset.mjs` | matched/evidence-ready |
| split_closure_crossmatch | `reports/agent3-old-dictionary-candidate-use-split-closure-crossmatch-2026-06-06.json` | 78 | 1461 | 4 | `scripts/validate_agent3_old_dictionary_candidate_use_split_closure_crossmatch.mjs` | matched/evidence-ready |

## Stop Condition

Use this index only to locate and verify Agent 3 linkage/navigation packets. It does not authorize transform, candidate text export, definition or lemma content, answer eligibility, route writes, source/license acceptance, QA acceptance, public/runtime mutation, accepted text, or release action.

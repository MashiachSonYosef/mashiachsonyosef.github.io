# Agent 3 Old-Dictionary Candidate-Use Exact-Subset Crossmatch

Generated: 2026-06-05T23:36:59.400Z

## Status

- Artifact: `reports/agent3-old-dictionary-candidate-use-exact-subset-crossmatch-2026-06-05.json`
- Status: `evidence-ready`
- Candidate rows / occurrences: 78 / 1461
- Matched to exact subset manifest: 78
- Commercial-clean only rows: 5
- Rows with NC overlap / blocked overlap / both: 65 / 64 / 56

## Exact Subsets

| subset | lanes | manifest rows | candidate rows | candidate occurrences | status |
|---|---|---:|---:|---:|---|
| commercial_clean_only | commercial_clean_candidate | 18 | 5 | 58 | exact_blocker_subset_boundary_preserved_for_candidate_rows |
| commercial_clean_plus_noncommercial_educational | commercial_clean_candidate, noncommercial_educational_candidate | 57 | 9 | 115 | exact_blocker_subset_boundary_preserved_for_candidate_rows |
| commercial_clean_plus_blocked_review | commercial_clean_candidate, blocked_or_needs_review | 82 | 8 | 164 | exact_blocker_subset_boundary_preserved_for_candidate_rows |
| commercial_clean_plus_noncommercial_educational_plus_blocked_review | commercial_clean_candidate, noncommercial_educational_candidate, blocked_or_needs_review | 140 | 56 | 1124 | exact_blocker_subset_boundary_preserved_for_candidate_rows |
| noncommercial_educational_only | noncommercial_educational_candidate | 17 | 0 | 0 | audit_only_no_candidate_rows_in_subset |
| blocked_review_only | blocked_or_needs_review | 0 | 0 | 0 | audit_only_no_candidate_rows_in_subset |
| metadata_or_link_only | metadata_or_link_only | 0 | 0 | 0 | audit_only_no_candidate_rows_in_subset |
| no_sefaria_source_hit | blocked_or_needs_review | 186 | 0 | 0 | audit_only_no_candidate_rows_in_subset |

## Boundary

- Exact subset membership/navigation evidence only.
- Overlap counts are warnings for downstream boundary routing, not transform permission.
- This matrix does not emit source text, candidate text, definitions, lemma content, reader hints, accepted text, answer rows, route writes, public/runtime changes, commercial export, or release actions.

## Stop Condition

Use this exact-subset crossmatch as membership/navigation evidence only. Do not transform, emit candidate text, definition/lemma/reader-hint content, answer rows, route writes, public/runtime mutations, accepted text, commercial export, or release action from this matrix.

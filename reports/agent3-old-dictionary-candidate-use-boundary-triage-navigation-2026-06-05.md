# Agent 3 Old-Dictionary Candidate-Use Boundary Triage Navigation

Generated: 2026-06-05T23:53:18.008Z

## Status

- Artifact: `agent3_old_dictionary_candidate_use_boundary_triage_navigation`
- Status: `evidence-ready`
- Target: candidate-use boundary triage navigation joining exact-subset membership, source-family blockers, and source-RID continuity
- Boundary: linkage/navigation triage only; no transform, route publication, source/license acceptance, answer selection, definition authority, accepted text, public/runtime mutation, or release action.

## Inputs

- Candidate-use package: `reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json`
- Exact-subset crossmatch: `reports/agent3-old-dictionary-candidate-use-exact-subset-crossmatch-2026-06-05.json`
- Source-family blocker matrix: `reports/agent3-old-dictionary-candidate-use-source-family-blocker-matrix-2026-06-05.json`
- Source-RID continuity crossmatch: `reports/agent3-old-dictionary-candidate-use-source-rid-continuity-crossmatch-2026-06-05.json`
- Commercial-clean boundary packet: `reports/agent10-agent6-ready-old-dictionary-commercial-clean-transform-enablement-boundary-packet-2026-06-05.json`

## Counts

- Candidate rows / occurrences: 78/1461
- Pure commercial-clean rows / occurrences: 5/58
- Overlap rows / occurrences: 73/1403
- NC overlap rows / occurrences: 65/1239
- Blocked-review overlap rows / occurrences: 64/1288
- Triple-overlap rows / occurrences: 56/1124
- Source family sets / bucket-family-set rows: 4/8
- Source-RID refs / unique RIDs: 393/344
- Pure commercial-clean source-RID refs / unique RIDs: 6/6
- Missing exact subset / missing Agent 1 RID metadata / missing boundary family links: 0/0/0
- Forbidden payload / acceptance claims: 0/0

## Triage Rows

| triage_group | rows | occurrences | source_family_sets | source_rid_refs | unique_source_rids | blocker_status |
|---|---:|---:|---:|---:|---:|---|
| commercial_clean_only | 5 | 58 | 1 | 6 | 6 | commercial_clean_only_boundary_candidate_not_transform_authority |
| commercial_clean_nc_overlap | 9 | 115 | 1 | 25 | 25 | nc_overlap_requires_agent6_source_family_selection_boundary |
| commercial_clean_blocked_overlap | 8 | 164 | 2 | 54 | 47 | blocked_review_overlap_requires_agent6_source_family_selection_boundary |
| commercial_clean_nc_blocked_overlap | 56 | 1124 | 4 | 308 | 283 | nc_and_blocked_overlap_requires_agent6_source_family_selection_boundary |

## Source Family Sets

| source_family_set | rows | occurrences | commercial_clean_only | overlap_rows | source_rid_refs | unique_source_rids |
|---|---:|---:|---:|---:|---:|---:|
| BDB Aramaic Dictionary + BDB Dictionary + Jastrow Dictionary | 21 | 616 | 0 | 21 | 161 | 128 |
| BDB Dictionary | 3 | 44 | 0 | 3 | 8 | 8 |
| BDB Dictionary + Jastrow Dictionary | 39 | 611 | 0 | 39 | 192 | 184 |
| Jastrow Dictionary | 15 | 190 | 5 | 10 | 32 | 32 |

## Stop Condition

Use this matrix as linkage/navigation triage only. It separates pure commercial-clean candidate-use rows from NC/blocked overlap rows, but it does not authorize transform, route publication, source/license acceptance, answer eligibility, definition text, accepted text, public/runtime mutation, or release action.

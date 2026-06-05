# Agent 3 Old-Dictionary Candidate-Use Source-Family Blocker Matrix

Generated: 2026-06-05T23:15:24.051Z

## Status

- Artifact: `reports/agent3-old-dictionary-candidate-use-source-family-blocker-matrix-2026-06-05.json`
- Status: `evidence-ready`
- Candidate rows / occurrences: 78 / 1461
- Source-family membership rows / occurrences: 159 / 3304
- Source families / source-family sets: 3 / 4
- Single-family / multi-family candidate rows: 18 / 60
- Exact blocker rows: 3

## Source Families

| source_family | candidate rows | occurrences | linked sample rows | unlinked sample rows | blocker |
|---|---:|---:|---:|---:|---|
| BDB Aramaic Dictionary | 21 | 616 | 7 | 14 | exact_blocker_missing_exact_agent1_agent6_boundary_fields |
| BDB Dictionary | 63 | 1271 | 11 | 52 | exact_blocker_missing_exact_agent1_agent6_boundary_fields |
| Jastrow Dictionary | 75 | 1417 | 19 | 56 | exact_blocker_missing_exact_agent1_agent6_boundary_fields |

## Source-Family Sets

| source_family_set | candidate rows | occurrences | linked sample rows | unlinked sample rows | blocker links |
|---|---:|---:|---:|---:|---:|
| BDB Aramaic Dictionary, BDB Dictionary, Jastrow Dictionary | 21 | 616 | 7 | 14 | 3 |
| BDB Dictionary | 3 | 44 | 0 | 3 | 1 |
| BDB Dictionary, Jastrow Dictionary | 39 | 611 | 4 | 35 | 2 |
| Jastrow Dictionary | 15 | 190 | 8 | 7 | 1 |

## Boundary

- Navigation/dedupe evidence only.
- Membership occurrence counts intentionally duplicate candidate rows when a row belongs to multiple source families.
- This matrix does not emit source text, candidate text, definitions, lemma content, reader hints, accepted text, answer rows, route writes, public/runtime changes, commercial export, or release actions.

## Stop Condition

Use this matrix only to distinguish unique candidate rows from duplicated source-family memberships and blocker rows. Do not emit candidate text, definition/lemma/reader-hint content, answer rows, route writes, public/runtime mutations, accepted text, commercial export, or release action from this matrix.

# Agent 1 State Addendum - Source-Family Overlap Matrix - 2026-06-05

production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner

Hebrew import/source/license/custody/source-lane evidence | source-family overlap matrix for old-dictionary reaudit | `reports/agent1-old-dictionary-source-family-overlap-matrix-2026-06-05.json`; validator `scripts/validate_agent1_old_dictionary_source_family_overlap_matrix.mjs` -> `reports/agent1-old-dictionary-source-family-overlap-matrix-validation-result-2026-06-05.json` | commercial-clean overlap with NC/blocked families still requires Agent 6 source-family selection boundary | stop before Agent 6 delivery, Agent 2 transform, candidate text, source/license/legal acceptance, Definition/runtime/publication/product/answer acceptance, queue mutation, render mutation, staging, or release action | current Agent 1 `019e975d-dc9f-7020-a7c8-885d083a837e`; old Agent 1 archived/do-not-use

target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition

`old-dictionary-excluded-row-license-lane-reaudit source-family overlap matrix` | `reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json`; `reports/agent1-old-dictionary-source-family-membership-manifest-2026-06-05.json`; `reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json` | 5 source families; 10 pairwise intersections; 13 exact combinations; exact combinations cover 500 rows / 8427 occurrences; commercial-internal pair rows 252; commercial+NC pair rows 362; commercial+blocked pair rows 425; NC+blocked pair rows 140 | `commercial_clean_candidate`; `noncommercial_educational_candidate`; `metadata_or_link_only`; `blocked_or_needs_review` | overlap rows require Agent 6 source-family selection boundary; Klein remains NC; BDB Augmented Strong remains blocked/review; no-source-family-hit rows lack source evidence | Agent 2 blocked until exact lane evidence plus Agent 6 boundary; Agent 6 future boundary owner; Agent 10 package assembly only | zero Agent 6 delivery, zero transform rows, zero candidate-text rows, zero release route

Proof:

- Source-family overlap matrix validator result is `ok: true` as of `2026-06-05T13:46:00.911Z`.
- Pairwise matrix preserves 10 intersections and 23 exact blocker records.
- Exact family combinations cover all 500 preview rows / 8427 occurrences.
- Klein-bearing intersections preserve `noncommercial_educational_candidate`; BDB Augmented Strong intersections preserve `blocked_or_needs_review`.
- No QA, source/license/legal, Definition, runtime, publication, product, answer, accepted gloss/text, NC commercial authorization, queue, staging, render, or release acceptance is claimed.

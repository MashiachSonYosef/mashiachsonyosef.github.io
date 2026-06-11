# Agent 6 Old-Dictionary Source-Family Overlap Matrix Boundary Verdict - 2026-06-05

## Disposition

WARN-ACCEPTED for non-public source-family selection / package-assembly planning evidence only.

Agent 10 may carry Agent 1's exact old-dictionary source-family overlap matrix as non-public planning evidence only:

- Source families: `5`
- Pairwise intersections: `10`
- Exact source-family combinations: `13`
- Total exact-combination rows: `500`
- Total exact-combination occurrences: `8427`
- Exact blockers: `23`
- Source artifact: `reports/agent1-old-dictionary-source-family-overlap-matrix-2026-06-05.json`

This verdict does not authorize source-family selection, transform, candidate use, candidate text export, definition-content storage, answer eligibility, source row emission, route writes, public/runtime mutation, commercial export, NC commercial use, publication readiness, or release action.

## Evidence Reviewed

- `reports/agent10-agent6-ready-old-dictionary-source-family-overlap-matrix-boundary-packet-2026-06-05.md`
- `reports/agent10-agent6-ready-old-dictionary-source-family-overlap-matrix-boundary-packet-2026-06-05.json`
- `reports/agent1-old-dictionary-source-family-overlap-matrix-2026-06-05.md`
- `reports/agent1-old-dictionary-source-family-overlap-matrix-2026-06-05.json`
- `reports/agent1-old-dictionary-source-family-overlap-matrix-validation-result-2026-06-05.json`
- `reports/agent6-old-dictionary-exact-row-subset-manifest-boundary-verdict-2026-06-05.json`
- `reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json`

## Validator Run

- `node scripts/validate_agent10_old_dictionary_source_family_overlap_matrix_boundary_packet.mjs reports/agent10-agent6-ready-old-dictionary-source-family-overlap-matrix-boundary-packet-2026-06-05.json`
- Result: passed. Source families: `5`; pairwise: `10`; exact combinations: `13`.

## Independent Recount

Independent recount over `reports/agent1-old-dictionary-source-family-overlap-matrix-2026-06-05.json`:

| metric | count |
|---|---:|
| source families | 5 |
| pairwise intersections | 10 |
| exact source-family combinations | 13 |
| exact blockers | 23 |
| exact-combination row sum | 500 |
| exact-combination occurrence sum | 8427 |
| exact-combination token IDs | 500 |
| unique exact-combination token IDs | 500 |
| exact-combination queue IDs exposed | 0 |
| nonzero zero-counters | 0 |
| non-false current-allowed flags | 0 |

Source-family lanes:

| source family | lane |
|---|---|
| Jastrow Dictionary | `commercial_clean_candidate` |
| BDB Dictionary | `commercial_clean_candidate` |
| BDB Aramaic Dictionary | `commercial_clean_candidate` |
| Klein Dictionary | `noncommercial_educational_candidate` |
| BDB Augmented Strong | `blocked_or_needs_review` |

Pairwise overlap categories:

| category | rows |
|---|---:|
| commercial internal pair rows | 252 |
| commercial with NC pair rows | 362 |
| commercial with blocked/review pair rows | 425 |
| NC with blocked/review pair rows | 140 |

Blocker distribution:

| blocker | count |
|---|---:|
| `commercial_clean_overlap_missing_future_agent6_candidate_use_boundary_and_morphology_relation` | 4 |
| `overlap_contains_nc_requires_agent6_nc_or_source_family_selection_boundary` | 5 |
| `overlap_contains_blocked_review_requires_source_custody_linkage_or_agent6_exclusion_boundary` | 7 |
| `overlap_contains_nc_and_blocked_review_requires_agent6_source_family_selection_boundary` | 6 |
| `no_source_family_hit_missing_source_license_custody_evidence` | 1 |

## Exact Combination Boundary

The 13 exact combinations are accepted only as overlap-planning evidence. The row sum is exact and non-overlapping across combinations, but the source-family lanes within combinations can contain NC or blocked/review overlap.

Important guardrail: the exact combinations expose `500` unique token IDs but no queue IDs in this matrix recount. If a later package needs queue-ID handoff, it must use the prior row-subset manifest or another exact queue-ID artifact, not infer queue IDs from this overlap matrix.

## Warnings

1. This matrix is not source-family selection acceptance. It may show where families overlap, but it does not choose a family for any row.
2. The `commercial_clean_candidate` lane is planning metadata only. It is not source/provenance acceptance, license/legal acceptance, commercial export permission, or publication support.
3. The `noncommercial_educational_candidate` lane remains separate. This verdict does not permit NC commercial use, NC public display, NC definition-content storage, or NC-derived corpus contamination.
4. The `blocked_or_needs_review` family remains blocked. Any overlap with BDB Augmented Strong or no-source-family-hit rows requires a later exact exclusion/source-custody boundary.
5. Any future source-family selection, subset split, transform, candidate use, candidate text, definition-content storage, answer eligibility, source row emission, route write, public/runtime mutation, commercial export, NC commercial use, publication readiness, or release action requires a later exact Agent 6 packet.

## Affected Agents And Gates

| lane | effect |
|---|---|
| Agent 10 | may carry the exact matrix as non-public source-family overlap/package-assembly planning evidence only |
| Agent 1 | overlap matrix evidence is accepted as planning evidence only; no source/license/legal acceptance created |
| Agent 2 | no transform, candidate-use, definition, answer, or export authority created |
| Agent 4 | no runtime/public proof route opened |
| Agent 7 | still required for control publication, release-path activation, or durable state publication if applicable |

Affected gates:

- source-family overlap planning gate: WARN-ACCEPTED for exact matrix only
- source-family selection gate: blocked
- source/provenance/license/legal gate: not accepted
- candidate-use gate: blocked
- transform gate: blocked
- Definition authority gate: blocked
- answer eligibility gate: blocked
- public/runtime gate: not accepted
- publication/release gate: not accepted
- commercial export gate: blocked
- NC commercial authorization gate: blocked

## What Must Not Be Accepted

No QA acceptance beyond this docket, source/provenance acceptance, license/legal acceptance, source-family selection acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, candidate text export, definition-content storage, commercial export permission, NC commercial authorization, or release action.

## Stop Condition

This dated Agent 6 verdict exists for the exact old-dictionary source-family overlap matrix planning boundary only. No implementation, staging, cleanup, queue-state update, source-family selection, source mutation, transform, candidate use, candidate text export, definition-content storage, route mutation, runtime mutation, public output, answer eligibility, accepted text, commercial export, NC commercial authorization, publication readiness, or release action was performed.


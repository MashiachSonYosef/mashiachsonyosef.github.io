# Agent 6 Old-Dictionary Exact Row-Subset Manifest Boundary Verdict - 2026-06-05

## Disposition

WARN-ACCEPTED for non-public source-lane / row-subset planning evidence only.

Agent 10 may carry Agent 1's exact old-dictionary row-subset manifest as non-public planning evidence for future package assembly only:

- Subset manifests: `8`
- Total rows represented: `500`
- Total occurrences represented: `8427`
- Exact row source: `reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json`
- Exact row fields: `subset_manifests[].token_ids` and `subset_manifests[].queue_ids`

This verdict does not authorize transform, candidate use, candidate text export, definition-content storage, source row emission, answer eligibility, public/runtime mutation, route writes, accepted text, commercial export, NC commercial use, publication readiness, or release action.

## Evidence Reviewed

- `reports/agent10-agent6-ready-old-dictionary-exact-row-subset-manifest-boundary-packet-2026-06-05.md`
- `reports/agent10-agent6-ready-old-dictionary-exact-row-subset-manifest-boundary-packet-2026-06-05.json`
- `reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json`
- `reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.md`
- `reports/agent1-old-dictionary-exact-row-subset-manifest-validation-result-2026-06-05.json`
- `reports/agent1-old-dictionary-row-overlap-lane-boundary-2026-06-05.json`
- `reports/agent1-old-dictionary-row-overlap-agent6-boundary-supplement-2026-06-05.json`

## Validator Run

- `node scripts/validate_agent10_old_dictionary_exact_row_subset_manifest_boundary_packet.mjs reports/agent10-agent6-ready-old-dictionary-exact-row-subset-manifest-boundary-packet-2026-06-05.json`
- Result: passed. Rows: `500`; occurrences: `8427`; subsets: `8`.

## Independent Recount

Independent recount over `reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json`:

| metric | count |
|---|---:|
| subset manifests | 8 |
| row sum | 500 |
| occurrence sum | 8427 |
| token IDs | 500 |
| unique token IDs | 500 |
| duplicate token IDs | 0 |
| queue IDs | 500 |
| unique queue IDs | 500 |
| duplicate queue IDs | 0 |
| token hash mismatches | 0 |
| subset count mismatches | 0 |
| nonzero zero-counters | 0 |

Lane presence is non-exclusive because overlap buckets carry more than one lane:

| lane | row presence count |
|---|---:|
| `commercial_clean_candidate` | 297 |
| `noncommercial_educational_candidate` | 214 |
| `blocked_or_needs_review` | 408 |
| `metadata_or_link_only` | 0 |

## Subset Disposition

| bucket | rows | occurrences | disposition | blocker preserved |
|---|---:|---:|---|---|
| `commercial_clean_only` | 18 | 494 | WARN-ACCEPTED as manifest planning evidence only | `commercial_clean_only_missing_future_agent6_candidate_use_boundary_and_morphology_relation` |
| `commercial_clean_plus_noncommercial_educational` | 57 | 818 | WARN-ACCEPTED as manifest planning evidence only | `commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary` |
| `commercial_clean_plus_blocked_review` | 82 | 1068 | WARN-ACCEPTED as manifest planning evidence only | `commercial_clean_plus_blocked_overlap_missing_agent6_source_family_selection_boundary` |
| `commercial_clean_plus_noncommercial_educational_plus_blocked_review` | 140 | 3367 | WARN-ACCEPTED as manifest planning evidence only | `triple_overlap_missing_agent6_source_family_selection_boundary` |
| `noncommercial_educational_only` | 17 | 259 | WARN-ACCEPTED as manifest planning evidence only | `nc_educational_only_missing_agent6_nc_boundary_no_commercial_authorization` |
| `blocked_review_only` | 0 | 0 | WARN-ACCEPTED as empty manifest bucket only | `blocked_review_only_zero_rows_no_current_boundary_delivery` |
| `metadata_or_link_only` | 0 | 0 | WARN-ACCEPTED as empty manifest bucket only | `metadata_or_link_only_zero_rows_no_current_boundary_delivery` |
| `no_sefaria_source_hit` | 186 | 2421 | WARN-ACCEPTED as blocked manifest planning bucket only | `no_sefaria_source_hit_missing_source_license_custody_evidence` |

## Warnings

1. This is a row-subset manifest boundary only. It preserves row identity and lane labels for planning, but it is not source/provenance acceptance, license/legal acceptance, source-family selection, or candidate-use clearance.
2. Overlap buckets are not clean commercial export lanes. Any mixed commercial-clean plus NC or blocked/review subset requires a later exact Agent 6 source-family selection boundary before use.
3. The `noncommercial_educational_candidate` lane remains separate. This verdict does not authorize NC commercial use, NC public display, NC definition-content storage, or NC-derived corpus contamination.
4. The `no_sefaria_source_hit` bucket remains blocked for source/license/custody use until exact source evidence exists.
5. Future Agent 10 package assembly may reference this manifest for row IDs and lane buckets only. Any transform, candidate-use, candidate text, definition-content storage, answer eligibility, source row emission, route write, public/runtime mutation, commercial export, NC commercial use, publication readiness, or release action requires a later exact Agent 6 packet.

## Affected Agents And Gates

| lane | effect |
|---|---|
| Agent 10 | may carry the exact manifest for future non-public package assembly planning only |
| Agent 1 | manifest row/subset evidence is accepted as planning evidence only; no source/license/legal acceptance created |
| Agent 2 | no transform, candidate-use, definition, lemma, reader-hint, answer, or export authority created |
| Agent 4 | no runtime/public proof route opened |
| Agent 7 | still required for control publication, release-path activation, or durable state publication if applicable |

Affected gates:

- row-subset manifest planning gate: WARN-ACCEPTED for exact manifest only
- source/provenance/license/legal gate: not accepted
- source-family selection gate: blocked for overlap buckets
- candidate-use gate: blocked
- transform gate: blocked
- Definition authority gate: blocked
- answer eligibility gate: blocked
- public/runtime gate: not accepted
- publication/release gate: not accepted
- commercial export gate: blocked
- NC commercial authorization gate: blocked

## What Must Not Be Accepted

No QA acceptance beyond this docket, source/provenance acceptance, license/legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, candidate text export, definition-content storage, commercial export authorization, NC commercial authorization, or release action.

## Stop Condition

This dated Agent 6 verdict exists for the exact `8` subset / `500` row / `8427` occurrence old-dictionary manifest planning boundary only. No implementation, staging, cleanup, queue-state update, source mutation, transform, candidate use, candidate text export, definition-content storage, route mutation, runtime mutation, public output, answer eligibility, accepted text, commercial export, NC commercial authorization, publication readiness, or release action was performed.


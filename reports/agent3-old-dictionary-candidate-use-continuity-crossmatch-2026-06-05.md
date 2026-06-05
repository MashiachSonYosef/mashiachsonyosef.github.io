# Agent 3 Old-Dictionary Candidate-Use Continuity Crossmatch

Generated: 2026-06-05T22:57:36.398Z

## Status

- Artifact: `reports/agent3-old-dictionary-candidate-use-continuity-crossmatch-2026-06-05.json`
- Status: `evidence-ready`
- Rows / occurrences: 78 / 1461
- Row-overlap sample linked / unlinked: 19 / 59
- Source-family blocker link rows / links: 78 / 159
- Duplicate queue IDs / token IDs: 0 / 0
- Agent 10 current blocker present: 1

## Inputs Inspected

- row_overlap_matrix: `reports/agent3-old-dictionary-row-overlap-linkage-matrix-2026-06-05.json`
- row_overlap_verdict: `reports/agent6-old-dictionary-row-overlap-linkage-matrix-verdict-2026-06-05.json`
- candidate_use_package: `reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json`
- candidate_use_verdict: `reports/agent6-old-dictionary-candidate-use-package-boundary-verdict-2026-06-05.json`
- transform_blocker: `reports/agent2-old-dictionary-transform-reaudit-boundary-blocker-2026-06-05.json`
- agent10_refresh: `reports/agent10-direct-release-package-intake-refresh-2026-06-05q.json`

## Boundary

- This packet is linkage/navigation evidence only.
- It carries queue IDs, token IDs, lexicon entry IDs, source-family labels, source RID counts/samples, row-overlap sample links, and blocker pointers.
- It does not carry candidate text, source text, definition content, lemma content, reader hints, accepted text, answer eligibility, route writes, public/runtime changes, commercial export, or release action.

## Counts

| field | value |
|---|---:|
| candidate_use_rows | 78 |
| candidate_use_occurrences | 1461 |
| agent2_package_rows | 78 |
| agent2_package_occurrences | 1461 |
| agent6_verdict_package_rows | 78 |
| agent6_verdict_package_occurrences | 1461 |
| unique_queue_ids | 78 |
| duplicate_queue_ids | 0 |
| unique_token_ids | 78 |
| duplicate_token_ids | 0 |
| source_family_values_observed | 3 |
| source_family_blocker_families | 3 |
| rows_with_source_family_blocker_links | 78 |
| source_family_blocker_links | 159 |
| row_overlap_sample_index_tokens | 115 |
| row_overlap_sample_linked_rows | 19 |
| row_overlap_sample_unlinked_rows | 59 |
| row_overlap_sample_linked_occurrences | 802 |
| row_overlap_sample_unlinked_occurrences | 659 |
| row_overlap_sample_status_values | 2 |
| transform_blocker_rows | 5 |
| commercial_clean_candidate_rows | 78 |
| noncommercial_educational_candidate_rows | 0 |
| exact_after_mark_strip_rows | 78 |
| agent2_morphology_relation_approved_rows | 78 |
| morphology_blocked_rows_excluded | 219 |
| agent10_current_exact_blockers | 1 |
| candidate_text_rows | 0 |
| definition_content_rows | 0 |
| lemma_content_rows | 0 |
| reader_hint_content_rows | 0 |
| answer_rows | 0 |
| answer_eligible_rows | 0 |
| public_emit_rows | 0 |
| route_jsonl_rows | 0 |
| route_shard_writes | 0 |
| public_runtime_mutation | 0 |
| release_actions | 0 |
| source_text_rows | 0 |
| accepted_text_rows | 0 |
| route_payload_field_hits | 0 |
| forbidden_payload_field_hits | 0 |
| acceptance_claims | 0 |

## Sample Rows

| queue_id | token_id | occurrences | families | row-overlap sample status | blocker links |
|---|---|---:|---|---|---:|
| agent2-orot-gap-tok-1b76a9f88fc7 | tok-1b76a9f88fc7 | 102 | BDB Aramaic Dictionary, BDB Dictionary, Jastrow Dictionary | sample_linked_to_row_overlap_bucket | 3 |
| agent2-orot-gap-tok-cf9427570b0a | tok-cf9427570b0a | 97 | BDB Aramaic Dictionary, BDB Dictionary, Jastrow Dictionary | sample_linked_to_row_overlap_bucket | 3 |
| agent2-orot-gap-tok-1bfe6fea9d85 | tok-1bfe6fea9d85 | 64 | BDB Dictionary, Jastrow Dictionary | sample_linked_to_row_overlap_bucket | 2 |
| agent2-orot-gap-tok-3fc615d98aec | tok-3fc615d98aec | 63 | BDB Aramaic Dictionary, BDB Dictionary, Jastrow Dictionary | sample_linked_to_row_overlap_bucket | 3 |
| agent2-orot-gap-tok-b9470f18041a | tok-b9470f18041a | 62 | BDB Dictionary, Jastrow Dictionary | sample_linked_to_row_overlap_bucket | 2 |
| agent2-orot-gap-tok-16b3c5cb6ffe | tok-16b3c5cb6ffe | 60 | BDB Aramaic Dictionary, BDB Dictionary, Jastrow Dictionary | sample_linked_to_row_overlap_bucket | 3 |
| agent2-orot-gap-tok-c3803c6fde17 | tok-c3803c6fde17 | 57 | BDB Aramaic Dictionary, BDB Dictionary, Jastrow Dictionary | sample_linked_to_row_overlap_bucket | 3 |
| agent2-orot-gap-tok-1282c4d855bc | tok-1282c4d855bc | 55 | BDB Dictionary, Jastrow Dictionary | sample_linked_to_row_overlap_bucket | 2 |
| agent2-orot-gap-tok-589103867952 | tok-589103867952 | 46 | BDB Dictionary, Jastrow Dictionary | sample_linked_to_row_overlap_bucket | 2 |
| agent2-orot-gap-tok-3e2962a4fa72 | tok-3e2962a4fa72 | 44 | BDB Aramaic Dictionary, BDB Dictionary, Jastrow Dictionary | sample_linked_to_row_overlap_bucket | 3 |
| agent2-orot-gap-tok-2a3aa32e04a0 | tok-2a3aa32e04a0 | 42 | BDB Dictionary, Jastrow Dictionary | not_in_row_overlap_sample_index | 2 |
| agent2-orot-gap-tok-158f1752a1df | tok-158f1752a1df | 39 | Jastrow Dictionary | sample_linked_to_row_overlap_bucket | 1 |
| agent2-orot-gap-tok-0a04ca1d499c | tok-0a04ca1d499c | 30 | BDB Aramaic Dictionary, BDB Dictionary, Jastrow Dictionary | not_in_row_overlap_sample_index | 3 |
| agent2-orot-gap-tok-3f06a5f8337c | tok-3f06a5f8337c | 27 | BDB Dictionary | not_in_row_overlap_sample_index | 1 |
| agent2-orot-gap-tok-294be776e38a | tok-294be776e38a | 25 | BDB Dictionary, Jastrow Dictionary | not_in_row_overlap_sample_index | 2 |
| agent2-orot-gap-tok-8fb44ba631ca | tok-8fb44ba631ca | 24 | BDB Dictionary, Jastrow Dictionary | not_in_row_overlap_sample_index | 2 |
| agent2-orot-gap-tok-017227aa7bde | tok-017227aa7bde | 23 | BDB Aramaic Dictionary, BDB Dictionary, Jastrow Dictionary | sample_linked_to_row_overlap_bucket | 3 |
| agent2-orot-gap-tok-56693093a95f | tok-56693093a95f | 21 | BDB Aramaic Dictionary, BDB Dictionary, Jastrow Dictionary | not_in_row_overlap_sample_index | 3 |
| agent2-orot-gap-tok-97b1bacd102d | tok-97b1bacd102d | 21 | BDB Dictionary, Jastrow Dictionary | not_in_row_overlap_sample_index | 2 |
| agent2-orot-gap-tok-17ba65351831 | tok-17ba65351831 | 18 | Jastrow Dictionary | sample_linked_to_row_overlap_bucket | 1 |

## Stop Condition

Use this as nonpublic linkage/navigation evidence only. Do not emit candidate text, definition/lemma/reader-hint content, answer rows, route writes, public/runtime mutations, accepted text, commercial export, or release action from this crossmatch.

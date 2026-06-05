# Agent 3 Old-Dictionary Row-Overlap Linkage Matrix

Generated: 2026-06-05T16:56:29.692Z

Status: evidence-ready. This is nonpublic linkage/dedupe/navigation planning evidence only.

## Counts

| metric | count |
|---|---:|
| bucket_rows | 8 |
| nonzero_bucket_rows | 6 |
| zero_bucket_rows | 2 |
| represented_rows | 500 |
| represented_occurrences | 8427 |
| agent1_audited_rows | 500 |
| agent1_audited_occurrences | 8427 |
| agent6_total_rows_represented | 500 |
| agent6_total_occurrences_represented | 8427 |
| agent10_boundary_missing | 1 |
| rows_with_agent6_verdict_bucket | 8 |
| rows_with_boundary_question | 8 |
| rows_with_agent2_lane_pointers | 5 |
| sample_token_ids | 115 |
| unique_sample_token_ids | 115 |
| duplicate_sample_token_ids | 0 |
| duplicate_row_subset_ids | 0 |
| source_family_pointer_rows | 17 |
| exact_blocker_rows | 6 |
| audit_zero_row_records | 2 |
| allowed_transform_rows_now | 0 |
| candidate_text_rows_now | 0 |
| definition_content_rows_now | 0 |
| answer_rows_now | 0 |
| public_hud_rows_now | 0 |
| route_jsonl_rows_now | 0 |
| agent6_delivery_now | 0 |
| queue_mutation_count | 0 |
| render_mutation_count | 0 |
| staging_count | 0 |
| release_actions | 0 |
| source_text_read | 0 |
| route_payload_field_hits | 0 |
| forbidden_authority_field_hits | 0 |
| acceptance_claims | 0 |
| public_runtime_mutations | 0 |

## Rows

| bucket | rows | occurrences | lanes | source-family pointers | sample tokens | duplicate sample tokens | status | blocker |
|---|---:|---:|---|---:|---:|---:|---|---|
| commercial_clean_only | 18 | 494 | commercial_clean_candidate | 3 | 18 | 0 | exact_blocker_candidate_use_boundary_and_morphology_required | commercial_clean_only_missing_future_agent6_candidate_use_boundary_and_morphology_relation |
| commercial_clean_plus_noncommercial_educational | 57 | 818 | commercial_clean_candidate, noncommercial_educational_candidate | 4 | 20 | 0 | exact_blocker_nc_overlap_source_family_selection_required | commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary |
| commercial_clean_plus_blocked_review | 82 | 1068 | commercial_clean_candidate, blocked_or_needs_review | 4 | 20 | 0 | exact_blocker_blocked_source_family_overlap_boundary_required | commercial_clean_plus_blocked_overlap_missing_agent6_source_family_selection_boundary |
| commercial_clean_plus_noncommercial_educational_plus_blocked_review | 140 | 3367 | commercial_clean_candidate, noncommercial_educational_candidate, blocked_or_needs_review | 5 | 20 | 0 | exact_blocker_blocked_source_family_overlap_boundary_required | triple_overlap_missing_agent6_source_family_selection_boundary |
| noncommercial_educational_only | 17 | 259 | noncommercial_educational_candidate | 1 | 17 | 0 | exact_blocker_nc_boundary_required | nc_educational_only_missing_agent6_nc_boundary_no_commercial_authorization |
| blocked_review_only | 0 | 0 | blocked_or_needs_review | 0 | 0 | 0 | audit_zero_row_record | blocked_review_only_zero_rows_no_current_boundary_delivery |
| metadata_or_link_only | 0 | 0 | metadata_or_link_only | 0 | 0 | 0 | audit_zero_row_record | metadata_or_link_only_zero_rows_no_current_boundary_delivery |
| no_sefaria_source_hit | 186 | 2421 | blocked_or_needs_review | 0 | 20 | 0 | exact_blocker_missing_source_lane_evidence | no_sefaria_source_hit_missing_source_license_custody_evidence |

## Boundary

- No candidate use, transform, Definition authority, usage-as-definition authority, answer selection, source/license acceptance, QA acceptance, public/runtime mutation, publication readiness, or accepted gloss/text.
- The JSON carries token IDs, lexicon IDs, source-family pointers, blockers, and dedupe keys only; it does not carry candidate text or source text.

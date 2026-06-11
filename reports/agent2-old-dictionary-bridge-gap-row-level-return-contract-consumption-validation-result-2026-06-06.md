# Agent2 Row-Level Return Contract Consumption Validation Result (2026-06-06)

## target
Old-dictionary bridge-gap direct source-RID row-level return contract consumption.

## files used
- `reports/agent2-old-dictionary-bridge-gap-row-level-return-contract-consumption-2026-06-06.json`
- `scripts/validate_agent2_old_dictionary_bridge_gap_row_level_return_contract_consumption.mjs`

## validator result
- command: `node scripts\validate_agent2_old_dictionary_bridge_gap_row_level_return_contract_consumption.mjs reports\agent2-old-dictionary-bridge-gap-row-level-return-contract-consumption-2026-06-06.json`
- timeout: `120000ms`
- process_timeout: `false`
- result: `passed`
- stdout: `Agent2 row-level return contract consumption validation passed. Contract rows: 3; occurrences: 42; Agent10 row-level consumed rows: 0.`

## lane counts/rows consumed
- contract_rows: 3
- contract_occurrences: 42
- agent10_return_contract_rows: 3
- agent1_agent2_return_contract_rows: 3
- queue_scope_dedupe_contract_rows: 1
- ref_gap_contract_rows: 1
- exact_rid_scope_contract_rows: 1
- agent10_return_field_cells: 21
- agent1_agent2_return_field_cells: 27
- row_level_downstream_gap_rows: 3
- agent10_broad_context_rows: 3
- agent10_row_level_consumed_rows: 0
- source_citation_or_url_present_rows: 0
- transform_rule_still_blocked_rows: 3
- A07 approval route rows: 3
- A06 evidence owner rows: 3
- A06 approval requested rows: 0
- source_text_rows: 0
- definition_authority_rows: 0
- answer_selection_rows: 0
- accepted_text_rows: 0
- release_actions: 0

## contract rows
- `P00280`: `queue_scope_dedupe_required`, return field `queue_scope_dedupe_resolution_or_exact_duplicate_blocker`
- `M00032`: `source_citation_ref_gap_resolution_required`, return field `ref_gap_source_citation_resolution_or_exact_missing_citation_blocker`
- `E00687`: `exact_rid_scope_required`, return field `exact_rid_scope_resolution_or_exact_scope_blocker`

## exact blockers
- `owner_action_row_has_broad_context_but_no_row_level_downstream_consumption`
- `direct_source_citation_prereq_matched_but_source_citation_or_url_missing`
- `missing_queue_scope_dedupe_resolution_for_duplicate_source_rid_locator`
- `missing_source_citation_resolution_for_zero_ref_gap_source_rid`
- `missing_exact_rid_scope_for_multi_rid_custody_row`
- `missing_source_field::source_citation_or_url`
- `missing_transform_output_proposal_matrix_or_exact_transform_rule`
- `missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text`
- `approval_request_misrouted_to_A06`
- `A06_output_is_evidence_ready_only_until_A07_approval`

## handoff owner
Agent10 returns row-level consumption or exact non-consumption blocker. Agent1/Agent2 return source-citation or owner-action resolution/blockers. A07 owns approval. A06 remains evidence-only.

## stop condition
Stop at validated row-level return contract consumption. No source text, candidate text, definition/lemma/reader-hint content, answer eligibility, route writes, A06 approval request, source/license/legal/Definition/product/answer/accepted-text acceptance, repo cleanup action, public/runtime mutation, export, publication readiness, or release action.

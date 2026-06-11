# Agent2 Row-Level Return Contract Consumption (2026-06-06)

## target
Old-dictionary bridge-gap direct source-RID row-level return contract consumption.

## files used
- `reports/agent2-old-dictionary-bridge-gap-blocker-worksets-consumption-validation-result-2026-06-06.json`
- `reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-downstream-gap-crossmatch-2026-06-06.json`
- `reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-row-level-return-contract-2026-06-06.json`

## route correction preserved
- A07: approval, SOP, final validation, release gate.
- A06: evidence, validators, repo-cleaning production evidence only.
- A06 outputs are evidence-ready until A07 approves where required.
- Do not ask A06 for approval.

## lane counts/rows consumed
- input_downstream_gap_rows: 3
- contract_rows: 3
- contract_occurrences: 42
- unique_source_rids: 3
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

## required Agent10 return fields
`queue_id`, `source_rid`, `owner_action_kind`, `row_level_consumption_artifact_or_exact_nonconsumption_blocker`, `consumed_agent3_gap_artifact`, `downstream_owner_next_step`, `approval_route_owner`.

## required Agent1/Agent2 return fields
Base fields: `queue_id`, `source_rid`, `source_citation_or_url_or_exact_missing_source_citation_blocker`, `owner_action_resolution_or_exact_blocker`, `transform_blocked_until_prereqs_clear`, `no_source_license_acceptance_claim`, `no_definition_or_answer_claim`, `approval_route_owner`.

Action-specific fields:
- `P00280`: `queue_scope_dedupe_resolution_or_exact_duplicate_blocker`
- `M00032`: `ref_gap_source_citation_resolution_or_exact_missing_citation_blocker`
- `E00687`: `exact_rid_scope_resolution_or_exact_scope_blocker`

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
- Agent10: return row-level package-intake consumption artifact or exact non-consumption blocker for each contract row.
- Agent1/Agent2: return `source_citation_or_url` or exact missing-source blocker plus owner-action resolution or exact blocker.
- A07: approval, SOP, final validation, release gate where required.
- A06: evidence/validator production only; do not ask A06 for approval.
- Agent2: no transform-output proposal matrix until row-level return contract blockers and exact transform-rule blocker are cleared.

## stop condition
Stop at row-level return contract consumption. No source text, candidate text, definition/lemma/reader-hint content, answer eligibility, route writes, A06 approval request, source/license/legal/Definition/product/answer/accepted-text acceptance, repo cleanup action, public/runtime mutation, export, publication readiness, or release action.

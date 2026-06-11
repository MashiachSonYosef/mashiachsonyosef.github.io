# Agent2 Bridge-Gap A07/A06 Route Overlay Consumption (2026-06-06)

## target
Old-dictionary bridge-gap A07/A06 route overlay consumption for Agent2 transform readiness.

## files used
- `reports/agent2-a07-approval-route-correction-2026-06-06.json`
- `reports/agent4-agent2-a07-approval-route-correction-gate-proof-2026-06-06.json`
- `reports/agent3-old-dictionary-candidate-use-bridge-gap-a07-a06-route-overlay-2026-06-06.json`
- `reports/agent4-changed-input-selection-after-selector-a07-boundary-contract-sweep-gate-2026-06-06.json`
- `reports/agent2-old-dictionary-78-row-no-new-transform-input-blocker-after-agent4-gate-validation-result-2026-06-06.json`

## route correction consumed
- A07: approval, SOP, final validation, release gate.
- A06: evidence, validators, repo-cleaning production evidence only.
- A06 outputs are evidence-ready until A07 approves where approval is required.
- Do not ask A06 for approval.
- Existing validated words are preserved; redo only changed or flagged rows.

## lane counts/rows consumed
- overlay_rows: 14
- overlay_occurrences: 173
- source_rid_route_links: 30
- unique_source_rids: 30
- direct_source_citation_workset_rows: 5
- direct_source_citation_workset_occurrences: 58
- A06 evidence-boundary workset rows: 9
- A06 evidence-boundary workset occurrences: 115
- source_citation_or_url_present_links: 0
- source_citation_or_url_missing_links: 30
- transform_rule_still_blocked_links: 30
- A07 approval route rows: 14
- A06 evidence-validator-only rows: 14
- A06 approval requested rows: 0
- candidate_text_rows: 0
- definition_content_rows: 0
- lemma_content_rows: 0
- reader_hint_content_rows: 0
- answer_eligible_rows: 0
- route_shard_writes: 0
- source_text_rows: 0
- accepted_text_rows: 0
- public_runtime_mutation: 0
- publication_or_release_claims: 0
- release_actions: 0

## downstream worksets
- `a06_evidence_boundary_prereq_workset`: 9 rows, 115 occurrences, 25 source RID links. A06 remains evidence/validator production only; A07 owns approval where required.
- `direct_source_citation_prereq_workset`: 5 rows, 58 occurrences, 5 source RID links. Agent1/Agent10 still own citation/transform-rule input; A07 owns approval where required.

## exact blockers
- `a07_route_overlay_a06_evidence_boundary_prereq_still_blocked_no_a06_approval`
- `a07_route_overlay_direct_source_citation_prereq_still_blocked`
- `approval_request_misrouted_to_A06`
- `A06_output_is_evidence_ready_only_until_A07_approval`
- `missing_source_field::source_citation_or_url`
- `missing_transform_output_proposal_matrix_or_exact_transform_rule`
- `missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text`
- `next_transform_output_or_candidate_text_boundary_not_supplied`
- `stale_agent1_registry_target_current_agent1_thread_required`

## handoff owner
- A07: approval, SOP, final validation, and release gate.
- A06: evidence, validators, and repo-cleaning production evidence only.
- Agent1: source-citation return where direct `source_citation_or_url` is required.
- Agent10: release/package intake and transform-rule routing after source-lane evidence changes.
- Agent2: transform readiness only after source-lane evidence and exact transform rule exist; non-authoritative until A07 approval where required.

## stop condition
Stop at route-overlay consumption. No source text, candidate text, definition/lemma/reader-hint content, answer eligibility, route writes, A06 approval request, source/license/legal/Definition/product/answer/accepted-text acceptance, repo cleanup action, public/runtime mutation, export, publication readiness, or release action.

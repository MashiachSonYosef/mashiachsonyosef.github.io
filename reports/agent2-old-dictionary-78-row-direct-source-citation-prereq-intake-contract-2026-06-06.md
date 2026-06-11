# Agent 2 Direct Source-Citation Prerequisite Intake Contract (2026-06-06)

## target
`old-dictionary-commercial-clean-78-row-direct-source-citation-prereq-intake`

## files used
- `reports/agent3-old-dictionary-candidate-use-direct-source-citation-prereq-matrix-2026-06-06.json`
- `reports/agent3-old-dictionary-candidate-use-source-citation-prefix-matrix-2026-06-06.json`
- `reports/agent4-changed-input-selection-after-direct-source-citation-sweep-2026-06-06.json`
- `reports/agent2-old-dictionary-78-row-agent3-source-citation-crossmatch-consumption-2026-06-06.json`
- `reports/agent2-old-dictionary-78-row-agent3-source-citation-crossmatch-consumption-validation-result-2026-06-06.json`

## lane counts/rows consumed
- parent_rows: 78
- parent_occurrences: 1461
- direct_rows: 5
- direct_occurrences: 58
- source_license_lane: `commercial_clean_candidate`
- triage_group: `commercial_clean_only`
- source_family: `Jastrow Dictionary`
- unique_source_rids: 5
- unique_source_rid_prefixes: 5
- source_citation_required_rows: 5
- source_citation_or_url_present_rows: 0
- source_citation_or_url_missing_rows: 5
- transform_rule_still_blocked_rows: 5
- source_family_selection_boundary_blocker_rows: 0
- candidate_text_rows: 0
- definition_content_rows: 0
- lemma_content_rows: 0
- reader_hint_content_rows: 0
- answer_eligible_rows: 0
- route_shard_writes: 0
- source_text_rows: 0
- accepted_text_rows: 0
- public_runtime_mutation: 0
- export_rows: 0
- release_actions: 0

## required Agent1 return fields
For each of the 5 direct rows: `queue_id`, `token_id`, `lexicon_entry_id`, `source_rid`, `source_rid_prefix`, `source_family`, `source_license_lane`, `source_citation_or_url`, `citation_basis`, `source_acceptance_claimed`, `agent6_boundary_required`.

## direct identifier rows
- `M00032` | `agent2-orot-gap-tok-d29b2c27700e` | 18 occurrences | Jastrow Dictionary
- `P00280` | `agent2-orot-gap-tok-126d54d64a8c` | 13 occurrences | Jastrow Dictionary
- `E00687` | `agent2-orot-gap-tok-e50370ece8ba` | 11 occurrences | Jastrow Dictionary
- `U00063` | `agent2-orot-gap-tok-d6cbb8ff849c` | 9 occurrences | Jastrow Dictionary
- `I00126` | `agent2-orot-gap-tok-f14e3500010d` | 7 occurrences | Jastrow Dictionary

## exact blockers
- `missing_source_field::source_citation_or_url`
- `missing_transform_output_proposal_matrix_or_exact_transform_rule`
- `missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text`
- `next_transform_output_or_candidate_text_boundary_not_supplied`
- `stale_agent1_registry_target_current_agent1_thread_required`

## handoff owner
- Agent 1: return `source_citation_or_url` for the 5 direct identifier rows or exact missing-source blocker.
- Agent 10: consume any Agent1 return and supply exact transform rule before returning to Agent2.
- Agent 2: no text proposal matrix until citation and transform-rule blockers are cleared.
- Agent 6: no transform-output review until a validated Agent2 matrix exists.

## output artifact path
`reports/agent2-old-dictionary-78-row-direct-source-citation-prereq-intake-contract-2026-06-06.json`

## stop condition
Stop at direct source-citation prerequisite intake. This artifact stores identifiers only and does not store surfaces, normalized forms, source text, candidate text, definition/lemma/reader-hint content, answer eligibility, route writes, source/license/legal acceptance, accepted text, public/runtime mutation, export, publication readiness, or release action.

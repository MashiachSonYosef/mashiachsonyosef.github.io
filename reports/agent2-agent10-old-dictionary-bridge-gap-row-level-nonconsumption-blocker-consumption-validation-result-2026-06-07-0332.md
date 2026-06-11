# Agent2 Agent10 Nonconsumption Consumption Validation (2026-06-07 03:32Z)

## target
Validate `reports/agent2-agent10-old-dictionary-bridge-gap-row-level-nonconsumption-blocker-consumption-2026-06-07-0332.json`.

## validator
- `scripts/validate_agent2_agent10_old_dictionary_bridge_gap_row_level_nonconsumption_blocker_consumption.mjs`

## command
- `node scripts\validate_agent2_agent10_old_dictionary_bridge_gap_row_level_nonconsumption_blocker_consumption.mjs reports\agent2-agent10-old-dictionary-bridge-gap-row-level-nonconsumption-blocker-consumption-2026-06-07-0332.json`
- timeout: 120000 ms
- process_timeout: false

## result
- passed: true
- output: `Agent2 Agent10 row-level nonconsumption consumption validation passed. Contract rows: 3; Agent10 nonconsumption rows: 3; transform rows: 0.`

## validated counts
- contract_rows: 3
- contract_occurrences: 42
- agent10_contract_consumed_as_blocker_rows: 3
- agent10_row_level_text_consumed_rows: 0
- source_citation_or_url_present_rows: 0
- transform_rule_present_rows: 0
- transform_rule_still_blocked_rows: 3
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
- acceptance_claims: 0

## route correction
- A07 remains approval/SOP/final validation/release gate owner.
- A06 remains evidence/validator production owner only.
- A06 outputs are evidence-ready only until A07 approval where required.
- No approval request was routed to A06.

## blocker update
- Removed stale blocker: `missing_agent10_row_level_consumption_after_contract`.
- Preserved blocker: `agent10_row_level_nonconsumption_blocker_consumed_not_transform_input`.

## stop condition
Validation receipt only. No Definition/public/runtime/answer/source-license/legal/product/QA/accepted-text acceptance, no transform output, no route writes, no export, no publication readiness, no release action.

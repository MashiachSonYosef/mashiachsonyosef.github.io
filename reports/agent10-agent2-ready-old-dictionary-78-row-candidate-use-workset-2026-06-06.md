# Agent 10 -> Agent 2 Old-Dictionary 78-Row Candidate-Use Workset

Generated: 2026-06-06T00:42:00Z

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`

## Target Package

`old-dictionary-commercial-clean-78-row-candidate-use-preboundary-workset`

## Files Used

| file | role |
|---|---|
| `reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json` | source matrix for the selected morphology-approved rows |
| `reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json` | source-family lane handoff |
| `reports/agent10-old-dictionary-commercial-clean-source-family-morphology-coverage-summary-current.json` | Agent 10 current coverage summary |
| `reports/agent10-direct-release-package-intake-refresh-2026-06-06a.json` | latest Agent 10 blocker/action state |

## Selected Boundary

Selection rule:

- `preview_relation_class == exact_after_mark_strip`
- `agent2_morphology_relation_status == agent2_morphology_relation_approved_for_nonpublic_planning`
- `license_lane == commercial_clean_candidate`, as preserved through the Agent 1 source-family handoff

Expected selected rows: `78`

Expected selected occurrences: `1461`

Source/license lane: `commercial_clean_candidate`

Current use status: non-public planning evidence only; no transform/candidate-use approval yet.

## Agent 2 Required Output

Agent 2 should produce a compact preboundary candidate-use matrix with:

`queue_id | token_id | lexicon_entry_id | surface | normalized | occurrences | source_family_hits | public_domain_headwords | public_domain_rids | license_lane | preview_relation_class | morphology_relation_status | intended_candidate_use | candidate_text_rows_now | definition_candidate_rows_now | lemma_candidate_rows_now | reader_hint_candidate_rows_now | answer_eligible_rows_now | public_emit_rows_now | route_writes | accepted_text_rows | exact_agent6_question`

Required `intended_candidate_use` value:

`candidate_use_preboundary_review_only_no_text_emission`

Required zero counters:

- `candidate_text_rows_now=0`
- `definition_candidate_rows_now=0`
- `lemma_candidate_rows_now=0`
- `reader_hint_candidate_rows_now=0`
- `answer_eligible_rows_now=0`
- `public_emit_rows_now=0`
- `route_writes=0`
- `accepted_text_rows=0`

## Agent 6 Boundary Question To Prepare

Pass/warn/block whether the exact `78` row / `1461` occurrence commercial-clean old-dictionary subset may be carried from non-public morphology planning evidence into a non-public candidate-use preboundary review matrix only, preserving zero candidate text, zero definition/lemma/reader-hint content rows, zero answer eligibility, zero public emit, zero route writes, zero accepted text, and no release/public/runtime mutation.

## Exact Blocker If Agent 2 Cannot Produce It

Return `missing_pipeline_blocker` with the exact missing input, selector, output schema field, validator, or row-count mismatch.

## Next Owner

Agent 2 produces the preboundary matrix or exact blocker. Agent 10 consumes it and assembles the Agent 6 packet only if the row count, occurrence count, source lane, intended-use field, and zero counters validate.

## Stop Condition

Stop after the Agent 2 preboundary matrix or exact blocker. Do not emit candidate text, definition content, lemma content, reader-hint content, answers, public/runtime files, route shards, accepted text, export files, publication readiness, or release action.


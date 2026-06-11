# Agent 2 Agent10 Candidate-Use Preflight Handoff

Generated: 2026-06-05T12:31:00.000Z

| target | required Agent 1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition |
| --- | --- | --- | --- | --- | --- |
| Agent10/Agent6 preflight handoff for Agent2 morphology-planning rows | commercial-clean source lane, exact morphology relation matrix, queue_id/token_id/lexicon_entry_id/source_rids | request Agent10 preflight assembly only; no Agent2 candidate-use transform | agent10_agent6_exact_candidate_use_packet_missing_for_78_morphology_planning_rows | Agent 10 release owner for future exact Agent6 packet; Agent 2 remains blocked from candidate-use transform. | Stop at preflight handoff. This artifact is not an Agent6 delivery, not a candidate-use package, and not definition/lemma/reader-hint candidate output. |

## Future Question Subset

- Rows: 78.
- Occurrences: 1461.
- Current candidate-use rows: 0.
- Current transform rows: 0.

## Required Agent6 Question Fields

- `row_subset_id`
- `queue_id`
- `token_id`
- `lexicon_entry_id`
- `source_family`
- `license_lane`
- `source_rids`
- `morphology_relation_basis`
- `candidate_use_scope`
- `allowed_fields`
- `disallowed_fields`
- `commercial_export_allowed`
- `answer_eligible`
- `public_emit`
- `definition_content_storage`
- `candidate_text_export`

## Exact Blocker

- `agent10_agent6_exact_candidate_use_packet_missing_for_78_morphology_planning_rows`

## Non-Acceptance Boundary

- No Definition authority
- No answer acceptance
- No source/license/legal acceptance
- No accepted gloss/text
- No public/runtime mutation
- No route-shard edit
- No candidate text export
- No NC commercial authorization
- No release action


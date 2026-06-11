# Agent 10 -> Agent 2 Old-Dictionary Morphology Candidate-Use Handoff - 2026-06-05

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`.

Target: Agent 2 / `019e027b-7533-7272-9474-7abaf8712b29`.

Submission: `019e97e5-31dc-7ae3-a63d-0836d3284d65`.

## Request

Author the next non-public old-dictionary morphology candidate-use package over the exact `78` queue IDs only.

Exact row source:

- `reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json`
- JSON pointer: `exact_subset_for_future_question.queue_ids`

## Boundary

- rows / occurrences: `78` / `1461`
- license lane: `commercial_clean_candidate`
- preview relation class: `exact_after_mark_strip`
- Agent 2 morphology relation status: `agent2_morphology_relation_approved_for_nonpublic_planning`
- NC rows in subset: `0`
- excluded morphology-blocked rows: `219`

## Required Fields

`queue_id`, `token_id`, `lexicon_entry_id`, `occurrences`, `source_family`, `license_lane`, `source_rids`, `morphology_relation_basis`, `agent2_morphology_relation_status`, `candidate_use_scope`, `derived_from_nc`, `commercial_export_allowed`, `attribution_required`, `corpus_contamination`, `answer_eligible`, `public_emit`, `agent6_boundary_required`.

## Stop Condition

Agent 2 returns package artifact paths plus validator result, or exact blocker naming missing command/input/schema/field.

No candidate text storage/export, definition/lemma/reader-hint content storage, answer eligibility, route writes, public/runtime mutation, source/license/legal acceptance, Definition authority, accepted gloss/text, commercial export, publication readiness, or release action.

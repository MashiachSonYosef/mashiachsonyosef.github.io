# Agent 10 Consumption - Agent 6 Old-Dictionary Morphology Candidate-Use Verdict - 2026-06-05

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`.

Consumed verdict:

- `reports/agent6-old-dictionary-morphology-candidate-use-boundary-verdict-2026-06-05.md`
- `reports/agent6-old-dictionary-morphology-candidate-use-boundary-verdict-2026-06-05.json`

## Release Relevance

Agent 6 returned `WARN-ACCEPTED` for the exact `78` old-dictionary commercial-clean morphology-planning rows / `1461` occurrences as non-public candidate-use planning input only.

This opens one next non-public package-authoring step: Agent 2 may author a later non-public candidate-use package over the exact `78` queue IDs only.

Exact row source:

- `reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json`
- JSON pointer: `exact_subset_for_future_question.queue_ids`

## Required Preservation

Any later Agent 2 package must preserve:

- `queue_id`
- `token_id`
- `lexicon_entry_id`
- `occurrences`
- `source_family`
- `license_lane`
- `source_rids`
- `morphology_relation_basis`
- `agent2_morphology_relation_status`
- `candidate_use_scope`
- `derived_from_nc`
- `commercial_export_allowed`
- `attribution_required`
- `corpus_contamination`
- `answer_eligible`
- `public_emit`
- `agent6_boundary_required`

## Exact Blockers Preserved

- candidate text export remains blocked
- definition/lemma/reader-hint content storage remains blocked
- answer eligibility remains blocked
- public/runtime mutation remains blocked
- route writes remain blocked
- accepted text remains blocked
- release action remains blocked
- `219` morphology-blocked rows remain excluded
- actual candidate-use package requires a new Agent 6 verdict before text storage, transform, output, export, answer eligibility, or public/runtime mutation

## Next Handoff

Owner: Agent 2.

Requested artifact: non-public old-dictionary morphology candidate-use package over exact `78` queue IDs, preserving required fields and zero-output controls.

Agent 6 boundary need: next Agent 6 boundary only after Agent 2 authors an exact non-public candidate-use package.

Stop condition: hand exact `78`-ID candidate-use planning input to Agent 2 or preserve this consumption artifact until Agent 2 returns a package or exact blocker.

No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no public/runtime mutation, no candidate text export, no definition-content storage, no commercial export authorization, and no release action.

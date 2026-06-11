# Agent 10 -> Agent 2 Old-Dictionary 78-Row Transform-Output Proposal Workset

Generated: 2026-06-06T02:22:00Z

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`

## Target Package

`old-dictionary-commercial-clean-78-row-transform-output-proposal-preboundary`

## Files Used

| file | role |
|---|---|
| `reports/agent10-old-dictionary-78-row-zero-text-candidate-use-package-planning-2026-06-06.json` | exact zero-text package planning anchor |
| `reports/agent10-old-dictionary-78-row-zero-text-package-planning-consumption-2026-06-06.json` | Agent 10 consumption of Agent 6 zero-text package verdict |
| `reports/agent6-old-dictionary-78-row-zero-text-candidate-use-package-verdict-2026-06-06.json` | Agent 6 zero-text package planning verdict |
| `reports/agent10-old-dictionary-78-row-candidate-use-preboundary-matrix-2026-06-06.json` | preserved source metadata from preboundary matrix |
| `reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json` | Agent 2 morphology evidence |
| `reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json` | Agent 1 source-family lane handoff |

## Current Boundary

Agent 6 has WARN-ACCEPTED only non-public zero-text candidate-use package planning for the exact `78` rows / `1461` occurrences.

Current package status:

- source/license lane: `commercial_clean_candidate`
- relation class: `exact_after_mark_strip`
- morphology status: `agent2_morphology_relation_approved_for_nonpublic_planning`
- candidate text rows: `0`
- definition / lemma / reader-hint rows: `0`
- answer eligible rows: `0`
- public emit rows: `0`
- route writes: `0`
- accepted text rows: `0`
- export rows: `0`
- release actions: `0`

## Agent 2 Required Return

Agent 2 should produce one of these:

1. A compact non-public transform-output proposal matrix for the exact `78` queue IDs only.
2. `missing_pipeline_blocker` naming the exact missing input, source field, transform rule, output schema field, validator, or row-count mismatch.

Required proposal fields if matrix is produced:

`queue_id | token_id | lexicon_entry_id | occurrences | source_license_lane | relation_class | morphology_relation_status | proposed_transform_kind | proposed_candidate_text | proposed_definition_text | proposed_lemma_text | proposed_reader_hint_text | source_rids | source_headwords | source_family_hits | source_citation_or_url | attribution_required | derived_from_nc | commercial_export_allowed | corpus_contamination | answer_eligible | public_emit | route_writes | accepted_text | agent6_boundary_required | exact_agent6_question`

Required rules:

- rows must stay exactly `78`;
- occurrences must stay exactly `1461`;
- `source_license_lane` must stay `commercial_clean_candidate`;
- `relation_class` must stay `exact_after_mark_strip`;
- `morphology_relation_status` must stay `agent2_morphology_relation_approved_for_nonpublic_planning`;
- `answer_eligible=false`;
- `public_emit=false`;
- `route_writes=0`;
- `accepted_text=false`;
- `agent6_boundary_required=true`;
- no public/runtime mutation;
- no route shard write;
- no export;
- no publication readiness;
- no release action.

If Agent 2 includes any proposed text fields, they remain proposal fields only and must not be accepted text, verified text, answer text, public reader output, source/license acceptance, or Definition authority.

## Agent 6 Boundary Question To Prepare

Pass/warn/block whether the exact `78` row / `1461` occurrence commercial-clean old-dictionary transform-output proposal matrix may be reviewed as non-public proposal evidence only, without answer eligibility, public emit, route writes, accepted text, export, public/runtime mutation, publication readiness, or release action.

## Exact Blocker If Agent 2 Cannot Produce It

`missing_transform_output_proposal_matrix_or_exact_transform_rule`

## Next Owner

Agent 2 should produce the transform-output proposal matrix or exact blocker. Agent 10 should consume the result and assemble an Agent 6 packet only if the matrix validates against this workset.

## Stop Condition

Stop after Agent 2 returns the proposal matrix or exact blocker. Do not mutate public/runtime files, route shards, source files, token indexes, lexical payloads, accepted text, export files, publication state, or release state.


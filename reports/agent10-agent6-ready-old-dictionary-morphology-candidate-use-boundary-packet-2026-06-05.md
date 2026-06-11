# Agent 10 Agent6-Ready Old-Dictionary Morphology Candidate-Use Boundary Packet - 2026-06-05

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`.

Release owner: Agent 10.

Source lane owner: `019e975d-dc9f-7020-a7c8-885d083a837e` / Agent 1 - importer.

## Package/Workset

`old-dictionary morphology-planning rows approved by Agent 2 for non-public planning only`

## Inputs Consumed

- `reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json`
- `reports/agent2-morphology-planning-candidate-use-blocker-2026-06-05.json`
- `reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json`
- `reports/agent10-agent6-ready-old-dictionary-morphology-planning-boundary-packet-2026-06-05.json`
- `reports/agent6-old-dictionary-morphology-planning-boundary-verdict-2026-06-05.json`
- `reports/agent1-current-source-license-custody-lane-return-addendum-2026-06-05.json`

## Row / Occurrence Counts

Exact subset: `78` rows / `1461` occurrences.

Exact row source: `reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json` at `exact_subset_for_future_question.queue_ids`.

Relation: `exact_after_mark_strip`; `agent2_morphology_relation_approved_for_nonpublic_planning`.

## Lane Split

Included lane: `commercial_clean_candidate`.

Included source families:

| source family | planning rows with family | planning occurrences with family |
| --- | ---: | ---: |
| BDB Aramaic Dictionary | 21 | 616 |
| BDB Dictionary | 63 | 1271 |
| Jastrow Dictionary | 75 | 1417 |

Count note: source-family counts can overlap. The exact row boundary is the 78 queue IDs in the row source pointer.

Excluded rows: 219 morphology-blocked rows remain excluded, including 129 `prefix_or_clitic_possible` rows and 90 `needs_morphology_disambiguation` rows.

## Agent 6 Boundary Question

Pass/warn/block whether the exact `78` row / `1461` occurrence old-dictionary commercial-clean morphology-planning subset may be carried one step further as non-public candidate-use planning input for Agent 2 package authoring, using only the row IDs in `reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json` at `exact_subset_for_future_question.queue_ids`.

The requested scope is `nonpublic_candidate_use_planning_input_only`.

## Exact Blocker

`await_agent6_candidate_use_boundary_for_78_old_dictionary_morphology_planning_rows`

## Stop Condition

Stop at Agent6-ready boundary packet or Agent 6 verdict. No Agent 2 candidate package authoring, candidate text export, definition/lemma/reader-hint content, answer rows, route writes, public/runtime mutation, accepted text, commercial export, or release action is authorized by this packet alone.

What must not be accepted: QA acceptance, source/provenance acceptance, license/legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, candidate text export, definition-content storage, commercial export authorization, NC commercial authorization, or release action.

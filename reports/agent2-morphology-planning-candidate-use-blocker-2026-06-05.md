# Agent 2 Morphology Planning Candidate-Use Blocker

Generated: 2026-06-05T12:24:00.000Z

| target | required Agent 1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition |
| --- | --- | --- | --- | --- | --- |
| Agent 2 morphology-planning rows candidate-use blocker | commercial-clean lane plus exact morphology matrix rows and Agent6 boundary validation state | carry 78 morphology-planning rows as nonpublic evidence only; no candidate-use rows | morphology_planning_rows_have_no_delivered_agent6_candidate_use_boundary | Agent 2 definer holds nonpublic morphology-planning evidence; Agent 10/Agent 6 must supply exact row/subset candidate-use boundary before transform candidates. | Stop at candidate-use blocker. Do not convert morphology planning rows into definition, lemma, reader-hint candidate rows, answer rows, public output, route writes, accepted text, definition content, export rows, or release artifacts. |

## Counts

- Matrix rows: 297.
- Morphology planning rows / occurrences: 78 / 1461.
- Morphology blocked rows: 219.
- Allowed candidate-use rows now: 0.
- Allowed transform rows now: 0.
- Candidate/definition/lemma/reader-hint/answer/public rows now: 0.

## Boundary State

- Agent6 delivered now: false.
- Boundary validation status: `agent1_agent6_boundary_questions_recorded_not_delivered_zero_candidate_use`.
- Exact blocker: `morphology_planning_rows_have_no_delivered_agent6_candidate_use_boundary`.

## Required Before Candidate Use

- `exact_agent6_row_subset_boundary_for_candidate_use`
- `agent10_exact_agent6_packet_for_the_specific_planning_rows`
- `definition_lane_must_still_emit_no_public_or_answer_acceptance`

## Source Family Groups

- BDB Aramaic Dictionary: 21 planning rows, 616 occurrences, lane `commercial_clean_candidate`.
- BDB Dictionary: 63 planning rows, 1271 occurrences, lane `commercial_clean_candidate`.
- Jastrow Dictionary: 75 planning rows, 1417 occurrences, lane `commercial_clean_candidate`.

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


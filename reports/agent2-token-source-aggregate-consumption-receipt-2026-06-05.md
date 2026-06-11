# Agent 2 Token-Source Aggregate Consumption Receipt

Generated: 2026-06-05T13:52:00.000Z

| target | required Agent 1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition |
| --- | --- | --- | --- | --- | --- |
| Agent2 token-source partition aggregate consumption | token-source partition metadata plus source-lane-preserving future target | consume aggregate as nonpublic metadata evidence only; no candidate rows | no_candidate_rows_or_candidate_use_packet_from_aggregate | Agent 2 definer retains metadata-only aggregate evidence; Agent10/Agent6 require a separate exact candidate-use packet before any downstream use. | Stop at aggregate consumption receipt. Do not derive candidate text, definition content, answer rows, public output, route writes, accepted text, export rows, or release artifacts from aggregate metadata alone. |

## Counts

- Aggregate edge rows: 1951013.
- Matched token occurrences: 49791095.
- Source files read: 1337.
- Chunks merged: 54.
- Candidate/definition/lemma/reader-hint/answer/public/route/runtime rows: 0.

## Agent10 State

- Exact blocker: `no_candidate_rows_or_candidate_use_packet_from_aggregate`.
- Agent6 boundary question: null.

## Blockers Preserved

- `no_candidate_rows_or_candidate_use_packet_from_aggregate`
- `aggregate_is_nonpublic_token_source_partition_metadata_only`
- `separate_exact_boundary_required_for_any_candidate_use_answer_public_runtime_or_release_use`

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


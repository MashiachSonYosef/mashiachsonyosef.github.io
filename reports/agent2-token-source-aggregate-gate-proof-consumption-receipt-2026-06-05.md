# Agent 2 Token-Source Aggregate Gate-Proof Consumption Receipt

Generated: 2026-06-05T14:43:00.000Z

| target | required Agent 1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition |
| --- | --- | --- | --- | --- | --- |
| Agent2 token-source aggregate receipt Agent4 gate-proof consumption | metadata-only aggregate receipt plus Agent4 validator proof | consume as validator/prereq evidence only; no candidate-use or transform rows | no_candidate_rows_or_candidate_use_packet_from_aggregate | Agent 2 definer retains metadata-only aggregate evidence; Agent10/Agent6 require a separate exact candidate-use packet before downstream use. | Stop at gate-proof consumption. Do not derive candidate text, definition content, answer rows, public output, route writes, accepted text, export rows, or release artifacts from aggregate metadata or this gate proof. |

## Counts

- Aggregate edge rows: 1951013.
- Matched token occurrences: 49791095.
- Chunks merged: 54.
- Candidate/definition/lemma/reader-hint/answer/public/route/runtime rows: 0.

## Blockers Preserved

- `no_candidate_rows_or_candidate_use_packet_from_aggregate`
- `aggregate_is_nonpublic_token_source_partition_metadata_only`
- `separate_exact_boundary_required_for_any_candidate_use_answer_public_runtime_or_release_use`

## Non-Acceptance Boundary

- No QA acceptance
- No Definition authority
- No answer acceptance
- No source/license/legal acceptance
- No accepted gloss/text
- No public/runtime mutation
- No route-shard edit
- No candidate-use authorization
- No candidate text export
- No NC commercial authorization
- No release action


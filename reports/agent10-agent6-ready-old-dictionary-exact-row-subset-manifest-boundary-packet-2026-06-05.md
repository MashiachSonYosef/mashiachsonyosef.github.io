# Agent 10 -> Agent 6: Old-Dictionary Exact Row-Subset Manifest Boundary Packet

Generated: 2026-06-05T17:05:00.000Z

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`.

## Review Question

Pass/warn/block whether Agent 1's exact `500` row / `8427` occurrence old-dictionary row-subset manifest may be carried as non-public source-lane / row-subset planning evidence only for future Agent 10 package assembly.

This packet does not request Agent 2 transform, candidate text, definition-content storage, answer eligibility, public/runtime mutation, route writes, commercial export, NC commercial use, publication readiness, or release action.

## Inputs

- Manifest: `reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json`
- Manifest report: `reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.md`
- Validation result: `reports/agent1-old-dictionary-exact-row-subset-manifest-validation-result-2026-06-05.json`
- Row-overlap boundary: `reports/agent1-old-dictionary-row-overlap-lane-boundary-2026-06-05.json`
- Agent 6 boundary supplement source: `reports/agent1-old-dictionary-row-overlap-agent6-boundary-supplement-2026-06-05.json`

## Boundary Counts

| bucket | rows | occurrences | lanes | token_ids_sha256 | current blocker |
| --- | ---: | ---: | --- | --- | --- |
| `commercial_clean_only` | 18 | 494 | `commercial_clean_candidate` | `5d181f4f6cebe4a8231d3f74784ea2334b453bea500c2bf57ed78791902faf60` | `commercial_clean_only_missing_future_agent6_candidate_use_boundary_and_morphology_relation` |
| `commercial_clean_plus_noncommercial_educational` | 57 | 818 | `commercial_clean_candidate`; `noncommercial_educational_candidate` | `ccfbc390bdb69859b5b939daa427efe9d9a0508ea228dcab7078e83d620c9937` | `commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary` |
| `commercial_clean_plus_blocked_review` | 82 | 1068 | `commercial_clean_candidate`; `blocked_or_needs_review` | `6e5328b05c17521cfd045ef38a55feb63fb357cb3d53b6ef64379395eabe9a8a` | `commercial_clean_plus_blocked_overlap_missing_agent6_source_family_selection_boundary` |
| `commercial_clean_plus_noncommercial_educational_plus_blocked_review` | 140 | 3367 | `commercial_clean_candidate`; `noncommercial_educational_candidate`; `blocked_or_needs_review` | `fe48a061341ff92f19931ed961b0b45196a3366a9322c87766f287c310b2c888` | `triple_overlap_missing_agent6_source_family_selection_boundary` |
| `noncommercial_educational_only` | 17 | 259 | `noncommercial_educational_candidate` | `3d49e2b7dc8ea5d05deb98d90d40e01b3f4e0d036a5b231f6b4b0bfdbce2ef6b` | `nc_educational_only_missing_agent6_nc_boundary_no_commercial_authorization` |
| `blocked_review_only` | 0 | 0 | `blocked_or_needs_review` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | `blocked_review_only_zero_rows_no_current_boundary_delivery` |
| `metadata_or_link_only` | 0 | 0 | `metadata_or_link_only` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | `metadata_or_link_only_zero_rows_no_current_boundary_delivery` |
| `no_sefaria_source_hit` | 186 | 2421 | `blocked_or_needs_review` | `fb0342c8f5fe554f9b1773941ef9a3b073943d3bd37cc56f41f08ab745814c71` | `no_sefaria_source_hit_missing_source_license_custody_evidence` |

## Requested Boundary

Agent 10 asks only whether this exact manifest can be carried as non-public planning evidence with source lanes and row-subset hashes preserved.

The full token IDs and queue IDs live in the manifest JSON. This packet uses that manifest as the exact row source and does not duplicate the row list.

## Zero Counters

- Agent 2 transform rows now: `0`
- Candidate text rows now: `0`
- Accepted gloss rows now: `0`
- Answer rows now: `0`
- Definition-content rows now: `0`
- Source rows emitted now: `0`
- Public HUD rows now: `0`
- Route JSONL rows now: `0`
- Agent 6 delivery by Agent 1 now: `0`
- Queue mutation count: `0`
- Render mutation count: `0`
- Staging count: `0`
- Release route opened now: `0`

## Stop Condition

Stop at Agent 6 row-subset manifest planning-evidence verdict or exact blocker. Any future subset selection for transform, candidate-use, candidate text, definition-content storage, answer eligibility, source/license/legal acceptance, route write, public/runtime mutation, commercial export, NC commercial use, publication readiness, or release action requires a later exact Agent 6 packet.


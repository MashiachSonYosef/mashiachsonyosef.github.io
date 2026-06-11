# Agent 10 Agent6-Ready Orot 205-Row Commercial-Clean Subset

Status: `agent6_review_required_nonpublic_commercial_clean_subset_only`

## Anchor

- Package: `data/build/orot/reader-hint-placeholder-candidates.json`
- Rows: `127`
- Occurrences: `4389`

## Subset

- Rows: `205`
- Occurrences: `1767`
- Lane: `commercial_clean_candidate`
- Families: `BDB Aramaic Dictionary`, `BDB Dictionary`, `Jastrow Dictionary`

## Relation Classes Included

- needs_morphology_disambiguation: `71` rows / `641` occurrences
- prefix_or_clitic_possible: `82` rows / `677` occurrences
- exact_after_mark_strip: `52` rows / `449` occurrences

## Transform Blockers Preserved

- missing_agent1_6_custody_disposition: `205` rows
- answer_text_not_stored_by_preview: `205` rows
- missing_approved_morphology_relation: `153` rows

## Zero Counts

- public_hud_rows: `0`
- route_jsonl_rows: `0`
- route_shard_writes: `0`
- runtime_files_changed: `0`
- source_files_changed: `0`
- token_index_files_changed: `0`
- lexical_payload_files_changed: `0`
- definition_content_rows: `0`
- nc_definition_content_rows: `0`
- answer_rows: `0`
- accepted_text_rows: `0`

## Agent 6 Review Question

Can Agent 10 append all or a subset of these 205 commercial-clean PUBLIC_DOMAIN_OBSERVED metadata/candidate planning rows to the non-public Orot reader-hint placeholder package, preserving TBD display text and zero public/runtime/output/answer/definition/accepted-text emissions?

## Stop Condition

Stop after Agent6 row/subset disposition. Append only rows explicitly cleared by Agent6 and still absent at append time.

## Agent 8 Callback

Status: Agent 10 produced an Agent6-ready 205-row / 1767-occurrence commercial-clean Orot subset. Route this exact packet to Agent 6 for row/subset review.

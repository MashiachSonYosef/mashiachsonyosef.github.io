# Agent 2 Old-Dictionary Lane Planning Intake

Date: 2026-06-04
Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE

## Status

Status: `old_dictionary_lane_planning_evidence_intaked_nonpublic_only`
Disposition consumed: `WARN-ACCEPTED` for `nonpublic_old_dictionary_source_family_license_lane_and_lane_partition_planning_evidence_only`.

This is an Agent 2 non-public planning-intake artifact. It does not emit candidate text, definition content, answers, public rows, route JSONL, route shards, or runtime/source/token-index/lexical edits.

## Inputs

- agent1_reaudit: `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`
- agent1_export_partitions: `reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.json`
- agent6_verdict: `reports/agent6-old-dictionary-license-lane-planning-verdict-2026-06-04.md`
- agent10_consumption: `reports/agent10-agent6-old-dictionary-license-lane-verdict-consumption-2026-06-04.json`
- current_handoff_bundle: `reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json`

## Primary Planning Counts

- Audited rows / occurrences: 500 / 8427
- Public-domain-observed rows / occurrences: 297 / 5747
- Blocked-only / unresolved rows / occurrences: 17 / 259
- No-Sefaria-hit rows / occurrences: 186 / 2421
- Next missed rows / occurrences: 50 / 1193

## Source-Family Lane Planning Evidence

- Jastrow Dictionary: `commercial_clean_candidate`, 210 rows / 4474 occurrences
- BDB Dictionary: `commercial_clean_candidate`, 221 rows / 4418 occurrences
- BDB Aramaic Dictionary: `commercial_clean_candidate`, 69 rows / 2048 occurrences
- Klein Dictionary: `noncommercial_educational_candidate`, 214 rows / 4444 occurrences
- BDB Augmented Strong: `blocked_or_needs_review`, 222 rows / 4435 occurrences

## Supplemental Lane Partitions

- `commercial_clean_candidate`: 3 source families, 500 rows / 10940 occurrences
- `noncommercial_educational_candidate`: 1 source families, 214 rows / 4444 occurrences
- `metadata_or_link_only`: 0 source families, 0 rows / 0 occurrences
- `blocked_or_needs_review`: 1 source families, 222 rows / 4435 occurrences

## Blocker Update

- Replaced stale blocker: `undefined`
- Replacement status: `resolved_for_nonpublic_source_family_license_lane_planning_evidence_intake_only`
- Remaining exact blocker: `old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary`

Candidate text consumption/export/storage remains blocked. A changed row/subset package and exact Agent 6 boundary are required before any definition/reader-hint text, answer eligibility, public emit, route write, commercial export, or NC public/commercial use.

## Zero Counters

- candidate_rows_emitted: 0
- candidate_occurrences_emitted: 0
- answer_rows: 0
- answer_eligible_rows: 0
- source_rows_emitted: 0
- public_hud_rows: 0
- route_jsonl_rows: 0
- route_shard_writes: 0
- runtime_edits: 0
- source_edits: 0
- token_index_edits: 0
- lexical_payload_edits: 0
- definition_content_rows: 0
- accepted_text_rows: 0

## Non-Acceptance Boundary

No QA acceptance, no source/provenance acceptance, no license acceptance, no legal acceptance, no Definition authority, no usage-as-definition authority, no answer acceptance, no answer eligibility, no public/runtime acceptance, no publication readiness, no route publication support, no product/data acceptance, no translation output, no accepted gloss/text, no public reader output, no route-shard edit, no public/runtime mutation, no definition-content storage, no candidate text consumption/export, no commercial export permission, no NC commercial authorization is claimed.

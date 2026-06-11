# Agent 2 / Spark-2 Pipeline Contract: Orot Missed Dictionary Reader Hints - 2026-06-04

Status: `pipeline_runnable_with_zero_candidate_closure_on_current_inputs`.
Active mode: `BROAD_CORPUS_EXPANSION` with `OROT_PROTOTYPE_HARDENING`.

## Purpose

Define the reusable Agent 2 contract for Spark-2 to generate Orot missed-dictionary reader-hint candidate rows without inventing semantics.

This contract uses already identified safe/missed dictionary evidence from Oracle 9 / Agent 10 / Agent 2 artifacts. It does not authorize broad discovery, manual definitions, answer rows, public reader output, or public/runtime mutation.

## Contract Status

Spark-2 can run the candidate pipeline because the Agent 2-owned builder and validator now exist.

Exact blocker:

- None for script authorship. Current inputs produce zero new rows because deterministic candidates are already public, packaged, or prior-candidate-consumed.

Authored files:

- `scripts/build_agent2_orot_missed_dictionary_reader_hint_candidates.mjs`
- `scripts/validate_agent2_orot_missed_dictionary_reader_hint_candidates.mjs`

Reference implementation exists, but remains Agent 10-owned:

- `scripts/build_agent10_orot_next_missed_dictionary_placeholder_candidates.mjs`
- `scripts/validate_agent10_orot_next_missed_dictionary_placeholder_candidates.mjs`

## Exact Inputs

Required input artifacts:

- `reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.json`
- `data/public-hud/orot/reader-hints.json`
- `data/build/orot/reader-hint-placeholder-candidates.json`
- `reports/agent10-orot-license-safe-coverage-repair-add-candidates-2026-06-03.json`
- `reports/oracle9-owner-pulse-2026-06-03-0410Z.md`
- `reports/oracle9-owner-pulse-2026-06-03-1039Z.md`

Reference prior candidate evidence:

- `reports/agent10-orot-next-missed-dictionary-placeholder-candidates-2026-06-03.json`
- `reports/agent10-orot-next-missed-dictionary-cleared-append-2026-06-03.json`
- `reports/agent6-orot-next-missed-dictionary-placeholder-candidates-verdict-2026-06-03.md`

## Source / License Flags

Rows must inherit source/license posture from Agent 1 / source-family evidence already carried in the input artifacts.

Allowed source-family lanes:

- `commercial_clean_candidate`: `BDB Dictionary`, `BDB Aramaic Dictionary`, `Jastrow Dictionary`, `PUBLIC_DOMAIN_OBSERVED`.
- `noncommercial_educational_candidate`: `Klein Dictionary`, `CC_BY_NC`, `commercial_export_allowed=false`, `derived_from_nc=true`, attribution required.

Excluded or non-candidate lanes:

- `metadata-link-only`: metadata/external-link-only evidence without stored/displayed candidate text.
- `blocked`: e.g. `BDB Augmented Strong` unless a separate independent source/license/custody basis exists.
- `unmatched`: no usable safe dictionary/source-family row found.

Required row flags:

- `answer_eligible=false`.
- `public_emit_ready=false`.
- `add_now_before_agent6=false`.
- `definition_text_stored_now=false`.
- `nc_definition_content_stored_now=false`.
- `source_rows_emitted=0`.
- `public_hud_rows=0`.
- `route_jsonl_rows=0`.
- `route_shard_writes=0`.
- `runtime_files_changed=0`.

## Candidate Selection Rule

1. Load the Agent 2 Sefaria lexicon hit audit.
2. Build a used-token set from current public Orot reader hints, current non-public placeholder package rows, and prior candidate packets.
3. Preserve only rows not already public or packaged.
4. Prefer commercial-clean dictionary families over NC rows.
5. Use NC rows only as `noncommercial_educational_candidate` with commercial export prohibited and no public/runtime authorization.
6. Record blocked source families as present-but-unused, especially `BDB Augmented Strong`.
7. Emit `counterpart_text=TBD` placeholder candidates only; do not emit definition text or accepted gloss.
8. Count all rows by `commercial_clean_candidate`, `noncommercial_educational_candidate`, `metadata-link-only`, `blocked`, and `unmatched`.

## Command Contract

Future Agent 2 builder command:

`node scripts/build_agent2_orot_missed_dictionary_reader_hint_candidates.mjs --limit=50 --output=reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json --report=reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.md`

Future Agent 2 validator command:

`node scripts/validate_agent2_orot_missed_dictionary_reader_hint_candidates.mjs reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json`

Current run result:

`zero_candidate_closure_on_current_inputs`

## Output Schema

Top-level fields:

- `schema_version`
- `artifact_type=agent2_orot_missed_dictionary_reader_hint_candidates`
- `generated_at`
- `generator`
- `boundary`
- `inputs`
- `selection`
- `summary`
- `source_license_counts`
- `rows`
- `outputs_now`
- `what_must_not_be_accepted`

Required `summary` fields:

- `candidate_rows`
- `candidate_occurrences`
- `commercial_clean_candidate_rows`
- `commercial_clean_candidate_occurrences`
- `noncommercial_educational_candidate_rows`
- `noncommercial_educational_candidate_occurrences`
- `metadata_link_only_rows`
- `blocked_rows`
- `unmatched_rows`
- `rows_cleared_by_agent6_now`
- `rows_added_now`
- `rows_blocked_pending_agent6`

Required row fields:

- `target_token_id`
- `surface`
- `normalized`
- `occurrences`
- `source_audit_priority`
- `category`
- `lane`
- `family_status`
- `source_families`
- `blocked_source_families_present_but_unused`
- `headwords`
- `refs_count`
- `entry_ids`
- `response_sha256s`
- `provisional_label`
- `placeholder_status`
- `counterpart_text`
- `placeholder_text_stored_now`
- `definition_text_stored_now`
- `source_license_group`
- `derived_from_nc`
- `commercial_export_allowed`
- `noncommercial_display_planning_allowed`
- `noncommercial_display_public_or_runtime_authorized`
- `attribution_required`
- `corpus_contamination`
- `cleared_by_agent6_now`
- `add_now_before_agent6`
- `answer_eligible`
- `public_emit_ready`

## Validator Requirements

Validator must check:

- Artifact type is `agent2_orot_missed_dictionary_reader_hint_candidates`.
- All row token IDs are unique.
- No row already exists in current public hints or current non-public placeholder package unless the artifact is explicitly marked as already-packaged evidence.
- Allowed labels only: `counterpart candidate`, `project-preferred counterpart candidate`.
- No `definition`, `answer`, `translation`, `accepted gloss`, `verified`, or `top match` label.
- `counterpart_text=TBD` for placeholder rows.
- `definition_text_stored_now=false`.
- `answer_eligible=false`.
- `public_emit_ready=false`.
- `add_now_before_agent6=false`.
- `cleared_by_agent6_now=false` unless a dated Agent 6 row/subset verdict is referenced.
- No BDB Augmented Strong selected source family unless separately cleared by source/license custody.
- NC rows carry `derived_from_nc=true`, `commercial_export_allowed=false`, attribution required, and no public/runtime authorization.
- `outputs_now` public/route/source/answer/definition/runtime counts are zero.

## Current Reference Counts

Reference Agent 10 missed-dictionary packet:

- Candidate rows: 50.
- Candidate occurrences: 1193.
- Commercial-clean rows: 50 / 1193 occurrences.
- NC rows: 0 / 0 occurrences.
- Metadata-link-only rows: 0.
- Blocked rows in emitted candidate packet: 0.
- Unmatched rows in emitted candidate packet: 0.
- Rows added before Agent 6: 0.
- Rows pending Agent 6 in original packet: 50.

Current non-public package state:

- Placeholder rows: 332.
- Placeholder occurrences: 6156.
- Commercial-clean rows: 302 / 5768 occurrences.
- Noncommercial educational rows: 17 / 259 occurrences.
- Display-integrity TBD rows: 13 / 129 occurrences.
- Answer rows: 0.
- Public HUD rows: 0.
- Route JSONL rows: 0.

Current validator note:

- `node scripts/validate_agent10_orot_next_missed_dictionary_placeholder_candidates.mjs reports/agent10-orot-next-missed-dictionary-placeholder-candidates-2026-06-03.json` now fails because the 50 rows are already public-or-packaged in the current non-public package.
- `node scripts/validate_agent10_orot_non_public_reader_hint_placeholder_package.mjs` passes for `data/build/orot/reader-hint-placeholder-candidates.json`.

## Agent 6 Boundary Need

Any new candidate rows produced by the Agent 2 contract require Agent 6 row/subset boundary review before append or display.

The prior 50-row missed-dictionary packet was WARN-ACCEPTED by Agent 6 for direct non-public placeholder append only. That verdict does not clear public mutation, answer rows, definition content, source/license acceptance, Definition authority, usage-as-definition authority, public/runtime acceptance, publication readiness, product/data acceptance, translation output, accepted gloss, or accepted text.

## Stop Condition

Spark-2 may run this contract because the Agent 2-owned builder and validator exist. A zero-row output is valid when current inputs contain no remaining deterministic candidates after used-token exclusion.

`zero_candidate_closure_on_current_inputs`

## Boundary

This contract creates no Definition authority, answer acceptance, answer eligibility, accepted gloss/text, public reader output, route publication support, public/runtime mutation, source/provenance/license acceptance, product/data acceptance, or publication readiness.

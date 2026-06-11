# Agent 1 BDB Augmented Strong Row-Linkage Probe - 2026-06-05

Status: `row_linkage_fields_missing_exact_custody_linkage_still_blocked`

## Lane Decision

| row subset | rows | occurrences | lane | exact row linkage proven | transform now |
| --- | ---: | ---: | --- | --- | --- |
| `old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong` | 222 | 4435 | `blocked_or_needs_review` | false | false |

## Row Field Profile

- Row keys: `agent2_lane`, `answer_eligible_now`, `blocked_or_unresolved_entry_count`, `blocked_or_unresolved_lexicons`, `category`, `current_ambiguity_count`, `current_answer_eligible_count`, `current_candidate_count`, `current_dominant_failure_reason`, `current_route_card_count`, `emitted_answer_row_now`, `lexicon_entry_id`, `normalized`, `occurrences`, `preview_relation_class`, `preview_status`, `public_domain_citation_metadata_present`, `public_domain_headwords`, `public_domain_lexicons`, `public_domain_observed_entry_count`, `public_domain_refs_count`, `public_domain_refs_sample`, `public_domain_rids`, `queue_id`, `sefaria_combined_hit_count`, `source_audit_priority`, `source_row_emitted_now`, `surface`, `token_id`, `transform_blockers`
- Missing linkage keys checked: `aug`, `augmented_strong`, `augmented_strong_number`, `strong`, `strong_number`, `oshb_lexical_id`, `openscriptures_lexical_id`, `bdb_augmented_strong_rid`, `blocked_or_unresolved_rids`, `blocked_or_unresolved_refs_sample`, `source_url`, `source_file`
- Blocked/unresolved lexicons observed: `BDB Augmented Strong`, `Klein Dictionary`

## AugIndex Profile

- URL: https://raw.githubusercontent.com/openscriptures/HebrewLexicon/master/AugIndex.xml
- SHA-256: `e7217ca8ff8ff3f21f9cf1bbe87411adf55f6aa88bcf5ed9ddc886cc6b160c5d`
- Entries parsed: 9299
- Identifier shape: `aug` attribute to lowercase lexical index ID.

## Mechanical Linkage Probe

- Token IDs to AugIndex aug values: 0
- Token IDs to AugIndex lexical IDs: 0
- Preview lexicon entry IDs to AugIndex lexical IDs: 0
- Public-domain RIDs to AugIndex lexical IDs: 0
- Blocker: No available BDB Augmented Strong row field matches AugIndex aug values or lexical IDs; public-domain RID fields are for other lexicons and do not establish BDB Augmented Strong custody.

## Exact Blockers

- `bdb_augmented_strong_rows_missing_augmented_strong_number_field`
- `bdb_augmented_strong_rows_missing_openscriptures_lexical_index_id_field`
- `bdb_augmented_strong_rows_missing_blocked_entry_id_or_ref_sample`
- `bdb_augmented_strong_public_domain_rids_do_not_match_augindex_identifier_shape`
- `bdb_augmented_strong_source_file_or_import_mapping_missing`
- `bdb_augmented_strong_agent6_boundary_required_if_linkage_evidence_appears`

## Boundary

No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, accepted gloss/text, candidate-text export authorization, release action, public/runtime mutation, NC commercial authorization, queue mutation, staging, or destructive repo action is claimed.

# Agent 2 Old Dictionary Excluded-Row Reaudit Consumption Prep - 2026-06-05

target | required Agent 1 fields | transform action once classified | exact blocker if not classified | handoff owner | stop condition

## Target: old-dictionary-excluded-row-license-lane-reaudit

## Required Agent 1 Fields

- `source_family`
- `source_name`
- `license_label`
- `license_lane`
- `attribution_required`
- `derived_from_nc`
- `commercial_export_allowed`
- `source_url_or_citation`
- `agent6_boundary_required`
- `row_subset_id`
- `evidence_path`
- `corpus_contamination`

## Transform Action Once Classified

- `commercial_clean_candidate`: prepare nonpublic metadata-only transform inputs only after exact Agent 6 row/subset boundary; no candidate text or public/answer rows.
- `noncommercial_educational_candidate`: preserve NC educational lane with `derived_from_nc=true`, `commercial_export_allowed=false`, `attribution_required=true`; never merge into commercial-clean.
- `metadata_or_link_only`: metadata/link-only partition; no definition text or accepted gloss/text.
- `blocked_or_needs_review`: no transform until missing source/license/custody basis and Agent 6 boundary exist.

## Exact Blocker If Not Classified

- none_for_source_family_lane_classification

## Current Transform Blockers

- `missing_exact_agent6_row_subset_boundary_for_any_candidate_text_package_or_display_behavior`
- `answer_text_not_stored_by_agent1_packet`
- `missing_approved_morphology_relation_for_definition_lemma_reader_hint_transform`
- `blocked_or_needs_review::bdb-augmented-strong_missing_independent_source_license_custody_basis`
- `noncommercial_educational_candidate::klein-dictionary_no_commercial_export_authorization`

## Handoff Owner

Agent 2 prepares this consumption contract; Agent 10 release owner consumes handoff; Agent 6 supplies exact row/subset boundary before any candidate-text/package/display behavior.

## Stop Condition

Stop at this consumption-prep packet. Do not transform old/new/missed dictionary rows into candidate text, Definition content, answer rows, accepted gloss/text, or public/runtime output until current Agent 1 row/subset fields plus exact Agent 6 boundary authorize the specific nonpublic transform lane.

## Zero Output

- Definition/lemma/reader-hint/candidate-text/answer/public/runtime/accepted-text rows: `0`.

## Boundary

No Definition authority; No answer acceptance; No source/license/legal acceptance; No accepted gloss/text; No public/runtime mutation; No NC commercial authorization


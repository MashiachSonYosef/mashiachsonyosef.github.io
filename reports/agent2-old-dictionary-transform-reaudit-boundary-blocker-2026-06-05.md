# Agent 2 Old-Dictionary Transform Boundary Blocker

Generated: 2026-06-05T22:40:00.000Z

## Target
Agent 2 definition/lemma/reader-hint transform after Agent 1 classified lanes (old-dictionary reaudit).

## Status
Blocked for missing exact Agent 1/Agent 6 boundary fields.

## Required Agent 1 fields
- `row_subset_id`
- `source_family`
- `license_lane`
- `transform_lane`
- `evidence_path`
- `occurrences`
- `derived_from_nc`
- `commercial_export_allowed`
- `attribution_required`
- `corpus_contamination`
- `agent6_boundary_required`
- `agent2_transform_allowed_now`
- `answer_eligible`
- `public_emit`
- `missing_evidence`
- `handoff_owner`

## Required Agent 6 fields
- `exact_row_or_row_subset_id`
- `agent6_boundary_verdict`
- `agent6_morphology_relation_status`
- `morphology_relation_basis`
- `candidate_use_scope`
- `exact_agent6_manifest_or_packet_path`

## Exact blockers (no transform/output until resolved)
- `old-dictionary-excluded-row-license-lane-reaudit::bdb-dictionary::missing_exact_agent6_boundary_and_approved_morphology_relation`
- `old-dictionary-excluded-row-license-lane-reaudit::bdb-aramaic-dictionary::missing_exact_agent6_boundary_and_approved_morphology_relation`
- `old-dictionary-excluded-row-license-lane-reaudit::jastrow-dictionary::missing_exact_agent6_boundary_and_approved_morphology_relation`
- `old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary::missing_exact_agent6_nc_boundary_no_commercial_export_authorization`
- `old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong::missing_independent_source_license_custody_basis`

## Lane preservation
- commercial_clean_candidate, noncommercial_educational_candidate, metadata_or_link_only, blocked_or_needs_review lanes remain preserved.
- do not apply any of: definition content, lemma content, reader-hint content, answer acceptance, candidate-text output, public/runtime mutation, route writes, export, release action.

# Oracle 9 New Dictionary Source Lane Policy

Date: 2026-06-04
Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE
Role: Oracle-side owner policy preservation only.

## Owner Policy

New and missed dictionary sources must be handled with source-lane separation before candidate rows enter any reader-hint or definition pipeline.

## Required Source-Family Lanes

- `commercial_clean_candidate`
- `noncommercial_educational_candidate`
- `metadata_or_link_only`
- `blocked_or_needs_review`

## Required Per-Source / Per-Row Fields

- `source_family`
- `source_name`
- `license_label`
- `license_lane`
- `attribution_required`
- `derived_from_nc`
- `commercial_export_allowed`
- `owner_use_attestation` when NC educational use is the basis
- `corpus_contamination=false` for separated NC lane
- `source_url_or_citation`
- `agent6_boundary_required`

## Export Rule

- Commercial-clean CSV/export receives only `commercial_clean_candidate` rows after boundary clearance.
- NC educational CSV/export receives `noncommercial_educational_candidate` rows with NC flags preserved.
- Metadata/link-only sources do not emit definition text unless an exact later boundary allows it.
- Blocked/review rows remain out of candidate text exports.

## Pipeline Rule

- Agent 1 owns dictionary source-family classification and custody flags.
- Agent 2 may create definition/reader-hint candidates only after Agent 1 source-family lanes exist.
- Spark-1 can run source-family pipelines and mechanical checks for Agent 2 contracts under the two-primary model, but must not invent source permissions.
- Agent 6 gets exact row/subset boundary questions, not broad dictionary approval.

## Priority

Use already identified Oracle 9 / prior missed dictionary sources before broad new discovery.

## Non-Acceptance Boundary

This preserves owner operating policy only. It does not authorize commercial export for NC rows, source/license/legal acceptance, Definition authority, public/runtime mutation, accepted gloss/text, or publication readiness.

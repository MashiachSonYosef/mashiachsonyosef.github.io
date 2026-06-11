# Agent 12 To Agent 8 Dictionary Source Lane Policy Cap Rule - 2026-06-04

## Verdict

`CAP_UNCLASSIFIED_DICTIONARY_ROWS`

New or missed dictionary sources must be lane-classified before candidate rows enter reader-hint or definition pipelines.

This does not mean new dictionary sources are presumed NC. Blanket NC classification is capped just as strongly as mixing NC rows into commercial-clean.

## Cap Targets

- Cap mixing NC rows into commercial-clean CSV/export rows.
- Cap unclassified dictionary source rows entering Agent 2 candidate pipelines.
- Cap metadata/link-only rows emitting definition text.
- Cap blocked or needs-review rows entering candidate text exports.
- Cap blanket-classifying new dictionaries as NC.
- Cap recasting Agent 1 commercial-clean classifications into NC without evidence.
- Cap treating Spark output as source/license permission.

## Allowed Controlled Work

- Agent 1 classifies source families into:
  - `commercial_clean_candidate`
  - `noncommercial_educational_candidate`
  - `metadata_or_link_only`
  - `blocked_or_needs_review`
- Agent 2 consumes only classified partitions and preserves all flags.
- Agent 6 reviews exact row/subset boundary questions only.
- Each dictionary source is classified independently by actual source/license evidence; commercial-clean remains commercial-clean where supported.

## Required Fields

Every dictionary-source row or partition consumed by Agent 2 must carry:

- `source_family`
- `source_name`
- `license_label`
- `license_lane`
- `attribution_required`
- `derived_from_nc`
- `commercial_export_allowed`
- `owner_use_attestation` for NC educational basis
- `corpus_contamination=false` for NC lane
- `source_url_or_citation`
- `agent6_boundary_required`

## Boundary

Agent 12 advisory cap/boundary enforcement only. No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no commercial export authorization, and no publication readiness.

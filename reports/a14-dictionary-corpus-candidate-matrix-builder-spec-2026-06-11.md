# A14 Dictionary Corpus Candidate Matrix Builder Spec

Generated: 2026-06-11

Status: `spec_ready_blocked_pending_source_row_contract`.

## Purpose

Define the next corpus-wide old/new dictionary and NC candidate matrix builder without creating active lexical/source-layer data, candidate text, preHUD output, or rendered pages.

## Current Blockers

- `missing_corpus_wide_dictionary_source_row_contract`: no corpus-wide BDB/Jastrow/Klein source-row contract exists.
- `current_old_dictionary_evidence_is_orot_only_by_token_id`: current evidence joins old-dictionary token IDs only to `orot`.
- `source_family_row_clearance_pending`: A1/A6 have not cleared transform rows; allowed transform rows remain 0.

## Planned Row Shape

`token_id | work_id | normalized_surface | source_family | license_lane | relation_class | occurrence_count | source_ref | transform_allowed=false | display_eligible=false | prehud_allowed=false | blocker`

## Planned Builder

Future script path:

`scripts/build_a14_dictionary_corpus_candidate_matrix.mjs`

Inputs:

- A1/A6-cleared dictionary source-row contract
- old-dictionary safe-add contract
- source-family membership manifest
- token indexes
- coverage JSONs
- unresolved CSVs

Outputs:

- `reports/a14-dictionary-corpus-candidate-matrix-<date>.json`
- `reports/a14-dictionary-corpus-candidate-matrix-<date>.md`

## Defaults

- `transform_allowed`: false
- `display_eligible`: false
- `prehud_allowed`: false
- `active_output_allowed`: false
- `candidate_text_present`: false
- `candidate_text_emitted`: false

## Boundary

Planning spec only. No source/license/legal acceptance, no Definition authority, no accepted gloss or answer text, no active lexical/source-layer mutation, no candidate text emission, no preHUD display promotion, no page render mutation, no public runtime, and no release acceptance.

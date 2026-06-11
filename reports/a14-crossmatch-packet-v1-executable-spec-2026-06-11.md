# A14 Crossmatch Packet v1 Executable Spec - 2026-06-11

Status: `draft_ready_with_generalization_blocker`.

Boundary: evidence/navigation specification only. No source/license/legal/Definition/answer/accepted-text/public-runtime/release acceptance. No preHUD authority, no route mutation, and no repo cleanup action.

## Purpose

Define the general crossmatch packet shape and point to the first runnable subtype: the A3 phrase/abbrev matrix. The general packet remains blocked until a broader builder and validator can consume multiple crossmatch families without copying payload text or implying display eligibility.

## Current Runnable Subtype

| subtype | builder | validator | output |
|---|---|---|---|
| `phrase_abbrev_matrix` | `scripts/build_agent3_phrase_abbrev_crossmatch_matrix.mjs` | `scripts/validate_agent3_phrase_abbrev_crossmatch_matrix.mjs` | `reports/agent3-a14-phrase-abbrev-pattern-crossmatch-matrix-2026-06-11.json` |

## Required General Row Shape

`row_id | token_id | surface | normalized_surface | lemma | source_family | license_lane | provenance | candidate_route_id | candidate_lexical_id | match_family | match_reason | confidence_percent | competing_candidate_count | display_eligible | hud_inspectable | prehud_allowed | evidence_only_reason | blocker | next_owner | stop_condition`

## Match Families

| match_family | preHUD default | notes |
|---|---|---|
| `strict_hebrew` | blocked until selected route gate clears | exact route-backed Hebrew evidence only |
| `strict_aramaic` | blocked until selected route gate clears | exact route-backed Aramaic evidence only |
| `prefix_stem_suffix` | `TBD` | morphology evidence only unless downstream gate clears |
| `lemma_only` | `TBD` | HUD-inspectable evidence only |
| `crossmatch` | `TBD` | navigation/evidence only |
| `usage_evidence` | `TBD` | observed usage only |
| `morphology_form_reference` | `TBD` | never display form-reference text by default |
| `phrase_abbrev_matrix` | `TBD` | runnable subtype, project-authored abbreviation evidence only |

## General Packet Gates

- `display_eligible` and `prehud_allowed` default to `false`.
- `hud_inspectable` may be `true` for evidence rows when source/license/provenance is inspectable.
- Rows with `lemma_only`, `usage_evidence`, `morphology_form_reference`, or `phrase_abbrev_matrix` stay out of preHUD unless a later selected route gate explicitly clears them.
- NC/noncommercial evidence remains isolated and cannot enter public/commercial-clean output through this packet.
- The packet must not copy source dictionary payload text; it may carry row IDs, route IDs, source family/lane, and evidence reasons.

## Required General Validator Checks

1. JSON parses and artifact type is correct.
2. Every row has the required row-shape fields.
3. `prehud_allowed=true` is forbidden unless `display_eligible=true` and `candidate_route_id` is present.
4. Evidence-only match families have `prehud_allowed=false`.
5. Source/license/provenance fields are present for HUD-inspectable rows.
6. No forbidden authority fields contain truthy values: accepted gloss/text, answer eligibility, publication/readiness, route payload copy, Definition authority.
7. NC lane rows remain nonpublic/evidence-only.
8. Counts match row arrays and blocker arrays.

## Remaining Generalization Blocker

`crossmatch_packet_blocker | missing_general_builder | input_families | row_schema | validator | next_owner=A3 | stop_condition=general builder and no-payload-copy validator exist`

Until that blocker is resolved, only the `phrase_abbrev_matrix` subtype is runnable.

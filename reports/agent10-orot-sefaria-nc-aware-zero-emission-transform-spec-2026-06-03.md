# Agent 10 Orot/Sefaria NC-Aware Zero-Emission Transform Spec

Generated: 2026-06-03T14:14:54.996Z

## Boundary

This is a zero-emission transform specification only. It does not emit answer rows, source rows, public HUD rows, route JSONL rows, definition-content rows, NC definition-content rows, runtime edits, source edits, token-index edits, lexical-payload edits, or public mutations.

It does not accept QA, source/provenance, license posture, Definition authority, usage-as-definition authority, answer eligibility, public/runtime behavior, publication readiness, route publication support, product/data status, translation output, accepted gloss, or accepted text.

## Measured Scope

- Scoped rows / occurrences: `500` / `8427`.
- Commercial-clean candidates: `297` rows / `5747` occurrences.
- Additional NC educational candidates: `17` rows / `259` occurrences.
- Commercial-clean + NC candidates: `314` rows / `6006` occurrences.
- Remaining no-hit/unusable: `186` rows / `2421` occurrences.

## Family Statuses

| Family | Status | Commercial Export Prohibited | Allowed Now |
| --- | --- | ---: | ---: |
| BDB Dictionary | commercial_clean_candidate | false | false |
| BDB Aramaic Dictionary | commercial_clean_candidate | false | false |
| Jastrow Dictionary | commercial_clean_candidate | false | false |
| Klein Dictionary | noncommercial_educational_candidate | true | false |
| BDB Augmented Strong | blocked | true | false |

## Transform Contract Fields

- `token_id`
- `surface`
- `normalized`
- `occurrences`
- `lexicon_family`
- `family_status`
- `candidate_label`
- `candidate_text_placeholder_or_hash`
- `source_ref_or_url`
- `source_version_title`
- `source_license_group`
- `attribution_required`
- `attribution_text_or_link_required`
- `source_custody_manifest_ref`
- `derived_from_nc`
- `commercial_export_allowed`
- `noncommercial_display_planning_allowed`
- `corpus_contamination`
- `answer_eligible`
- `approved_for_public_emit`
- `public_emit_ready`

## Transform Rules

- `commercial_clean_public_domain_observed_family_rule`: applies to `commercial_clean_candidate`; output allowed now: `false`.
- `noncommercial_educational_klein_rule`: applies to `noncommercial_educational_candidate`; output allowed now: `false`.
- `blocked_bdb_augmented_strong_rule`: applies to `blocked`; output allowed now: `false`.

## NC Commercial Export Exclusion

Rows: `17`; occurrences: `259`.

Required NC flags: `derived_from_nc=true`, `commercial_export_allowed=false`, `attribution_required=true`, `corpus_contamination=false`.

## Next Dry-Run Requirements

- `must_remain_non_public`: `true`
- `may_use_family_statuses_as_planning_evidence`: `true`
- `must_not_store_definition_content`: `true`
- `must_not_emit_public_hud_or_route_rows`: `true`
- `must_not_set_answer_eligible_true`: `true`
- `must_preserve_nc_flags`: `true`
- `must_preserve_bdb_augmented_strong_block`: `true`
- `must_include_commercial_export_exclusion_manifest`: `true`
- `agent6_review_required_after_dry_run`: `true`

## Agent 8 Callback

- Status: Agent 10 NC-aware zero-emission transform-spec produced.
- Artifact path: `reports/agent10-orot-sefaria-nc-aware-zero-emission-transform-spec-2026-06-03.md`
- Artifact JSON: `reports/agent10-orot-sefaria-nc-aware-zero-emission-transform-spec-2026-06-03.json`
- Scope: Top-500 Orot/Sefaria family-status planning boundary only.
- Next executable route: Agent 2 may prepare one zero-emission non-public dry-run using this spec; no answer emission, public mutation, NC definition-content storage, or Agent 4 route.
- Public mutation blocked: `true`
- Agent 4 remains held: `true`

## Outputs

- Answer rows: `0`.
- Source rows: `0`.
- Public HUD rows: `0`.
- Route JSONL rows: `0`.
- Definition-content rows: `0`.
- NC definition-content rows: `0`.
- Runtime/source/token-index/lexical-payload files touched: `0`.

## What Must Not Be Accepted

- QA acceptance
- Source/provenance acceptance
- License acceptance
- Definition authority
- Usage-as-definition authority
- Answer acceptance
- Public/runtime acceptance
- Publication readiness
- Route publication support
- Product/data acceptance
- Translation output
- Accepted gloss
- Accepted text


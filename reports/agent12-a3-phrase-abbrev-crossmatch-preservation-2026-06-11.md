# A3 Phrase / Abbreviation Crossmatch Pipeline Preservation

Generated: 2026-06-11

Status: preservation note for pipeline redesign.

Boundary: planning/evidence pipeline preservation only. No Definition authority, no accepted gloss/text, no answer eligibility, no source/license/legal acceptance, no public/runtime/release action, no route mutation, and no lower-agent work order by itself.

## Why This Must Be Preserved

A14's phrase/abbreviation expansion work is valuable because it points to a reusable A3 pipeline: not just "what does this abbreviation mean," but "where else does this form, abbreviation, phrase, or pattern occur, and what existing source/lexical layer does it connect to?"

If this is lost, the company loses the repeatable crossmatch method behind phrase discovery. The risk is not just losing one report; the risk is losing the way to find recurrence, related forms, source occurrences, and evidence-only blockers across the corpus.

## Reference Artifacts

- `reports/a14-definition-expansion-phrase-abbreviation-build-2026-06-11.md`
- `reports/a14-definition-expansion-reference-abbrev-build-2026-06-11.md`
- `reports/a14-definition-expansion-rabbinic-reference-build-2026-06-11.md`
- `reports/workbench-usage-phrase-recurrence-index.md`
- `reports/phrase-subphrase-bulk-workflow.md`
- `reports/phrase-evidence-audit.md`
- `reports/sitewide-abbreviation-layer-report.md`

## A3 Pipeline Shape

`surface form / abbreviation / phrase window -> normalized form(s) -> possible base expansion -> source occurrence ids -> work/page/token-index evidence -> existing lexical/source-layer hit -> unresolved/blocker class -> handoff owner`

## A3 Output Contract

`pattern_id | surface | normalized | pattern_type | possible_expansion_or_base | work_ids | occurrence_count | sample_occurrence_ids | existing_source_layer_hit | route_or_lexical_ids_if_any | evidence_only_reason | blocker_class | next_owner | stop_condition`

## Pattern Types A3 Must Separate

| pattern_type | A3 meaning | downstream caution |
| --- | --- | --- |
| `abbreviation` | compact form likely expands to known term or phrase | evidence only until source/definition/display gates clear |
| `reference_abbreviation` | citation/reference shorthand such as rabbinic or work-reference abbreviations | should improve navigation/search before definition display |
| `phrase_abbreviation` | abbreviation or shortened marker standing for a phrase | needs occurrence/crossmatch evidence, not manual glossing |
| `prefix_suffix_parsed_form` | form resolved by conservative parser against an existing base | parser result is evidence, not final meaning |
| `recurring_phrase_window` | repeated source-token window around a focus token | usage/navigation evidence only |
| `maqaf_subphrase` | linked-token part or subphrase evidence | not a standalone definition by itself |
| `lemma_only_crossmatch` | lemma/source relation exists, but no safe display card | HUD-inspectable evidence; preHUD should fail closed unless display gate clears |
| `unsafe_prehud_blocked` | route/phrase evidence exists but display would be misleading | next owner must fix route/display gate or leave TBD |

## First Bounded Workset

Start with A14's latest phrase/abbreviation build and produce a small matrix, not a broad corpus rerun.

Input:

- `reports/a14-definition-expansion-phrase-abbreviation-build-2026-06-11.md`
- generated HUD token index used by that build
- existing lexical manifests/chunks referenced by that build
- existing phrase recurrence and abbreviation reports listed above

Workset:

- top 25 newly resolved parsed forms by occurrence count;
- top 25 still-unmatched forms that look abbreviation-like;
- top 25 recurring phrase windows linked to those forms;
- 5-10 hard negative examples where evidence must remain preHUD-blocked.

Output artifact:

- `reports/agent3-phrase-abbrev-crossmatch-matrix-YYYY-MM-DD.md`
- `reports/agent3-phrase-abbrev-crossmatch-matrix-YYYY-MM-DD.json`

## Required Fields

Each row must include:

- `pattern_id`
- `surface`
- `normalized`
- `pattern_type`
- `work_id`
- `occurrence_count`
- `sample_occurrence_ids`
- `sample_refs`
- `possible_expansion_or_base`
- `existing_source_layer_hit`
- `source_layer_ids`
- `route_or_lexical_ids_if_any`
- `display_gate_status`
- `evidence_only_reason`
- `blocker_class`
- `next_owner`
- `stop_condition`

## Blocker Classes

| blocker_class | meaning | next owner |
| --- | --- | --- |
| `needs_source_lane_classification` | source family or row custody is not classified | A1 |
| `needs_definition_transform` | classified source exists but no transform/display candidate exists | A2 |
| `needs_crossmatch_disambiguation` | multiple bases/expansions compete | A3 |
| `needs_changed_input_validation` | generated output exists but validator proof is missing | A4 |
| `needs_churn_packet` | repeatable render/build step lacks runnable packet | A5 |
| `needs_repo_evidence_docket` | output exists but dirt/proof classification is unresolved | A6 |
| `needs_final_gate` | evidence is ready but activation/approval is required | A7 |
| `needs_package_truth` | package/render intake is unclear | A10 |
| `prehud_blocked_evidence_only` | evidence is inspectable but must not display as preHUD gloss | A10/A14 for design, A7 for activation gate |

## Efficiency Rule

A14 may prototype/build the product-facing expansion layer. A3 should preserve the reusable evidence engine behind it:

`where else does this occur, what does it connect to, and why is it safe or blocked as evidence?`

A2 should not rediscover recurrence manually. A10 should not manually inspect every phrase. A5 should not render around unknown evidence. A3's matrix is the reusable middle layer that prevents those repeats.

## Stop Condition

This preservation note is complete when the method, input artifacts, output contract, first bounded workset, blocker classes, and authority boundary are recorded. It does not start lower-agent work by itself.


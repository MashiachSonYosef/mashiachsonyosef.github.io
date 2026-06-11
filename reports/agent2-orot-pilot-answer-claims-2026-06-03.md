# Agent 2 Orot Pilot Answer Claims Dry Run

Generated: 2026-06-04T19:15:00.920Z

## Boundary

Status: `zero_safe_output_blocker`

This artifact is a pipeline dry run only. It does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, source custody, publication readiness, Definition authority, usage-as-definition authority, accepted text, translation output, or public deploy approval.

## Inputs

- Queue: `reports/agent2-orot-full-answer-candidate-disambiguation-queue-2026-06-03.json`
- Agent 3 buckets: `reports/agent3-orot-gap-mechanical-buckets-2026-06-03.json`
- Target: `single_candidate_prefix_or_article_route_cards_without_answer_eligible_top100`
- Limit: `100`
- Orot manifest: `data/lexical/orot.manifest.json`
- Route lookup dir: `data/definitions/hud-route-lookup/shards`
- Definition claims: `.local-cache/definition-routes/source-layer-definition-claims.jsonl`
- Definition claims: `.local-cache/definition-routes/kaikki-definition-claims.jsonl`

## Counts

- Target rows: 100
- Target occurrences: 1960
- Source-clean rows for consideration: 87
- Source-blocked rows: 13
- Rows with exact upstream definition claim: 0
- Route cards inspected: 1897
- Route answer cards: 0
- Phrase evidence cards: 470
- Citable evidence cards: 1341
- Form cards: 67
- Lemma cards: 19
- Emitted answer rows: 0

## Top Blockers

- current_route_cards_are_non_answer: 100
- existing_cards_are_evidence_or_form_reference: 100
- missing_exact_upstream_definition_claim: 100
- missing_lexicon_entry_id: 13
- missing_orot_lexicon_entry: 13
- missing_orot_source_rows: 13

## Decision

No pilot JSONL was emitted. The top-100 target is source-clean enough for consideration in most rows, but the current generated definition-route claim files do not contain exact upstream answer claims for the target tokens. Existing route cards remain evidence/form-reference cards and are not promoted.

## Sample Evaluations

| priority | token | normalized | occ. | source | upstream claims | route cards | blockers |
|---:|---|---|---:|---|---:|---:|---|
| 1 | בכל | בכל | 338 | source_clean_consider | 0 | 5 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 2 | וכל | וכל | 204 | source_clean_consider | 0 | 5 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 3 | לכל | לכל | 102 | source_clean_consider | 0 | 5 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 4 | הכל | הכל | 97 | source_clean_consider | 0 | 46 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 5 | ואת | ואת | 87 | source_clean_consider | 0 | 5 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 6 | בה | בה | 82 | source_clean_consider | 0 | 46 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 7 | כ״א | כ״א | 67 | source_blocked | 0 | 5 | missing_lexicon_entry_id, missing_orot_lexicon_entry, missing_orot_source_rows, missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 8 | שהם | שהמ | 64 | source_clean_consider | 0 | 47 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 9 | להם | להמ | 62 | source_clean_consider | 0 | 47 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 10 | מצד | מצד | 60 | source_clean_consider | 0 | 5 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 11 | שיש | שיש | 55 | source_clean_consider | 0 | 46 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 12 | ועל | ועל | 55 | source_clean_consider | 0 | 5 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 13 | מאד | מאד | 42 | source_clean_consider | 0 | 49 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 14 | הכח | הכח | 31 | source_clean_consider | 0 | 46 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 15 | מהם | מהמ | 29 | source_clean_consider | 0 | 47 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 16 | ושל | ושל | 24 | source_clean_consider | 0 | 5 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 17 | בעת | בעת | 24 | source_clean_consider | 0 | 5 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 18 | הנם | הנמ | 23 | source_clean_consider | 0 | 33 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 19 | כשם | כשמ | 23 | source_clean_consider | 0 | 5 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 20 | ואם | ואמ | 22 | source_clean_consider | 0 | 5 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 21 | בשם | בשמ | 21 | source_clean_consider | 0 | 47 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 22 | החי | החי | 20 | source_clean_consider | 0 | 5 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 23 | מיד | מיד | 20 | source_clean_consider | 0 | 47 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 24 | ועם | ועמ | 19 | source_clean_consider | 0 | 5 | missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |
| 25 | ממה | ממה | 18 | source_blocked | 0 | 5 | missing_lexicon_entry_id, missing_orot_lexicon_entry, missing_orot_source_rows, missing_exact_upstream_definition_claim, current_route_cards_are_non_answer, existing_cards_are_evidence_or_form_reference |

## Next Safe Step

Generate or authorize an upstream definition-route claim source for the source-clean Orot rows, then rerun this script. The transform should continue to emit zero rows unless exact upstream definition-claim rejoin, source linkage, morphology/prefix safety, and homograph safety all pass.

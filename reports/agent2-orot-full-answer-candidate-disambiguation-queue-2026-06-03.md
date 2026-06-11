# Agent 2 Orot Full Answer-Candidate/Disambiguation Queue - 2026-06-03

Status: full non-authoritative Agent 2 queue derived from Agent 10 full reader-hint gap audit.

Highest permissible claim: this artifact classifies route-data work for remaining Orot reader-hint gaps. It does not emit accepted definitions, translation output, Definition authority, usage-as-definition authority, QA acceptance, source/provenance acceptance, publication readiness, or public HUD/runtime changes.

## Inputs

- Source audit: `.codex-tmp/hud-deploy-live/reports/agent10-orot-full-reader-hint-gap-audit-2026-06-03.json`
- Source audit sha256: `5a19cee0ab55b31ea53732e199deb12dd4fe35a6dfe569079af37a4e45eac6d6`
- Existing hints: 8729
- Existing hint occurrences: 40073
- Gap tokens: 8578
- Gap occurrences: 19733
- Route loader shards read in source audit: 3581
- Route loader missing shards in source audit: 218

## Queue Counts

| Category | Tokens | Occurrences | Agent 2 lane |
|---|---:|---:|---|
| route_cards_without_answer_eligible | 4337 | 10340 | answer_contract_repair_or_candidate_generation |
| ambiguous_answer_candidates | 2836 | 7559 | disambiguation_evidence |
| no_route_cards | 1405 | 1834 | new_route_row_generation |

## Non-Answer-Eligible Failures From Source Audit

| Failure Reason | Route Cards |
|---|---:|
| explicit_answer_eligible_false | 43341 |
| section_not_answer_production | 21228 |

## Exact Existing Pipeline Surface Observed

- `scripts/build_definition_routes.mjs` emits source-backed definition route claims into `.local-cache/definition-routes/kaikki-definition-claims.jsonl` and `.local-cache/definition-routes/source-layer-definition-claims.jsonl`.
- `scripts/build_citable_paraphrase_evidence.mjs` emits `.local-cache/definition-routes/source-citable-paraphrase-evidence.jsonl`; current rows are evidence-only for reader-answer purposes (`answer_eligible=false`, `answer_role=evidence`).
- `scripts/build_definition_gap_queue.mjs` builds a general phrase/citable gap queue, but it does not consume this Orot full gap audit and does not create accepted answer rows.
- `scripts/audit_definition_route_claims.mjs` and `scripts/validate_definition_route_claim_audit.mjs` validate generated route-claim rows after a fill-producing Agent 2 transform exists.

Bounded blocker: no existing script was identified that consumes this Orot full gap audit and emits contract-safe answer-candidate route rows for these tokens without new authority or manual definition invention. The full queue therefore stays non-promoting.

## Safe Agent 2 Actions

- For `route_cards_without_answer_eligible`: inspect existing cards and emit a separate answer-candidate row only if public source/license/citation, `boundary_safe`, `candidate_status=accepted`, `answer_eligible=true`, and `answer_role=answer` are produced by an authorized pipeline transform. Do not flip evidence or form-reference rows.
- For `ambiguous_answer_candidates`: produce disambiguation evidence among existing candidates; do not select accepted text unless the existing contract resolves the ambiguity.
- For `no_route_cards`: generate route rows keyed to lookup candidates only when source/license/citation rows and non-authority boundaries are attached.

## Top Queue Rows Overall

| Priority | Token ID | Occurrences | Surface | Normalized | Route Cards | Answer Eligible | Ambiguity | Candidates | Dominant Failure | Lane |
|---:|---|---:|---|---|---:|---:|---:|---:|---|---|
| 1 | `tok-20d2e105fd77` | 338 | בכל | בכל | 5 | 0 | 0 | 1 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 2 | `tok-f7199bc62ed1` | 245 | האומה | האומה | 43 | 2 | 2 | 4 |  | disambiguation_evidence |
| 3 | `tok-2a86b3eaee9b` | 204 | וכל | וכל | 5 | 0 | 0 | 1 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 4 | `tok-97b99c6afe4b` | 171 | האלהית | האלהית | 10 | 0 | 0 | 2 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 5 | `tok-6f3c380a7be9` | 132 | האדם | האדמ | 100 | 2 | 2 | 2 |  | disambiguation_evidence |
| 6 | `tok-bff9af2524d1` | 115 | שהיא | שהיא | 52 | 2 | 2 | 2 |  | disambiguation_evidence |
| 7 | `tok-1b76a9f88fc7` | 102 | לכל | לכל | 5 | 0 | 0 | 1 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 8 | `tok-cf9427570b0a` | 97 | הכל | הכל | 46 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 9 | `tok-dfcf4cc0af67` | 95 | הנשמה | הנשמה | 100 | 5 | 3 | 4 |  | disambiguation_evidence |
| 10 | `tok-35bce35c1de4` | 89 | הקודש | הקודש | 59 | 2 | 2 | 2 |  | disambiguation_evidence |
| 11 | `tok-42a5e912cd97` | 87 | ואת | ואת | 5 | 0 | 0 | 1 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 12 | `tok-6cb138a16634` | 83 | הלאומית | הלאומית | 1 | 0 | 0 | 3 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 13 | `tok-e858e9fa8bb8` | 82 | בה | בה | 46 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 14 | `tok-bf10df974281` | 67 | כ״א | כ״א | 5 | 0 | 0 | 1 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 15 | `tok-35f6d9093072` | 65 | האידיאה | האידיאה | 0 | 0 | 0 | 4 |  | new_route_row_generation |
| 16 | `tok-1bfe6fea9d85` | 64 | שהם | שהמ | 47 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 17 | `tok-180d57091846` | 63 | הולך | הולכ | 53 | 0 | 0 | 3 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 18 | `tok-3fc615d98aec` | 63 | ידי | ידי | 48 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 19 | `tok-b9470f18041a` | 62 | להם | להמ | 47 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 20 | `tok-16b3c5cb6ffe` | 60 | מצד | מצד | 5 | 0 | 0 | 1 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 21 | `tok-7094ebe18b8f` | 60 | הכללית | הכללית | 15 | 0 | 0 | 4 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 22 | `tok-c3803c6fde17` | 57 | חיי | חיי | 49 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 23 | `tok-1282c4d855bc` | 55 | שיש | שיש | 46 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 24 | `tok-e2d80b36f5bc` | 55 | ועל | ועל | 5 | 0 | 0 | 1 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 25 | `tok-12372a227ead` | 52 | אלהי | אלהי | 103 | 3 | 3 | 2 |  | disambiguation_evidence |
| 26 | `tok-7431485e6a2d` | 48 | הפנימי | הפנימי | 126 | 2 | 2 | 4 |  | disambiguation_evidence |
| 27 | `tok-89757cf23d0a` | 47 | ובכל | ובכל | 10 | 0 | 0 | 2 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 28 | `tok-c429d5466b33` | 47 | עליונה | עליונה | 82 | 2 | 2 | 2 |  | disambiguation_evidence |
| 29 | `tok-589103867952` | 46 | זאת | זאת | 48 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 30 | `tok-eb666901ae2d` | 45 | הכלל | הכלל | 97 | 3 | 3 | 2 |  | disambiguation_evidence |
| 31 | `tok-3e2962a4fa72` | 44 | חייה | חייה | 57 | 0 | 0 | 2 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 32 | `tok-cbcaf5b860b3` | 43 | לישראל | לישראל | 53 | 3 | 3 | 2 |  | disambiguation_evidence |
| 33 | `tok-2a3aa32e04a0` | 42 | מאד | מאד | 49 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 34 | `tok-cf451baa2149` | 40 | באור | באור | 94 | 3 | 3 | 2 |  | disambiguation_evidence |
| 35 | `tok-158f1752a1df` | 39 | דוקא | דוקא | 46 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 36 | `tok-887435dda3ab` | 38 | יוכל | יוכל | 46 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 37 | `tok-36d28ba0f9a5` | 37 | ואור | ואור | 53 | 3 | 3 | 2 |  | disambiguation_evidence |
| 38 | `tok-a58c4718ef01` | 37 | הולכת | הולכת | 27 | 0 | 0 | 3 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 39 | `tok-8ccbbb100a39` | 36 | ממנו | ממנו | 80 | 0 | 0 | 3 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 40 | `tok-f1522f221367` | 36 | הננו | הננו | 12 | 0 | 0 | 3 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |

## Top Route Cards Without Answer Eligibility

| Priority | Token ID | Occurrences | Surface | Normalized | Route Cards | Answer Eligible | Ambiguity | Candidates | Dominant Failure | Lane |
|---:|---|---:|---|---|---:|---:|---:|---:|---|---|
| 1 | `tok-20d2e105fd77` | 338 | בכל | בכל | 5 | 0 | 0 | 1 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 3 | `tok-2a86b3eaee9b` | 204 | וכל | וכל | 5 | 0 | 0 | 1 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 4 | `tok-97b99c6afe4b` | 171 | האלהית | האלהית | 10 | 0 | 0 | 2 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 7 | `tok-1b76a9f88fc7` | 102 | לכל | לכל | 5 | 0 | 0 | 1 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 8 | `tok-cf9427570b0a` | 97 | הכל | הכל | 46 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 11 | `tok-42a5e912cd97` | 87 | ואת | ואת | 5 | 0 | 0 | 1 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 12 | `tok-6cb138a16634` | 83 | הלאומית | הלאומית | 1 | 0 | 0 | 3 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 13 | `tok-e858e9fa8bb8` | 82 | בה | בה | 46 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 14 | `tok-bf10df974281` | 67 | כ״א | כ״א | 5 | 0 | 0 | 1 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 16 | `tok-1bfe6fea9d85` | 64 | שהם | שהמ | 47 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 17 | `tok-180d57091846` | 63 | הולך | הולכ | 53 | 0 | 0 | 3 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 18 | `tok-3fc615d98aec` | 63 | ידי | ידי | 48 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 19 | `tok-b9470f18041a` | 62 | להם | להמ | 47 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 20 | `tok-16b3c5cb6ffe` | 60 | מצד | מצד | 5 | 0 | 0 | 1 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 21 | `tok-7094ebe18b8f` | 60 | הכללית | הכללית | 15 | 0 | 0 | 4 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 22 | `tok-c3803c6fde17` | 57 | חיי | חיי | 49 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 23 | `tok-1282c4d855bc` | 55 | שיש | שיש | 46 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 24 | `tok-e2d80b36f5bc` | 55 | ועל | ועל | 5 | 0 | 0 | 1 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 27 | `tok-89757cf23d0a` | 47 | ובכל | ובכל | 10 | 0 | 0 | 2 | section_not_answer_production | answer_contract_repair_or_candidate_generation |
| 29 | `tok-589103867952` | 46 | זאת | זאת | 48 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 31 | `tok-3e2962a4fa72` | 44 | חייה | חייה | 57 | 0 | 0 | 2 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 33 | `tok-2a3aa32e04a0` | 42 | מאד | מאד | 49 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 35 | `tok-158f1752a1df` | 39 | דוקא | דוקא | 46 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 36 | `tok-887435dda3ab` | 38 | יוכל | יוכל | 46 | 0 | 0 | 1 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |
| 38 | `tok-a58c4718ef01` | 37 | הולכת | הולכת | 27 | 0 | 0 | 3 | explicit_answer_eligible_false | answer_contract_repair_or_candidate_generation |

## Top Ambiguous Answer Candidates

| Priority | Token ID | Occurrences | Surface | Normalized | Route Cards | Answer Eligible | Ambiguity | Candidates | Dominant Failure | Lane |
|---:|---|---:|---|---|---:|---:|---:|---:|---|---|
| 2 | `tok-f7199bc62ed1` | 245 | האומה | האומה | 43 | 2 | 2 | 4 |  | disambiguation_evidence |
| 5 | `tok-6f3c380a7be9` | 132 | האדם | האדמ | 100 | 2 | 2 | 2 |  | disambiguation_evidence |
| 6 | `tok-bff9af2524d1` | 115 | שהיא | שהיא | 52 | 2 | 2 | 2 |  | disambiguation_evidence |
| 9 | `tok-dfcf4cc0af67` | 95 | הנשמה | הנשמה | 100 | 5 | 3 | 4 |  | disambiguation_evidence |
| 10 | `tok-35bce35c1de4` | 89 | הקודש | הקודש | 59 | 2 | 2 | 2 |  | disambiguation_evidence |
| 25 | `tok-12372a227ead` | 52 | אלהי | אלהי | 103 | 3 | 3 | 2 |  | disambiguation_evidence |
| 26 | `tok-7431485e6a2d` | 48 | הפנימי | הפנימי | 126 | 2 | 2 | 4 |  | disambiguation_evidence |
| 28 | `tok-c429d5466b33` | 47 | עליונה | עליונה | 82 | 2 | 2 | 2 |  | disambiguation_evidence |
| 30 | `tok-eb666901ae2d` | 45 | הכלל | הכלל | 97 | 3 | 3 | 2 |  | disambiguation_evidence |
| 32 | `tok-cbcaf5b860b3` | 43 | לישראל | לישראל | 53 | 3 | 3 | 2 |  | disambiguation_evidence |
| 34 | `tok-cf451baa2149` | 40 | באור | באור | 94 | 3 | 3 | 2 |  | disambiguation_evidence |
| 37 | `tok-36d28ba0f9a5` | 37 | ואור | ואור | 53 | 3 | 3 | 2 |  | disambiguation_evidence |
| 41 | `tok-60a27691865f` | 35 | הדבר | הדבר | 102 | 4 | 4 | 2 |  | disambiguation_evidence |
| 42 | `tok-1a35c95f43fd` | 34 | הגדולה | הגדולה | 148 | 2 | 2 | 4 |  | disambiguation_evidence |
| 43 | `tok-dbb8e6989d3b` | 34 | עצמו | עצמו | 98 | 4 | 4 | 2 |  | disambiguation_evidence |
| 44 | `tok-469ec3fd3748` | 33 | ההכרה | ההכרה | 62 | 4 | 4 | 5 |  | disambiguation_evidence |
| 47 | `tok-09a1636a29b2` | 32 | הטבע | הטבע | 94 | 2 | 2 | 2 |  | disambiguation_evidence |
| 48 | `tok-4104e97f06f2` | 32 | האלהות | האלהות | 68 | 3 | 3 | 4 |  | disambiguation_evidence |
| 49 | `tok-7d224139cc6b` | 32 | ואין | ואינ | 54 | 3 | 3 | 2 |  | disambiguation_evidence |
| 52 | `tok-e9c4106d3e47` | 32 | ומתוך | ומתוכ | 126 | 3 | 2 | 5 |  | disambiguation_evidence |
| 54 | `tok-215ac6b05de2` | 31 | והיא | והיא | 52 | 2 | 2 | 2 |  | disambiguation_evidence |
| 56 | `tok-0a04ca1d499c` | 30 | עליה | עליה | 105 | 2 | 2 | 2 |  | disambiguation_evidence |
| 57 | `tok-3b3b23913614` | 30 | וממילא | וממילא | 15 | 2 | 2 | 4 |  | disambiguation_evidence |
| 58 | `tok-6eba3a1f006f` | 30 | ממנה | ממנה | 110 | 3 | 3 | 3 |  | disambiguation_evidence |
| 60 | `tok-5b3a248a97f5` | 29 | באומה | באומה | 38 | 2 | 2 | 4 |  | disambiguation_evidence |

## Top No Route Cards

| Priority | Token ID | Occurrences | Surface | Normalized | Route Cards | Answer Eligible | Ambiguity | Candidates | Dominant Failure | Lane |
|---:|---|---:|---|---|---:|---:|---:|---:|---|---|
| 15 | `tok-35f6d9093072` | 65 | האידיאה | האידיאה | 0 | 0 | 0 | 4 |  | new_route_row_generation |
| 124 | `tok-b9d6f7e12df1` | 17 | ישראל" | ישראל" | 0 | 0 | 0 | 1 |  | new_route_row_generation |
| 177 | `tok-eea5d413eb38` | 13 | ד׳" | ד׳" | 0 | 0 | 0 | 1 |  | new_route_row_generation |
| 185 | `tok-586f2b4c02d5` | 12 | בד׳ | בד׳ | 0 | 0 | 0 | 1 |  | new_route_row_generation |
| 201 | `tok-442b86be40a1` | 11 | הנשמתית | הנשמתית | 0 | 0 | 0 | 2 |  | new_route_row_generation |
| 206 | `tok-7ecfddea7341` | 11 | האידיאלית | האידיאלית | 0 | 0 | 0 | 2 |  | new_route_row_generation |
| 222 | `tok-2c9a45a0cac5` | 10 | ביחש | ביחש | 0 | 0 | 0 | 2 |  | new_route_row_generation |
| 226 | `tok-70dd198010e3` | 10 | לד׳ | לד׳ | 0 | 0 | 0 | 1 |  | new_route_row_generation |
| 273 | `tok-c80dfe1a9f43` | 9 | האידיאות | האידיאות | 0 | 0 | 0 | 4 |  | new_route_row_generation |
| 281 | `tok-008fc1c6a929` | 8 | צביון | צביונ | 0 | 0 | 0 | 1 |  | new_route_row_generation |
| 289 | `tok-275d6a19444a` | 8 | החוצפא | החוצפא | 0 | 0 | 0 | 2 |  | new_route_row_generation |
| 313 | `tok-be51d34c8745` | 8 | הסבתית | הסבתית | 0 | 0 | 0 | 2 |  | new_route_row_generation |
| 324 | `tok-fb9a2ed877ae` | 8 | יחש | יחש | 0 | 0 | 0 | 1 |  | new_route_row_generation |
| 383 | `tok-07e573b57bd4` | 6 | יפעת | יפעת | 0 | 0 | 0 | 1 |  | new_route_row_generation |
| 413 | `tok-52f9d95b917d` | 6 | צביונה | צביונה | 0 | 0 | 0 | 2 |  | new_route_row_generation |
| 415 | `tok-549dd85fcf04` | 6 | אידיאלית | אידיאלית | 0 | 0 | 0 | 1 |  | new_route_row_generation |
| 457 | `tok-defe901a9b3b` | 6 | הצביון | הצביונ | 0 | 0 | 0 | 2 |  | new_route_row_generation |
| 472 | `tok-03a2bd3d6fdd` | 5 | שהאידיאה | שהאידיאה | 0 | 0 | 0 | 6 |  | new_route_row_generation |
| 501 | `tok-3c6c0cf83767` | 5 | והאידיאה | והאידיאה | 0 | 0 | 0 | 6 |  | new_route_row_generation |
| 527 | `tok-7aad7dd693a9` | 5 | ההיסתורית | ההיסתורית | 0 | 0 | 0 | 3 |  | new_route_row_generation |
| 544 | `tok-90854fac0577` | 5 | ומתרחב | ומתרחב | 0 | 0 | 0 | 3 |  | new_route_row_generation |
| 645 | `tok-32976dcd2efc` | 4 | ומתבררת | ומתבררת | 0 | 0 | 0 | 3 |  | new_route_row_generation |
| 673 | `tok-516d1ed86a7a` | 4 | גשמית | גשמית | 0 | 0 | 0 | 1 |  | new_route_row_generation |
| 675 | `tok-53576a9d8d9e` | 4 | טללי | טללי | 0 | 0 | 0 | 2 |  | new_route_row_generation |
| 737 | `tok-9b9a3855206d` | 4 | יוחל | יוחל | 0 | 0 | 0 | 1 |  | new_route_row_generation |

## Validation

This queue is not a route-claim JSONL and should not be treated as fill-producing. Validate by parsing the JSON and checking the counts against the Agent 10 full audit.


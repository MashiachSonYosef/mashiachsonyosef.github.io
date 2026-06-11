# Agent 2 Orot Pilot Lineage Candidates

Generated: 2026-06-04T01:24:38.473Z

## Boundary

This is a lineage-candidate artifact only. It does not emit answer rows, does not choose definitions, does not alter HUD/public files, and does not claim QA acceptance, source/provenance acceptance, publication readiness, Definition authority, usage-as-definition authority, accepted text, or translation output.

## Inputs

- Agent 3 buckets: `reports/agent3-orot-gap-mechanical-buckets-2026-06-03.json`
- Target: `single_candidate_prefix_or_article_route_cards_without_answer_eligible_top100`
- Limit: `100`
- Orot manifest: `data/lexical/orot.manifest.json`
- Definition claims: `.local-cache/definition-routes/source-layer-definition-claims.jsonl`
- Definition claims: `.local-cache/definition-routes/kaikki-definition-claims.jsonl`

## Counts

- Target rows: 100
- Target occurrences: 1960
- Source-clean rows: 87
- Source-blocked rows: 13
- Exact single-candidate rows: 0
- Stem single-candidate rows: 18
- Stem multi-candidate rows: 65
- Stem missing-candidate rows: 17
- Project-preferred stem candidate rows: 22
- Current answer emit-ready rows: 0

## Lineage Status

| status | rows | occurrences |
|---|---:|---:|
| blocked_ambiguous_stem_claims | 42 | 483 |
| project_preferred_stem_candidate_requires_lineage_contract | 19 | 1024 |
| blocked_no_upstream_claim | 14 | 146 |
| blocked_missing_lexicon_entry | 13 | 129 |
| stem_single_candidate_requires_lineage_contract | 12 | 178 |

## Top Candidate Rows

| token | stem | occ. | status | stem claims | project claims |
|---|---|---:|---|---:|---:|
| בכל | כל | 338 | project_preferred_stem_candidate_requires_lineage_contract | 2 | 1 |
| וכל | כל | 204 | project_preferred_stem_candidate_requires_lineage_contract | 2 | 1 |
| לכל | כל | 102 | project_preferred_stem_candidate_requires_lineage_contract | 2 | 1 |
| הכל | כל | 97 | project_preferred_stem_candidate_requires_lineage_contract | 2 | 1 |
| ואת | את | 87 | project_preferred_stem_candidate_requires_lineage_contract | 5 | 1 |
| ועל | על | 55 | project_preferred_stem_candidate_requires_lineage_contract | 3 | 1 |
| מאד | אד | 42 | stem_single_candidate_requires_lineage_contract | 1 | 0 |
| הכח | כח | 31 | stem_single_candidate_requires_lineage_contract | 1 | 0 |
| ושל | של | 24 | project_preferred_stem_candidate_requires_lineage_contract | 2 | 1 |
| בעת | עת | 24 | stem_single_candidate_requires_lineage_contract | 1 | 0 |
| הנם | נמ | 23 | stem_single_candidate_requires_lineage_contract | 1 | 0 |
| ואם | אמ | 22 | project_preferred_stem_candidate_requires_lineage_contract | 3 | 1 |
| מיד | יד | 20 | stem_single_candidate_requires_lineage_contract | 1 | 0 |
| ועם | עמ | 19 | project_preferred_stem_candidate_requires_lineage_contract | 3 | 1 |
| לעם | עמ | 16 | project_preferred_stem_candidate_requires_lineage_contract | 3 | 1 |
| שעל | על | 15 | project_preferred_stem_candidate_requires_lineage_contract | 3 | 1 |
| ואל | אל | 14 | project_preferred_stem_candidate_requires_lineage_contract | 8 | 1 |
| ומה | מה | 13 | project_preferred_stem_candidate_requires_lineage_contract | 3 | 1 |
| כלו | לו | 12 | stem_single_candidate_requires_lineage_contract | 1 | 0 |
| ביד | יד | 9 | stem_single_candidate_requires_lineage_contract | 1 | 0 |
| בים | ימ | 5 | stem_single_candidate_requires_lineage_contract | 1 | 0 |
| בזו | זו | 5 | project_preferred_stem_candidate_requires_lineage_contract | 4 | 1 |
| ומי | מי | 4 | stem_single_candidate_requires_lineage_contract | 1 | 0 |
| הדם | דמ | 3 | stem_single_candidate_requires_lineage_contract | 1 | 0 |
| לאל | אל | 3 | project_preferred_stem_candidate_requires_lineage_contract | 8 | 1 |

## Decision

No row is answer-emission ready. The useful next contract is a non-semantic lineage rule that can carry `lookup_relation` plus selected `claim_id` or `card_id` from the queue into the answer-claim transform. Until that exists, stem candidates remain candidates only.

# Agent 10 Orot Full Reader-Hint Gap Audit - 2026-06-03

Status: full Orot reader-hint gap audit produced from current pipeline route lookup data.

Highest permissible claim: this artifact classifies the remaining Orot reader-hint gap. It does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, usage-as-definition authority, accepted translation text, or translation output.

## Coverage

- Occurrence token count: `59806`
- Unique token id count: `17307`
- Existing hint count: `8729`
- Existing hint occurrences: `40073`
- Gap token count: `8578`
- Gap occurrences: `19733`

## Gap Categories

| Category | Tokens | Occurrences |
|---|---:|---:|
| route_cards_without_answer_eligible | 4337 | 10340 |
| ambiguous_answer_candidates | 2836 | 7559 |
| no_route_cards | 1405 | 1834 |

## Non-Answer-Eligible Card Failure Reasons

| Failure Reason | Route Cards |
|---|---:|
| explicit_answer_eligible_false | 43341 |
| section_not_answer_production | 21228 |

## Top Gap Tokens

| Priority | Token ID | Occurrences | Category | Route Cards | Answer Eligible | Ambiguity Count | Dominant Failure |
|---:|---|---:|---|---:|---:|---:|---|
| 1 | `tok-20d2e105fd77` | 338 | route_cards_without_answer_eligible | 5 | 0 | 0 | section_not_answer_production |
| 2 | `tok-f7199bc62ed1` | 245 | ambiguous_answer_candidates | 43 | 2 | 2 |  |
| 3 | `tok-2a86b3eaee9b` | 204 | route_cards_without_answer_eligible | 5 | 0 | 0 | section_not_answer_production |
| 4 | `tok-97b99c6afe4b` | 171 | route_cards_without_answer_eligible | 10 | 0 | 0 | section_not_answer_production |
| 5 | `tok-6f3c380a7be9` | 132 | ambiguous_answer_candidates | 100 | 2 | 2 |  |
| 6 | `tok-bff9af2524d1` | 115 | ambiguous_answer_candidates | 52 | 2 | 2 |  |
| 7 | `tok-1b76a9f88fc7` | 102 | route_cards_without_answer_eligible | 5 | 0 | 0 | section_not_answer_production |
| 8 | `tok-cf9427570b0a` | 97 | route_cards_without_answer_eligible | 46 | 0 | 0 | explicit_answer_eligible_false |
| 9 | `tok-dfcf4cc0af67` | 95 | ambiguous_answer_candidates | 100 | 5 | 3 |  |
| 10 | `tok-35bce35c1de4` | 89 | ambiguous_answer_candidates | 59 | 2 | 2 |  |
| 11 | `tok-42a5e912cd97` | 87 | route_cards_without_answer_eligible | 5 | 0 | 0 | section_not_answer_production |
| 12 | `tok-6cb138a16634` | 83 | route_cards_without_answer_eligible | 1 | 0 | 0 | explicit_answer_eligible_false |
| 13 | `tok-e858e9fa8bb8` | 82 | route_cards_without_answer_eligible | 46 | 0 | 0 | explicit_answer_eligible_false |
| 14 | `tok-bf10df974281` | 67 | route_cards_without_answer_eligible | 5 | 0 | 0 | section_not_answer_production |
| 15 | `tok-35f6d9093072` | 65 | no_route_cards | 0 | 0 | 0 |  |
| 16 | `tok-1bfe6fea9d85` | 64 | route_cards_without_answer_eligible | 47 | 0 | 0 | explicit_answer_eligible_false |
| 17 | `tok-180d57091846` | 63 | route_cards_without_answer_eligible | 53 | 0 | 0 | explicit_answer_eligible_false |
| 18 | `tok-3fc615d98aec` | 63 | route_cards_without_answer_eligible | 48 | 0 | 0 | explicit_answer_eligible_false |
| 19 | `tok-b9470f18041a` | 62 | route_cards_without_answer_eligible | 47 | 0 | 0 | explicit_answer_eligible_false |
| 20 | `tok-16b3c5cb6ffe` | 60 | route_cards_without_answer_eligible | 5 | 0 | 0 | section_not_answer_production |

## Route Loader

- Shards read: `3581`
- Missing shards: `218`

## Agent 2 Direction

The full gap is now classified. Tokens in `route_cards_without_answer_eligible` need answer-candidate rows or contract-authorized route-data changes; tokens in `ambiguous_answer_candidates` need disambiguation evidence; tokens in `no_route_cards` need new route rows keyed to the generated lookup candidates.

Agent 1 remains asleep unless Agent 2 finds a new source/provenance blocker. Agent 4 remains asleep until Agent 10 has a new package to prove.

JSON detail: `reports/agent10-orot-full-reader-hint-gap-audit-2026-06-03.json`.

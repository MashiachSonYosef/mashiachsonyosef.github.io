# Agent 10 Orot Answer Contract Failure Audit - 2026-06-03

Status: answer-contract failure audit produced for top Orot gap tokens whose route cards exist but do not produce reader hints.

Highest permissible claim: this is pipeline contract evidence only. It does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, usage-as-definition authority, accepted translation text, or translation output.

## Summary

- Tokens audited: `18`
- Route cards audited: `443`

## Failure Reasons

| Reason | Route Cards |
|---|---:|
| explicit_answer_eligible_false | 338 |
| section_not_answer_production | 105 |

## Sections

| Section | Route Cards |
|---|---:|
| citable_paraphrase_evidence | 320 |
| phrase_evidence | 105 |
| strict_hebrew | 12 |
| lemma | 6 |

## Token Rows

| Priority | Token ID | Occurrences | Route Cards | Failure Reasons |
|---:|---|---:|---:|---|
| 1 | `tok-20d2e105fd77` | 338 | 5 | section_not_answer_production:5 |
| 3 | `tok-2a86b3eaee9b` | 204 | 5 | section_not_answer_production:5 |
| 4 | `tok-97b99c6afe4b` | 171 | 10 | section_not_answer_production:10 |
| 7 | `tok-1b76a9f88fc7` | 102 | 5 | section_not_answer_production:5 |
| 8 | `tok-cf9427570b0a` | 97 | 46 | explicit_answer_eligible_false:41; section_not_answer_production:5 |
| 11 | `tok-42a5e912cd97` | 87 | 5 | section_not_answer_production:5 |
| 12 | `tok-6cb138a16634` | 83 | 1 | explicit_answer_eligible_false:1 |
| 13 | `tok-e858e9fa8bb8` | 82 | 46 | explicit_answer_eligible_false:41; section_not_answer_production:5 |
| 14 | `tok-bf10df974281` | 67 | 5 | section_not_answer_production:5 |
| 16 | `tok-1bfe6fea9d85` | 64 | 47 | explicit_answer_eligible_false:42; section_not_answer_production:5 |
| 17 | `tok-180d57091846` | 63 | 53 | explicit_answer_eligible_false:43; section_not_answer_production:10 |
| 18 | `tok-3fc615d98aec` | 63 | 48 | explicit_answer_eligible_false:43; section_not_answer_production:5 |

## Agent 2 Direction

The dominant failure is not missing source rows. Existing cards usually fail because they are `phrase_evidence`, have `answer_role`/`answer_eligible` contracts that do not permit public reader hints, or carry evidence sections without a permitted answer contract.

Agent 2 should produce pipeline answer-candidate rows or contract adjustments for these tokens. Any adjustment must preserve source/license/citation rows and must not mark a gloss as accepted truth.

JSON detail: `reports/agent10-orot-answer-contract-failure-audit-2026-06-03.json`.

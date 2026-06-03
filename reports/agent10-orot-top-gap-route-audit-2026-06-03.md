# Agent 10 Orot Top Gap Route Audit - 2026-06-03

Status: top-gap route audit produced from existing pipeline lookup data.

Highest permissible claim: this is route-card evidence for Orot reader-hint gaps. It does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, usage-as-definition authority, accepted translation text, or translation output.

## Summary

- Audited top gap tokens: `25`
- No route cards for generated lookup candidates: `1`
- Route cards exist but none are answer-eligible: `18`
- Ambiguous answer candidates: `6`
- Missing token rows: `0`
- Route loader shards read: `35`
- Route loader missing shards: `0`

## Top Audit Rows

| Priority | Token ID | Occurrences | Stage F Reason | Route Cards | Answer Eligible | Ambiguity Count | Blocker |
|---:|---|---:|---|---:|---:|---:|---|
| 1 | `tok-20d2e105fd77` | 338 | no_answer | 5 | 0 | 0 | route cards exist but none are answer-eligible under current public reader-hint contract |
| 2 | `tok-f7199bc62ed1` | 245 | ambiguous | 43 | 2 | 2 | multiple close answer candidates require pipeline disambiguation |
| 3 | `tok-2a86b3eaee9b` | 204 | no_answer | 5 | 0 | 0 | route cards exist but none are answer-eligible under current public reader-hint contract |
| 4 | `tok-97b99c6afe4b` | 171 | no_answer | 10 | 0 | 0 | route cards exist but none are answer-eligible under current public reader-hint contract |
| 5 | `tok-6f3c380a7be9` | 132 | ambiguous | 100 | 2 | 2 | multiple close answer candidates require pipeline disambiguation |
| 6 | `tok-bff9af2524d1` | 115 | ambiguous | 52 | 2 | 2 | multiple close answer candidates require pipeline disambiguation |
| 7 | `tok-1b76a9f88fc7` | 102 | no_answer | 5 | 0 | 0 | route cards exist but none are answer-eligible under current public reader-hint contract |
| 8 | `tok-cf9427570b0a` | 97 | no_answer | 46 | 0 | 0 | route cards exist but none are answer-eligible under current public reader-hint contract |
| 9 | `tok-dfcf4cc0af67` | 95 | ambiguous | 100 | 5 | 3 | multiple close answer candidates require pipeline disambiguation |
| 10 | `tok-35bce35c1de4` | 89 | ambiguous | 59 | 2 | 2 | multiple close answer candidates require pipeline disambiguation |
| 11 | `tok-42a5e912cd97` | 87 | no_answer | 5 | 0 | 0 | route cards exist but none are answer-eligible under current public reader-hint contract |
| 12 | `tok-6cb138a16634` | 83 | no_answer | 1 | 0 | 0 | route cards exist but none are answer-eligible under current public reader-hint contract |
| 13 | `tok-e858e9fa8bb8` | 82 | no_answer | 46 | 0 | 0 | route cards exist but none are answer-eligible under current public reader-hint contract |
| 14 | `tok-bf10df974281` | 67 | no_answer | 5 | 0 | 0 | route cards exist but none are answer-eligible under current public reader-hint contract |
| 15 | `tok-35f6d9093072` | 65 | no_answer | 0 | 0 | 0 | no route cards for generated lookup candidates |

## Agent 2 Direction

For tokens with no route cards, Agent 2 needs to produce pipeline route rows keyed so the existing lookup-candidate generator can find them.

For tokens with route cards but no answer-eligible cards, Agent 2 needs to produce or adjust pipeline route rows so they satisfy the public reader-hint answer contract. This means evidence rows must be in an allowed production section, have a renderable definition/gloss/meaning claim, pass answer-role rules, and include public source/license/citation rows.

For ambiguous tokens, Agent 2 needs a disambiguation packet or route-data adjustment. Do not choose highest score as truth; preserve the candidate boundary.

JSON detail: `reports\agent10-orot-top-gap-route-audit-2026-06-03.json`.

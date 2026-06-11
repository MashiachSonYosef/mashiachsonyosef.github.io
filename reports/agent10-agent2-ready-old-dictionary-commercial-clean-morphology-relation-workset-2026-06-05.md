# Agent 10 Agent2-Ready Old-Dictionary Commercial-Clean Morphology Relation Workset - 2026-06-05

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`.

Purpose: give Agent 2 an exact non-public morphology-relation workset for the old-dictionary commercial-clean rows. This is not a transform package and emits no candidate text.

## Inputs

- `reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json`
- `reports/agent2-old-dictionary-excluded-row-transform-readiness-matrix-2026-06-05.json`
- `reports/agent10-agent2-old-dictionary-excluded-row-readiness-consumption-2026-06-05.json`

## Counts

- Unique preview rows / occurrences: 297 / 5747
- Commercial-clean source-family hit rows / occurrences: 500 / 10940
- Allowed transform rows now: 0
- Candidate/definition/lemma/reader-hint/answer/public rows now: 0

## Relation-Class Split

| preview relation class | rows | occurrences |
| --- | ---: | ---: |
| `exact_after_mark_strip` | 78 | 1461 |
| `needs_morphology_disambiguation` | 90 | 1251 |
| `prefix_or_clitic_possible` | 129 | 3035 |

## Commercial Family Hit Totals

| source family | lane | source-family hit rows | source-family hit occurrences |
| --- | --- | ---: | ---: |
| BDB Aramaic Dictionary | `commercial_clean_candidate` | 69 | 2048 |
| BDB Dictionary | `commercial_clean_candidate` | 221 | 4418 |
| Jastrow Dictionary | `commercial_clean_candidate` | 210 | 4474 |

## Agent 2 Work Question

For each row, classify whether a deterministic morphology relation is approved, still blocked, or not applicable for future non-public definition/lemma/reader-hint input planning. Do not emit candidate text, answer rows, public rows, Definition content, accepted text, route JSONL, route shards, runtime files, source files, token-index files, or lexical payloads.

Required output:

- JSON: `reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json`
- MD: `reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.md`

Agent 6 boundary need: none for this workset. If Agent 2 later proposes approved morphology relation rows or candidate-use behavior, Agent 10 must assemble a new exact Agent 6 row/subset packet before any downstream use.

Stop condition: stop after Agent 2 returns the exact morphology relation matrix or exact row/subset blocker. No current Agent 6 route or release action is opened by this workset.

What must not be accepted: QA acceptance, source/provenance acceptance, license/legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, definition-content storage, candidate text export, commercial export permission, NC commercial authorization, or release action.

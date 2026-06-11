# Agent 7 Spark Agent-Limit Continuation Rule - 2026-06-04

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`

## Rule

If Agents 1-4 or Agent 10 hit token limit, Sparks should keep working from the last usable pipeline contract or partial handoff when that handoff is mechanically sufficient.

The limited Agent resumes later for packaging, decision, next pipeline authoring, or authority-sensitive routing.

## Required Limited-Agent Handoff

`target | files used | counts/rows/data | next command | missing fields | handoff owner | stop condition`

## Required Spark Continuation Proof

`agent limited | spark continuing | pipeline data used | mechanical step | output artifact | missing fields | next handoff`

## Current Spark-3 Run Return

| spark | current state | pipeline data used | mechanical step | output artifact | next handoff |
| --- | --- | --- | --- | --- | --- |
| Spark-3 | `run_returned_orot_dedupe_contract` | Agent-3-authored contract `reports/agent3-spark3-linkage-dedupe-navigation-pipeline-contract-2026-06-04.md/json` plus scripts `scripts/build_agent3_orot_route_card_candidate_card_dedupe_review.mjs` and `scripts/validate_agent3_orot_route_card_candidate_card_dedupe_review.mjs` | Build and validate Orot 169-row route-card/candidate-card dedupe review | `reports/spark3-orot-169-row-route-card-candidate-card-dedupe-contract-run-2026-06-04.md`; produced/checked `reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.md/json` | Agent 3/Agent 10 consumes. Next Spark-3 wake is Deuteronomy phase-2 contract only after exact target rows/work manifest, input matrix, schema, duplicate-key rules, validator/gate, and stop condition exist. |

Counts from Spark-3 return:
- Rows: 169
- Occurrences: 2148
- Blocker rows: 168
- Unique duplicate keys: 169
- Build exit: 0
- Validate exit: 0

## Boundary

Staffing/continuation rule only. No QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, accepted text, public reader output, route-shard edit, public/runtime mutation, source mutation, token-index mutation, lexical-payload mutation, or answer eligibility. Publication remains `blocked_no_render`.

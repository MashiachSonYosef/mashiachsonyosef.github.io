# Spark-3 Orot 169-row Route-Card/Candidate-Card Dedupe Contract Run

- contract files read:
  - reports/agent3-spark3-linkage-dedupe-navigation-pipeline-contract-2026-06-04.md
  - reports/agent3-spark3-linkage-dedupe-navigation-pipeline-contract-2026-06-04.json

## Commands Run
1. 
ode scripts/build_agent3_orot_route_card_candidate_card_dedupe_review.mjs -> exit code $buildExit
2. 
ode scripts/validate_agent3_orot_route_card_candidate_card_dedupe_review.mjs -> exit code $validateExit

## Command Results
- build output:

`
wrote reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.json
wrote reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.md
Agent 3 Orot dedupe review: rows 169; occurrences 2148; blocker rows 168; duplicate collisions 0
`

- validate output:

`
Agent 3 Orot route-card/candidate-card dedupe review validation passed: rows 169; blocker rows 168; duplicate keys 169
`

## Counts
- rows: 169
- occurrences: 2148
- blocker rows: 168
- unique duplicate keys: 169

## Output Artifacts Produced/Checked
- reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.json
- reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.md

## Blocker
- none

## Next Reseed / Wake Condition
Await next exact contract only: Deuteronomy phase-2 work (missing_pipeline_blocker_until_seeded) until a contract supplies its target rows/work manifest, input matrix, schema, duplicate-key rules, validator/gate, and stop condition.

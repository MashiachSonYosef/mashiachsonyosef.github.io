# Agent2 Full-Corpus Batch01 Render Staging Consumption Validation

Generated: 2026-06-07 13:35Z

## Target

Validate `reports/agent2-full-corpus-batch01-flagship-render-staging-consumption-2026-06-07.json`.

## Validator

- `scripts/validate_agent2_full_corpus_batch01_flagship_render_staging_consumption.mjs`

## Command

- `node scripts\validate_agent2_full_corpus_batch01_flagship_render_staging_consumption.mjs reports\agent2-full-corpus-batch01-flagship-render-staging-consumption-2026-06-07.json`
- timeout: 120000 ms
- process_timeout: false

## Result

- passed: true
- output: `Agent2 full-corpus batch01 render staging consumption validation passed. Ready pages: 20; blocked pages: 0; bad pre-HUD glosses: 0.`

## Validated Counts

- batch_rows: 20
- render_ready_stage_candidate_pages: 20
- blocked_validator_pages: 0
- token_rows_total: 184647
- configured_hint_rows_total: 26148
- expected_tbd_rows_total: 158776
- browser_proof_pages: 3
- bad_prehud_glosses: 0
- public_runtime_acceptance_claims: 0
- definition_acceptance_claims: 0
- answer_acceptance_claims: 0
- release_actions: 0
- route_shard_writes: 0

## Stale Source Correction

The first read saw `BATCH01_19_READY_1_BLOCKED_DIRECT_RENDER_CONTRACT`. Validation caught that the source had changed to `BATCH01_20_READY_DIRECT_RENDER_CONTRACT`. Agent2 patched the consumption artifact to the current 20-ready source state before validating.

## Boundary

Render/pre-HUD staging only. No source/license/legal/Definition/product/answer/accepted-text acceptance, no public/runtime acceptance, no route shard write, no repo cleanup action, no publication readiness claim, no release action.

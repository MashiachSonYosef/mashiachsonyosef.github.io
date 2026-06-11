# Agent 1 Spark-1 Pipeline Contract — Orot Third-Missed Source Family (2026-06-05)

Status: `pipeline_contract_runnable_validated`

## Target

work: `Orot`  
workset: `third missed dictionary/source-family after next-missed`  
candidate rows / occurrences: `169` / `2148`  

## Inputs

- `reports/agent1-third-missed-source-family-input-rows-2026-06-05.json`
- `reports/agent1-third-missed-source-family-target-or-blocker-2026-06-05.json`
- `data/search/lemma-form-index.jsonl`

## Commands

- build: `node scripts/build_agent1_orot_third_missed_source_family_pipeline.mjs`
- validate: `node scripts/validate_agent1_orot_third_missed_source_family_pipeline.mjs`
- contract-validator: `node scripts/validate_agent1_spark1_orot_third_missed_source_family_contract.mjs`

## Outputs

- json: `reports/agent1-orot-third-missed-source-family-map-2026-06-05.json`
- md: `reports/agent1-orot-third-missed-source-family-map-2026-06-05.md`

## License Classes

- `commercial_clean_candidate`
- `noncommercial_educational_candidate`
- `metadata_or_link_only`
- `blocked_or_needs_review`

## Target lane split (contract basis)

- commercial-clean: `138` rows / `1672` occurrences
- noncommercial-educational: `0` rows / `0` occurrences
- metadata/link-only: `0` rows / `0` occurrences
- blocked/review: `31` rows / `476` occurrences

## License flags

- `commercial_export_allowed_default=false`
- `answer_eligible_default=false`
- `public_emit_default=false`
- `attribution_required_default=true`
- `nc_derived_from_nc_value=true`
- `nc_owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`
- `nc_corpus_contamination=false`
- `metadata_rows_emits_citation_link_only=true`

## Export rule

- `commercial_clean_export_excludes_nc=true`
- `nc_educational_export_separate=true`
- `metadata_or_link_only_emits_citation_link_only=true`
- `blocked_or_needs_review_emits_no_candidate_text=true`
- `commercial_export_allowed_now=false`

## Boundary

- package owner: `Agent 1`
- Agent 6 boundary need: `Agent 6 must resolve exact row/subset boundary decisions for commercial-clean, metadata/link-only, and blocked rows before any candidate text/export behavior is authorized.`
- no source/license/legal acceptance
- no QA acceptance
- no public/runtime mutation
- no Definition authority
- no NC commercial authorization

## Stop condition

output plus validator pass, or exact missing script/input/output/schema/validator/count blocker.

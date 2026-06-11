# Agent 1 / Spark-1 Orot NC/Klein Source Family Pipeline Contract - 2026-06-04

Status: `pipeline_contract_runnable_validated`.
Weekly order source: `reports/oracle9-weekly-goal-mode-lexicon-expansion-order-2026-06-04.md`.
Canonical sibling contract: `reports/agent1-spark1-pipeline-contract-orot-nc-klein-source-family-2026-06-04.md`.
Highest permissible claim: Agent 1 authored a reusable Spark-1 source/license/custody pipeline contract for lexicon expansion.

## Target

Target work: `Orot`.
Target source family: `Klein Dictionary`.
Target lane: `noncommercial_educational_candidate`.
Target rows / occurrences: `17` / `259`.

## Inputs

Spark-1 must use only these files:

- `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json`
- `reports/agent1-orot-sefaria-nc-aware-family-custody-display-review-2026-06-03.json`
- `reports/agent10-agent1-agent6-orot-nc-aware-boundary-request-2026-06-03.json`
- `data/build/orot/reader-hint-placeholder-candidates.json`
- `reports/agent6-orot-nc-klein-source-family-map-boundary-verdict-2026-06-04.md`

## Command / Script

Build:

```powershell
node scripts/build_agent1_orot_nc_klein_source_family_pipeline.mjs
```

Current status: `runnable`.

## Output Schema

Output JSON:

- `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json`

Output Markdown:

- `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.md`

Required NC row flags: `status=noncommercial_educational_candidate`, `derived_from_nc=true`, `commercial_export_allowed=false`, `noncommercial_display_allowed=false`, `attribution_required=true`, `corpus_contamination=false`.

## Validator / Gate

Output validator:

```powershell
node scripts/validate_agent1_orot_nc_klein_source_family_pipeline.mjs
```

Contract validator:

```powershell
node scripts/validate_agent1_spark1_orot_nc_klein_source_family_contract.mjs reports/agent1-spark1-orot-nc-klein-source-family-pipeline-contract-2026-06-04.json
```

Current validator status: `validated`.

## License Flags

Spark-1 must preserve:

- `license_lane=noncommercial_educational_candidate`
- `derived_from_nc=true`
- `commercial_export_allowed=false`
- `attribution_required=true`
- `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`
- `corpus_contamination=false`
- `answer_eligible=false`
- `public_emit=false`
- no commercial-clean contamination
- no NC storage/display/public/answer/export authorization

## Package Owner

Package owner: Agent 1.
Spark role: run only this Agent-1-authored contract and return output paths, counts, validator result, or exact blocker.

## Agent 6 Boundary Question

Can the 17 Klein / CC-BY-NC Orot rows remain as non-public `noncommercial_educational_candidate` planning rows with metadata-only / external-link-only posture, while preserving `derived_from_nc=true`, `commercial_export_allowed=false`, attribution required, `corpus_contamination=false`, no NC definition-content storage, no public/runtime output, no answer eligibility, and no commercial export?

Current Agent 6 docket state: `WARN-ACCEPTED` planning evidence only in `reports/agent6-orot-nc-klein-source-family-map-boundary-verdict-2026-06-04.md`; no NC storage/display/public/answer/export authorization.

## Stop Condition

Spark-1 stops after one:

- output map plus validator pass;
- exact `missing_pipeline_blocker` naming missing input, output schema, validator, or count definition;
- exact row/count mismatch blocker;
- exact Agent 6 boundary blocker.

## Boundary

This is pipeline authorship only. It creates no source/provenance/license/legal/QA/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no NC commercial authorization, and no public/runtime mutation.

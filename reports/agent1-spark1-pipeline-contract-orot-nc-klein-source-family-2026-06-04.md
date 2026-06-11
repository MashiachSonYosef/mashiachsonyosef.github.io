# Agent 1 / Spark-1 Pipeline Contract: Orot NC/Klein Source Family - 2026-06-04

Status: `pipeline_contract_runnable_validated`.
Mode: `BROAD_CORPUS_EXPANSION` with Option C HYBRID.
Highest permissible claim: Agent 1 authored a reusable Spark-1 source/license/custody pipeline contract.

## Target

Target work: `Orot`.
Target family: `Klein Dictionary`.
Target source/license lane: `noncommercial_educational_candidate`.
Target rows / occurrences: `17` / `259`.

Source evidence:

- `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.md`
- `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json`
- `reports/agent6-orot-nc-klein-source-family-map-boundary-verdict-2026-06-04.md`

## Exact Inputs

Spark-1 must use only:

- `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json`
- `reports/agent1-orot-sefaria-nc-aware-family-custody-display-review-2026-06-03.json`
- `reports/agent10-agent1-agent6-orot-nc-aware-boundary-request-2026-06-03.json`
- `data/build/orot/reader-hint-placeholder-candidates.json`
- `reports/agent6-orot-nc-klein-source-family-map-boundary-verdict-2026-06-04.md`

## Command / Script

Build script:

```powershell
node scripts/build_agent1_orot_nc_klein_source_family_pipeline.mjs
```

Current status: `runnable`.

## Output Schema

Expected output JSON:

- `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json`

Expected output Markdown:

- `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.md`

Required schema fields:

- `artifact_type=agent1_orot_nc_klein_educational_source_family_map`
- `status`
- `inputs`
- `measured_scope`
- `current_non_public_orot_package_counts`
- `family_map`
- `nc_rows`
- `excluded_blockers`
- `non_acceptance_boundary`
- `stop_condition`

Required row flags:

- `status=noncommercial_educational_candidate`
- `license_group=CC_BY_NC`
- `derived_from_nc=true`
- `commercial_export_allowed=false`
- `noncommercial_display_allowed=false`
- `attribution_required=true`
- `corpus_contamination=false`
- `storage_allowed=false`
- `display_allowed=false`
- `transformed_reader_hint_allowed=false`
- `nc_definition_content_storage_allowed_now=false`

## Validator / Gate

Output validator:

```powershell
node scripts/validate_agent1_orot_nc_klein_source_family_pipeline.mjs reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json
```

Contract validator:

```powershell
node scripts/validate_agent1_spark1_orot_nc_klein_source_family_contract.mjs
```

Current validator status: `validated`.

Required validator assertions:

- `nc_rows.length=17`
- sum of `nc_rows[].occurrences=259`
- every NC row preserves `derived_from_nc=true`
- every NC row preserves `commercial_export_allowed=false`
- every NC row preserves `noncommercial_display_allowed=false`
- every NC row preserves `attribution_required=true`
- every NC row preserves `corpus_contamination=false`
- package counts preserve `noncommercial_educational_rows=17` and `noncommercial_educational_occurrences=259`
- no NC definition-content, answer, source, public HUD, or route JSONL rows are emitted

## License Flags

Required lane flags:

- `noncommercial_educational_candidate`
- `derived_from_nc=true`
- `commercial_export_allowed=false`
- attribution required
- no corpus contamination
- metadata-only / external-link-only planning posture only
- no NC storage/display/public/answer/export authorization

Agent 6 returned verdict:

- `WARN-ACCEPTED` for row-scoped noncommercial educational planning evidence only.
- `0` rows cleared for NC storage/display/public/answer behavior.
- Commercial export for NC rows remains blocked.

## Package Owner

Package owner: Agent 1.
Spark role: Spark-1 runs this exact Agent-1-authored contract only.
Proof owner: Agent 5 preserves delivery/reseed proof.
Staffing owner: Agent 7 wakes/staffs.

## Agent 6 Boundary Need

Agent 6 boundary question:

Can the 17 Klein / CC-BY-NC rows remain as non-public `noncommercial_educational_candidate` planning rows with metadata-only / external-link-only posture, while preserving `derived_from_nc=true`, `commercial_export_allowed=false`, attribution required, no corpus contamination, no NC definition-content storage, no public/runtime output, no answer eligibility, and no commercial export?

Current Agent 6 answer: WARN-ACCEPTED planning evidence only, not storage/display/public/export authorization.

## Spark-1 Stop Condition

Spark-1 stops after one:

- output map plus validator pass;
- exact `missing_pipeline_blocker` naming missing input, output schema, validator, or count definition;
- exact row/count mismatch blocker;
- exact Agent 6 boundary blocker.

## Boundary

This is pipeline authorship only. It does not claim source/license acceptance, public/runtime mutation, Definition authority, answer acceptance, accepted gloss/text, or publication readiness.

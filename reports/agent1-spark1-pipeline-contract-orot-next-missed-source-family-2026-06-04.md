# Agent 1 / Spark-1 Pipeline Contract: Orot Next Missed Source Family - 2026-06-04

Status: `pipeline_contract_runnable_validated`.
Mode: `BROAD_CORPUS_EXPANSION` with Option C HYBRID.
Highest permissible claim: Agent 1 authored a reusable Spark-1 source/license/custody pipeline contract for the next missed source-family workset from existing evidence.

## Target

Target work: `Orot`.
Target workset: next missed dictionary/source-family package after NC/Klein.
Primary existing evidence: Agent 10 next missed-dictionary placeholder candidate packet.

Target counts from existing evidence:

- candidate rows: `50`
- candidate occurrences: `1193`
- commercial-clean candidate rows: `50`
- commercial-clean candidate occurrences: `1193`
- NC candidate rows: `0`
- NC candidate occurrences: `0`
- rows blocked pending Agent 6 in candidate packet: `50`

Known source-family blocker carried by the packet:

- `BDB Augmented Strong` is present only as blocked/present-but-unused metadata where applicable.

## Exact Inputs

Spark-1 must use only existing evidence:

- `reports/agent10-orot-next-missed-dictionary-placeholder-candidates-2026-06-03.json`
- `reports/agent10-orot-next-missed-dictionary-cleared-append-2026-06-03.json`
- `reports/agent1-orot-sefaria-nc-aware-family-custody-display-review-2026-06-03.json`
- `reports/agent1-orot-dry-run-source-license-display-review-2026-06-03.json`
- `data/build/orot/reader-hint-placeholder-candidates.json`

Optional if present, but not required for this contract:

- `reports/agent2-orot-missed-dictionary-reader-hint-candidate-package-2026-06-04.json`

Current upstream evidence gap:

- `reports/agent2-orot-missed-dictionary-reader-hint-candidate-package-2026-06-04.json` is absent in this checkout.
- This contract remains Spark-runnable from the Agent 10 candidate and append packets only; if Agent 2-specific transform fields are required, Spark-1 must return `missing_input_blocker`.

## Command / Script

Build script:

```powershell
node scripts/build_agent1_orot_next_missed_source_family_pipeline.mjs
```

Current status: `runnable`.

## Output Schema

Expected output JSON:

- `reports/agent1-orot-next-missed-source-family-map-2026-06-04.json`

Expected output Markdown:

- `reports/agent1-orot-next-missed-source-family-map-2026-06-04.md`

Required schema fields:

- `artifact_type=agent1_orot_next_missed_source_family_map`
- `status`
- `inputs`
- `target_counts`
- `family_statuses`
- `row_status_counts`
- `source_family_blockers`
- `commercial_export_separation`
- `attribution_requirements`
- `non_acceptance_boundary`
- `stop_condition`

Required classifications:

- `commercial_clean_candidate`
- `noncommercial_educational_candidate`
- `metadata_or_link_only`
- `blocked_or_needs_review`

Expected classification for this workset from current evidence:

- `commercial_clean_candidate`: 50 rows / 1193 occurrences
- `noncommercial_educational_candidate`: 0 rows / 0 occurrences
- `metadata_or_link_only`: BDB Augmented Strong if present only as blocked/present-but-unused metadata
- `blocked_or_needs_review`: rows/families lacking independent source/license/custody basis

## Validator / Gate

Output validator:

```powershell
node scripts/validate_agent1_orot_next_missed_source_family_pipeline.mjs reports/agent1-orot-next-missed-source-family-map-2026-06-04.json
```

Contract validator:

```powershell
node scripts/validate_agent1_spark1_orot_next_missed_source_family_contract.mjs
```

Current validator status: `validated`.

Required validator assertions:

- input candidate packet parses;
- candidate packet summary reports `candidate_rows=50`;
- candidate packet summary reports `candidate_occurrences=1193`;
- candidate packet summary reports `commercial_clean_candidate_rows=50`;
- candidate packet summary reports `nc_candidate_rows=0`;
- row-level source flags preserve `derived_from_nc=false`;
- NC rows are not introduced;
- BDB Augmented Strong remains blocked/present-but-unused unless independent custody evidence appears;
- output emits no answer rows, source rows, public HUD rows, route JSONL rows, definition-content rows, public mutation, or accepted text.

## License / Export Separation

Commercial-clean rows:

- classification: `commercial_clean_candidate`
- expected license group: `PUBLIC_DOMAIN_OBSERVED`
- candidate commercial export separation: commercial-clean lane only
- commercial export allowed now: false until Agent 6/package boundary accepts exact behavior
- attribution: preserve source family, entry IDs, response SHA, and any version/source basis in source-custody manifest

NC rows:

- expected count: `0`
- if later present, must be classified `noncommercial_educational_candidate`
- `commercial_export_allowed=false`
- attribution required
- no corpus contamination

Metadata/link-only or blocked families:

- `BDB Augmented Strong` remains blocked/present-but-unused unless independent source/license/custody evidence is supplied.

## Package Owner

Package owner: Agent 1.
Spark role: Spark-1 runs this exact Agent-1-authored contract only.
First consumer: Agent 10 for Orot hardening package sequencing.
Boundary owner: Agent 6 for exact row/subset behavior if package use is requested.

## Agent 6 Boundary Need

Agent 6 boundary question:

Can the 50 next missed-dictionary commercial-clean placeholder rows / 1193 occurrences remain in the non-public Orot package as commercial-clean planning placeholders, while BDB Augmented Strong remains blocked/present-but-unused and no answer/source/public HUD/route JSONL/definition-content rows are emitted?

Agent 1 does not answer this question here.

## Spark-1 Stop Condition

Spark-1 stops after one:

- output map plus validator pass;
- exact `missing_pipeline_blocker` naming missing input, output schema, validator, or count definition;
- exact `missing_input_blocker` if Agent 2-specific fields are required but `reports/agent2-orot-missed-dictionary-reader-hint-candidate-package-2026-06-04.json` remains absent;
- exact row/count mismatch blocker.

## Boundary

This is pipeline authorship only. It does not claim source/license acceptance, public/runtime mutation, Definition authority, answer acceptance, accepted gloss/text, or publication readiness.

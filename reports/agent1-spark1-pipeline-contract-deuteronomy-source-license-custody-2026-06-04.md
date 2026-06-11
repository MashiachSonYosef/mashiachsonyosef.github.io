# Agent 1 / Spark-1 Pipeline Contract: Deuteronomy Source/License/Custody - 2026-06-04

Status: `pipeline_contract_runnable_validated`.
Mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE / OROT_LEVEL_PIPELINE_REPLICATION`.
Highest permissible claim: Agent 1 authored a runnable Spark-1 source/license/custody pipeline contract for the Deuteronomy workset.

## Target

Target workset: `deuteronomy-source-license-custody-map`.

Current evidence counts:

- covered rows / occurrences: `1334` / `2964`
- commercial-clean candidate rows / occurrences: `1334` / `2964`
- noncommercial educational rows / occurrences: `0` / `0`
- metadata/link-only rows: `0`
- blocked/review rows in covered workset: `0`
- outside-workset Agent 3 matrix blockers: `6779` rows / `9631` occurrences

## Inputs

Spark-1 must use only these exact input artifacts:

- `data/control/spark_standing_queue.json`
- `reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.json`
- `reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json`

## Command / Script

Build:

```powershell
node scripts/build_agent1_deuteronomy_source_license_custody_map.mjs
```

Validate output:

```powershell
node scripts/validate_agent1_deuteronomy_source_license_custody_map.mjs
```

Validate this contract:

```powershell
node scripts/validate_agent1_spark1_deuteronomy_source_license_custody_contract.mjs
```

## Output Schema

Output JSON:

- `reports/agent1-deuteronomy-source-license-custody-map-2026-06-04.json`

Output Markdown:

- `reports/agent1-deuteronomy-source-license-custody-map-2026-06-04.md`

Required classifications:

- `commercial_clean_candidate`
- `noncommercial_educational_candidate`
- `metadata_or_link_only`
- `blocked_or_needs_review`

Expected classification from current evidence:

- `commercial_clean_candidate`: `1334` rows / `2964` occurrences
- `noncommercial_educational_candidate`: `0` rows / `0` occurrences
- `metadata_or_link_only`: `0` rows
- `blocked_or_needs_review`: `0` covered rows; `6779` Agent 3 matrix rows remain outside this workset

## Required Fields

Each row must preserve:

- `source_family`
- `source_name`
- `license_label`
- `license_lane`
- `attribution_required`
- `derived_from_nc`
- `commercial_export_allowed`
- `owner_use_attestation`
- `corpus_contamination`
- `source_url_or_citation`
- `agent6_boundary_required`
- `answer_eligible`
- `public_emit`

NC rows are not present in this workset. If future NC rows appear, they must be separated as `noncommercial_educational_candidate` with `commercial_export_allowed=false`, `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`, `corpus_contamination=false`, `answer_eligible=false`, and `public_emit=false`.

## Export Rule

- commercial-clean export excludes NC rows
- NC educational export is separate
- metadata/link-only emits citation/link only
- blocked/review emits no candidate text
- commercial export is not allowed now

## Package Owner

Package owner: Agent 1.
Spark role: Spark-1 runs this exact Agent-1-authored contract only.
Boundary owner: Agent 6 for exact row/subset behavior if package use is requested.

## Agent 6 Boundary Need

Agent 6 must decide exact Deuteronomy row/subset behavior before package/export/display/public/answer use.

Agent 1 does not answer this question here.

## Spark-1 Stop Condition

Spark-1 stops after one:

- output map plus validator pass;
- exact `missing_input_blocker` naming missing required input;
- exact `missing_pipeline_blocker` naming missing script, output schema, validator, or count definition;
- exact row/count/lane mismatch blocker.

## Boundary

This is pipeline authorship and mechanical evidence only. It does not claim source/provenance acceptance, license/legal acceptance, QA acceptance, public/runtime mutation, Definition authority, answer acceptance, accepted gloss/text, publication readiness, or NC commercial authorization.

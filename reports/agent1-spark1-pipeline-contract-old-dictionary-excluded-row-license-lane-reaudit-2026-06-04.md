# Agent 1 / Spark-1 Pipeline Contract: Old Dictionary Excluded Row License-Lane Reaudit - 2026-06-04

Status: `pipeline_contract_runnable_validated`.
Mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`.
Highest permissible claim: Agent 1 authored a runnable Spark-1 source/license/custody pipeline contract for old-dictionary excluded-row lane re-audit evidence.

## Target

Target workset: `old-dictionary-excluded-row-license-lane-reaudit`.

Current evidence counts:

- audited preview rows / occurrences: `500` / `8427`
- source families classified: `5`
- commercial-clean source families: `3`
- noncommercial educational source families: `1`
- blocked/review source families: `1`

## Inputs

Spark-1 must use only these exact input artifacts:

- `reports/oracle9-dictionary-lane-classification-correction-2026-06-04.md`
- `reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json`
- `reports/agent1-orot-nc-klein-educational-source-family-map-2026-06-04.json`
- `reports/agent1-orot-next-missed-source-family-map-2026-06-04.json`
- `reports/agent6-orot-sefaria-nc-aware-family-boundary-final-verdict-2026-06-03.json`

## Command / Script

Build:

```powershell
node scripts/build_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs
```

Validate output:

```powershell
node scripts/validate_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs
```

Validate this contract:

```powershell
node scripts/validate_agent1_spark1_old_dictionary_reaudit_pipeline_contract.mjs
```

## Output Schema

Output JSON:

- `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`

Output Markdown:

- `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.md`

Required classifications:

- `commercial_clean_candidate`
- `noncommercial_educational_candidate`
- `metadata_or_link_only`
- `blocked_or_needs_review`

Expected classification from current evidence:

- `Jastrow Dictionary`: `commercial_clean_candidate`
- `BDB Dictionary`: `commercial_clean_candidate`
- `BDB Aramaic Dictionary`: `commercial_clean_candidate`
- `Klein Dictionary`: `noncommercial_educational_candidate`
- `BDB Augmented Strong`: `blocked_or_needs_review`

## Required Fields

Each source-family row must preserve source/license/custody fields:

- `source_family`
- `source_name`
- `license_label`
- `license_lane`
- `source_url_or_citation`
- `agent6_boundary_required`

NC rows/families must also preserve:

- `derived_from_nc=true`
- `commercial_export_allowed=false`
- `attribution_required=true`
- `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`
- `corpus_contamination=false`
- `answer_eligible=false`
- `public_emit=false`

## Export Rule

- commercial-clean export excludes NC rows
- NC educational export is separate
- metadata/link-only emits citation/link only
- blocked/review emits no candidate text

## Package Owner

Package owner: Agent 1.
Spark role: Spark-1 runs this exact Agent-1-authored contract only.
Boundary owner: Agent 6 for exact row/subset behavior if package use is requested.

## Agent 6 Boundary Need

Agent 6 must decide any exact old-dictionary row/subset behavior before candidate text/package/display/public/answer use.

Agent 1 does not answer this question here.

## Spark-1 Stop Condition

Spark-1 stops after one:

- output map plus validator pass;
- exact `missing_input_blocker` naming missing required input;
- exact `missing_pipeline_blocker` naming missing script, output schema, validator, or count definition;
- exact row/count/lane mismatch blocker.

## Boundary

This is pipeline authorship and mechanical evidence only. It does not claim source/license/legal acceptance, QA acceptance, public/runtime mutation, Definition authority, answer acceptance, accepted gloss/text, publication readiness, or NC commercial authorization.

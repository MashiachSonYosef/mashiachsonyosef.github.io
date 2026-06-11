# Agent 1 / Spark-1 Pipeline Contract: Broad Source Mechanics Queue Package - 2026-06-04

Status: `pipeline_contract_runnable_validated_with_exact_linkage_blocker`.
Highest permissible claim: Agent 1 authored a runnable Spark-1 source/license/custody mechanics contract with an exact missing-linkage assignment blocker.

## Target

Queue item: `spark1-broad-source-mechanics`.

Current evidence counts:

- source-row targets: `4`
- source-row chunk entries: `17`
- source-row occurrences: `19`
- missing linkage rows / occurrences: `13` / `129`

## Inputs

Spark-1 must use only these files:

- `reports/agent1-orot-fill-source-row-evidence-2026-06-03.json`
- `reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.json`
- `reports/oracle9-dictionary-lane-classification-correction-2026-06-04.md`
- `reports/oracle9-nc-educational-lane-owner-policy-2026-06-04.md`
- `reports/oracle9-new-dictionary-source-lane-policy-2026-06-04.md`

## Commands

Build:

```powershell
node scripts/build_agent1_orot_fill_source_row_evidence.mjs
node scripts/build_agent1_orot_missing_lexicon_linkage_candidates.mjs
```

Validate:

```powershell
node scripts/validate_agent1_orot_fill_source_row_evidence.mjs
node scripts/validate_agent1_orot_missing_lexicon_linkage_candidates.mjs reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.json
node scripts/validate_agent1_broad_source_mechanics_queue_package.mjs
node scripts/validate_agent1_spark1_broad_source_mechanics_contract.mjs
```

## Output Schema

Package outputs:

- `reports/agent1-broad-source-mechanics-queue-package-2026-06-04.json`
- `reports/agent1-broad-source-mechanics-queue-package-2026-06-04.md`

Component outputs:

- `reports/agent1-orot-fill-source-row-evidence-2026-06-03.json`
- `reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.json`

## Classification

- source-row evidence: `commercial_clean_candidate`, 4 targets / 19 occurrences, OpenScriptures `CC BY 4.0` and Wikidata `CC0`, with `commercial_export_allowed=false` until boundary
- missing linkage evidence: `metadata_or_link_only`, 13 rows / 129 occurrences
- NC rows: `0`, but future NC rows must remain in separate `noncommercial_educational_candidate` lane

## Exact Blocker

`missing_linkage_assignment_rule_blocker`: no approved source/linkage rule exists here for assigning missing `lexicon_entry_id` values.

Do not assign `lexicon_entry_id` values from this contract.

## Export Rule

- commercial-clean export excludes NC rows
- NC educational export is separate
- metadata/link-only emits citation/link only
- blocked/review emits no candidate text
- commercial export is not allowed now

## Package Owner

Package owner: Agent 1.
Spark role: run only this Agent-1-authored contract and return output paths, counts, validator result, or exact blocker.

## Agent 6 Boundary Need

Agent 6 boundary is required before any package/export/display/public/answer behavior or any linkage-assignment behavior.

## Stop Condition

Spark-1 stops after one:

- output package plus validator pass;
- exact `missing_input_blocker` naming missing required input;
- exact `missing_pipeline_blocker` naming missing script, output schema, validator, or count definition;
- exact linkage blocker if asked to assign missing `lexicon_entry_id` values without an approved assignment rule.

## Boundary

This is pipeline authorship and mechanical evidence only. It creates no source/provenance/license/legal/QA/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no NC commercial authorization, no lexicon-entry assignment, and no public/runtime mutation.

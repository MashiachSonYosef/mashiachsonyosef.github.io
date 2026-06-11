# Agent 1 Spark-1 Pipeline Contract Pressure Response - 2026-06-04

Status: `contracts_returned_with_exact_missing_script_validator_blockers`.

Spark-1 standing status consumed:

- `reports/spark1-standing-goal-mode-status-2026-06-04.md`
- returned status: `awaiting_pipeline_contract`

## Contract 1: Orot NC/Klein Educational Source Family

Contract artifacts:

- `reports/agent1-spark1-pipeline-contract-orot-nc-klein-source-family-2026-06-04.md`
- `reports/agent1-spark1-pipeline-contract-orot-nc-klein-source-family-2026-06-04.json`

Target:

- Klein Dictionary / NC educational lane.
- `17` rows / `259` occurrences.
- classification: `noncommercial_educational_candidate`

Required flags:

- `derived_from_nc=true`
- `commercial_export_allowed=false`
- attribution required
- `corpus_contamination=false`

Runnable status: not yet runnable.

Exact missing-field blockers:

- `scripts/build_agent1_orot_nc_klein_source_family_pipeline.mjs` missing.
- `scripts/validate_agent1_orot_nc_klein_source_family_pipeline.mjs` missing.

## Contract 2: Orot Next Missed Dictionary / Source Family

Contract artifacts:

- `reports/agent1-spark1-pipeline-contract-orot-next-missed-source-family-2026-06-04.md`
- `reports/agent1-spark1-pipeline-contract-orot-next-missed-source-family-2026-06-04.json`

Target:

- next missed dictionary/source-family package after NC/Klein, from existing Agent 10 evidence.
- `50` candidate rows / `1193` occurrences.
- `50` commercial-clean candidate rows / `1193` occurrences.
- `0` NC rows / `0` NC occurrences.

Classification requirement:

- `commercial_clean_candidate`
- `noncommercial_educational_candidate`
- `metadata_link_only`
- `blocked`

Runnable status: not yet runnable.

Exact missing-field blockers:

- `scripts/build_agent1_orot_next_missed_source_family_pipeline.mjs` missing.
- `scripts/validate_agent1_orot_next_missed_source_family_pipeline.mjs` missing.
- Optional upstream Agent 2 artifact `reports/agent2-orot-missed-dictionary-reader-hint-candidate-package-2026-06-04.json` is absent; if Agent 2-specific fields are required, Spark-1 must return `missing_input_blocker`.

## Contract 3: Next Missed Dictionary / Source Family After That

Status: `missing_workset_blocker`.

No exact third missed dictionary/source-family workset has been identified with all required runnable fields.

Required missing fields:

- exact target rows/source family;
- exact input artifacts/manifests;
- command or Agent-1-authored script name;
- output path/schema;
- validator/gate or missing-validator blocker;
- license classification split;
- package owner;
- Agent 6 boundary need;
- Spark-1 stop condition.

Spark-1 must not invent the third workset.

## Wake / Reseed Condition

Spark-1 can be reseeded only when one of these is true:

- the missing build and validator scripts for contract 1 are authored;
- the missing build and validator scripts for contract 2 are authored;
- a third exact missed-source-family workset is supplied with the required runnable fields.

## Boundary

This pressure response does not claim source/license acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, or public/runtime mutation.

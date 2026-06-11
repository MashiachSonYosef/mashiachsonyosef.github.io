# Agent 1 Per-Book Source/License/Custody Contract Template - 2026-06-04

Status: `template_ready_with_current_target_runnable`.

## Current Target

target: `tanakh/deuteronomy`
lane: `Agent 1 / Spark-1`
item: `deuteronomy-source-license-custody-map`
expected artifact: `reports/agent1-deuteronomy-source-license-custody-map-2026-06-04.md plus optional JSON`
routable now: `true`
blocker: `none_for_current_validated_map`
current map: `reports/agent1-deuteronomy-source-license-custody-map-2026-06-04.json`
current contract: `reports/agent1-spark1-pipeline-contract-deuteronomy-source-license-custody-2026-06-04.json`
current contract validator: `node scripts/validate_agent1_spark1_deuteronomy_source_license_custody_contract.mjs`
current lane return: `reports/agent1-current-source-license-custody-lane-return-2026-06-04.json`

candidate input hints from staffing/control evidence:

- `data/sources/deuteronomy.json`
- `data/sources/*-on-deuteronomy.json`
- `data/lexical/*deuteronomy*`
- `Deuteronomy public-HUD data`

## Reusable Contract Fields

- book/work target
- Agent 1 source/license/custody package owner
- exact input files/manifests
- exact existing command/script or exact script to author
- output artifact path
- output JSON schema
- validator/gate command
- Spark-1 contract validator command
- lane-return/discovery artifact update requirement
- exact blocker exposure rule for non-routable worksets
- source/license count definitions
- commercial_clean classification field
- noncommercial_educational_candidate classification field
- metadata_link_only classification field
- blocked classification field
- derived_from_nc flag where applicable
- commercial_export_allowed flag where applicable
- attribution requirement field
- source/custody manifest requirement field
- Agent 6 boundary question
- stop condition

## Required Row Fields

- `row_id`
- `work_target`
- `source_family`
- `source_name`
- `license_label`
- `license_lane`
- `status`
- `derived_from_nc`
- `commercial_export_allowed`
- `attribution_required`
- `owner_use_attestation`
- `source_manifest_path`
- `custody_manifest_path`
- `source_url_or_citation`
- `agent6_boundary_required`
- `blocker_reason`

## Allowed Statuses

- `commercial_clean_candidate`
- `noncommercial_educational_candidate`
- `metadata_or_link_only`
- `external_link_only`
- `blocked_or_needs_review`

## NC CSV / Export Separation

- commercial-clean exports must exclude NC rows by default
- NC educational candidates require a separate CSV/export, partition, table, or sheet
- do not mix NC rows into commercial-clean CSV/export rows
- eligible NC rows are `noncommercial_educational_candidate`, not generic blocked solely because they are NC
- new dictionary sources are not blanket NC and must be classified source-by-source from actual source/license evidence
- metadata/link-only rows emit citation/link-only output only and no definition text
- blocked/review rows stay excluded from candidate text exports
- future contracts must write/check the separated NC educational CSV/export partition when exact input/output/schema/validator are supplied
- required NC flags: `license_lane=noncommercial_educational_candidate`, `derived_from_nc=true`, `commercial_export_allowed=false`, `attribution_required=true`, `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`, `corpus_contamination=false`, `answer_eligible=false`, `public_emit=false`

## Current Missing Fields

- none for the current validated Deuteronomy map

## Handoff

Spark-1 handoff: Current Deuteronomy target has a validated Agent 1 source/license/custody map plus runnable Spark-1 contract; Spark-1 may rerun the Deuteronomy build/validate/contract-validate chain if requested.
Agent 6 boundary: Agent 6 boundary is required before any Deuteronomy package/export/display/public/answer behavior.

Lane-return requirement: future per-book contracts and non-routable exact blockers must be exposed in `reports/agent1-current-source-license-custody-lane-return-2026-06-04.json` and validated with `node scripts/validate_agent1_current_source_license_custody_lane_return.mjs`. Current lane-return output count: `16`.

## Boundary

No source/provenance/license acceptance, no NC flattening, no QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, or public/runtime mutation.

# Agent 2 Spark-1 Runnable Command Manifest

Date: 2026-06-04
Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE

## Target

Provide exact Spark-1 runnable commands for Agent 2 definition/lemma/reader-hint pipelines, separated from blocked routes and preserving zero authority/public/answer boundaries.

Source inventory:

- `reports/agent2-weekly-lexicon-pipeline-inventory-2026-06-04.json`

## Runnable Pipelines

### Deuteronomy Phase2 Transform Readiness

Build:

```powershell
node scripts/build_agent2_deuteronomy_phase2_transform_readiness_matrix.mjs --input=reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.json --output=reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json --report=reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.md
```

Validate:

```powershell
node scripts/validate_agent2_deuteronomy_phase2_transform_readiness_matrix.mjs reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json
```

Expected counts: `{"rows":1334,"occurrences":2964,"commercial_clean_candidate_rows":1334,"noncommercial_educational_candidate_rows":0,"zero_emission_rows":0}`

### Deuteronomy Phase2 Partition Export Plan

Build:

```powershell
node scripts/build_agent2_deuteronomy_phase2_partition_export_plan.mjs --input=reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json --output=reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json --report=reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.md
```

Validate:

```powershell
node scripts/validate_agent2_deuteronomy_phase2_partition_export_plan.mjs reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json
```

Expected counts: `{"rows":1334,"occurrences":2964,"commercial_clean_candidate_rows":1334,"noncommercial_educational_candidate_rows":0,"candidate_text_export_rows":0,"answer_eligible_rows":0,"public_emit_rows":0}`

### Orot Missed Dictionary Reader Hint Candidates

Build:

```powershell
node scripts/build_agent2_orot_missed_dictionary_reader_hint_candidates.mjs --limit=50 --output=reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json --report=reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.md
```

Validate:

```powershell
node scripts/validate_agent2_orot_missed_dictionary_reader_hint_candidates.mjs reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json
```

Expected counts: `{"rows":0,"occurrences":0,"unmatched":168}`

### Definition Workbench 1000 Sample

Build:

```powershell
node scripts/build_definition_workbench_sample.mjs --limit=1000 --output=data/definitions/definition-workbench-sample-1000.json --report=reports/definition-workbench-sample-1000-report.md
```

Validate:

```powershell
node scripts/validate_definition_workbench_sample.mjs data/definitions/definition-workbench-sample-1000.json
```

Expected counts: `{"rows":1000,"rows_with_route_cards":996,"no_hint_repair_targets":4}`

### Definition Workbench Usage Joined Sample Planning

Build:

```powershell
node scripts/build_agent2_definition_workbench_usage_joined_sample_planning.mjs --join-smoke=data/definitions/definition-workbench-usage-join-smoke.json --output=data/definitions/agent2-definition-workbench-usage-joined-sample-planning.json --report=reports/agent2-definition-workbench-usage-joined-sample-planning.md
```

Validate:

```powershell
node scripts/validate_agent2_definition_workbench_usage_joined_sample_planning.mjs data/definitions/agent2-definition-workbench-usage-joined-sample-planning.json
```

Expected counts: `{"projected_rows":1,"occurrence_links":12,"route_ids":1}`

### Current Route Scan Receipt Refresh

Build:

```powershell
node scripts/build_agent2_current_route_scan_receipt.mjs
```

Validate:

```powershell
node scripts/validate_agent2_current_route_scan_receipt.mjs reports/agent2-current-route-scan-receipt-2026-06-04.json
```

Expected counts: `{"candidate_rows":0,"candidate_occurrences":0,"unmatched_rows":168,"agent6_route_needed_now":false}`

### Next Workset Blocker Refresh

Build:

```powershell
node scripts/build_agent2_next_workset_needed_after_deuteronomy_return.mjs
```

Validate:

```powershell
node scripts/validate_agent2_next_workset_needed_after_deuteronomy_return.mjs reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.json
```

Expected counts: `{"candidate_rows":0,"candidate_occurrences":0,"unmatched_rows":168,"agent6_route_needed_now":false}`

## Validator-Only Checks

### Source Lane Assignment Preflight Fixture

```powershell
node scripts/validate_agent2_source_lane_assignment_packet.mjs data/definitions/agent2-source-lane-assignment-preflight-fixture.json
```

### Weekly Pipeline Inventory

```powershell
node scripts/validate_agent2_weekly_lexicon_pipeline_inventory.mjs reports/agent2-weekly-lexicon-pipeline-inventory-2026-06-04.json
```

### Weekly Pipeline Inventory Validation Receipt

```powershell
node scripts/validate_agent2_weekly_lexicon_pipeline_inventory_validation.mjs reports/agent2-weekly-lexicon-pipeline-inventory-validation-2026-06-04.json
```

### Orot Counterpart Hint Patch Preview

```powershell
node scripts/validate_agent2_orot_counterpart_hint_patch_preview.mjs reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json
```

### Spark1 Manifest Outputs

```powershell
node scripts/validate_agent2_spark1_manifest_outputs.mjs reports/agent2-spark1-runnable-command-manifest-2026-06-04.json
```

### Spark1 Manifest Output State Validation Receipt

```powershell
node scripts/validate_agent2_spark1_manifest_output_state_validation_receipt.mjs reports/agent2-spark1-manifest-output-state-validation-receipt-2026-06-04.json
```

### Spark1 Command Manifest Validation Receipt

```powershell
node scripts/validate_agent2_spark1_command_manifest_validation_receipt.mjs reports/agent2-spark1-command-manifest-validation-receipt-2026-06-04.json
```

### Weekly Lexicon Current Handoff Bundle

```powershell
node scripts/validate_agent2_weekly_lexicon_current_handoff_bundle.mjs reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json
```

### Next Workset Needed After Deuteronomy Return

```powershell
node scripts/validate_agent2_next_workset_needed_after_deuteronomy_return.mjs reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.json
```

### Current Route Scan Receipt

```powershell
node scripts/validate_agent2_current_route_scan_receipt.mjs reports/agent2-current-route-scan-receipt-2026-06-04.json
```

### Weekly Zero Boundary Audit

```powershell
node scripts/validate_agent2_weekly_zero_boundary_audit.mjs reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.json
```

### Spark1 Execution Order Contract

```powershell
node scripts/validate_agent2_spark1_execution_order_contract.mjs reports/agent2-spark1-execution-order-contract-2026-06-04.json
```

### Spark1 Execution Order Validation Receipt

```powershell
node scripts/validate_agent2_spark1_execution_order_validation_receipt.mjs reports/agent2-spark1-execution-order-validation-receipt-2026-06-04.json
```

### Current Handoff Aggregate Validation Receipt

```powershell
node scripts/validate_agent2_current_handoff_aggregate_validation_receipt.mjs reports/agent2-current-handoff-aggregate-validation-receipt-2026-06-04.json
```

### Old Dictionary Lane Planning Intake

```powershell
node scripts/validate_agent2_old_dictionary_lane_planning_intake.mjs reports/agent2-old-dictionary-lane-planning-intake-2026-06-04.json
```

### Weekly Lexicon Script Syntax Receipt

```powershell
node scripts/validate_agent2_weekly_lexicon_script_syntax_receipt.mjs reports/agent2-weekly-lexicon-script-syntax-receipt-2026-06-04.json
```

### Future Workset Intake Fixture

```powershell
node scripts/validate_agent2_future_workset_intake_packet.mjs data/definitions/agent2-future-workset-intake-fixture.json
```

### Future Workset Intake Contract

```powershell
node scripts/validate_agent2_future_workset_intake_contract.mjs reports/agent2-future-workset-intake-contract-2026-06-04.json
```

### Current Stale Reference Scan Receipt

```powershell
node scripts/validate_agent2_current_stale_reference_scan_receipt.mjs reports/agent2-current-stale-reference-scan-receipt-2026-06-04.json
```

### Lane Preservation Handoff Receipt

```powershell
node scripts/validate_agent2_lane_preservation_handoff_receipt.mjs reports/agent2-lane-preservation-handoff-receipt-2026-06-04.json
```

### Broad Workbench Token Inventory 5000 Return

```powershell
node scripts/validate_agent2_broad_workbench_token_inventory_5000_return.mjs reports/agent2-broad-workbench-token-inventory-5000-return-2026-06-04.json
```

### Orot Zero Safe Pilot Upstream Claim Blocker

```powershell
node scripts/validate_agent2_orot_zero_safe_pilot_upstream_claim_blocker.mjs reports/agent2-orot-zero-safe-pilot-upstream-claim-blocker-2026-06-04.json
```

### Post Agent10 Consumption Reconciliation

```powershell
node scripts/validate_agent2_post_agent10_consumption_reconciliation.mjs reports/agent2-post-agent10-consumption-reconciliation-2026-06-04.json
```

### Old Dictionary Lane Partition Transform Planning Matrix

```powershell
node scripts/validate_agent2_old_dictionary_lane_partition_transform_planning_matrix.mjs reports/agent2-old-dictionary-lane-partition-transform-planning-matrix-2026-06-04.json
```

## Blocked Routes

- `old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary`
- `missing_larger_token_inventory_workset`
- `missing_joined_definition_workbench_sample_artifact_contract`
- `orot_counterpart_preview_not_promotable_without_agent1_source_lane_and_agent6_boundary`
- `no_new_agent2_exact_workset_after_deuteronomy_return`
- `orot_zero_safe_pilot_missing_machine_checkable_upstream_definition_route_claim_rejoin_morphology_homograph_gates`

## Spark-1 Rule

Spark-1 may run only exact commands in this manifest or exact future commands supplied by a new workset.

## Non-Acceptance Boundary

No QA acceptance, source/provenance acceptance, license acceptance, legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, definition-content storage, or NC commercial authorization is claimed.

# Agent 3 Crossmatch Inventory Packet

Generated: 2026-06-05T11:42:15.051Z

## Boundary

- Lane: crossmatch/usage navigation inventory.
- This packet records observed file/linkage state only.
- No definition authority, route ranking, visible answer selection, source/license acceptance, QA acceptance, publication support, accepted gloss, or accepted text is claimed.

## Counts

- Files inspected: 225
- Data/report/script files: 51/57/117
- Committed-clean / dirty-or-uncommitted files: 201/24
- Staged added / staged modified / worktree modified / untracked: 24/0/0/0
- Reader-facing / route-payload / forbidden-authority / truthy-authority hits: 0/0/0/0

## Blocker

- Status: exact_blocker
- Blocker: crossmatch_inventory_contains_dirty_or_uncommitted_artifacts
- Detail: 24 crossmatch/usage files are staged, modified, or untracked; treat them as inventory only until a bounded subset is validated and committed.

## Dirty Or Uncommitted Sample

| path | kind | git statuses | artifact type |
| --- | --- | --- | --- |
| data/definitions/agent3-definition-workbench-usage-license-provenance-matrix.json | data_artifact | staged_added | agent3_definition_workbench_usage_license_provenance_matrix |
| data/definitions/agent3-definition-workbench-usage-token-bridge-consumer-addendum.json | data_artifact | staged_added | agent3_definition_workbench_usage_token_bridge_consumer_addendum |
| data/definitions/agent3-definition-workbench-usage-token-bridge-index.json | data_artifact | staged_added | agent3_definition_workbench_usage_token_bridge_index |
| reports/agent3-definition-workbench-usage-freshness-followup-2026-06-02.json | report_artifact | staged_added | agent3_definition_workbench_usage_freshness_followup |
| reports/agent3-definition-workbench-usage-freshness-followup-2026-06-02.md | report_artifact | staged_added |  |
| reports/agent3-definition-workbench-usage-license-provenance-matrix.md | report_artifact | staged_added |  |
| reports/agent3-definition-workbench-usage-negative-consumer-followup-2026-06-02.json | report_artifact | staged_added | agent3_definition_workbench_usage_negative_consumer_followup |
| reports/agent3-definition-workbench-usage-negative-consumer-followup-2026-06-02.md | report_artifact | staged_added |  |
| reports/agent3-definition-workbench-usage-source-freshness-refresh-2026-06-02.json | report_artifact | staged_added | agent3_definition_workbench_usage_source_freshness_refresh |
| reports/agent3-definition-workbench-usage-source-freshness-refresh-2026-06-02.md | report_artifact | staged_added |  |
| reports/agent3-definition-workbench-usage-token-bridge-consumer-addendum.md | report_artifact | staged_added |  |
| reports/agent3-definition-workbench-usage-token-bridge-index.md | report_artifact | staged_added |  |
| scripts/build_agent3_definition_workbench_usage_freshness_followup.mjs | pipeline_script | staged_added |  |
| scripts/build_agent3_definition_workbench_usage_license_provenance_matrix.mjs | pipeline_script | staged_added |  |
| scripts/build_agent3_definition_workbench_usage_negative_consumer_followup.mjs | pipeline_script | staged_added |  |
| scripts/build_agent3_definition_workbench_usage_source_freshness_refresh.mjs | pipeline_script | staged_added |  |
| scripts/build_agent3_definition_workbench_usage_token_bridge_consumer_addendum.mjs | pipeline_script | staged_added |  |
| scripts/build_agent3_definition_workbench_usage_token_bridge_index.mjs | pipeline_script | staged_added |  |
| scripts/validate_agent3_definition_workbench_usage_freshness_followup.mjs | pipeline_script | staged_added |  |
| scripts/validate_agent3_definition_workbench_usage_license_provenance_matrix.mjs | pipeline_script | staged_added |  |
| scripts/validate_agent3_definition_workbench_usage_negative_consumer_followup.mjs | pipeline_script | staged_added |  |
| scripts/validate_agent3_definition_workbench_usage_source_freshness_refresh.mjs | pipeline_script | staged_added |  |
| scripts/validate_agent3_definition_workbench_usage_token_bridge_consumer_addendum.mjs | pipeline_script | staged_added |  |
| scripts/validate_agent3_definition_workbench_usage_token_bridge_index.mjs | pipeline_script | staged_added |  |

## Artifact Types

| artifact type | files |
| --- | ---: |
| agent3_definition_workbench_usage_collision_handoff_manifest | 1 |
| agent3_definition_workbench_usage_collision_integrity_digest | 1 |
| agent3_definition_workbench_usage_collision_package_summary | 1 |
| agent3_definition_workbench_usage_collision_provenance_index | 1 |
| agent3_definition_workbench_usage_collision_review_queue | 1 |
| agent3_definition_workbench_usage_collision_review_reverse_index | 1 |
| agent3_definition_workbench_usage_collision_validation_run | 1 |
| agent3_definition_workbench_usage_collision_work_category_cross_work_snippet_locator | 1 |
| agent3_definition_workbench_usage_collision_work_category_handoff_manifest | 1 |
| agent3_definition_workbench_usage_collision_work_category_index | 1 |
| agent3_definition_workbench_usage_collision_work_category_integrity_digest | 1 |
| agent3_definition_workbench_usage_collision_work_category_occurrence_locator | 1 |
| agent3_definition_workbench_usage_collision_work_category_provenance_locator | 1 |
| agent3_definition_workbench_usage_collision_work_category_source_ref_repeat_locator | 1 |
| agent3_definition_workbench_usage_collision_work_category_validation_run | 1 |
| agent3_definition_workbench_usage_concordance_token_matrix | 1 |
| agent3_definition_workbench_usage_cross_work_snippet_continuity_validation | 1 |
| agent3_definition_workbench_usage_focus_collision_audit | 1 |
| agent3_definition_workbench_usage_focus_frame_summary | 1 |
| agent3_definition_workbench_usage_focus_navigation_shards | 1 |
| agent3_definition_workbench_usage_focus_token_drilldown | 1 |
| agent3_definition_workbench_usage_freshness_followup | 1 |
| agent3_definition_workbench_usage_license_provenance_matrix | 1 |
| agent3_definition_workbench_usage_negative_consumer_followup | 1 |
| agent3_definition_workbench_usage_source_freshness_refresh | 1 |
| agent3_definition_workbench_usage_token_bridge_consumer_addendum | 1 |
| agent3_definition_workbench_usage_token_bridge_index | 1 |
| definition_workbench_usage_agent6_packet | 1 |
| definition_workbench_usage_anchor_audit | 1 |
| definition_workbench_usage_concordance_navigation_packet | 1 |

## Stop Condition

Stop after this inventory packet records current file/linkage status and exact blocker state; do not broaden corpus, rank routes, or publish rows.

## Next Step

Select one bounded dirty/uncommitted subset, run its named builder and validator, then commit only that subset before treating it as package evidence.

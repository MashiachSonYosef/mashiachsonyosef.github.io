# Agent 3 Crossmatch Inventory Packet

Generated: 2026-06-05T10:46:26.539Z

## Boundary

- Lane: crossmatch/usage navigation inventory.
- This packet records observed file/linkage state only.
- No definition authority, route ranking, visible answer selection, source/license acceptance, QA acceptance, publication support, accepted gloss, or accepted text is claimed.

## Counts

- Files inspected: 225
- Data/report/script files: 51/57/117
- Committed-clean / dirty-or-uncommitted files: 29/196
- Staged added / staged modified / worktree modified / untracked: 178/16/2/0
- Reader-facing / route-payload / forbidden-authority / truthy-authority hits: 0/0/0/0

## Blocker

- Status: exact_blocker
- Blocker: crossmatch_inventory_contains_dirty_or_uncommitted_artifacts
- Detail: 196 crossmatch/usage files are staged, modified, or untracked; treat them as inventory only until a bounded subset is validated and committed.

## Dirty Or Uncommitted Sample

| path | kind | git statuses | artifact type |
| --- | --- | --- | --- |
| data/definitions/agent3-definition-workbench-usage-collision-handoff-manifest-reshit.json | data_artifact | staged_added | agent3_definition_workbench_usage_collision_handoff_manifest |
| data/definitions/agent3-definition-workbench-usage-collision-integrity-digest-reshit.json | data_artifact | staged_added | agent3_definition_workbench_usage_collision_integrity_digest |
| data/definitions/agent3-definition-workbench-usage-collision-package-summary-reshit.json | data_artifact | staged_added | agent3_definition_workbench_usage_collision_package_summary |
| data/definitions/agent3-definition-workbench-usage-collision-provenance-index-reshit.json | data_artifact | staged_added | agent3_definition_workbench_usage_collision_provenance_index |
| data/definitions/agent3-definition-workbench-usage-collision-review-queue-reshit.json | data_artifact | staged_added | agent3_definition_workbench_usage_collision_review_queue |
| data/definitions/agent3-definition-workbench-usage-collision-review-reverse-index-reshit.json | data_artifact | staged_added | agent3_definition_workbench_usage_collision_review_reverse_index |
| data/definitions/agent3-definition-workbench-usage-collision-validation-run-reshit.json | data_artifact | staged_added | agent3_definition_workbench_usage_collision_validation_run |
| data/definitions/agent3-definition-workbench-usage-collision-work-category-cross-work-snippet-locator-reshit.json | data_artifact | staged_added | agent3_definition_workbench_usage_collision_work_category_cross_work_snippet_locator |
| data/definitions/agent3-definition-workbench-usage-collision-work-category-handoff-manifest-reshit.json | data_artifact | staged_added | agent3_definition_workbench_usage_collision_work_category_handoff_manifest |
| data/definitions/agent3-definition-workbench-usage-collision-work-category-integrity-digest-reshit.json | data_artifact | staged_added | agent3_definition_workbench_usage_collision_work_category_integrity_digest |
| data/definitions/agent3-definition-workbench-usage-collision-work-category-provenance-locator-reshit.json | data_artifact | worktree_modified | agent3_definition_workbench_usage_collision_work_category_provenance_locator |
| data/definitions/agent3-definition-workbench-usage-collision-work-category-source-ref-repeat-locator-reshit.json | data_artifact | staged_added | agent3_definition_workbench_usage_collision_work_category_source_ref_repeat_locator |
| data/definitions/agent3-definition-workbench-usage-collision-work-category-validation-run-reshit.json | data_artifact | staged_added | agent3_definition_workbench_usage_collision_work_category_validation_run |
| data/definitions/agent3-definition-workbench-usage-concordance-token-matrix.json | data_artifact | staged_added | agent3_definition_workbench_usage_concordance_token_matrix |
| data/definitions/agent3-definition-workbench-usage-focus-collision-audit-reshit.json | data_artifact | staged_added | agent3_definition_workbench_usage_focus_collision_audit |
| data/definitions/agent3-definition-workbench-usage-focus-frame-summary-reshit.json | data_artifact | staged_added | agent3_definition_workbench_usage_focus_frame_summary |
| data/definitions/agent3-definition-workbench-usage-focus-navigation-shards-reshit.json | data_artifact | staged_added | agent3_definition_workbench_usage_focus_navigation_shards |
| data/definitions/agent3-definition-workbench-usage-focus-token-drilldown-reshit.json | data_artifact | staged_added | agent3_definition_workbench_usage_focus_token_drilldown |
| data/definitions/agent3-definition-workbench-usage-license-provenance-matrix.json | data_artifact | staged_added | agent3_definition_workbench_usage_license_provenance_matrix |
| data/definitions/agent3-definition-workbench-usage-token-bridge-consumer-addendum.json | data_artifact | staged_added | agent3_definition_workbench_usage_token_bridge_consumer_addendum |
| data/definitions/agent3-definition-workbench-usage-token-bridge-index.json | data_artifact | staged_added | agent3_definition_workbench_usage_token_bridge_index |
| data/definitions/definition-workbench-usage-agent6-packet.json | data_artifact | staged_modified | definition_workbench_usage_agent6_packet |
| data/definitions/definition-workbench-usage-anchor-audit.json | data_artifact | staged_added | definition_workbench_usage_anchor_audit |
| data/definitions/definition-workbench-usage-concordance-navigation-packet.json | data_artifact | staged_added | definition_workbench_usage_concordance_navigation_packet |
| data/definitions/definition-workbench-usage-consumer-manifest.json | data_artifact | staged_added | definition_workbench_usage_consumer_manifest |
| data/definitions/definition-workbench-usage-context-token-index.json | data_artifact | staged_added | definition_workbench_usage_context_token_index |
| data/definitions/definition-workbench-usage-context-token-links.json | data_artifact | staged_added | definition_workbench_usage_context_token_links |
| data/definitions/definition-workbench-usage-context-token-occurrence-index.json | data_artifact | staged_added | definition_workbench_usage_context_token_occurrence_index |
| data/definitions/definition-workbench-usage-crossmatch-neighbors.json | data_artifact | staged_added | definition_workbench_usage_crossmatch_neighbors |
| data/definitions/definition-workbench-usage-facet-index.json | data_artifact | staged_added | definition_workbench_usage_facet_index |
| data/definitions/definition-workbench-usage-freshness-impact-packet.json | data_artifact | staged_added | definition_workbench_usage_freshness_impact_packet |
| data/definitions/definition-workbench-usage-join-smoke.json | data_artifact | staged_modified | definition_workbench_usage_join_smoke |
| data/definitions/definition-workbench-usage-link-packet.json | data_artifact | staged_modified | definition_workbench_usage_link_packet |
| data/definitions/definition-workbench-usage-occurrence-context-profile.json | data_artifact | staged_added | definition_workbench_usage_occurrence_context_profile |
| data/definitions/definition-workbench-usage-occurrence-detail-index.json | data_artifact | staged_added | definition_workbench_usage_occurrence_detail_index |
| data/definitions/definition-workbench-usage-occurrence-support-packet.json | data_artifact | staged_added | definition_workbench_usage_occurrence_support_packet |
| data/definitions/definition-workbench-usage-planning-packet.json | data_artifact | staged_added | definition_workbench_usage_planning_packet |
| data/definitions/definition-workbench-usage-provenance-buckets.json | data_artifact | staged_added | definition_workbench_usage_provenance_buckets |
| data/definitions/definition-workbench-usage-queue-ready-packet.json | data_artifact | staged_modified | definition_workbench_usage_queue_ready_packet |
| data/definitions/definition-workbench-usage-route-concentration-guardrail.json | data_artifact | staged_added | definition_workbench_usage_route_concentration_guardrail |

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

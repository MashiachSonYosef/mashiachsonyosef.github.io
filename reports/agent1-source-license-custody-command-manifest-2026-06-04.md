# Agent 1 Source/License/Custody Command Manifest - 2026-06-04

Status: `agent1_source_license_custody_command_manifest_validated_for_spark1_discovery_only`.

## Runnable Command Sets

- `orot-nc-klein-source-family-contract`: build `node scripts/build_agent1_orot_nc_klein_source_family_pipeline.mjs`; validate output and contract.
- `orot-next-missed-source-family-contract`: build `node scripts/build_agent1_orot_next_missed_source_family_pipeline.mjs`; validate output and contract.
- `deuteronomy-source-license-custody-contract`: build `node scripts/build_agent1_deuteronomy_source_license_custody_map.mjs`; validate output and contract.
- `old-dictionary-excluded-row-license-lane-reaudit-contract`: build `node scripts/build_agent1_old_dictionary_excluded_row_license_lane_reaudit.mjs`; validate output and contract.
- `old-dictionary-license-lane-export-partitions`: build `node scripts/build_agent1_old_dictionary_license_lane_export_partitions.mjs`; validate separated lane partitions and contract gate.
- `old-dictionary-agent2-transform-lane-handoff-contract`: build `node scripts/build_agent1_old_dictionary_agent2_transform_lane_handoff.mjs`; validate Agent 2 transform-lane hold/consume separation and contract gate.
- `old-dictionary-planning-boundary-state-contract`: build `node scripts/build_agent1_old_dictionary_planning_boundary_state.mjs`; validate Agent 6 planning-verdict boundary state and contract gate.
- `workbench-source-license-custody-inventory`: build `node scripts/build_agent1_workbench_source_license_custody_inventory.mjs`; validate broad workbench source/license/custody inventory.
- `workbench-source-name-custody-partitions`: build `node scripts/build_agent1_workbench_source_name_custody_partitions.mjs`; validate broad workbench source-name custody partitions and contract gate.
- `workbench-full-source-name-custody-partitions-contract`: build `node scripts/build_agent1_workbench_full_source_name_custody_partitions.mjs`; validate full source-name custody partitions and contract gate.
- `workbench-license-bucket-boundary-matrix-contract`: build `node scripts/build_agent1_workbench_license_bucket_boundary_matrix.mjs`; validate license-bucket boundary matrix and contract gate.
- `workbench-source-family-boundary-matrix-contract`: build `node scripts/build_agent1_workbench_source_family_boundary_matrix.mjs`; validate source-family boundary matrix and contract gate.
- `workbench-source-family-license-lane-partitions-contract`: build `node scripts/build_agent1_workbench_source_family_license_lane_partitions.mjs`; validate source-family/license-lane partitions and contract gate.
- `workbench-source-family-license-lane-agent6-boundary-packet-contract`: build `node scripts/build_agent1_workbench_source_family_license_lane_agent6_boundary_packet.mjs`; validate source-family/license-lane Agent 6 boundary packet and contract gate.
- `workbench-source-family-license-lane-release-intake-packet-contract`: build `node scripts/build_agent1_workbench_source_family_license_lane_release_intake_packet.mjs`; validate source-family/license-lane release-intake packet and contract gate.
- `workbench-cc-by-sa-share-alike-boundary-contract`: build `node scripts/build_agent1_workbench_cc_by_sa_share_alike_boundary_map.mjs`; validate CC-BY-SA share-alike boundary map and contract gate.
- `workbench-cc-by-attribution-boundary-contract`: build `node scripts/build_agent1_workbench_cc_by_attribution_boundary_map.mjs`; validate CC-BY attribution boundary map and contract gate.
- `workbench-cc0-public-domain-zero-boundary-contract`: build `node scripts/build_agent1_workbench_cc0_public_domain_zero_boundary_map.mjs`; validate CC0 public-domain-zero boundary map and contract gate.
- `workbench-public-domain-boundary-contract`: build `node scripts/build_agent1_workbench_public_domain_boundary_map.mjs`; validate Public Domain boundary map and contract gate.
- `orot-missing-lexicon-linkage-candidates-contract`: build `node scripts/build_agent1_orot_missing_lexicon_linkage_candidates.mjs`; validate missing-linkage candidate buckets and contract gate.
- `broad-source-mechanics-contract`: build the two listed Orot source mechanics scripts; validate output package and contract while preserving `missing_linkage_assignment_rule_blocker`.
- `broad-workbench-token-inventory-5000-source-lane-blocker-contract`: build `node scripts/build_agent1_broad_workbench_token_inventory_5000_source_lane_blocker.mjs`; validate source-lane join blocker packet and contract gate.

## Non-Routable Blocker

- `third-missed-source-family-target-or-blocker`: `missing_workset_blocker`, `169` rows / `2148` occurrences checked, `spark1_routable=false`, missing row-level source-family/license split.

## Aggregate Gates

- `node scripts/validate_agent1_source_license_custody_pipeline_registry.mjs`
- `node scripts/validate_agent1_source_license_custody_pipeline_set.mjs`
- `node scripts/validate_agent1_source_license_custody_aggregate_handoff.mjs`
- `node scripts/validate_agent1_current_source_license_custody_lane_return.mjs`

## Boundary

Command discovery only. No source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, or public/runtime mutation.

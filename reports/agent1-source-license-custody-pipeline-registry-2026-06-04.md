# Agent 1 Source/License/Custody Pipeline Registry - 2026-06-04

Status: `agent1_source_license_custody_pipeline_registry_validated_for_discovery_only`.

Source: `reports/agent1-current-source-license-custody-lane-return-2026-06-04.json`.

Aggregate validator: `node scripts/validate_agent1_source_license_custody_pipeline_set.mjs`.

## Runnable Contracts

| target | contract | counts | validator |
| --- | --- | ---: | --- |
| `orot-nc-klein-source-family-contract` | `reports/agent1-spark1-pipeline-contract-orot-nc-klein-source-family-2026-06-04.json` | `17` rows / `259` occurrences | `node scripts/validate_agent1_spark1_orot_nc_klein_source_family_contract.mjs` |
| `orot-next-missed-source-family-contract` | `reports/agent1-spark1-pipeline-contract-orot-next-missed-source-family-2026-06-04.json` | `50` rows / `1193` occurrences | `node scripts/validate_agent1_spark1_orot_next_missed_source_family_contract.mjs` |
| `deuteronomy-source-license-custody-contract` | `reports/agent1-spark1-pipeline-contract-deuteronomy-source-license-custody-2026-06-04.json` | `1334` rows / `2964` occurrences | `node scripts/validate_agent1_spark1_deuteronomy_source_license_custody_contract.mjs` |
| `old-dictionary-excluded-row-license-lane-reaudit-contract` | `reports/agent1-spark1-pipeline-contract-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json` | `500` rows / `8427` occurrences; `5` families | `node scripts/validate_agent1_spark1_old_dictionary_reaudit_pipeline_contract.mjs` |
| `old-dictionary-license-lane-export-partitions-contract` | `reports/agent1-spark1-pipeline-contract-old-dictionary-license-lane-export-partitions-2026-06-04.json` | `3` commercial-clean, `1` NC educational, `1` blocked/review families | `node scripts/validate_agent1_spark1_old_dictionary_license_lane_export_partitions_contract.mjs` |
| `old-dictionary-agent2-transform-lane-handoff-contract` | `reports/agent1-spark1-pipeline-contract-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json` | `5` source families; `500` audited rows; `0` transform-authorized rows now | `node scripts/validate_agent1_spark1_old_dictionary_agent2_transform_lane_handoff_contract.mjs` |
| `old-dictionary-planning-boundary-state-contract` | `reports/agent1-spark1-pipeline-contract-old-dictionary-planning-boundary-state-2026-06-04.json` | `5` source families; `500` audited rows; `0` candidate-text rows now | `node scripts/validate_agent1_spark1_old_dictionary_planning_boundary_state_contract.mjs` |
| `broad-source-mechanics-contract` | `reports/agent1-spark1-pipeline-contract-broad-source-mechanics-queue-package-2026-06-04.json` | `4` source targets; `13` missing-linkage rows | `node scripts/validate_agent1_spark1_broad_source_mechanics_contract.mjs` |
| `broad-workbench-token-inventory-5000-source-lane-blocker-contract` | `reports/agent1-spark1-pipeline-contract-broad-workbench-token-inventory-5000-source-lane-blocker-2026-06-04.json` | `5000` token rows; `5000` source-lane blocker rows; `0` candidate-text rows | `node scripts/validate_agent1_spark1_broad_workbench_token_inventory_5000_source_lane_blocker_contract.mjs` |
| `orot-missing-lexicon-linkage-candidates-contract` | `reports/agent1-spark1-pipeline-contract-orot-missing-lexicon-linkage-candidates-2026-06-04.json` | `13` missing-linkage rows / `129` occurrences | `node scripts/validate_agent1_spark1_orot_missing_lexicon_linkage_candidates_contract.mjs` |
| `workbench-source-license-custody-contract` | `reports/agent1-spark1-pipeline-contract-workbench-source-license-custody-inventory-2026-06-04.json` | `105747` source rows; `1112` works | `node scripts/validate_agent1_spark1_workbench_source_license_custody_contract.mjs` |
| `workbench-source-name-custody-partitions-contract` | `reports/agent1-spark1-pipeline-contract-workbench-source-name-custody-partitions-2026-06-04.json` | `105747` source rows; `351` source-name partitions | `node scripts/validate_agent1_spark1_workbench_source_name_custody_partitions_contract.mjs` |
| `workbench-full-source-name-custody-partitions-contract` | `reports/agent1-spark1-pipeline-contract-workbench-full-source-name-custody-partitions-2026-06-04.json` | `351` full partitions; `105747` source rows | `node scripts/validate_agent1_spark1_workbench_full_source_name_custody_partitions_contract.mjs` |
| `workbench-license-bucket-boundary-matrix-contract` | `reports/agent1-spark1-pipeline-contract-workbench-license-bucket-boundary-matrix-2026-06-04.json` | `4` buckets; `351` partitions; `105747` source rows | `node scripts/validate_agent1_spark1_workbench_license_bucket_boundary_matrix_contract.mjs` |
| `workbench-source-family-boundary-matrix-contract` | `reports/agent1-spark1-pipeline-contract-workbench-source-family-boundary-matrix-2026-06-04.json` | `1` family; `351` partitions; `105747` source rows | `node scripts/validate_agent1_spark1_workbench_source_family_boundary_matrix_contract.mjs` |
| `workbench-source-family-license-lane-partitions-contract` | `reports/agent1-spark1-pipeline-contract-workbench-source-family-license-lane-partitions-2026-06-04.json` | `4` partitions; `1` family; `351` source-name partitions; `105747` source rows | `node scripts/validate_agent1_spark1_workbench_source_family_license_lane_partitions_contract.mjs` |
| `workbench-source-family-license-lane-agent6-boundary-packet-contract` | `reports/agent1-spark1-pipeline-contract-workbench-source-family-license-lane-agent6-boundary-packet-2026-06-04.json` | `4` Agent 6 boundary questions; `351` source-name partitions; `105747` source rows | `node scripts/validate_agent1_spark1_workbench_source_family_license_lane_agent6_boundary_packet_contract.mjs` |
| `workbench-source-family-license-lane-release-intake-packet-contract` | `reports/agent1-spark1-pipeline-contract-workbench-source-family-license-lane-release-intake-packet-2026-06-04.json` | `4` Agent 10 release-intake rows; `4` boundary questions; `105747` source rows | `node scripts/validate_agent1_spark1_workbench_source_family_license_lane_release_intake_packet_contract.mjs` |
| `workbench-cc-by-sa-share-alike-boundary-contract` | `reports/agent1-spark1-pipeline-contract-workbench-cc-by-sa-share-alike-boundary-map-2026-06-04.json` | `37` declared CC-BY-SA partitions / `5581` rows | `node scripts/validate_agent1_spark1_workbench_cc_by_sa_share_alike_boundary_contract.mjs` |
| `workbench-cc-by-attribution-boundary-contract` | `reports/agent1-spark1-pipeline-contract-workbench-cc-by-attribution-boundary-map-2026-06-04.json` | `5` declared CC-BY partitions / `625` rows; `1` sampled / `239` rows | `node scripts/validate_agent1_spark1_workbench_cc_by_attribution_boundary_contract.mjs` |
| `workbench-cc0-public-domain-zero-boundary-contract` | `reports/agent1-spark1-pipeline-contract-workbench-cc0-public-domain-zero-boundary-map-2026-06-04.json` | `2` declared CC0 partitions / `496` rows; `1` sampled / `267` rows | `node scripts/validate_agent1_spark1_workbench_cc0_public_domain_zero_boundary_contract.mjs` |
| `workbench-public-domain-boundary-contract` | `reports/agent1-spark1-pipeline-contract-workbench-public-domain-boundary-map-2026-06-04.json` | `307` declared Public Domain partitions / `99045` rows; `93` sampled / `88100` rows | `node scripts/validate_agent1_spark1_workbench_public_domain_boundary_contract.mjs` |

## Exact Blockers

| target | artifact | counts | blocker |
| --- | --- | ---: | --- |
| `third-missed-source-family-target-or-blocker` | `reports/agent1-third-missed-source-family-target-or-blocker-2026-06-04.json` | `169` rows / `2148` occurrences checked | `missing_workset_blocker`: no row-level source-family/license split |

## Counts

- lane-return outputs: `48`
- runnable contracts: `22`
- supporting packets: `24`
- exact blockers: `1`
- non-routable blockers: `1`

## Boundary

Registry/discovery only. No source/license/legal acceptance, QA acceptance, Definition authority, runtime/public acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, NC commercial authorization, or public/runtime mutation.

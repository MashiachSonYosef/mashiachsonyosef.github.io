#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-current-source-license-custody-lane-return-2026-06-04.json';
const resultPath = 'reports/agent1-current-source-license-custody-lane-return-validation-result-2026-06-04.json';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const artifact = readJson(artifactPath);
  assert(artifact.artifact_type === 'agent1_current_source_license_custody_lane_return', 'unexpected artifact_type');
  assert(artifact.status === 'agent1_current_source_license_custody_lane_return_ready_for_release_intake_only', 'unexpected status');
  assert((artifact.changed_or_current_outputs || []).length === 48, 'expected forty-eight Agent 1 outputs/blockers/registry/handoff/command-manifest rows');
  const ncKleinContract = artifact.changed_or_current_outputs.find((row) => row.target === 'orot-nc-klein-source-family-contract');
  assert(ncKleinContract?.rows === 17, 'NC/Klein contract rows must be 17');
  assert(ncKleinContract?.occurrences === 259, 'NC/Klein contract occurrences must be 259');
  assert(ncKleinContract?.license_lane === 'noncommercial_educational_candidate', 'NC/Klein contract lane must be NC educational');
  assert(ncKleinContract?.spark1_routable === true, 'NC/Klein contract must be Spark-1 routable');
  const nextMissedContract = artifact.changed_or_current_outputs.find((row) => row.target === 'orot-next-missed-source-family-contract');
  assert(nextMissedContract?.rows === 50, 'next-missed contract rows must be 50');
  assert(nextMissedContract?.occurrences === 1193, 'next-missed contract occurrences must be 1193');
  assert(nextMissedContract?.commercial_clean_rows === 50, 'next-missed contract commercial-clean rows must be 50');
  assert(nextMissedContract?.nc_rows === 0, 'next-missed contract NC rows must be zero');
  assert(nextMissedContract?.spark1_routable === true, 'next-missed contract must be Spark-1 routable');
  const deut = artifact.changed_or_current_outputs.find((row) => row.target === 'tanakh/deuteronomy');
  assert(deut?.rows === 1334, 'Deuteronomy rows must be 1334');
  assert(deut?.occurrences === 2964, 'Deuteronomy occurrences must be 2964');
  assert(deut?.spark1_routable === true, 'Deuteronomy must be Spark-1 routable');
  assert(deut?.contract_validator === 'node scripts/validate_agent1_spark1_deuteronomy_source_license_custody_contract.mjs', 'Deuteronomy contract validator must be named');
  const deutContract = artifact.changed_or_current_outputs.find((row) => row.target === 'deuteronomy-source-license-custody-contract');
  assert(deutContract?.rows === 1334, 'Deuteronomy contract rows must be 1334');
  assert(deutContract?.occurrences === 2964, 'Deuteronomy contract occurrences must be 2964');
  assert(deutContract?.outside_workset_blocker_rows === 6779, 'Deuteronomy contract outside blocker rows must be 6779');
  assert(deutContract?.spark1_routable === true, 'Deuteronomy contract must be Spark-1 routable');
  const reaudit = artifact.changed_or_current_outputs.find((row) => row.target === 'old-dictionary-excluded-row-license-lane-reaudit');
  assert(reaudit?.lane_source_family_counts?.noncommercial_educational_candidate === 1, 'reaudit must preserve one NC family');
  assert(reaudit?.spark1_routable === true, 'reaudit must be Spark-1 routable');
  assert(reaudit?.contract_validator === 'node scripts/validate_agent1_spark1_old_dictionary_reaudit_pipeline_contract.mjs', 'reaudit contract validator must be named');
  const reauditContract = artifact.changed_or_current_outputs.find((row) => row.target === 'old-dictionary-excluded-row-license-lane-reaudit-contract');
  assert(reauditContract?.audited_rows === 500, 'reaudit contract audited rows must be 500');
  assert(reauditContract?.audited_occurrences === 8427, 'reaudit contract audited occurrences must be 8427');
  assert(reauditContract?.spark1_routable === true, 'reaudit contract must be Spark-1 routable');
  const partitionPacket = artifact.changed_or_current_outputs.find((row) => row.target === 'old-dictionary-license-lane-export-partitions');
  assert(partitionPacket?.commercial_clean_source_families === 3, 'partition packet commercial-clean source families must be 3');
  assert(partitionPacket?.noncommercial_educational_source_families === 1, 'partition packet NC source families must be 1');
  assert(partitionPacket?.metadata_or_link_only_source_families === 0, 'partition packet metadata/link-only source families must be 0');
  assert(partitionPacket?.blocked_or_needs_review_source_families === 1, 'partition packet blocked/review source families must be 1');
  assert(partitionPacket?.spark1_routable === true, 'partition packet must be Spark-1 routable');
  const partitionContract = artifact.changed_or_current_outputs.find((row) => row.target === 'old-dictionary-license-lane-export-partitions-contract');
  assert(partitionContract?.commercial_clean_source_families === 3, 'partition contract commercial-clean source families must be 3');
  assert(partitionContract?.noncommercial_educational_source_families === 1, 'partition contract NC source families must be 1');
  assert(partitionContract?.metadata_or_link_only_source_families === 0, 'partition contract metadata/link-only source families must be 0');
  assert(partitionContract?.blocked_or_needs_review_source_families === 1, 'partition contract blocked/review source families must be 1');
  assert(partitionContract?.spark1_routable === true, 'partition contract must be Spark-1 routable');
  const oldDictionaryAgent2Handoff = artifact.changed_or_current_outputs.find((row) => row.target === 'old-dictionary-agent2-transform-lane-handoff');
  assert(oldDictionaryAgent2Handoff?.source_family_count === 5, 'old-dictionary Agent 2 handoff source family count must be 5');
  assert(oldDictionaryAgent2Handoff?.audited_rows === 500, 'old-dictionary Agent 2 handoff audited rows must be 500');
  assert(oldDictionaryAgent2Handoff?.audited_occurrences === 8427, 'old-dictionary Agent 2 handoff audited occurrences must be 8427');
  assert(oldDictionaryAgent2Handoff?.agent2_transform_allowed_now_rows === 0, 'old-dictionary Agent 2 handoff transform rows must be 0');
  assert(oldDictionaryAgent2Handoff?.spark1_routable === true, 'old-dictionary Agent 2 handoff must be Spark-1 routable');
  const oldDictionaryAgent2HandoffContract = artifact.changed_or_current_outputs.find((row) => row.target === 'old-dictionary-agent2-transform-lane-handoff-contract');
  assert(oldDictionaryAgent2HandoffContract?.source_family_count === 5, 'old-dictionary Agent 2 handoff contract source family count must be 5');
  assert(oldDictionaryAgent2HandoffContract?.audited_rows === 500, 'old-dictionary Agent 2 handoff contract audited rows must be 500');
  assert(oldDictionaryAgent2HandoffContract?.audited_occurrences === 8427, 'old-dictionary Agent 2 handoff contract audited occurrences must be 8427');
  assert(oldDictionaryAgent2HandoffContract?.agent2_transform_allowed_now_rows === 0, 'old-dictionary Agent 2 handoff contract transform rows must be 0');
  assert(oldDictionaryAgent2HandoffContract?.spark1_routable === true, 'old-dictionary Agent 2 handoff contract must be Spark-1 routable');
  const oldDictionaryPlanningBoundary = artifact.changed_or_current_outputs.find((row) => row.target === 'old-dictionary-planning-boundary-state');
  assert(oldDictionaryPlanningBoundary?.source_family_count === 5, 'old-dictionary planning boundary source family count must be 5');
  assert(oldDictionaryPlanningBoundary?.audited_rows === 500, 'old-dictionary planning boundary audited rows must be 500');
  assert(oldDictionaryPlanningBoundary?.audited_occurrences === 8427, 'old-dictionary planning boundary audited occurrences must be 8427');
  assert(oldDictionaryPlanningBoundary?.planning_evidence_allowed_source_families === 5, 'old-dictionary planning boundary planning evidence count must be 5');
  assert(oldDictionaryPlanningBoundary?.candidate_text_consumption_allowed_rows === 0, 'old-dictionary planning boundary candidate text rows must be 0');
  assert(oldDictionaryPlanningBoundary?.spark1_routable === true, 'old-dictionary planning boundary must be Spark-1 routable');
  const oldDictionaryPlanningBoundaryContract = artifact.changed_or_current_outputs.find((row) => row.target === 'old-dictionary-planning-boundary-state-contract');
  assert(oldDictionaryPlanningBoundaryContract?.source_family_count === 5, 'old-dictionary planning boundary contract source family count must be 5');
  assert(oldDictionaryPlanningBoundaryContract?.audited_rows === 500, 'old-dictionary planning boundary contract audited rows must be 500');
  assert(oldDictionaryPlanningBoundaryContract?.audited_occurrences === 8427, 'old-dictionary planning boundary contract audited occurrences must be 8427');
  assert(oldDictionaryPlanningBoundaryContract?.planning_evidence_allowed_source_families === 5, 'old-dictionary planning boundary contract planning evidence count must be 5');
  assert(oldDictionaryPlanningBoundaryContract?.candidate_text_consumption_allowed_rows === 0, 'old-dictionary planning boundary contract candidate text rows must be 0');
  assert(oldDictionaryPlanningBoundaryContract?.spark1_routable === true, 'old-dictionary planning boundary contract must be Spark-1 routable');
  const tokenInventory5000Blocker = artifact.changed_or_current_outputs.find((row) => row.target === 'broad-workbench-token-inventory-5000-source-lane-blocker');
  assert(tokenInventory5000Blocker?.inventory_top_token_rows === 5000, '5000-token blocker rows must be 5000');
  assert(tokenInventory5000Blocker?.source_lane_blocker_rows === 5000, '5000-token blocker source-lane rows must be 5000');
  assert(tokenInventory5000Blocker?.source_lane_complete_rows === 0, '5000-token blocker complete rows must be 0');
  assert(tokenInventory5000Blocker?.candidate_text_rows_now === 0, '5000-token blocker candidate text rows must be 0');
  assert(tokenInventory5000Blocker?.spark1_routable === true, '5000-token blocker must be Spark-1 routable');
  const tokenInventory5000Contract = artifact.changed_or_current_outputs.find((row) => row.target === 'broad-workbench-token-inventory-5000-source-lane-blocker-contract');
  assert(tokenInventory5000Contract?.inventory_top_token_rows === 5000, '5000-token blocker contract rows must be 5000');
  assert(tokenInventory5000Contract?.source_lane_blocker_rows === 5000, '5000-token blocker contract source-lane rows must be 5000');
  assert(tokenInventory5000Contract?.source_lane_complete_rows === 0, '5000-token blocker contract complete rows must be 0');
  assert(tokenInventory5000Contract?.candidate_text_rows_now === 0, '5000-token blocker contract candidate text rows must be 0');
  assert(tokenInventory5000Contract?.spark1_routable === true, '5000-token blocker contract must be Spark-1 routable');
  const workbench = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-source-license-custody-inventory');
  assert(workbench?.input_file_count === 10, 'workbench inventory input files must be 10');
  assert(workbench?.source_row_count === 105747, 'workbench inventory source rows must be 105747');
  assert(workbench?.license_count === 4, 'workbench inventory license count must be 4');
  assert(workbench?.unique_work_count === 1112, 'workbench inventory unique work count must be 1112');
  assert(workbench?.spark1_routable === true, 'workbench inventory must be Spark-1 routable');
  const workbenchContract = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-source-license-custody-contract');
  assert(workbenchContract?.source_row_count === 105747, 'workbench contract source rows must be 105747');
  assert(workbenchContract?.unique_work_count === 1112, 'workbench contract unique work count must be 1112');
  assert(workbenchContract?.spark1_routable === true, 'workbench contract must be Spark-1 routable');
  const workbenchPartitions = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-source-name-custody-partitions');
  assert(workbenchPartitions?.source_name_partition_count === 351, 'workbench source-name partition count must be 351');
  assert(workbenchPartitions?.top_partition_count === 100, 'workbench top partition count must be 100');
  assert(workbenchPartitions?.spark1_routable === true, 'workbench source-name partitions must be Spark-1 routable');
  const workbenchPartitionsContract = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-source-name-custody-partitions-contract');
  assert(workbenchPartitionsContract?.source_name_partition_count === 351, 'workbench source-name contract partition count must be 351');
  assert(workbenchPartitionsContract?.top_partition_count === 100, 'workbench source-name contract top partition count must be 100');
  assert(workbenchPartitionsContract?.spark1_routable === true, 'workbench source-name contract must be Spark-1 routable');
  const fullPartitions = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-full-source-name-custody-partitions');
  assert(fullPartitions?.source_row_count === 105747, 'full source-name partitions source rows must be 105747');
  assert(fullPartitions?.source_name_partition_count === 351, 'full source-name partition count must be 351');
  assert(fullPartitions?.full_partition_count === 351, 'full partition count must be 351');
  assert(fullPartitions?.public_domain_partition_count === 307, 'full partitions Public Domain count must be 307');
  assert(fullPartitions?.cc_by_sa_partition_count === 37, 'full partitions CC-BY-SA count must be 37');
  assert(fullPartitions?.cc_by_partition_count === 5, 'full partitions CC-BY count must be 5');
  assert(fullPartitions?.cc0_partition_count === 2, 'full partitions CC0 count must be 2');
  assert(fullPartitions?.spark1_routable === true, 'full source-name partitions must be Spark-1 routable');
  const fullPartitionsContract = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-full-source-name-custody-partitions-contract');
  assert(fullPartitionsContract?.source_row_count === 105747, 'full source-name contract source rows must be 105747');
  assert(fullPartitionsContract?.source_name_partition_count === 351, 'full source-name contract partition count must be 351');
  assert(fullPartitionsContract?.full_partition_count === 351, 'full source-name contract full partition count must be 351');
  assert(fullPartitionsContract?.spark1_routable === true, 'full source-name contract must be Spark-1 routable');
  const licenseMatrix = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-license-bucket-boundary-matrix');
  assert(licenseMatrix?.license_bucket_count === 4, 'license matrix bucket count must be 4');
  assert(licenseMatrix?.source_name_partition_count === 351, 'license matrix partition count must be 351');
  assert(licenseMatrix?.source_row_count === 105747, 'license matrix source rows must be 105747');
  assert(licenseMatrix?.spark1_routable === true, 'license matrix must be Spark-1 routable');
  const licenseMatrixContract = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-license-bucket-boundary-matrix-contract');
  assert(licenseMatrixContract?.license_bucket_count === 4, 'license matrix contract bucket count must be 4');
  assert(licenseMatrixContract?.source_name_partition_count === 351, 'license matrix contract partition count must be 351');
  assert(licenseMatrixContract?.source_row_count === 105747, 'license matrix contract source rows must be 105747');
  assert(licenseMatrixContract?.spark1_routable === true, 'license matrix contract must be Spark-1 routable');
  const sourceFamilyMatrix = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-source-family-boundary-matrix');
  assert(sourceFamilyMatrix?.source_family_count === 1, 'source-family matrix family count must be 1');
  assert(sourceFamilyMatrix?.source_name_partition_count === 351, 'source-family matrix partition count must be 351');
  assert(sourceFamilyMatrix?.source_row_count === 105747, 'source-family matrix source rows must be 105747');
  assert(sourceFamilyMatrix?.spark1_routable === true, 'source-family matrix must be Spark-1 routable');
  const sourceFamilyMatrixContract = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-source-family-boundary-matrix-contract');
  assert(sourceFamilyMatrixContract?.source_family_count === 1, 'source-family matrix contract family count must be 1');
  assert(sourceFamilyMatrixContract?.source_name_partition_count === 351, 'source-family matrix contract partition count must be 351');
  assert(sourceFamilyMatrixContract?.source_row_count === 105747, 'source-family matrix contract source rows must be 105747');
  assert(sourceFamilyMatrixContract?.spark1_routable === true, 'source-family matrix contract must be Spark-1 routable');
  const sourceFamilyLanePartitions = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-source-family-license-lane-partitions');
  assert(sourceFamilyLanePartitions?.source_family_license_lane_partition_count === 4, 'source-family/license-lane partition count must be 4');
  assert(sourceFamilyLanePartitions?.source_family_count === 1, 'source-family/license-lane family count must be 1');
  assert(sourceFamilyLanePartitions?.source_name_partition_count === 351, 'source-family/license-lane partition source-name count must be 351');
  assert(sourceFamilyLanePartitions?.source_row_count === 105747, 'source-family/license-lane partition source rows must be 105747');
  assert(sourceFamilyLanePartitions?.spark1_routable === true, 'source-family/license-lane partition packet must be Spark-1 routable');
  const sourceFamilyLaneContract = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-source-family-license-lane-partitions-contract');
  assert(sourceFamilyLaneContract?.source_family_license_lane_partition_count === 4, 'source-family/license-lane contract partition count must be 4');
  assert(sourceFamilyLaneContract?.source_family_count === 1, 'source-family/license-lane contract family count must be 1');
  assert(sourceFamilyLaneContract?.source_name_partition_count === 351, 'source-family/license-lane contract source-name count must be 351');
  assert(sourceFamilyLaneContract?.source_row_count === 105747, 'source-family/license-lane contract source rows must be 105747');
  assert(sourceFamilyLaneContract?.spark1_routable === true, 'source-family/license-lane contract must be Spark-1 routable');
  const sourceFamilyLaneBoundary = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-source-family-license-lane-agent6-boundary-packet');
  assert(sourceFamilyLaneBoundary?.boundary_question_count === 4, 'source-family/license-lane boundary question count must be 4');
  assert(sourceFamilyLaneBoundary?.source_family_license_lane_partition_count === 4, 'source-family/license-lane boundary partition count must be 4');
  assert(sourceFamilyLaneBoundary?.source_name_partition_count === 351, 'source-family/license-lane boundary source-name count must be 351');
  assert(sourceFamilyLaneBoundary?.source_row_count === 105747, 'source-family/license-lane boundary source rows must be 105747');
  assert(sourceFamilyLaneBoundary?.spark1_routable === true, 'source-family/license-lane boundary packet must be Spark-1 routable');
  const sourceFamilyLaneBoundaryContract = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-source-family-license-lane-agent6-boundary-packet-contract');
  assert(sourceFamilyLaneBoundaryContract?.boundary_question_count === 4, 'source-family/license-lane boundary contract question count must be 4');
  assert(sourceFamilyLaneBoundaryContract?.source_family_license_lane_partition_count === 4, 'source-family/license-lane boundary contract partition count must be 4');
  assert(sourceFamilyLaneBoundaryContract?.source_name_partition_count === 351, 'source-family/license-lane boundary contract source-name count must be 351');
  assert(sourceFamilyLaneBoundaryContract?.source_row_count === 105747, 'source-family/license-lane boundary contract source rows must be 105747');
  assert(sourceFamilyLaneBoundaryContract?.spark1_routable === true, 'source-family/license-lane boundary contract must be Spark-1 routable');
  const sourceFamilyLaneReleaseIntake = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-source-family-license-lane-release-intake-packet');
  assert(sourceFamilyLaneReleaseIntake?.release_intake_row_count === 4, 'source-family/license-lane release intake row count must be 4');
  assert(sourceFamilyLaneReleaseIntake?.boundary_question_count === 4, 'source-family/license-lane release intake boundary question count must be 4');
  assert(sourceFamilyLaneReleaseIntake?.source_name_partition_count === 351, 'source-family/license-lane release intake source-name count must be 351');
  assert(sourceFamilyLaneReleaseIntake?.source_row_count === 105747, 'source-family/license-lane release intake source rows must be 105747');
  assert(sourceFamilyLaneReleaseIntake?.spark1_routable === true, 'source-family/license-lane release intake packet must be Spark-1 routable');
  const sourceFamilyLaneReleaseIntakeContract = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-source-family-license-lane-release-intake-packet-contract');
  assert(sourceFamilyLaneReleaseIntakeContract?.release_intake_row_count === 4, 'source-family/license-lane release intake contract row count must be 4');
  assert(sourceFamilyLaneReleaseIntakeContract?.boundary_question_count === 4, 'source-family/license-lane release intake contract boundary question count must be 4');
  assert(sourceFamilyLaneReleaseIntakeContract?.source_name_partition_count === 351, 'source-family/license-lane release intake contract source-name count must be 351');
  assert(sourceFamilyLaneReleaseIntakeContract?.source_row_count === 105747, 'source-family/license-lane release intake contract source rows must be 105747');
  assert(sourceFamilyLaneReleaseIntakeContract?.spark1_routable === true, 'source-family/license-lane release intake contract must be Spark-1 routable');
  const ccBySa = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-cc-by-sa-share-alike-boundary-map');
  assert(ccBySa?.declared_cc_by_sa_partition_count === 37, 'CC-BY-SA map declared partitions must be 37');
  assert(ccBySa?.declared_cc_by_sa_source_row_count === 5581, 'CC-BY-SA map declared source rows must be 5581');
  assert(ccBySa?.sampled_cc_by_sa_partition_count === 5, 'CC-BY-SA map sampled partitions must be 5');
  assert(ccBySa?.sampled_cc_by_sa_source_row_count === 4436, 'CC-BY-SA map sampled source rows must be 4436');
  assert(ccBySa?.spark1_routable === true, 'CC-BY-SA map must be Spark-1 routable');
  const ccBySaContract = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-cc-by-sa-share-alike-boundary-contract');
  assert(ccBySaContract?.declared_cc_by_sa_partition_count === 37, 'CC-BY-SA contract declared partitions must be 37');
  assert(ccBySaContract?.declared_cc_by_sa_source_row_count === 5581, 'CC-BY-SA contract declared source rows must be 5581');
  assert(ccBySaContract?.spark1_routable === true, 'CC-BY-SA contract must be Spark-1 routable');
  const ccBy = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-cc-by-attribution-boundary-map');
  assert(ccBy?.declared_cc_by_partition_count === 5, 'CC-BY map declared partitions must be 5');
  assert(ccBy?.declared_cc_by_source_row_count === 625, 'CC-BY map declared source rows must be 625');
  assert(ccBy?.sampled_cc_by_partition_count === 1, 'CC-BY map sampled partitions must be 1');
  assert(ccBy?.sampled_cc_by_source_row_count === 239, 'CC-BY map sampled source rows must be 239');
  assert(ccBy?.spark1_routable === true, 'CC-BY map must be Spark-1 routable');
  const ccByContract = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-cc-by-attribution-boundary-contract');
  assert(ccByContract?.declared_cc_by_partition_count === 5, 'CC-BY contract declared partitions must be 5');
  assert(ccByContract?.declared_cc_by_source_row_count === 625, 'CC-BY contract declared source rows must be 625');
  assert(ccByContract?.sampled_cc_by_partition_count === 1, 'CC-BY contract sampled partitions must be 1');
  assert(ccByContract?.sampled_cc_by_source_row_count === 239, 'CC-BY contract sampled source rows must be 239');
  assert(ccByContract?.spark1_routable === true, 'CC-BY contract must be Spark-1 routable');
  const cc0 = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-cc0-public-domain-zero-boundary-map');
  assert(cc0?.declared_cc0_partition_count === 2, 'CC0 map declared partitions must be 2');
  assert(cc0?.declared_cc0_source_row_count === 496, 'CC0 map declared source rows must be 496');
  assert(cc0?.sampled_cc0_partition_count === 1, 'CC0 map sampled partitions must be 1');
  assert(cc0?.sampled_cc0_source_row_count === 267, 'CC0 map sampled source rows must be 267');
  assert(cc0?.spark1_routable === true, 'CC0 map must be Spark-1 routable');
  const cc0Contract = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-cc0-public-domain-zero-boundary-contract');
  assert(cc0Contract?.declared_cc0_partition_count === 2, 'CC0 contract declared partitions must be 2');
  assert(cc0Contract?.declared_cc0_source_row_count === 496, 'CC0 contract declared source rows must be 496');
  assert(cc0Contract?.sampled_cc0_partition_count === 1, 'CC0 contract sampled partitions must be 1');
  assert(cc0Contract?.sampled_cc0_source_row_count === 267, 'CC0 contract sampled source rows must be 267');
  assert(cc0Contract?.spark1_routable === true, 'CC0 contract must be Spark-1 routable');
  const publicDomain = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-public-domain-boundary-map');
  assert(publicDomain?.declared_public_domain_partition_count === 307, 'Public Domain map declared partitions must be 307');
  assert(publicDomain?.declared_public_domain_source_row_count === 99045, 'Public Domain map declared source rows must be 99045');
  assert(publicDomain?.sampled_public_domain_partition_count === 93, 'Public Domain map sampled partitions must be 93');
  assert(publicDomain?.sampled_public_domain_source_row_count === 88100, 'Public Domain map sampled source rows must be 88100');
  assert(publicDomain?.spark1_routable === true, 'Public Domain map must be Spark-1 routable');
  const publicDomainContract = artifact.changed_or_current_outputs.find((row) => row.target === 'workbench-public-domain-boundary-contract');
  assert(publicDomainContract?.declared_public_domain_partition_count === 307, 'Public Domain contract declared partitions must be 307');
  assert(publicDomainContract?.declared_public_domain_source_row_count === 99045, 'Public Domain contract declared source rows must be 99045');
  assert(publicDomainContract?.sampled_public_domain_partition_count === 93, 'Public Domain contract sampled partitions must be 93');
  assert(publicDomainContract?.sampled_public_domain_source_row_count === 88100, 'Public Domain contract sampled source rows must be 88100');
  assert(publicDomainContract?.spark1_routable === true, 'Public Domain contract must be Spark-1 routable');
  const mechanics = artifact.changed_or_current_outputs.find((row) => row.target === 'spark1-broad-source-mechanics');
  assert(mechanics?.missing_linkage_rows === 13, 'mechanics missing linkage rows must be 13');
  assert(mechanics?.spark1_routable === true, 'mechanics must be Spark-1 routable');
  assert(mechanics?.exact_blocker === 'missing_linkage_assignment_rule_blocker', 'mechanics exact blocker must be named');
  const missingLinkage = artifact.changed_or_current_outputs.find((row) => row.target === 'orot-missing-lexicon-linkage-candidates');
  assert(missingLinkage?.missing_lexicon_linkage_rows === 13, 'missing linkage candidate rows must be 13');
  assert(missingLinkage?.missing_lexicon_linkage_occurrences === 129, 'missing linkage candidate occurrences must be 129');
  assert(missingLinkage?.spark1_routable === true, 'missing linkage candidate output must be Spark-1 routable');
  const missingLinkageContract = artifact.changed_or_current_outputs.find((row) => row.target === 'orot-missing-lexicon-linkage-candidates-contract');
  assert(missingLinkageContract?.missing_lexicon_linkage_rows === 13, 'missing linkage contract rows must be 13');
  assert(missingLinkageContract?.missing_lexicon_linkage_occurrences === 129, 'missing linkage contract occurrences must be 129');
  assert(missingLinkageContract?.spark1_routable === true, 'missing linkage contract must be Spark-1 routable');
  const mechanicsContract = artifact.changed_or_current_outputs.find((row) => row.target === 'broad-source-mechanics-contract');
  assert(mechanicsContract?.source_row_targets === 4, 'mechanics contract source targets must be 4');
  assert(mechanicsContract?.missing_linkage_rows === 13, 'mechanics contract missing linkage rows must be 13');
  assert(mechanicsContract?.exact_blocker === 'missing_linkage_assignment_rule_blocker', 'mechanics contract exact blocker must be named');
  assert(mechanicsContract?.spark1_routable === true, 'mechanics contract must be Spark-1 routable');
  const thirdBlocker = artifact.changed_or_current_outputs.find((row) => row.target === 'third-missed-source-family-target-or-blocker');
  assert(thirdBlocker?.status === 'missing_workset_blocker', 'third missed blocker status must be missing_workset_blocker');
  assert(thirdBlocker?.rows_checked === 169, 'third missed blocker rows checked must be 169');
  assert(thirdBlocker?.occurrences_checked === 2148, 'third missed blocker occurrences checked must be 2148');
  assert(thirdBlocker?.exact_linkage_blocker_rows === 168, 'third missed exact linkage blocker rows must be 168');
  assert(thirdBlocker?.spark1_routable === false, 'third missed blocker must not be Spark-1 routable');
  const thirdBlockerHandoff = artifact.changed_or_current_outputs.find((row) => row.target === 'third-missed-source-family-missing-workset-blocker-handoff');
  assert(thirdBlockerHandoff?.status === 'exact_missing_workset_blocker_returned', 'third missed blocker handoff status must be exact_missing_workset_blocker_returned');
  assert(thirdBlockerHandoff?.rows_checked === 169, 'third missed blocker handoff rows checked must be 169');
  assert(thirdBlockerHandoff?.occurrences_checked === 2148, 'third missed blocker handoff occurrences checked must be 2148');
  assert(thirdBlockerHandoff?.exact_linkage_blocker_rows === 168, 'third missed blocker handoff linkage rows must be 168');
  assert(thirdBlockerHandoff?.spark1_routable === false, 'third missed blocker handoff must not be Spark-1 routable');
  const currentInputBlocker = artifact.changed_or_current_outputs.find((row) => row.target === 'missed-dictionary-current-input-reconciliation-blocker');
  assert(currentInputBlocker?.status === 'exact_current_input_reconciliation_blocker_returned', 'current input reconciliation blocker status must be returned');
  assert(currentInputBlocker?.agent1_rows_checked === 169, 'current input blocker Agent 1 rows checked must be 169');
  assert(currentInputBlocker?.agent2_candidate_rows === 0, 'current input blocker Agent 2 candidate rows must be zero');
  assert(currentInputBlocker?.agent2_unmatched_rows === 168, 'current input blocker unmatched rows must be 168');
  assert(currentInputBlocker?.agent3_missing_contract_fields === 4, 'current input blocker Agent 3 missing fields must be 4');
  assert(currentInputBlocker?.spark1_routable === false, 'current input blocker must not be Spark-1 routable');
  const registry = artifact.changed_or_current_outputs.find((row) => row.target === 'agent1-source-license-custody-pipeline-registry');
  assert(registry?.runnable_contract_count === 22, 'registry runnable contract count must be 22');
  assert(registry?.supporting_packet_count === 24, 'registry supporting packet count must be 24');
  assert(registry?.exact_blocker_count === 1, 'registry exact blocker count must be 1');
  assert(registry?.release_intake_hint === 'source_lane_registry', 'registry release intake hint must be source_lane_registry');
  const handoff = artifact.changed_or_current_outputs.find((row) => row.target === 'agent1-source-license-custody-aggregate-handoff');
  assert(handoff?.runnable_contract_count === 22, 'handoff runnable contract count must be 22');
  assert(handoff?.supporting_packet_count === 24, 'handoff supporting packet count must be 24');
  assert(handoff?.exact_blocker_count === 1, 'handoff exact blocker count must be 1');
  assert(handoff?.lane_return_output_count === 48, 'handoff lane-return output count must be 48');
  assert(handoff?.release_intake_hint === 'source_lane_aggregate_handoff', 'handoff release intake hint must be source_lane_aggregate_handoff');
  const commandManifest = artifact.changed_or_current_outputs.find((row) => row.target === 'agent1-source-license-custody-command-manifest');
  assert(commandManifest?.runnable_command_set_count === 22, 'command manifest runnable command set count must be 22');
  assert(commandManifest?.non_routable_blocker_count === 1, 'command manifest blocker count must be 1');
  assert(commandManifest?.aggregate_gate_count === 4, 'command manifest aggregate gate count must be 4');
  assert(commandManifest?.release_intake_hint === 'source_lane_command_manifest', 'command manifest release intake hint must be source_lane_command_manifest');
  assert(artifact.next_release_intake_request?.do_not_route_agent6_directly_from_this_packet === true, 'must not route Agent 6 directly');
  assert(artifact.export_rule?.commercial_clean_export_excludes_nc === true, 'commercial clean export must exclude NC');
  assert(artifact.export_rule?.nc_educational_export_separate === true, 'NC export must be separate');
  for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
    assert(value === 0, `${key} must be zero`);
  }
  assert(artifact.non_acceptance_boundary?.no_source_license_acceptance === true, 'no source/license acceptance boundary missing');
  assert(artifact.non_acceptance_boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    output_count: artifact.changed_or_current_outputs.length,
    deuteronomy_rows: deut.rows,
    deuteronomy_occurrences: deut.occurrences
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    error: error.message,
    boundary: {
      no_source_license_acceptance: true,
      no_qa_acceptance: true,
      no_public_runtime_mutation: true
    }
  };
  writeJson(resultPath, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

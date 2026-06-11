#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-source-license-custody-pipeline-registry-2026-06-04.json';
const resultPath = 'reports/agent1-source-license-custody-pipeline-registry-validation-result-2026-06-04.json';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message, details = null) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

try {
  const registry = readJson(artifactPath);
  const laneReturn = readJson(registry.source);
  const outputs = laneReturn.changed_or_current_outputs || [];

  assert(registry.artifact_type === 'agent1_source_license_custody_pipeline_registry', 'unexpected artifact_type');
  assert(registry.status === 'agent1_source_license_custody_pipeline_registry_validated_for_discovery_only', 'unexpected status');
  assert(registry.counts?.lane_return_output_count === outputs.length, 'lane return output count mismatch');
  assert(registry.counts?.lane_return_output_count === 48, 'lane return output count must be 48');
  assert((registry.runnable_contracts || []).length === 22, 'expected twenty-two runnable contracts');
  assert((registry.supporting_packets || []).length === 24, 'expected twenty-four supporting packets');
  assert((registry.exact_blockers || []).length === 1, 'expected one exact blocker');

  for (const contract of registry.runnable_contracts || []) {
    assert(exists(contract.contract), `missing contract: ${contract.contract}`);
    assert(contract.validator?.startsWith('node scripts/'), 'contract validator must be named command', contract);
    assert(contract.spark1_routable === true, 'contract must be Spark-1 routable', contract);
    const laneRow = outputs.find((row) => row.path === contract.contract || row.target === contract.target);
    assert(laneRow, `contract missing from lane return: ${contract.target}`);
  }
  const ccBySaContract = registry.runnable_contracts.find((contract) => contract.target === 'workbench-cc-by-sa-share-alike-boundary-contract');
  assert(ccBySaContract?.declared_cc_by_sa_partition_count === 37, 'CC-BY-SA contract declared partitions must be 37');
  assert(ccBySaContract?.declared_cc_by_sa_source_row_count === 5581, 'CC-BY-SA contract declared source rows must be 5581');
  assert(ccBySaContract?.sampled_cc_by_sa_partition_count === 5, 'CC-BY-SA contract sampled partitions must be 5');
  assert(ccBySaContract?.sampled_cc_by_sa_source_row_count === 4436, 'CC-BY-SA contract sampled source rows must be 4436');
  const ccByContract = registry.runnable_contracts.find((contract) => contract.target === 'workbench-cc-by-attribution-boundary-contract');
  assert(ccByContract?.declared_cc_by_partition_count === 5, 'CC-BY contract declared partitions must be 5');
  assert(ccByContract?.declared_cc_by_source_row_count === 625, 'CC-BY contract declared source rows must be 625');
  assert(ccByContract?.sampled_cc_by_partition_count === 1, 'CC-BY contract sampled partitions must be 1');
  assert(ccByContract?.sampled_cc_by_source_row_count === 239, 'CC-BY contract sampled source rows must be 239');
  const cc0Contract = registry.runnable_contracts.find((contract) => contract.target === 'workbench-cc0-public-domain-zero-boundary-contract');
  assert(cc0Contract?.declared_cc0_partition_count === 2, 'CC0 contract declared partitions must be 2');
  assert(cc0Contract?.declared_cc0_source_row_count === 496, 'CC0 contract declared source rows must be 496');
  assert(cc0Contract?.sampled_cc0_partition_count === 1, 'CC0 contract sampled partitions must be 1');
  assert(cc0Contract?.sampled_cc0_source_row_count === 267, 'CC0 contract sampled source rows must be 267');
  const publicDomainContract = registry.runnable_contracts.find((contract) => contract.target === 'workbench-public-domain-boundary-contract');
  assert(publicDomainContract?.declared_public_domain_partition_count === 307, 'Public Domain contract declared partitions must be 307');
  assert(publicDomainContract?.declared_public_domain_source_row_count === 99045, 'Public Domain contract declared source rows must be 99045');
  assert(publicDomainContract?.sampled_public_domain_partition_count === 93, 'Public Domain contract sampled partitions must be 93');
  assert(publicDomainContract?.sampled_public_domain_source_row_count === 88100, 'Public Domain contract sampled source rows must be 88100');
  const fullPartitionContract = registry.runnable_contracts.find((contract) => contract.target === 'workbench-full-source-name-custody-partitions-contract');
  assert(fullPartitionContract?.source_row_count === 105747, 'full partition contract source rows must be 105747');
  assert(fullPartitionContract?.source_name_partition_count === 351, 'full partition contract source-name partitions must be 351');
  assert(fullPartitionContract?.full_partition_count === 351, 'full partition contract full partitions must be 351');
  const licenseMatrixContract = registry.runnable_contracts.find((contract) => contract.target === 'workbench-license-bucket-boundary-matrix-contract');
  assert(licenseMatrixContract?.license_bucket_count === 4, 'license matrix contract bucket count must be 4');
  assert(licenseMatrixContract?.source_name_partition_count === 351, 'license matrix contract source-name partitions must be 351');
  assert(licenseMatrixContract?.source_row_count === 105747, 'license matrix contract source rows must be 105747');
  const sourceFamilyMatrixContract = registry.runnable_contracts.find((contract) => contract.target === 'workbench-source-family-boundary-matrix-contract');
  assert(sourceFamilyMatrixContract?.source_family_count === 1, 'source-family matrix contract family count must be 1');
  assert(sourceFamilyMatrixContract?.source_name_partition_count === 351, 'source-family matrix contract source-name partitions must be 351');
  assert(sourceFamilyMatrixContract?.source_row_count === 105747, 'source-family matrix contract source rows must be 105747');
  const sourceFamilyLaneContract = registry.runnable_contracts.find((contract) => contract.target === 'workbench-source-family-license-lane-partitions-contract');
  assert(sourceFamilyLaneContract?.source_family_license_lane_partition_count === 4, 'source-family/license-lane contract partition count must be 4');
  assert(sourceFamilyLaneContract?.source_family_count === 1, 'source-family/license-lane contract family count must be 1');
  assert(sourceFamilyLaneContract?.source_name_partition_count === 351, 'source-family/license-lane contract source-name partitions must be 351');
  assert(sourceFamilyLaneContract?.source_row_count === 105747, 'source-family/license-lane contract source rows must be 105747');
  const sourceFamilyLaneBoundaryContract = registry.runnable_contracts.find((contract) => contract.target === 'workbench-source-family-license-lane-agent6-boundary-packet-contract');
  assert(sourceFamilyLaneBoundaryContract?.boundary_question_count === 4, 'source-family/license-lane boundary contract question count must be 4');
  assert(sourceFamilyLaneBoundaryContract?.source_family_license_lane_partition_count === 4, 'source-family/license-lane boundary contract partition count must be 4');
  assert(sourceFamilyLaneBoundaryContract?.source_name_partition_count === 351, 'source-family/license-lane boundary contract source-name partitions must be 351');
  assert(sourceFamilyLaneBoundaryContract?.source_row_count === 105747, 'source-family/license-lane boundary contract source rows must be 105747');
  const sourceFamilyLaneReleaseIntakeContract = registry.runnable_contracts.find((contract) => contract.target === 'workbench-source-family-license-lane-release-intake-packet-contract');
  assert(sourceFamilyLaneReleaseIntakeContract?.release_intake_row_count === 4, 'source-family/license-lane release intake contract row count must be 4');
  assert(sourceFamilyLaneReleaseIntakeContract?.boundary_question_count === 4, 'source-family/license-lane release intake contract boundary question count must be 4');
  assert(sourceFamilyLaneReleaseIntakeContract?.source_name_partition_count === 351, 'source-family/license-lane release intake contract source-name partitions must be 351');
  assert(sourceFamilyLaneReleaseIntakeContract?.source_row_count === 105747, 'source-family/license-lane release intake contract source rows must be 105747');
  const oldDictionaryAgent2HandoffContract = registry.runnable_contracts.find((contract) => contract.target === 'old-dictionary-agent2-transform-lane-handoff-contract');
  assert(oldDictionaryAgent2HandoffContract?.source_family_count === 5, 'old-dictionary Agent 2 handoff contract source family count must be 5');
  assert(oldDictionaryAgent2HandoffContract?.audited_rows === 500, 'old-dictionary Agent 2 handoff contract audited rows must be 500');
  assert(oldDictionaryAgent2HandoffContract?.audited_occurrences === 8427, 'old-dictionary Agent 2 handoff contract audited occurrences must be 8427');
  assert(oldDictionaryAgent2HandoffContract?.agent2_transform_allowed_now_rows === 0, 'old-dictionary Agent 2 handoff contract transform rows must be 0');
  const oldDictionaryPlanningBoundaryContract = registry.runnable_contracts.find((contract) => contract.target === 'old-dictionary-planning-boundary-state-contract');
  assert(oldDictionaryPlanningBoundaryContract?.source_family_count === 5, 'old-dictionary planning boundary contract source family count must be 5');
  assert(oldDictionaryPlanningBoundaryContract?.audited_rows === 500, 'old-dictionary planning boundary contract audited rows must be 500');
  assert(oldDictionaryPlanningBoundaryContract?.audited_occurrences === 8427, 'old-dictionary planning boundary contract audited occurrences must be 8427');
  assert(oldDictionaryPlanningBoundaryContract?.planning_evidence_allowed_source_families === 5, 'old-dictionary planning boundary contract planning evidence count must be 5');
  assert(oldDictionaryPlanningBoundaryContract?.candidate_text_consumption_allowed_rows === 0, 'old-dictionary planning boundary contract candidate text rows must be 0');
  const tokenInventory5000Contract = registry.runnable_contracts.find((contract) => contract.target === 'broad-workbench-token-inventory-5000-source-lane-blocker-contract');
  assert(tokenInventory5000Contract?.inventory_top_token_rows === 5000, '5000-token source-lane blocker contract rows must be 5000');
  assert(tokenInventory5000Contract?.source_lane_blocker_rows === 5000, '5000-token source-lane blocker contract blocker rows must be 5000');
  assert(tokenInventory5000Contract?.source_lane_complete_rows === 0, '5000-token source-lane blocker contract complete rows must be 0');
  assert(tokenInventory5000Contract?.candidate_text_rows_now === 0, '5000-token source-lane blocker contract candidate text rows must be 0');
  assert(tokenInventory5000Contract?.exact_blocker === 'token_inventory_rows_do_not_carry_source_family_source_name_license_lane_source_url_or_citation', '5000-token source-lane blocker contract exact blocker mismatch');

  for (const packet of registry.supporting_packets || []) {
    assert(exists(packet.artifact), `missing supporting packet: ${packet.artifact}`);
    assert(packet.validator?.startsWith('node scripts/'), 'supporting packet validator must be named command', packet);
  }
  const blockerHandoff = registry.supporting_packets.find((packet) => packet.target === 'third-missed-source-family-missing-workset-blocker-handoff');
  assert(blockerHandoff?.rows_checked === 169, 'blocker handoff rows checked must be 169');
  assert(blockerHandoff?.exact_linkage_blocker_rows === 168, 'blocker handoff linkage rows must be 168');
  assert(blockerHandoff?.spark1_routable === false, 'blocker handoff must not be Spark-1 routable');
  const currentInputBlocker = registry.supporting_packets.find((packet) => packet.target === 'missed-dictionary-current-input-reconciliation-blocker');
  assert(currentInputBlocker?.agent1_rows_checked === 169, 'current input blocker Agent 1 rows checked must be 169');
  assert(currentInputBlocker?.agent2_candidate_rows === 0, 'current input blocker Agent 2 candidate rows must be zero');
  assert(currentInputBlocker?.agent2_unmatched_rows === 168, 'current input blocker unmatched rows must be 168');
  assert(currentInputBlocker?.agent3_missing_contract_fields === 4, 'current input blocker Agent 3 missing fields must be 4');
  assert(currentInputBlocker?.spark1_routable === false, 'current input blocker must not be Spark-1 routable');
  const ccBySaPacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-cc-by-sa-share-alike-boundary-map');
  assert(ccBySaPacket?.declared_cc_by_sa_partition_count === 37, 'CC-BY-SA packet declared partitions must be 37');
  assert(ccBySaPacket?.declared_cc_by_sa_source_row_count === 5581, 'CC-BY-SA packet declared source rows must be 5581');
  const ccByPacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-cc-by-attribution-boundary-map');
  assert(ccByPacket?.declared_cc_by_partition_count === 5, 'CC-BY packet declared partitions must be 5');
  assert(ccByPacket?.declared_cc_by_source_row_count === 625, 'CC-BY packet declared source rows must be 625');
  assert(ccByPacket?.sampled_cc_by_partition_count === 1, 'CC-BY packet sampled partitions must be 1');
  assert(ccByPacket?.sampled_cc_by_source_row_count === 239, 'CC-BY packet sampled source rows must be 239');
  const cc0Packet = registry.supporting_packets.find((packet) => packet.target === 'workbench-cc0-public-domain-zero-boundary-map');
  assert(cc0Packet?.declared_cc0_partition_count === 2, 'CC0 packet declared partitions must be 2');
  assert(cc0Packet?.declared_cc0_source_row_count === 496, 'CC0 packet declared source rows must be 496');
  assert(cc0Packet?.sampled_cc0_partition_count === 1, 'CC0 packet sampled partitions must be 1');
  assert(cc0Packet?.sampled_cc0_source_row_count === 267, 'CC0 packet sampled source rows must be 267');
  const publicDomainPacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-public-domain-boundary-map');
  assert(publicDomainPacket?.declared_public_domain_partition_count === 307, 'Public Domain packet declared partitions must be 307');
  assert(publicDomainPacket?.declared_public_domain_source_row_count === 99045, 'Public Domain packet declared source rows must be 99045');
  assert(publicDomainPacket?.sampled_public_domain_partition_count === 93, 'Public Domain packet sampled partitions must be 93');
  assert(publicDomainPacket?.sampled_public_domain_source_row_count === 88100, 'Public Domain packet sampled source rows must be 88100');
  const fullPartitionPacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-full-source-name-custody-partitions');
  assert(fullPartitionPacket?.source_row_count === 105747, 'full partition packet source rows must be 105747');
  assert(fullPartitionPacket?.source_name_partition_count === 351, 'full partition packet source-name partitions must be 351');
  assert(fullPartitionPacket?.full_partition_count === 351, 'full partition packet full partitions must be 351');
  assert(fullPartitionPacket?.public_domain_partition_count === 307, 'full partition packet Public Domain partitions must be 307');
  assert(fullPartitionPacket?.cc_by_sa_partition_count === 37, 'full partition packet CC-BY-SA partitions must be 37');
  assert(fullPartitionPacket?.cc_by_partition_count === 5, 'full partition packet CC-BY partitions must be 5');
  assert(fullPartitionPacket?.cc0_partition_count === 2, 'full partition packet CC0 partitions must be 2');
  const licenseMatrixPacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-license-bucket-boundary-matrix');
  assert(licenseMatrixPacket?.license_bucket_count === 4, 'license matrix packet bucket count must be 4');
  assert(licenseMatrixPacket?.source_name_partition_count === 351, 'license matrix packet source-name partitions must be 351');
  assert(licenseMatrixPacket?.source_row_count === 105747, 'license matrix packet source rows must be 105747');
  const sourceFamilyMatrixPacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-source-family-boundary-matrix');
  assert(sourceFamilyMatrixPacket?.source_family_count === 1, 'source-family matrix packet family count must be 1');
  assert(sourceFamilyMatrixPacket?.source_name_partition_count === 351, 'source-family matrix packet source-name partitions must be 351');
  assert(sourceFamilyMatrixPacket?.source_row_count === 105747, 'source-family matrix packet source rows must be 105747');
  const sourceFamilyLanePacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-source-family-license-lane-partitions');
  assert(sourceFamilyLanePacket?.source_family_license_lane_partition_count === 4, 'source-family/license-lane packet partition count must be 4');
  assert(sourceFamilyLanePacket?.source_family_count === 1, 'source-family/license-lane packet family count must be 1');
  assert(sourceFamilyLanePacket?.source_name_partition_count === 351, 'source-family/license-lane packet source-name partitions must be 351');
  assert(sourceFamilyLanePacket?.source_row_count === 105747, 'source-family/license-lane packet source rows must be 105747');
  const sourceFamilyLaneBoundaryPacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-source-family-license-lane-agent6-boundary-packet');
  assert(sourceFamilyLaneBoundaryPacket?.boundary_question_count === 4, 'source-family/license-lane boundary packet question count must be 4');
  assert(sourceFamilyLaneBoundaryPacket?.source_family_license_lane_partition_count === 4, 'source-family/license-lane boundary packet partition count must be 4');
  assert(sourceFamilyLaneBoundaryPacket?.source_name_partition_count === 351, 'source-family/license-lane boundary packet source-name partitions must be 351');
  assert(sourceFamilyLaneBoundaryPacket?.source_row_count === 105747, 'source-family/license-lane boundary packet source rows must be 105747');
  const sourceFamilyLaneReleaseIntakePacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-source-family-license-lane-release-intake-packet');
  assert(sourceFamilyLaneReleaseIntakePacket?.release_intake_row_count === 4, 'source-family/license-lane release intake packet row count must be 4');
  assert(sourceFamilyLaneReleaseIntakePacket?.boundary_question_count === 4, 'source-family/license-lane release intake packet boundary question count must be 4');
  assert(sourceFamilyLaneReleaseIntakePacket?.source_name_partition_count === 351, 'source-family/license-lane release intake packet source-name partitions must be 351');
  assert(sourceFamilyLaneReleaseIntakePacket?.source_row_count === 105747, 'source-family/license-lane release intake packet source rows must be 105747');
  const oldDictionaryAgent2HandoffPacket = registry.supporting_packets.find((packet) => packet.target === 'old-dictionary-agent2-transform-lane-handoff');
  assert(oldDictionaryAgent2HandoffPacket?.source_family_count === 5, 'old-dictionary Agent 2 handoff packet source family count must be 5');
  assert(oldDictionaryAgent2HandoffPacket?.audited_rows === 500, 'old-dictionary Agent 2 handoff packet audited rows must be 500');
  assert(oldDictionaryAgent2HandoffPacket?.audited_occurrences === 8427, 'old-dictionary Agent 2 handoff packet audited occurrences must be 8427');
  assert(oldDictionaryAgent2HandoffPacket?.agent2_transform_allowed_now_rows === 0, 'old-dictionary Agent 2 handoff packet transform rows must be 0');
  const oldDictionaryPlanningBoundaryPacket = registry.supporting_packets.find((packet) => packet.target === 'old-dictionary-planning-boundary-state');
  assert(oldDictionaryPlanningBoundaryPacket?.source_family_count === 5, 'old-dictionary planning boundary packet source family count must be 5');
  assert(oldDictionaryPlanningBoundaryPacket?.audited_rows === 500, 'old-dictionary planning boundary packet audited rows must be 500');
  assert(oldDictionaryPlanningBoundaryPacket?.audited_occurrences === 8427, 'old-dictionary planning boundary packet audited occurrences must be 8427');
  assert(oldDictionaryPlanningBoundaryPacket?.planning_evidence_allowed_source_families === 5, 'old-dictionary planning boundary packet planning evidence count must be 5');
  assert(oldDictionaryPlanningBoundaryPacket?.candidate_text_consumption_allowed_rows === 0, 'old-dictionary planning boundary packet candidate text rows must be 0');
  const tokenInventory5000Packet = registry.supporting_packets.find((packet) => packet.target === 'broad-workbench-token-inventory-5000-source-lane-blocker');
  assert(tokenInventory5000Packet?.inventory_top_token_rows === 5000, '5000-token source-lane blocker packet rows must be 5000');
  assert(tokenInventory5000Packet?.source_lane_blocker_rows === 5000, '5000-token source-lane blocker packet blocker rows must be 5000');
  assert(tokenInventory5000Packet?.source_lane_complete_rows === 0, '5000-token source-lane blocker packet complete rows must be 0');
  assert(tokenInventory5000Packet?.candidate_text_rows_now === 0, '5000-token source-lane blocker packet candidate text rows must be 0');
  assert(tokenInventory5000Packet?.exact_blocker === 'token_inventory_rows_do_not_carry_source_family_source_name_license_lane_source_url_or_citation', '5000-token source-lane blocker packet exact blocker mismatch');

  const blocker = registry.exact_blockers[0];
  assert(exists(blocker.artifact), `missing exact blocker artifact: ${blocker.artifact}`);
  assert(blocker.status === 'missing_workset_blocker', 'blocker status must be missing_workset_blocker');
  assert(blocker.rows_checked === 169, 'blocker rows checked must be 169');
  assert(blocker.occurrences_checked === 2148, 'blocker occurrences checked must be 2148');
  assert(blocker.exact_linkage_blocker_rows === 168, 'blocker exact linkage rows must be 168');
  assert(blocker.spark1_routable === false, 'blocker must not be Spark-1 routable');

  assert(registry.export_rule?.commercial_clean_export_excludes_nc === true, 'commercial-clean export must exclude NC');
  assert(registry.export_rule?.nc_educational_export_separate === true, 'NC export must be separate');
  assert(registry.non_acceptance_boundary?.no_source_license_acceptance === true, 'no source/license acceptance boundary missing');
  assert(registry.non_acceptance_boundary?.no_nc_commercial_authorization === true, 'no NC commercial authorization boundary missing');
  assert(registry.non_acceptance_boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: registry.status,
    runnable_contract_count: registry.runnable_contracts.length,
    supporting_packet_count: registry.supporting_packets.length,
    exact_blocker_count: registry.exact_blockers.length,
    lane_return_output_count: outputs.length
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    error: error.message,
    details: error.details || null,
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

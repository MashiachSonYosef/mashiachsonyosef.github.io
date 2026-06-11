#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const registryPath = process.argv[2] || 'reports/agent1-source-license-custody-pipeline-registry-2026-06-04.json';
const resultPath = 'reports/agent1-source-license-custody-pipeline-set-validation-result-2026-06-04.json';

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
  const registry = readJson(registryPath);
  const laneReturn = readJson(registry.source);
  const outputs = laneReturn.changed_or_current_outputs || [];
  const outputByTarget = Object.fromEntries(outputs.map((row) => [row.target, row]));
  const outputByPath = Object.fromEntries(outputs.map((row) => [row.path, row]));

  assert(registry.artifact_type === 'agent1_source_license_custody_pipeline_registry', 'unexpected registry artifact_type');
  assert(registry.status === 'agent1_source_license_custody_pipeline_registry_validated_for_discovery_only', 'unexpected registry status');
  assert(outputs.length === 48, 'lane return must expose 48 outputs/blockers/registry/handoff/command-manifest rows');
  assert(registry.counts?.runnable_contract_count === 22, 'registry runnable contract count must be 22');
  assert(registry.counts?.supporting_packet_count === 24, 'registry supporting packet count must be 24');
  assert(registry.counts?.exact_blocker_count === 1, 'registry exact blocker count must be 1');

  const contractExpectations = {
    'orot-nc-klein-source-family-contract': {
      status: 'pipeline_contract_runnable_validated',
      rows: 17,
      occurrences: 259,
      lane: 'noncommercial_educational_candidate'
    },
    'orot-next-missed-source-family-contract': {
      status: 'pipeline_contract_runnable_validated',
      rows: 50,
      occurrences: 1193,
      commercialCleanRows: 50,
      ncRows: 0
    },
    'deuteronomy-source-license-custody-contract': {
      status: 'pipeline_contract_runnable_validated',
      rows: 1334,
      occurrences: 2964,
      commercialCleanRows: 1334,
      ncRows: 0,
      outsideRows: 6779
    },
    'old-dictionary-excluded-row-license-lane-reaudit-contract': {
      status: 'pipeline_contract_runnable_validated',
      auditedRows: 500,
      sourceFamilyCount: 5
    },
    'old-dictionary-license-lane-export-partitions-contract': {
      status: 'pipeline_contract_runnable_validated',
      commercialCleanSourceFamilies: 3,
      noncommercialEducationalSourceFamilies: 1,
      blockedOrNeedsReviewSourceFamilies: 1
    },
    'old-dictionary-agent2-transform-lane-handoff-contract': {
      status: 'pipeline_contract_runnable_validated',
      sourceFamilyCount: 5,
      auditedRows: 500,
      auditedOccurrences: 8427,
      agent2TransformAllowedNowRows: 0
    },
    'old-dictionary-planning-boundary-state-contract': {
      status: 'pipeline_contract_runnable_validated',
      sourceFamilyCount: 5,
      auditedRows: 500,
      auditedOccurrences: 8427,
      planningEvidenceAllowedSourceFamilies: 5,
      candidateTextConsumptionAllowedRows: 0
    },
    'broad-workbench-token-inventory-5000-source-lane-blocker-contract': {
      status: 'pipeline_contract_runnable_validated_with_exact_source_lane_join_blocker',
      inventoryTopTokenRows: 5000,
      sourceLaneBlockerRows: 5000,
      sourceLaneCompleteRows: 0,
      candidateTextRowsNow: 0,
      exactBlocker: 'token_inventory_rows_do_not_carry_source_family_source_name_license_lane_source_url_or_citation'
    },
    'broad-source-mechanics-contract': {
      status: 'pipeline_contract_runnable_validated_with_exact_linkage_blocker',
      sourceRowTargets: 4,
      missingLinkageRows: 13,
      exactBlocker: 'missing_linkage_assignment_rule_blocker'
    },
    'orot-missing-lexicon-linkage-candidates-contract': {
      status: 'pipeline_contract_runnable_validated',
      missingLexiconLinkageRows: 13,
      missingLexiconLinkageOccurrences: 129
    },
    'workbench-source-license-custody-contract': {
      status: 'pipeline_contract_runnable_validated',
      sourceRowCount: 105747,
      uniqueWorkCount: 1112
    },
    'workbench-source-name-custody-partitions-contract': {
      status: 'pipeline_contract_runnable_validated',
      sourceRowCount: 105747,
      sourceNamePartitionCount: 351,
      topPartitionCount: 100
    },
    'workbench-full-source-name-custody-partitions-contract': {
      status: 'pipeline_contract_runnable_validated',
      sourceRowCount: 105747,
      sourceNamePartitionCount: 351,
      fullPartitionCount: 351
    },
    'workbench-license-bucket-boundary-matrix-contract': {
      status: 'pipeline_contract_runnable_validated',
      sourceRowCount: 105747,
      sourceNamePartitionCount: 351,
      licenseBucketCount: 4
    },
    'workbench-source-family-boundary-matrix-contract': {
      status: 'pipeline_contract_runnable_validated',
      sourceRowCount: 105747,
      sourceNamePartitionCount: 351,
      sourceFamilyCount: 1
    },
    'workbench-source-family-license-lane-partitions-contract': {
      status: 'pipeline_contract_runnable_validated',
      sourceRowCount: 105747,
      sourceNamePartitionCount: 351,
      sourceFamilyCount: 1,
      sourceFamilyLicenseLanePartitionCount: 4
    },
    'workbench-source-family-license-lane-agent6-boundary-packet-contract': {
      status: 'pipeline_contract_runnable_validated',
      sourceRowCount: 105747,
      sourceNamePartitionCount: 351,
      sourceFamilyLicenseLanePartitionCount: 4,
      boundaryQuestionCount: 4
    },
    'workbench-source-family-license-lane-release-intake-packet-contract': {
      status: 'pipeline_contract_runnable_validated',
      sourceRowCount: 105747,
      sourceNamePartitionCount: 351,
      sourceFamilyLicenseLanePartitionCount: 4,
      boundaryQuestionCount: 4,
      releaseIntakeRowCount: 4
    },
    'workbench-cc-by-sa-share-alike-boundary-contract': {
      status: 'pipeline_contract_runnable_validated',
      declaredCcBySaPartitions: 37,
      declaredCcBySaRows: 5581,
      sampledCcBySaPartitions: 5,
      sampledCcBySaRows: 4436
    },
    'workbench-cc-by-attribution-boundary-contract': {
      status: 'pipeline_contract_runnable_validated',
      declaredCcByPartitions: 5,
      declaredCcByRows: 625,
      sampledCcByPartitions: 1,
      sampledCcByRows: 239
    },
    'workbench-cc0-public-domain-zero-boundary-contract': {
      status: 'pipeline_contract_runnable_validated',
      declaredCc0Partitions: 2,
      declaredCc0Rows: 496,
      sampledCc0Partitions: 1,
      sampledCc0Rows: 267
    },
    'workbench-public-domain-boundary-contract': {
      status: 'pipeline_contract_runnable_validated',
      declaredPublicDomainPartitions: 307,
      declaredPublicDomainRows: 99045,
      sampledPublicDomainPartitions: 93,
      sampledPublicDomainRows: 88100
    }
  };

  for (const contractRef of registry.runnable_contracts || []) {
    const expected = contractExpectations[contractRef.target];
    assert(expected, `unexpected runnable contract target: ${contractRef.target}`);
    assert(exists(contractRef.contract), `missing contract file: ${contractRef.contract}`);
    const contract = readJson(contractRef.contract);
    assert(contract.status === expected.status, `contract status mismatch: ${contractRef.target}`, contract);
    assert(contractRef.spark1_routable === true, `registry contract not Spark-1 routable: ${contractRef.target}`);
    assert((outputByPath[contractRef.contract] || outputByTarget[contractRef.target])?.spark1_routable === true, `lane return missing routable contract: ${contractRef.target}`);

    if (expected.rows !== undefined) assert(contractRef.rows === expected.rows, `registry row mismatch: ${contractRef.target}`);
    if (expected.occurrences !== undefined) assert(contractRef.occurrences === expected.occurrences, `registry occurrence mismatch: ${contractRef.target}`);
    if (expected.lane) assert(contractRef.license_lane === expected.lane, `registry lane mismatch: ${contractRef.target}`);
    if (expected.commercialCleanRows !== undefined) assert(contractRef.commercial_clean_rows === expected.commercialCleanRows, `commercial clean row mismatch: ${contractRef.target}`);
    if (expected.ncRows !== undefined) assert(contractRef.nc_rows === expected.ncRows, `NC row mismatch: ${contractRef.target}`);
    if (expected.outsideRows !== undefined) assert(contractRef.outside_workset_blocker_rows === expected.outsideRows, `outside blocker row mismatch: ${contractRef.target}`);
    if (expected.auditedRows !== undefined) assert(contractRef.audited_rows === expected.auditedRows, `audited row mismatch: ${contractRef.target}`);
    if (expected.auditedOccurrences !== undefined) assert(contractRef.audited_occurrences === expected.auditedOccurrences, `audited occurrence mismatch: ${contractRef.target}`);
    if (expected.agent2TransformAllowedNowRows !== undefined) assert(contractRef.agent2_transform_allowed_now_rows === expected.agent2TransformAllowedNowRows, `Agent 2 transform row mismatch: ${contractRef.target}`);
    if (expected.planningEvidenceAllowedSourceFamilies !== undefined) assert(contractRef.planning_evidence_allowed_source_families === expected.planningEvidenceAllowedSourceFamilies, `planning evidence count mismatch: ${contractRef.target}`);
    if (expected.candidateTextConsumptionAllowedRows !== undefined) assert(contractRef.candidate_text_consumption_allowed_rows === expected.candidateTextConsumptionAllowedRows, `candidate text row mismatch: ${contractRef.target}`);
    if (expected.inventoryTopTokenRows !== undefined) assert(contractRef.inventory_top_token_rows === expected.inventoryTopTokenRows, `inventory token row mismatch: ${contractRef.target}`);
    if (expected.sourceLaneBlockerRows !== undefined) assert(contractRef.source_lane_blocker_rows === expected.sourceLaneBlockerRows, `source-lane blocker row mismatch: ${contractRef.target}`);
    if (expected.sourceLaneCompleteRows !== undefined) assert(contractRef.source_lane_complete_rows === expected.sourceLaneCompleteRows, `source-lane complete row mismatch: ${contractRef.target}`);
    if (expected.candidateTextRowsNow !== undefined) assert(contractRef.candidate_text_rows_now === expected.candidateTextRowsNow, `candidate text row mismatch: ${contractRef.target}`);
    if (expected.sourceFamilyCount !== undefined) assert(contractRef.source_family_count === expected.sourceFamilyCount, `source family count mismatch: ${contractRef.target}`);
    if (expected.sourceFamilyLicenseLanePartitionCount !== undefined) assert(contractRef.source_family_license_lane_partition_count === expected.sourceFamilyLicenseLanePartitionCount, `source-family/license-lane partition count mismatch: ${contractRef.target}`);
    if (expected.boundaryQuestionCount !== undefined) assert(contractRef.boundary_question_count === expected.boundaryQuestionCount, `boundary question count mismatch: ${contractRef.target}`);
    if (expected.releaseIntakeRowCount !== undefined) assert(contractRef.release_intake_row_count === expected.releaseIntakeRowCount, `release intake row count mismatch: ${contractRef.target}`);
    if (expected.commercialCleanSourceFamilies !== undefined) assert(contractRef.commercial_clean_source_families === expected.commercialCleanSourceFamilies, `commercial-clean family count mismatch: ${contractRef.target}`);
    if (expected.noncommercialEducationalSourceFamilies !== undefined) assert(contractRef.noncommercial_educational_source_families === expected.noncommercialEducationalSourceFamilies, `NC family count mismatch: ${contractRef.target}`);
    if (expected.blockedOrNeedsReviewSourceFamilies !== undefined) assert(contractRef.blocked_or_needs_review_source_families === expected.blockedOrNeedsReviewSourceFamilies, `blocked/review family count mismatch: ${contractRef.target}`);
    if (expected.sourceRowTargets !== undefined) assert(contractRef.source_row_targets === expected.sourceRowTargets, `source target mismatch: ${contractRef.target}`);
    if (expected.missingLinkageRows !== undefined) assert(contractRef.missing_linkage_rows === expected.missingLinkageRows, `missing linkage mismatch: ${contractRef.target}`);
    if (expected.missingLexiconLinkageRows !== undefined) assert(contractRef.missing_lexicon_linkage_rows === expected.missingLexiconLinkageRows, `missing lexicon linkage row mismatch: ${contractRef.target}`);
    if (expected.missingLexiconLinkageOccurrences !== undefined) assert(contractRef.missing_lexicon_linkage_occurrences === expected.missingLexiconLinkageOccurrences, `missing lexicon linkage occurrence mismatch: ${contractRef.target}`);
    if (expected.exactBlocker) assert(contractRef.exact_blocker === expected.exactBlocker, `exact blocker mismatch: ${contractRef.target}`);
    if (expected.sourceRowCount !== undefined) assert(contractRef.source_row_count === expected.sourceRowCount, `source row count mismatch: ${contractRef.target}`);
    if (expected.uniqueWorkCount !== undefined) assert(contractRef.unique_work_count === expected.uniqueWorkCount, `unique work count mismatch: ${contractRef.target}`);
    if (expected.sourceNamePartitionCount !== undefined) assert(contractRef.source_name_partition_count === expected.sourceNamePartitionCount, `source-name partition count mismatch: ${contractRef.target}`);
    if (expected.topPartitionCount !== undefined) assert(contractRef.top_partition_count === expected.topPartitionCount, `top partition count mismatch: ${contractRef.target}`);
    if (expected.fullPartitionCount !== undefined) assert(contractRef.full_partition_count === expected.fullPartitionCount, `full partition count mismatch: ${contractRef.target}`);
    if (expected.licenseBucketCount !== undefined) assert(contractRef.license_bucket_count === expected.licenseBucketCount, `license bucket count mismatch: ${contractRef.target}`);
    if (expected.declaredCcBySaPartitions !== undefined) assert(contractRef.declared_cc_by_sa_partition_count === expected.declaredCcBySaPartitions, `CC-BY-SA declared partition mismatch: ${contractRef.target}`);
    if (expected.declaredCcBySaRows !== undefined) assert(contractRef.declared_cc_by_sa_source_row_count === expected.declaredCcBySaRows, `CC-BY-SA declared row mismatch: ${contractRef.target}`);
    if (expected.sampledCcBySaPartitions !== undefined) assert(contractRef.sampled_cc_by_sa_partition_count === expected.sampledCcBySaPartitions, `CC-BY-SA sampled partition mismatch: ${contractRef.target}`);
    if (expected.sampledCcBySaRows !== undefined) assert(contractRef.sampled_cc_by_sa_source_row_count === expected.sampledCcBySaRows, `CC-BY-SA sampled row mismatch: ${contractRef.target}`);
    if (expected.declaredCcByPartitions !== undefined) assert(contractRef.declared_cc_by_partition_count === expected.declaredCcByPartitions, `CC-BY declared partition mismatch: ${contractRef.target}`);
    if (expected.declaredCcByRows !== undefined) assert(contractRef.declared_cc_by_source_row_count === expected.declaredCcByRows, `CC-BY declared row mismatch: ${contractRef.target}`);
    if (expected.sampledCcByPartitions !== undefined) assert(contractRef.sampled_cc_by_partition_count === expected.sampledCcByPartitions, `CC-BY sampled partition mismatch: ${contractRef.target}`);
    if (expected.sampledCcByRows !== undefined) assert(contractRef.sampled_cc_by_source_row_count === expected.sampledCcByRows, `CC-BY sampled row mismatch: ${contractRef.target}`);
    if (expected.declaredCc0Partitions !== undefined) assert(contractRef.declared_cc0_partition_count === expected.declaredCc0Partitions, `CC0 declared partition mismatch: ${contractRef.target}`);
    if (expected.declaredCc0Rows !== undefined) assert(contractRef.declared_cc0_source_row_count === expected.declaredCc0Rows, `CC0 declared row mismatch: ${contractRef.target}`);
    if (expected.sampledCc0Partitions !== undefined) assert(contractRef.sampled_cc0_partition_count === expected.sampledCc0Partitions, `CC0 sampled partition mismatch: ${contractRef.target}`);
    if (expected.sampledCc0Rows !== undefined) assert(contractRef.sampled_cc0_source_row_count === expected.sampledCc0Rows, `CC0 sampled row mismatch: ${contractRef.target}`);
    if (expected.declaredPublicDomainPartitions !== undefined) assert(contractRef.declared_public_domain_partition_count === expected.declaredPublicDomainPartitions, `Public Domain declared partition mismatch: ${contractRef.target}`);
    if (expected.declaredPublicDomainRows !== undefined) assert(contractRef.declared_public_domain_source_row_count === expected.declaredPublicDomainRows, `Public Domain declared row mismatch: ${contractRef.target}`);
    if (expected.sampledPublicDomainPartitions !== undefined) assert(contractRef.sampled_public_domain_partition_count === expected.sampledPublicDomainPartitions, `Public Domain sampled partition mismatch: ${contractRef.target}`);
    if (expected.sampledPublicDomainRows !== undefined) assert(contractRef.sampled_public_domain_source_row_count === expected.sampledPublicDomainRows, `Public Domain sampled row mismatch: ${contractRef.target}`);
  }

  for (const packet of registry.supporting_packets || []) {
    assert(exists(packet.artifact), `missing supporting packet: ${packet.artifact}`);
    assert(outputByPath[packet.artifact], `supporting packet absent from lane return: ${packet.artifact}`);
  }
  const blockerHandoff = registry.supporting_packets.find((packet) => packet.target === 'third-missed-source-family-missing-workset-blocker-handoff');
  assert(blockerHandoff?.rows_checked === 169, 'blocker handoff rows checked must be 169');
  assert(blockerHandoff?.exact_linkage_blocker_rows === 168, 'blocker handoff exact linkage rows must be 168');
  assert(blockerHandoff?.spark1_routable === false, 'blocker handoff must not be Spark-1 routable');
  const currentInputBlocker = registry.supporting_packets.find((packet) => packet.target === 'missed-dictionary-current-input-reconciliation-blocker');
  assert(currentInputBlocker?.agent2_candidate_rows === 0, 'current input blocker candidate rows must be zero');
  assert(currentInputBlocker?.agent2_unmatched_rows === 168, 'current input blocker unmatched rows must be 168');
  assert(currentInputBlocker?.agent3_missing_contract_fields === 4, 'current input blocker missing fields must be 4');
  assert(currentInputBlocker?.spark1_routable === false, 'current input blocker must not be Spark-1 routable');
  const oldDictionaryAgent2HandoffPacket = registry.supporting_packets.find((packet) => packet.target === 'old-dictionary-agent2-transform-lane-handoff');
  assert(oldDictionaryAgent2HandoffPacket?.source_family_count === 5, 'old-dictionary Agent 2 handoff supporting packet source family count must be 5');
  assert(oldDictionaryAgent2HandoffPacket?.audited_rows === 500, 'old-dictionary Agent 2 handoff supporting packet audited rows must be 500');
  assert(oldDictionaryAgent2HandoffPacket?.audited_occurrences === 8427, 'old-dictionary Agent 2 handoff supporting packet audited occurrences must be 8427');
  assert(oldDictionaryAgent2HandoffPacket?.agent2_transform_allowed_now_rows === 0, 'old-dictionary Agent 2 handoff supporting packet transform rows must be 0');
  const oldDictionaryPlanningBoundaryPacket = registry.supporting_packets.find((packet) => packet.target === 'old-dictionary-planning-boundary-state');
  assert(oldDictionaryPlanningBoundaryPacket?.source_family_count === 5, 'old-dictionary planning boundary supporting packet source family count must be 5');
  assert(oldDictionaryPlanningBoundaryPacket?.audited_rows === 500, 'old-dictionary planning boundary supporting packet audited rows must be 500');
  assert(oldDictionaryPlanningBoundaryPacket?.audited_occurrences === 8427, 'old-dictionary planning boundary supporting packet audited occurrences must be 8427');
  assert(oldDictionaryPlanningBoundaryPacket?.planning_evidence_allowed_source_families === 5, 'old-dictionary planning boundary supporting packet planning evidence count must be 5');
  assert(oldDictionaryPlanningBoundaryPacket?.candidate_text_consumption_allowed_rows === 0, 'old-dictionary planning boundary supporting packet candidate text rows must be 0');
  const tokenInventory5000Packet = registry.supporting_packets.find((packet) => packet.target === 'broad-workbench-token-inventory-5000-source-lane-blocker');
  assert(tokenInventory5000Packet?.inventory_top_token_rows === 5000, '5000-token blocker supporting packet rows must be 5000');
  assert(tokenInventory5000Packet?.source_lane_blocker_rows === 5000, '5000-token blocker supporting packet source-lane rows must be 5000');
  assert(tokenInventory5000Packet?.source_lane_complete_rows === 0, '5000-token blocker supporting packet complete rows must be 0');
  assert(tokenInventory5000Packet?.candidate_text_rows_now === 0, '5000-token blocker supporting packet candidate text rows must be 0');
  const ccBySaPacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-cc-by-sa-share-alike-boundary-map');
  assert(ccBySaPacket?.declared_cc_by_sa_partition_count === 37, 'CC-BY-SA supporting packet declared partitions must be 37');
  assert(ccBySaPacket?.declared_cc_by_sa_source_row_count === 5581, 'CC-BY-SA supporting packet declared source rows must be 5581');
  const ccByPacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-cc-by-attribution-boundary-map');
  assert(ccByPacket?.declared_cc_by_partition_count === 5, 'CC-BY supporting packet declared partitions must be 5');
  assert(ccByPacket?.declared_cc_by_source_row_count === 625, 'CC-BY supporting packet declared source rows must be 625');
  assert(ccByPacket?.sampled_cc_by_partition_count === 1, 'CC-BY supporting packet sampled partitions must be 1');
  assert(ccByPacket?.sampled_cc_by_source_row_count === 239, 'CC-BY supporting packet sampled source rows must be 239');
  const cc0Packet = registry.supporting_packets.find((packet) => packet.target === 'workbench-cc0-public-domain-zero-boundary-map');
  assert(cc0Packet?.declared_cc0_partition_count === 2, 'CC0 supporting packet declared partitions must be 2');
  assert(cc0Packet?.declared_cc0_source_row_count === 496, 'CC0 supporting packet declared source rows must be 496');
  assert(cc0Packet?.sampled_cc0_partition_count === 1, 'CC0 supporting packet sampled partitions must be 1');
  assert(cc0Packet?.sampled_cc0_source_row_count === 267, 'CC0 supporting packet sampled source rows must be 267');
  const publicDomainPacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-public-domain-boundary-map');
  assert(publicDomainPacket?.declared_public_domain_partition_count === 307, 'Public Domain supporting packet declared partitions must be 307');
  assert(publicDomainPacket?.declared_public_domain_source_row_count === 99045, 'Public Domain supporting packet declared source rows must be 99045');
  assert(publicDomainPacket?.sampled_public_domain_partition_count === 93, 'Public Domain supporting packet sampled partitions must be 93');
  assert(publicDomainPacket?.sampled_public_domain_source_row_count === 88100, 'Public Domain supporting packet sampled source rows must be 88100');
  const fullPartitionPacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-full-source-name-custody-partitions');
  assert(fullPartitionPacket?.source_row_count === 105747, 'full partition supporting packet source rows must be 105747');
  assert(fullPartitionPacket?.source_name_partition_count === 351, 'full partition supporting packet source-name partitions must be 351');
  assert(fullPartitionPacket?.full_partition_count === 351, 'full partition supporting packet full partitions must be 351');
  assert(fullPartitionPacket?.public_domain_partition_count === 307, 'full partition supporting packet Public Domain partitions must be 307');
  assert(fullPartitionPacket?.cc_by_sa_partition_count === 37, 'full partition supporting packet CC-BY-SA partitions must be 37');
  assert(fullPartitionPacket?.cc_by_partition_count === 5, 'full partition supporting packet CC-BY partitions must be 5');
  assert(fullPartitionPacket?.cc0_partition_count === 2, 'full partition supporting packet CC0 partitions must be 2');
  const licenseMatrixPacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-license-bucket-boundary-matrix');
  assert(licenseMatrixPacket?.license_bucket_count === 4, 'license matrix supporting packet bucket count must be 4');
  assert(licenseMatrixPacket?.source_name_partition_count === 351, 'license matrix supporting packet source-name partitions must be 351');
  assert(licenseMatrixPacket?.source_row_count === 105747, 'license matrix supporting packet source rows must be 105747');
  const sourceFamilyMatrixPacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-source-family-boundary-matrix');
  assert(sourceFamilyMatrixPacket?.source_family_count === 1, 'source-family matrix supporting packet family count must be 1');
  assert(sourceFamilyMatrixPacket?.source_name_partition_count === 351, 'source-family matrix supporting packet source-name partitions must be 351');
  assert(sourceFamilyMatrixPacket?.source_row_count === 105747, 'source-family matrix supporting packet source rows must be 105747');
  const sourceFamilyLanePacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-source-family-license-lane-partitions');
  assert(sourceFamilyLanePacket?.source_family_license_lane_partition_count === 4, 'source-family/license-lane supporting packet partition count must be 4');
  assert(sourceFamilyLanePacket?.source_family_count === 1, 'source-family/license-lane supporting packet family count must be 1');
  assert(sourceFamilyLanePacket?.source_name_partition_count === 351, 'source-family/license-lane supporting packet source-name partitions must be 351');
  assert(sourceFamilyLanePacket?.source_row_count === 105747, 'source-family/license-lane supporting packet source rows must be 105747');
  const sourceFamilyLaneBoundaryPacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-source-family-license-lane-agent6-boundary-packet');
  assert(sourceFamilyLaneBoundaryPacket?.boundary_question_count === 4, 'source-family/license-lane boundary supporting packet question count must be 4');
  assert(sourceFamilyLaneBoundaryPacket?.source_family_license_lane_partition_count === 4, 'source-family/license-lane boundary supporting packet partition count must be 4');
  assert(sourceFamilyLaneBoundaryPacket?.source_name_partition_count === 351, 'source-family/license-lane boundary supporting packet source-name partitions must be 351');
  assert(sourceFamilyLaneBoundaryPacket?.source_row_count === 105747, 'source-family/license-lane boundary supporting packet source rows must be 105747');
  const sourceFamilyLaneReleaseIntakePacket = registry.supporting_packets.find((packet) => packet.target === 'workbench-source-family-license-lane-release-intake-packet');
  assert(sourceFamilyLaneReleaseIntakePacket?.release_intake_row_count === 4, 'source-family/license-lane release intake supporting packet row count must be 4');
  assert(sourceFamilyLaneReleaseIntakePacket?.boundary_question_count === 4, 'source-family/license-lane release intake supporting packet boundary question count must be 4');
  assert(sourceFamilyLaneReleaseIntakePacket?.source_name_partition_count === 351, 'source-family/license-lane release intake supporting packet source-name partitions must be 351');
  assert(sourceFamilyLaneReleaseIntakePacket?.source_row_count === 105747, 'source-family/license-lane release intake supporting packet source rows must be 105747');

  const blocker = registry.exact_blockers?.[0];
  assert(blocker?.status === 'missing_workset_blocker', 'exact blocker must be missing_workset_blocker');
  assert(blocker?.spark1_routable === false, 'exact blocker must not be Spark-1 routable');
  assert(blocker?.rows_checked === 169, 'exact blocker rows checked must be 169');
  assert(blocker?.exact_linkage_blocker_rows === 168, 'exact blocker linkage rows must be 168');
  assert(outputByPath[blocker.artifact]?.spark1_routable === false, 'lane return blocker must be non-routable');

  assert(registry.export_rule?.commercial_clean_export_excludes_nc === true, 'commercial-clean export must exclude NC');
  assert(registry.export_rule?.nc_educational_export_separate === true, 'NC educational export must be separate');
  assert(registry.non_acceptance_boundary?.no_source_license_acceptance === true, 'no source/license acceptance boundary missing');
  assert(registry.non_acceptance_boundary?.no_nc_commercial_authorization === true, 'no NC commercial authorization boundary missing');
  assert(registry.non_acceptance_boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_registry: registryPath,
    completed_at: new Date().toISOString(),
    status: 'agent1_source_license_custody_pipeline_set_validated_for_discovery_only',
    runnable_contract_count: registry.runnable_contracts.length,
    supporting_packet_count: registry.supporting_packets.length,
    exact_blocker_count: registry.exact_blockers.length,
    lane_return_output_count: outputs.length,
    no_acceptance_claims: true
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_registry: registryPath,
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

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent1-lowmode-source-license-custody-contract-status-2026-06-04.json';
const resultPath = 'reports/agent1-lowmode-source-license-custody-contract-status-validation-result-2026-06-04.json';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
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
  const artifact = readJson(artifactPath);
  const laneReturn = readJson(artifact.current_lane_return.artifact);
  const pipelineSet = readJson(artifact.aggregate_pipeline_set.validation_result);
  const contracts = artifact.contracts || [];
  const byTarget = Object.fromEntries(contracts.map((contract) => [contract.target, contract]));

  assert(artifact.artifact_type === 'agent1_lowmode_source_license_custody_contract_status', 'unexpected artifact_type');
  assert(artifact.status === 'contracts_1_2_runnable_validated__contract_3_target_blocker_validated', 'unexpected status');
  assert(contracts.length === 3, 'expected three lowmode contract entries');

  const nc = byTarget['Orot NC/Klein source-family pipeline'];
  assert(nc?.source_license_counts?.rows === 17, 'NC/Klein rows must be 17');
  assert(nc?.source_license_counts?.occurrences === 259, 'NC/Klein occurrences must be 259');
  assert(nc?.source_license_counts?.classification === 'noncommercial_educational_candidate', 'NC/Klein lane must be NC educational');
  assert(nc?.contract_validator_result?.includes('spark1_routable=true'), 'NC/Klein contract validator result must prove Spark routable');

  const next = byTarget['Orot next missed source-family pipeline'];
  assert(next?.source_license_counts?.rows === 50, 'next missed rows must be 50');
  assert(next?.source_license_counts?.occurrences === 1193, 'next missed occurrences must be 1193');
  assert(next?.source_license_counts?.commercial_clean_candidate_rows === 50, 'next missed commercial clean rows must be 50');
  assert(next?.source_license_counts?.noncommercial_educational_candidate_rows === 0, 'next missed NC rows must be zero');
  assert(next?.contract_validator_result?.includes('spark1_routable=true'), 'next missed contract validator result must prove Spark routable');

  const third = byTarget['third missed source-family target discovery/blocker'];
  assert(third?.source_license_counts?.local_route_card_matrix_rows === 169, 'third matrix rows must be 169');
  assert(third?.source_license_counts?.local_route_card_matrix_occurrences === 2148, 'third matrix occurrences must be 2148');
  assert(third?.source_license_counts?.exact_linkage_blocker_rows === 168, 'third exact linkage blocker rows must be 168');
  assert(third?.source_license_counts?.row_level_source_family_or_license_fields_observed === false, 'third row-level source/license fields must be absent');
  assert(third?.spark1_handoff?.includes('spark1_route_allowed_now=false'), 'third must remain non-routable');

  assert(laneReturn.changed_or_current_outputs?.length === artifact.current_lane_return.output_count, 'lane return output count mismatch');
  assert(artifact.current_lane_return.output_count === 48, 'lane return output count must be 48');
  assert(artifact.current_lane_return.includes_contract_3_exact_blocker === true, 'lane return must include Contract 3 blocker');
  assert(artifact.aggregate_pipeline_set.status === 'agent1_source_license_custody_pipeline_set_validated_for_discovery_only', 'aggregate pipeline set status mismatch');
  assert(artifact.aggregate_pipeline_set.runnable_contract_count === 22, 'aggregate runnable contract count must be 22');
  assert(artifact.aggregate_pipeline_set.supporting_packet_count === 24, 'aggregate supporting packet count must be 24');
  assert(artifact.aggregate_pipeline_set.exact_blocker_count === 1, 'aggregate exact blocker count must be 1');
  assert(artifact.aggregate_pipeline_set.lane_return_output_count === 48, 'aggregate lane return output count must be 48');
  assert(pipelineSet.ok === true, 'aggregate pipeline set validation result must be ok');
  assert(pipelineSet.runnable_contract_count === artifact.aggregate_pipeline_set.runnable_contract_count, 'aggregate runnable contract result mismatch');
  assert(pipelineSet.exact_blocker_count === artifact.aggregate_pipeline_set.exact_blocker_count, 'aggregate exact blocker result mismatch');

  assert(artifact.boundary?.no_source_provenance_acceptance === true, 'source/provenance non-acceptance boundary missing');
  assert(artifact.boundary?.no_nc_flattening === true, 'no NC flattening boundary missing');
  assert(artifact.boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: artifactPath,
    completed_at: new Date().toISOString(),
    status: artifact.status,
    contracts_checked: contracts.length,
    lane_return_output_count: artifact.current_lane_return.output_count,
    aggregate_pipeline_set_status: artifact.aggregate_pipeline_set.status,
    contract3_spark1_routable: false
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

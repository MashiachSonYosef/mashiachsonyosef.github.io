#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const contractPath = process.argv[2] || 'reports/agent1-spark1-pipeline-contract-workbench-cc0-public-domain-zero-boundary-map-2026-06-04.json';
const resultPath = 'reports/agent1-spark1-pipeline-contract-workbench-cc0-public-domain-zero-boundary-map-validation-result-2026-06-04.json';

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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const contract = readJson(contractPath);
  const output = readJson(contract.outputs.json);

  assert(contract.artifact_type === 'agent1_spark1_pipeline_contract', 'unexpected artifact_type');
  assert(contract.status === 'pipeline_contract_runnable_validated', 'contract status mismatch');
  assert(contract.target?.workset === 'workbench-cc0-public-domain-zero-boundary-map', 'contract workset mismatch');
  assert(exists(contract.inputs[0]), 'contract input missing');
  assert(exists(contract.outputs.json), 'contract output json missing');
  assert(exists(contract.outputs.markdown), 'contract output markdown missing');
  assert(contract.command_or_script?.build === 'node scripts/build_agent1_workbench_cc0_public_domain_zero_boundary_map.mjs', 'build command mismatch');
  assert(contract.validator?.command === 'node scripts/validate_agent1_workbench_cc0_public_domain_zero_boundary_map.mjs', 'validator command mismatch');
  assert(contract.validator?.contract_validator === 'node scripts/validate_agent1_spark1_workbench_cc0_public_domain_zero_boundary_contract.mjs', 'contract validator command mismatch');
  assert(contract.target?.declared_cc0_partition_count === 2, 'contract declared partition count must be 2');
  assert(contract.target?.declared_cc0_source_row_count === 496, 'contract declared source row count must be 496');
  assert(contract.target?.sampled_cc0_partition_count === output.counts.sampled_cc0_partition_count, 'contract sampled partition count mismatch');
  assert(contract.target?.sampled_cc0_source_row_count === output.counts.sampled_cc0_source_row_count, 'contract sampled row count mismatch');
  assert(contract.export_rule?.cc0_public_domain_zero_candidate === true, 'contract CC0 candidate rule missing');
  assert(contract.export_rule?.cc0_export_authorized_now === false, 'contract must not authorize CC0 export now');
  assert(contract.agent6_boundary_need?.includes('Agent 6/release boundary'), 'Agent 6 boundary need missing');

  const result = {
    ok: true,
    validated_artifact: contractPath,
    completed_at: new Date().toISOString(),
    status: contract.status,
    target: contract.target.workset,
    declared_cc0_partition_count: contract.target.declared_cc0_partition_count,
    declared_cc0_source_row_count: contract.target.declared_cc0_source_row_count,
    sampled_cc0_partition_count: contract.target.sampled_cc0_partition_count,
    sampled_cc0_source_row_count: contract.target.sampled_cc0_source_row_count,
    spark1_routable: true
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: contractPath,
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

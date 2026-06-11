#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const contractPath = process.argv[2] || 'reports/agent1-spark1-pipeline-contract-workbench-source-family-boundary-matrix-2026-06-04.json';
const resultPath = 'reports/agent1-spark1-pipeline-contract-workbench-source-family-boundary-matrix-validation-result-2026-06-04.json';

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
  assert(contract.target?.workset === 'workbench-source-family-boundary-matrix', 'contract workset mismatch');
  assert(exists(contract.inputs[0]), 'contract input missing');
  assert(exists(contract.outputs.json), 'contract output json missing');
  assert(exists(contract.outputs.markdown), 'contract output markdown missing');
  assert(contract.command_or_script?.build === 'node scripts/build_agent1_workbench_source_family_boundary_matrix.mjs', 'build command mismatch');
  assert(contract.validator?.command === 'node scripts/validate_agent1_workbench_source_family_boundary_matrix.mjs', 'validator command mismatch');
  assert(contract.validator?.contract_validator === 'node scripts/validate_agent1_spark1_workbench_source_family_boundary_matrix_contract.mjs', 'contract validator command mismatch');
  assert(contract.target?.source_family_count === 1, 'contract source family count must be 1');
  assert(contract.target?.source_name_partition_count === 351, 'contract source-name partition count must be 351');
  assert(contract.target?.source_row_count === 105747, 'contract source row count must be 105747');
  assert(output.counts?.source_family_count === contract.target.source_family_count, 'output source family count mismatch');
  assert(contract.agent6_boundary_need?.includes('Agent 6/release boundary'), 'Agent 6 boundary need missing');

  const result = {
    ok: true,
    validated_artifact: contractPath,
    completed_at: new Date().toISOString(),
    status: contract.status,
    target: contract.target.workset,
    source_family_count: contract.target.source_family_count,
    source_name_partition_count: contract.target.source_name_partition_count,
    source_row_count: contract.target.source_row_count,
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

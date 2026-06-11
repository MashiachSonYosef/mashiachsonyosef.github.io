#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const contractPath = process.argv[2] || 'reports/agent1-spark1-pipeline-contract-workbench-source-family-license-lane-release-intake-packet-2026-06-04.json';
const resultPath = 'reports/agent1-spark1-pipeline-contract-workbench-source-family-license-lane-release-intake-packet-validation-result-2026-06-04.json';

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
  assert(contract.target?.workset === 'workbench-source-family-license-lane-release-intake-packet', 'workset mismatch');
  assert(exists(contract.inputs[0]), 'input missing');
  assert(exists(contract.outputs.json), 'output json missing');
  assert(exists(contract.outputs.markdown), 'output markdown missing');
  assert(contract.validator?.command === 'node scripts/validate_agent1_workbench_source_family_license_lane_release_intake_packet.mjs', 'validator command mismatch');
  assert(contract.validator?.contract_validator === 'node scripts/validate_agent1_spark1_workbench_source_family_license_lane_release_intake_packet_contract.mjs', 'contract validator mismatch');
  assert(contract.target?.release_intake_row_count === 4, 'release intake rows must be 4');
  assert(contract.target?.source_row_count === 105747, 'source rows must be 105747');
  assert(output.counts?.release_intake_row_count === contract.target.release_intake_row_count, 'output count mismatch');
  const result = {
    ok: true,
    validated_artifact: contractPath,
    completed_at: new Date().toISOString(),
    status: contract.status,
    target: contract.target.workset,
    release_intake_row_count: contract.target.release_intake_row_count,
    source_row_count: contract.target.source_row_count,
    spark1_routable: true
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = { ok: false, validated_artifact: contractPath, completed_at: new Date().toISOString(), error: error.message };
  writeJson(resultPath, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

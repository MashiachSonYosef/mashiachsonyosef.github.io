#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const contractPath = process.argv[2] || 'reports/agent1-spark1-pipeline-contract-broad-workbench-token-inventory-5000-source-lane-blocker-2026-06-04.json';
const resultPath = 'reports/agent1-spark1-pipeline-contract-broad-workbench-token-inventory-5000-source-lane-blocker-validation-result-2026-06-04.json';

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
  assert(contract.status === 'pipeline_contract_runnable_validated_with_exact_source_lane_join_blocker', 'contract status mismatch');
  assert(contract.target?.workset === 'broad-workbench-token-inventory-5000-source-lane-join', 'workset mismatch');
  assert(contract.target?.inventory_top_token_rows === 5000, 'top token rows must be 5000');
  assert(contract.target?.source_lane_blocker_rows === 5000, 'source-lane blocker rows must be 5000');
  assert(contract.target?.source_lane_complete_rows === 0, 'source-lane complete rows must be 0');
  assert(contract.target?.candidate_text_rows_now === 0, 'candidate text rows must be 0');
  for (const input of contract.inputs || []) assert(exists(input), `input missing: ${input}`);
  assert(exists(contract.outputs.json), 'output json missing');
  assert(exists(contract.outputs.markdown), 'output markdown missing');
  assert(contract.validator?.command === 'node scripts/validate_agent1_broad_workbench_token_inventory_5000_source_lane_blocker.mjs', 'validator command mismatch');
  assert(contract.validator?.contract_validator === 'node scripts/validate_agent1_spark1_broad_workbench_token_inventory_5000_source_lane_blocker_contract.mjs', 'contract validator mismatch');
  assert(output.counts?.source_lane_blocker_rows === contract.target.source_lane_blocker_rows, 'output blocker rows mismatch');
  const result = {
    ok: true,
    validated_artifact: contractPath,
    completed_at: new Date().toISOString(),
    status: contract.status,
    target: contract.target.workset,
    inventory_top_token_rows: contract.target.inventory_top_token_rows,
    source_lane_blocker_rows: contract.target.source_lane_blocker_rows,
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

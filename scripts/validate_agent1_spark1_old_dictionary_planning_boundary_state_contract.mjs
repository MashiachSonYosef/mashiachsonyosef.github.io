#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const contractPath = process.argv[2] || 'reports/agent1-spark1-pipeline-contract-old-dictionary-planning-boundary-state-2026-06-04.json';
const resultPath = 'reports/agent1-spark1-pipeline-contract-old-dictionary-planning-boundary-state-validation-result-2026-06-04.json';

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
  assert(contract.target?.workset === 'old-dictionary-planning-boundary-state', 'workset mismatch');
  assert(contract.target?.source_family_count === 5, 'source family count must be 5');
  assert(contract.target?.audited_rows === 500, 'audited rows must be 500');
  assert(contract.target?.audited_occurrences === 8427, 'audited occurrences must be 8427');
  assert(contract.target?.planning_evidence_allowed_source_families === 5, 'planning evidence count must be 5');
  assert(contract.target?.candidate_text_consumption_allowed_rows === 0, 'candidate text consumption must be 0');
  for (const input of contract.inputs || []) assert(exists(input), `input missing: ${input}`);
  assert(exists(contract.outputs.json), 'output json missing');
  assert(exists(contract.outputs.markdown), 'output markdown missing');
  assert(contract.validator?.command === 'node scripts/validate_agent1_old_dictionary_planning_boundary_state.mjs', 'validator command mismatch');
  assert(contract.validator?.contract_validator === 'node scripts/validate_agent1_spark1_old_dictionary_planning_boundary_state_contract.mjs', 'contract validator mismatch');
  assert(output.counts?.source_family_count === contract.target.source_family_count, 'output source family count mismatch');
  assert(output.counts?.candidate_text_consumption_allowed_rows === 0, 'output candidate text consumption mismatch');
  const result = {
    ok: true,
    validated_artifact: contractPath,
    completed_at: new Date().toISOString(),
    status: contract.status,
    target: contract.target.workset,
    source_family_count: contract.target.source_family_count,
    audited_rows: contract.target.audited_rows,
    audited_occurrences: contract.target.audited_occurrences,
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

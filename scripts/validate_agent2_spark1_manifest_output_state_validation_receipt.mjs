#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = cleanRelativePath(process.argv[2] || 'reports/agent2-spark1-manifest-output-state-validation-receipt-2026-06-04.json');
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.schema_version === '1.0', 'schema_version must be 1.0');
expect(receipt.artifact_type === 'agent2_spark1_manifest_output_state_validation_receipt', 'unexpected artifact_type');
expect(receipt.validation_result?.status === 'passed', 'validation_result.status must be passed');
expect(receipt.runnable_outputs_checked === 7, 'runnable_outputs_checked must be 7');
expect(receipt.validator_only_states_checked === 23, 'validator_only_states_checked must be 23');
expect(receipt.self_check_registered_but_not_recursed === true, 'self_check_registered_but_not_recursed must be true');
expect(receipt.non_mutating_gate === true, 'non_mutating_gate must be true');
expect(receipt.child_process_spawn_blocker_observed?.status === 'observed_and_avoided', 'child process blocker status mismatch');

const manifest = readRequired(receipt.manifest || 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.json', 'manifest');
expect(manifest.artifact_type === 'agent2_spark1_runnable_command_manifest', 'manifest artifact_type mismatch');
expect(manifest.runnable_pipelines?.length === receipt.runnable_outputs_checked, 'manifest runnable pipeline count mismatch');
expect(manifest.validator_only_checks?.length === receipt.validator_only_states_checked + 1, 'manifest validator-only count should include recursive self-check');

for (const [key, value] of Object.entries(receipt.zero_boundary || {})) {
  expect(value === false, `zero_boundary.${key} must be false`);
}

if (issues.length) {
  console.error(`Agent 2 Spark-1 manifest output-state validation receipt failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 Spark-1 manifest output-state validation receipt passed. Runnable outputs: 7; validator-only states: 23.');

function readRequired(relativePath, label) {
  requirePath(relativePath, label);
  return readJson(relativePath);
}

function requirePath(relativePath, label) {
  expect(typeof relativePath === 'string' && relativePath.length > 0, `${label} path is required`);
  if (relativePath) expect(fs.existsSync(path.join(root, cleanRelativePath(relativePath))), `${label} path does not exist: ${relativePath}`);
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

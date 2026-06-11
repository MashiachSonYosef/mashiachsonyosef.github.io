#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = cleanRelativePath(process.argv[2] || 'reports/agent2-spark1-execution-order-validation-receipt-2026-06-04.json');
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.schema_version === '1.0', 'schema_version must be 1.0');
expect(receipt.artifact_type === 'agent2_spark1_execution_order_validation_receipt', 'unexpected artifact_type');
expect(receipt.validation_result?.status === 'passed', 'validation_result.status must be passed');
expect(receipt.validation_commands === 8, 'validation_commands must be 8');
expect(receipt.builder_phase_gated === true, 'builder_phase_gated must be true');
expect(receipt.manifest_runnable_pipelines === 7, 'manifest_runnable_pipelines must be 7');
expect(receipt.manifest_validator_only_checks === 24, 'manifest_validator_only_checks must be 24');

const contract = readRequired(receipt.contract, 'contract');
expect(contract.artifact_type === 'agent2_spark1_execution_order_contract', 'contract artifact_type mismatch');
expect(contract.counts?.non_mutating_validation_commands === receipt.validation_commands, 'contract validation command count mismatch');
expect(contract.counts?.manifest_runnable_pipelines === receipt.manifest_runnable_pipelines, 'contract runnable pipeline count mismatch');
expect(contract.counts?.manifest_validator_only_checks === receipt.manifest_validator_only_checks, 'contract validator-only count mismatch');
expect(contract.execution_policy?.public_mutation_allowed === false, 'contract public mutation must be false');
expect(contract.execution_policy?.answer_emission_allowed === false, 'contract answer emission must be false');

for (const [key, value] of Object.entries(receipt.zero_boundary || {})) {
  expect(value === false, `zero_boundary.${key} must be false`);
}

if (issues.length) {
  console.error(`Agent 2 Spark-1 execution-order validation receipt failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 Spark-1 execution-order validation receipt passed. Validation commands: 8; builders gated.');

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

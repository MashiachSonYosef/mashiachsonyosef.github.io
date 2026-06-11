#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = cleanRelativePath(process.argv[2] || 'reports/agent2-spark1-execution-order-contract-2026-06-04.json');
const contract = readJson(contractPath);
const issues = [];

expect(contract.schema_version === '1.0', 'schema_version must be 1.0');
expect(contract.artifact_type === 'agent2_spark1_execution_order_contract', 'unexpected artifact_type');
expect(contract.status === 'nonpublic_spark1_execution_order_contract', 'unexpected status');
requirePath(contract.manifest, 'manifest');

const manifest = readJson(contract.manifest);
expect(manifest.artifact_type === 'agent2_spark1_runnable_command_manifest', 'manifest artifact_type mismatch');
expect(manifest.runnable_pipelines?.length === contract.counts?.manifest_runnable_pipelines, 'manifest runnable pipeline count mismatch');
expect(manifest.validator_only_checks?.length === contract.counts?.manifest_validator_only_checks, 'manifest validator-only check count mismatch');

expect(contract.execution_policy?.builders_allowed_only_when_input_changed_or_selected_by_agent10_or_agent7 === true, 'builder run condition must be explicit');
expect(contract.execution_policy?.validators_safe_without_changed_input === true, 'validators must be safe without changed input');
expect(contract.execution_policy?.public_mutation_allowed === false, 'public mutation must be false');
expect(contract.execution_policy?.answer_emission_allowed === false, 'answer emission must be false');
expect(contract.execution_policy?.definition_authority_allowed === false, 'definition authority must be false');

expect(Array.isArray(contract.phases) && contract.phases.length === 4, 'must have 4 phases');
expect(contract.counts?.validation_phase_count === 3, 'validation phase count must be 3');
expect(contract.counts?.builder_phase_count === 1, 'builder phase count must be 1');
expect(contract.counts?.non_mutating_validation_commands === 8, 'non-mutating validation command count must be 8');

for (const phase of contract.phases || []) {
  if (phase.phase < 4) {
    expect(phase.mutates_outputs === false, `phase ${phase.phase} must be non-mutating`);
    for (const command of phase.commands || []) validateNodeCommand(command, `phase ${phase.phase}`);
  } else {
    expect(phase.mutates_outputs === true, 'builder phase should be marked mutating');
    expect(phase.public_mutation_allowed === false, 'builder phase public mutation must be false');
    expect(phase.answer_emission_allowed === false, 'builder phase answer emission must be false');
  }
}

for (const [key, value] of Object.entries(contract.zero_boundary || {})) {
  expect(value === false, `zero_boundary.${key} must be false`);
}

if (issues.length) {
  console.error(`Agent 2 Spark-1 execution-order contract validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 Spark-1 execution-order contract validation passed. Validation commands: 8; builders gated.');

function validateNodeCommand(command, context) {
  expect(typeof command === 'string' && command.startsWith('node scripts/'), `${context} command must be a node script command`);
  const parts = command.split(/\s+/).slice(1);
  for (const part of parts) {
    if (/^(scripts|reports|data)\//.test(part)) requirePath(part, `${context}.${part}`);
  }
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

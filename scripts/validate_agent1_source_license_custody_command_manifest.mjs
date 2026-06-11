#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const manifestPath = process.argv[2] || 'reports/agent1-source-license-custody-command-manifest-2026-06-04.json';
const resultPath = 'reports/agent1-source-license-custody-command-manifest-validation-result-2026-06-04.json';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function commandScriptExists(command) {
  const normalized = command.replace(/^node\s+/, '').split(/\s+/)[0];
  return exists(normalized);
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
  const manifest = readJson(manifestPath);
  const registry = readJson(manifest.source_registry);
  const handoff = readJson(manifest.aggregate_handoff);

  assert(manifest.artifact_type === 'agent1_source_license_custody_command_manifest', 'unexpected artifact_type');
  assert(manifest.status === 'agent1_source_license_custody_command_manifest_validated_for_spark1_discovery_only', 'unexpected status');
  assert(manifest.counts?.runnable_command_set_count === 22, 'runnable command set count must be 22');
  assert(manifest.counts?.non_routable_blocker_count === 1, 'non-routable blocker count must be 1');
  assert(manifest.counts?.aggregate_gate_count === 4, 'aggregate gate count must be 4');
  assert(registry.counts?.runnable_contract_count === 22, 'registry runnable contract count must be 22');
  assert(handoff.counts?.runnable_contract_count === 22, 'handoff runnable contract count must be 22');

  for (const commandSet of manifest.runnable_command_sets || []) {
    const buildCommands = Array.isArray(commandSet.build) ? commandSet.build : [commandSet.build];
    const outputValidators = Array.isArray(commandSet.validate_output) ? commandSet.validate_output : [commandSet.validate_output];
    for (const command of [...buildCommands, ...outputValidators, commandSet.validate_contract]) {
      assert(typeof command === 'string' && command.startsWith('node scripts/'), 'command must be a node scripts command', commandSet);
      assert(commandScriptExists(command), `command script missing: ${command}`);
    }
    assert(exists(commandSet.expected_output), `expected output missing: ${commandSet.expected_output}`);
    assert(commandSet.spark1_routable === true, 'command set must be Spark-1 routable', commandSet);
  }

  const blocker = manifest.non_routable_blockers?.[0];
  assert(blocker?.status === 'missing_workset_blocker', 'blocker status must be missing_workset_blocker');
  assert(blocker?.spark1_routable === false, 'blocker must not be Spark-1 routable');
  assert(blocker?.rows_checked === 169, 'blocker rows checked must be 169');
  assert(commandScriptExists(blocker.validator), `blocker validator missing: ${blocker.validator}`);
  assert(exists(blocker.artifact), `blocker artifact missing: ${blocker.artifact}`);

  for (const gate of manifest.aggregate_gates || []) {
    assert(commandScriptExists(gate), `aggregate gate script missing: ${gate}`);
  }

  assert(manifest.spark_rule.includes('may run only listed commands'), 'Spark rule must restrict to listed commands');
  assert(manifest.non_acceptance_boundary?.no_source_license_acceptance === true, 'no source/license acceptance boundary missing');
  assert(manifest.non_acceptance_boundary?.no_nc_commercial_authorization === true, 'no NC commercial authorization boundary missing');
  assert(manifest.non_acceptance_boundary?.no_public_runtime_mutation === true, 'no public/runtime mutation boundary missing');

  const result = {
    ok: true,
    validated_artifact: manifestPath,
    completed_at: new Date().toISOString(),
    status: manifest.status,
    runnable_command_set_count: manifest.counts.runnable_command_set_count,
    non_routable_blocker_count: manifest.counts.non_routable_blocker_count,
    aggregate_gate_count: manifest.counts.aggregate_gate_count
  };
  writeJson(resultPath, result);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const result = {
    ok: false,
    validated_artifact: manifestPath,
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

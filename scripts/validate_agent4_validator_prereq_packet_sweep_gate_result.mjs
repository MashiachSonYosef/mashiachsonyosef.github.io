#!/usr/bin/env node
import fs from 'node:fs';

const args = parseArgs(process.argv.slice(2));
const input = args.input || args._[0];

if (!input) {
  fail('usage: node scripts/validate_agent4_validator_prereq_packet_sweep_gate_result.mjs --input=<gate-result.json>');
}

const artifact = readJson(input);
const errors = [];

expectEqual(artifact.artifact_type, 'agent4_validator_prereq_packet_sweep_gate_result', 'artifact_type');
expectEqual(artifact.status, 'passed', 'status');
expectTruthy(artifact.out, 'out');
expectTruthy(artifact.pattern, 'pattern');
expectPositiveInteger(artifact.timeout_ms_per_packet, 'timeout_ms_per_packet');
expectTruthy(artifact.sweep_script, 'sweep_script');
expectTruthy(artifact.result_validator, 'result_validator');
expectEqual(artifact.sweep?.status, 0, 'sweep.status');
expectEqual(artifact.result_validation?.status, 0, 'result_validation.status');
expectEqual(String(artifact.result_validation?.stderr || ''), '', 'result_validation.stderr');
if (artifact.gate_result_validation) {
  expectEqual(artifact.gate_result_validation.status, 0, 'gate_result_validation.status');
  expectEqual(String(artifact.gate_result_validation.stderr || ''), '', 'gate_result_validation.stderr');
} else if (args.requireSelfCheck) {
  errors.push('gate_result_validation is required when --requireSelfCheck is set');
}

const counts = artifact.counts || {};
expectPositiveInteger(counts.count, 'counts.count');
expectNonNegativeInteger(counts.passed, 'counts.passed');
expectNonNegativeInteger(counts.failed, 'counts.failed');
expect(counts.count === counts.passed + counts.failed, 'counts.count must equal counts.passed + counts.failed');
expectEqual(counts.failed, 0, 'counts.failed');
expectPositiveInteger(counts.command_count_total, 'counts.command_count_total');
expectNonNegativeInteger(counts.blocker_count_total, 'counts.blocker_count_total');

const shapes = counts.shapes && typeof counts.shapes === 'object' ? counts.shapes : {};
const shapeTotal = Object.values(shapes).reduce((total, value) => total + Number(value || 0), 0);
expect(shapeTotal === counts.count, `shape total ${shapeTotal} must equal counts.count ${counts.count}`);
for (const shape of Object.keys(shapes)) {
  expect(['proof', 'proof_with_blocker', 'blocker'].includes(shape), `unexpected shape ${shape}`);
}

const validatorOutput = artifact.validator_output || {};
expectEqual(validatorOutput.ok, true, 'validator_output.ok');
expectEqual(validatorOutput.artifact_type, 'agent4_validator_prereq_packet_sweep_result', 'validator_output.artifact_type');
expectEqual(validatorOutput.count, counts.count, 'validator_output.count');
expectEqual(validatorOutput.passed, counts.passed, 'validator_output.passed');
expectEqual(validatorOutput.failed, counts.failed, 'validator_output.failed');
expectEqual(validatorOutput.command_count_total, counts.command_count_total, 'validator_output.command_count_total');
expectEqual(validatorOutput.blocker_count_total, counts.blocker_count_total, 'validator_output.blocker_count_total');

if (errors.length) fail(errors.join('\n'));

console.log(
  JSON.stringify(
    {
      ok: true,
      input,
      artifact_type: artifact.artifact_type,
      status: artifact.status,
      count: counts.count,
      passed: counts.passed,
      failed: counts.failed,
      shapes,
      command_count_total: counts.command_count_total,
      blocker_count_total: counts.blocker_count_total,
    },
    null,
    2,
  ),
);

function parseArgs(argv) {
  const parsed = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      parsed._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (arg.includes('=')) {
      const [inlineKey, ...rest] = key.split('=');
      parsed[inlineKey] = rest.join('=');
      continue;
    }
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) parsed[key] = true;
    else {
      parsed[key] = next;
      i += 1;
    }
  }
  return parsed;
}

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`failed to read JSON ${path}: ${error.message}`);
  }
}

function expectTruthy(value, label) {
  expect(value !== undefined && value !== null && value !== '', `${label} is required`);
}

function expectEqual(actual, expected, label) {
  expect(actual === expected, `${label} expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}`);
}

function expectPositiveInteger(value, label) {
  expect(Number.isInteger(value) && value > 0, `${label} must be a positive integer`);
}

function expectNonNegativeInteger(value, label) {
  expect(Number.isInteger(value) && value >= 0, `${label} must be a non-negative integer`);
}

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

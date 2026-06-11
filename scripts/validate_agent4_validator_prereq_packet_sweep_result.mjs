#!/usr/bin/env node
import fs from 'node:fs';

const args = parseArgs(process.argv.slice(2));
const input = args.input || args._[0];

if (!input) {
  fail('usage: node scripts/validate_agent4_validator_prereq_packet_sweep_result.mjs --input=<sweep-result.json>');
}

const artifact = readJson(input);
const errors = [];

expectEqual(artifact.artifact_type, 'agent4_validator_prereq_packet_sweep_result', 'artifact_type');
expectTruthy(artifact.reports_dir, 'reports_dir');
expectTruthy(artifact.pattern, 'pattern');
expectTruthy(artifact.validator, 'validator');
expectPositiveInteger(artifact.timeout_ms_per_packet, 'timeout_ms_per_packet');
expectNonNegativeInteger(artifact.count, 'count');
expectNonNegativeInteger(artifact.passed, 'passed');
expectNonNegativeInteger(artifact.failed, 'failed');
expect(artifact.count === artifact.passed + artifact.failed, 'count must equal passed + failed');
expect(artifact.failed === 0, 'sweep result must have zero failed packets');

const results = Array.isArray(artifact.results) ? artifact.results : [];
expect(results.length === artifact.count, `results length ${results.length} must equal count ${artifact.count}`);

const shapes = artifact.shapes && typeof artifact.shapes === 'object' ? artifact.shapes : {};
const shapeTotal = Object.values(shapes).reduce((total, value) => total + Number(value || 0), 0);
expect(shapeTotal === artifact.count, `shape total ${shapeTotal} must equal count ${artifact.count}`);
expect(Array.isArray(artifact.failures), 'failures must be an array');
expect(artifact.failures.length === artifact.failed, `failures length ${artifact.failures?.length} must equal failed ${artifact.failed}`);

let commandCountTotal = 0;
let blockerCountTotal = 0;
for (const [index, row] of results.entries()) {
  const label = `results[${index}]`;
  expectTruthy(row.file, `${label}.file`);
  expect(row.status === 0, `${label}.status must be 0`);
  expect(row.timed_out === false, `${label}.timed_out must be false`);
  expect(['proof', 'proof_with_blocker', 'blocker'].includes(row.shape), `${label}.shape must be proof/proof_with_blocker/blocker`);
  expectNonNegativeInteger(row.command_count, `${label}.command_count`);
  expectNonNegativeInteger(row.blocker_count, `${label}.blocker_count`);
  expectNonNegativeInteger(row.non_acceptance_boundary_count, `${label}.non_acceptance_boundary_count`);
  expect(row.non_acceptance_boundary_count > 0, `${label}.non_acceptance_boundary_count must be positive`);
  expect(String(row.stderr || '') === '', `${label}.stderr must be empty`);
  commandCountTotal += row.command_count;
  blockerCountTotal += row.blocker_count;
}

expect(commandCountTotal === artifact.command_count_total, `command_count_total expected ${commandCountTotal}, found ${artifact.command_count_total}`);
expect(blockerCountTotal === artifact.blocker_count_total, `blocker_count_total expected ${blockerCountTotal}, found ${artifact.blocker_count_total}`);

if (errors.length) fail(errors.join('\n'));

console.log(
  JSON.stringify(
    {
      ok: true,
      input,
      artifact_type: artifact.artifact_type,
      count: artifact.count,
      passed: artifact.passed,
      failed: artifact.failed,
      shapes,
      command_count_total: artifact.command_count_total,
      blocker_count_total: artifact.blocker_count_total,
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

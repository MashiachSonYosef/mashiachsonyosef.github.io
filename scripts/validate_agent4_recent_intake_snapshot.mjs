#!/usr/bin/env node
import fs from 'node:fs';

const args = parseArgs(process.argv.slice(2));
const input = args.input || args._[0];
if (!input) fail('usage: node scripts/validate_agent4_recent_intake_snapshot.mjs --input=<snapshot.json>');

const artifact = readJson(input);
const errors = [];

expectEqual(artifact.artifact_type, 'agent4_recent_intake_snapshot', 'artifact_type');
expectEqual(artifact.agent, 'Agent 4', 'agent');
expectTruthy(artifact.generated_at, 'generated_at');
expectTruthy(artifact.target, 'target');
expectTruthy(artifact.changed_input_artifact, 'changed_input_artifact');
expect(Array.isArray(artifact.scanned_roots) && artifact.scanned_roots.length > 0, 'scanned_roots must be non-empty');
expectPositiveInteger(artifact.limit, 'limit');
expectNonNegativeInteger(artifact.row_count, 'row_count');
expectNonNegativeInteger(artifact.candidate_like_count, 'candidate_like_count');
expect(Array.isArray(artifact.rows), 'rows must be an array');
if (Array.isArray(artifact.rows)) {
  expect(artifact.rows.length === artifact.row_count, 'rows length must equal row_count');
  const candidateLikeRows = artifact.rows.filter((row) => row.classification?.candidate_like);
  expect(candidateLikeRows.length === artifact.candidate_like_count, 'candidate_like_count must match rows');
  for (const [index, row] of artifact.rows.entries()) {
    const label = `rows[${index}]`;
    expectTruthy(row.path, `${label}.path`);
    expectTruthy(row.name, `${label}.name`);
    expectTruthy(row.root, `${label}.root`);
    expectPositiveNumber(row.mtime_ms, `${label}.mtime_ms`);
    expectNonNegativeInteger(row.size, `${label}.size`);
    expect(typeof row.classification?.candidate_like === 'boolean', `${label}.classification.candidate_like must be boolean`);
    expectTruthy(row.classification?.reason, `${label}.classification.reason`);
  }
}

const commands = Array.isArray(artifact.validator_commands) ? artifact.validator_commands : [];
expect(commands.length === 1, 'validator_commands must contain one snapshot command');
if (commands[0]) {
  expectTruthy(commands[0].command, 'validator_commands[0].command');
  expectPositiveInteger(commands[0].timeout_ms, 'validator_commands[0].timeout_ms');
  expectEqual(commands[0].result, 'passed', 'validator_commands[0].result');
}

const boundaries = Array.isArray(artifact.non_acceptance_boundary) ? artifact.non_acceptance_boundary.map(String) : [];
expect(boundaries.length > 0, 'non_acceptance_boundary is required');
for (const word of ['acceptance', 'publication', 'accepted']) {
  expect(boundaries.some((row) => row.toLowerCase().includes(word)), `non_acceptance_boundary must mention ${word}`);
}

if (errors.length) fail(errors.join('\n'));

console.log(
  JSON.stringify(
    {
      ok: true,
      input,
      artifact_type: artifact.artifact_type,
      row_count: artifact.row_count,
      candidate_like_count: artifact.candidate_like_count,
      scanned_roots: artifact.scanned_roots,
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

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`failed to read JSON ${file}: ${error.message}`);
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

function expectPositiveNumber(value, label) {
  expect(typeof value === 'number' && Number.isFinite(value) && value > 0, `${label} must be a positive number`);
}

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

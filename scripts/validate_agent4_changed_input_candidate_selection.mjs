#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = parseArgs(process.argv.slice(2));
const input = args.input || args._[0];
const root = process.cwd();

if (!input) {
  fail('usage: node scripts/validate_agent4_changed_input_candidate_selection.mjs --input=<selector-result.json>');
}

const artifact = readJson(input);
const errors = [];

expect(['agent4_changed_input_candidate_selection', 'agent4_changed_input_blocker'].includes(artifact.artifact_type), 'artifact_type must be selector result or blocker');
expectEqual(artifact.agent, 'Agent 4', 'agent');
expectTruthy(artifact.generated_at, 'generated_at');
expectTruthy(artifact.target, 'target');
expectTruthy(artifact.changed_input_artifact, 'changed_input_artifact');
expectTruthy(artifact.anchor, 'anchor');
expectPositiveNumber(artifact.anchor_mtime_ms, 'anchor_mtime_ms');
expectNonNegativeNumber(artifact.lookback_ms, 'lookback_ms');
expectNonNegativeNumber(artifact.scan_start_mtime_ms, 'scan_start_mtime_ms');
if (typeof artifact.anchor_mtime_ms === 'number' && typeof artifact.lookback_ms === 'number' && typeof artifact.scan_start_mtime_ms === 'number') {
  const expectedScanStart = Math.max(0, artifact.anchor_mtime_ms - artifact.lookback_ms);
  expect(
    Math.abs(artifact.scan_start_mtime_ms - expectedScanStart) < 0.001,
    `scan_start_mtime_ms expected ${expectedScanStart}, found ${artifact.scan_start_mtime_ms}`,
  );
}
expectPositiveInteger(artifact.limit, 'limit');
expectNonNegativeInteger(artifact.newer_file_count, 'newer_file_count');
expectNonNegativeInteger(artifact.candidate_count, 'candidate_count');
expect(Array.isArray(artifact.rows), 'rows must be an array');
if (Array.isArray(artifact.rows)) {
  expect(artifact.rows.length === artifact.newer_file_count, 'rows length must equal newer_file_count');
}

const commands = Array.isArray(artifact.validator_commands) ? artifact.validator_commands : [];
expect(commands.length === 1, 'validator_commands must contain the selector command row');
if (commands[0]) {
  expectTruthy(commands[0].command, 'validator_commands[0].command');
  expectPositiveInteger(commands[0].timeout_ms, 'validator_commands[0].timeout_ms');
  expectTruthy(commands[0].result, 'validator_commands[0].result');
  const command = String(commands[0].command);
  const hasLookback = /--lookback(?:Ms)?=/.test(command);
  expect(hasLookback === Number(artifact.lookback_ms || 0) > 0, 'selector command lookback flag must match lookback_ms');
}

if (artifact.candidate_count > 0) {
  expectEqual(artifact.artifact_type, 'agent4_changed_input_candidate_selection', 'artifact_type');
  expectTruthy(artifact.selected_candidate, 'selected_candidate');
  expect(artifact.changed_input_blocker === null, 'changed_input_blocker must be null when selected_candidate exists');
  expect(Array.isArray(artifact.exact_blockers) && artifact.exact_blockers.length === 0, 'exact_blockers must be empty for selected candidate');
  if (artifact.selected_candidate) {
    expectTruthy(artifact.selected_candidate.path, 'selected_candidate.path');
    expectEqual(artifact.changed_input_artifact, artifact.selected_candidate.path, 'changed_input_artifact');
    expect(!isAgent4OrStatusPath(artifact.selected_candidate.path), 'selected candidate must not be Agent4 output or state/status file');
    if (artifact.selected_candidate.suggested_validator) {
      expect(fs.existsSync(path.resolve(root, artifact.selected_candidate.suggested_validator)), 'suggested_validator must exist when present');
    }
  }
} else {
  expectEqual(artifact.artifact_type, 'agent4_changed_input_blocker', 'artifact_type');
  expect(artifact.selected_candidate === null, 'selected_candidate must be null when candidate_count is 0');
  expectTruthy(artifact.changed_input_blocker, 'changed_input_blocker');
  expect(Array.isArray(artifact.exact_blockers) && artifact.exact_blockers.length > 0, 'exact_blockers required for no-candidate blocker');
  expectTruthy(
    artifact.changed_input_blocker?.approval_boundary_trigger || artifact.changed_input_blocker?.agent6_boundary_trigger,
    'changed_input_blocker.approval_boundary_trigger',
  );
}

if (Array.isArray(artifact.rows)) {
  const candidates = artifact.rows.filter((row) => row.classification?.changed_input_candidate);
  expect(candidates.length === artifact.candidate_count, `candidate rows ${candidates.length} must equal candidate_count ${artifact.candidate_count}`);
  for (const [index, row] of artifact.rows.entries()) {
    const label = `rows[${index}]`;
    expectTruthy(row.path, `${label}.path`);
    expectTruthy(row.name, `${label}.name`);
    expectTruthy(row.root, `${label}.root`);
    expectPositiveNumber(row.mtime_ms, `${label}.mtime_ms`);
    expectNonNegativeInteger(row.size, `${label}.size`);
    expectTruthy(row.classification, `${label}.classification`);
    if (row.classification) {
      expect(typeof row.classification.changed_input_candidate === 'boolean', `${label}.classification.changed_input_candidate must be boolean`);
      expectTruthy(row.classification.reason, `${label}.classification.reason`);
      if (row.classification.changed_input_candidate) {
        expect(!isAgent4OrStatusPath(row.path), `${label}.candidate path must not be Agent4 output or state/status file`);
      }
      if (row.classification.reason === 'upstream_input_already_packaged_by_agent4') {
        expect(!row.classification.changed_input_candidate, `${label}.already-packaged upstream input must not be a candidate`);
        expect(!isAgent4OrStatusPath(row.path), `${label}.already-packaged upstream input must be an upstream path`);
        if (row.classification.suggested_validator) {
          expect(fs.existsSync(path.resolve(root, row.classification.suggested_validator)), `${label}.suggested_validator must exist when present`);
        }
      }
    }
  }
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
      candidate_count: artifact.candidate_count,
      selected_candidate: artifact.selected_candidate?.path || null,
      newer_file_count: artifact.newer_file_count,
      row_count: artifact.rows.length,
      blocker_count: Array.isArray(artifact.exact_blockers) ? artifact.exact_blockers.length : 0,
    },
    null,
    2,
  ),
);

function isAgent4OrStatusPath(value) {
  const name = path.basename(String(value)).toLowerCase();
  return (
    name.startsWith('agent4-') ||
    /(^|-)state\.json$/i.test(name) ||
    name.endsWith('_state.json') ||
    name.includes('heartbeat') ||
    name.includes('pulse') ||
    name.includes('loop') ||
    name.includes('sweep-result') ||
    name.includes('validation-result')
  );
}

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

function expectNonNegativeNumber(value, label) {
  expect(typeof value === 'number' && Number.isFinite(value) && value >= 0, `${label} must be a non-negative number`);
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

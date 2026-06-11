#!/usr/bin/env node
import fs from 'node:fs';

const args = parseArgs(process.argv.slice(2));
const input = args.input || args._[0];

if (!input) {
  fail('usage: node scripts/validate_agent4_validator_prereq_packet.mjs --input=<agent4-proof-or-blocker.json>');
}

const artifact = readJson(input);
const errors = [];

if (artifact.agent !== undefined) expectEqual(artifact.agent, 'Agent 4', 'agent');
else if (!String(artifact.artifact_type || '').startsWith('agent4_')) {
  errors.push('agent is required unless artifact_type starts with agent4_');
}
expectTruthy(artifact.artifact_type, 'artifact_type');
expectTruthy(artifact.generated_at, 'generated_at');
expectTruthy(artifact.target, 'target');
expectBoundary(artifact);

const isBlocker =
  artifact.result === 'changed_input_blocker' ||
  artifact.artifact_type.includes('blocker') ||
  artifact.exact_blocker ||
  artifact.changed_input_blocker;

const isProof =
  artifact.artifact_type.includes('proof') ||
  artifact.validator ||
  artifact.validator_commands ||
  artifact.commands;

if (!isBlocker && !isProof) {
  errors.push('artifact must be either an Agent4 proof packet or blocker packet');
}

if (isProof) validateProofShape(artifact);
if (isBlocker) validateBlockerShape(artifact);

if (errors.length) fail(errors.join('\n'));

console.log(
  JSON.stringify(
    {
      ok: true,
      input,
      artifact_type: artifact.artifact_type,
      result: artifact.result || null,
      shape: isBlocker && isProof ? 'proof_with_blocker' : isBlocker ? 'blocker' : 'proof',
      command_count: commandRows(artifact).length,
      timeout_count: commandRows(artifact).filter((row) => row.timeout_ms || /timeout/i.test(String(row.command))).length,
      blocker_count: blockerRows(artifact).length,
      non_acceptance_boundary_count: boundaryRows(artifact).length,
    },
    null,
    2,
  ),
);

function validateProofShape(value) {
  const changedInput =
    value.changed_input_artifact ||
    value.changed_input_artifacts ||
    value.latest_agent4_proof ||
    value.latest_agent4_proof_anchor ||
    value.queue_artifact_checked;
  expectTruthy(changedInput, 'changed input/artifact reference');

  const commands = commandRows(value);
  if (!commands.length) {
    errors.push('proof packet must include validator/proof commands');
  }

  for (const [index, command] of commands.entries()) {
    const label = `command[${index}]`;
    const commandText = command.command || (typeof command === 'string' ? command : null);
    expectTruthy(commandText, `${label}.command`);
    if (!Number.isInteger(command.timeout_ms) || command.timeout_ms <= 0) {
      errors.push(`${label}.timeout_ms must be a positive integer`);
    }
    const result = command.result || command.status || command.outcome || (typeof command === 'string' ? 'recorded' : null);
    expectTruthy(result, `${label}.result`);
  }

  if (value.process_timeouts) {
    if (!Array.isArray(value.process_timeouts)) errors.push('process_timeouts must be an array');
    else {
      for (const [index, timeout] of value.process_timeouts.entries()) {
        const label = `process_timeouts[${index}]`;
        expectTruthy(timeout.command, `${label}.command`);
        expectTruthy(timeout.timeout_ms, `${label}.timeout_ms`);
        expectTruthy(timeout.partial_output_or_artifact, `${label}.partial_output_or_artifact`);
        expectTruthy(timeout.next_safe_action, `${label}.next_safe_action`);
      }
    }
  }
}

function validateBlockerShape(value) {
  const blockers = blockerRows(value);
  if (!blockers.length) {
    errors.push('blocker packet must include exact_blocker or exact_blockers');
  }
  for (const [index, blocker] of blockers.entries()) {
    const label = `blocker[${index}]`;
    expectTruthy(blocker.code, `${label}.code`);
  }
  const stopCondition = value.stop_condition || value.exact_blocker?.stop_condition || value.changed_input_blocker?.stop_condition;
  expectTruthy(stopCondition, 'stop_condition');
  const owner =
    value.handoff_owner ||
    value.next_handoff ||
    value.next_handoff_owner ||
    value.changed_input_blocker?.handoff_owner ||
    value.changed_input_blocker?.package_owner ||
    value.exact_blocker?.package_owner;
  expectTruthy(owner, 'handoff owner or next handoff');
}

function expectBoundary(value) {
  const rows = boundaryRows(value).map((row) => String(row).toLowerCase());
  if (!rows.length) errors.push('non_acceptance_boundary is required');
  for (const forbidden of ['acceptance', 'publication', 'accepted']) {
    if (!rows.some((row) => row.includes(forbidden))) {
      errors.push(`non_acceptance_boundary must mention ${forbidden}`);
    }
  }
}

function commandRows(value) {
  const rows = [];
  if (Array.isArray(value.commands)) rows.push(...value.commands);
  if (Array.isArray(value.validator_commands)) rows.push(...value.validator_commands);
  if (Array.isArray(value.validator_proof_commands)) rows.push(...value.validator_proof_commands);
  if (value.validator_proof_command) rows.push(value.validator_proof_command);
  if (Array.isArray(value.validator?.commands)) rows.push(...value.validator.commands);
  return rows;
}

function blockerRows(value) {
  if (Array.isArray(value.exact_blockers)) return value.exact_blockers.map(normalizeBlocker);
  if (value.exact_blocker) return [normalizeBlocker(value.exact_blocker)];
  if (value.changed_input_blocker) return [normalizeBlocker(value.changed_input_blocker)];
  return [];
}

function boundaryRows(value) {
  const rows = [];
  if (Array.isArray(value.non_acceptance_boundary)) rows.push(...value.non_acceptance_boundary);
  if (Array.isArray(value.what_must_not_be_accepted)) rows.push(...value.what_must_not_be_accepted);
  if (value.boundary) rows.push(value.boundary);
  if (value.non_acceptance) rows.push(value.non_acceptance);
  return rows;
}

function normalizeBlocker(blocker) {
  if (typeof blocker === 'string') return { code: blocker };
  if (blocker && !blocker.code && blocker.changed_package_path_missing) {
    return { ...blocker, code: 'changed_package_path_missing' };
  }
  return blocker;
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
    const next = argv[i + 1];
    if (arg.includes('=')) {
      const [inlineKey, ...rest] = key.split('=');
      parsed[inlineKey] = rest.join('=');
    } else if (!next || next.startsWith('--')) {
      parsed[key] = true;
    } else {
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
  if (value === undefined || value === null || value === '') {
    errors.push(`${label} is required`);
  }
}

function expectEqual(actual, expected, label) {
  if (actual !== expected) {
    errors.push(`${label} expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}`);
  }
}

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

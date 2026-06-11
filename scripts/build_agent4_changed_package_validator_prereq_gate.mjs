#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const requiredFields = [
  'changed_package_input_path',
  'package_hash_or_commit_or_mtime',
  'exact_command_list',
  'expected_output_path_schema',
  'validator_gate',
  'package_owner',
  'stop_condition',
];
const routeTarget = 'Agent 4 direct validator/prereq lane or Spark-4 exact-contract capacity';

const standingQueuePath = 'data/control/spark_standing_queue.json';
const intakePath = 'reports/spark10-release-package-intake-matrix-current-2026-06-04.json';
const sparkPrimePath = 'reports/spark-prime-30min-contract-run-2026-06-04.md';
const spark4NextPath = 'reports/spark4-goal-mode-validator-prereq-next-2026-06-04.md';

if (isCliEntryPoint()) {
  const result = buildAgent4ChangedPackageValidatorPrereqGate(process.argv.slice(2));
  process.exitCode = result.exitCode;
}

export function buildAgent4ChangedPackageValidatorPrereqGate(rawArgs = [], options = {}) {
  const root = options.root || process.cwd();
  const args = parseArgs(rawArgs);
  const date = args.date || new Date().toISOString().slice(0, 10);
  const changedInputPath = args.changedInput || args['changed-input'] || '';
  const defaultWakeJson = `reports/agent4-changed-input-only-wake-condition-${date}.json`;
  const defaultWakeMd = `reports/agent4-changed-input-only-wake-condition-${date}.md`;
  const defaultContractJson = `reports/agent4-spark4-pipeline-contract-changed-package-validator-prereq-${date}.json`;
  const defaultContractMd = `reports/agent4-spark4-pipeline-contract-changed-package-validator-prereq-${date}.md`;
  const outJson = args.outJson || args['out-json'] || (changedInputPath ? defaultContractJson : defaultWakeJson);
  const outMd = args.outMd || args['out-md'] || (changedInputPath ? defaultContractMd : defaultWakeMd);
  const context = {
    root,
    date,
    defaultContractJson,
    defaultContractMd,
    outJson,
    outMd,
    controlEvidence: readControlEvidence(root),
  };

  if (changedInputPath) {
    const changedInput = readJson(root, changedInputPath);
    const missing = missingRunnableFields(context.root, changedInput);
    if (missing.length) {
      writeWakeArtifacts(context, {
        status: 'missing_pipeline_blocker',
        exactBlocker: `changed input artifact is missing required fields: ${missing.join(', ')}`,
        changedInputPath,
        missingFields: missing,
        routeNow: false,
      });
      return { status: 'missing_pipeline_blocker', outJson, outMd, exitCode: 2 };
    }
    writeRunnableContract(context, changedInput);
    return { status: 'runnable_contract_authored_changed_input_present', outJson, outMd, exitCode: 0 };
  } else {
    writeWakeArtifacts(context, {
      status: 'changed_input_only_wake_recorded_no_runnable_contract',
      exactBlocker: 'exact changed package/input artifact not provided',
      changedInputPath: null,
      missingFields: [],
      routeNow: false,
    });
    return { status: 'changed_input_only_wake_recorded_no_runnable_contract', outJson, outMd, exitCode: 0 };
  }
}

function writeRunnableContract(context, input) {
  const contract = {
    schema_version: 1,
    artifact_type: 'agent4_spark4_pipeline_contract_changed_package_validator_prereq',
    generated_at: context.date,
    active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / controlled Spark support',
    lane: 'Agent 4 validator/prereq/runtime',
    status: 'runnable_contract_authored_changed_input_present',
    changed_package_input_path: input.changed_package_input_path,
    package_hash_or_commit_or_mtime: input.package_hash_or_commit_or_mtime,
    exact_command_list: input.exact_command_list,
    expected_output_path_schema: input.expected_output_path_schema,
    validator_gate: input.validator_gate,
    package_owner: input.package_owner,
    agent6_boundary_trigger: input.agent6_boundary_trigger || null,
    stop_condition: input.stop_condition,
    route: {
      target_spark: 'Spark-4',
      target_lane: 'Agent 4 direct validator/prereq lane',
      assistant1_spark1_route_allowed: false,
      route_now: true,
    },
    evidence_inputs: context.controlEvidence,
    not_accepted: notAccepted(),
  };
  writeJson(context.root, context.outJson, contract);
  writeText(context.root, context.outMd, renderRunnableContractMarkdown(context, contract));
  console.log(`Agent 4 runnable changed-package validator/prereq contract authored: ${context.outJson}`);
}

function writeWakeArtifacts(context, { status, exactBlocker, changedInputPath, missingFields, routeNow }) {
  const wake = {
    schema_version: 1,
    artifact_type: 'agent4_changed_input_only_wake_condition',
    generated_at: context.date,
    active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / controlled Spark support',
    lane: 'Agent 4 validator/prereq/runtime',
    status,
    decision: {
      runnable_contract_authored: false,
      runnable_contract_route_target: routeTarget,
      route_runnable_contract_now: routeNow,
      reason: exactBlocker,
    },
    changed_input_artifact: changedInputPath,
    evidence_inputs: context.controlEvidence,
    minimum_runnable_contract_fields: [
      'changed package/input path',
      'exact command list',
      'expected output path/schema',
      'validator/gate',
      'package owner',
      'Agent 6 boundary trigger if public/runtime proof or acceptance-sensitive validation is requested',
      'stop condition',
    ],
    missing_fields: missingFields,
    wake_condition: {
      next_valid_action_without_changed_input: 'changed_input_only_blocker',
      next_valid_action_with_changed_input: `author ${context.defaultContractMd} and ${context.defaultContractJson}, then route through ${routeTarget}`,
      changed_input_required: true,
      assistant1_spark1_route_allowed: false,
      repeat_same_validator_runs_capped: true,
      deuteronomy_baseline_repeat_capped_without_changed_target: true,
    },
    not_accepted: notAccepted(),
  };
  writeJson(context.root, context.outJson, wake);
  writeText(context.root, context.outMd, renderWakeMarkdown(context, wake));
  console.log(`Agent 4 changed-input-only wake artifact authored: ${context.outJson}`);
}

function readControlEvidence(root) {
  const intake = readJsonIfExists(root, intakePath);
  const queue = readJsonIfExists(root, standingQueuePath);
  const sparkPrimeText = readTextIfExists(root, sparkPrimePath);
  const spark4NextText = readTextIfExists(root, spark4NextPath);
  return [
    {
      path: standingQueuePath,
      exists: Boolean(queue),
      sha256: sha256IfExists(root, standingQueuePath),
      observed_status: queue?.status || null,
      observed_generated_at: queue?.generated_at || null,
      relevant_finding: summarizeSpark4Queue(queue),
    },
    {
      path: intakePath,
      exists: Boolean(intake),
      sha256: sha256IfExists(root, intakePath),
      observed_generated_at: intake?.generated_at || null,
      summary: intake?.summary || null,
      boundary: intake?.boundary || null,
      relevant_finding: summarizeIntake(intake),
    },
    {
      path: sparkPrimePath,
      exists: Boolean(sparkPrimeText),
      sha256: sha256IfExists(root, sparkPrimePath),
      relevant_finding: findLine(sparkPrimeText, 'exact changed package/input artifact not provided') || findLine(sparkPrimeText, 'Spark-4 changed-input package prerequisites') || null,
    },
    {
      path: spark4NextPath,
      exists: Boolean(spark4NextText),
      sha256: sha256IfExists(root, spark4NextPath),
      relevant_finding: findLine(spark4NextText, 'no changed_input package available') || findLine(spark4NextText, 'wake_condition') || null,
    },
  ];
}

function summarizeSpark4Queue(queue) {
  const item = (queue?.items || []).find((row) => row.id === 'spark4-broad-validator-runtime-prereq-mechanics');
  if (!item) return 'No spark4-broad-validator-runtime-prereq-mechanics queue item found.';
  return `Queue item ${item.id} status ${item.status}; commands ${(item.pipeline_commands || []).length}; inputs ${(item.inputs || []).length}; expected output ${item.expected_output || 'missing'}.`;
}

function summarizeIntake(intake) {
  if (!intake) return 'Release intake matrix is missing.';
  const agent4Rows = (intake.rows || []).filter((row) => row.lane_owner === 'Agent 4' || /agent4|deuteronomy|validator|prereq/i.test(`${row.path} ${row.status} ${row.blocker_class}`));
  const runnable = agent4Rows.some((row) => row.blocker_class === 'none_detected_by_intake' && /changed|package|validator/i.test(`${row.path} ${row.notes || ''}`));
  return runnable
    ? 'Release intake has an Agent 4-adjacent row, but this gate still requires an explicit changed input artifact before routing.'
    : 'Release intake does not provide an exact Agent 4 changed package/input artifact.';
}

function missingRunnableFields(root, input) {
  const missing = [];
  for (const field of requiredFields) {
    const value = input[field];
    if (Array.isArray(value) ? value.length === 0 : !value) missing.push(field);
  }
  missing.push(...validateChangedPackageInputPath(root, input.changed_package_input_path));
  missing.push(...validateExpectedOutputPathSchema(root, input.expected_output_path_schema));
  missing.push(...validateExactCommandList(root, input.exact_command_list));
  if (input.public_runtime_proof_requested === true && !input.agent6_boundary_trigger) {
    missing.push('agent6_boundary_trigger');
  }
  return missing;
}

function validateChangedPackageInputPath(root, packagePath) {
  if (!packagePath) return [];
  const value = String(packagePath).trim();
  if (/^https?:\/\//i.test(value)) return ['changed_package_input_path local path required'];
  const resolved = path.resolve(root, value);
  const rootWithSep = path.resolve(root) + path.sep;
  if (resolved !== path.resolve(root) && !resolved.startsWith(rootWithSep)) {
    return ['changed_package_input_path must stay within repository'];
  }
  if (!fs.existsSync(resolved)) return [`changed_package_input_path missing: ${value}`];
  return [];
}

function validateExpectedOutputPathSchema(root, outputPathSchema) {
  if (!outputPathSchema) return [];
  const value = String(outputPathSchema).trim();
  if (/^https?:\/\//i.test(value)) return ['expected_output_path_schema local path required'];
  if (unsafeShellFeature(value)) return [`expected_output_path_schema ${unsafeShellFeature(value)} not allowed`];
  const resolved = path.resolve(root, value);
  const rootWithSep = path.resolve(root) + path.sep;
  if (resolved !== path.resolve(root) && !resolved.startsWith(rootWithSep)) {
    return ['expected_output_path_schema must stay within repository'];
  }
  const normalized = value.replace(/\\/g, '/');
  if (!normalized.startsWith('reports/') && !normalized.startsWith('.local-cache/')) {
    return ['expected_output_path_schema must be under reports/ or .local-cache/'];
  }
  if (!/\.(md|json)$/.test(normalized)) {
    return ['expected_output_path_schema must end in .md or .json'];
  }
  return [];
}

function validateExactCommandList(root, commands) {
  if (!Array.isArray(commands) || commands.length === 0) return [];
  const missing = [];
  commands.forEach((command, index) => {
    const value = String(command || '').trim();
    if (!value) {
      missing.push(`exact_command_list[${index}] empty command`);
      return;
    }
    const unsafeReason = unsafeShellFeature(value);
    if (unsafeReason) {
      missing.push(`exact_command_list[${index}] ${unsafeReason} not allowed`);
      return;
    }
    if (/^node(\.exe)?\s+/i.test(value)) {
      const scriptPath = value.match(/(?:^|\s)(scripts[\\/][^\s]+)/)?.[1]?.replace(/\\/g, '/');
      if (!scriptPath) {
        missing.push(`exact_command_list[${index}] missing node script path`);
        return;
      }
      if (!fs.existsSync(path.join(root, scriptPath))) {
        missing.push(`exact_command_list[${index}] missing script: ${scriptPath}`);
      }
      return;
    }
    if (/^git\s+diff\s+--check(\s|$)/i.test(value) || /^git\s+status\s+--short(\s|$)/i.test(value)) {
      return;
    }
    missing.push(`exact_command_list[${index}] unsupported command`);
  });
  return missing;
}

function unsafeShellFeature(value) {
  if (/[|;&]/.test(value)) return 'shell chaining';
  if (/[<>]/.test(value)) return 'shell redirection';
  if (/\$\(|`/.test(value)) return 'shell substitution';
  if (/[*?]/.test(value)) return 'wildcard expansion';
  return '';
}

function renderWakeMarkdown(context, wake) {
  const intake = wake.evidence_inputs.find((row) => row.path === intakePath);
  return `# Agent 4 Changed-Input-Only Wake Condition - ${context.date}

## Lane

\`Agent 4 validator/prereq/runtime\`

## Status

Status: \`${wake.status}\`

Agent 4 did not author or route a runnable Spark-1 validator/prereq contract because no exact changed package/input is currently present for this lane.

Machine-readable companion: \`${context.outJson}\`

## Current Evidence

- Spark standing queue status: \`${wake.evidence_inputs[0]?.observed_status || 'unknown'}\`
- Spark standing queue generated: \`${wake.evidence_inputs[0]?.observed_generated_at || 'unknown'}\`
- Agent 10 release intake generated: \`${intake?.observed_generated_at || 'unknown'}\`
- Agent 10 release intake summary: inputs checked \`${intake?.summary?.inputs_checked ?? 'unknown'}\`; missing required inputs \`${intake?.summary?.missing_required_inputs ?? 'unknown'}\`; release-relevant rows \`${intake?.summary?.release_relevant_rows ?? 'unknown'}\`; Agent 6 handoff candidates \`${intake?.summary?.agent6_handoff_candidates ?? 'unknown'}\`
- Exact blocker: \`${wake.decision.reason}\`

## Minimum Runnable Contract Fields

${wake.minimum_runnable_contract_fields.map((field) => `- ${field}`).join('\n')}

## Wake Condition

Next valid action without changed input: \`${wake.wake_condition.next_valid_action_without_changed_input}\`

If changed input appears, author:

- \`${context.defaultContractMd}\`
- \`${context.defaultContractJson}\`

Then route through \`${routeTarget}\`. Assistant-1/Spark-1 remains paused and is not a valid route for this blocker.

## Cap

Do not rerun the same validators, runtime proof, Deuteronomy baseline, or broad public checks without a changed package/input or an explicit changed baseline target/request.

## Not Accepted

${wake.not_accepted.map((entry) => `- ${entry}`).join('\n')}
`;
}

function renderRunnableContractMarkdown(context, contract) {
  return `# Agent 4 / Spark-4 Runnable Changed-Package Validator/Prereq Contract - ${context.date}

## Status

Status: \`${contract.status}\`

## Changed Package/Input

\`${contract.changed_package_input_path}\`

Fingerprint: \`${contract.package_hash_or_commit_or_mtime}\`

## Exact Command List

${contract.exact_command_list.map((command) => `- \`${command}\``).join('\n')}

## Expected Output Path/Schema

\`${contract.expected_output_path_schema}\`

## Validator/Gate

\`${contract.validator_gate}\`

## Package Owner

\`${contract.package_owner}\`

## Agent 6 Boundary Trigger

\`${contract.agent6_boundary_trigger || 'not_required_by_contract'}\`

## Stop Condition

\`${contract.stop_condition}\`

## Route

Route runnable contract through \`${routeTarget}\`. Assistant-1/Spark-1 remains paused and is not a valid route for this blocker.

## Not Accepted

${contract.not_accepted.map((entry) => `- ${entry}`).join('\n')}
`;
}

function notAccepted() {
  return [
    'QA acceptance',
    'public/runtime acceptance',
    'source/provenance acceptance',
    'license acceptance',
    'Definition authority',
    'runtime acceptance',
    'publication readiness',
    'route publication support',
    'product/data acceptance',
    'answer acceptance',
    'accepted gloss',
    'translation output',
    'accepted text',
  ];
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith('--')) continue;
    const [key, inlineValue] = arg.slice(2).split('=', 2);
    parsed[toCamel(key)] = inlineValue ?? rawArgs[index + 1] ?? true;
    parsed[key] = parsed[toCamel(key)];
    if (inlineValue === undefined && rawArgs[index + 1] && !rawArgs[index + 1].startsWith('--')) index += 1;
  }
  return parsed;
}

function toCamel(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function readJson(root, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readJsonIfExists(root, relativePath) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function readTextIfExists(root, relativePath) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) return '';
  return fs.readFileSync(full, 'utf8');
}

function writeJson(root, relativePath, value) {
  const full = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(root, relativePath, value) {
  const full = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, value, 'utf8');
}

function sha256IfExists(root, relativePath) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) return null;
  return createHash('sha256').update(fs.readFileSync(full)).digest('hex');
}

function findLine(text, pattern) {
  return text.split(/\r?\n/).find((line) => line.includes(pattern)) || null;
}

function isCliEntryPoint() {
  return process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
}

#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  stamp: 'data/definitions/hud-route-release-stamp.json',
  sourceDir: '',
  report: '',
  failOnDrift: false,
};

const options = parseArgs(process.argv.slice(2));
const issues = [];
const drift = [];
const rows = [];

const stamp = readJson(options.stamp, 'HUD route release stamp');
if (stamp.schema_version !== 1) issues.push('release stamp schema_version must be 1');
if (stamp.artifact_type !== 'hud_route_release_stamp') issues.push('release stamp artifact_type must be hud_route_release_stamp');
if (stamp.status !== 'release_candidate') issues.push(`release stamp status must be release_candidate, got ${stamp.status || 'missing'}`);
if ((stamp.issues || []).length) issues.push(`release stamp carries ${stamp.issues.length} issue(s)`);

const sourceDir = cleanPath(options.sourceDir || stamp.frozen_inputs?.source_dir || '');
if (!sourceDir) issues.push('missing source route directory; pass --source-dir or stamp frozen_inputs.source_dir');

for (const [index, input] of (stamp.frozen_inputs?.files || []).entries()) {
  const context = `frozen_inputs.files[${index}] ${input.file || ''}`.trim();
  const frozen = await summarizeStampedFile(input.frozen_path, input, context);
  const source = sourceDir && input.file
    ? await summarizeOptionalFile(path.join(sourceDir, input.file))
    : null;

  let current_status = 'missing';
  if (source) {
    current_status = source.sha256 === input.sha256 && source.byte_length === input.byte_length
      ? 'matches release freeze'
      : 'differs from release freeze';
    if (current_status !== 'matches release freeze') {
      drift.push(`${input.file}: current source differs from frozen release input`);
    }
  } else {
    current_status = input.required ? 'required source missing now' : 'optional source missing now';
    drift.push(`${input.file}: ${current_status}`);
  }

  rows.push({
    file: input.file || '',
    role: input.role || '',
    required: input.required === true,
    frozen_path: input.frozen_path || '',
    source_path: sourceDir && input.file ? cleanPath(path.join(sourceDir, input.file)) : '',
    frozen_status: frozen ? 'matches stamp' : 'missing or invalid',
    current_status,
    row_count: input.row_count ?? '',
    byte_length: input.byte_length ?? '',
    sha256: input.sha256 || '',
  });
}

for (const optional of (stamp.frozen_inputs?.missing_optional_files || [])) {
  if (!sourceDir || !optional.file) continue;
  const current = await summarizeOptionalFile(path.join(sourceDir, optional.file));
  const current_status = current ? 'present after release freeze' : 'absent at release freeze and absent now';
  if (current) drift.push(`${optional.file}: optional route input exists now but was absent from release freeze`);
  rows.push({
    file: optional.file,
    role: optional.role || '',
    required: false,
    frozen_path: '',
    source_path: cleanPath(path.join(sourceDir, optional.file)),
    frozen_status: 'not frozen optional',
    current_status,
    row_count: '',
    byte_length: current?.byte_length ?? '',
    sha256: current?.sha256 || '',
  });
}

const result = {
  schema_version: 1,
  artifact_type: 'hud_route_input_freeze_drift_report',
  generated_at: new Date().toISOString(),
  release_id: stamp.release_id || '',
  status: issues.length ? 'fail' : drift.length ? 'drift' : 'pass',
  fail_on_drift: options.failOnDrift,
  stamp: cleanPath(options.stamp),
  source_dir: sourceDir,
  frozen_file_count: (stamp.frozen_inputs?.files || []).length,
  missing_optional_file_count: (stamp.frozen_inputs?.missing_optional_files || []).length,
  issues,
  drift,
  rows,
};

if (options.report) writeReport(options.report, result);

if (issues.length || (options.failOnDrift && drift.length)) {
  const label = issues.length
    ? `HUD route input freeze validation failed with ${issues.length} issue(s)`
    : `HUD route input freeze drift check failed with ${drift.length} drift item(s)`;
  console.error(`${label}:`);
  for (const issue of issues) console.error(`- ${issue}`);
  for (const item of drift) console.error(`- ${item}`);
  process.exit(1);
}

if (drift.length) {
  console.log(`HUD route input freeze drift detected for ${drift.length} item(s): ${result.release_id}.`);
} else {
  console.log(`HUD route input freeze validation passed: ${result.release_id}.`);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--stamp') parsed.stamp = args[++index];
    else if (arg === '--source-dir') parsed.sourceDir = args[++index];
    else if (arg === '--report') parsed.report = args[++index];
    else if (arg === '--fail-on-drift') parsed.failOnDrift = true;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage:',
      '  node scripts/validate_hud_route_input_freeze.mjs',
      '',
      'Options:',
      '  --stamp data/definitions/hud-route-release-stamp.json',
      '  --source-dir .local-cache/definition-routes',
      '  --report reports/hud-route-input-freeze-drift.md',
      '  --fail-on-drift',
      '',
      'Default behavior reports source-input drift without failing. Use --fail-on-drift',
      'inside release-candidate generation to require current sources to match the freeze.',
    ].join('\n'));
    process.exit(0);
  }
  return parsed;
}

function readJson(relativePath, label) {
  const fullPath = path.join(root, relativePath || '');
  if (!fs.existsSync(fullPath)) throw new Error(`Missing ${label}: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

async function summarizeStampedFile(relativePath, expected, context) {
  if (!relativePath || !expected) {
    issues.push(`${context}: missing stamped file metadata`);
    return null;
  }
  const summary = await summarizeOptionalFile(relativePath);
  if (!summary) {
    issues.push(`${context}: missing frozen file ${relativePath}`);
    return null;
  }
  if (summary.byte_length !== expected.byte_length) {
    issues.push(`${context}: frozen byte_length mismatch, stamp has ${expected.byte_length}, current value is ${summary.byte_length}`);
  }
  if (summary.sha256 !== expected.sha256) issues.push(`${context}: frozen sha256 mismatch`);
  return summary;
}

async function summarizeOptionalFile(relativePath) {
  const fullPath = path.join(root, relativePath || '');
  if (!relativePath || !fs.existsSync(fullPath)) return null;
  const stat = fs.statSync(fullPath);
  return {
    path: cleanPath(relativePath),
    byte_length: stat.size,
    sha256: await sha256File(fullPath),
    modified_at: stat.mtime.toISOString(),
  };
}

async function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  const stream = fs.createReadStream(filePath);
  await new Promise((resolve, reject) => {
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', resolve);
  });
  return hash.digest('hex');
}

function writeReport(relativePath, result) {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const lines = [
    '# HUD Route Input Freeze Drift',
    '',
    `Generated: ${result.generated_at}`,
    `Status: ${result.status}`,
    `Release ID: ${result.release_id}`,
    `Fail on drift: ${result.fail_on_drift ? 'yes' : 'no'}`,
    '',
    '## Scope',
    '',
    `- Release stamp: \`${result.stamp}\``,
    `- Current source dir: \`${result.source_dir}\``,
    `- Frozen files: ${result.frozen_file_count}`,
    `- Optional files absent from freeze: ${result.missing_optional_file_count}`,
    '',
    '## Issues',
    '',
    ...(result.issues.length ? result.issues.map((issue) => `- ${issue}`) : ['- None']),
    '',
    '## Drift',
    '',
    ...(result.drift.length ? result.drift.map((item) => `- ${item}`) : ['- None']),
    '',
    '## Files',
    '',
    '| file | required | rows | bytes | frozen status | current status |',
    '|---|---:|---:|---:|---|---|',
    ...result.rows.map((row) => `| ${mdCell(row.file)} | ${row.required ? 'yes' : 'no'} | ${row.row_count} | ${row.byte_length} | ${mdCell(row.frozen_status)} | ${mdCell(row.current_status)} |`),
    '',
    '## Boundary',
    '',
    'This report compares the stamped release freeze to the current route input cache. It does not regenerate HUD route data, import sources, or change public lookup artifacts.',
  ];
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function cleanPath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

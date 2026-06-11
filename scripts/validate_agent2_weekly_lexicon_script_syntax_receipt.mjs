#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const receiptPath = cleanRelativePath(process.argv[2] || 'reports/agent2-weekly-lexicon-script-syntax-receipt-2026-06-04.json');
const receipt = readJson(receiptPath);
const issues = [];

expect(receipt.schema_version === '1.0', 'schema_version must be 1.0');
expect(receipt.artifact_type === 'agent2_weekly_lexicon_script_syntax_receipt', 'unexpected artifact_type');
expect(receipt.mode === 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE', 'unexpected mode');
requirePath(receipt.inputs?.spark1_manifest, 'inputs.spark1_manifest');
requirePath(receipt.inputs?.current_handoff_bundle, 'inputs.current_handoff_bundle');

const manifest = readJson(receipt.inputs?.spark1_manifest);
const bundle = readJson(receipt.inputs?.current_handoff_bundle);
expect(receipt.counts?.runnable_pipelines === manifest.runnable_pipelines?.length, 'runnable pipeline count mismatch');
expect(receipt.counts?.validator_only_checks === manifest.validator_only_checks?.length, 'validator-only count mismatch');
expect(receipt.counts?.runnable_pipelines === 7, 'runnable_pipelines must be 7');
expect(receipt.counts?.validator_only_checks === 24, 'validator_only_checks must be 24');

const expectedScripts = [...collectScripts(manifest), ...collectEntrypointScripts(bundle)]
  .filter((script, index, values) => values.indexOf(script) === index)
  .sort();
expect(JSON.stringify(receipt.scripts_checked || []) === JSON.stringify(expectedScripts), 'scripts_checked must match manifest/bundle-derived script set');
expect(receipt.counts?.scripts_checked === expectedScripts.length, 'scripts_checked count mismatch');
expect(receipt.counts?.scripts_checked >= 30, 'scripts_checked must cover at least 30 current scripts');

for (const script of receipt.scripts_checked || []) {
  requirePath(script, `scripts_checked.${script}`);
  expect(receipt.commands?.includes(`node --check ${script}`), `missing node --check command for ${script}`);
}
for (const command of receipt.commands || []) {
  expect(typeof command === 'string' && command.startsWith('node --check scripts/') && command.endsWith('.mjs'), `invalid syntax command: ${command}`);
}
for (const [key, value] of Object.entries(receipt.zero_boundary || {})) {
  expect(value === false, `zero_boundary.${key} must be false`);
}
const boundary = JSON.stringify(receipt.what_must_not_be_accepted || []);
for (const required of ['Definition authority', 'answer eligibility', 'public reader output', 'route-shard edit', 'NC commercial authorization']) {
  expect(boundary.includes(required), `what_must_not_be_accepted must include ${required}`);
}

if (issues.length) {
  console.error(`Agent 2 weekly lexicon script syntax receipt validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 160)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 weekly lexicon script syntax receipt validation passed. Scripts: ${receipt.counts.scripts_checked}.`);

function collectScripts(manifest) {
  const scripts = [];
  for (const pipeline of manifest.runnable_pipelines || []) {
    scripts.push(scriptFromCommand(pipeline.build));
    scripts.push(scriptFromCommand(pipeline.validate));
  }
  for (const check of manifest.validator_only_checks || []) {
    scripts.push(scriptFromCommand(check.command));
  }
  return scripts.filter(Boolean);
}

function collectEntrypointScripts(bundle) {
  return Object.values(bundle.entrypoints || {}).filter((value) => String(value).startsWith('scripts/') && String(value).endsWith('.mjs'));
}

function scriptFromCommand(command) {
  if (typeof command !== 'string') return null;
  return command.split(/\s+/).find((part) => part.startsWith('scripts/') && part.endsWith('.mjs')) || null;
}

function requirePath(relativePath, label) {
  expect(typeof relativePath === 'string' && relativePath.length > 0, `${label} path is required`);
  if (relativePath) expect(fs.existsSync(path.join(root, cleanRelativePath(relativePath))), `${label} path does not exist: ${relativePath}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

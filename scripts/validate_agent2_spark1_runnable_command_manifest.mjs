#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = process.argv[2] || 'reports/agent2-spark1-runnable-command-manifest-2026-06-04.json';
const manifest = readJson(cleanRelativePath(manifestPath));
const issues = [];

expect(manifest.schema_version === '1.0', 'schema_version must be 1.0');
expect(manifest.artifact_type === 'agent2_spark1_runnable_command_manifest', 'unexpected artifact_type');
requirePath(manifest.source_inventory, 'source_inventory');
expect(Array.isArray(manifest.runnable_pipelines) && manifest.runnable_pipelines.length === 7, 'must have 7 runnable pipelines');
expect(Array.isArray(manifest.validator_only_checks) && manifest.validator_only_checks.length === 24, 'must have 24 validator-only checks');

for (const pipeline of manifest.runnable_pipelines || []) {
  expect(typeof pipeline.id === 'string' && pipeline.id.length > 0, 'pipeline.id is required');
  validateCommandPaths(pipeline.build, `${pipeline.id}.build`);
  validateCommandPaths(pipeline.validate, `${pipeline.id}.validate`);
  expect(pipeline.expected_counts && typeof pipeline.expected_counts === 'object', `${pipeline.id}.expected_counts is required`);
}

for (const check of manifest.validator_only_checks || []) {
  expect(typeof check.id === 'string' && check.id.length > 0, 'validator check id is required');
  validateCommandPaths(check.command, `${check.id}.command`);
}

for (const blocker of [
  'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary',
  'missing_larger_token_inventory_workset',
  'missing_joined_definition_workbench_sample_artifact_contract',
  'orot_counterpart_preview_not_promotable_without_agent1_source_lane_and_agent6_boundary',
  'no_new_agent2_exact_workset_after_deuteronomy_return',
  'orot_zero_safe_pilot_missing_machine_checkable_upstream_definition_route_claim_rejoin_morphology_homograph_gates',
]) {
  expect(manifest.blocked_routes?.includes(blocker), `blocked_routes must include ${blocker}`);
}

const boundaryText = JSON.stringify(manifest.what_must_not_be_accepted || []);
for (const required of ['Definition authority', 'answer eligibility', 'public reader output', 'route-shard edit', 'NC commercial authorization']) {
  expect(boundaryText.includes(required), `what_must_not_be_accepted must include ${required}`);
}

if (issues.length) {
  console.error(`Agent 2 Spark-1 command manifest validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 Spark-1 command manifest validation passed. Runnable pipelines: ${manifest.runnable_pipelines.length}; validator-only checks: ${manifest.validator_only_checks.length}.`);

function validateCommandPaths(command, context) {
  expect(typeof command === 'string' && command.startsWith('node '), `${context} must be a node command`);
  if (typeof command !== 'string') return;
  const parts = command.split(/\s+/).slice(1);
  const script = parts.find((part) => part.startsWith('scripts/') && part.endsWith('.mjs'));
  requirePath(script, `${context}.script`);
  for (const part of parts) {
    const value = part.includes('=') ? part.split('=').slice(1).join('=') : part;
    if (looksLikeRepoPath(value)) requirePath(value, `${context}.${value}`);
  }
}

function looksLikeRepoPath(value) {
  return /^(scripts|reports|data)\//.test(value) && !value.includes('<') && !value.includes('>');
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
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

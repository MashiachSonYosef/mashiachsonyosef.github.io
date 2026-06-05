#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'data/definitions/agent3-definition-workbench-usage-collision-validation-run-reshit.json';
const reportPath = process.argv[3] || 'reports/agent3-definition-workbench-usage-collision-validation-run-reshit.md';
const artifact = readJson(artifactPath);
const errors = [];

const expectedCommands = [
  'node scripts\\validate_agent3_definition_workbench_usage_focus_collision_audit.mjs',
  'node scripts\\validate_agent3_definition_workbench_usage_collision_review_queue.mjs',
  'node scripts\\validate_agent3_definition_workbench_usage_collision_review_reverse_index.mjs',
  'node scripts\\validate_agent3_definition_workbench_usage_collision_handoff_manifest.mjs',
  'node scripts\\validate_agent3_definition_workbench_usage_collision_integrity_digest.mjs',
  'node scripts\\validate_agent3_usage_state.mjs',
];

const results = artifact.command_results || [];
const counts = artifact.counts || {};

requireEqual(artifact.schema_version, 1, 'schema_version must be 1');
requireEqual(artifact.artifact_type, 'agent3_definition_workbench_usage_collision_validation_run', 'artifact_type mismatch');
requireEqual(artifact.lane_owner, 'Agent 3', 'lane_owner must be Agent 3');
requireEqual(artifact.status, 'evidence-ready', 'status must be evidence-ready');
requireEqual(artifact.target_gate, 'definition_workbench_gate', 'target_gate mismatch');
requireTruthy(fs.existsSync(path.join(root, reportPath)), `report missing: ${reportPath}`);

for (const key of ['usage_navigation_only', 'validation_run_only', 'observed_usage_only', 'route_ids_only', 'audit_only']) {
  requireTruthy(artifact.authority_boundary?.[key], `authority_boundary.${key} must be true`);
}
for (const key of [
  'reader_facing',
  'definition_authority',
  'reviewed_lexical_authority',
  'semantic_arbitration',
  'route_ranking',
  'visible_answer_selection',
  'copied_route_payloads',
  'accepted_text_output',
  'publication_claim',
  'source_text_read',
  'broad_target_expansion',
  'agent6_accepted',
]) {
  requireFalse(artifact.authority_boundary?.[key], `authority_boundary.${key} must be false`);
}

requireEqual(results.length, expectedCommands.length, 'command_results length mismatch');
requireEqual(results.map((row) => row.command).join('\n'), expectedCommands.join('\n'), 'validator command order mismatch');
for (const row of results) {
  requireTruthy(row.key, 'command result key missing');
  requireTruthy(row.validator_path && fs.existsSync(path.join(root, row.validator_path)), `${row.key}: validator missing`);
  requireTruthy(row.data_path && fs.existsSync(path.join(root, row.data_path)), `${row.key}: data path missing`);
  requireTruthy(row.validator_exists, `${row.key}: validator_exists must be true`);
  requireTruthy(row.data_exists, `${row.key}: data_exists must be true`);
  requireEqual(row.exit_code, 0, `${row.key}: exit code mismatch`);
  requireTruthy(row.passed, `${row.key}: passed must be true`);
  requireTruthy(String(row.stdout || '').includes('passed'), `${row.key}: stdout must include passed`);
  requireEqual(row.stderr, '', `${row.key}: stderr must be empty`);
}

const jsonArtifacts = results.filter((row) => row.data_path.endsWith('.json')).map((row) => readJson(row.data_path));
const routeIds = new Set();
for (const data of jsonArtifacts) collectRouteIds(data, routeIds);
requireEqual(counts.validation_commands, results.length, 'validation_commands mismatch');
requireEqual(counts.commands_passed, results.filter((row) => row.exit_code === 0).length, 'commands_passed mismatch');
requireEqual(counts.commands_failed, results.filter((row) => row.exit_code !== 0).length, 'commands_failed mismatch');
requireEqual(counts.validators_present, results.filter((row) => row.validator_exists).length, 'validators_present mismatch');
requireEqual(counts.data_paths_present, results.filter((row) => row.data_exists).length, 'data_paths_present mismatch');
requireEqual(counts.json_data_artifacts, jsonArtifacts.length, 'json_data_artifacts mismatch');
requireEqual(counts.evidence_ready_json_artifacts, jsonArtifacts.filter((data) => data.status === 'evidence-ready').length, 'evidence_ready_json_artifacts mismatch');
requireEqual(counts.route_ids, routeIds.size, 'route_ids mismatch');

for (const key of [
  'reader_facing_rows',
  'route_payload_field_hits',
  'forbidden_authority_field_hits',
  'source_text_reads',
  'broad_target_expansion',
  'queue_mutations',
  'submitted_to_agent6',
]) {
  requireEqual(counts[key], 0, `${key} must be 0`);
}

for (const check of artifact.checks || []) requireEqual(check.status, 'passed', `check failed: ${check.id}`);

const report = fs.readFileSync(path.join(root, reportPath), 'utf8');
requireTruthy(report.includes('validator-run evidence only'), 'report must preserve validator-run boundary');
requireTruthy(report.includes('not Definition authority'), 'report must reject Definition authority');
requireTruthy(report.includes('does not mutate queues'), 'report must reject queue mutation');

if (errors.length) {
  console.error(`Agent 3 collision validation run validation failed: ${errors.length} error(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Agent 3 collision validation run validation passed: commands ${counts.validation_commands}; passed ${counts.commands_passed}; route IDs ${counts.route_ids}`);

function collectRouteIds(node, ids) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) collectRouteIds(item, ids);
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if ((key === 'related_agent2_route_ids' || key === 'route_ids') && Array.isArray(value)) {
      for (const id of value) if (typeof id === 'string') ids.add(id);
    }
    collectRouteIds(value, ids);
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function requireEqual(actual, expected, message) {
  if (actual !== expected) errors.push(`${message}: expected ${expected}, got ${actual}`);
}

function requireTruthy(value, message) {
  if (!value) errors.push(message);
}

function requireFalse(value, message) {
  if (value !== false) errors.push(`${message}: got ${value}`);
}

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-validation-run-reshit.json';
const reportPath = 'reports/agent3-definition-workbench-usage-collision-work-category-validation-run-reshit.md';
const artifact = readJson(artifactPath);
const errors = [];
const counts = artifact.counts || {};
const results = artifact.command_results || [];

requireEqual(artifact.schema_version, 1, 'schema_version must be 1');
requireEqual(artifact.artifact_type, 'agent3_definition_workbench_usage_collision_work_category_validation_run', 'artifact_type mismatch');
requireEqual(artifact.lane_owner, 'Agent 3', 'lane_owner must be Agent 3');
requireEqual(artifact.status, 'evidence-ready', 'status must be evidence-ready');
requireTruthy(fs.existsSync(path.join(root, reportPath)), `report missing: ${reportPath}`);
for (const key of ['usage_navigation_only', 'validation_run_only', 'observed_usage_only', 'route_ids_only', 'audit_only']) requireTruthy(artifact.authority_boundary?.[key], `authority_boundary.${key} must be true`);
for (const key of ['reader_facing', 'definition_authority', 'reviewed_lexical_authority', 'semantic_arbitration', 'route_ranking', 'visible_answer_selection', 'copied_route_payloads', 'accepted_text_output', 'publication_claim', 'source_text_read', 'broad_target_expansion', 'agent6_accepted']) requireFalse(artifact.authority_boundary?.[key], `authority_boundary.${key} must be false`);

requireEqual(results.length, 2, 'command_results length mismatch');
for (const row of results) {
  requireTruthy(row.validator_exists, `${row.key}: validator_exists must be true`);
  requireTruthy(row.data_exists, `${row.key}: data_exists must be true`);
  requireEqual(row.exit_code, 0, `${row.key}: exit code must be 0`);
  requireTruthy(row.passed, `${row.key}: passed must be true`);
  requireTruthy(String(row.stdout || '').includes('passed'), `${row.key}: stdout must include passed`);
  requireEqual(row.stderr, '', `${row.key}: stderr must be empty`);
}

const index = readJson(artifact.source_artifacts?.collision_work_category_index || 'data/definitions/agent3-definition-workbench-usage-collision-work-category-index-reshit.json');
requireEqual(counts.validation_commands, results.length, 'validation_commands mismatch');
requireEqual(counts.commands_passed, results.filter((row) => row.passed).length, 'commands_passed mismatch');
requireEqual(counts.commands_failed, results.filter((row) => !row.passed).length, 'commands_failed mismatch');
requireEqual(counts.validators_present, results.filter((row) => row.validator_exists).length, 'validators_present mismatch');
requireEqual(counts.data_paths_present, results.filter((row) => row.data_exists).length, 'data_paths_present mismatch');
requireEqual(counts.source_occurrence_rows, index.counts?.source_occurrence_rows, 'source_occurrence_rows mismatch');
requireEqual(counts.category_index_rows, index.counts?.category_index_rows, 'category_index_rows mismatch');
requireEqual(counts.work_index_rows, index.counts?.work_index_rows, 'work_index_rows mismatch');
requireEqual(counts.category_license_index_rows, index.counts?.category_license_index_rows, 'category_license_index_rows mismatch');
requireEqual(counts.queue_links, index.counts?.occurrence_queue_links, 'queue_links mismatch');
for (const key of ['reader_facing_rows', 'route_payload_field_hits', 'forbidden_authority_field_hits', 'source_text_reads', 'broad_target_expansion', 'queue_mutations', 'submitted_to_agent6']) requireEqual(counts[key], 0, `${key} must be 0`);
for (const check of artifact.checks || []) requireEqual(check.status, 'passed', `check failed: ${check.id}`);

if (errors.length) {
  console.error(`Agent 3 work/category validation run validation failed: ${errors.length} error(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Agent 3 work/category validation run validation passed: commands ${counts.commands_passed}/${counts.validation_commands}; queue links ${counts.queue_links}`);

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

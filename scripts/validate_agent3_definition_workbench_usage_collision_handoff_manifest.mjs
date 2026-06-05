#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'data/definitions/agent3-definition-workbench-usage-collision-handoff-manifest-reshit.json';
const reportPath = process.argv[3] || 'reports/agent3-definition-workbench-usage-collision-handoff-manifest-reshit.md';
const artifact = readJson(artifactPath);
const errors = [];

const entries = artifact.manifest_entries || [];
const counts = artifact.counts || {};
const expected = {
  focus_collision_audit: {
    type: 'agent3_definition_workbench_usage_focus_collision_audit',
    data_path: 'data/definitions/agent3-definition-workbench-usage-focus-collision-audit-reshit.json',
    report_path: 'reports/agent3-definition-workbench-usage-focus-collision-audit-reshit.md',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_focus_collision_audit.mjs',
  },
  collision_review_queue: {
    type: 'agent3_definition_workbench_usage_collision_review_queue',
    data_path: 'data/definitions/agent3-definition-workbench-usage-collision-review-queue-reshit.json',
    report_path: 'reports/agent3-definition-workbench-usage-collision-review-queue-reshit.md',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_collision_review_queue.mjs',
  },
  collision_review_reverse_index: {
    type: 'agent3_definition_workbench_usage_collision_review_reverse_index',
    data_path: 'data/definitions/agent3-definition-workbench-usage-collision-review-reverse-index-reshit.json',
    report_path: 'reports/agent3-definition-workbench-usage-collision-review-reverse-index-reshit.md',
    validator_path: 'scripts/validate_agent3_definition_workbench_usage_collision_review_reverse_index.mjs',
  },
};

requireEqual(artifact.schema_version, 1, 'schema_version must be 1');
requireEqual(artifact.artifact_type, 'agent3_definition_workbench_usage_collision_handoff_manifest', 'artifact_type mismatch');
requireEqual(artifact.lane_owner, 'Agent 3', 'lane_owner must be Agent 3');
requireEqual(artifact.status, 'evidence-ready', 'status must be evidence-ready');
requireEqual(artifact.target_gate, 'definition_workbench_gate', 'target_gate mismatch');
requireTruthy(fs.existsSync(path.join(root, reportPath)), `report missing: ${reportPath}`);

for (const key of ['usage_navigation_only', 'collision_handoff_manifest_only', 'observed_usage_only', 'route_ids_only', 'audit_only']) {
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

requireEqual(entries.length, 3, 'manifest_entries length mismatch');
const entryByKey = new Map(entries.map((entry) => [entry.key, entry]));
for (const [key, spec] of Object.entries(expected)) {
  const entry = entryByKey.get(key);
  requireTruthy(entry, `${key}: manifest entry missing`);
  if (!entry) continue;
  requireEqual(entry.data_path, spec.data_path, `${key}: data_path mismatch`);
  requireEqual(entry.report_path, spec.report_path, `${key}: report_path mismatch`);
  requireEqual(entry.validator_path, spec.validator_path, `${key}: validator_path mismatch`);
  requireTruthy(entry.data_exists, `${key}: data_exists must be true`);
  requireTruthy(entry.report_exists, `${key}: report_exists must be true`);
  requireTruthy(entry.validator_exists, `${key}: validator_exists must be true`);
  requireEqual(entry.artifact_type, spec.type, `${key}: artifact_type mismatch`);
  requireTruthy(entry.type_matches, `${key}: type_matches must be true`);
  requireEqual(entry.status, 'evidence-ready', `${key}: status mismatch`);
  const data = readJson(entry.data_path);
  requireEqual(data.artifact_type, spec.type, `${key}: current data type mismatch`);
  requireEqual(JSON.stringify(entry.counts), JSON.stringify(data.counts || {}), `${key}: counts snapshot mismatch`);
  for (const boundaryKey of [
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
    'source_text_reads',
    'broad_target_expansion',
    'queue_mutations',
    'submitted_to_agent6',
  ]) {
    requireEqual(entry.boundary_summary[boundaryKey], Number(data.counts?.[boundaryKey] || 0), `${key}: ${boundaryKey} mismatch`);
  }
}

const currentEntries = [...entryByKey.values()];
const focusTokens = new Set(currentEntries.map((entry) => entry.focus_token_normalized).filter(Boolean));
const routeIds = new Set(currentEntries.flatMap((entry) => entry.route_ids || []));
requireEqual(counts.manifest_entries, entries.length, 'manifest_entries count mismatch');
requireEqual(counts.entries_with_data_report_validator, currentEntries.filter((entry) => entry.data_exists && entry.report_exists && entry.validator_exists).length, 'entries_with_data_report_validator mismatch');
requireEqual(counts.entries_with_expected_type, currentEntries.filter((entry) => entry.type_matches).length, 'entries_with_expected_type mismatch');
requireEqual(counts.evidence_ready_entries, currentEntries.filter((entry) => entry.status === 'evidence-ready').length, 'evidence_ready_entries mismatch');
requireEqual(counts.focus_tokens, focusTokens.size, 'focus_tokens mismatch');
requireEqual(counts.route_ids, routeIds.size, 'route_ids mismatch');

const audit = entryByKey.get('focus_collision_audit')?.counts || {};
const queue = entryByKey.get('collision_review_queue')?.counts || {};
const reverse = entryByKey.get('collision_review_reverse_index')?.counts || {};
requireEqual(counts.collision_audit_source_rows, audit.source_drilldown_rows, 'collision_audit_source_rows mismatch');
requireEqual(counts.collision_audit_rows, audit.collision_rows, 'collision_audit_rows mismatch');
requireEqual(counts.review_queue_rows, queue.review_queue_rows, 'review_queue_rows mismatch');
requireEqual(counts.reverse_index_occurrence_rows, reverse.occurrence_index_rows, 'reverse_index_occurrence_rows mismatch');
requireEqual(counts.reverse_index_source_ref_rows, reverse.source_ref_index_rows, 'reverse_index_source_ref_rows mismatch');
requireEqual(counts.reverse_index_work_rows, reverse.work_index_rows, 'reverse_index_work_rows mismatch');
requireEqual(counts.reverse_index_license_rows, reverse.license_index_rows, 'reverse_index_license_rows mismatch');

for (const key of [
  'total_reader_facing_rows',
  'total_route_payload_field_hits',
  'total_forbidden_authority_field_hits',
  'total_source_text_reads',
  'total_broad_target_expansion',
  'total_queue_mutations',
  'total_submitted_to_agent6',
]) {
  requireEqual(counts[key], 0, `${key} must be 0`);
}

requireEqual(artifact.consumer_contract?.required_label, 'observed usage only', 'consumer required label mismatch');
requireTruthy(String(artifact.consumer_contract?.route_payload_rule || '').includes('outside Agent 3'), 'route payload rule must resolve outside Agent 3');
requireTruthy((artifact.consumer_contract?.blocked_uses || []).includes('definition authority'), 'blocked uses must include definition authority');
requireTruthy((artifact.consumer_contract?.blocked_uses || []).includes('route ranking'), 'blocked uses must include route ranking');

for (const check of artifact.checks || []) requireEqual(check.status, 'passed', `check failed: ${check.id}`);

const report = fs.readFileSync(path.join(root, reportPath), 'utf8');
requireTruthy(report.includes('usage-navigation handoff only'), 'report must preserve usage-navigation handoff boundary');
requireTruthy(report.includes('not Definition authority'), 'report must reject Definition authority');
requireTruthy(report.includes('does not mutate Agent 6 queues'), 'report must reject queue mutation');

if (errors.length) {
  console.error(`Agent 3 collision handoff manifest validation failed: ${errors.length} error(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Agent 3 collision handoff manifest validation passed: entries ${counts.manifest_entries}; queue rows ${counts.review_queue_rows}; reverse occurrences ${counts.reverse_index_occurrence_rows}`);

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

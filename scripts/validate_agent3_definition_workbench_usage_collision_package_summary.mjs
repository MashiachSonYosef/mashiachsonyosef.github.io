#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'data/definitions/agent3-definition-workbench-usage-collision-package-summary-reshit.json';
const reportPath = process.argv[3] || 'reports/agent3-definition-workbench-usage-collision-package-summary-reshit.md';
const artifact = readJson(artifactPath);
const errors = [];

const inputs = artifact.source_artifacts || {};
const requiredInputs = {
  handoff_manifest: 'agent3_definition_workbench_usage_collision_handoff_manifest',
  integrity_digest: 'agent3_definition_workbench_usage_collision_integrity_digest',
  validation_run: 'agent3_definition_workbench_usage_collision_validation_run',
  provenance_index: 'agent3_definition_workbench_usage_collision_provenance_index',
  work_category_handoff_manifest: 'agent3_definition_workbench_usage_collision_work_category_handoff_manifest',
  work_category_integrity_digest: 'agent3_definition_workbench_usage_collision_work_category_integrity_digest',
  work_category_validation_run: 'agent3_definition_workbench_usage_collision_work_category_validation_run',
};
const sourceData = {};
const counts = artifact.counts || {};

requireEqual(artifact.schema_version, 1, 'schema_version must be 1');
requireEqual(artifact.artifact_type, 'agent3_definition_workbench_usage_collision_package_summary', 'artifact_type mismatch');
requireEqual(artifact.lane_owner, 'Agent 3', 'lane_owner must be Agent 3');
requireEqual(artifact.status, 'evidence-ready', 'status must be evidence-ready');
requireEqual(artifact.target_gate, 'definition_workbench_gate', 'target_gate mismatch');
requireTruthy(fs.existsSync(path.join(root, reportPath)), `report missing: ${reportPath}`);

for (const key of ['usage_navigation_only', 'package_summary_only', 'observed_usage_only', 'route_ids_only', 'audit_only']) {
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

for (const [key, type] of Object.entries(requiredInputs)) {
  requireTruthy(inputs[key], `source_artifacts.${key} missing`);
  if (!inputs[key]) continue;
  requireTruthy(fs.existsSync(path.join(root, inputs[key])), `${key}: file missing`);
  const data = readJson(inputs[key]);
  sourceData[key] = data;
  requireEqual(data.artifact_type, type, `${key}: artifact type mismatch`);
  requireEqual(data.status, 'evidence-ready', `${key}: status mismatch`);
}

const routeIds = new Set();
for (const data of Object.values(sourceData)) collectRouteIds(data, routeIds);
requireEqual(counts.package_artifacts, Object.keys(requiredInputs).length, 'package_artifacts mismatch');
requireEqual(counts.evidence_ready_artifacts, Object.values(sourceData).filter((row) => row.status === 'evidence-ready').length, 'evidence_ready_artifacts mismatch');
requireEqual(counts.handoff_entries, sourceData.handoff_manifest?.counts?.manifest_entries, 'handoff_entries mismatch');
requireEqual(counts.digest_entries, sourceData.integrity_digest?.counts?.digest_entries, 'digest_entries mismatch');
requireEqual(counts.validation_commands, sourceData.validation_run?.counts?.validation_commands, 'validation_commands mismatch');
requireEqual(counts.validation_commands_passed, sourceData.validation_run?.counts?.commands_passed, 'validation_commands_passed mismatch');
requireEqual(counts.work_category_handoff_entries, sourceData.work_category_handoff_manifest?.counts?.manifest_entries, 'work_category_handoff_entries mismatch');
requireEqual(counts.work_category_digest_entries, sourceData.work_category_integrity_digest?.counts?.digest_entries, 'work_category_digest_entries mismatch');
requireEqual(counts.work_category_validation_commands, sourceData.work_category_validation_run?.counts?.validation_commands, 'work_category_validation_commands mismatch');
requireEqual(counts.work_category_validation_commands_passed, sourceData.work_category_validation_run?.counts?.commands_passed, 'work_category_validation_commands_passed mismatch');
requireEqual(counts.work_category_source_occurrences, sourceData.work_category_handoff_manifest?.counts?.source_occurrence_rows, 'work_category_source_occurrences mismatch');
requireEqual(counts.work_category_index_rows, sourceData.work_category_handoff_manifest?.counts?.category_index_rows, 'work_category_index_rows mismatch');
requireEqual(counts.work_category_occurrence_locator_rows, sourceData.work_category_handoff_manifest?.counts?.occurrence_locator_rows, 'work_category_occurrence_locator_rows mismatch');
requireEqual(counts.work_category_provenance_locator_rows, sourceData.work_category_handoff_manifest?.counts?.provenance_locator_rows, 'work_category_provenance_locator_rows mismatch');
requireEqual(counts.work_category_source_ref_repeat_buckets, sourceData.work_category_handoff_manifest?.counts?.source_ref_repeat_buckets, 'work_category_source_ref_repeat_buckets mismatch');
requireEqual(counts.work_category_cross_work_snippet_buckets, sourceData.work_category_handoff_manifest?.counts?.cross_work_snippet_buckets, 'work_category_cross_work_snippet_buckets mismatch');
requireEqual(counts.provenance_source_occurrences, sourceData.provenance_index?.counts?.source_occurrence_rows, 'provenance_source_occurrences mismatch');
requireEqual(counts.provenance_license_rows, sourceData.provenance_index?.counts?.license_index_rows, 'provenance_license_rows mismatch');
requireEqual(counts.provenance_version_source_rows, sourceData.provenance_index?.counts?.version_source_index_rows, 'provenance_version_source_rows mismatch');
requireEqual(counts.provenance_version_title_rows, sourceData.provenance_index?.counts?.version_title_index_rows, 'provenance_version_title_rows mismatch');
requireEqual(counts.provenance_work_license_rows, sourceData.provenance_index?.counts?.work_license_index_rows, 'provenance_work_license_rows mismatch');
requireEqual(counts.provenance_queue_links, sourceData.provenance_index?.counts?.occurrence_queue_links, 'provenance_queue_links mismatch');
requireEqual(counts.route_ids, routeIds.size, 'route_ids mismatch');

for (const row of artifact.artifact_summaries || []) {
  const data = sourceData[row.key];
  requireTruthy(data, `${row.key}: missing source data`);
  if (!data) continue;
  requireEqual(row.artifact_type, data.artifact_type, `${row.key}: summary artifact type mismatch`);
  requireEqual(row.status, data.status, `${row.key}: summary status mismatch`);
  requireEqual(row.reader_facing_rows, data.counts?.reader_facing_rows || data.counts?.total_reader_facing_rows || 0, `${row.key}: reader count mismatch`);
  requireEqual(row.route_payload_field_hits, data.counts?.route_payload_field_hits || data.counts?.total_route_payload_field_hits || 0, `${row.key}: payload count mismatch`);
  requireEqual(row.forbidden_authority_field_hits, data.counts?.forbidden_authority_field_hits || data.counts?.total_forbidden_authority_field_hits || 0, `${row.key}: forbidden count mismatch`);
}

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

requireTruthy(artifact.readiness_summary?.all_package_artifacts_evidence_ready, 'readiness all_package_artifacts_evidence_ready must be true');
requireEqual(artifact.readiness_summary?.package_status, 'awaiting-Agent-6', 'package_status mismatch');
requireEqual(artifact.readiness_summary?.work_category_validators_passed, sourceData.work_category_validation_run?.counts?.commands_passed, 'work_category_validators_passed mismatch');
requireTruthy(String(artifact.readiness_summary?.blocked_use || '').includes('Definition authority'), 'blocked_use must mention Definition authority');

for (const check of artifact.checks || []) requireEqual(check.status, 'passed', `check failed: ${check.id}`);

const report = fs.readFileSync(path.join(root, reportPath), 'utf8');
requireTruthy(report.includes('package summary only'), 'report must preserve package-summary boundary');
requireTruthy(report.includes('not Definition authority'), 'report must reject Definition authority');
requireTruthy(report.includes('Work-category handoff entries'), 'report must expose work-category counts');
requireTruthy(report.includes('does not mutate queues'), 'report must reject queue mutation');

if (errors.length) {
  console.error(`Agent 3 collision package summary validation failed: ${errors.length} error(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Agent 3 collision package summary validation passed: artifacts ${counts.evidence_ready_artifacts}/${counts.package_artifacts}; validators ${counts.validation_commands_passed}/${counts.validation_commands}; provenance rows ${counts.provenance_source_occurrences}`);

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

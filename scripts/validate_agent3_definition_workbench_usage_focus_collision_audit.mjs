#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'data/definitions/agent3-definition-workbench-usage-focus-collision-audit-reshit.json';
const reportPath = process.argv[3] || 'reports/agent3-definition-workbench-usage-focus-collision-audit-reshit.md';
const artifact = readJson(artifactPath);
const errors = [];

const sourcePath = artifact.source_artifacts?.focus_token_drilldown;
const source = sourcePath ? readJson(sourcePath) : null;
const sourceRows = source?.occurrence_rows || [];
const collisionRows = artifact.collision_rows || [];
const counts = artifact.counts || {};

requireEqual(artifact.schema_version, 1, 'schema_version must be 1');
requireEqual(artifact.artifact_type, 'agent3_definition_workbench_usage_focus_collision_audit', 'artifact_type mismatch');
requireEqual(artifact.lane_owner, 'Agent 3', 'lane_owner must be Agent 3');
requireEqual(artifact.status, 'evidence-ready', 'status must be evidence-ready');
requireTruthy(sourcePath, 'source_artifacts.focus_token_drilldown missing');
requireTruthy(source, `source artifact missing: ${sourcePath}`);
requireEqual(source?.artifact_type, 'agent3_definition_workbench_usage_focus_token_drilldown', 'source artifact type mismatch');
requireTruthy(fs.existsSync(path.join(root, reportPath)), `report missing: ${reportPath}`);

for (const key of [
  'usage_navigation_only',
  'collision_audit_only',
  'observed_usage_only',
  'route_ids_only',
  'audit_only',
]) {
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

requireEqual(counts.source_drilldown_rows, sourceRows.length, 'source_drilldown_rows mismatch');
requireEqual(counts.focus_token_rows, sourceRows.filter((row) => row.focus_normalized === artifact.focus_token_normalized).length, 'focus_token_rows mismatch');
requireEqual(counts.collision_rows, collisionRows.length, 'collision_rows mismatch');
requireEqual(counts.rows_with_complete_metadata, sourceRows.filter(hasCompleteMetadata).length, 'rows_with_complete_metadata mismatch');
requireEqual(counts.rows_with_route_ids, sourceRows.filter((row) => (row.related_agent2_route_ids || []).length).length, 'rows_with_route_ids mismatch');
requireEqual(counts.observed_usage_only_rows, sourceRows.filter((row) => row.row_label === 'observed usage only').length, 'observed_usage_only_rows mismatch');

const expected = expectedCollisionCounts(sourceRows);
for (const [key, value] of Object.entries(expected)) requireEqual(counts[key], value, `${key} mismatch`);

const expectedEmitted = {
  emitted_source_ref_collision_rows: 'source_ref',
  emitted_local_work_anchor_collision_rows: 'local_work_anchor',
  emitted_phrase_context_collision_rows: 'phrase_context',
  emitted_work_frame_collision_rows: 'work_frame',
  emitted_source_ref_frame_collision_rows: 'source_ref_frame',
  emitted_source_ref_license_collision_rows: 'source_ref_license',
};
for (const [countKey, type] of Object.entries(expectedEmitted)) {
  requireEqual(counts[countKey], collisionRows.filter((row) => row.collision_type === type).length, `${countKey} mismatch`);
}

for (const [type, row] of Object.entries(artifact.collision_type_counts || {})) {
  const countPrefix = typeToCountPrefix(type);
  requireEqual(row.bucket_count, counts[`duplicate_${countPrefix}_buckets`], `${type}: bucket_count mismatch`);
  requireEqual(row.row_count, counts[`duplicate_${countPrefix}_rows`], `${type}: row_count mismatch`);
  requireEqual(row.emitted_bucket_count, collisionRows.filter((entry) => entry.collision_type === type).length, `${type}: emitted_bucket_count mismatch`);
}

for (const row of collisionRows) {
  requireTruthy(row.collision_id, 'collision row missing id');
  requireTruthy(row.collision_type, `${row.collision_id}: collision_type missing`);
  requireTruthy(row.collision_key, `${row.collision_id}: collision_key missing`);
  requireTruthy(row.row_count > 1, `${row.collision_id}: row_count must be > 1`);
  requireTruthy(Array.isArray(row.occurrence_ids) && row.occurrence_ids.length === row.row_count, `${row.collision_id}: occurrence_ids must cover row_count`);
  requireTruthy(Array.isArray(row.sample_occurrences) && row.sample_occurrences.length > 0, `${row.collision_id}: sample_occurrences missing`);
  requireEqual(row.row_label, 'observed usage only', `${row.collision_id}: row_label mismatch`);
  requireEqual(row.audit_visibility, 'agent6_audit_only', `${row.collision_id}: audit_visibility mismatch`);
  requireFalse(row.reader_facing, `${row.collision_id}: reader_facing must be false`);
  requireTruthy(row.not_definition_authority, `${row.collision_id}: not_definition_authority must be true`);
  requireFalse(row.route_payload_copied, `${row.collision_id}: route_payload_copied must be false`);
  for (const sample of row.sample_occurrences) {
    requireTruthy(sample.occurrence_id, `${row.collision_id}: sample occurrence_id missing`);
    requireTruthy(sample.source_ref && sample.source_url, `${row.collision_id}: sample source metadata missing`);
    requireTruthy(sample.local_work_anchor && sample.work_id && sample.work_title, `${row.collision_id}: sample work anchor metadata missing`);
    requireTruthy(sample.version_title && sample.version_source, `${row.collision_id}: sample version metadata missing`);
    requireTruthy(sample.license && sample.license_url, `${row.collision_id}: sample license metadata missing`);
    requireEqual(sample.row_label, 'observed usage only', `${row.collision_id}: sample row_label mismatch`);
    requireFalse(sample.reader_facing, `${row.collision_id}: sample reader_facing must be false`);
    requireTruthy(sample.not_definition_authority, `${row.collision_id}: sample not_definition_authority must be true`);
  }
}

requireEqual(counts.reader_facing_rows, 0, 'reader_facing_rows must be 0');
requireEqual(counts.route_payload_field_hits, 0, 'route_payload_field_hits must be 0');
requireEqual(counts.forbidden_authority_field_hits, 0, 'forbidden_authority_field_hits must be 0');
requireEqual(counts.source_text_reads, 0, 'source_text_reads must be 0');
requireEqual(counts.broad_target_expansion, 0, 'broad_target_expansion must be 0');
requireEqual(counts.queue_mutations, 0, 'queue_mutations must be 0');
requireEqual(counts.submitted_to_agent6, 0, 'submitted_to_agent6 must be 0');

for (const check of artifact.checks || []) requireEqual(check.status, 'passed', `check failed: ${check.id}`);

const report = fs.readFileSync(path.join(root, reportPath), 'utf8');
requireTruthy(report.includes('observed usage/navigation collision audit only'), 'report must preserve usage-only boundary');
requireTruthy(report.includes('not Definition authority'), 'report must reject Definition authority');
requireTruthy(report.includes('Duplicate source refs'), 'report must expose source-ref collisions');

if (errors.length) {
  console.error(`Agent 3 collision audit validation failed: ${errors.length} error(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Agent 3 collision audit validation passed: source rows ${counts.source_drilldown_rows}; collision rows ${counts.collision_rows}; source-ref buckets ${counts.duplicate_source_ref_buckets}; route IDs ${counts.route_ids}`);

function expectedCollisionCounts(rows) {
  const specs = {
    source_ref: (row) => row.source_ref,
    local_work_anchor: (row) => row.local_work_anchor,
    phrase_context: (row) => row.phrase_context_snippet,
    work_frame: (row) => `${row.work_id || ''}||${row.usage_frame_label || ''}`,
    source_ref_frame: (row) => `${row.source_ref || ''}||${row.usage_frame_label || ''}`,
    source_ref_license: (row) => `${row.source_ref || ''}||${row.license || ''}`,
  };
  const out = {};
  for (const [type, keyFn] of Object.entries(specs)) {
    const buckets = new Map();
    for (const row of rows) {
      const key = keyFn(row);
      if (!key) continue;
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }
    const duplicate = [...buckets.values()].filter((value) => value > 1);
    const prefix = typeToCountPrefix(type);
    out[`duplicate_${prefix}_buckets`] = duplicate.length;
    out[`duplicate_${prefix}_rows`] = duplicate.reduce((sum, value) => sum + value, 0);
  }
  return out;
}

function typeToCountPrefix(type) {
  if (type === 'local_work_anchor') return 'local_work_anchor';
  if (type === 'phrase_context') return 'phrase_context';
  if (type === 'work_frame') return 'work_frame';
  if (type === 'source_ref_frame') return 'source_ref_frame';
  if (type === 'source_ref_license') return 'source_ref_license';
  return 'source_ref';
}

function hasCompleteMetadata(row) {
  return Boolean(row.occurrence_id && row.source_ref && row.source_url && row.local_work_anchor && row.work_id && row.work_title && row.license && row.license_url && row.version_title && row.version_source);
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

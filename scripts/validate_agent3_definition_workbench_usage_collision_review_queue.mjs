#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'data/definitions/agent3-definition-workbench-usage-collision-review-queue-reshit.json';
const reportPath = process.argv[3] || 'reports/agent3-definition-workbench-usage-collision-review-queue-reshit.md';
const artifact = readJson(artifactPath);
const errors = [];

const sourcePath = artifact.source_artifacts?.collision_audit;
const source = sourcePath ? readJson(sourcePath) : null;
const sourceRows = source?.collision_rows || [];
const reviewRows = artifact.review_queue_rows || [];
const counts = artifact.counts || {};

requireEqual(artifact.schema_version, 1, 'schema_version must be 1');
requireEqual(artifact.artifact_type, 'agent3_definition_workbench_usage_collision_review_queue', 'artifact_type mismatch');
requireEqual(artifact.lane_owner, 'Agent 3', 'lane_owner must be Agent 3');
requireEqual(artifact.status, 'evidence-ready', 'status must be evidence-ready');
requireTruthy(sourcePath, 'source_artifacts.collision_audit missing');
requireTruthy(source, `source artifact missing: ${sourcePath}`);
requireEqual(source?.artifact_type, 'agent3_definition_workbench_usage_focus_collision_audit', 'source artifact type mismatch');
requireTruthy(fs.existsSync(path.join(root, reportPath)), `report missing: ${reportPath}`);

for (const key of ['usage_navigation_only', 'collision_review_queue_only', 'observed_usage_only', 'route_ids_only', 'audit_only']) {
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

const sourceById = new Map(sourceRows.map((row) => [row.collision_id, row]));
requireEqual(counts.source_collision_rows, sourceRows.length, 'source_collision_rows mismatch');
requireEqual(counts.review_queue_rows, reviewRows.length, 'review_queue_rows mismatch');
requirePositive(reviewRows.length, 'review queue rows must be present');

const expectedByType = {};
for (const type of ['source_ref', 'local_work_anchor', 'phrase_context', 'work_frame', 'source_ref_frame', 'source_ref_license']) {
  const expected = sourceRows
    .filter((row) => row.collision_type === type)
    .sort(compareCollisionRows)
    .slice(0, artifact.selection_policy?.max_rows_per_collision_type || 12)
    .map((row) => row.collision_id);
  expectedByType[type] = expected;
  const actual = reviewRows.filter((row) => row.collision_type === type).map((row) => row.source_collision_id);
  requireEqual(actual.join('\n'), expected.join('\n'), `${type}: selected source_collision_ids mismatch`);
}

const typeCountKeys = {
  source_ref: 'source_ref_rows',
  local_work_anchor: 'local_work_anchor_rows',
  phrase_context: 'phrase_context_rows',
  work_frame: 'work_frame_rows',
  source_ref_frame: 'source_ref_frame_rows',
  source_ref_license: 'source_ref_license_rows',
};
for (const [type, key] of Object.entries(typeCountKeys)) {
  requireEqual(counts[key], reviewRows.filter((row) => row.collision_type === type).length, `${key} mismatch`);
  requirePositive(counts[key], `${key} must be positive`);
}

for (const row of reviewRows) {
  const sourceRow = sourceById.get(row.source_collision_id);
  requireTruthy(sourceRow, `${row.review_queue_id}: source collision missing`);
  if (sourceRow) {
    requireEqual(row.collision_type, sourceRow.collision_type, `${row.review_queue_id}: collision_type mismatch`);
    requireEqual(row.collision_key, sourceRow.collision_key, `${row.review_queue_id}: collision_key mismatch`);
    requireEqual(row.row_count, sourceRow.row_count, `${row.review_queue_id}: row_count mismatch`);
    requireEqual(row.source_ref_count, sourceRow.source_ref_count, `${row.review_queue_id}: source_ref_count mismatch`);
    requireEqual(row.work_count, sourceRow.work_count, `${row.review_queue_id}: work_count mismatch`);
    requireEqual(row.usage_frame_count, sourceRow.usage_frame_count, `${row.review_queue_id}: usage_frame_count mismatch`);
    requireEqual(row.license_count, sourceRow.license_count, `${row.review_queue_id}: license_count mismatch`);
  }
  requireTruthy(row.review_queue_id, 'review_queue_id missing');
  requireTruthy(row.review_reason, `${row.review_queue_id}: review_reason missing`);
  requireTruthy(Array.isArray(row.representative_occurrences) && row.representative_occurrences.length > 0, `${row.review_queue_id}: representative_occurrences missing`);
  requireTruthy(Array.isArray(row.related_agent2_route_ids) && row.related_agent2_route_ids.length > 0, `${row.review_queue_id}: related_agent2_route_ids missing`);
  requireEqual(row.row_label, 'observed usage only', `${row.review_queue_id}: row_label mismatch`);
  requireEqual(row.queue_visibility, 'agent6_review_queue_only', `${row.review_queue_id}: queue_visibility mismatch`);
  requireFalse(row.reader_facing, `${row.review_queue_id}: reader_facing must be false`);
  requireTruthy(row.not_definition_authority, `${row.review_queue_id}: not_definition_authority must be true`);
  requireFalse(row.route_payload_copied, `${row.review_queue_id}: route_payload_copied must be false`);
  for (const sample of row.representative_occurrences) {
    requireTruthy(hasCompleteSample(sample), `${row.review_queue_id}: incomplete representative sample`);
    requireEqual(sample.row_label, 'observed usage only', `${row.review_queue_id}: sample row_label mismatch`);
    requireFalse(sample.reader_facing, `${row.review_queue_id}: sample reader_facing must be false`);
    requireTruthy(sample.not_definition_authority, `${row.review_queue_id}: sample not_definition_authority must be true`);
  }
}

const representedOccurrences = new Set(reviewRows.flatMap((row) => row.representative_occurrences.map((occ) => occ.occurrence_id)));
const representedRefs = new Set(reviewRows.flatMap((row) => row.representative_occurrences.map((occ) => occ.source_ref).filter(Boolean)));
const representedWorks = new Set(reviewRows.flatMap((row) => row.representative_occurrences.map((occ) => occ.work_id).filter(Boolean)));
const representedLicenses = new Set(reviewRows.flatMap((row) => row.representative_occurrences.map((occ) => occ.license).filter(Boolean)));
requireEqual(counts.represented_occurrence_links, representedOccurrences.size, 'represented_occurrence_links mismatch');
requireEqual(counts.represented_source_refs, representedRefs.size, 'represented_source_refs mismatch');
requireEqual(counts.represented_works, representedWorks.size, 'represented_works mismatch');
requireEqual(counts.represented_licenses, representedLicenses.size, 'represented_licenses mismatch');
requireEqual(counts.queue_rows_with_route_ids, reviewRows.filter((row) => row.related_agent2_route_ids.length > 0).length, 'queue_rows_with_route_ids mismatch');
requireEqual(counts.queue_rows_with_complete_samples, reviewRows.filter((row) => row.representative_occurrences.every(hasCompleteSample)).length, 'queue_rows_with_complete_samples mismatch');
requireEqual(counts.rows_labeled_observed_usage_only, reviewRows.filter((row) => row.row_label === 'observed usage only').length, 'rows_labeled_observed_usage_only mismatch');
requireEqual(counts.review_only_rows, reviewRows.filter((row) => row.queue_visibility === 'agent6_review_queue_only').length, 'review_only_rows mismatch');

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
requireTruthy(report.includes('observed usage/navigation evidence'), 'report must preserve usage-navigation boundary');
requireTruthy(report.includes('not Definition authority'), 'report must reject Definition authority');
requireTruthy(report.includes('Agent 6 review scaffolding only'), 'report must state Agent 6 review-only role');

if (errors.length) {
  console.error(`Agent 3 collision review queue validation failed: ${errors.length} error(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Agent 3 collision review queue validation passed: review rows ${counts.review_queue_rows}; represented occurrences ${counts.represented_occurrence_links}; route rows ${counts.queue_rows_with_route_ids}`);

function compareCollisionRows(a, b) {
  return b.row_count - a.row_count
    || b.work_count - a.work_count
    || b.source_ref_count - a.source_ref_count
    || a.collision_id.localeCompare(b.collision_id);
}

function hasCompleteSample(sample) {
  return Boolean(sample.occurrence_id && sample.source_ref && sample.source_url && sample.local_work_anchor && sample.work_id && sample.work_title && sample.phrase_context_snippet && sample.version_title && sample.version_source && sample.license && sample.license_url);
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

function requirePositive(value, message) {
  if (!(value > 0)) errors.push(message);
}

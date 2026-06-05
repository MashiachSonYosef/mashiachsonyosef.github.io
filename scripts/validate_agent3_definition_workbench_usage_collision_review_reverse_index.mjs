#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'data/definitions/agent3-definition-workbench-usage-collision-review-reverse-index-reshit.json';
const reportPath = process.argv[3] || 'reports/agent3-definition-workbench-usage-collision-review-reverse-index-reshit.md';
const artifact = readJson(artifactPath);
const errors = [];

const sourcePath = artifact.source_artifacts?.collision_review_queue;
const source = sourcePath ? readJson(sourcePath) : null;
const sourceRows = source?.review_queue_rows || [];
const occurrenceIndex = artifact.occurrence_index || [];
const sourceRefIndex = artifact.source_ref_index || [];
const workIndex = artifact.work_index || [];
const licenseIndex = artifact.license_index || [];
const counts = artifact.counts || {};

requireEqual(artifact.schema_version, 1, 'schema_version must be 1');
requireEqual(artifact.artifact_type, 'agent3_definition_workbench_usage_collision_review_reverse_index', 'artifact_type mismatch');
requireEqual(artifact.lane_owner, 'Agent 3', 'lane_owner must be Agent 3');
requireEqual(artifact.status, 'evidence-ready', 'status must be evidence-ready');
requireTruthy(sourcePath, 'source_artifacts.collision_review_queue missing');
requireTruthy(source, `source artifact missing: ${sourcePath}`);
requireEqual(source?.artifact_type, 'agent3_definition_workbench_usage_collision_review_queue', 'source artifact type mismatch');
requireTruthy(fs.existsSync(path.join(root, reportPath)), `report missing: ${reportPath}`);

for (const key of ['usage_navigation_only', 'collision_review_reverse_index_only', 'observed_usage_only', 'route_ids_only', 'audit_only']) {
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

const expected = buildExpected(sourceRows);
requireEqual(counts.source_review_queue_rows, sourceRows.length, 'source_review_queue_rows mismatch');
requireEqual(counts.occurrence_index_rows, expected.occurrenceRows.length, 'occurrence_index_rows mismatch');
requireEqual(counts.source_ref_index_rows, expected.sourceRefRows.length, 'source_ref_index_rows mismatch');
requireEqual(counts.work_index_rows, expected.workRows.length, 'work_index_rows mismatch');
requireEqual(counts.license_index_rows, expected.licenseRows.length, 'license_index_rows mismatch');
requireEqual(counts.occurrence_queue_links, expected.occurrenceLinks, 'occurrence_queue_links mismatch');
requireEqual(counts.source_ref_queue_links, expected.sourceRefLinks, 'source_ref_queue_links mismatch');
requireEqual(counts.work_queue_links, expected.workLinks, 'work_queue_links mismatch');
requireEqual(counts.license_queue_links, expected.licenseLinks, 'license_queue_links mismatch');
requireEqual(counts.occurrence_rows_with_multiple_queue_links, expected.occurrenceRows.filter((row) => row.queue_row_count > 1).length, 'occurrence multi-link mismatch');
requireEqual(counts.source_refs_with_multiple_queue_links, expected.sourceRefRows.filter((row) => row.queue_link_count > 1).length, 'source-ref multi-link mismatch');
requireEqual(counts.works_with_multiple_queue_links, expected.workRows.filter((row) => row.queue_link_count > 1).length, 'work multi-link mismatch');
requireEqual(counts.licenses_with_multiple_queue_links, expected.licenseRows.filter((row) => row.queue_link_count > 1).length, 'license multi-link mismatch');

requireEqual(JSON.stringify(slimOccurrenceRows(occurrenceIndex)), JSON.stringify(slimOccurrenceRows(expected.occurrenceRows)), 'occurrence_index content mismatch');
requireEqual(JSON.stringify(slimBucketRows(sourceRefIndex, 'source_ref')), JSON.stringify(slimBucketRows(expected.sourceRefRows, 'source_ref')), 'source_ref_index content mismatch');
requireEqual(JSON.stringify(slimBucketRows(workIndex, 'work_id')), JSON.stringify(slimBucketRows(expected.workRows, 'work_id')), 'work_index content mismatch');
requireEqual(JSON.stringify(slimBucketRows(licenseIndex, 'license')), JSON.stringify(slimBucketRows(expected.licenseRows, 'license')), 'license_index content mismatch');

for (const row of occurrenceIndex) {
  requireTruthy(hasCompleteOccurrenceIndexRow(row), `${row.occurrence_id}: incomplete occurrence index metadata`);
  requireEqual(row.row_label, 'observed usage only', `${row.occurrence_id}: row_label mismatch`);
  requireEqual(row.index_visibility, 'agent6_review_navigation_only', `${row.occurrence_id}: index_visibility mismatch`);
  requireFalse(row.reader_facing, `${row.occurrence_id}: reader_facing must be false`);
  requireTruthy(row.not_definition_authority, `${row.occurrence_id}: not_definition_authority must be true`);
  requireTruthy(Array.isArray(row.related_agent2_route_ids) && row.related_agent2_route_ids.length > 0, `${row.occurrence_id}: route IDs missing`);
  for (const link of row.queue_links || []) {
    requireEqual(link.row_label, 'observed usage only', `${row.occurrence_id}: queue link row_label mismatch`);
    requireFalse(link.reader_facing, `${row.occurrence_id}: queue link reader_facing must be false`);
    requireTruthy(link.not_definition_authority, `${row.occurrence_id}: queue link not_definition_authority must be true`);
  }
}

for (const row of [...sourceRefIndex, ...workIndex, ...licenseIndex]) {
  requireEqual(row.row_label, 'observed usage only', 'bucket row_label mismatch');
  requireEqual(row.index_visibility, 'agent6_review_navigation_only', 'bucket index_visibility mismatch');
  requireFalse(row.reader_facing, 'bucket reader_facing must be false');
  requireTruthy(row.not_definition_authority, 'bucket not_definition_authority must be true');
  requireTruthy(Array.isArray(row.related_agent2_route_ids) && row.related_agent2_route_ids.length > 0, 'bucket route IDs missing');
}

requireEqual(counts.rows_with_complete_occurrence_metadata, occurrenceIndex.filter(hasCompleteOccurrenceIndexRow).length, 'rows_with_complete_occurrence_metadata mismatch');
requireEqual(counts.rows_labeled_observed_usage_only, occurrenceIndex.filter((row) => row.row_label === 'observed usage only').length, 'rows_labeled_observed_usage_only mismatch');
requireEqual(counts.review_navigation_only_rows, occurrenceIndex.filter((row) => row.index_visibility === 'agent6_review_navigation_only').length, 'review_navigation_only_rows mismatch');
requireEqual(counts.route_id_rows, occurrenceIndex.filter((row) => row.related_agent2_route_ids.length > 0).length, 'route_id_rows mismatch');

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
requireTruthy(report.includes('reverse-index navigation only'), 'report must preserve reverse-index boundary');
requireTruthy(report.includes('not Definition authority'), 'report must reject Definition authority');
requireTruthy(report.includes('route payloads'), 'report must reject route payload copying');

if (errors.length) {
  console.error(`Agent 3 collision review reverse index validation failed: ${errors.length} error(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Agent 3 collision review reverse index validation passed: occurrence rows ${counts.occurrence_index_rows}; source refs ${counts.source_ref_index_rows}; works ${counts.work_index_rows}; links ${counts.occurrence_queue_links}`);

function buildExpected(reviewRows) {
  const occurrenceMap = new Map();
  const sourceRefMap = new Map();
  const workMap = new Map();
  const licenseMap = new Map();
  for (const row of reviewRows) {
    for (const occurrence of row.representative_occurrences || []) {
      const entry = {
        review_queue_id: row.review_queue_id,
        source_collision_id: row.source_collision_id,
        collision_type: row.collision_type,
        occurrence_id: occurrence.occurrence_id,
        source_ref: occurrence.source_ref,
        work_id: occurrence.work_id,
        license: occurrence.license,
        related_agent2_route_ids: occurrence.related_agent2_route_ids || row.related_agent2_route_ids || [],
      };
      addUnique(occurrenceMap, occurrence.occurrence_id, entry, (item) => `${item.review_queue_id}|${item.source_collision_id}`);
      addUnique(sourceRefMap, occurrence.source_ref, entry, (item) => `${item.review_queue_id}|${item.occurrence_id}`);
      addUnique(workMap, occurrence.work_id, entry, (item) => `${item.review_queue_id}|${item.occurrence_id}`);
      addUnique(licenseMap, occurrence.license, entry, (item) => `${item.review_queue_id}|${item.occurrence_id}`);
    }
  }
  const occurrenceRows = [...occurrenceMap.entries()].map(([occurrence_id, rows]) => ({
    occurrence_id,
    queue_row_count: rows.length,
    review_queue_ids: sortedUnique(rows.map((row) => row.review_queue_id)),
    collision_types: sortedUnique(rows.map((row) => row.collision_type)),
    related_agent2_route_ids: sortedUnique(rows.flatMap((row) => row.related_agent2_route_ids)),
  })).sort((a, b) => b.queue_row_count - a.queue_row_count || a.occurrence_id.localeCompare(b.occurrence_id));
  const sourceRefRows = bucketRows(sourceRefMap, 'source_ref');
  const workRows = bucketRows(workMap, 'work_id');
  const licenseRows = bucketRows(licenseMap, 'license');
  return {
    occurrenceRows,
    sourceRefRows,
    workRows,
    licenseRows,
    occurrenceLinks: occurrenceRows.reduce((sum, row) => sum + row.queue_row_count, 0),
    sourceRefLinks: sourceRefRows.reduce((sum, row) => sum + row.queue_link_count, 0),
    workLinks: workRows.reduce((sum, row) => sum + row.queue_link_count, 0),
    licenseLinks: licenseRows.reduce((sum, row) => sum + row.queue_link_count, 0),
  };
}

function bucketRows(map, keyName) {
  return [...map.entries()].map(([key, rows]) => ({
    [keyName]: key,
    queue_link_count: rows.length,
    occurrence_count: new Set(rows.map((row) => row.occurrence_id)).size,
    review_queue_ids: sortedUnique(rows.map((row) => row.review_queue_id)),
    collision_types: sortedUnique(rows.map((row) => row.collision_type)),
    related_agent2_route_ids: sortedUnique(rows.flatMap((row) => row.related_agent2_route_ids || [])),
  })).sort((a, b) => b.queue_link_count - a.queue_link_count || String(a[keyName]).localeCompare(String(b[keyName])));
}

function slimOccurrenceRows(rows) {
  return rows.map((row) => ({
    occurrence_id: row.occurrence_id,
    queue_row_count: row.queue_row_count,
    review_queue_ids: row.review_queue_ids,
    collision_types: row.collision_types,
    related_agent2_route_ids: row.related_agent2_route_ids,
  }));
}

function slimBucketRows(rows, keyName) {
  return rows.map((row) => ({
    [keyName]: row[keyName],
    queue_link_count: row.queue_link_count,
    occurrence_count: row.occurrence_count,
    review_queue_ids: row.review_queue_ids,
    collision_types: row.collision_types,
    related_agent2_route_ids: row.related_agent2_route_ids,
  }));
}

function addUnique(map, key, value, idFn) {
  if (!key) return;
  if (!map.has(key)) map.set(key, []);
  const list = map.get(key);
  const id = idFn(value);
  if (!list.some((item) => idFn(item) === id)) list.push(value);
}

function sortedUnique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function hasCompleteOccurrenceIndexRow(row) {
  return Boolean(row.occurrence_id && row.source_ref && row.source_url && row.local_work_anchor && row.work_id && row.work_title && row.phrase_context_snippet && row.version_title && row.version_source && row.license && row.license_url);
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

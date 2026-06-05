#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'data/definitions/agent3-definition-workbench-usage-collision-provenance-index-reshit.json';
const reportPath = process.argv[3] || 'reports/agent3-definition-workbench-usage-collision-provenance-index-reshit.md';
const artifact = readJson(artifactPath);
const errors = [];

const sourcePath = artifact.source_artifacts?.collision_review_reverse_index;
const source = sourcePath ? readJson(sourcePath) : null;
const sourceRows = source?.occurrence_index || [];
const counts = artifact.counts || {};

requireEqual(artifact.schema_version, 1, 'schema_version must be 1');
requireEqual(artifact.artifact_type, 'agent3_definition_workbench_usage_collision_provenance_index', 'artifact_type mismatch');
requireEqual(artifact.lane_owner, 'Agent 3', 'lane_owner must be Agent 3');
requireEqual(artifact.status, 'evidence-ready', 'status must be evidence-ready');
requireEqual(artifact.target_gate, 'definition_workbench_gate', 'target_gate mismatch');
requireTruthy(sourcePath, 'source artifact path missing');
requireTruthy(source, `source artifact missing: ${sourcePath}`);
requireEqual(source?.artifact_type, 'agent3_definition_workbench_usage_collision_review_reverse_index', 'source type mismatch');
requireTruthy(fs.existsSync(path.join(root, reportPath)), `report missing: ${reportPath}`);

for (const key of ['usage_navigation_only', 'provenance_index_only', 'observed_usage_only', 'route_ids_only', 'audit_only']) {
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
requireEqual(counts.source_occurrence_rows, sourceRows.length, 'source_occurrence_rows mismatch');
requireEqual(counts.license_index_rows, expected.licenseIndex.length, 'license_index_rows mismatch');
requireEqual(counts.version_source_index_rows, expected.versionSourceIndex.length, 'version_source_index_rows mismatch');
requireEqual(counts.version_title_index_rows, expected.versionTitleIndex.length, 'version_title_index_rows mismatch');
requireEqual(counts.work_license_index_rows, expected.workLicenseIndex.length, 'work_license_index_rows mismatch');
requireEqual(counts.occurrence_queue_links, expected.occurrenceQueueLinks, 'occurrence_queue_links mismatch');
requireEqual(counts.license_queue_links, expected.licenseQueueLinks, 'license_queue_links mismatch');
requireEqual(counts.version_source_queue_links, expected.versionSourceQueueLinks, 'version_source_queue_links mismatch');
requireEqual(counts.version_title_queue_links, expected.versionTitleQueueLinks, 'version_title_queue_links mismatch');
requireEqual(counts.work_license_queue_links, expected.workLicenseQueueLinks, 'work_license_queue_links mismatch');
requireEqual(counts.licenses_with_multiple_works, expected.licenseIndex.filter((row) => row.work_count > 1).length, 'licenses_with_multiple_works mismatch');
requireEqual(counts.version_sources_with_multiple_works, expected.versionSourceIndex.filter((row) => row.work_count > 1).length, 'version_sources_with_multiple_works mismatch');
requireEqual(counts.works_with_multiple_licenses, expected.worksWithMultipleLicenses, 'works_with_multiple_licenses mismatch');
requireEqual(counts.rows_with_complete_provenance, sourceRows.filter(hasCompleteProvenance).length, 'rows_with_complete_provenance mismatch');
requireEqual(counts.rows_labeled_observed_usage_only, sourceRows.filter((row) => row.row_label === 'observed usage only').length, 'rows_labeled_observed_usage_only mismatch');
requireEqual(counts.route_id_rows, sourceRows.filter((row) => row.related_agent2_route_ids?.length).length, 'route_id_rows mismatch');

requireEqual(JSON.stringify(slimRows(artifact.license_index, 'license')), JSON.stringify(slimRows(expected.licenseIndex, 'license')), 'license_index mismatch');
requireEqual(JSON.stringify(slimRows(artifact.version_source_index, 'version_source')), JSON.stringify(slimRows(expected.versionSourceIndex, 'version_source')), 'version_source_index mismatch');
requireEqual(JSON.stringify(slimRows(artifact.version_title_index, 'version_title')), JSON.stringify(slimRows(expected.versionTitleIndex, 'version_title')), 'version_title_index mismatch');
requireEqual(JSON.stringify(slimRows(artifact.work_license_index, 'work_license')), JSON.stringify(slimRows(expected.workLicenseIndex, 'work_license')), 'work_license_index mismatch');

for (const row of [
  ...(artifact.license_index || []),
  ...(artifact.version_source_index || []),
  ...(artifact.version_title_index || []),
  ...(artifact.work_license_index || []),
]) {
  requireEqual(row.row_label, 'observed usage only', 'index row_label mismatch');
  requireEqual(row.index_visibility, 'agent6_provenance_navigation_only', 'index visibility mismatch');
  requireFalse(row.reader_facing, 'index reader_facing must be false');
  requireTruthy(row.not_definition_authority, 'index not_definition_authority must be true');
  requireTruthy(Array.isArray(row.related_agent2_route_ids) && row.related_agent2_route_ids.length > 0, 'route IDs missing');
  for (const sample of row.sample_occurrences || []) {
    requireTruthy(hasCompleteSample(sample), 'sample missing provenance metadata');
    requireEqual(sample.row_label, 'observed usage only', 'sample row_label mismatch');
    requireFalse(sample.reader_facing, 'sample reader_facing must be false');
    requireTruthy(sample.not_definition_authority, 'sample not_definition_authority must be true');
  }
}

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
requireTruthy(report.includes('provenance/navigation index only'), 'report must preserve provenance boundary');
requireTruthy(report.includes('not Definition authority'), 'report must reject Definition authority');
requireTruthy(report.includes('does not mutate queues'), 'report must reject queue mutation');

if (errors.length) {
  console.error(`Agent 3 collision provenance index validation failed: ${errors.length} error(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Agent 3 collision provenance index validation passed: licenses ${counts.license_index_rows}; version sources ${counts.version_source_index_rows}; work-license rows ${counts.work_license_index_rows}`);

function buildExpected(rows) {
  const licenseIndex = buildIndex(rows, (row) => row.license, 'license');
  const versionSourceIndex = buildIndex(rows, (row) => row.version_source, 'version_source');
  const versionTitleIndex = buildIndex(rows, (row) => row.version_title, 'version_title');
  const workLicenseIndex = buildIndex(rows, (row) => `${row.work_id || ''}||${row.license || ''}`, 'work_license');
  return {
    licenseIndex,
    versionSourceIndex,
    versionTitleIndex,
    workLicenseIndex,
    occurrenceQueueLinks: rows.reduce((sum, row) => sum + row.queue_row_count, 0),
    licenseQueueLinks: licenseIndex.reduce((sum, row) => sum + row.queue_link_count, 0),
    versionSourceQueueLinks: versionSourceIndex.reduce((sum, row) => sum + row.queue_link_count, 0),
    versionTitleQueueLinks: versionTitleIndex.reduce((sum, row) => sum + row.queue_link_count, 0),
    workLicenseQueueLinks: workLicenseIndex.reduce((sum, row) => sum + row.queue_link_count, 0),
    worksWithMultipleLicenses: countWorksWithMultipleLicenses(workLicenseIndex),
  };
}

function buildIndex(rows, keyFn, keyName) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return [...map.entries()].map(([key, bucketRows]) => ({
    [keyName]: key,
    occurrence_count: bucketRows.length,
    queue_link_count: bucketRows.reduce((sum, row) => sum + row.queue_row_count, 0),
    source_ref_count: new Set(bucketRows.map((row) => row.source_ref).filter(Boolean)).size,
    work_count: new Set(bucketRows.map((row) => row.work_id).filter(Boolean)).size,
    license_count: new Set(bucketRows.map((row) => row.license).filter(Boolean)).size,
    version_source_count: new Set(bucketRows.map((row) => row.version_source).filter(Boolean)).size,
    version_title_count: new Set(bucketRows.map((row) => row.version_title).filter(Boolean)).size,
    review_queue_ids: sortedUnique(bucketRows.flatMap((row) => row.review_queue_ids || [])),
    collision_types: sortedUnique(bucketRows.flatMap((row) => row.collision_types || [])),
    related_agent2_route_ids: sortedUnique(bucketRows.flatMap((row) => row.related_agent2_route_ids || [])),
  })).sort((a, b) => b.queue_link_count - a.queue_link_count || String(a[keyName]).localeCompare(String(b[keyName])));
}

function slimRows(rows, keyName) {
  return (rows || []).map((row) => ({
    [keyName]: row[keyName],
    occurrence_count: row.occurrence_count,
    queue_link_count: row.queue_link_count,
    source_ref_count: row.source_ref_count,
    work_count: row.work_count,
    license_count: row.license_count,
    version_source_count: row.version_source_count,
    version_title_count: row.version_title_count,
    review_queue_ids: row.review_queue_ids,
    collision_types: row.collision_types,
    related_agent2_route_ids: row.related_agent2_route_ids,
  }));
}

function countWorksWithMultipleLicenses(indexRows) {
  const map = new Map();
  for (const row of indexRows) {
    const [workId, license] = String(row.work_license || '').split('||');
    if (!workId || !license) continue;
    if (!map.has(workId)) map.set(workId, new Set());
    map.get(workId).add(license);
  }
  return [...map.values()].filter((licenses) => licenses.size > 1).length;
}

function hasCompleteProvenance(row) {
  return Boolean(row.occurrence_id && row.source_ref && row.source_url && row.local_work_anchor && row.work_id && row.work_title && row.license && row.license_url && row.version_title && row.version_source);
}

function hasCompleteSample(sample) {
  return Boolean(sample.occurrence_id && sample.source_ref && sample.source_url && sample.local_work_anchor && sample.work_id && sample.work_title && sample.license && sample.license_url && sample.version_title && sample.version_source);
}

function sortedUnique(values) {
  return [...new Set(values.filter(Boolean))].sort();
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

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-source-ref-buckets.json');
const packet = readJson(packetPath);
const issues = [];
const forbiddenAuthorityKeys = new Set([
  'definition',
  'definition_text',
  'meaning',
  'meaning_claim',
  'translation',
  'translation_text',
  'accepted_translation',
  'final_answer',
  'winner',
  'route_payload',
  'route_payloads',
]);
const allowedStatuses = new Set(['supported', 'candidate', 'weak']);

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'definition_workbench_usage_source_ref_buckets') {
  issues.push('artifact_type must be definition_workbench_usage_source_ref_buckets');
}
if (!String(packet.policy || '').includes('source-ref bucket packet')) {
  issues.push('policy must identify source-ref bucket packet');
}

validateAuthorityPolicy(packet.authority_policy || {});
validateInputs(packet.inputs || {});
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateSourceBuckets(Array.isArray(packet.source_ref_buckets) ? packet.source_ref_buckets : []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage source-ref buckets validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 160)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Definition Workbench usage source-ref buckets validation passed.');
console.log(`Source refs: ${packet.counts.source_ref_buckets}; source/cluster buckets: ${packet.counts.source_cluster_buckets}; duplicate rows: ${packet.counts.duplicate_source_ref_rows}.`);

function validateAuthorityPolicy(policy) {
  const expectedTrue = [
    'usage_navigation_only',
    'observed_usage_only',
    'source_ref_bucket_navigation_only',
    'occurrence_links_only',
    'route_ids_only',
  ];
  const expectedFalse = [
    'reader_facing',
    'copies_route_payloads',
    'copies_definition_payloads',
    'ranks_routes',
    'selects_visible_result',
    'semantic_arbitration',
    'publication_claim',
  ];
  for (const key of expectedTrue) {
    if (policy[key] !== true) issues.push(`authority_policy.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (policy[key] !== false) issues.push(`authority_policy.${key} must be false`);
  }
}

function validateInputs(inputs) {
  for (const [key, value] of Object.entries(inputs)) {
    if (!value || !fs.existsSync(path.join(root, cleanRelativePath(value)))) {
      issues.push(`inputs.${key} must point to an existing local artifact`);
    }
  }
}

function validateCounts(counts) {
  const required = [
    'source_ref_buckets',
    'source_cluster_buckets',
    'occurrence_rows',
    'duplicate_source_ref_buckets',
    'duplicate_source_ref_rows',
    'cross_cluster_source_ref_buckets',
    'cross_cluster_source_ref_rows',
    'route_ids',
    'unresolved_route_ids',
    'unique_works',
    'unique_licenses',
    'unique_version_sources',
    'rows_with_source_link',
    'rows_with_provenance',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'observed_usage_only_source_buckets',
    'observed_usage_only_source_cluster_buckets',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.source_ref_buckets <= 0) issues.push('source_ref_buckets must be positive');
  if (counts.source_cluster_buckets < counts.source_ref_buckets) {
    issues.push('source_cluster_buckets must be at least source_ref_buckets');
  }
  if (counts.occurrence_rows <= 0) issues.push('occurrence_rows must be positive');
  if (counts.duplicate_source_ref_buckets <= 0) issues.push('duplicate_source_ref_buckets must be positive for current selected packet');
  if (counts.duplicate_source_ref_rows <= counts.duplicate_source_ref_buckets) {
    issues.push('duplicate_source_ref_rows must exceed duplicate_source_ref_buckets');
  }
  if (counts.cross_cluster_source_ref_buckets <= 0) issues.push('cross_cluster_source_ref_buckets must be positive');
  if (counts.cross_cluster_source_ref_rows <= 0) issues.push('cross_cluster_source_ref_rows must be positive');
  if (counts.rows_with_source_link !== counts.source_ref_buckets) issues.push('source bucket links must be complete');
  if (counts.rows_with_provenance !== counts.occurrence_rows) issues.push('occurrence provenance must be complete');
  if (counts.rows_with_hebrew_context !== counts.occurrence_rows) issues.push('Hebrew context must be complete');
  if (counts.rows_with_focus_marker !== counts.occurrence_rows) issues.push('focus markers must be complete');
  if (counts.route_ids <= 0) issues.push('route_ids must be positive');
  if (counts.unresolved_route_ids !== 0) issues.push('unresolved_route_ids must be 0');
  if (counts.observed_usage_only_source_buckets !== counts.source_ref_buckets) {
    issues.push('all source buckets must be observed usage only');
  }
  if (counts.observed_usage_only_source_cluster_buckets !== counts.source_cluster_buckets) {
    issues.push('all source/cluster buckets must be observed usage only');
  }
  if (counts.reader_facing_rows !== 0) issues.push('reader_facing_rows must be 0');
  if (counts.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must be 0');
  if (sumCounts(counts.status_counts) !== counts.occurrence_rows) {
    issues.push('status_counts must sum to occurrence_rows');
  }
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
}

function validateSourceBuckets(buckets) {
  if (!buckets.length) issues.push('source_ref_buckets must be non-empty');
  if (buckets.length !== packet.counts.source_ref_buckets) issues.push('source_ref_buckets length must equal count');
  let sourceClusterCount = 0;
  let occurrenceCount = 0;
  let duplicateBuckets = 0;
  let duplicateRows = 0;
  let crossClusterBuckets = 0;
  let crossClusterRows = 0;
  for (const [index, bucket] of buckets.entries()) {
    const context = `source_ref_buckets[${index}]`;
    requireFields(bucket, [
      'source_ref',
      'source_href',
      'work_anchor_href',
      'work_title',
      'work_slug',
      'row_count',
      'duplicate_source_ref',
      'status_counts',
      'cluster_ids',
      'usage_frame_labels',
      'route_ids',
      'unresolved_route_ids',
      'provenance_rows',
      'source_cluster_buckets',
      'usage_boundary',
    ], context);
    if (!Number.isInteger(bucket.row_count) || bucket.row_count <= 0) issues.push(`${context}: row_count must be positive`);
    if (!Array.isArray(bucket.cluster_ids) || bucket.cluster_ids.length === 0) issues.push(`${context}: cluster_ids must be non-empty`);
    if (!Array.isArray(bucket.usage_frame_labels) || bucket.usage_frame_labels.length === 0) issues.push(`${context}: usage_frame_labels must be non-empty`);
    if (!Array.isArray(bucket.route_ids) || bucket.route_ids.length === 0) issues.push(`${context}: route_ids must be non-empty`);
    if (Array.isArray(bucket.unresolved_route_ids) && bucket.unresolved_route_ids.length !== 0) issues.push(`${context}: unresolved_route_ids must be empty`);
    if (!Array.isArray(bucket.provenance_rows) || bucket.provenance_rows.length === 0) issues.push(`${context}: provenance_rows must be non-empty`);
    if (bucket.duplicate_source_ref === true) {
      duplicateBuckets += 1;
      duplicateRows += bucket.row_count;
    }
    if (bucket.cluster_ids.length > 1) {
      crossClusterBuckets += 1;
      crossClusterRows += bucket.row_count;
    }
    validateUsageBoundary(`${context}.usage_boundary`, bucket.usage_boundary || {});
    const clusterBuckets = Array.isArray(bucket.source_cluster_buckets) ? bucket.source_cluster_buckets : [];
    if (!clusterBuckets.length) issues.push(`${context}: source_cluster_buckets must be non-empty`);
    sourceClusterCount += clusterBuckets.length;
    let bucketOccurrenceCount = 0;
    for (const [clusterIndex, clusterBucket] of clusterBuckets.entries()) {
      const clusterContext = `${context}.source_cluster_buckets[${clusterIndex}]`;
      bucketOccurrenceCount += validateSourceClusterBucket(clusterContext, clusterBucket, bucket.source_ref);
    }
    if (bucketOccurrenceCount !== bucket.row_count) {
      issues.push(`${context}: source_cluster occurrence rows must sum to row_count`);
    }
    occurrenceCount += bucketOccurrenceCount;
    if (sumCounts(bucket.status_counts) !== bucket.row_count) {
      issues.push(`${context}: status_counts must sum to row_count`);
    }
  }
  if (sourceClusterCount !== packet.counts.source_cluster_buckets) issues.push('source_cluster bucket count mismatch');
  if (occurrenceCount !== packet.counts.occurrence_rows) issues.push('occurrence row count mismatch');
  if (duplicateBuckets !== packet.counts.duplicate_source_ref_buckets) issues.push('duplicate source-ref bucket count mismatch');
  if (duplicateRows !== packet.counts.duplicate_source_ref_rows) issues.push('duplicate source-ref row count mismatch');
  if (crossClusterBuckets !== packet.counts.cross_cluster_source_ref_buckets) issues.push('cross-cluster source-ref bucket count mismatch');
  if (crossClusterRows !== packet.counts.cross_cluster_source_ref_rows) issues.push('cross-cluster source-ref row count mismatch');
}

function validateSourceClusterBucket(context, clusterBucket, sourceRef) {
  requireFields(clusterBucket, [
    'source_cluster_key',
    'source_ref',
    'cluster_id',
    'usage_frame_label',
    'row_count',
    'status_counts',
    'route_ids',
    'unresolved_route_ids',
    'max_raw_score',
    'occurrence_rows',
    'usage_boundary',
  ], context);
  if (clusterBucket.source_ref !== sourceRef) issues.push(`${context}: source_ref must match parent bucket`);
  if (!Number.isInteger(clusterBucket.row_count) || clusterBucket.row_count <= 0) issues.push(`${context}: row_count must be positive`);
  if (!Array.isArray(clusterBucket.route_ids) || clusterBucket.route_ids.length === 0) issues.push(`${context}: route_ids must be non-empty`);
  if (Array.isArray(clusterBucket.unresolved_route_ids) && clusterBucket.unresolved_route_ids.length !== 0) {
    issues.push(`${context}: unresolved_route_ids must be empty`);
  }
  validateUsageBoundary(`${context}.usage_boundary`, clusterBucket.usage_boundary || {});
  const rows = Array.isArray(clusterBucket.occurrence_rows) ? clusterBucket.occurrence_rows : [];
  if (rows.length !== clusterBucket.row_count) issues.push(`${context}: occurrence_rows length must equal row_count`);
  for (const [rowIndex, row] of rows.entries()) validateOccurrenceRow(`${context}.occurrence_rows[${rowIndex}]`, row, sourceRef, clusterBucket.cluster_id);
  if (sumCounts(clusterBucket.status_counts) !== clusterBucket.row_count) {
    issues.push(`${context}: status_counts must sum to row_count`);
  }
  return rows.length;
}

function validateOccurrenceRow(context, row, sourceRef, clusterId) {
  requireFields(row, [
    'row_id',
    'occurrence_id',
    'token_key',
    'token_surface',
    'token_normalized',
    'focus_surface',
    'focus_normalized',
    'status',
    'raw_score',
    'cluster_id',
    'usage_frame_label',
    'context_focus_marked',
    'related_route_ids',
    'provenance_id',
    'version_title',
    'version_source',
    'license',
    'license_url',
  ], context);
  if (row.cluster_id !== clusterId) issues.push(`${context}: cluster_id must match parent source_cluster bucket`);
  if (!allowedStatuses.has(row.status)) issues.push(`${context}: invalid status ${row.status}`);
  if (!Array.isArray(row.related_route_ids) || row.related_route_ids.length === 0) issues.push(`${context}: related_route_ids must be non-empty`);
  if (!hasHebrew(row.context_focus_marked)) issues.push(`${context}: context_focus_marked must include Hebrew`);
  if (!hasFocusMarker(row.context_focus_marked)) issues.push(`${context}: context_focus_marked must mark focus token`);
  if (!sourceRef) issues.push(`${context}: parent source_ref is missing`);
}

function validateUsageBoundary(context, boundary) {
  const expectedTrue = [
    'observed_usage_only',
    'route_ids_only',
    'source_ref_bucket_navigation_only',
    'not_answer_authority',
    'not_definition_authority',
    'not_semantic_arbitration',
  ];
  for (const key of expectedTrue) {
    if (boundary[key] !== true) issues.push(`${context}.${key} must be true`);
  }
  if (boundary.reader_facing !== false) issues.push(`${context}.reader_facing must be false`);
}

function validateForbiddenAuthorityKeys(value) {
  const hits = [];
  walk(value, '$');
  if (hits.length) issues.push(`forbidden authority keys present: ${hits.slice(0, 60).join(', ')}`);

  function walk(node, nodePath) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const [index, item] of node.entries()) walk(item, `${nodePath}[${index}]`);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (forbiddenAuthorityKeys.has(key)) hits.push(`${nodePath}.${key}`);
      walk(child, `${nodePath}.${key}`);
    }
  }
}

function requireFields(row, fields, context) {
  for (const field of fields) {
    if (row?.[field] === undefined || row?.[field] === null || row?.[field] === '') {
      issues.push(`${context}: missing ${field}`);
    }
  }
}

function sumCounts(value) {
  return Object.values(value || {}).reduce((sum, count) => sum + Number(count || 0), 0);
}

function hasHebrew(value) {
  return /[\u0590-\u05ff]/.test(String(value || ''));
}

function hasFocusMarker(value) {
  return /\[[^\]]*[\u0590-\u05ff][^\]]*\]/.test(String(value || ''));
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(stripJsonBom(fs.readFileSync(path.join(root, relativePath), 'utf8')));
}

function stripJsonBom(text) {
  return text.replace(/^\uFEFF/, '');
}

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-provenance-buckets.json');
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
if (packet.artifact_type !== 'definition_workbench_usage_provenance_buckets') {
  issues.push('artifact_type must be definition_workbench_usage_provenance_buckets');
}
if (!String(packet.policy || '').includes('provenance-bucket packet')) {
  issues.push('policy must identify provenance-bucket packet');
}

validateAuthorityPolicy(packet.authority_policy || {});
validateInputs(packet.inputs || {});
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateProvenanceBuckets(Array.isArray(packet.provenance_buckets) ? packet.provenance_buckets : []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage provenance buckets validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 180)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Definition Workbench usage provenance buckets validation passed.');
console.log(`Provenance buckets: ${packet.counts.provenance_buckets}; provenance/frame buckets: ${packet.counts.provenance_frame_buckets}; occurrence rows: ${packet.counts.occurrence_rows}.`);

function validateAuthorityPolicy(policy) {
  const expectedTrue = [
    'usage_navigation_only',
    'observed_usage_only',
    'provenance_bucket_navigation_only',
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
    'provenance_buckets',
    'provenance_frame_buckets',
    'occurrence_rows',
    'work_count',
    'source_ref_count',
    'license_count',
    'version_source_count',
    'multi_work_provenance_buckets',
    'multi_work_provenance_rows',
    'multi_frame_provenance_buckets',
    'multi_frame_provenance_rows',
    'route_ids',
    'unresolved_route_ids',
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_provenance',
    'rows_with_license_metadata',
    'rows_with_version_metadata',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'observed_usage_only_provenance_buckets',
    'observed_usage_only_provenance_frame_buckets',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.provenance_buckets <= 0) issues.push('provenance_buckets must be positive');
  if (counts.provenance_frame_buckets < counts.provenance_buckets) {
    issues.push('provenance_frame_buckets must be at least provenance_buckets');
  }
  if (counts.occurrence_rows <= 0) issues.push('occurrence_rows must be positive');
  if (counts.work_count <= 0) issues.push('work_count must be positive');
  if (counts.source_ref_count <= 0) issues.push('source_ref_count must be positive');
  if (counts.license_count <= 1) issues.push('license_count must show more than one license in current packet');
  if (counts.version_source_count <= 1) issues.push('version_source_count must show more than one version source in current packet');
  if (counts.multi_work_provenance_buckets <= 0) issues.push('multi_work_provenance_buckets must be positive');
  if (counts.multi_work_provenance_rows <= counts.multi_work_provenance_buckets) {
    issues.push('multi_work_provenance_rows must exceed multi-work buckets');
  }
  if (counts.multi_frame_provenance_buckets <= 0) issues.push('multi_frame_provenance_buckets must be positive');
  if (counts.multi_frame_provenance_rows <= counts.multi_frame_provenance_buckets) {
    issues.push('multi_frame_provenance_rows must exceed multi-frame buckets');
  }
  if (counts.rows_with_source_link !== counts.occurrence_rows) issues.push('source links must be complete');
  if (counts.rows_with_work_anchor !== counts.occurrence_rows) issues.push('work anchors must be complete');
  if (counts.rows_with_provenance !== counts.occurrence_rows) issues.push('occurrence provenance must be complete');
  if (counts.rows_with_license_metadata !== counts.occurrence_rows) issues.push('license metadata must be complete');
  if (counts.rows_with_version_metadata !== counts.occurrence_rows) issues.push('version metadata must be complete');
  if (counts.rows_with_hebrew_context !== counts.occurrence_rows) issues.push('Hebrew context must be complete');
  if (counts.rows_with_focus_marker !== counts.occurrence_rows) issues.push('focus markers must be complete');
  if (counts.route_ids <= 0) issues.push('route_ids must be positive');
  if (counts.unresolved_route_ids !== 0) issues.push('unresolved_route_ids must be 0');
  if (counts.observed_usage_only_provenance_buckets !== counts.provenance_buckets) {
    issues.push('all provenance buckets must be observed usage only');
  }
  if (counts.observed_usage_only_provenance_frame_buckets !== counts.provenance_frame_buckets) {
    issues.push('all provenance/frame buckets must be observed usage only');
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

function validateProvenanceBuckets(buckets) {
  if (!buckets.length) issues.push('provenance_buckets must be non-empty');
  if (buckets.length !== packet.counts.provenance_buckets) issues.push('provenance_buckets length must equal count');
  let provenanceFrameCount = 0;
  let occurrenceCount = 0;
  let multiWorkBuckets = 0;
  let multiWorkRows = 0;
  let multiFrameBuckets = 0;
  let multiFrameRows = 0;
  for (const [index, bucket] of buckets.entries()) {
    const context = `provenance_buckets[${index}]`;
    requireFields(bucket, [
      'provenance_key',
      'provenance_id',
      'version_title',
      'version_source',
      'license',
      'license_url',
      'row_count',
      'work_count',
      'source_ref_count',
      'multi_work_provenance',
      'multi_frame_provenance',
      'status_counts',
      'work_slugs',
      'source_refs',
      'source_hrefs',
      'work_anchor_hrefs',
      'cluster_ids',
      'usage_frame_labels',
      'route_ids',
      'unresolved_route_ids',
      'provenance_frame_buckets',
      'usage_boundary',
    ], context);
    if (!Number.isInteger(bucket.row_count) || bucket.row_count <= 0) issues.push(`${context}: row_count must be positive`);
    if (!Number.isInteger(bucket.work_count) || bucket.work_count <= 0) issues.push(`${context}: work_count must be positive`);
    if (!Number.isInteger(bucket.source_ref_count) || bucket.source_ref_count <= 0) issues.push(`${context}: source_ref_count must be positive`);
    if (!Array.isArray(bucket.work_slugs) || bucket.work_slugs.length !== bucket.work_count) {
      issues.push(`${context}: work_slugs length must equal work_count`);
    }
    if (!Array.isArray(bucket.source_refs) || bucket.source_refs.length !== bucket.source_ref_count) {
      issues.push(`${context}: source_refs length must equal source_ref_count`);
    }
    if (!Array.isArray(bucket.route_ids) || bucket.route_ids.length === 0) issues.push(`${context}: route_ids must be non-empty`);
    if (Array.isArray(bucket.unresolved_route_ids) && bucket.unresolved_route_ids.length !== 0) issues.push(`${context}: unresolved_route_ids must be empty`);
    if (bucket.multi_work_provenance === true) {
      multiWorkBuckets += 1;
      multiWorkRows += bucket.row_count;
    }
    if (bucket.multi_frame_provenance === true) {
      multiFrameBuckets += 1;
      multiFrameRows += bucket.row_count;
    }
    validateUsageBoundary(`${context}.usage_boundary`, bucket.usage_boundary || {});
    const frameBuckets = Array.isArray(bucket.provenance_frame_buckets) ? bucket.provenance_frame_buckets : [];
    if (!frameBuckets.length) issues.push(`${context}: provenance_frame_buckets must be non-empty`);
    provenanceFrameCount += frameBuckets.length;
    let bucketOccurrenceCount = 0;
    for (const [frameIndex, frameBucket] of frameBuckets.entries()) {
      const frameContext = `${context}.provenance_frame_buckets[${frameIndex}]`;
      bucketOccurrenceCount += validateProvenanceFrameBucket(frameContext, frameBucket, bucket);
    }
    if (bucketOccurrenceCount !== bucket.row_count) {
      issues.push(`${context}: provenance-frame occurrence rows must sum to row_count`);
    }
    occurrenceCount += bucketOccurrenceCount;
    if (sumCounts(bucket.status_counts) !== bucket.row_count) {
      issues.push(`${context}: status_counts must sum to row_count`);
    }
  }
  if (provenanceFrameCount !== packet.counts.provenance_frame_buckets) issues.push('provenance_frame bucket count mismatch');
  if (occurrenceCount !== packet.counts.occurrence_rows) issues.push('occurrence row count mismatch');
  if (multiWorkBuckets !== packet.counts.multi_work_provenance_buckets) issues.push('multi-work provenance bucket count mismatch');
  if (multiWorkRows !== packet.counts.multi_work_provenance_rows) issues.push('multi-work provenance row count mismatch');
  if (multiFrameBuckets !== packet.counts.multi_frame_provenance_buckets) issues.push('multi-frame provenance bucket count mismatch');
  if (multiFrameRows !== packet.counts.multi_frame_provenance_rows) issues.push('multi-frame provenance row count mismatch');
}

function validateProvenanceFrameBucket(context, frameBucket, parentBucket) {
  requireFields(frameBucket, [
    'provenance_frame_key',
    'provenance_id',
    'version_title',
    'version_source',
    'license',
    'license_url',
    'cluster_id',
    'usage_frame_label',
    'row_count',
    'status_counts',
    'work_slugs',
    'source_refs',
    'route_ids',
    'unresolved_route_ids',
    'max_raw_score',
    'occurrence_rows',
    'usage_boundary',
  ], context);
  for (const key of ['provenance_id', 'version_title', 'version_source', 'license', 'license_url']) {
    if (frameBucket[key] !== parentBucket[key]) issues.push(`${context}: ${key} must match parent provenance bucket`);
  }
  if (!String(frameBucket.provenance_frame_key || '').includes(`${parentBucket.provenance_key}::`)) {
    issues.push(`${context}: provenance_frame_key must include parent provenance key`);
  }
  if (!Number.isInteger(frameBucket.row_count) || frameBucket.row_count <= 0) issues.push(`${context}: row_count must be positive`);
  if (!Array.isArray(frameBucket.work_slugs) || frameBucket.work_slugs.length === 0) issues.push(`${context}: work_slugs must be non-empty`);
  if (!Array.isArray(frameBucket.source_refs) || frameBucket.source_refs.length === 0) issues.push(`${context}: source_refs must be non-empty`);
  if (!Array.isArray(frameBucket.route_ids) || frameBucket.route_ids.length === 0) issues.push(`${context}: route_ids must be non-empty`);
  if (Array.isArray(frameBucket.unresolved_route_ids) && frameBucket.unresolved_route_ids.length !== 0) {
    issues.push(`${context}: unresolved_route_ids must be empty`);
  }
  validateUsageBoundary(`${context}.usage_boundary`, frameBucket.usage_boundary || {});
  const rows = Array.isArray(frameBucket.occurrence_rows) ? frameBucket.occurrence_rows : [];
  if (rows.length !== frameBucket.row_count) issues.push(`${context}: occurrence_rows length must equal row_count`);
  for (const [rowIndex, row] of rows.entries()) validateOccurrenceRow(`${context}.occurrence_rows[${rowIndex}]`, row, parentBucket, frameBucket.cluster_id);
  if (sumCounts(frameBucket.status_counts) !== frameBucket.row_count) {
    issues.push(`${context}: status_counts must sum to row_count`);
  }
  return rows.length;
}

function validateOccurrenceRow(context, row, parentBucket, clusterId) {
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
    'source_ref',
    'source_href',
    'work_title',
    'work_slug',
    'work_anchor_href',
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
  for (const key of ['provenance_id', 'version_title', 'version_source', 'license', 'license_url']) {
    if (row[key] !== parentBucket[key]) issues.push(`${context}: ${key} must match parent provenance bucket`);
  }
  if (row.cluster_id !== clusterId) issues.push(`${context}: cluster_id must match parent frame bucket`);
  if (!allowedStatuses.has(row.status)) issues.push(`${context}: status must be supported/candidate/weak`);
  if (!Number.isInteger(row.raw_score) || row.raw_score < 0 || row.raw_score > 100) issues.push(`${context}: raw_score must be 0-100 integer`);
  if (!hasHebrew(row.context_focus_marked)) issues.push(`${context}: context_focus_marked must include Hebrew`);
  if (!hasFocusMarker(row.context_focus_marked)) issues.push(`${context}: context_focus_marked must mark focus in brackets`);
  if (!Array.isArray(row.related_route_ids) || row.related_route_ids.length === 0) issues.push(`${context}: related_route_ids must be non-empty`);
}

function validateUsageBoundary(context, boundary) {
  if (boundary.observed_usage_only !== true) issues.push(`${context}.observed_usage_only must be true`);
  if (boundary.reader_facing !== false) issues.push(`${context}.reader_facing must be false`);
  if (boundary.route_ids_only !== true) issues.push(`${context}.route_ids_only must be true`);
  if (boundary.provenance_bucket_navigation_only !== true) issues.push(`${context}.provenance_bucket_navigation_only must be true`);
  if (boundary.not_answer_authority !== true) issues.push(`${context}.not_answer_authority must be true`);
  if (boundary.not_definition_authority !== true) issues.push(`${context}.not_definition_authority must be true`);
  if (boundary.not_semantic_arbitration !== true) issues.push(`${context}.not_semantic_arbitration must be true`);
}

function requireFields(value, fields, context) {
  for (const field of fields) {
    if (value[field] === undefined || value[field] === null || value[field] === '') issues.push(`${context}: missing ${field}`);
  }
}

function sumCounts(statusCounts) {
  if (!statusCounts || typeof statusCounts !== 'object') return -1;
  return ['supported', 'candidate', 'weak'].reduce((sum, key) => sum + Number(statusCounts[key] || 0), 0);
}

function hasHebrew(value) {
  return /[\u0590-\u05ff]/.test(String(value || ''));
}

function hasFocusMarker(value) {
  return /\[[^\]]*[\u0590-\u05ff][^\]]*\]/.test(String(value || ''));
}

function validateForbiddenAuthorityKeys(value) {
  const hits = [];
  walk(value, '$');
  if (hits.length) {
    issues.push(`forbidden authority keys present: ${hits.slice(0, 30).join(', ')}`);
  }

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

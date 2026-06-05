#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-occurrence-detail-index.json');
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
  'route_metadata',
]);
const allowedStatuses = new Set(['supported', 'candidate', 'weak']);

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'definition_workbench_usage_occurrence_detail_index') {
  issues.push('artifact_type must be definition_workbench_usage_occurrence_detail_index');
}
if (!String(packet.policy || '').includes('occurrence-detail navigation index')) {
  issues.push('policy must identify occurrence-detail navigation index');
}

validateAuthorityPolicy(packet.authority_policy || {});
validateInputs(packet.inputs || {});
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateOccurrenceDetails(Array.isArray(packet.occurrence_details) ? packet.occurrence_details : []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage occurrence-detail index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 180)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Definition Workbench usage occurrence-detail index validation passed.');
console.log(`Occurrence detail rows: ${packet.counts.occurrence_detail_rows}; bucket-linked rows: ${packet.counts.rows_with_all_bucket_links}; neighbor links: ${packet.counts.neighbor_links}.`);

function validateAuthorityPolicy(policy) {
  const expectedTrue = [
    'usage_navigation_only',
    'observed_usage_only',
    'occurrence_detail_navigation_only',
    'route_ids_only',
    'bucket_keys_only',
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
    'occurrence_detail_rows',
    'source_ref_count',
    'work_count',
    'license_count',
    'version_source_count',
    'route_ids',
    'unresolved_route_ids',
    'rows_with_route_ids',
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_provenance',
    'rows_with_license_metadata',
    'rows_with_version_metadata',
    'rows_with_source_ref_bucket_link',
    'rows_with_source_cluster_bucket_link',
    'rows_with_work_bucket_link',
    'rows_with_work_frame_bucket_link',
    'rows_with_provenance_bucket_link',
    'rows_with_provenance_frame_bucket_link',
    'rows_with_all_bucket_links',
    'neighbor_links',
    'same_frame_neighbor_links',
    'bridge_frame_neighbor_links',
    'rows_with_same_frame_neighbors',
    'rows_with_bridge_frame_neighbors',
    'observed_usage_only_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  const rows = counts.occurrence_detail_rows;
  if (rows <= 0) issues.push('occurrence_detail_rows must be positive');
  if (counts.source_ref_count <= 0) issues.push('source_ref_count must be positive');
  if (counts.work_count <= 0) issues.push('work_count must be positive');
  if (counts.license_count <= 1) issues.push('license_count must show more than one license');
  if (counts.version_source_count <= 1) issues.push('version_source_count must show more than one version source');
  for (const key of [
    'rows_with_route_ids',
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_provenance',
    'rows_with_license_metadata',
    'rows_with_version_metadata',
    'rows_with_source_ref_bucket_link',
    'rows_with_source_cluster_bucket_link',
    'rows_with_work_bucket_link',
    'rows_with_work_frame_bucket_link',
    'rows_with_provenance_bucket_link',
    'rows_with_provenance_frame_bucket_link',
    'rows_with_all_bucket_links',
    'observed_usage_only_rows',
  ]) {
    if (counts[key] !== rows) issues.push(`counts.${key} must equal occurrence_detail_rows`);
  }
  if (counts.route_ids <= 0) issues.push('route_ids must be positive');
  if (counts.unresolved_route_ids !== 0) issues.push('unresolved_route_ids must be 0');
  if (counts.neighbor_links <= 0) issues.push('neighbor_links must be positive');
  if (counts.same_frame_neighbor_links <= 0) issues.push('same_frame_neighbor_links must be positive');
  if (counts.bridge_frame_neighbor_links <= 0) issues.push('bridge_frame_neighbor_links must be positive');
  if (counts.same_frame_neighbor_links + counts.bridge_frame_neighbor_links !== counts.neighbor_links) {
    issues.push('same-frame plus bridge neighbor links must equal neighbor_links');
  }
  if (counts.rows_with_same_frame_neighbors !== rows) issues.push('every row must have same-frame neighbors in current packet');
  if (counts.rows_with_bridge_frame_neighbors !== rows) issues.push('every row must have bridge-frame neighbors in current packet');
  if (counts.reader_facing_rows !== 0) issues.push('reader_facing_rows must be 0');
  if (counts.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must be 0');
  if (sumCounts(counts.status_counts) !== rows) issues.push('status_counts must sum to occurrence_detail_rows');
  if (sumCounts(counts.cluster_counts) !== rows) issues.push('cluster_counts must sum to occurrence_detail_rows');
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
}

function validateOccurrenceDetails(rows) {
  if (!rows.length) issues.push('occurrence_details must be non-empty');
  if (rows.length !== packet.counts.occurrence_detail_rows) issues.push('occurrence_details length must equal count');
  const occurrenceIds = new Set();
  for (const [index, row] of rows.entries()) {
    const context = `occurrence_details[${index}]`;
    requireFields(row, [
      'detail_id',
      'row_id',
      'occurrence_id',
      'token_key',
      'token_surface',
      'token_normalized',
      'focus_surface',
      'focus_normalized',
      'usage_label',
      'navigation_label',
      'status',
      'raw_score',
      'cluster_id',
      'usage_frame_label',
      'source_ref',
      'source_href',
      'work_title',
      'work_slug',
      'work_anchor_href',
      'context_focus_marked',
      'related_route_ids',
      'route_sources',
      'route_resolution_status',
      'unresolved_route_ids',
      'source_ref_bucket_key',
      'source_cluster_key',
      'work_bucket_key',
      'work_frame_key',
      'provenance_key',
      'provenance_frame_key',
      'bucket_link_status',
      'provenance_id',
      'version_title',
      'version_source',
      'license',
      'license_url',
      'neighbor_summary',
      'same_frame_neighbor_ids',
      'bridge_frame_neighbor_ids',
      'neighbor_samples',
      'usage_boundary',
    ], context);
    if (occurrenceIds.has(row.occurrence_id)) issues.push(`${context}: duplicate occurrence_id ${row.occurrence_id}`);
    occurrenceIds.add(row.occurrence_id);
    if (!allowedStatuses.has(row.status)) issues.push(`${context}: status is not allowed`);
    if (!Number.isInteger(row.raw_score) || row.raw_score < 0 || row.raw_score > 100) {
      issues.push(`${context}: raw_score must be an integer from 0 to 100`);
    }
    if (row.usage_label !== 'observed usage only') issues.push(`${context}: usage_label must be observed usage only`);
    if (!Array.isArray(row.related_route_ids) || row.related_route_ids.length === 0) {
      issues.push(`${context}: related_route_ids must be non-empty`);
    }
    if (!Array.isArray(row.route_sources) || row.route_sources.length === 0) issues.push(`${context}: route_sources must be non-empty`);
    if (row.route_resolution_status !== 'resolved') issues.push(`${context}: route_resolution_status must be resolved`);
    if (!Array.isArray(row.unresolved_route_ids) || row.unresolved_route_ids.length !== 0) {
      issues.push(`${context}: unresolved_route_ids must be empty`);
    }
    if (row.bucket_link_status?.complete !== true) issues.push(`${context}: bucket links must be complete`);
    if (Array.isArray(row.bucket_link_status?.missing_bucket_keys) && row.bucket_link_status.missing_bucket_keys.length !== 0) {
      issues.push(`${context}: missing_bucket_keys must be empty`);
    }
    if (!String(row.context_focus_marked || '').includes('[') || !String(row.context_focus_marked || '').includes(']')) {
      issues.push(`${context}: context_focus_marked must include focus brackets`);
    }
    validateNeighborSummary(`${context}.neighbor_summary`, row.neighbor_summary || {});
    if (!Array.isArray(row.same_frame_neighbor_ids) || row.same_frame_neighbor_ids.length <= 0) {
      issues.push(`${context}: same_frame_neighbor_ids must be non-empty`);
    }
    if (!Array.isArray(row.bridge_frame_neighbor_ids) || row.bridge_frame_neighbor_ids.length <= 0) {
      issues.push(`${context}: bridge_frame_neighbor_ids must be non-empty`);
    }
    validateNeighborSamples(`${context}.neighbor_samples.same_frame`, row.neighbor_samples?.same_frame || []);
    validateNeighborSamples(`${context}.neighbor_samples.bridge_frame`, row.neighbor_samples?.bridge_frame || []);
    validateUsageBoundary(`${context}.usage_boundary`, row.usage_boundary || {});
  }
}

function validateNeighborSummary(context, summary) {
  for (const key of [
    'total_neighbors',
    'same_frame_neighbors',
    'bridge_frame_neighbors',
    'strong_neighbors',
    'moderate_neighbors',
    'weak_neighbors',
    'unique_target_refs',
    'unique_target_works',
    'unique_target_clusters',
    'unique_target_frames',
  ]) {
    if (!Number.isInteger(summary[key]) || summary[key] < 0) issues.push(`${context}.${key} must be a non-negative integer`);
  }
  if (summary.total_neighbors <= 0) issues.push(`${context}.total_neighbors must be positive`);
  if (summary.same_frame_neighbors <= 0) issues.push(`${context}.same_frame_neighbors must be positive`);
  if (summary.bridge_frame_neighbors <= 0) issues.push(`${context}.bridge_frame_neighbors must be positive`);
  if (summary.same_frame_neighbors + summary.bridge_frame_neighbors !== summary.total_neighbors) {
    issues.push(`${context}: same-frame plus bridge must equal total neighbors`);
  }
}

function validateNeighborSamples(context, samples) {
  if (!Array.isArray(samples) || samples.length === 0) issues.push(`${context} must be a non-empty array`);
  for (const [index, sample] of samples.entries()) {
    const sampleContext = `${context}[${index}]`;
    requireFields(sample, [
      'target_occurrence_id',
      'link_kind',
      'crossmatch_score',
      'crossmatch_strength',
      'target_source_ref',
      'target_source_href',
      'target_work_anchor_href',
      'shared_route_ids',
    ], sampleContext);
    if (!Number.isInteger(sample.crossmatch_score) || sample.crossmatch_score < 0 || sample.crossmatch_score > 100) {
      issues.push(`${sampleContext}: crossmatch_score must be an integer from 0 to 100`);
    }
    if (!Array.isArray(sample.shared_route_ids) || sample.shared_route_ids.length === 0) {
      issues.push(`${sampleContext}: shared_route_ids must be non-empty`);
    }
  }
}

function validateUsageBoundary(context, boundary) {
  const expectedTrue = [
    'observed_usage_only',
    'route_ids_only',
    'bucket_keys_only',
    'occurrence_detail_navigation_only',
    'not_answer_authority',
    'not_definition_authority',
    'not_semantic_arbitration',
  ];
  const expectedFalse = ['reader_facing'];
  for (const key of expectedTrue) {
    if (boundary[key] !== true) issues.push(`${context}.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (boundary[key] !== false) issues.push(`${context}.${key} must be false`);
  }
}

function requireFields(value, fields, context) {
  for (const field of fields) {
    if (value[field] === undefined || value[field] === null || value[field] === '') {
      issues.push(`${context}: missing ${field}`);
    }
  }
}

function validateForbiddenAuthorityKeys(value) {
  const hits = [];
  walk(value, '$');
  if (hits.length) {
    issues.push(`forbidden authority keys present: ${hits.slice(0, 40).join(', ')}`);
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

function sumCounts(value) {
  if (!value || typeof value !== 'object') return 0;
  return Object.values(value).reduce((total, count) => total + Number(count || 0), 0);
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

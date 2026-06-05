#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-route-resolution.json');
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
if (packet.artifact_type !== 'definition_workbench_usage_route_resolution') {
  issues.push('artifact_type must be definition_workbench_usage_route_resolution');
}
if (!String(packet.policy || '').includes('route-ID resolution audit')) {
  issues.push('policy must identify route-ID resolution audit');
}

validateAuthorityPolicy(packet.authority_policy || {});
validateInputs(packet.inputs || {});
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateRoutes(Array.isArray(packet.routes) ? packet.routes : []);
validateOccurrenceRouteRows(Array.isArray(packet.occurrence_route_rows) ? packet.occurrence_route_rows : []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage route resolution validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Definition Workbench usage route resolution validation passed.');
console.log(`Route IDs: ${packet.counts.route_ids}; unresolved: ${packet.counts.unresolved_route_ids}; rows: ${packet.counts.occurrence_route_rows}.`);

function validateAuthorityPolicy(policy) {
  const expectedTrue = [
    'usage_navigation_only',
    'route_ids_only',
    'route_resolution_only',
  ];
  const expectedFalse = [
    'reader_facing',
    'copies_route_payloads',
    'copies_definition_payloads',
    'ranks_routes',
    'selects_visible_result',
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
  if (!inputs.occurrence_links || !fs.existsSync(path.join(root, cleanRelativePath(inputs.occurrence_links)))) {
    issues.push('inputs.occurrence_links must point to an existing occurrence-links packet');
  }
  if (!inputs.route_source || !fs.existsSync(path.join(root, cleanRelativePath(inputs.route_source)))) {
    issues.push('inputs.route_source must point to an existing local route source');
  }
}

function validateCounts(counts) {
  const required = [
    'occurrence_link_rows',
    'occurrence_route_rows',
    'route_ids',
    'resolved_route_ids',
    'unresolved_route_ids',
    'resolved_occurrence_route_rows',
    'unresolved_occurrence_route_rows',
    'answer_eligible_occurrence_route_rows',
    'answer_eligible_rows_with_source_license_profile',
    'source_license_profile_complete_rows',
    'forbidden_license_profile_rows',
    'future_translation_output_blocked_rows',
    'source_refs',
    'cluster_ids',
    'usage_frames',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.occurrence_link_rows <= 0) issues.push('occurrence_link_rows must be positive');
  if (counts.occurrence_route_rows !== counts.occurrence_link_rows) {
    issues.push('occurrence_route_rows must equal occurrence_link_rows for this route-linked packet');
  }
  if (counts.route_ids <= 0) issues.push('route_ids must be positive');
  if (counts.resolved_route_ids !== counts.route_ids) issues.push('all route IDs must resolve');
  if (counts.unresolved_route_ids !== 0) issues.push('unresolved_route_ids must be 0');
  if (counts.resolved_occurrence_route_rows !== counts.occurrence_route_rows) {
    issues.push('all occurrence route rows must resolve');
  }
  if (counts.unresolved_occurrence_route_rows !== 0) issues.push('unresolved_occurrence_route_rows must be 0');
  if (counts.answer_eligible_rows_with_source_license_profile !== counts.answer_eligible_occurrence_route_rows) {
    issues.push('all answer-eligible route rows must carry complete source/license profile');
  }
  if (counts.forbidden_license_profile_rows !== 0) issues.push('forbidden_license_profile_rows must be 0');
  if (counts.future_translation_output_blocked_rows !== counts.occurrence_route_rows) {
    issues.push('future_translation_output_blocked_rows must equal occurrence_route_rows');
  }
  if (sumStatusCounts(counts.status_counts) !== counts.occurrence_route_rows) {
    issues.push('status_counts must sum to occurrence_route_rows');
  }
  if (counts.reader_facing_rows !== 0) issues.push('reader_facing_rows must be 0');
  if (counts.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must be 0');
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
}

function validateRoutes(routes) {
  if (!routes.length) issues.push('routes must be non-empty');
  for (const [index, route] of routes.entries()) {
    const context = `routes[${index}]`;
    requireFields(route, ['route_id', 'route_source', 'resolution_status', 'route_metadata', 'occurrence_link_rows'], context);
    if (route.resolution_status !== 'resolved') issues.push(`${context}: resolution_status must be resolved`);
    if (!Number.isInteger(route.occurrence_link_rows) || route.occurrence_link_rows <= 0) {
      issues.push(`${context}: occurrence_link_rows must be positive`);
    }
    validateSafeMetadata(`${context}.route_metadata`, route.route_metadata || {});
  }
}

function validateOccurrenceRouteRows(rows) {
  if (!rows.length) issues.push('occurrence_route_rows must be non-empty');
  if (rows.length !== packet.counts.occurrence_route_rows) issues.push('occurrence_route_rows length must equal count');
  for (const [index, row] of rows.entries()) {
    const context = `occurrence_route_rows[${index}]`;
    requireFields(row, [
      'row_id',
      'occurrence_id',
      'route_id',
      'route_source',
      'resolution_status',
      'source_ref',
      'status',
      'cluster_id',
      'usage_frame_label',
      'route_metadata',
      'usage_boundary',
    ], context);
    if (row.resolution_status !== 'resolved') issues.push(`${context}: resolution_status must be resolved`);
    if (!allowedStatuses.has(row.status)) issues.push(`${context}: invalid status ${row.status}`);
    validateSafeMetadata(`${context}.route_metadata`, row.route_metadata || {});
    if (row.usage_boundary?.observed_usage_only !== true) issues.push(`${context}: usage_boundary.observed_usage_only must be true`);
    if (row.usage_boundary?.reader_facing !== false) issues.push(`${context}: usage_boundary.reader_facing must be false`);
    if (row.usage_boundary?.route_ids_only !== true) issues.push(`${context}: usage_boundary.route_ids_only must be true`);
    if (row.usage_boundary?.route_payload_copied !== false) issues.push(`${context}: usage_boundary.route_payload_copied must be false`);
    if (row.usage_boundary?.not_definition_authority !== true) issues.push(`${context}: usage_boundary.not_definition_authority must be true`);
  }
}

function validateSafeMetadata(context, metadata) {
  for (const field of ['normalized', 'surface', 'route_family', 'route_type', 'display_section']) {
    if (!metadata[field]) issues.push(`${context}.${field} is required`);
  }
  const allowed = new Set([
    'normalized',
    'surface',
    'route_family',
    'route_type',
    'display_section',
    'language',
    'answer_eligible',
    'source_license_profile',
    'future_accepted_translation_output',
  ]);
  for (const key of Object.keys(metadata)) {
    if (!allowed.has(key)) issues.push(`${context}: unexpected metadata key ${key}`);
  }
  validateSourceLicenseProfile(`${context}.source_license_profile`, metadata.source_license_profile || {}, metadata.answer_eligible === true);
  validateFutureAcceptedTranslationBoundary(`${context}.future_accepted_translation_output`, metadata.future_accepted_translation_output || {});
}

function validateSourceLicenseProfile(context, profile, answerEligible) {
  if (!profile || typeof profile !== 'object') {
    issues.push(`${context} must be an object`);
    return;
  }
  for (const key of ['row_count', 'incomplete_rows', 'forbidden_license_rows']) {
    if (!Number.isInteger(profile[key]) || profile[key] < 0) issues.push(`${context}.${key} must be a non-negative integer`);
  }
  if (!Array.isArray(profile.rows)) issues.push(`${context}.rows must be an array`);
  if (Array.isArray(profile.rows) && profile.row_count !== profile.rows.length) {
    issues.push(`${context}.row_count must equal rows.length`);
  }
  if (profile.complete !== (profile.row_count > 0 && profile.incomplete_rows === 0)) {
    issues.push(`${context}.complete must reflect row_count and incomplete_rows`);
  }
  if (profile.forbidden_license_detected !== (profile.forbidden_license_rows > 0)) {
    issues.push(`${context}.forbidden_license_detected must reflect forbidden_license_rows`);
  }
  if (profile.forbidden_license_detected !== false) issues.push(`${context}.forbidden_license_detected must be false`);
  if (answerEligible && profile.complete !== true) {
    issues.push(`${context} must be complete for answer-eligible rows`);
  }
  for (const [index, row] of (profile.rows || []).entries()) {
    const rowContext = `${context}.rows[${index}]`;
    for (const field of ['source_name', 'source_family', 'source_id', 'source_url', 'license', 'license_url']) {
      if (!row[field]) issues.push(`${rowContext}.${field} is required`);
    }
  }
}

function validateFutureAcceptedTranslationBoundary(context, boundary) {
  if (!boundary || typeof boundary !== 'object') {
    issues.push(`${context} must be an object`);
    return;
  }
  if (boundary.accepted_translation_output !== false) issues.push(`${context}.accepted_translation_output must be false`);
  if (boundary.publication_readiness !== false) issues.push(`${context}.publication_readiness must be false`);
  if (boundary.requires_future_translation_review !== true) issues.push(`${context}.requires_future_translation_review must be true`);
  if (boundary.status !== 'blocked_route_resolution_only') issues.push(`${context}.status must be blocked_route_resolution_only`);
}

function validateForbiddenAuthorityKeys(value) {
  const hits = [];
  walk(value, '$');
  if (hits.length) issues.push(`forbidden authority keys present: ${hits.slice(0, 40).join(', ')}`);

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

function sumStatusCounts(statusCounts) {
  return Object.values(statusCounts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

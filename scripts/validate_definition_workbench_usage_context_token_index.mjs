#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-context-token-index.json');
const packet = readJson(packetPath);
const issues = [];
const warnings = [];
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

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'definition_workbench_usage_context_token_index') {
  issues.push('artifact_type must be definition_workbench_usage_context_token_index');
}
if (!String(packet.policy || '').includes('context-token index')) {
  issues.push('policy must identify context-token index');
}

validateInputs(packet.inputs || {});
validateAuthorityPolicy(packet.authority_policy || {});
validateRouteConcentration(packet.route_concentration || {});
validateOccurrenceContextRows(packet.occurrence_context_rows || []);
validateContextTokenRows(packet.context_token_rows || []);
validateCounts(packet.counts || {}, packet.occurrence_context_rows || [], packet.context_token_rows || []);
validateChecks(packet.checks || []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage context-token index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 180)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage context-token index validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage context-token index validation passed.');
}
console.log(`Occurrences: ${packet.counts.occurrence_rows}; context tokens: ${packet.counts.context_token_rows}; token appearances: ${packet.counts.context_token_occurrences}.`);

function validateInputs(inputs) {
  if (!inputs.occurrence_detail_index || !fs.existsSync(path.join(root, cleanRelativePath(inputs.occurrence_detail_index)))) {
    issues.push('inputs.occurrence_detail_index must point to an existing occurrence-detail index');
  }
}

function validateAuthorityPolicy(policy) {
  const expectedTrue = [
    'usage_navigation_only',
    'selected_scope_only',
    'observed_usage_only',
    'context_token_navigation_only',
    'route_ids_only',
    'source_license_required',
  ];
  const expectedFalse = [
    'reader_facing',
    'copies_route_payloads',
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

function validateRouteConcentration(concentration) {
  if (!Number.isInteger(concentration.unique_route_ids) || concentration.unique_route_ids < 1) {
    issues.push('route_concentration.unique_route_ids must be positive');
  }
  if (!Array.isArray(concentration.route_ids) || concentration.route_ids.length !== concentration.unique_route_ids) {
    issues.push('route_concentration.route_ids must match unique_route_ids');
  }
  if (concentration.max_route_share_basis_points !== 10000) {
    warnings.push('route_concentration.max_route_share_basis_points is not 10000');
  }
  if (concentration.concentration_warning !== true) {
    warnings.push('route_concentration.concentration_warning is not true');
  }
}

function validateOccurrenceContextRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) issues.push('occurrence_context_rows must be a non-empty array');
  const occurrenceIds = new Set();
  for (const [index, row] of rows.entries()) {
    const context = `occurrence_context_rows[${index}]`;
    requireFields(row, [
      'context_row_id',
      'occurrence_id',
      'detail_id',
      'row_id',
      'token_key',
      'token_surface',
      'token_normalized',
      'focus_surface',
      'focus_normalized',
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
      'context_tokens',
      'related_route_ids',
      'route_resolution_status',
      'unresolved_route_ids',
      'version_title',
      'version_source',
      'license',
      'license_url',
      'usage_boundary',
    ], context);
    if (occurrenceIds.has(row.occurrence_id)) issues.push(`${context}: duplicate occurrence_id ${row.occurrence_id}`);
    occurrenceIds.add(row.occurrence_id);
    if (!['supported', 'candidate', 'weak'].includes(row.status)) issues.push(`${context}: status must be supported, candidate, or weak`);
    if (!Number.isFinite(row.raw_score)) issues.push(`${context}: raw_score must be numeric`);
    if (!String(row.context_focus_marked || '').includes('[') || !String(row.context_focus_marked || '').includes(']')) {
      issues.push(`${context}: context_focus_marked must include focus brackets`);
    }
    if (!Array.isArray(row.context_tokens) || row.context_tokens.length === 0) issues.push(`${context}: context_tokens must be non-empty`);
    const focusTokens = row.context_tokens.filter((token) => token.focus_marked === true);
    if (focusTokens.length !== 1) issues.push(`${context}: context_tokens must contain exactly one focus_marked token`);
    if (!Number.isInteger(row.nonfocus_context_token_count) || row.nonfocus_context_token_count <= 0) {
      issues.push(`${context}: nonfocus_context_token_count must be positive`);
    }
    if (!Array.isArray(row.unique_context_normalized) || row.unique_context_normalized.length === 0) {
      issues.push(`${context}: unique_context_normalized must be non-empty`);
    }
    if (!Array.isArray(row.related_route_ids) || row.related_route_ids.length === 0) {
      issues.push(`${context}: related_route_ids must be non-empty`);
    }
    if (!Array.isArray(row.unresolved_route_ids) || row.unresolved_route_ids.length !== 0) {
      issues.push(`${context}: unresolved_route_ids must be empty`);
    }
    validateUsageBoundary(`${context}.usage_boundary`, row.usage_boundary || {});
  }
}

function validateContextTokenRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) issues.push('context_token_rows must be a non-empty array');
  const ids = new Set();
  const normalized = new Set();
  for (const [index, row] of rows.entries()) {
    const context = `context_token_rows[${index}]`;
    requireFields(row, [
      'context_token_id',
      'context_normalized',
      'surface_samples',
      'occurrence_count',
      'occurrence_row_count',
      'selected_row_share_basis_points',
      'before_focus_count',
      'after_focus_count',
      'repeated_focus_context_count',
      'status_counts',
      'cluster_ids',
      'usage_frame_labels',
      'cross_frame_context_token',
      'source_refs',
      'work_slugs',
      'related_route_ids',
      'licenses',
      'license_urls',
      'version_sources',
      'usage_boundary',
      'sample_occurrences',
    ], context);
    if (ids.has(row.context_token_id)) issues.push(`${context}: duplicate context_token_id`);
    ids.add(row.context_token_id);
    if (normalized.has(row.context_normalized)) issues.push(`${context}: duplicate context_normalized`);
    normalized.add(row.context_normalized);
    for (const key of [
      'occurrence_count',
      'occurrence_row_count',
      'selected_row_share_basis_points',
      'before_focus_count',
      'after_focus_count',
      'repeated_focus_context_count',
    ]) {
      if (!Number.isInteger(row[key]) || row[key] < 0) issues.push(`${context}.${key} must be a non-negative integer`);
    }
    if (row.occurrence_count < row.occurrence_row_count) {
      issues.push(`${context}: occurrence_count must be >= occurrence_row_count`);
    }
    if (!Array.isArray(row.surface_samples) || row.surface_samples.length === 0) issues.push(`${context}: surface_samples must be non-empty`);
    if (!Array.isArray(row.cluster_ids) || row.cluster_ids.length === 0) issues.push(`${context}: cluster_ids must be non-empty`);
    if (!Array.isArray(row.usage_frame_labels) || row.usage_frame_labels.length === 0) issues.push(`${context}: usage_frame_labels must be non-empty`);
    if (!Array.isArray(row.source_refs) || row.source_refs.length === 0) issues.push(`${context}: source_refs must be non-empty`);
    if (!Array.isArray(row.work_slugs) || row.work_slugs.length === 0) issues.push(`${context}: work_slugs must be non-empty`);
    if (!Array.isArray(row.related_route_ids) || row.related_route_ids.length === 0) issues.push(`${context}: related_route_ids must be non-empty`);
    if (!Array.isArray(row.license_urls) || row.license_urls.length === 0) issues.push(`${context}: license_urls must be non-empty`);
    if (!Array.isArray(row.version_sources) || row.version_sources.length === 0) issues.push(`${context}: version_sources must be non-empty`);
    if (!Array.isArray(row.sample_occurrences) || row.sample_occurrences.length === 0) issues.push(`${context}: sample_occurrences must be non-empty`);
    validateUsageBoundary(`${context}.usage_boundary`, row.usage_boundary || {});
  }
}

function validateCounts(counts, occurrenceRows, tokenRows) {
  const required = [
    'occurrence_rows',
    'context_token_rows',
    'context_token_occurrences',
    'rows_with_context_tokens',
    'rows_with_focus_marker',
    'source_refs',
    'works',
    'licenses',
    'version_sources',
    'route_ids',
    'unresolved_route_ids',
    'max_route_share_basis_points',
    'route_concentration_warning',
    'cross_frame_context_token_rows',
    'repeated_focus_context_token_rows',
    'repeated_focus_context_occurrences',
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_surface',
    'rows_with_license_metadata',
    'rows_with_version_metadata',
    'observed_usage_only_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.occurrence_rows !== occurrenceRows.length) issues.push('counts.occurrence_rows must match occurrence_context_rows length');
  if (counts.context_token_rows !== tokenRows.length) issues.push('counts.context_token_rows must match context_token_rows length');
  if (counts.context_token_occurrences !== sum(tokenRows.map((row) => row.occurrence_count))) {
    issues.push('counts.context_token_occurrences must equal token-row occurrence_count sum');
  }
  if (counts.occurrence_rows <= 0) issues.push('counts.occurrence_rows must be positive');
  if (counts.context_token_rows <= 0) issues.push('counts.context_token_rows must be positive');
  for (const key of [
    'rows_with_context_tokens',
    'rows_with_focus_marker',
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_surface',
    'rows_with_license_metadata',
    'rows_with_version_metadata',
    'observed_usage_only_rows',
  ]) {
    if (counts[key] !== counts.occurrence_rows) issues.push(`counts.${key} must equal occurrence_rows`);
  }
  if (counts.source_refs <= 0) issues.push('counts.source_refs must be positive');
  if (counts.works <= 0) issues.push('counts.works must be positive');
  if (counts.licenses <= 0) issues.push('counts.licenses must be positive');
  if (counts.version_sources <= 0) issues.push('counts.version_sources must be positive');
  if (counts.route_ids <= 0) issues.push('counts.route_ids must be positive');
  if (counts.unresolved_route_ids !== 0) issues.push('counts.unresolved_route_ids must be 0');
  if (counts.cross_frame_context_token_rows <= 0) issues.push('counts.cross_frame_context_token_rows must be positive');
  if (counts.max_route_share_basis_points !== 10000) warnings.push('counts.max_route_share_basis_points is not 10000');
  if (counts.route_concentration_warning !== 1) warnings.push('counts.route_concentration_warning is not 1');
  if (counts.reader_facing_rows !== 0) issues.push('counts.reader_facing_rows must be 0');
  if (counts.route_payload_field_hits !== 0) issues.push('counts.route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('counts.forbidden_authority_field_hits must be 0');
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
}

function validateUsageBoundary(context, boundary) {
  const expectedTrue = [
    'observed_usage_only',
    'route_ids_only',
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

function requireFields(value, fields, context) {
  for (const field of fields) {
    if (value[field] === undefined || value[field] === null || value[field] === '') {
      issues.push(`${context}: missing ${field}`);
    }
  }
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/');
  if (!normalized || normalized.startsWith('/') || /^[A-Za-z]:/.test(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Unsafe relative path: ${value}`);
  }
  return normalized;
}

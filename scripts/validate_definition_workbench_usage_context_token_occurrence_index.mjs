#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-context-token-occurrence-index.json');
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
if (packet.artifact_type !== 'definition_workbench_usage_context_token_occurrence_index') {
  issues.push('artifact_type must be definition_workbench_usage_context_token_occurrence_index');
}
if (!String(packet.policy || '').includes('reverse index')) {
  issues.push('policy must identify reverse index');
}
if (packet.generator !== 'scripts/build_definition_workbench_usage_context_token_occurrence_index.mjs') {
  issues.push('generator must be scripts/build_definition_workbench_usage_context_token_occurrence_index.mjs');
}
if (packet.lane_owner !== 'Agent 3') issues.push('lane_owner must be Agent 3');

validateInputs(packet.inputs || {});
validateAuthorityPolicy(packet.authority_policy || {});
validateRouteConcentration(packet.route_concentration || {});
validateRows(packet.context_token_occurrence_rows || []);
validateCounts(packet.counts || {}, packet.context_token_occurrence_rows || []);
validateChecks(packet.checks || []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage context-token occurrence index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 200)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage context-token occurrence index validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage context-token occurrence index validation passed.');
}
console.log(`Rows: ${packet.counts.context_token_occurrence_rows}; links: ${packet.counts.context_token_link_rows}; occurrences: ${packet.counts.occurrence_rows}.`);

function validateInputs(inputs) {
  if (!inputs.context_token_links || !fs.existsSync(path.join(root, cleanRelativePath(inputs.context_token_links)))) {
    issues.push('inputs.context_token_links must point to an existing context-token links packet');
  }
}

function validateAuthorityPolicy(policy) {
  const expectedTrue = [
    'usage_navigation_only',
    'selected_scope_only',
    'observed_usage_only',
    'context_token_reverse_lookup_only',
    'route_ids_only',
    'source_license_required',
  ];
  const expectedFalse = [
    'reader_facing',
    'copies_route_payloads',
    'copies_definition_payloads',
    'ranks_routes',
    'selects_visible_result',
    'semantic_arbitration',
    'reviewed_lexical_authority',
    'accepted_translation_output',
    'publication_readiness',
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
  if (concentration.semantic_independence_claim_allowed !== false) {
    issues.push('route_concentration.semantic_independence_claim_allowed must be false');
  }
}

function validateRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) issues.push('context_token_occurrence_rows must be a non-empty array');
  const ids = new Set();
  const normalized = new Set();
  let summedLinks = 0;
  for (const [index, row] of rows.entries()) {
    const context = `context_token_occurrence_rows[${index}]`;
    requireFields(row, [
      'context_token_occurrence_index_id',
      'context_normalized',
      'context_token_ids',
      'surface_samples',
      'context_token_link_ids',
      'occurrence_ids',
      'detail_ids',
      'row_ids',
      'total_link_count',
      'occurrence_count',
      'selected_row_share_basis_points',
      'focus_link_count',
      'context_link_count',
      'repeated_focus_context_link_count',
      'cross_frame_link_count',
      'cross_frame_context_token',
      'before_focus_count',
      'after_focus_count',
      'status_counts',
      'context_link_role_counts',
      'cluster_ids',
      'usage_frame_labels',
      'source_refs',
      'source_hrefs',
      'work_slugs',
      'work_anchor_hrefs',
      'related_route_ids',
      'provenance_ids',
      'licenses',
      'license_urls',
      'version_sources',
      'occurrence_links',
      'usage_boundary',
    ], context);
    if (ids.has(row.context_token_occurrence_index_id)) issues.push(`${context}: duplicate context_token_occurrence_index_id`);
    ids.add(row.context_token_occurrence_index_id);
    if (normalized.has(row.context_normalized)) issues.push(`${context}: duplicate context_normalized`);
    normalized.add(row.context_normalized);
    for (const key of [
      'total_link_count',
      'occurrence_count',
      'selected_row_share_basis_points',
      'focus_link_count',
      'context_link_count',
      'repeated_focus_context_link_count',
      'cross_frame_link_count',
      'before_focus_count',
      'after_focus_count',
    ]) {
      if (!Number.isInteger(row[key]) || row[key] < 0) issues.push(`${context}.${key} must be a non-negative integer`);
    }
    if (row.total_link_count !== row.context_token_link_ids.length) {
      issues.push(`${context}: total_link_count must equal context_token_link_ids length`);
    }
    if (row.total_link_count !== row.occurrence_links.length) {
      issues.push(`${context}: total_link_count must equal occurrence_links length`);
    }
    if (row.total_link_count !== row.focus_link_count + row.context_link_count) {
      issues.push(`${context}: total_link_count must equal focus_link_count plus context_link_count`);
    }
    if (row.occurrence_count !== row.occurrence_ids.length) {
      issues.push(`${context}: occurrence_count must equal occurrence_ids length`);
    }
    for (const key of [
      'context_token_ids',
      'surface_samples',
      'context_token_link_ids',
      'occurrence_ids',
      'detail_ids',
      'row_ids',
      'cluster_ids',
      'usage_frame_labels',
      'source_refs',
      'source_hrefs',
      'work_slugs',
      'work_anchor_hrefs',
      'related_route_ids',
      'provenance_ids',
      'licenses',
      'license_urls',
      'version_sources',
      'occurrence_links',
    ]) {
      if (!Array.isArray(row[key]) || row[key].length === 0) issues.push(`${context}.${key} must be a non-empty array`);
    }
    for (const [linkIndex, link] of (row.occurrence_links || []).entries()) {
      validateOccurrenceLink(`${context}.occurrence_links[${linkIndex}]`, link);
    }
    validateUsageBoundary(`${context}.usage_boundary`, row.usage_boundary || {});
    summedLinks += row.total_link_count;
  }
  if (packet.counts && Number.isInteger(packet.counts.context_token_link_rows) && summedLinks !== packet.counts.context_token_link_rows) {
    issues.push('row total_link_count sum must equal counts.context_token_link_rows');
  }
}

function validateOccurrenceLink(context, link) {
  requireFields(link, [
    'context_token_link_id',
    'occurrence_id',
    'detail_id',
    'row_id',
    'context_surface',
    'context_link_role',
    'focus_marked',
    'is_repeated_focus_token',
    'distance_from_focus',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'context_focus_marked',
    'status',
    'raw_score',
    'cluster_id',
    'usage_frame_label',
    'related_route_ids',
    'license',
    'license_url',
    'version_source',
  ], context);
  if (!['focus', 'context', 'repeated_focus_context'].includes(link.context_link_role)) {
    issues.push(`${context}.context_link_role must be focus, context, or repeated_focus_context`);
  }
  if (!['supported', 'candidate', 'weak'].includes(link.status)) issues.push(`${context}.status must be supported, candidate, or weak`);
  if (!Array.isArray(link.related_route_ids) || link.related_route_ids.length === 0) {
    issues.push(`${context}.related_route_ids must be non-empty`);
  }
  if (!String(link.context_focus_marked || '').includes('[') || !String(link.context_focus_marked || '').includes(']')) {
    issues.push(`${context}.context_focus_marked must include focus marker`);
  }
  if (!link.source_ref || !link.source_href || !link.work_anchor_href || !link.license || !link.license_url || !link.version_source) {
    issues.push(`${context} must preserve source/work/license/version fields`);
  }
}

function validateCounts(counts, rows) {
  const required = [
    'context_token_occurrence_rows',
    'context_token_link_rows',
    'input_context_token_link_rows',
    'occurrence_rows',
    'input_occurrence_rows',
    'focus_link_rows',
    'input_focus_link_rows',
    'context_link_rows',
    'input_context_link_rows',
    'repeated_focus_context_link_rows',
    'cross_frame_context_token_rows',
    'cross_frame_context_token_link_rows',
    'rows_with_focus_links',
    'rows_with_context_links',
    'rows_with_repeated_focus_context_links',
    'rows_with_cross_frame_links',
    'source_refs',
    'works',
    'licenses',
    'version_sources',
    'route_ids',
    'unresolved_route_ids',
    'max_route_share_basis_points',
    'route_concentration_warning',
    'link_rows_with_source_link',
    'link_rows_with_work_anchor',
    'link_rows_with_hebrew_context',
    'link_rows_with_focus_marker',
    'link_rows_with_route_ids',
    'link_rows_with_license_metadata',
    'link_rows_with_version_metadata',
    'observed_usage_only_link_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.context_token_occurrence_rows !== rows.length) {
    issues.push('counts.context_token_occurrence_rows must equal row length');
  }
  if (counts.context_token_link_rows !== counts.input_context_token_link_rows) {
    issues.push('counts.context_token_link_rows must equal input_context_token_link_rows');
  }
  if (counts.occurrence_rows !== counts.input_occurrence_rows) {
    issues.push('counts.occurrence_rows must equal input_occurrence_rows');
  }
  if (counts.focus_link_rows !== counts.input_focus_link_rows) {
    issues.push('counts.focus_link_rows must equal input_focus_link_rows');
  }
  if (counts.context_link_rows !== counts.input_context_link_rows) {
    issues.push('counts.context_link_rows must equal input_context_link_rows');
  }
  if (counts.context_token_link_rows !== counts.focus_link_rows + counts.context_link_rows) {
    issues.push('counts.context_token_link_rows must equal focus plus context link rows');
  }
  if (counts.context_token_occurrence_rows < 1 || counts.context_token_link_rows < 1 || counts.occurrence_rows < 1) {
    issues.push('counts rows/links/occurrences must be positive');
  }
  if (counts.repeated_focus_context_link_rows < 1) warnings.push('counts.repeated_focus_context_link_rows is 0');
  if (counts.cross_frame_context_token_rows < 1 || counts.cross_frame_context_token_link_rows < 1) {
    issues.push('cross-frame token rows and links must be positive');
  }
  if (counts.route_ids < 1) issues.push('counts.route_ids must be positive');
  if (counts.unresolved_route_ids !== 0) issues.push('counts.unresolved_route_ids must be 0');
  if (counts.max_route_share_basis_points !== 10000) warnings.push('counts.max_route_share_basis_points is not 10000');
  if (counts.route_concentration_warning !== 1) warnings.push('counts.route_concentration_warning is not 1');
  for (const key of [
    'link_rows_with_source_link',
    'link_rows_with_work_anchor',
    'link_rows_with_hebrew_context',
    'link_rows_with_focus_marker',
    'link_rows_with_route_ids',
    'link_rows_with_license_metadata',
    'link_rows_with_version_metadata',
    'observed_usage_only_link_rows',
  ]) {
    if (counts[key] !== counts.context_token_link_rows) issues.push(`counts.${key} must equal context_token_link_rows`);
  }
  if (counts.reader_facing_rows !== 0) issues.push('counts.reader_facing_rows must be 0');
  if (counts.route_payload_field_hits !== 0) issues.push('counts.route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('counts.forbidden_authority_field_hits must be 0');
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
  for (const required of [
    'context_token_occurrence_rows_present',
    'input_link_coverage_preserved',
    'reverse_lookup_links_complete',
    'focus_and_context_roles_visible',
    'cross_frame_tokens_visible',
    'route_ids_only',
    'route_concentration_marked',
    'usage_boundary_only',
  ]) {
    if (!checks.some((check) => check.id === required)) issues.push(`checks missing ${required}`);
  }
}

function validateUsageBoundary(context, boundary) {
  const expectedTrue = [
    'observed_usage_only',
    'route_ids_only',
    'context_token_reverse_lookup_only',
    'not_answer_authority',
    'not_definition_authority',
    'not_semantic_arbitration',
  ];
  for (const key of expectedTrue) {
    if (boundary[key] !== true) issues.push(`${context}.${key} must be true`);
  }
  if (boundary.reader_facing !== false) issues.push(`${context}.reader_facing must be false`);
}

function validateForbiddenAuthorityKeys(value, pathName = 'packet') {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${pathName}.${key}`;
    if (forbiddenAuthorityKeys.has(key)) issues.push(`${childPath} is forbidden in Agent 3 usage reverse index`);
    validateForbiddenAuthorityKeys(child, childPath);
  }
}

function requireFields(value, fields, context) {
  for (const field of fields) {
    if (!(field in value)) issues.push(`${context}.${field} is required`);
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
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

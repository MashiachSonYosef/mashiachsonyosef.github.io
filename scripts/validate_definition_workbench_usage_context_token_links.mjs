#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-context-token-links.json');
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
if (packet.artifact_type !== 'definition_workbench_usage_context_token_links') {
  issues.push('artifact_type must be definition_workbench_usage_context_token_links');
}
if (packet.generator !== 'scripts/build_definition_workbench_usage_context_token_links.mjs') {
  issues.push('generator must be scripts/build_definition_workbench_usage_context_token_links.mjs');
}
if (packet.lane_owner !== 'Agent 3') issues.push('lane_owner must be Agent 3');

validateInputs(packet.inputs || {});
validateAuthorityPolicy(packet.authority_policy || {});
validateRouteConcentration(packet.route_concentration || {});
validateRows(packet.context_token_links || []);
validateCounts(packet.counts || {}, packet.context_token_links || []);
validateChecks(packet.checks || []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage context-token links validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage context-token links validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage context-token links validation passed.');
}
console.log(`Links: ${packet.counts.context_token_link_rows}; context tokens: ${packet.counts.context_token_rows}; occurrences: ${packet.counts.occurrence_rows}.`);

function validateInputs(inputs) {
  if (inputs.context_token_index !== 'data/definitions/definition-workbench-usage-context-token-index.json') {
    issues.push('inputs.context_token_index must point to the selected context-token index');
  }
  if (!fs.existsSync(path.join(root, inputs.context_token_index || ''))) {
    issues.push('inputs.context_token_index must exist');
  }
}

function validateAuthorityPolicy(policy) {
  for (const key of [
    'usage_navigation_only',
    'selected_scope_only',
    'observed_usage_only',
    'context_token_link_navigation_only',
    'route_ids_only',
    'source_license_required',
  ]) {
    if (policy[key] !== true) issues.push(`authority_policy.${key} must be true`);
  }
  for (const key of [
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
  ]) {
    if (policy[key] !== false) issues.push(`authority_policy.${key} must be false`);
  }
}

function validateRouteConcentration(routeConcentration) {
  if (!Array.isArray(routeConcentration.route_ids) || routeConcentration.route_ids.length < 1) {
    issues.push('route_concentration.route_ids must be non-empty');
  }
  if (routeConcentration.max_route_share_basis_points !== 10000) {
    issues.push('route_concentration.max_route_share_basis_points must be 10000');
  }
  if (routeConcentration.route_concentration_warning !== 1) {
    issues.push('route_concentration.route_concentration_warning must be 1');
  }
  if (routeConcentration.semantic_independence_claim_allowed !== false) {
    issues.push('route_concentration.semantic_independence_claim_allowed must be false');
  }
}

function validateRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) issues.push('context_token_links must be a non-empty array');
  const ids = new Set();
  const focusByOccurrence = new Map();
  for (const [index, row] of rows.entries()) {
    const context = `context_token_links[${index}]`;
    if (!row.context_token_link_id) issues.push(`${context}.context_token_link_id is required`);
    if (ids.has(row.context_token_link_id)) issues.push(`${context}.context_token_link_id is duplicated`);
    ids.add(row.context_token_link_id);
    for (const key of [
      'context_token_id',
      'context_normalized',
      'context_surface',
      'context_role',
      'context_link_role',
      'occurrence_id',
      'context_row_id',
      'detail_id',
      'row_id',
      'token_key',
      'token_surface',
      'token_normalized',
      'focus_surface',
      'focus_normalized',
      'status',
      'cluster_id',
      'usage_frame_label',
      'source_ref',
      'source_href',
      'work_slug',
      'work_anchor_href',
      'context_focus_marked',
      'route_resolution_status',
      'provenance_id',
      'version_title',
      'version_source',
      'license',
      'license_url',
    ]) {
      if (row[key] === undefined || row[key] === null || row[key] === '') issues.push(`${context}.${key} is required`);
    }
    if (!Number.isFinite(Number(row.raw_score))) issues.push(`${context}.raw_score must be numeric`);
    if (!Number.isInteger(row.distance_from_focus)) issues.push(`${context}.distance_from_focus must be an integer`);
    if (!['focus', 'context'].includes(row.context_role)) issues.push(`${context}.context_role must be focus or context`);
    if (!['focus', 'context', 'repeated_focus_context'].includes(row.context_link_role)) {
      issues.push(`${context}.context_link_role is unexpected`);
    }
    if (!String(row.context_focus_marked || '').includes('[') || !String(row.context_focus_marked || '').includes(']')) {
      issues.push(`${context}.context_focus_marked must include focus marker`);
    }
    if (!hasHebrew(row.context_focus_marked)) issues.push(`${context}.context_focus_marked must include Hebrew text`);
    if (!Array.isArray(row.related_route_ids) || row.related_route_ids.length === 0) {
      issues.push(`${context}.related_route_ids must be non-empty`);
    }
    if (!Array.isArray(row.unresolved_route_ids) || row.unresolved_route_ids.length !== 0) {
      issues.push(`${context}.unresolved_route_ids must be an empty array`);
    }
    if (row.route_resolution_status !== 'resolved') issues.push(`${context}.route_resolution_status must be resolved`);
    validateUsageBoundary(row.usage_boundary || {}, context);
    if (row.focus_marked === true) {
      focusByOccurrence.set(row.occurrence_id, (focusByOccurrence.get(row.occurrence_id) || 0) + 1);
    }
  }
  for (const [occurrenceId, focusCount] of focusByOccurrence.entries()) {
    if (focusCount !== 1) issues.push(`occurrence ${occurrenceId} must have exactly one focus-marked context-token link`);
  }
}

function validateUsageBoundary(boundary, context) {
  for (const key of [
    'observed_usage_only',
    'route_ids_only',
    'context_token_link_only',
    'not_answer_authority',
    'not_definition_authority',
    'not_semantic_arbitration',
  ]) {
    if (boundary[key] !== true) issues.push(`${context}.usage_boundary.${key} must be true`);
  }
  if (boundary.reader_facing !== false) issues.push(`${context}.usage_boundary.reader_facing must be false`);
}

function validateCounts(counts, rows) {
  const required = [
    'context_token_link_rows',
    'input_context_token_occurrences',
    'context_token_rows',
    'input_context_token_rows',
    'occurrence_rows',
    'input_occurrence_rows',
    'focus_marked_link_rows',
    'context_role_link_rows',
    'repeated_focus_context_links',
    'cross_frame_context_token_links',
    'source_refs',
    'works',
    'licenses',
    'version_sources',
    'route_ids',
    'unresolved_route_ids',
    'max_route_share_basis_points',
    'route_concentration_warning',
    'rows_with_context_token_id',
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_route_ids',
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
  if (counts.context_token_link_rows !== rows.length) issues.push('counts.context_token_link_rows must equal row length');
  if (counts.context_token_link_rows !== counts.focus_marked_link_rows + counts.context_role_link_rows) {
    issues.push('counts.context_token_link_rows must equal focus_marked_link_rows plus context_role_link_rows');
  }
  if (counts.context_role_link_rows !== counts.input_context_token_occurrences) {
    issues.push('counts.context_role_link_rows must equal input_context_token_occurrences');
  }
  if (counts.focus_marked_link_rows !== counts.input_occurrence_rows) {
    issues.push('counts.focus_marked_link_rows must equal input_occurrence_rows');
  }
  if (counts.context_token_rows !== counts.input_context_token_rows) {
    issues.push('counts.context_token_rows must equal input_context_token_rows');
  }
  if (counts.occurrence_rows !== counts.input_occurrence_rows) {
    issues.push('counts.occurrence_rows must equal input_occurrence_rows');
  }
  if (counts.focus_marked_link_rows !== counts.occurrence_rows) {
    issues.push('counts.focus_marked_link_rows must equal occurrence_rows');
  }
  if (counts.context_role_link_rows <= counts.occurrence_rows) {
    issues.push('counts.context_role_link_rows must exceed occurrence_rows');
  }
  if (counts.repeated_focus_context_links <= 0) warnings.push('no repeated focus context links are visible');
  if (counts.cross_frame_context_token_links <= 0) issues.push('counts.cross_frame_context_token_links must be positive');
  if (counts.source_refs <= 1) issues.push('counts.source_refs must show source diversity');
  if (counts.works <= 1) issues.push('counts.works must show work diversity');
  if (counts.licenses <= 1) issues.push('counts.licenses must show license diversity');
  if (counts.version_sources <= 1) issues.push('counts.version_sources must show version-source diversity');
  if (counts.route_ids <= 0) issues.push('counts.route_ids must be positive');
  if (counts.unresolved_route_ids !== 0) issues.push('counts.unresolved_route_ids must be 0');
  if (counts.max_route_share_basis_points !== 10000) issues.push('counts.max_route_share_basis_points must be 10000');
  if (counts.route_concentration_warning !== 1) issues.push('counts.route_concentration_warning must be 1');
  for (const key of [
    'rows_with_context_token_id',
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_route_ids',
    'rows_with_license_metadata',
    'rows_with_version_metadata',
    'observed_usage_only_rows',
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

function hasHebrew(value) {
  return /[\u0590-\u05FF]/.test(String(value || ''));
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

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-occurrence-links.json');
const packet = readJson(packetPath);
const selectedNavigationIndex = readJsonIfExists(packet.inputs?.selected_navigation_index || '');
const issues = [];
const warnings = [];
const allowedStatuses = new Set(['supported', 'candidate', 'weak']);
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

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'definition_workbench_usage_occurrence_links') {
  issues.push('artifact_type must be definition_workbench_usage_occurrence_links');
}
if (!String(packet.policy || '').includes('Stable Agent 3 Definition Workbench occurrence-link packet')) {
  issues.push('policy must identify stable Agent 3 Definition Workbench occurrence-link packet');
}

validateAuthorityPolicy(packet.authority_policy || {});
validateAuditOnlySummary(packet.audit_only_summary || {});
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateInputFreshness(packet.inputs || {});

const rows = Array.isArray(packet.occurrence_links) ? packet.occurrence_links : [];
if (!rows.length) issues.push('occurrence_links must be a non-empty array');
for (const [index, row] of rows.entries()) validateOccurrenceLink(`occurrence_links[${index}]`, row);
validateDerivedCounts(rows);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage occurrence links validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage occurrence links validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage occurrence links validation passed.');
}
console.log(`Occurrence links: ${packet.counts.occurrence_link_rows}; source refs: ${packet.counts.unique_source_refs}; reader-facing: ${packet.counts.reader_facing_rows}.`);

function validateAuthorityPolicy(policy) {
  const expectedTrue = [
    'usage_navigation_only',
    'observed_usage_only',
    'occurrence_links_only',
    'route_ids_only',
  ];
  const expectedFalse = [
    'reader_facing',
    'ranks_routes',
    'selects_visible_result',
    'ambiguous_rows_reader_facing',
    'route_payloads_copied',
    'publication_claim',
  ];
  for (const key of expectedTrue) {
    if (policy[key] !== true) issues.push(`authority_policy.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (policy[key] !== false) issues.push(`authority_policy.${key} must be false`);
  }
}

function validateAuditOnlySummary(summary) {
  if (!Number.isInteger(summary.ambiguous_rows_available_in_concordance) || summary.ambiguous_rows_available_in_concordance <= 0) {
    issues.push('audit_only_summary.ambiguous_rows_available_in_concordance must be positive');
  }
  if (summary.ambiguous_rows_emitted !== 0) issues.push('audit_only_summary.ambiguous_rows_emitted must be 0');
  if (summary.blocked_rows_emitted !== 0) issues.push('audit_only_summary.blocked_rows_emitted must be 0');
}

function validateCounts(counts) {
  const requiredIntegerCounts = [
    'occurrence_link_rows',
    'unique_source_refs',
    'unique_work_anchors',
    'unique_works',
    'cluster_ids',
    'usage_frames',
    'unique_route_ids',
    'unique_licenses',
    'unique_license_urls',
    'unique_version_titles',
    'unique_version_sources',
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_license',
    'rows_with_version',
    'rows_with_route_ids',
    'collision_member_rows',
    'collision_memberships',
    'observed_usage_only_rows',
    'reader_facing_rows',
    'mojibake_rows',
    'audit_only_ambiguous_rows_available',
    'audit_only_ambiguous_rows_emitted',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
  ];
  for (const key of requiredIntegerCounts) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.occurrence_link_rows <= 0) issues.push('counts.occurrence_link_rows must be positive');
  if (counts.unique_source_refs <= 1) issues.push('counts.unique_source_refs must show diversity');
  if (counts.unique_work_anchors <= 1) issues.push('counts.unique_work_anchors must show diversity');
  if (counts.unique_works <= 1) issues.push('counts.unique_works must show diversity');
  if (counts.cluster_ids <= 0) issues.push('counts.cluster_ids must be positive');
  if (counts.usage_frames <= 0) issues.push('counts.usage_frames must be positive');
  if (counts.unique_route_ids <= 0) issues.push('counts.unique_route_ids must be positive');
  if (counts.rows_with_source_link !== counts.occurrence_link_rows) issues.push('all rows must have source links');
  if (counts.rows_with_work_anchor !== counts.occurrence_link_rows) issues.push('all rows must have work anchors');
  if (counts.rows_with_hebrew_context !== counts.occurrence_link_rows) issues.push('all rows must have Hebrew context');
  if (counts.rows_with_focus_marker !== counts.occurrence_link_rows) issues.push('all rows must have focus markers');
  if (counts.rows_with_license !== counts.occurrence_link_rows) issues.push('all rows must have license metadata');
  if (counts.rows_with_version !== counts.occurrence_link_rows) issues.push('all rows must have version metadata');
  if (counts.rows_with_route_ids !== counts.occurrence_link_rows) issues.push('all rows must have route IDs');
  if (counts.observed_usage_only_rows !== counts.occurrence_link_rows) issues.push('all rows must be observed usage only');
  if (counts.reader_facing_rows !== 0) issues.push('reader_facing_rows must be 0');
  if (counts.mojibake_rows !== 0) issues.push('mojibake_rows must be 0');
  if (counts.audit_only_ambiguous_rows_available <= 0) issues.push('audit_only_ambiguous_rows_available must be positive');
  if (counts.audit_only_ambiguous_rows_emitted !== 0) issues.push('audit_only_ambiguous_rows_emitted must be 0');
  if (counts.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must be 0');
  if (sumStatusCounts(counts.status_counts) !== counts.occurrence_link_rows) {
    issues.push('status_counts must sum to occurrence_link_rows');
  }
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
}

function validateInputFreshness(inputs) {
  if (!inputs.selected_navigation_index) {
    issues.push('inputs.selected_navigation_index is required');
    return;
  }
  if (!selectedNavigationIndex) {
    issues.push(`inputs.selected_navigation_index missing: ${inputs.selected_navigation_index}`);
    return;
  }
  if (selectedNavigationIndex.artifact_type !== 'workbench_usage_selected_occurrence_navigation_index') {
    issues.push('inputs.selected_navigation_index must point to a selected occurrence navigation index');
    return;
  }
  const sourceRows = Array.isArray(selectedNavigationIndex.navigation_rows) ? selectedNavigationIndex.navigation_rows : [];
  const packetRows = Array.isArray(packet.occurrence_links) ? packet.occurrence_links : [];
  if (sourceRows.length !== packetRows.length) {
    issues.push(`selected navigation row count ${sourceRows.length} does not match occurrence links ${packetRows.length}`);
  }
  const sourceOccurrenceIds = new Set(sourceRows.map((row) => row.occurrence_id));
  const missing = packetRows.filter((row) => !sourceOccurrenceIds.has(row.occurrence_id)).map((row) => row.occurrence_id);
  if (missing.length) issues.push(`occurrence links not present in selected navigation index: ${missing.slice(0, 20).join(', ')}`);
}

function validateOccurrenceLink(context, row) {
  requireFields(row, [
    'row_id',
    'occurrence_id',
    'token_key',
    'token_surface',
    'token_normalized',
    'focus_surface',
    'focus_normalized',
    'navigation_label',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'work_title',
    'work_slug',
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
    'collision_ids',
    'collision_kinds',
    'collision_keys',
    'usage_boundary',
  ], context);
  if (!allowedStatuses.has(row.status)) issues.push(`${context}: invalid status ${row.status}`);
  if (!Number.isFinite(row.raw_score)) issues.push(`${context}: raw_score must be numeric`);
  if (!String(row.source_href || '').startsWith('http')) issues.push(`${context}: source_href must be absolute URL`);
  if (!String(row.work_anchor_href || '').includes('#')) issues.push(`${context}: work_anchor_href must include anchor`);
  if (!String(row.version_source || '').startsWith('http')) issues.push(`${context}: version_source must be absolute URL`);
  if (!String(row.license_url || '').startsWith('http')) issues.push(`${context}: license_url must be absolute URL`);
  if (!Array.isArray(row.related_route_ids) || !row.related_route_ids.length) issues.push(`${context}: related_route_ids must be non-empty array`);
  if (!Array.isArray(row.collision_ids)) issues.push(`${context}: collision_ids must be an array`);
  if (!Array.isArray(row.collision_kinds)) issues.push(`${context}: collision_kinds must be an array`);
  if (!Array.isArray(row.collision_keys)) issues.push(`${context}: collision_keys must be an array`);
  if (!hasHebrew(row.token_surface)) issues.push(`${context}: token_surface must include Hebrew`);
  if (!hasHebrew(row.token_normalized)) issues.push(`${context}: token_normalized must include Hebrew`);
  if (!hasHebrew(row.context_focus_marked)) issues.push(`${context}: context_focus_marked must include Hebrew`);
  if (!String(row.context_focus_marked || '').includes('[') || !String(row.context_focus_marked || '').includes(']')) {
    issues.push(`${context}: context_focus_marked must include bracketed focus marker`);
  }
  if (hasMojibake(`${row.token_key} ${row.token_surface} ${row.context_focus_marked}`)) {
    issues.push(`${context}: token/context has mojibake-like characters`);
  }
  if (row.usage_boundary?.observed_usage_only !== true) issues.push(`${context}: usage_boundary.observed_usage_only must be true`);
  if (row.usage_boundary?.reader_facing !== false) issues.push(`${context}: usage_boundary.reader_facing must be false`);
  if (row.usage_boundary?.route_ids_only !== true) issues.push(`${context}: usage_boundary.route_ids_only must be true`);
  if (row.usage_boundary?.not_answer_authority !== true) issues.push(`${context}: usage_boundary.not_answer_authority must be true`);
  if (row.usage_boundary?.not_definition_authority !== true) issues.push(`${context}: usage_boundary.not_definition_authority must be true`);
  if (row.usage_boundary?.not_semantic_arbitration !== true) issues.push(`${context}: usage_boundary.not_semantic_arbitration must be true`);
}

function validateDerivedCounts(rows) {
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  const routeIds = new Set();
  let collisionMemberRows = 0;
  let collisionMemberships = 0;
  for (const row of rows) {
    if (Object.hasOwn(statusCounts, row.status)) statusCounts[row.status] += 1;
    for (const routeId of row.related_route_ids || []) routeIds.add(routeId);
    if ((row.collision_ids || []).length) collisionMemberRows += 1;
    collisionMemberships += (row.collision_ids || []).length;
  }
  for (const [status, count] of Object.entries(statusCounts)) {
    if (Number(packet.counts?.status_counts?.[status] || 0) !== count) issues.push(`status count mismatch for ${status}`);
  }
  if (packet.counts.unique_route_ids !== routeIds.size) issues.push('unique_route_ids must match row route IDs');
  if (packet.counts.collision_member_rows !== collisionMemberRows) issues.push('collision_member_rows must match rows');
  if (packet.counts.collision_memberships !== collisionMemberships) issues.push('collision_memberships must match rows');
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

function hasHebrew(value) {
  return /[\u0590-\u05ff]/.test(String(value || ''));
}

function hasMojibake(value) {
  return /[\u00d7\u00d6\ufffd]/.test(String(value || ''));
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

function readJsonIfExists(relativePath) {
  if (!relativePath) return null;
  const cleanPath = cleanRelativePath(relativePath);
  const fullPath = path.join(root, cleanPath);
  if (!fs.existsSync(fullPath)) return null;
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

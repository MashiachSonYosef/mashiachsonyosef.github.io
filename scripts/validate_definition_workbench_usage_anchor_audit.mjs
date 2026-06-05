#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-anchor-audit.json');
const packet = readJson(packetPath);
const issues = [];
const warnings = [];

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'definition_workbench_usage_anchor_audit') {
  issues.push('artifact_type must be definition_workbench_usage_anchor_audit');
}
if (packet.lane_owner !== 'Agent 3') issues.push('lane_owner must be Agent 3');
if (!packet.input_artifact || !fs.existsSync(path.join(root, cleanRelativePath(packet.input_artifact)))) {
  issues.push('input_artifact must point to an existing occurrence-link packet');
}

validateAuthorityBoundary(packet.authority_boundary || {});
validateRows(packet.audit_rows);
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage anchor audit validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage anchor audit validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage anchor audit validation passed.');
}
console.log(`Audit rows: ${packet.counts.audit_rows}; anchors: ${packet.counts.rows_with_existing_anchor}/${packet.counts.audit_rows}; source refs: ${packet.counts.rows_with_matching_source_ref}/${packet.counts.audit_rows}.`);

function validateAuthorityBoundary(boundary) {
  const expectedTrue = [
    'usage_navigation_only',
    'anchor_audit_only',
    'observed_usage_only',
    'route_ids_only',
  ];
  const expectedFalse = [
    'reader_facing',
    'definition_authority',
    'semantic_arbitration',
    'route_ranking',
    'visible_answer_selection',
    'accepted_text_output',
    'publication_claim',
  ];
  for (const key of expectedTrue) {
    if (boundary[key] !== true) issues.push(`authority_boundary.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (boundary[key] !== false) issues.push(`authority_boundary.${key} must be false`);
  }
}

function validateRows(rows) {
  if (!Array.isArray(rows) || rows.length < 1) {
    issues.push('audit_rows must be a non-empty array');
    return;
  }
  const ids = new Set();
  const allowedStatuses = new Set(['supported', 'candidate', 'weak']);
  for (const [index, row] of rows.entries()) {
    const label = `audit_rows[${index}]`;
    if (!row.audit_id) issues.push(`${label}.audit_id is required`);
    if (!row.row_id) issues.push(`${label}.row_id is required`);
    if (!row.occurrence_id) issues.push(`${label}.occurrence_id is required`);
    if (ids.has(row.occurrence_id)) issues.push(`${label}.occurrence_id must be unique`);
    ids.add(row.occurrence_id);
    if (!row.token_key) issues.push(`${label}.token_key is required`);
    if (!row.token_surface) issues.push(`${label}.token_surface is required`);
    if (!row.token_normalized) issues.push(`${label}.token_normalized is required`);
    if (!row.focus_surface) issues.push(`${label}.focus_surface is required`);
    if (!row.focus_normalized) issues.push(`${label}.focus_normalized is required`);
    if (row.row_label !== 'observed usage only') issues.push(`${label}.row_label must be observed usage only`);
    if (!row.source_ref) issues.push(`${label}.source_ref is required`);
    if (!/^https:\/\//.test(row.source_url || '')) issues.push(`${label}.source_url must be https`);
    if (!row.work_anchor_href || !row.work_anchor_href.includes('#')) issues.push(`${label}.work_anchor_href must include a fragment`);
    if (!row.work_page_path || !fs.existsSync(path.join(root, cleanRelativePath(row.work_page_path)))) {
      issues.push(`${label}.work_page_path must exist`);
    }
    if (!row.work_anchor_fragment) issues.push(`${label}.work_anchor_fragment is required`);
    if (row.work_page_exists !== true) issues.push(`${label}.work_page_exists must be true`);
    if (row.work_anchor_exists !== true) issues.push(`${label}.work_anchor_exists must be true`);
    if (row.source_ref_matches_page_unit !== true) issues.push(`${label}.source_ref_matches_page_unit must be true`);
    if (row.token_surface_found_in_page !== true) issues.push(`${label}.token_surface_found_in_page must be true`);
    if (row.focus_surface_found_in_page !== true) issues.push(`${label}.focus_surface_found_in_page must be true`);
    if (!row.phrase_context_snippet) issues.push(`${label}.phrase_context_snippet is required`);
    if (row.context_has_focus_marker !== true) issues.push(`${label}.context_has_focus_marker must be true`);
    if (!allowedStatuses.has(row.status)) issues.push(`${label}.status must be supported, candidate, or weak`);
    if (!Number.isInteger(row.raw_score) || row.raw_score < 0 || row.raw_score > 100) issues.push(`${label}.raw_score must be 0-100 integer`);
    if (!row.usage_frame_label) issues.push(`${label}.usage_frame_label is required`);
    if (!Array.isArray(row.related_route_ids) || row.related_route_ids.length < 1) {
      issues.push(`${label}.related_route_ids must be non-empty`);
    }
    if (!row.version_title) issues.push(`${label}.version_title is required`);
    if (!row.version_source) issues.push(`${label}.version_source is required`);
    if (!row.license) issues.push(`${label}.license is required`);
    if (!/^https:\/\//.test(row.license_url || '')) issues.push(`${label}.license_url must be https`);
    validateUsageBoundary(row.usage_boundary || {}, label);
  }
}

function validateUsageBoundary(boundary, label) {
  if (boundary.observed_usage_only !== true) issues.push(`${label}.usage_boundary.observed_usage_only must be true`);
  if (boundary.reader_facing !== false) issues.push(`${label}.usage_boundary.reader_facing must be false`);
  if (boundary.route_ids_only !== true) issues.push(`${label}.usage_boundary.route_ids_only must be true`);
  if (boundary.not_answer_authority !== true) issues.push(`${label}.usage_boundary.not_answer_authority must be true`);
  if (boundary.not_definition_authority !== true) issues.push(`${label}.usage_boundary.not_definition_authority must be true`);
  if (boundary.not_semantic_arbitration !== true) issues.push(`${label}.usage_boundary.not_semantic_arbitration must be true`);
}

function validateCounts(counts) {
  const required = [
    'audit_rows',
    'unique_work_pages',
    'rows_with_source_url',
    'rows_with_local_work_page',
    'rows_with_existing_work_page',
    'rows_with_anchor_fragment',
    'rows_with_existing_anchor',
    'rows_with_matching_source_ref',
    'rows_with_token_surface_in_page',
    'rows_with_focus_surface_in_page',
    'rows_with_context',
    'rows_with_focus_marker',
    'rows_with_license',
    'rows_with_version',
    'rows_with_route_ids',
    'route_ids',
    'supported_rows',
    'candidate_rows',
    'weak_rows',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.audit_rows < 1) issues.push('counts.audit_rows must be positive');
  if (counts.unique_work_pages < 1) issues.push('counts.unique_work_pages must be positive');
  for (const key of [
    'rows_with_source_url',
    'rows_with_local_work_page',
    'rows_with_existing_work_page',
    'rows_with_anchor_fragment',
    'rows_with_existing_anchor',
    'rows_with_matching_source_ref',
    'rows_with_token_surface_in_page',
    'rows_with_focus_surface_in_page',
    'rows_with_context',
    'rows_with_focus_marker',
    'rows_with_license',
    'rows_with_version',
    'rows_with_route_ids',
  ]) {
    if (counts[key] !== counts.audit_rows) issues.push(`counts.${key} must equal audit_rows`);
  }
  if (counts.route_ids < 1) issues.push('counts.route_ids must be positive');
  if (counts.supported_rows < 1 || counts.candidate_rows < 1 || counts.weak_rows < 1) {
    issues.push('supported/candidate/weak counts must all be positive');
  }
  if (counts.reader_facing_rows !== 0) issues.push('counts.reader_facing_rows must be 0');
  if (counts.route_payload_field_hits !== 0) issues.push('counts.route_payload_field_hits must be 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('counts.forbidden_authority_field_hits must be 0');
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length < 1) {
    issues.push('checks must be a non-empty array');
    return;
  }
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
  const ids = new Set(checks.map((check) => check.id));
  for (const required of [
    'audit_rows_present',
    'source_urls_complete',
    'work_pages_exist',
    'anchors_resolve',
    'source_refs_match_units',
    'surface_tokens_present_in_pages',
    'context_focus_complete',
    'license_version_complete',
    'route_ids_only',
    'useful_status_counts_visible',
    'usage_boundary_only',
  ]) {
    if (!ids.has(required)) issues.push(`checks missing ${required}`);
  }
}

function validateForbiddenAuthorityKeys(value) {
  const forbidden = new Set([
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
  const hits = [];
  walk(value, '$');
  if (hits.length) issues.push(`forbidden authority keys present: ${hits.slice(0, 30).join(', ')}`);

  function walk(node, nodePath) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const [index, item] of node.entries()) walk(item, `${nodePath}[${index}]`);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (forbidden.has(key)) hits.push(`${nodePath}.${key}`);
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
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

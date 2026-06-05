#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-sample-gap-audit.json');
const packet = readJson(packetPath);
const issues = [];
const warnings = [];
const forbiddenAuthorityKeys = new Set([
  'definition',
  'definition_text',
  'source_text',
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
if (packet.artifact_type !== 'definition_workbench_usage_sample_gap_audit') {
  issues.push('artifact_type must be definition_workbench_usage_sample_gap_audit');
}
if (!String(packet.policy || '').includes('sample-gap audit')) {
  issues.push('policy must identify a sample-gap audit');
}

validateInputs(packet.inputs || {});
validateAuthorityPolicy(packet.authority_policy || {});
validateSampleOverlapSnapshot(packet.sample_overlap_snapshot || {});
validateSampleBoundary(packet.definition_sample_boundary || {});
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateGapRows(Array.isArray(packet.gap_rows) ? packet.gap_rows : null);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage sample-gap audit validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 140)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage sample-gap audit validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage sample-gap audit validation passed.');
}
console.log(`Gap rows: ${packet.counts.gap_rows}; sample usage links: ${packet.counts.sample_rows_with_usage_links}/${packet.counts.sample_rows}; route IDs: ${packet.counts.route_ids}.`);

function validateInputs(inputs) {
  for (const key of ['usage_link_packet', 'usage_seed_queue']) {
    const value = inputs[key];
    if (!value || !fs.existsSync(path.join(root, cleanRelativePath(value)))) {
      issues.push(`inputs.${key} must point to an existing local artifact`);
    }
  }
}

function validateAuthorityPolicy(policy) {
  const expectedTrue = [
    'usage_navigation_only',
    'sample_gap_audit_only',
    'observed_usage_only',
    'route_ids_only',
    'sample_planning_only',
  ];
  const expectedFalse = [
    'reader_facing',
    'ranks_routes',
    'selects_visible_result',
    'semantic_arbitration',
    'copies_route_payloads',
    'copies_definition_payloads',
    'copies_translation_payloads',
    'publication_claim',
  ];
  for (const key of expectedTrue) {
    if (policy[key] !== true) issues.push(`authority_policy.${key} must be true`);
  }
  for (const key of expectedFalse) {
    if (policy[key] !== false) issues.push(`authority_policy.${key} must be false`);
  }
}

function validateSampleOverlapSnapshot(snapshot) {
  const required = [
    'sample_rows',
    'sample_rows_with_usage_links',
    'sample_rows_with_selected_usage_links',
    'usage_token_rows',
    'usage_tokens_in_sample',
    'usage_tokens_not_in_sample',
  ];
  for (const key of required) {
    if (!Number.isInteger(snapshot[key]) || snapshot[key] < 0) {
      issues.push(`sample_overlap_snapshot.${key} must be a non-negative integer`);
    }
  }
  if (!['sample_has_selected_usage_overlap', 'no_current_sample_overlap'].includes(snapshot.current_overlap_status)) {
    issues.push('sample_overlap_snapshot.current_overlap_status is invalid');
  }
  if (!String(snapshot.gap_interpretation || '').includes('planning gap')) {
    issues.push('sample_overlap_snapshot.gap_interpretation must identify planning-gap scope');
  }
}

function validateSampleBoundary(boundary) {
  if (!String(boundary.status_axis || '').includes('not_review_authority')) {
    issues.push('definition_sample_boundary.status_axis must separate machine status from review authority');
  }
  if (boundary.review_status_axis !== 'lexical_authority_review_status') {
    issues.push('definition_sample_boundary.review_status_axis must be lexical_authority_review_status');
  }
  if (boundary.machine_review_status !== 'unreviewed_machine_sample') {
    issues.push('definition_sample_boundary.machine_review_status must be unreviewed_machine_sample');
  }
  for (const key of [
    'verified_review_status_reserved',
    'answer_role_preserved',
    'source_license_rows_preserved',
    'multi_answer_warnings_preserved',
    'publication_boundary_preserved',
  ]) {
    if (boundary[key] !== true) issues.push(`definition_sample_boundary.${key} must be true`);
  }
}

function validateCounts(counts) {
  const required = [
    'gap_rows',
    'gap_rows_absent_from_sample',
    'sample_rows',
    'sample_rows_with_usage_links',
    'sample_rows_with_selected_usage_links',
    'sample_rows_without_usage_links',
    'usage_token_rows',
    'usage_tokens_in_sample',
    'usage_tokens_not_in_sample',
    'seed_rows',
    'seed_rows_absent_from_sample',
    'usage_occurrence_rows',
    'selected_usage_occurrence_rows',
    'selected_occurrence_links',
    'selected_occurrences_with_source_link',
    'selected_occurrences_with_work_anchor',
    'selected_occurrences_with_context',
    'selected_occurrences_with_license',
    'selected_occurrences_with_version',
    'selected_occurrences_with_route_ids',
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_license_metadata',
    'rows_with_version_metadata',
    'route_ids',
    'unresolved_route_ids',
    'audit_only_ambiguous_rows',
    'route_concentration_warning_visible',
    'sample_overlap_gap_visible',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
  ];
  for (const key of required) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.gap_rows === 0) warnings.push('sample-gap audit has no gap rows');
  if (counts.gap_rows_absent_from_sample !== counts.gap_rows) issues.push('all gap rows must be absent from the current sample');
  if (counts.sample_rows <= 0) issues.push('sample_rows must be positive');
  if (counts.sample_rows_with_usage_links !== 0) {
    warnings.push('current sample has usage links; this audit is no longer a zero-overlap gap packet');
  }
  if (counts.usage_tokens_not_in_sample <= 0) issues.push('usage_tokens_not_in_sample must be positive for this bounded audit');
  if (counts.seed_rows !== counts.gap_rows) issues.push('seed_rows must equal gap_rows');
  if (counts.seed_rows_absent_from_sample !== counts.gap_rows) issues.push('seed_rows_absent_from_sample must equal gap_rows');
  if (counts.usage_occurrence_rows <= 0) issues.push('usage_occurrence_rows must be positive');
  if (counts.selected_usage_occurrence_rows <= 0) issues.push('selected_usage_occurrence_rows must be positive');
  if (counts.selected_occurrence_links <= 0) issues.push('selected_occurrence_links must be positive');
  for (const key of [
    'selected_occurrences_with_source_link',
    'selected_occurrences_with_work_anchor',
    'selected_occurrences_with_context',
    'selected_occurrences_with_license',
    'selected_occurrences_with_version',
    'selected_occurrences_with_route_ids',
    'rows_with_source_link',
    'rows_with_work_anchor',
    'rows_with_hebrew_context',
    'rows_with_focus_marker',
    'rows_with_license_metadata',
    'rows_with_version_metadata',
  ]) {
    if (counts[key] !== counts.selected_occurrence_links) {
      issues.push(`counts.${key} must equal selected_occurrence_links`);
    }
  }
  if (counts.route_ids <= 0) issues.push('route_ids must be positive');
  if (counts.unresolved_route_ids !== 0) issues.push('unresolved_route_ids must remain 0');
  if (counts.audit_only_ambiguous_rows <= 0) issues.push('audit_only_ambiguous_rows must be positive');
  if (counts.route_concentration_warning_visible !== 1) warnings.push('route concentration warning is not visible');
  if (counts.sample_overlap_gap_visible !== 1) warnings.push('sample overlap gap is not visible');
  if (counts.reader_facing_rows !== 0) issues.push('reader_facing_rows must remain 0');
  if (counts.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must remain 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must remain 0');
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
  if (!checks.some((check) => check.id === 'sample_overlap_gap_visible')) {
    issues.push('checks must include sample_overlap_gap_visible');
  }
}

function validateGapRows(rows) {
  if (!rows) {
    issues.push('gap_rows must be an array');
    return;
  }
  if (rows.length !== packet.counts?.gap_rows) issues.push('gap_rows length must match counts.gap_rows');
  for (const [index, row] of rows.entries()) {
    const context = `gap_rows[${index}]`;
    for (const field of ['gap_id', 'seed_id', 'token_key', 'normalized_form', 'current_sample_link_status', 'recommended_next_action']) {
      requireString(row[field], `${context}.${field}`);
    }
    if (row.current_sample_link_status !== 'absent_from_current_definition_workbench_sample') {
      issues.push(`${context}.current_sample_link_status must be absent_from_current_definition_workbench_sample`);
    }
    if (row.recommended_next_action !== 'include_token_in_next_definition_workbench_sample_join_smoke') {
      issues.push(`${context}.recommended_next_action must remain sample-join smoke only`);
    }
    requireBoundary(row.gap_boundary, `${context}.gap_boundary`);
    if (!Array.isArray(row.route_ids) || row.route_ids.length === 0) issues.push(`${context}.route_ids must contain route ID-only linkage`);
    if (!Array.isArray(row.occurrence_links) || row.occurrence_links.length === 0) issues.push(`${context}.occurrence_links must be non-empty`);
    if (row.selected_occurrence_link_count !== row.occurrence_links.length) {
      issues.push(`${context}.selected_occurrence_link_count must match occurrence_links length`);
    }
    for (const [occurrenceIndex, occurrence] of (row.occurrence_links || []).entries()) {
      const occurrenceContext = `${context}.occurrence_links[${occurrenceIndex}]`;
      for (const field of ['occurrence_id', 'source_ref', 'source_href', 'work_anchor_href', 'status', 'cluster_id', 'usage_frame_label', 'context_focus_marked', 'license', 'license_url', 'version_title', 'version_source']) {
        requireString(occurrence[field], `${occurrenceContext}.${field}`);
      }
      if (!Array.isArray(occurrence.route_ids) || occurrence.route_ids.length === 0) {
        issues.push(`${occurrenceContext}.route_ids must contain route ID-only linkage`);
      }
      requireOccurrenceBoundary(occurrence.occurrence_boundary, `${occurrenceContext}.occurrence_boundary`);
    }
  }
}

function requireBoundary(boundary, context) {
  const expectedTrue = [
    'observed_usage_only',
    'sample_gap_audit_only',
    'sample_planning_only',
    'route_ids_only',
    'not_answer_authority',
    'not_definition_authority',
    'not_semantic_arbitration',
    'not_publication_support',
  ];
  const expectedFalse = ['reader_facing'];
  requireBoundaryValues(boundary, context, expectedTrue, expectedFalse);
}

function requireOccurrenceBoundary(boundary, context) {
  const expectedTrue = ['observed_usage_only', 'route_ids_only', 'not_answer_authority', 'not_semantic_arbitration'];
  const expectedFalse = ['reader_facing'];
  requireBoundaryValues(boundary, context, expectedTrue, expectedFalse);
}

function requireBoundaryValues(boundary, context, expectedTrue, expectedFalse) {
  if (!boundary || typeof boundary !== 'object') {
    issues.push(`${context} must be an object`);
    return;
  }
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

function requireString(value, field) {
  if (typeof value !== 'string' || value.length === 0) issues.push(`${field} must be a non-empty string`);
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

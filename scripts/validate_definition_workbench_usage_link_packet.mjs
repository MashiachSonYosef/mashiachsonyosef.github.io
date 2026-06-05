#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-link-packet.json');
const packet = readJson(packetPath);
const issues = [];
const warnings = [];
const allowedSampleStatuses = new Set(['missing', 'proposed_only', 'single_answer_source_complete', 'conflicting', 'low_confidence', 'unreviewed']);
const allowedReviewStatuses = new Set(['unreviewed_machine_sample']);

const forbiddenAuthorityKeys = new Set([
  'definition',
  'definition_text',
  'source_text',
  'meaning',
  'meaning_claim',
  'translation',
  'translation_text',
  'accepted_translation',
  'publication_status',
  'final_answer',
  'winner',
  'route_payload',
  'route_payloads',
  'route_links',
]);

if (packet.schema_version !== 1) issues.push('schema_version must be 1');
if (packet.artifact_type !== 'definition_workbench_usage_link_packet') {
  issues.push('artifact_type must be definition_workbench_usage_link_packet');
}
if (!packet.inputs?.definition_workbench_sample) issues.push('inputs.definition_workbench_sample is required');
if (!packet.inputs?.usage_lookup_index) issues.push('inputs.usage_lookup_index is required');
if (!packet.inputs?.selected_occurrence_navigation_index) issues.push('inputs.selected_occurrence_navigation_index is required');
if (!packet.inputs?.route_link_check) issues.push('inputs.route_link_check is required');

validateDefinitionSampleContract(packet.definition_sample_contract || {});
validateAuthorityPolicy(packet.authority_policy || {});
validateCounts(packet.counts || {});
validateChecks(packet.checks || []);
validateRows(packet);
validateForbiddenAuthorityKeys(packet);

if (issues.length) {
  console.error(`Definition Workbench usage-link packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage-link packet validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage-link packet validation passed.');
}
console.log(`Sample rows: ${packet.counts.sample_rows}; linked sample rows: ${packet.counts.sample_rows_with_usage_links}; usage tokens: ${packet.counts.usage_token_rows}; selected occurrence samples: ${packet.counts.selected_sample_occurrences}.`);

function validateDefinitionSampleContract(contract) {
  if (!String(contract.status_axis || '').includes('not_review_authority')) {
    issues.push('definition_sample_contract.status_axis must separate machine status from review authority');
  }
  if (!String(contract.review_status_axis || '').includes('lexical_authority_review_status')) {
    issues.push('definition_sample_contract.review_status_axis must identify lexical authority review status');
  }
  if (!String(contract.review_policy || '').includes('review_status=verified')) {
    issues.push('definition_sample_contract.review_policy must reserve review_status=verified outside the machine sample');
  }
  if (!String(contract.answer_role_policy || '').includes('answer_role=answer')) {
    issues.push('definition_sample_contract.answer_role_policy must preserve answer_role=answer filtering');
  }
  if (!String(contract.source_license_policy || '').includes('source_rows')) {
    issues.push('definition_sample_contract.source_license_policy must preserve source/license row checks');
  }
  if (!String(contract.multi_answer_policy || '').includes('multi_answer=true')) {
    issues.push('definition_sample_contract.multi_answer_policy must preserve multi-answer warnings');
  }
  validatePublicationBoundary(contract.publication_boundary, 'definition_sample_contract.publication_boundary');
}

function validateAuthorityPolicy(policy) {
  const expectedTrue = [
    'usage_navigation_only',
    'usage_rows_not_definition_authority',
    'review_status_not_definition_authority',
    'route_ids_only',
  ];
  const expectedFalse = [
    'reader_facing',
    'ranks_routes',
    'selects_visible_result',
    'ambiguous_rows_reader_facing',
    'copies_route_payloads',
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

function validateCounts(counts) {
  const requiredIntegerCounts = [
    'sample_rows',
    'sample_rows_with_usage_links',
    'sample_rows_without_usage_links',
    'sample_rows_with_selected_usage_links',
    'sample_rows_with_complete_source_license',
    'multi_answer_sample_rows',
    'sample_forbidden_verified_label_rows',
    'usage_token_rows',
    'usage_tokens_in_sample',
    'usage_tokens_not_in_sample',
    'usage_occurrence_rows',
    'selected_usage_occurrence_rows',
    'selected_sample_occurrences',
    'selected_sample_occurrences_with_source_link',
    'selected_sample_occurrences_with_work_anchor',
    'selected_sample_occurrences_with_context',
    'selected_sample_occurrences_with_license',
    'selected_sample_occurrences_with_route_ids',
    'audit_only_ambiguous_rows',
    'route_ids',
    'route_links_resolved',
    'route_links_unresolved',
    'route_concentration_warning_visible',
    'reader_facing_rows',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
  ];
  for (const key of requiredIntegerCounts) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.sample_rows_with_usage_links + counts.sample_rows_without_usage_links !== counts.sample_rows) {
    issues.push('sample row link counts do not reconcile');
  }
  if (counts.sample_rows_with_complete_source_license !== counts.sample_rows) {
    issues.push('all sample rows must preserve complete source/license flags');
  }
  if (counts.sample_forbidden_verified_label_rows !== 0) {
    issues.push('machine sample rows must not carry status=verified or review_status=verified');
  }
  if (!counts.sample_status_counts || typeof counts.sample_status_counts !== 'object') issues.push('sample_status_counts is required');
  if (!counts.sample_review_status_counts || typeof counts.sample_review_status_counts !== 'object') issues.push('sample_review_status_counts is required');
  if (sumCountObject(counts.sample_status_counts || {}) !== counts.sample_rows) {
    issues.push('sample_status_counts must sum to sample_rows');
  }
  if (sumCountObject(counts.sample_review_status_counts || {}) !== counts.sample_rows) {
    issues.push('sample_review_status_counts must sum to sample_rows');
  }
  if (Number(counts.sample_status_counts?.conflicting || 0) !== counts.multi_answer_sample_rows) {
    issues.push('multi_answer_sample_rows must match conflicting sample status count');
  }
  for (const status of Object.keys(counts.sample_status_counts || {})) {
    if (!allowedSampleStatuses.has(status)) issues.push(`sample_status_counts has invalid status ${status}`);
  }
  for (const status of Object.keys(counts.sample_review_status_counts || {})) {
    if (!allowedReviewStatuses.has(status)) issues.push(`sample_review_status_counts has invalid status ${status}`);
  }
  if (counts.usage_tokens_in_sample + counts.usage_tokens_not_in_sample !== counts.usage_token_rows) {
    issues.push('usage token sample-overlap counts do not reconcile');
  }
  if (counts.reader_facing_rows !== 0) issues.push('reader_facing_rows must remain 0');
  if (counts.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must remain 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must remain 0');
  if (counts.route_links_unresolved !== 0) issues.push('route_links_unresolved must remain 0');
  if (counts.audit_only_ambiguous_rows <= 0) issues.push('audit_only_ambiguous_rows must be preserved as a positive count');
  if (counts.route_ids <= 0) issues.push('at least one route ID linkage is expected');
  if (counts.selected_usage_occurrence_rows <= 0) issues.push('selected usage occurrence rows must be present');
  if (counts.selected_sample_occurrences <= 0) issues.push('selected occurrence samples must be present');
  if (counts.selected_sample_occurrences_with_source_link !== counts.selected_sample_occurrences) {
    issues.push('selected occurrence samples must all include source links');
  }
  if (counts.selected_sample_occurrences_with_work_anchor !== counts.selected_sample_occurrences) {
    issues.push('selected occurrence samples must all include work/page anchors');
  }
  if (counts.selected_sample_occurrences_with_context !== counts.selected_sample_occurrences) {
    issues.push('selected occurrence samples must all include context snippets');
  }
  if (counts.selected_sample_occurrences_with_license !== counts.selected_sample_occurrences) {
    issues.push('selected occurrence samples must all include license metadata');
  }
  if (counts.selected_sample_occurrences_with_route_ids !== counts.selected_sample_occurrences) {
    issues.push('selected occurrence samples must all include route IDs');
  }
  if (counts.sample_rows_with_usage_links === 0 && counts.usage_tokens_not_in_sample <= 0) {
    issues.push('no-overlap packet must preserve a usage token outside the current Definition Workbench sample');
  }
  if (counts.sample_rows_with_usage_links === 0) {
    warnings.push('current Definition Workbench sample has no overlap with selected Agent 3 usage token scope');
  }
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
  const overlapCheck = checks.find((check) => check.id === 'sample_overlap_visible');
  if (!overlapCheck) issues.push('sample_overlap_visible check is required');
}

function validateRows(packetData) {
  const sampleRows = Array.isArray(packetData.sample_rows) ? packetData.sample_rows : null;
  const usageRows = Array.isArray(packetData.usage_token_rows) ? packetData.usage_token_rows : null;
  if (!sampleRows) issues.push('sample_rows must be an array');
  if (!usageRows) issues.push('usage_token_rows must be an array');
  if (!sampleRows || !usageRows) return;

  if (sampleRows.length !== packetData.counts.sample_rows) issues.push('sample_rows length does not match counts.sample_rows');
  if (usageRows.length !== packetData.counts.usage_token_rows) issues.push('usage_token_rows length does not match counts.usage_token_rows');

  for (const [index, row] of sampleRows.entries()) {
    const context = `sample_rows[${index}]`;
    requireString(row.sample_row_id, `${context}.sample_row_id`);
    requireString(row.token_key, `${context}.token_key`);
    requireString(row.normalized_form, `${context}.normalized_form`);
    if (!allowedSampleStatuses.has(row.status)) issues.push(`${context}.status is invalid`);
    if (row.status === 'verified') issues.push(`${context}.status=verified is forbidden for machine sample linkage`);
    if (!allowedReviewStatuses.has(row.review_status)) issues.push(`${context}.review_status is invalid`);
    if (row.review_status === 'verified') issues.push(`${context}.review_status=verified is forbidden for machine sample linkage`);
    if (row.status === 'single_answer_source_complete' && row.source_license_complete !== true) {
      issues.push(`${context}.single_answer_source_complete requires source_license_complete=true`);
    }
    if (row.multi_answer === true && row.status !== 'conflicting') {
      issues.push(`${context}.multi_answer=true must preserve conflicting status`);
    }
    requireBooleanBoundary(row.usage_boundary, `${context}.usage_boundary`);
    if (!Number.isInteger(row.usage_link_count) || row.usage_link_count < 0) issues.push(`${context}.usage_link_count must be a non-negative integer`);
    if (!Number.isInteger(row.selected_usage_link_count) || row.selected_usage_link_count < 0) issues.push(`${context}.selected_usage_link_count must be a non-negative integer`);
    if (!Array.isArray(row.usage_route_ids)) issues.push(`${context}.usage_route_ids must be an array of route IDs`);
  }

  for (const [index, row] of usageRows.entries()) {
    const context = `usage_token_rows[${index}]`;
    requireString(row.token_key, `${context}.token_key`);
    requireString(row.normalized_form, `${context}.normalized_form`);
    if (row.in_definition_workbench_sample) {
      if (!allowedSampleStatuses.has(row.sample_status)) issues.push(`${context}.sample_status is invalid`);
      if (!allowedReviewStatuses.has(row.sample_review_status)) issues.push(`${context}.sample_review_status is invalid`);
      if (row.sample_status === 'verified' || row.sample_review_status === 'verified') {
        issues.push(`${context}: verified sample status is forbidden for machine usage-link packets`);
      }
    }
    requireBooleanBoundary(row.usage_boundary, `${context}.usage_boundary`);
    if (!Number.isInteger(row.usage_occurrence_rows) || row.usage_occurrence_rows < 0) issues.push(`${context}.usage_occurrence_rows must be a non-negative integer`);
    if (!Number.isInteger(row.selected_usage_occurrence_rows) || row.selected_usage_occurrence_rows < 0) issues.push(`${context}.selected_usage_occurrence_rows must be a non-negative integer`);
    if (!Array.isArray(row.route_ids) || row.route_ids.length === 0) issues.push(`${context}.route_ids must include route ID-only linkage`);
    if (!Array.isArray(row.sample_occurrences) || row.sample_occurrences.length === 0) issues.push(`${context}.sample_occurrences must include selected occurrence samples`);
    for (const [occurrenceIndex, occurrence] of (row.sample_occurrences || []).entries()) {
      const occurrenceContext = `${context}.sample_occurrences[${occurrenceIndex}]`;
      requireString(occurrence.occurrence_id, `${occurrenceContext}.occurrence_id`);
      requireString(occurrence.source_ref, `${occurrenceContext}.source_ref`);
      requireString(occurrence.source_href, `${occurrenceContext}.source_href`);
      requireString(occurrence.work_anchor_href, `${occurrenceContext}.work_anchor_href`);
      requireString(occurrence.context_focus_marked, `${occurrenceContext}.context_focus_marked`);
      requireString(occurrence.license, `${occurrenceContext}.license`);
      requireString(occurrence.license_url, `${occurrenceContext}.license_url`);
      requireString(occurrence.version_source, `${occurrenceContext}.version_source`);
      requireBooleanBoundary(occurrence.occurrence_boundary, `${occurrenceContext}.occurrence_boundary`);
      if (!Array.isArray(occurrence.route_ids) || occurrence.route_ids.length === 0) {
        issues.push(`${occurrenceContext}.route_ids must include route ID-only linkage`);
      }
    }
  }
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

function requireBooleanBoundary(boundary, context) {
  if (!boundary || typeof boundary !== 'object') {
    issues.push(`${context} must be an object`);
    return;
  }
  if (boundary.observed_usage_only !== true) issues.push(`${context}.observed_usage_only must be true`);
  if (boundary.reader_facing !== false) issues.push(`${context}.reader_facing must be false`);
  if (boundary.route_ids_only !== true) issues.push(`${context}.route_ids_only must be true`);
  if (boundary.not_definition_authority !== true) issues.push(`${context}.not_definition_authority must be true`);
}

function validatePublicationBoundary(boundary, context) {
  if (!boundary || typeof boundary !== 'object') {
    issues.push(`${context} must be an object`);
    return;
  }
  if (boundary.boundary_status !== 'blocked_no_render') issues.push(`${context}.boundary_status must be blocked_no_render`);
  if (boundary.sample_only !== true) issues.push(`${context}.sample_only must be true`);
  for (const key of [
    'reader_facing',
    'ui_assignment',
    'publication_claim',
    'clears_publication_readiness',
    'reviewed_lexical_authority',
    'accepted_translation_output',
    'source_publication',
    'public_lookup_artifact',
  ]) {
    if (boundary[key] !== false) issues.push(`${context}.${key} must be false`);
  }
  const blockedClaims = new Set(Array.isArray(boundary.does_not_clear) ? boundary.does_not_clear : []);
  for (const required of [
    'ui_assignment',
    'reviewed_lexical_authority',
    'accepted_translation',
    'source_publication',
    'public_lookup_publication',
    'publication_readiness',
  ]) {
    if (!blockedClaims.has(required)) issues.push(`${context}.does_not_clear must include ${required}`);
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
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function sumCountObject(value) {
  return Object.values(value || {}).reduce((sum, count) => sum + Number(count || 0), 0);
}

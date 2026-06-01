#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const smokePath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-join-smoke.json');
const smoke = readJson(smokePath);
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
  'publication_status',
  'final_answer',
  'winner',
  'route_payload',
  'route_payloads',
  'route_links',
]);

if (smoke.schema_version !== 1) issues.push('schema_version must be 1');
if (smoke.artifact_type !== 'definition_workbench_usage_join_smoke') {
  issues.push('artifact_type must be definition_workbench_usage_join_smoke');
}
if (!smoke.inputs?.definition_workbench_sample) issues.push('inputs.definition_workbench_sample is required');
if (!smoke.inputs?.usage_seed_queue) issues.push('inputs.usage_seed_queue is required');

validateAuthorityPolicy(smoke.authority_policy || {});
validateSnapshots(smoke);
validateCounts(smoke.counts || {});
validateChecks(smoke.checks || []);
validateJoinRows(smoke.join_rows);
validateForbiddenAuthorityKeys(smoke);

if (issues.length) {
  console.error(`Definition Workbench usage join smoke validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage join smoke validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage join smoke validation passed.');
}
console.log(`Join rows: ${smoke.counts.join_rows}; absent seeds: ${smoke.counts.seed_rows_absent_from_sample}; occurrence links: ${smoke.counts.occurrence_links}.`);

function validateAuthorityPolicy(policy) {
  const expectedTrue = [
    'usage_navigation_only',
    'join_smoke_only',
    'live_sample_unchanged',
    'usage_rows_not_answer_authority',
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

function validateSnapshots(smokeData) {
  const sample = smokeData.current_sample_snapshot || {};
  const seed = smokeData.seed_queue_snapshot || {};
  if (!Number.isInteger(sample.rows) || sample.rows < 1) issues.push('current_sample_snapshot.rows must be a positive integer');
  if (sample.usage_link_status !== 'not_mutated_by_agent3_join_smoke') {
    issues.push('current_sample_snapshot.usage_link_status must state live sample is not mutated');
  }
  if (!Number.isInteger(seed.rows) || seed.rows < 1) issues.push('seed_queue_snapshot.rows must be a positive integer');
  if (!Number.isInteger(seed.occurrence_links) || seed.occurrence_links < 1) {
    issues.push('seed_queue_snapshot.occurrence_links must be positive');
  }
  if (!Number.isInteger(seed.route_ids) || seed.route_ids < 1) issues.push('seed_queue_snapshot.route_ids must be positive');
}

function validateCounts(counts) {
  const requiredIntegerCounts = [
    'sample_rows_checked',
    'seed_rows_checked',
    'join_rows',
    'seed_rows_absent_from_sample',
    'seed_rows_already_in_sample',
    'projected_rows_after_seed_append',
    'projected_usage_link_rows',
    'selected_usage_occurrence_links',
    'occurrence_links',
    'occurrence_links_with_source',
    'occurrence_links_with_work_anchor',
    'occurrence_links_with_context',
    'occurrence_links_with_license',
    'occurrence_links_with_version',
    'occurrence_links_with_route_ids',
    'route_ids',
    'route_payload_field_hits',
    'reader_facing_rows',
    'audit_only_ambiguous_rows',
    'route_concentration_warning_visible',
    'forbidden_authority_field_hits',
  ];
  for (const key of requiredIntegerCounts) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.sample_rows_checked < 1) issues.push('sample_rows_checked must be positive');
  if (counts.seed_rows_checked < 1) issues.push('seed_rows_checked must be positive');
  if (counts.join_rows !== counts.seed_rows_checked) issues.push('join_rows must match seed_rows_checked');
  if (counts.seed_rows_absent_from_sample + counts.seed_rows_already_in_sample !== counts.join_rows) {
    issues.push('seed presence counts do not reconcile with join_rows');
  }
  if (counts.seed_rows_absent_from_sample < 1) warnings.push('no absent seeds were found for the current sample');
  if (counts.projected_rows_after_seed_append !== counts.sample_rows_checked + counts.seed_rows_absent_from_sample) {
    issues.push('projected_rows_after_seed_append must equal sample rows plus absent seeds');
  }
  if (counts.projected_usage_link_rows < counts.selected_usage_occurrence_links) {
    issues.push('projected_usage_link_rows must cover selected occurrence links');
  }
  if (counts.occurrence_links < 1) issues.push('occurrence_links must be positive');
  if (counts.occurrence_links_with_source !== counts.occurrence_links) issues.push('all occurrence links must include source links');
  if (counts.occurrence_links_with_work_anchor !== counts.occurrence_links) issues.push('all occurrence links must include work/page anchors');
  if (counts.occurrence_links_with_context !== counts.occurrence_links) issues.push('all occurrence links must include context snippets');
  if (counts.occurrence_links_with_license !== counts.occurrence_links) issues.push('all occurrence links must include license metadata');
  if (counts.occurrence_links_with_version !== counts.occurrence_links) issues.push('all occurrence links must include version metadata');
  if (counts.occurrence_links_with_route_ids !== counts.occurrence_links) issues.push('all occurrence links must include route IDs');
  if (counts.route_ids < 1) issues.push('route_ids must be positive');
  if (counts.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must remain 0');
  if (counts.reader_facing_rows !== 0) issues.push('reader_facing_rows must remain 0');
  if (counts.audit_only_ambiguous_rows <= 0) issues.push('audit_only_ambiguous_rows must be carried forward');
  if (counts.route_concentration_warning_visible !== 1) warnings.push('route concentration warning is not visible');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must remain 0');
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
}

function validateJoinRows(rows) {
  if (!Array.isArray(rows)) {
    issues.push('join_rows must be an array');
    return;
  }
  if (rows.length !== smoke.counts?.join_rows) issues.push('join_rows length must match counts.join_rows');
  for (const [index, row] of rows.entries()) {
    const context = `join_rows[${index}]`;
    requireString(row.join_smoke_id, `${context}.join_smoke_id`);
    requireString(row.seed_id, `${context}.seed_id`);
    requireString(row.token_key, `${context}.token_key`);
    requireString(row.normalized_form, `${context}.normalized_form`);
    if (typeof row.token_key_in_current_sample !== 'boolean') issues.push(`${context}.token_key_in_current_sample must be boolean`);
    if (typeof row.normalized_form_in_current_sample !== 'boolean') issues.push(`${context}.normalized_form_in_current_sample must be boolean`);
    if (!['seed_absent_from_current_sample', 'already_in_current_sample'].includes(row.join_status)) {
      issues.push(`${context}.join_status is invalid`);
    }
    if (row.join_status === 'seed_absent_from_current_sample' && (row.token_key_in_current_sample || row.normalized_form_in_current_sample)) {
      issues.push(`${context}.join_status contradicts sample presence flags`);
    }
    if (row.recommended_next_action !== 'include_token_in_next_definition_workbench_sample_join_smoke') {
      issues.push(`${context}.recommended_next_action must remain a sample-join smoke action`);
    }
    if (!Number.isInteger(row.projected_usage_link_count) || row.projected_usage_link_count < 1) {
      issues.push(`${context}.projected_usage_link_count must be positive`);
    }
    if (row.projected_usage_link_status !== 'usage_navigation_join_available_seed_only') {
      issues.push(`${context}.projected_usage_link_status must be seed-only usage navigation`);
    }
    if (!Number.isInteger(row.selected_occurrence_link_count) || row.selected_occurrence_link_count < 1) {
      issues.push(`${context}.selected_occurrence_link_count must be positive`);
    }
    requireBoundary(row.join_boundary, `${context}.join_boundary`);
    if (!Array.isArray(row.route_ids) || row.route_ids.length === 0) issues.push(`${context}.route_ids must contain route ID-only linkage`);
    if (!Array.isArray(row.occurrence_links) || row.occurrence_links.length === 0) issues.push(`${context}.occurrence_links must be non-empty`);
    if (row.selected_occurrence_link_count !== row.occurrence_links.length) issues.push(`${context}.selected_occurrence_link_count must match occurrence_links length`);
    for (const [occurrenceIndex, occurrence] of (row.occurrence_links || []).entries()) {
      const occurrenceContext = `${context}.occurrence_links[${occurrenceIndex}]`;
      requireString(occurrence.occurrence_id, `${occurrenceContext}.occurrence_id`);
      requireString(occurrence.source_ref, `${occurrenceContext}.source_ref`);
      requireString(occurrence.source_href, `${occurrenceContext}.source_href`);
      requireString(occurrence.work_anchor_href, `${occurrenceContext}.work_anchor_href`);
      requireString(occurrence.context_focus_marked, `${occurrenceContext}.context_focus_marked`);
      requireString(occurrence.license, `${occurrenceContext}.license`);
      requireString(occurrence.license_url, `${occurrenceContext}.license_url`);
      requireString(occurrence.version_title, `${occurrenceContext}.version_title`);
      requireString(occurrence.version_source, `${occurrenceContext}.version_source`);
      requireOccurrenceBoundary(occurrence.occurrence_boundary, `${occurrenceContext}.occurrence_boundary`);
      if (!Array.isArray(occurrence.route_ids) || occurrence.route_ids.length === 0) {
        issues.push(`${occurrenceContext}.route_ids must contain route ID-only linkage`);
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

function requireBoundary(boundary, context) {
  if (!boundary || typeof boundary !== 'object') {
    issues.push(`${context} must be an object`);
    return;
  }
  if (boundary.observed_usage_only !== true) issues.push(`${context}.observed_usage_only must be true`);
  if (boundary.join_smoke_only !== true) issues.push(`${context}.join_smoke_only must be true`);
  if (boundary.reader_facing !== false) issues.push(`${context}.reader_facing must be false`);
  if (boundary.route_ids_only !== true) issues.push(`${context}.route_ids_only must be true`);
  if (boundary.not_answer_authority !== true) issues.push(`${context}.not_answer_authority must be true`);
  if (boundary.not_publication_support !== true) issues.push(`${context}.not_publication_support must be true`);
  if (boundary.live_sample_unchanged !== true) issues.push(`${context}.live_sample_unchanged must be true`);
}

function requireOccurrenceBoundary(boundary, context) {
  if (!boundary || typeof boundary !== 'object') {
    issues.push(`${context} must be an object`);
    return;
  }
  if (boundary.observed_usage_only !== true) issues.push(`${context}.observed_usage_only must be true`);
  if (boundary.reader_facing !== false) issues.push(`${context}.reader_facing must be false`);
  if (boundary.route_ids_only !== true) issues.push(`${context}.route_ids_only must be true`);
  if (boundary.not_answer_authority !== true) issues.push(`${context}.not_answer_authority must be true`);
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

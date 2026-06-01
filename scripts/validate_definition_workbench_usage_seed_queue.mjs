#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const queuePath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-seed-queue.json');
const queue = readJson(queuePath);
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

if (queue.schema_version !== 1) issues.push('schema_version must be 1');
if (queue.artifact_type !== 'definition_workbench_usage_seed_queue') {
  issues.push('artifact_type must be definition_workbench_usage_seed_queue');
}
if (!queue.inputs?.usage_link_packet) issues.push('inputs.usage_link_packet is required');

validateAuthorityPolicy(queue.authority_policy || {});
validateCounts(queue.counts || {});
validateChecks(queue.checks || []);
validateSeedRows(queue.seed_rows);
validateForbiddenAuthorityKeys(queue);

if (issues.length) {
  console.error(`Definition Workbench usage seed queue validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`Definition Workbench usage seed queue validation passed with ${warnings.length} warning(s).`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
} else {
  console.log('Definition Workbench usage seed queue validation passed.');
}
console.log(`Seed rows: ${queue.counts.seed_rows}; occurrence links: ${queue.counts.occurrence_links}; route IDs: ${queue.counts.route_ids}.`);

function validateAuthorityPolicy(policy) {
  const expectedTrue = [
    'usage_navigation_only',
    'sample_planning_only',
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

function validateCounts(counts) {
  const requiredIntegerCounts = [
    'seed_rows',
    'seed_rows_absent_from_sample',
    'usage_occurrence_rows',
    'selected_usage_occurrence_rows',
    'occurrence_links',
    'occurrence_links_with_source',
    'occurrence_links_with_work_anchor',
    'occurrence_links_with_context',
    'occurrence_links_with_license',
    'occurrence_links_with_version',
    'occurrence_links_with_route_ids',
    'route_ids',
    'unresolved_route_links',
    'route_payload_field_hits',
    'reader_facing_rows',
    'audit_only_ambiguous_rows',
    'route_concentration_warning_visible',
    'forbidden_authority_field_hits',
  ];
  for (const key of requiredIntegerCounts) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) issues.push(`counts.${key} must be a non-negative integer`);
  }
  if (counts.seed_rows_absent_from_sample !== counts.seed_rows) {
    issues.push('all seed rows must be absent from the current Definition Workbench sample');
  }
  if (counts.seed_rows === 0) warnings.push('seed queue is empty; no current usage tokens need sample inclusion');
  if (counts.seed_rows > 0 && counts.occurrence_links <= 0) issues.push('non-empty seed queue must include occurrence links');
  if (counts.occurrence_links_with_source !== counts.occurrence_links) issues.push('all occurrence links must include source links');
  if (counts.occurrence_links_with_work_anchor !== counts.occurrence_links) issues.push('all occurrence links must include work/page anchors');
  if (counts.occurrence_links_with_context !== counts.occurrence_links) issues.push('all occurrence links must include context snippets');
  if (counts.occurrence_links_with_license !== counts.occurrence_links) issues.push('all occurrence links must include license metadata');
  if (counts.occurrence_links_with_version !== counts.occurrence_links) issues.push('all occurrence links must include version metadata');
  if (counts.occurrence_links_with_route_ids !== counts.occurrence_links) issues.push('all occurrence links must include route IDs');
  if (counts.unresolved_route_links !== 0) issues.push('unresolved_route_links must remain 0');
  if (counts.route_payload_field_hits !== 0) issues.push('route_payload_field_hits must remain 0');
  if (counts.reader_facing_rows !== 0) issues.push('reader_facing_rows must remain 0');
  if (counts.forbidden_authority_field_hits !== 0) issues.push('forbidden_authority_field_hits must remain 0');
  if (counts.audit_only_ambiguous_rows <= 0) issues.push('audit_only_ambiguous_rows must be carried forward');
  if (counts.route_concentration_warning_visible !== 1) warnings.push('route concentration warning is not visible on the seed queue');
}

function validateChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) issues.push('checks must be a non-empty array');
  const failed = checks.filter((check) => check.status === 'failed');
  if (failed.length) issues.push(`checks contain failed rows: ${failed.map((check) => check.id).join(', ')}`);
}

function validateSeedRows(rows) {
  if (!Array.isArray(rows)) {
    issues.push('seed_rows must be an array');
    return;
  }
  if (rows.length !== queue.counts?.seed_rows) issues.push('seed_rows length must match counts.seed_rows');
  for (const [index, row] of rows.entries()) {
    const context = `seed_rows[${index}]`;
    requireString(row.seed_id, `${context}.seed_id`);
    requireString(row.token_key, `${context}.token_key`);
    requireString(row.normalized_form, `${context}.normalized_form`);
    if (row.current_sample_link_status !== 'absent_from_current_definition_workbench_sample') {
      issues.push(`${context}.current_sample_link_status must be absent_from_current_definition_workbench_sample`);
    }
    if (row.recommended_next_action !== 'include_token_in_next_definition_workbench_sample_join_smoke') {
      issues.push(`${context}.recommended_next_action must be sample-join smoke only`);
    }
    requireBoundary(row.seed_boundary, `${context}.seed_boundary`);
    if (!Array.isArray(row.route_ids) || row.route_ids.length === 0) issues.push(`${context}.route_ids must contain route ID-only linkage`);
    if (!Array.isArray(row.occurrence_links) || row.occurrence_links.length === 0) issues.push(`${context}.occurrence_links must be non-empty`);
    if (!Number.isInteger(row.usage_occurrence_rows) || row.usage_occurrence_rows < 1) issues.push(`${context}.usage_occurrence_rows must be positive`);
    if (!Number.isInteger(row.selected_usage_occurrence_rows) || row.selected_usage_occurrence_rows < 1) issues.push(`${context}.selected_usage_occurrence_rows must be positive`);
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
      requireBoundary(occurrence.occurrence_boundary, `${occurrenceContext}.occurrence_boundary`);
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

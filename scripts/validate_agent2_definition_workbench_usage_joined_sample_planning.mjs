#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || 'data/definitions/agent2-definition-workbench-usage-joined-sample-planning.json');
const artifact = readJson(artifactPath);
const issues = [];
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
]);

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent2_definition_workbench_usage_joined_sample_planning', 'unexpected artifact_type');
validateAuthorityPolicy(artifact.authority_policy || {});
validateProjectedSnapshot(artifact.projected_joined_sample_snapshot || {});
validateCounts(artifact.counts || {});
validateRows(Array.isArray(artifact.projected_rows) ? artifact.projected_rows : null);
validateForbiddenAuthorityKeys(artifact);

if (issues.length) {
  console.error(`Agent 2 joined-sample planning validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 joined-sample planning validation passed. Rows: ${artifact.counts.projected_rows}; occurrence links: ${artifact.counts.selected_occurrence_links}.`);

function validateAuthorityPolicy(policy) {
  for (const key of [
    'nonpublic_planning_only',
    'live_sample_unchanged',
    'usage_navigation_only',
    'observed_usage_only',
    'route_ids_only',
  ]) {
    expect(policy[key] === true, `authority_policy.${key} must be true`);
  }
  for (const key of [
    'reader_facing',
    'ranks_routes',
    'selects_visible_result',
    'semantic_arbitration',
    'copies_route_payloads',
    'copies_definition_payloads',
    'copies_translation_payloads',
    'answer_eligibility',
    'publication_claim',
  ]) {
    expect(policy[key] === false, `authority_policy.${key} must be false`);
  }
}

function validateProjectedSnapshot(snapshot) {
  expect(Number.isInteger(snapshot.source_sample_rows) && snapshot.source_sample_rows > 0, 'source_sample_rows must be positive');
  expect(Number.isInteger(snapshot.projected_rows_to_add) && snapshot.projected_rows_to_add >= 0, 'projected_rows_to_add must be non-negative');
  expect(snapshot.projected_total_rows_if_separate_joined_artifact === snapshot.source_sample_rows + snapshot.projected_rows_to_add, 'projected total must reconcile');
  for (const key of ['live_sample_mutated']) expect(snapshot[key] === false, `${key} must be false`);
  for (const key of ['public_rows_emitted', 'answer_eligible_rows_emitted', 'route_shards_written', 'public_runtime_mutations']) {
    expect(snapshot[key] === 0, `${key} must be 0`);
  }
}

function validateCounts(counts) {
  for (const key of [
    'projected_rows',
    'projected_usage_link_rows',
    'selected_occurrence_links',
    'occurrence_links_with_source',
    'occurrence_links_with_work_anchor',
    'occurrence_links_with_context',
    'occurrence_links_with_license',
    'occurrence_links_with_version',
    'occurrence_links_with_route_ids',
    'route_ids',
    'audit_only_ambiguous_rows',
    'route_concentration_warning_visible',
    'reader_facing_rows',
    'answer_eligible_rows',
    'public_rows_emitted',
    'route_payload_field_hits',
    'forbidden_authority_field_hits',
  ]) {
    expect(Number.isInteger(counts[key]) && counts[key] >= 0, `counts.${key} must be a non-negative integer`);
  }
  expect(counts.projected_rows > 0, 'projected_rows must be positive for this bounded artifact');
  expect(counts.selected_occurrence_links > 0, 'selected_occurrence_links must be positive');
  for (const key of [
    'occurrence_links_with_source',
    'occurrence_links_with_work_anchor',
    'occurrence_links_with_context',
    'occurrence_links_with_license',
    'occurrence_links_with_version',
    'occurrence_links_with_route_ids',
  ]) {
    expect(counts[key] === counts.selected_occurrence_links, `counts.${key} must equal selected_occurrence_links`);
  }
  expect(counts.route_ids > 0, 'route_ids must be positive');
  expect(counts.reader_facing_rows === 0, 'reader_facing_rows must be 0');
  expect(counts.answer_eligible_rows === 0, 'answer_eligible_rows must be 0');
  expect(counts.public_rows_emitted === 0, 'public_rows_emitted must be 0');
  expect(counts.route_payload_field_hits === 0, 'route_payload_field_hits must be 0');
  expect(counts.forbidden_authority_field_hits === 0, 'forbidden_authority_field_hits must be 0');
}

function validateRows(rows) {
  expect(Array.isArray(rows), 'projected_rows must be an array');
  if (!Array.isArray(rows)) return;
  expect(rows.length === artifact.counts?.projected_rows, 'projected_rows length must match counts');
  for (const [index, row] of rows.entries()) {
    const context = `projected_rows[${index}]`;
    for (const field of ['planning_row_id', 'source_join_smoke_id', 'seed_id', 'token_key', 'normalized_form', 'projected_row_status', 'current_sample_link_status', 'recommended_next_action']) {
      expect(typeof row[field] === 'string' && row[field].length > 0, `${context}.${field} must be a non-empty string`);
    }
    expect(row.projected_row_status === 'nonpublic_joined_sample_planning_row', `${context}.projected_row_status is invalid`);
    expect(row.current_sample_link_status === 'absent_from_current_definition_workbench_sample', `${context}.current_sample_link_status is invalid`);
    expect(Array.isArray(row.route_ids) && row.route_ids.length > 0, `${context}.route_ids must be non-empty`);
    expect(Array.isArray(row.occurrence_links) && row.occurrence_links.length === row.selected_occurrence_link_count, `${context}.occurrence_links must match selected count`);
    validatePlanningBoundary(row.planning_boundary, `${context}.planning_boundary`);
    for (const [occurrenceIndex, occurrence] of (row.occurrence_links || []).entries()) {
      const occurrenceContext = `${context}.occurrence_links[${occurrenceIndex}]`;
      for (const field of ['occurrence_id', 'source_ref', 'source_href', 'work_anchor_href', 'context_focus_marked', 'license', 'license_url', 'version_title', 'version_source']) {
        expect(typeof occurrence[field] === 'string' && occurrence[field].length > 0, `${occurrenceContext}.${field} must be a non-empty string`);
      }
      expect(Array.isArray(occurrence.route_ids) && occurrence.route_ids.length > 0, `${occurrenceContext}.route_ids must be non-empty`);
      validateOccurrenceBoundary(occurrence.occurrence_boundary, `${occurrenceContext}.occurrence_boundary`);
    }
  }
}

function validatePlanningBoundary(boundary, context) {
  expect(boundary?.nonpublic_joined_sample_planning_only === true, `${context}.nonpublic_joined_sample_planning_only must be true`);
  expect(boundary?.live_sample_unchanged === true, `${context}.live_sample_unchanged must be true`);
  expect(boundary?.observed_usage_only === true, `${context}.observed_usage_only must be true`);
  expect(boundary?.route_ids_only === true, `${context}.route_ids_only must be true`);
  expect(boundary?.reader_facing === false, `${context}.reader_facing must be false`);
  expect(boundary?.not_answer_authority === true, `${context}.not_answer_authority must be true`);
  expect(boundary?.not_definition_authority === true, `${context}.not_definition_authority must be true`);
  expect(boundary?.not_publication_support === true, `${context}.not_publication_support must be true`);
  expect(boundary?.no_accepted_text === true, `${context}.no_accepted_text must be true`);
}

function validateOccurrenceBoundary(boundary, context) {
  expect(boundary?.observed_usage_only === true, `${context}.observed_usage_only must be true`);
  expect(boundary?.route_ids_only === true, `${context}.route_ids_only must be true`);
  expect(boundary?.reader_facing === false, `${context}.reader_facing must be false`);
  expect(boundary?.not_answer_authority === true, `${context}.not_answer_authority must be true`);
  expect(boundary?.not_definition_authority === true, `${context}.not_definition_authority must be true`);
  expect(boundary?.not_semantic_arbitration === true, `${context}.not_semantic_arbitration must be true`);
}

function validateForbiddenAuthorityKeys(value) {
  const hits = [];
  walk(value, '$');
  expect(hits.length === 0, `forbidden authority keys present: ${hits.slice(0, 20).join(', ')}`);
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

function expect(condition, message) {
  if (!condition) issues.push(message);
}

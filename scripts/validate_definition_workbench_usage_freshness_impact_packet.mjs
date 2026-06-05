#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-freshness-impact-packet.json');
const packet = readJson(packetPath);
const errors = [];
const forbiddenAuthorityKeys = [
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
  'route_links',
];

const rows = Array.isArray(packet.pending_source_rows) ? packet.pending_source_rows : [];
const impactedRows = Array.isArray(packet.impacted_usage_rows) ? packet.impacted_usage_rows : [];
const counts = packet.counts || {};

requireEqual(packet.schema_version, 1, 'schema_version must be 1');
requireEqual(packet.artifact_type, 'definition_workbench_usage_freshness_impact_packet', 'artifact_type mismatch');
requireEqual(packet.lane_owner, 'Agent 3', 'lane_owner must be Agent 3');
requireEqual(packet.target_gate, 'definition_workbench_gate', 'target_gate mismatch');
requireTruthy(packet.authority_boundary?.usage_navigation_only, 'usage_navigation_only must be true');
requireTruthy(packet.authority_boundary?.freshness_impact_only, 'freshness_impact_only must be true');
requireTruthy(packet.authority_boundary?.observed_usage_only, 'observed_usage_only must be true');
requireTruthy(packet.authority_boundary?.route_ids_only, 'route_ids_only must be true');
for (const key of [
  'source_text_read',
  'broad_target_expansion',
  'promotes_targets',
  'reader_facing',
  'lexical_authority',
  'semantic_arbitration',
  'route_ranking',
  'visible_answer_selection',
  'copied_route_payloads',
  'accepted_text_output',
  'publication_claim',
  'agent6_accepted',
]) {
  requireFalse(packet.authority_boundary?.[key], `authority_boundary.${key} must be false`);
}

for (const [label, relativePath] of Object.entries(packet.source_artifacts || {})) {
  if (!relativePath || !fs.existsSync(path.join(root, cleanRelativePath(relativePath)))) {
    errors.push(`source artifact missing for ${label}: ${relativePath}`);
  }
}

requireEqual(counts.source_freshness_status_stale, 1, 'source freshness stale must be visible');
requirePositive(counts.pending_refresh_files, 'pending_refresh_files must be positive');
requireEqual(rows.length, counts.pending_refresh_files, 'pending_source_rows length mismatch');
requireEqual(counts.pending_refresh_files, counts.source_freshness_pending_files, 'pending rows must match source freshness');
requireEqual(counts.pending_with_current_usage_overlap + counts.pending_without_current_usage_overlap, counts.pending_refresh_files, 'pending overlap split mismatch');
requireEqual(counts.impacted_navigation_rows, impactedRows.length, 'impacted_usage_rows length must match impacted_navigation_rows');
requireEqual(counts.review_only_not_promoted, counts.pending_refresh_files, 'all pending rows must be review-only');
requireEqual(counts.promoted_run_targets, 0, 'promoted_run_targets must be 0');
requireEqual(counts.source_text_read, 0, 'source_text_read must be 0');
requireEqual(counts.broad_target_expansion, 0, 'broad_target_expansion must be 0');
requireEqual(counts.reader_facing_rows, 0, 'reader_facing_rows must be 0');
requireEqual(counts.route_payload_field_hits, 0, 'route_payload_field_hits must be 0');
requireEqual(counts.forbidden_authority_field_hits, 0, 'forbidden_authority_field_hits must be 0');
requireEqual(counts.queue_mutations, 0, 'queue_mutations must be 0');
requireEqual(counts.submitted_to_agent6, 0, 'submitted_to_agent6 must be 0');
requirePositive(counts.current_navigation_rows, 'current_navigation_rows must be positive');
requirePositive(counts.current_selected_support_rows, 'current_selected_support_rows must be positive');
for (const key of [
  'current_navigation_rows_with_source_url',
  'current_navigation_rows_with_local_work_anchor',
  'current_navigation_rows_with_license_metadata',
  'current_navigation_rows_with_version_metadata',
]) {
  requireEqual(counts[key], counts.current_navigation_rows, `${key} must equal current_navigation_rows`);
}

requireFalse(packet.coverage_interpretation?.broad_corpus_freshness_claim_allowed, 'broad corpus freshness claim must be false');
requireFalse(packet.coverage_interpretation?.target_refresh_promoted, 'target_refresh_promoted must be false');
requireEqual(Number(packet.coverage_interpretation?.current_usage_rows_directly_overlapping_pending_sources || 0), counts.impacted_navigation_rows, 'coverage overlap count mismatch');
requireEqual(Number(packet.coverage_interpretation?.selected_support_rows_directly_overlapping_pending_sources || 0), counts.impacted_selected_support_rows, 'coverage selected overlap count mismatch');

const sourceFiles = new Set();
for (const [index, row] of rows.entries()) {
  const label = row.source_file || `pending_source_rows[${index}]`;
  if (sourceFiles.has(row.source_file)) errors.push(`duplicate source_file: ${row.source_file}`);
  sourceFiles.add(row.source_file);
  requireRow(String(row.source_file || '').startsWith('data/sources/') && String(row.source_file || '').endsWith('.json'), `${label}: source_file must be data/sources/*.json`);
  requireRow(row.source_slug, `${label}: source_slug missing`);
  requireRow(row.category_hint, `${label}: category_hint missing`);
  requireRow(row.modified_at, `${label}: modified_at missing`);
  requireRow(row.created_at, `${label}: created_at missing`);
  requireRow(Number.isInteger(row.bytes) && row.bytes >= 0, `${label}: bytes must be a non-negative integer`);
  requireRow(['current_usage_overlap_refresh_review', 'no_current_usage_overlap'].includes(row.impact_status), `${label}: invalid impact_status`);
  requireRow(row.promotion_status === 'not_promoted', `${label}: promotion_status must be not_promoted`);
  for (const key of [
    'current_usage_rows',
    'selected_support_rows',
    'supported_rows',
    'candidate_rows',
    'weak_rows',
    'source_refs',
    'works',
  ]) {
    requireRow(Number.isInteger(row[key]) && row[key] >= 0, `${label}: ${key} must be a non-negative integer`);
  }
  requireRow(Array.isArray(row.categories), `${label}: categories must be an array`);
  requireRow(Array.isArray(row.clusters), `${label}: clusters must be an array`);
  requireRow(Array.isArray(row.route_ids), `${label}: route_ids must be an array`);
  requireRow(Array.isArray(row.impacted_occurrence_ids), `${label}: impacted_occurrence_ids must be an array`);
  requireRow(row.reason, `${label}: reason missing`);
  if (row.current_usage_rows === 0) {
    requireRow(row.impact_status === 'no_current_usage_overlap', `${label}: no-overlap row has wrong status`);
    requireEqual(row.selected_support_rows, 0, `${label}: no-overlap selected_support_rows must be 0`);
    requireEqual(row.route_ids.length, 0, `${label}: no-overlap route_ids must be empty`);
  }
}

for (const [index, row] of impactedRows.entries()) {
  const label = row.occurrence_id || `impacted_usage_rows[${index}]`;
  requireRow(row.occurrence_id, `${label}: occurrence_id missing`);
  requireRow(row.token_key, `${label}: token_key missing`);
  requireRow(row.source_ref, `${label}: source_ref missing`);
  requireRow(/^https:\/\//.test(row.source_url || ''), `${label}: source_url must be https`);
  requireRow(row.local_work_anchor, `${label}: local_work_anchor missing`);
  requireRow(['supported', 'candidate', 'weak'].includes(row.status), `${label}: invalid status`);
  requireRow(Number.isInteger(row.raw_score) && row.raw_score >= 0 && row.raw_score <= 100, `${label}: raw_score invalid`);
  requireRow(Array.isArray(row.related_agent2_route_ids), `${label}: related_agent2_route_ids must be an array`);
  requireRow(row.row_label === 'observed usage only', `${label}: row_label must be observed usage only`);
  requireRow(row.reader_facing === false, `${label}: reader_facing must be false`);
  requireRow(row.not_definition_authority === true, `${label}: not_definition_authority must be true`);
}

const forbiddenKeyHits = countForbiddenKeyHits(packet, forbiddenAuthorityKeys);
requireEqual(forbiddenKeyHits, 0, `forbidden authority keys present: ${forbiddenKeyHits}`);

for (const check of packet.checks || []) {
  if (check.status === 'failed') errors.push(`packet check failed: ${check.id} ${check.detail || ''}`.trim());
}

if (errors.length) {
  console.error(`Definition Workbench usage freshness impact packet validation failed (${errors.length})`);
  for (const error of errors.slice(0, 80)) console.error(`- ${error}`);
  if (errors.length > 80) console.error(`- ... ${errors.length - 80} more`);
  process.exit(1);
}

console.log(`Validated ${packetPath}: pending ${counts.pending_refresh_files}; impacted usage rows ${counts.impacted_navigation_rows}; promoted ${counts.promoted_run_targets}; reader-facing ${counts.reader_facing_rows}`);

function requireEqual(actual, expected, message) {
  if (actual !== expected) errors.push(`${message}: ${actual} !== ${expected}`);
}

function requireTruthy(value, message) {
  if (value !== true) errors.push(message);
}

function requireFalse(value, message) {
  if (value !== false) errors.push(message);
}

function requirePositive(value, message) {
  if (!(Number(value) > 0)) errors.push(`${message}: ${value}`);
}

function requireRow(value, message) {
  if (!value) errors.push(message);
}

function countForbiddenKeyHits(value, keys) {
  const forbidden = new Set(keys);
  let hits = 0;
  walk(value);
  return hits;

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (forbidden.has(key)) hits += 1;
      walk(child);
    }
  }
}

function readJson(relativePath) {
  return JSON.parse(stripJsonBom(fs.readFileSync(path.join(root, relativePath), 'utf8')));
}

function stripJsonBom(text) {
  return text.replace(/^\uFEFF/, '');
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

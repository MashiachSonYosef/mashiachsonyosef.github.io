#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = cleanRelativePath(process.argv[2] || 'data/definitions/definition-workbench-usage-concordance-navigation-packet.json');
const packet = readJson(packetPath);
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
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

const errors = [];
const rows = Array.isArray(packet.navigation_rows) ? packet.navigation_rows : [];
const counts = packet.counts || {};

requireEqual(packet.schema_version, 1, 'schema_version must be 1');
requireEqual(packet.artifact_type, 'definition_workbench_usage_concordance_navigation_packet', 'artifact_type mismatch');
requireEqual(packet.lane_owner, 'Agent 3', 'lane_owner must be Agent 3');
requireEqual(packet.target_gate, 'definition_workbench_gate', 'target_gate mismatch');
requireTruthy(packet.authority_boundary?.usage_navigation_only, 'usage_navigation_only must be true');
requireTruthy(packet.authority_boundary?.full_concordance_snapshot, 'full_concordance_snapshot must be true');
requireTruthy(packet.authority_boundary?.observed_usage_only, 'observed_usage_only must be true');
requireTruthy(packet.authority_boundary?.route_ids_only, 'route_ids_only must be true');
requireFalse(packet.authority_boundary?.reader_facing, 'reader_facing must be false');
requireFalse(packet.authority_boundary?.lexical_authority, 'lexical_authority must be false');
requireFalse(packet.authority_boundary?.semantic_arbitration, 'semantic_arbitration must be false');
requireFalse(packet.authority_boundary?.route_ranking, 'route_ranking must be false');
requireFalse(packet.authority_boundary?.visible_answer_selection, 'visible_answer_selection must be false');
requireFalse(packet.authority_boundary?.copied_route_payloads, 'copied_route_payloads must be false');
requireFalse(packet.authority_boundary?.accepted_text_output, 'accepted_text_output must be false');
requireFalse(packet.authority_boundary?.publication_claim, 'publication_claim must be false');
requireFalse(packet.authority_boundary?.agent6_accepted, 'agent6_accepted must be false');

for (const [label, relativePath] of Object.entries(packet.source_artifacts || {})) {
  if (!relativePath || !fs.existsSync(path.join(root, cleanRelativePath(relativePath)))) {
    errors.push(`source artifact missing for ${label}: ${relativePath}`);
  }
}

requirePositive(rows.length, 'navigation_rows must be non-empty');
requireEqual(counts.navigation_rows, rows.length, 'counts.navigation_rows mismatch');
requireEqual(counts.concordance_rows, rows.length, 'counts.concordance_rows mismatch');
requireEqual(counts.concordance_manifest_rows, rows.length, 'counts.concordance_manifest_rows mismatch');
requireEqual(counts.selected_support_rows, counts.occurrence_support_rows, 'selected support rows must match occurrence support rows');
requirePositive(counts.selected_support_rows, 'selected_support_rows must be positive');
requirePositive(counts.supported_rows, 'supported_rows must be positive');
requirePositive(counts.candidate_rows, 'candidate_rows must be positive');
requirePositive(counts.weak_rows, 'weak_rows must be positive');
requireEqual(counts.supported_rows + counts.candidate_rows + counts.weak_rows, rows.length, 'status counts must sum to rows');
requireEqual(counts.rows_with_forbidden_license, 0, 'forbidden licenses must be zero');
requirePositive(counts.audit_only_ambiguous_rows_available, 'audit-only ambiguous availability should be visible');
requireEqual(counts.audit_only_ambiguous_rows_emitted, 0, 'ambiguous rows must not be emitted');
requireEqual(counts.reader_facing_rows, 0, 'reader-facing rows must be zero');
requireEqual(counts.route_payload_field_hits, 0, 'route payload field hits must be zero');
requireEqual(counts.forbidden_authority_field_hits, 0, 'forbidden authority field hits must be zero');
requireEqual(counts.queue_mutations, 0, 'queue mutations must be zero');
requireEqual(counts.submitted_to_agent6, 0, 'submitted_to_agent6 must be zero');

const forbiddenKeyHits = countForbiddenKeyHits(packet, forbiddenAuthorityKeys);
requireEqual(forbiddenKeyHits, 0, `forbidden authority keys present: ${forbiddenKeyHits}`);

const rowIds = new Set();
for (const [index, row] of rows.entries()) {
  const label = row.navigation_row_id || `row ${index}`;
  if (!row.navigation_row_id) errors.push(`missing navigation_row_id at row ${index}`);
  if (rowIds.has(row.navigation_row_id)) errors.push(`duplicate navigation_row_id: ${row.navigation_row_id}`);
  rowIds.add(row.navigation_row_id);

  requireRow(row.occurrence_id, `${label}: occurrence_id missing`);
  requireRow(row.candidate_id, `${label}: candidate_id missing`);
  requireRow(row.token_key, `${label}: token_key missing`);
  requireRow(row.token_surface, `${label}: token_surface missing`);
  requireRow(row.token_normalized, `${label}: token_normalized missing`);
  requireRow(row.focus_surface, `${label}: focus_surface missing`);
  requireRow(row.focus_normalized, `${label}: focus_normalized missing`);
  requireRow(row.phrase_hebrew, `${label}: phrase_hebrew missing`);
  requireRow(row.phrase_context_snippet, `${label}: phrase_context_snippet missing`);
  requireRow(/\[.+\]/u.test(row.phrase_context_snippet || ''), `${label}: focus marker missing from phrase_context_snippet`);
  requireRow(row.source_ref, `${label}: source_ref missing`);
  requireRow(/^https:\/\//.test(row.source_url || ''), `${label}: source_url must be https`);
  requireRow(row.local_work_anchor, `${label}: local_work_anchor missing`);
  requireRow(row.local_work_page_anchor, `${label}: local_work_page_anchor missing`);
  requireRow(row.work_id && row.work_title && row.work_slug && row.unit_id, `${label}: work metadata incomplete`);
  requireRow(row.usage_frame_label && row.cluster_id, `${label}: usage frame incomplete`);
  requireRow(['supported', 'candidate', 'weak'].includes(row.status), `${label}: bad status ${row.status}`);
  requireRow(Number.isInteger(row.raw_score) && row.raw_score >= 0 && row.raw_score <= 100, `${label}: bad raw_score ${row.raw_score}`);
  requireRow(row.row_label === 'observed usage only', `${label}: row_label must be observed usage only`);
  requireRow(row.route_link_state === 'route_linked_observed_usage', `${label}: route_link_state must stay route-linked observed usage`);
  requireRow(Array.isArray(row.related_agent2_route_ids) && row.related_agent2_route_ids.length > 0, `${label}: related Agent 2 route IDs missing`);
  requireRow(row.version_title && row.version_source, `${label}: version metadata missing`);
  requireRow(row.license && /^https:\/\//.test(row.license_url || ''), `${label}: license metadata missing`);
  requireRow(!forbiddenLicenseRe.test(String(row.license || '')), `${label}: forbidden license ${row.license}`);
  requireRow(row.usage_boundary?.observed_usage_only === true, `${label}: observed usage boundary missing`);
  requireRow(row.usage_boundary?.reader_facing === false, `${label}: reader_facing boundary must be false`);
  requireRow(row.usage_boundary?.route_ids_only === true, `${label}: route_ids_only boundary missing`);
  requireRow(row.usage_boundary?.route_payload_copied === false, `${label}: route_payload_copied must be false`);
  requireRow(row.usage_boundary?.not_definition_authority === true, `${label}: not_definition_authority missing`);
  requireRow(row.usage_boundary?.not_semantic_arbitration === true, `${label}: not_semantic_arbitration missing`);
  requireRow(row.usage_boundary?.not_route_ranking === true, `${label}: not_route_ranking missing`);
  requireRow(row.usage_boundary?.not_visible_answer_selection === true, `${label}: not_visible_answer_selection missing`);
  requireRow(row.usage_boundary?.not_publication_support === true, `${label}: not_publication_support missing`);
  requireRow(row.usage_boundary?.not_accepted_text === true, `${label}: not_accepted_text missing`);

  const phraseTokens = Array.isArray(row.phrase_tokens) ? row.phrase_tokens : [];
  requireRow(phraseTokens.length > 0, `${label}: phrase_tokens missing`);
  requireRow(phraseTokens.filter((token) => token.focus_marked === true).length === 1, `${label}: phrase_tokens must have exactly one focus marker`);
}

for (const check of packet.checks || []) {
  if (check.status === 'failed') errors.push(`packet check failed: ${check.id} ${check.detail || ''}`.trim());
}

if (errors.length) {
  console.error(`Definition Workbench usage concordance navigation packet validation failed (${errors.length})`);
  for (const error of errors.slice(0, 50)) console.error(`- ${error}`);
  if (errors.length > 50) console.error(`- ... ${errors.length - 50} more`);
  process.exit(1);
}

console.log(`Validated ${packetPath}: rows ${rows.length}; supported/candidate/weak ${counts.supported_rows}/${counts.candidate_rows}/${counts.weak_rows}; ambiguous emitted ${counts.audit_only_ambiguous_rows_emitted}; reader-facing ${counts.reader_facing_rows}`);

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

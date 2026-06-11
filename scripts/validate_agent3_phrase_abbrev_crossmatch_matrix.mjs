#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ARTIFACT = 'reports/agent3-a14-phrase-abbrev-pattern-crossmatch-matrix-2026-06-11.json';
const REPORT = 'reports/agent3-a14-phrase-abbrev-pattern-crossmatch-matrix-2026-06-11.md';
const SOURCE_LAYER = 'data/lexical/source-layers/project-abbreviations.json';
const ADOPTION_PACKET = 'reports/agent3-a14-phrase-abbrev-adoption-packet-2026-06-11.json';

const FORBIDDEN_AUTHORITY_KEYS = new Set([
  'definition',
  'definition_text',
  'meaning',
  'translation',
  'accepted_translation',
  'answer',
  'answer_eligible',
  'winner',
  'route_payload',
  'route_payloads',
  'public_emit',
]);

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function scanForbiddenAuthorityKeys(value, hits = []) {
  if (!value || typeof value !== 'object') return hits;
  if (Array.isArray(value)) {
    for (const item of value) scanForbiddenAuthorityKeys(item, hits);
    return hits;
  }
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_AUTHORITY_KEYS.has(key) && isTruthyAuthorityValue(child)) hits.push(key);
    scanForbiddenAuthorityKeys(child, hits);
  }
  return hits;
}

function isTruthyAuthorityValue(value) {
  if (value === false || value === null || value === undefined || value === 0 || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

const artifact = readJson(ARTIFACT);
const sourceLayer = readJson(SOURCE_LAYER);
const adoption = readJson(ADOPTION_PACKET);
const errors = [];

if (!fs.existsSync(path.join(ROOT, REPORT))) errors.push(`missing report ${REPORT}`);
if (artifact.artifact_type !== 'agent3_a14_phrase_abbrev_pattern_crossmatch_matrix') errors.push(`artifact_type invalid: ${artifact.artifact_type}`);
if (!['evidence_matrix_ready', 'exact_blocker_missing_target_work_index'].includes(artifact.status)) errors.push(`status invalid: ${artifact.status}`);
if (artifact.source_artifacts?.adoption_packet !== ADOPTION_PACKET) errors.push('adoption packet pointer mismatch');
if (artifact.source_artifacts?.project_abbreviations !== SOURCE_LAYER) errors.push('source layer pointer mismatch');

const boundaries = artifact.authority_boundary || {};
for (const key of ['evidence_navigation_only', 'occurrence_navigation_only', 'project_authored_source_layer_only']) {
  if (boundaries[key] !== true) errors.push(`boundary ${key} must be true`);
}
for (const key of [
  'definition_authority',
  'accepted_gloss_or_text',
  'answer_eligibility',
  'source_license_legal_acceptance',
  'public_runtime_release_action',
  'route_mutation',
  'prehud_authority',
]) {
  if (boundaries[key] !== false) errors.push(`boundary ${key} must be false`);
}

const rows = artifact.matrix_rows || [];
const counts = artifact.counts || {};
if (counts.target_work_count !== (adoption.target_work_ids || []).length) errors.push('target work count mismatch');
if (counts.source_entry_count !== (sourceLayer.entries || []).length) errors.push('source entry count mismatch');
if (counts.matrix_rows !== rows.length || rows.length !== counts.source_entry_count) errors.push('matrix row count mismatch');

let occurrenceTotal = 0;
let rowsWithOccurrence = 0;
let rowsWithSamples = 0;
for (const [index, row] of rows.entries()) {
  const label = row.pattern_id || `row[${index}]`;
  for (const field of [
    'pattern_id',
    'surface',
    'normalized',
    'pattern_type',
    'possible_expansion_or_base',
    'source_layer_id',
    'evidence_only_reason',
    'blocker_class',
    'next_owner',
    'stop_condition',
  ]) {
    if (!row[field]) errors.push(`${label}: missing ${field}`);
  }
  if (!Array.isArray(row.work_ids)) errors.push(`${label}: work_ids must be array`);
  if (!Number.isInteger(row.occurrence_count) || row.occurrence_count < 0) errors.push(`${label}: occurrence_count invalid`);
  if (!Array.isArray(row.sample_occurrence_ids)) errors.push(`${label}: sample_occurrence_ids must be array`);
  if (!Array.isArray(row.sample_source_refs)) errors.push(`${label}: sample_source_refs must be array`);
  if (!Array.isArray(row.sample_page_anchors)) errors.push(`${label}: sample_page_anchors must be array`);
  if (!Array.isArray(row.sample_token_indices)) errors.push(`${label}: sample_token_indices must be array`);
  if (row.existing_source_layer_hit !== true) errors.push(`${label}: existing_source_layer_hit must be true`);
  if (row.source_layer_id !== sourceLayer.layer_id) errors.push(`${label}: source_layer_id mismatch`);
  if (!Array.isArray(row.source_row_keys)) errors.push(`${label}: source_row_keys must be array`);
  if (!Array.isArray(row.route_or_lexical_ids_if_any)) errors.push(`${label}: route_or_lexical_ids_if_any must be array`);
  if (row.display_eligible !== false || row.prehud_allowed !== false || row.reader_facing !== false || row.not_definition_authority !== true) {
    errors.push(`${label}: evidence-only display flags invalid`);
  }
  for (const sample of row.sample_token_indices) {
    if (!sample.work_id || !sample.token_index_id?.startsWith('tok-') || !sample.chunk_id || !sample.page_anchor?.startsWith('#tok-')) {
      errors.push(`${label}: sample token index is incomplete`);
    }
  }
  occurrenceTotal += row.occurrence_count;
  if (row.occurrence_count > 0) rowsWithOccurrence += 1;
  if (row.sample_token_indices.length > 0) rowsWithSamples += 1;
}

if (counts.total_occurrence_count !== occurrenceTotal) errors.push(`total occurrence count mismatch ${counts.total_occurrence_count}/${occurrenceTotal}`);
if (counts.rows_with_occurrence_evidence !== rowsWithOccurrence) errors.push('rows_with_occurrence_evidence mismatch');
if (counts.rows_with_token_samples !== rowsWithSamples) errors.push('rows_with_token_samples mismatch');
if (scanForbiddenAuthorityKeys(artifact).length !== counts.forbidden_authority_field_hits) errors.push('forbidden authority field count mismatch');
if (counts.forbidden_authority_field_hits !== 0) errors.push(`forbidden authority field hits: ${counts.forbidden_authority_field_hits}`);

if (errors.length) {
  for (const error of errors.slice(0, 80)) console.error(`- ${error}`);
  fail(`Validation failed with ${errors.length} issue(s).`);
}

console.log(
  `Validation passed: rows ${rows.length}; linked ${rowsWithOccurrence}; ` +
  `occurrences ${occurrenceTotal}; token samples ${rowsWithSamples}`
);

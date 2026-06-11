#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const matrixPath = process.argv[2] || 'reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json';
const matrix = readJson(cleanRelativePath(matrixPath));
const issues = [];
const allowedLanes = new Set([
  'commercial_clean_candidate',
  'noncommercial_educational_candidate',
  'metadata_or_link_only',
  'blocked_or_needs_review',
]);

expect(matrix.schema_version === 1, 'schema_version must be 1');
expect(matrix.artifact_type === 'agent2_deuteronomy_phase2_transform_readiness_matrix', 'unexpected artifact_type');
expect(matrix.status === 'nonpublic_transform_readiness_matrix_pre_agent6_boundary', 'unexpected status');
expect(Array.isArray(matrix.rows), 'rows must be an array');
expect(matrix.rows?.length === 1334, `expected 1334 rows, got ${matrix.rows?.length}`);
expect(matrix.counts?.rows === 1334, 'counts.rows must be 1334');
expect(matrix.counts?.occurrences === 2964, 'counts.occurrences must be 2964');
expect(matrix.counts?.commercial_clean_candidate_rows === 1334, 'commercial-clean row count must be 1334');
expect(matrix.counts?.commercial_clean_candidate_occurrences === 2964, 'commercial-clean occurrences must be 2964');
expect(matrix.counts?.noncommercial_educational_candidate_rows === 0, 'NC row count must be 0 for this workset');
expect(matrix.counts?.noncommercial_educational_candidate_occurrences === 0, 'NC occurrences must be 0 for this workset');

const duplicateKeys = new Set();
let occurrenceSum = 0;
for (const [index, row] of (matrix.rows || []).entries()) {
  const context = `rows[${index}]`;
  occurrenceSum += Number(row.occurrence_count || 0);
  for (const field of [
    'token_index_id',
    'normalized_form',
    'duplicate_key',
    'readiness_status',
    'source_family',
    'source_name',
    'license_label',
    'license_lane',
    'source_url_or_citation',
  ]) {
    expect(typeof row[field] === 'string' && row[field].length > 0, `${context}.${field} is required`);
  }
  expect(!duplicateKeys.has(row.duplicate_key), `${context}.duplicate_key must be unique`);
  duplicateKeys.add(row.duplicate_key);
  expect(allowedLanes.has(row.license_lane), `${context}.license_lane is invalid`);
  expect(row.agent6_boundary_required === true, `${context}.agent6_boundary_required must be true`);
  expect(row.answer_eligible === false, `${context}.answer_eligible must be false`);
  expect(row.public_emit === false, `${context}.public_emit must be false`);
  expect(row.definition_text_emitted === false, `${context}.definition_text_emitted must be false`);
  expect(row.accepted_text_emitted === false, `${context}.accepted_text_emitted must be false`);
  expect(row.public_reader_output_emitted === false, `${context}.public_reader_output_emitted must be false`);
  expect(row.route_shard_write === false, `${context}.route_shard_write must be false`);
  expect(row.corpus_contamination === false, `${context}.corpus_contamination must be false`);
  expect(row.lane_boundary?.candidate_text_export_now === false, `${context}.lane_boundary.candidate_text_export_now must be false`);
  expect(row.lane_boundary?.answer_eligible_now === false, `${context}.lane_boundary.answer_eligible_now must be false`);
  expect(row.lane_boundary?.public_emit_now === false, `${context}.lane_boundary.public_emit_now must be false`);
  if (row.license_lane === 'commercial_clean_candidate') {
    expect(row.derived_from_nc === false, `${context}.derived_from_nc must be false for commercial clean`);
    expect(row.owner_use_attestation === null, `${context}.owner_use_attestation must be null for commercial clean`);
  }
  if (row.license_lane === 'noncommercial_educational_candidate') {
    expect(row.derived_from_nc === true, `${context}.derived_from_nc must be true for NC`);
    expect(row.commercial_export_allowed === false, `${context}.commercial_export_allowed must be false for NC`);
    expect(row.attribution_required === true, `${context}.attribution_required must be true for NC`);
    expect(row.owner_use_attestation === 'noncommercial_educational_zero_profit_zero_kickback', `${context}.owner_use_attestation mismatch for NC`);
  }
}

expect(occurrenceSum === 2964, `occurrence sum must be 2964, got ${occurrenceSum}`);
for (const [key, value] of Object.entries(matrix.zero_emission_counters || {})) {
  expect(value === 0, `zero_emission_counters.${key} must be 0`);
}

if (issues.length) {
  console.error(`Agent 2 Deuteronomy readiness matrix validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 Deuteronomy readiness matrix validation passed. Rows: ${matrix.counts.rows}; occurrences: ${matrix.counts.occurrences}.`);

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

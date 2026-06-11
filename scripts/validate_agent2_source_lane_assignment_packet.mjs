#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = process.argv[2];
const issues = [];
const allowedLanes = new Set([
  'commercial_clean_candidate',
  'noncommercial_educational_candidate',
  'metadata_or_link_only',
  'blocked_or_needs_review',
]);
const requiredRowFields = [
  'source_family',
  'source_name',
  'source_or_dictionary',
  'license_label',
  'license_lane',
  'source_url_or_citation',
  'attribution_required',
  'derived_from_nc',
  'commercial_export_allowed',
  'agent6_boundary_required',
  'agent1_classification_artifact',
];

if (!packetPath) {
  fail([
    'missing_source_lane_assignment_packet_path',
    'usage: node scripts/validate_agent2_source_lane_assignment_packet.mjs <agent1-lane-assignment-packet.json>',
  ]);
}

const cleanPath = cleanRelativePath(packetPath);
if (!fs.existsSync(path.join(root, cleanPath))) {
  fail([
    'missing_source_lane_assignment_packet',
    `packet not found: ${cleanPath}`,
    'required workset: old-dictionary-excluded-row-license-lane-reaudit',
  ]);
}

const packet = readJson(cleanPath);
const rows = Array.isArray(packet.rows)
  ? packet.rows
  : Array.isArray(packet.lane_rows)
    ? packet.lane_rows
    : Array.isArray(packet.classified_rows)
      ? packet.classified_rows
      : null;

expect(String(packet.workset || packet.workset_id || '') === 'old-dictionary-excluded-row-license-lane-reaudit', 'workset must be old-dictionary-excluded-row-license-lane-reaudit');
expect(rows && rows.length > 0, 'packet must include non-empty rows/lane_rows/classified_rows');

if (rows) {
  for (const [index, row] of rows.entries()) {
    const context = `rows[${index}]`;
    for (const field of requiredRowFields) {
      expect(field in row, `${context}.${field} is required`);
    }
    expect(allowedLanes.has(row.license_lane), `${context}.license_lane must be one of ${[...allowedLanes].join(', ')}`);
    expect(row.agent6_boundary_required === true, `${context}.agent6_boundary_required must be true`);
    if (row.license_lane === 'commercial_clean_candidate') validateCommercialClean(row, context);
    if (row.license_lane === 'noncommercial_educational_candidate') validateNc(row, context);
    if (row.license_lane === 'metadata_or_link_only') validateMetadataOnly(row, context);
    if (row.license_lane === 'blocked_or_needs_review') validateBlocked(row, context);
  }
}

validateLaneCounts(packet, rows || []);
validateBoundary(packet);

if (issues.length) {
  console.error(`Agent 2 source-lane assignment packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

const counts = countByLane(rows);
console.log(`Agent 2 source-lane assignment packet validation passed. Rows: ${rows.length}; lanes: ${JSON.stringify(counts)}.`);

function validateCommercialClean(row, context) {
  expect(row.derived_from_nc === false, `${context}.derived_from_nc must be false for commercial-clean lane`);
  expect(row.commercial_export_allowed === true, `${context}.commercial_export_allowed must be true for commercial-clean lane`);
  expect(row.owner_use_attestation === null || row.owner_use_attestation === undefined, `${context}.owner_use_attestation must be absent/null for commercial-clean lane`);
}

function validateNc(row, context) {
  expect(row.derived_from_nc === true, `${context}.derived_from_nc must be true for NC lane`);
  expect(row.commercial_export_allowed === false, `${context}.commercial_export_allowed must be false for NC lane`);
  expect(row.attribution_required === true, `${context}.attribution_required must be true for NC lane`);
  expect(row.owner_use_attestation === 'noncommercial_educational_zero_profit_zero_kickback', `${context}.owner_use_attestation must preserve NC educational attestation`);
  expect(row.corpus_contamination === false, `${context}.corpus_contamination must be false for NC lane`);
  expect(row.answer_eligible === false, `${context}.answer_eligible must be false for NC lane`);
  expect(row.public_emit === false, `${context}.public_emit must be false for NC lane`);
}

function validateMetadataOnly(row, context) {
  expect(row.definition_text_stored_now !== true, `${context}.definition_text_stored_now must not be true for metadata/link-only lane`);
  expect(row.candidate_text_export_allowed !== true, `${context}.candidate_text_export_allowed must not be true for metadata/link-only lane`);
  expect(row.answer_eligible === false || row.answer_eligible === undefined, `${context}.answer_eligible must be false/absent for metadata/link-only lane`);
  expect(row.public_emit === false || row.public_emit === undefined, `${context}.public_emit must be false/absent for metadata/link-only lane`);
}

function validateBlocked(row, context) {
  expect(row.candidate_text_export_allowed !== true, `${context}.candidate_text_export_allowed must not be true for blocked/review lane`);
  expect(row.answer_eligible === false || row.answer_eligible === undefined, `${context}.answer_eligible must be false/absent for blocked/review lane`);
  expect(row.public_emit === false || row.public_emit === undefined, `${context}.public_emit must be false/absent for blocked/review lane`);
}

function validateLaneCounts(packet, rows) {
  const actual = countByLane(rows);
  const expected = packet.lane_counts || packet.counts?.lane_counts;
  if (!expected) return;
  for (const lane of allowedLanes) {
    expect(Number(expected[lane] || 0) === Number(actual[lane] || 0), `lane_counts.${lane} mismatch`);
  }
}

function validateBoundary(packet) {
  const text = JSON.stringify(packet);
  for (const forbidden of [
    '"Definition authority"',
    '"answer_acceptance":true',
    '"answer_eligible":true',
    '"accepted_gloss"',
    '"accepted_text"',
    '"public_emit":true',
    '"nc_commercial_authorization":true',
  ]) {
    expect(!text.includes(forbidden), `packet must not include forbidden marker ${forbidden}`);
  }
}

function countByLane(rows) {
  const counts = {};
  for (const lane of allowedLanes) counts[lane] = 0;
  for (const row of rows) counts[row.license_lane] = Number(counts[row.license_lane] || 0) + 1;
  return counts;
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

function fail(lines) {
  console.error(lines.join('\n'));
  process.exit(1);
}

#!/usr/bin/env node
import fs from 'node:fs';

const inputPath = process.argv[2];

if (!inputPath) {
  fail('usage: node scripts/validate_agent1_old_dictionary_sop023_next_boundary_packet_blocker.mjs <packet.json>');
}

const packet = readJson(inputPath);
const errors = [];

expectEqual(packet.artifact_type, 'agent1_old_dictionary_sop023_next_packet_blocker', 'artifact_type');
expectTruthy(packet.current_artifact_source?.current_boundary_state, 'current_artifact_source.current_boundary_state');
expectTruthy(packet.current_artifact_source?.latest_classifier_artifact, 'current_artifact_source.latest_classifier_artifact');
expectTruthy(packet.current_artifact_source?.latest_validation, 'current_artifact_source.latest_validation');
expectTruthy(packet.output_artifact_to_create_or_update, 'output_artifact_to_create_or_update');

const subsets = Array.isArray(packet.next_25_100_source_rows_subsets_to_classify)
  ? packet.next_25_100_source_rows_subsets_to_classify
  : [];
if (subsets.length !== 5) {
  errors.push(`expected 5 next source-row subsets, found ${subsets.length}`);
}

const allowedLanes = new Set([
  'commercial_clean_candidate',
  'noncommercial_educational_candidate',
  'metadata_or_link_only',
  'blocked_or_needs_review',
]);

let rows = 0;
let occurrences = 0;
for (const [index, subset] of subsets.entries()) {
  const prefix = `next_25_100_source_rows_subsets_to_classify[${index}]`;
  expectTruthy(subset.source_family, `${prefix}.source_family`);
  expectTruthy(subset.row_subset_id, `${prefix}.row_subset_id`);
  expectInteger(subset.rows, `${prefix}.rows`);
  expectInteger(subset.occurrences, `${prefix}.occurrences`);
  if (!allowedLanes.has(subset.license_lane)) {
    errors.push(`${prefix}.license_lane is not allowed: ${JSON.stringify(subset.license_lane)}`);
  }
  rows += Number(subset.rows || 0);
  occurrences += Number(subset.occurrences || 0);
}

const requiredFields = packet.required_fields_for_next_classified_row_subset || {};
const requiredFieldNames = [
  'source_family',
  'source_name',
  'license_label',
  'license_lane',
  'attribution_required',
  'derived_from_nc',
  'commercial_export_allowed',
  'owner_use_attestation',
  'corpus_contamination',
  'source_url_or_citation',
  'agent6_boundary_required',
];
for (const field of requiredFieldNames) {
  expectTruthy(requiredFields[field], `required_fields_for_next_classified_row_subset.${field}`);
}

const blocker = packet.exact_blocker || {};
expectEqual(blocker.code, 'missing_classification_inputs_for_row_subset_schema', 'exact_blocker.code');
expectTruthy(blocker.detail, 'exact_blocker.detail');
const missingFields = Array.isArray(blocker.missing_field) ? blocker.missing_field : [];
for (const field of ['source_name', 'source_url_or_citation', 'license_label', 'corpus_contamination for NC rows']) {
  if (!missingFields.includes(field)) {
    errors.push(`exact_blocker.missing_field missing ${field}`);
  }
}
const impacts = Array.isArray(blocker.downstream_impact) ? blocker.downstream_impact : [];
if (impacts.length < 3) {
  errors.push(`exact_blocker.downstream_impact expected at least 3 entries, found ${impacts.length}`);
}

expectTruthy(packet.next_owner?.['Agent 6'], 'next_owner.Agent 6');
expectTruthy(packet.next_owner?.['Agent 1'], 'next_owner.Agent 1');
expectTruthy(packet.stop_condition, 'stop_condition');
if (!String(packet.stop_condition).includes('source_name') || !String(packet.stop_condition).includes('source_url_or_citation')) {
  errors.push('stop_condition must name source_name and source_url_or_citation');
}

if (errors.length) {
  fail(errors.join('\n'));
}

const result = {
  ok: true,
  artifact_type: packet.artifact_type,
  input: inputPath,
  counts: {
    subsets: subsets.length,
    rows,
    occurrences,
    required_fields: requiredFieldNames.length,
    missing_fields: missingFields.length,
    downstream_impacts: impacts.length,
  },
  blocker_code: blocker.code,
  output_artifact_to_create_or_update: packet.output_artifact_to_create_or_update,
};

console.log(JSON.stringify(result, null, 2));

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`failed to read JSON ${path}: ${error.message}`);
  }
}

function expectTruthy(value, label) {
  if (!value) {
    errors.push(`${label} is required`);
  }
}

function expectEqual(actual, expected, label) {
  if (actual !== expected) {
    errors.push(`${label} expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}`);
  }
}

function expectInteger(value, label) {
  if (!Number.isInteger(value) || value < 0) {
    errors.push(`${label} expected non-negative integer, found ${JSON.stringify(value)}`);
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

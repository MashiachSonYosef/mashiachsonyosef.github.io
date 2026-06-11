#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json';
const artifact = readJson(cleanRelativePath(artifactPath));
const issues = [];
const allowedLanes = new Set([
  'commercial_clean_candidate',
  'noncommercial_educational_candidate',
  'metadata_or_link_only',
  'blocked_or_needs_review',
]);

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent2_deuteronomy_phase2_partition_export_plan', 'unexpected artifact_type');
expect(artifact.status === 'nonpublic_partition_export_planning_only_pre_agent6_boundary', 'unexpected status');
expect(Array.isArray(artifact.rows), 'rows must be an array');
expect(artifact.rows?.length === 1334, `expected 1334 rows, got ${artifact.rows?.length}`);
expect(artifact.counts?.rows === 1334, 'counts.rows must be 1334');
expect(artifact.counts?.occurrences === 2964, 'counts.occurrences must be 2964');
expect(artifact.counts?.commercial_clean_candidate_rows === 1334, 'commercial-clean row count must be 1334');
expect(artifact.counts?.commercial_clean_candidate_occurrences === 2964, 'commercial-clean occurrences must be 2964');
expect(artifact.counts?.noncommercial_educational_candidate_rows === 0, 'NC row count must be 0 for the current Deuteronomy workset');
expect(artifact.counts?.noncommercial_educational_candidate_occurrences === 0, 'NC occurrences must be 0 for the current Deuteronomy workset');
expect(artifact.counts?.candidate_text_export_rows === 0, 'candidate_text_export_rows must be 0');
expect(artifact.counts?.answer_eligible_rows === 0, 'answer_eligible_rows must be 0');
expect(artifact.counts?.public_emit_rows === 0, 'public_emit_rows must be 0');

const duplicateKeys = new Set();
let occurrenceSum = 0;
for (const [index, row] of (artifact.rows || []).entries()) {
  const context = `rows[${index}]`;
  occurrenceSum += Number(row.occurrence_count || 0);
  for (const field of [
    'token_index_id',
    'normalized_form',
    'duplicate_key',
    'source_family',
    'source_name',
    'license_label',
    'license_lane',
    'source_url_or_citation',
    'planned_partition',
  ]) {
    expect(typeof row[field] === 'string' && row[field].length > 0, `${context}.${field} is required`);
  }
  expect(!duplicateKeys.has(row.duplicate_key), `${context}.duplicate_key must be unique`);
  duplicateKeys.add(row.duplicate_key);
  expect(allowedLanes.has(row.license_lane), `${context}.license_lane is invalid`);
  expect(row.commercial_export_allowed === false, `${context}.commercial_export_allowed must remain false`);
  expect(row.agent6_boundary_required === true, `${context}.agent6_boundary_required must be true`);
  expect(row.candidate_text_export_now === false, `${context}.candidate_text_export_now must be false`);
  expect(row.definition_text_export_now === false, `${context}.definition_text_export_now must be false`);
  expect(row.answer_eligible === false, `${context}.answer_eligible must be false`);
  expect(row.public_emit === false, `${context}.public_emit must be false`);
  expect(row.route_shard_write === false, `${context}.route_shard_write must be false`);
  expect(row.public_reader_output === false, `${context}.public_reader_output must be false`);
  expect(row.accepted_text === false, `${context}.accepted_text must be false`);
  expect(Array.isArray(row.exact_blockers), `${context}.exact_blockers must be an array`);
  expect(row.exact_blockers.includes('agent6_boundary_required_before_export_or_display'), `${context}.exact_blockers must include Agent 6 boundary blocker`);

  if (row.license_lane === 'commercial_clean_candidate') {
    expect(row.planned_partition === 'commercial_clean_partition_after_agent6_boundary', `${context}.planned_partition mismatch for commercial clean`);
    expect(row.derived_from_nc === false, `${context}.derived_from_nc must be false for commercial clean`);
    expect(row.owner_use_attestation === null, `${context}.owner_use_attestation must be null for commercial clean`);
  }
  if (row.license_lane === 'noncommercial_educational_candidate') {
    expect(row.planned_partition === 'separate_nc_educational_partition_after_agent6_boundary', `${context}.planned_partition mismatch for NC`);
    expect(row.derived_from_nc === true, `${context}.derived_from_nc must be true for NC`);
    expect(row.commercial_export_allowed === false, `${context}.commercial_export_allowed must be false for NC`);
    expect(row.attribution_required === true, `${context}.attribution_required must be true for NC`);
    expect(row.owner_use_attestation === 'noncommercial_educational_zero_profit_zero_kickback', `${context}.owner_use_attestation mismatch for NC`);
    expect(row.corpus_contamination === false, `${context}.corpus_contamination must be false for NC`);
  }
  if (row.license_lane === 'metadata_or_link_only') {
    expect(row.planned_partition === 'citation_link_only_no_definition_text', `${context}.planned_partition mismatch for metadata/link-only`);
    expect(row.exact_blockers.includes('metadata_link_only_no_definition_text'), `${context}.metadata/link-only blocker missing`);
  }
  if (row.license_lane === 'blocked_or_needs_review') {
    expect(row.planned_partition === 'blocked_or_needs_review_no_candidate_text_export', `${context}.planned_partition mismatch for blocked/review`);
    expect(row.exact_blockers.includes('blocked_or_needs_review_no_candidate_text_export'), `${context}.blocked/review blocker missing`);
  }
}

expect(occurrenceSum === 2964, `occurrence sum must be 2964, got ${occurrenceSum}`);
for (const [key, value] of Object.entries(artifact.zero_emission_counters || {})) {
  expect(value === 0, `zero_emission_counters.${key} must be 0`);
}

if (issues.length) {
  console.error(`Agent 2 Deuteronomy partition/export plan validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 Deuteronomy partition/export plan validation passed. Rows: ${artifact.counts.rows}; occurrences: ${artifact.counts.occurrences}.`);

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

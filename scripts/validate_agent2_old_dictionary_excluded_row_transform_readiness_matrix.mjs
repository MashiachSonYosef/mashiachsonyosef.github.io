#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || 'reports/agent2-old-dictionary-excluded-row-transform-readiness-matrix-2026-06-05.json');
const artifact = readJson(artifactPath);
const issues = [];

expect(artifact.schema_version === '1.0', 'schema_version must be 1.0');
expect(artifact.artifact_type === 'agent2_old_dictionary_excluded_row_transform_readiness_matrix', 'artifact_type mismatch');
expect(artifact.status === 'nonpublic_transform_readiness_matrix_built_no_transform_emitted', 'status mismatch');
expect(artifact.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread mismatch');

for (const [key, relativePath] of Object.entries(artifact.inputs || {})) {
  expect(fs.existsSync(path.join(root, cleanRelativePath(relativePath))), `input missing: ${key}`);
}

for (const lane of [
  'commercial_clean_candidate',
  'noncommercial_educational_candidate',
  'metadata_or_link_only',
  'blocked_or_needs_review',
]) {
  expect(artifact.required_lanes?.includes(lane), `required_lanes missing ${lane}`);
}

const counts = artifact.matrix_counts || {};
expect(counts.source_family_rows === 5, 'source_family_rows must be 5');
expect(counts.commercial_clean_candidate_source_families === 3, 'commercial clean families must be 3');
expect(counts.noncommercial_educational_candidate_source_families === 1, 'NC families must be 1');
expect(counts.metadata_or_link_only_source_families === 0, 'metadata/link-only families must be 0');
expect(counts.blocked_or_needs_review_source_families === 1, 'blocked families must be 1');
expect(counts.allowed_transform_rows_now === 0, 'allowed transform rows now must be 0');
expect(counts.definition_candidate_rows_now === 0, 'definition candidate rows now must be 0');
expect(counts.lemma_candidate_rows_now === 0, 'lemma candidate rows now must be 0');
expect(counts.reader_hint_candidate_rows_now === 0, 'reader hint candidate rows now must be 0');
expect(counts.candidate_text_rows_now === 0, 'candidate text rows now must be 0');
expect(counts.answer_eligible_rows_now === 0, 'answer eligible rows now must be 0');
expect(counts.public_emit_rows_now === 0, 'public emit rows now must be 0');

const rows = artifact.matrix_rows || [];
expect(rows.length === counts.source_family_rows, 'matrix row count mismatch');
for (const row of rows) {
  for (const field of ['row_subset_id', 'source_family', 'source_name', 'license_label', 'license_lane', 'evidence_path', 'source_url_or_citation']) {
    expect(row[field] !== undefined && row[field] !== null && row[field] !== '', `${row.row_subset_id || row.source_family} missing ${field}`);
  }
  expect(row.required_transform_inputs_present === true, `${row.row_subset_id} required transform inputs should be present`);
  expect(row.allowed_transform_now === false, `${row.row_subset_id} allowed_transform_now must be false`);
  expect(row.agent6_boundary_required === true, `${row.row_subset_id} agent6_boundary_required must be true`);
  expect(row.candidate_text_rows_now === 0, `${row.row_subset_id} candidate text rows must be 0`);
  expect(row.definition_candidate_rows_now === 0, `${row.row_subset_id} definition candidate rows must be 0`);
  expect(row.lemma_candidate_rows_now === 0, `${row.row_subset_id} lemma candidate rows must be 0`);
  expect(row.reader_hint_candidate_rows_now === 0, `${row.row_subset_id} reader hint candidate rows must be 0`);
  expect(row.answer_eligible_rows_now === 0, `${row.row_subset_id} answer eligible rows must be 0`);
  expect(row.public_emit_rows_now === 0, `${row.row_subset_id} public emit rows must be 0`);
  expect(row.accepted_gloss_text_rows_now === 0, `${row.row_subset_id} accepted text rows must be 0`);
  expect(row.definition_content_rows_now === 0, `${row.row_subset_id} definition content rows must be 0`);
  if (row.license_lane === 'noncommercial_educational_candidate') {
    expect(row.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary', 'only Klein should be NC in this matrix');
    expect(row.derived_from_nc === true, 'NC derived_from_nc must be true');
    expect(row.commercial_export_allowed === false, 'NC commercial_export_allowed must be false');
    expect(row.attribution_required === true, 'NC attribution_required must be true');
    expect(row.corpus_contamination === false, 'NC corpus_contamination must be false');
    expect(/no_commercial_export/.test(row.exact_blocker), 'NC blocker must preserve no commercial export');
  }
  if (row.license_lane === 'blocked_or_needs_review') {
    expect(row.row_subset_id === 'old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong', 'only BDB Augmented Strong should be blocked in this matrix');
    expect(/missing_independent_source_license_custody_basis/.test(row.exact_blocker), 'blocked row must preserve custody blocker');
  }
}

const assertions = artifact.lane_preservation_assertions || {};
expect(assertions.commercial_clean_candidate_not_contaminated_by_nc === true, 'commercial clean contamination assertion missing');
expect(assertions.nc_separate_partition_required === true, 'NC separate partition assertion missing');
expect(assertions.nc_commercial_export_allowed_required_value === false, 'NC commercial export assertion mismatch');
expect(assertions.blocked_or_needs_review_excluded_from_transform === true, 'blocked exclusion assertion missing');

for (const [key, value] of Object.entries(artifact.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
}

const boundary = JSON.stringify(artifact.non_acceptance_boundary || []);
for (const phrase of [
  'No Definition authority',
  'No answer acceptance',
  'No source/license/legal acceptance',
  'No accepted gloss/text',
  'No public/runtime mutation',
  'No NC commercial authorization',
]) {
  expect(boundary.includes(phrase), `boundary missing ${phrase}`);
}

if (issues.length) {
  console.error(`Agent 2 old-dictionary excluded-row transform readiness matrix validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 old-dictionary excluded-row transform readiness matrix validation passed. Source-family rows: 5; allowed transform rows now: 0; NC lane preserved.');

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

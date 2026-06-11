#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json';
const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), 'utf8'));
const issues = [];
const allowedLabels = ['counterpart candidate', 'project-preferred counterpart candidate'];
const allowedFamilies = ['BDB Dictionary', 'BDB Aramaic Dictionary', 'Jastrow Dictionary', 'Klein Dictionary'];
const allowedLanes = ['commercial_clean_candidate', 'noncommercial_educational_candidate'];
const publicHints = readJson('data/public-hud/orot/reader-hints.json');
const priorPackage = readJson('data/build/orot/reader-hint-placeholder-candidates.json');

expect(report.artifact_type === 'agent2_orot_missed_dictionary_reader_hint_candidates', 'unexpected artifact_type');
for (const flag of [
  'pre_agent6_review',
  'non_public_reader_hint_candidate_evidence_only',
  'no_rows_added_before_agent6',
  'no_answer_rows',
  'no_answer_eligibility',
  'no_public_hud_rows',
  'no_route_jsonl_rows',
  'no_route_shard_writes',
  'no_definition_content_rows',
  'no_nc_definition_content_storage',
  'no_public_mutation',
  'no_runtime_mutation',
  'no_qa_acceptance',
  'no_source_provenance_acceptance',
  'no_license_acceptance',
  'no_definition_authority',
  'no_usage_as_definition_authority',
  'no_answer_acceptance',
  'no_public_runtime_acceptance',
  'no_publication_readiness',
  'no_route_publication_support',
  'no_product_data_acceptance',
  'no_translation_output',
  'no_accepted_gloss',
  'no_accepted_text',
]) {
  expect(report.boundary?.[flag] === true, `boundary.${flag} must be true`);
}

expect(Number.isInteger(report.summary?.candidate_rows), 'summary.candidate_rows must be an integer');
expect(report.summary.candidate_rows === (report.rows || []).length, 'candidate row count mismatch');
expect(report.summary.candidate_rows >= 0, 'candidate rows must be zero or positive');
expect(report.summary.rows_added_now === 0, 'rows_added_now must be 0');
expect(report.summary.rows_cleared_by_agent6_now === 0, 'rows_cleared_by_agent6_now must be 0');
expect(report.summary.rows_blocked_pending_agent6 === report.summary.candidate_rows, 'rows pending Agent 6 must equal candidate rows');
expect(report.summary.candidate_occurrences === sum((report.rows || []).map((row) => row.occurrences)), 'candidate occurrences mismatch');
if (report.summary.candidate_rows > 0) {
  expect(report.source_family_lane_preflight?.required === true, 'source_family_lane_preflight.required must be true');
  expect(report.source_family_lane_preflight?.missing_classified_row_count === 0, 'non-zero candidate packets require Agent 1 source-family lane classification for every row');
  expect(report.source_family_lane_preflight?.blocks_candidate_text_export === false, 'classified candidate packet must not block candidate text export');
}

const used = new Set([
  ...Object.keys(publicHints.hints_by_token_id || {}),
  ...(priorPackage.rows || []).map((row) => row.token_id || row.target_token_id),
]);
const seen = new Set();
let commercial = 0;
let nc = 0;
for (const row of report.rows || []) {
  const id = row.target_token_id;
  expect(id, 'row missing target_token_id');
  expect(!seen.has(id), `${id} duplicate row`);
  seen.add(id);
  expect(!used.has(id), `${id} already public or packaged`);
  expect(allowedLanes.includes(row.lane), `${id} invalid lane`);
  expect(row.family_status === row.lane, `${id} family_status must match lane`);
  expect(allowedLabels.includes(row.provisional_label), `${id} invalid provisional label`);
  expect(row.counterpart_text === 'TBD', `${id} must use TBD placeholder text`);
  expect(row.placeholder_status === 'placeholder_only', `${id} must be placeholder-only`);
  expect(row.placeholder_text_stored_now === true, `${id} placeholder flag must be true`);
  expect(row.definition_text_stored_now === false, `${id} definition text must not be stored`);
  expect(row.answer_eligible === false, `${id} answer eligibility must be false`);
  expect(row.public_emit_ready === false, `${id} public emit must be false`);
  expect(row.add_now_before_agent6 === false, `${id} add_now_before_agent6 must be false`);
  expect(row.cleared_by_agent6_now === false, `${id} cleared_by_agent6_now must be false`);
  expect(row.agent1_source_family_classified === true, `${id} must have Agent 1 source-family lane classification before candidate output`);
  expect(row.source_family_classification_status === 'agent1_classified', `${id} source_family_classification_status must be agent1_classified`);
  expect(Array.isArray(row.source_families) && row.source_families.length > 0, `${id} must include source families`);
  expect(row.source_families.every((family) => allowedFamilies.includes(family)), `${id} has disallowed source family`);
  expect(!row.source_families.includes('BDB Augmented Strong'), `${id} must not use BDB Augmented Strong`);
  if (row.lane === 'commercial_clean_candidate') {
    commercial += 1;
    expect(row.license_lane === 'commercial_clean_candidate', `${id} commercial license_lane mismatch`);
    expect(row.consumed_from_partition === 'commercial_clean_candidate', `${id} commercial consumed_from_partition mismatch`);
    expect(row.source_license_group === 'PUBLIC_DOMAIN_OBSERVED', `${id} commercial license group mismatch`);
    expect(row.derived_from_nc === false, `${id} commercial derived_from_nc must be false`);
    expect(row.owner_use_attestation === null, `${id} commercial owner_use_attestation must be null`);
  }
  if (row.lane === 'noncommercial_educational_candidate') {
    nc += 1;
    expect(row.license_lane === 'noncommercial_educational_candidate', `${id} NC license_lane mismatch`);
    expect(row.consumed_from_partition === 'noncommercial_educational_candidate', `${id} NC must be consumed from NC educational partition`);
    expect(row.source_license_group === 'CC_BY_NC', `${id} NC license group mismatch`);
    expect(row.derived_from_nc === true, `${id} NC derived_from_nc must be true`);
    expect(row.commercial_export_allowed === false, `${id} NC commercial export must be false`);
    expect(row.attribution_required === true, `${id} NC attribution required`);
    expect(row.owner_use_attestation === 'noncommercial_educational_zero_profit_zero_kickback', `${id} NC owner_use_attestation mismatch`);
    expect(row.corpus_contamination === false, `${id} NC contamination must be false`);
    expect(row.answer_eligible === false, `${id} NC answer_eligible must remain false`);
    expect(row.public_emit === false, `${id} NC public_emit must remain false`);
    expect(row.noncommercial_display_public_or_runtime_authorized === false, `${id} NC public/runtime display must be false`);
  }
}

expect(report.summary.commercial_clean_candidate_rows === commercial, 'commercial row count mismatch');
expect(report.summary.noncommercial_educational_candidate_rows === nc, 'NC row count mismatch');
expect(report.source_license_counts?.commercial_clean_candidate === commercial, 'source_license_counts commercial mismatch');
expect(report.source_license_counts?.noncommercial_educational_candidate === nc, 'source_license_counts NC mismatch');

const outputs = report.outputs_now || {};
for (const key of [
  'answer_rows',
  'answer_eligible_rows',
  'source_rows',
  'public_hud_rows',
  'route_jsonl_rows',
  'route_shards_written',
  'definition_content_rows',
  'nc_definition_content_rows',
]) {
  expect(outputs[key] === 0, `outputs_now.${key} must be 0`);
}
for (const key of [
  'public_mutation_files',
  'runtime_files_touched',
  'source_payload_mutation_files',
  'lexical_payload_mutation_files',
  'token_index_mutation_files',
]) {
  expect(Array.isArray(outputs[key]) && outputs[key].length === 0, `outputs_now.${key} must be empty`);
}

const text = fs.readFileSync(path.join(root, reportPath), 'utf8');
for (const forbidden of [
  '"provisional_label": "definition"',
  '"provisional_label": "answer"',
  '"provisional_label": "translation"',
  '"provisional_label": "accepted gloss"',
  '"provisional_label": "verified"',
  '"provisional_label": "top match"',
  '"definition_text_stored_now": true',
  '"answer_eligible": true',
  '"public_emit": true',
  '"public_emit_ready": true',
]) {
  expect(!text.includes(forbidden), `must not contain ${forbidden}`);
}

if (issues.length) {
  console.error('Agent 2 Orot missed-dictionary reader-hint candidate validation failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 2 Orot missed-dictionary reader-hint candidate validation passed for ${reportPath}. Rows: ${report.rows.length}; occurrences: ${report.summary.candidate_occurrences}.`);

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

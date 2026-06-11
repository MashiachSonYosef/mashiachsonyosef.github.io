#!/usr/bin/env node
import fs from 'node:fs';

const verdictPath =
  process.argv[2] || 'reports/agent6-old-dictionary-overlap-exclusion-and-row-overlap-supplement-verdict-2026-06-05.json';

function fail(message) {
  console.error(`Validation failed: ${message}`);
  process.exit(1);
}

function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`could not read JSON ${path}: ${error.message}`);
  }
}

function expect(condition, message) {
  if (!condition) fail(message);
}

const verdict = readJson(verdictPath);

expect(verdict.artifact_type === 'agent6_old_dictionary_overlap_exclusion_and_row_overlap_supplement_verdict', 'artifact_type mismatch');
expect(verdict.disposition === 'warn_accepted_nonpublic_planning_evidence_only', 'disposition mismatch');

const overlap = verdict.commercial_nc_overlap_verdict || {};
expect(overlap.disposition === 'warn_accepted_nonpublic_overlap_exclusion_planning_evidence_only', 'overlap disposition mismatch');
for (const [key, expected] of [
  ['audited_rows', 500],
  ['audited_occurrences', 8427],
  ['commercial_nc_overlap_rows', 197],
  ['commercial_nc_overlap_occurrences', 4185],
  ['commercial_nc_without_bdb_augmented_strong_rows', 57],
  ['commercial_nc_without_bdb_augmented_strong_occurrences', 818],
  ['commercial_nc_with_bdb_augmented_strong_rows', 140],
  ['commercial_nc_with_bdb_augmented_strong_occurrences', 3367],
  ['klein_only_excluded_rows', 17],
  ['klein_only_excluded_occurrences', 259],
  ['pairwise_klein_intersection_count', 4],
  ['exact_klein_combination_count', 7],
]) {
  expect(overlap[key] === expected, `commercial_nc_overlap_verdict.${key} must be ${expected}`);
}

const supplement = verdict.row_overlap_supplement_verdict || {};
expect(supplement.disposition === 'warn_accepted_nonpublic_row_overlap_planning_evidence_only', 'supplement disposition mismatch');
expect(supplement.validation_ok === true, 'supplement validation must be true');
for (const [key, expected] of [
  ['total_boundary_question_records', 8],
  ['nonzero_boundary_question_records', 6],
  ['zero_row_boundary_records', 2],
  ['total_rows_represented', 500],
  ['total_occurrences_represented', 8427],
]) {
  expect(supplement[key] === expected, `row_overlap_supplement_verdict.${key} must be ${expected}`);
}

const buckets = supplement.buckets || {};
const expectedBuckets = new Map([
  ['commercial_clean_only', [18, 494]],
  ['commercial_clean_plus_noncommercial_educational', [57, 818]],
  ['commercial_clean_plus_blocked_review', [82, 1068]],
  ['commercial_clean_plus_noncommercial_educational_plus_blocked_review', [140, 3367]],
  ['noncommercial_educational_only', [17, 259]],
  ['no_sefaria_source_hit', [186, 2421]],
  ['metadata_or_link_only', [0, 0]],
  ['blocked_review_only', [0, 0]],
]);
for (const [bucket, [rows, occurrences]] of expectedBuckets) {
  expect(buckets[bucket]?.rows === rows, `${bucket} rows mismatch`);
  expect(buckets[bucket]?.occurrences === occurrences, `${bucket} occurrences mismatch`);
}

expect(Array.isArray(verdict.zero_output_counters_recounted_nonzero), 'zero output recount must be an array');
expect(verdict.zero_output_counters_recounted_nonzero.length === 0, 'zero output counters must all remain zero');

for (const warning of [
  'lane_counts_are_overlap_presence_counts_not_additive_export_rows',
  'klein_bearing_rows_remain_nc_separated_and_not_commercially_authorized',
  'bdb_augmented_strong_overlap_rows_remain_blocked_or_needs_review',
  'this_verdict_does_not_answer_or_clear_future_candidate_use_questions',
]) {
  expect((verdict.warnings || []).includes(warning), `missing warning: ${warning}`);
}

for (const forbidden of [
  'qa_acceptance_beyond_this_docket',
  'source_provenance_acceptance',
  'source_license_legal_acceptance',
  'source_family_selection_acceptance',
  'commercial_clean_selection',
  'nc_educational_selection',
  'bdb_augmented_strong_exclusion_acceptance',
  'candidate_use',
  'transform',
  'source_row_emission',
  'candidate_text_export',
  'definition_content_storage',
  'answer_eligibility',
  'public_runtime_mutation',
  'route_shard_write',
  'commercial_export_permission',
  'nc_commercial_authorization',
  'release_action',
  'definition_authority',
  'usage_as_definition_authority',
  'accepted_gloss_text',
  'public_reader_output',
  'publication_readiness',
  'product_data_acceptance',
]) {
  expect((verdict.not_accepted || []).includes(forbidden), `missing not_accepted: ${forbidden}`);
}

for (const boundary of [
  'exact_row_subset_package_with_queue_ids_and_intended_use',
  'source_family_selection_or_exclusion_rule',
  'morphology_status_where_relevant',
  'nc_separation_no_commercial_authorization_boundary_for_klein_bearing_rows',
  'bdb_augmented_strong_custody_resolution_or_exclusion_proof_for_triple_overlap_rows',
]) {
  expect((verdict.next_required_boundary || []).includes(boundary), `missing next required boundary: ${boundary}`);
}

console.log('Agent6 old-dictionary overlap exclusion and row-overlap supplement verdict validation passed. Rows: 500; occurrences: 8427.');

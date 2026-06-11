#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || 'reports/agent2-old-dictionary-excluded-row-reaudit-consumption-prep-2026-06-05.json');
const packet = readJson(artifactPath);
const issues = [];

expect(packet.schema_version === '1.0', 'schema_version must be 1.0');
expect(packet.artifact_type === 'agent2_old_dictionary_excluded_row_reaudit_consumption_prep', 'artifact_type mismatch');
expect(packet.current_agent1_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 thread id mismatch');
expect(packet.target === 'old-dictionary-excluded-row-license-lane-reaudit', 'target mismatch');
expect(packet.classified_input_status === 'classified_agent1_input_present_but_no_transform_emitted', 'classified input status mismatch');

const requiredFields = [
  'source_family',
  'source_name',
  'license_label',
  'license_lane',
  'attribution_required',
  'derived_from_nc',
  'commercial_export_allowed',
  'source_url_or_citation',
  'agent6_boundary_required',
  'row_subset_id',
  'evidence_path',
  'corpus_contamination',
];
for (const field of requiredFields) {
  expect(packet.required_agent1_fields?.includes(field), `required_agent1_fields missing ${field}`);
}

for (const lane of [
  'commercial_clean_candidate',
  'noncommercial_educational_candidate',
  'metadata_or_link_only',
  'blocked_or_needs_review',
]) {
  expect(packet.required_lanes?.includes(lane), `required_lanes missing ${lane}`);
  expect(packet.lane_partition?.[lane], `lane_partition missing ${lane}`);
}

expect(packet.observed_counts?.audited_rows === 500, 'audited_rows must be 500');
expect(packet.observed_counts?.audited_occurrences === 8427, 'audited_occurrences must be 8427');
expect(packet.observed_counts?.source_family_count === 5, 'source_family_count must be 5');
expect(packet.observed_counts?.commercial_clean_candidate_source_families === 3, 'commercial clean family count must be 3');
expect(packet.observed_counts?.noncommercial_educational_candidate_source_families === 1, 'NC family count must be 1');
expect(packet.observed_counts?.metadata_or_link_only_source_families === 0, 'metadata-only family count must be 0');
expect(packet.observed_counts?.blocked_or_needs_review_source_families === 1, 'blocked family count must be 1');

const nc = packet.lane_partition?.noncommercial_educational_candidate;
expect(nc?.row_subset_ids?.includes('old-dictionary-excluded-row-license-lane-reaudit::klein-dictionary'), 'Klein row subset must remain NC');
expect(nc?.required_flags?.derived_from_nc === true, 'NC derived_from_nc must be true');
expect(nc?.required_flags?.commercial_export_allowed === false, 'NC commercial_export_allowed must be false');
expect(nc?.required_flags?.attribution_required === true, 'NC attribution_required must be true');
expect(nc?.required_flags?.corpus_contamination === false, 'NC corpus_contamination must be false');

expect(packet.lane_partition?.blocked_or_needs_review?.row_subset_ids?.includes('old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong'), 'BDB Augmented Strong must remain blocked');
expect(packet.exact_blocker_if_not_classified?.id === 'none_for_source_family_lane_classification', 'classification blocker should be none');
expect(packet.current_transform_blockers?.includes('missing_exact_agent6_row_subset_boundary_for_any_candidate_text_package_or_display_behavior'), 'Agent 6 transform blocker missing');
expect(packet.current_transform_blockers?.includes('noncommercial_educational_candidate::klein-dictionary_no_commercial_export_authorization'), 'NC commercial blocker missing');

for (const [key, value] of Object.entries(packet.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
}

const boundary = JSON.stringify(packet.non_acceptance_boundary || []);
for (const phrase of [
  'No Definition authority',
  'No answer acceptance',
  'No source/license/legal acceptance',
  'No accepted gloss/text',
  'No public/runtime mutation',
  'No NC commercial authorization',
]) {
  expect(boundary.includes(phrase), `non_acceptance_boundary missing ${phrase}`);
}

for (const [label, relativePath] of Object.entries(packet.upstream_artifacts || {})) {
  expect(fs.existsSync(path.join(root, cleanRelativePath(relativePath))), `upstream artifact missing: ${label}`);
}

if (issues.length) {
  console.error(`Agent 2 old-dictionary excluded-row consumption prep validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 old-dictionary excluded-row consumption prep validation passed. Classified source families: 5; transform output rows: 0; NC lane preserved.');

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

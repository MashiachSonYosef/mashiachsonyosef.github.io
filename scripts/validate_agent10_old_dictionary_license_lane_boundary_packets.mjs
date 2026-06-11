#!/usr/bin/env node

import fs from 'node:fs';

const REAUDIT_PACKET = 'reports/agent10-agent6-ready-old-dictionary-excluded-row-license-lane-reaudit-boundary-packet-2026-06-04.json';
const SUPPLEMENT_PACKET = 'reports/agent10-agent6-ready-old-dictionary-license-lane-export-partitions-supplement-2026-06-04.json';

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function requireEqual(actual, expected, label) {
  if (actual !== expected) fail(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function requireTrue(value, label) {
  if (value !== true) fail(`${label}: expected true, got ${JSON.stringify(value)}`);
}

function requireFalse(value, label) {
  if (value !== false) fail(`${label}: expected false, got ${JSON.stringify(value)}`);
}

function requireIncludes(values, expected, label) {
  if (!Array.isArray(values) || !values.includes(expected)) fail(`${label}: missing ${JSON.stringify(expected)}`);
}

function requireZeroMap(obj, keys, label) {
  for (const key of keys) requireEqual(obj?.[key], 0, `${label}.${key}`);
}

function requireBoundaryFalse(boundary, keys, label) {
  for (const key of keys) requireFalse(boundary?.[key], `${label}.${key}`);
}

const reaudit = readJson(REAUDIT_PACKET);
const supplement = readJson(SUPPLEMENT_PACKET);

requireEqual(
  reaudit.artifact_type,
  'agent10_agent6_ready_old_dictionary_excluded_row_license_lane_reaudit_boundary_packet',
  'reaudit.artifact_type',
);
requireEqual(reaudit.active_mode, 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / controlled Spark support', 'reaudit.active_mode');
requireEqual(reaudit.workset, 'old-dictionary-excluded-row-license-lane-reaudit', 'reaudit.workset');
requireEqual(reaudit.review_scope, 'nonpublic_source_family_license_lane_planning_evidence_only', 'reaudit.review_scope');
requireEqual(reaudit.status, 'agent6_ready_old_dictionary_license_lane_reaudit_packet_not_accepted', 'reaudit.status');

requireEqual(reaudit.counts?.audited_rows, 500, 'reaudit.counts.audited_rows');
requireEqual(reaudit.counts?.audited_occurrences, 8427, 'reaudit.counts.audited_occurrences');
requireEqual(reaudit.counts?.public_domain_observed_rows, 297, 'reaudit.counts.public_domain_observed_rows');
requireEqual(reaudit.counts?.public_domain_observed_occurrences, 5747, 'reaudit.counts.public_domain_observed_occurrences');
requireEqual(reaudit.counts?.blocked_only_non_public_domain_or_unresolved_rows, 17, 'reaudit.counts.blocked_only_non_public_domain_or_unresolved_rows');
requireEqual(reaudit.counts?.blocked_only_non_public_domain_or_unresolved_occurrences, 259, 'reaudit.counts.blocked_only_non_public_domain_or_unresolved_occurrences');
requireEqual(reaudit.counts?.no_sefaria_hit_rows, 186, 'reaudit.counts.no_sefaria_hit_rows');
requireEqual(reaudit.counts?.no_sefaria_hit_occurrences, 2421, 'reaudit.counts.no_sefaria_hit_occurrences');
requireEqual(reaudit.counts?.next_missed_rows, 50, 'reaudit.counts.next_missed_rows');
requireEqual(reaudit.counts?.next_missed_occurrences, 1193, 'reaudit.counts.next_missed_occurrences');
requireZeroMap(
  reaudit.counts,
  [
    'answer_rows',
    'source_rows_emitted',
    'public_hud_rows',
    'route_jsonl_rows',
    'route_shard_writes',
    'runtime_files_changed',
    'source_files_changed',
    'token_index_files_changed',
    'lexical_payload_files_changed',
    'definition_content_rows',
    'nc_definition_content_rows',
    'accepted_text_rows',
    'public_reader_output_rows',
  ],
  'reaudit.counts',
);

const lanes = new Map((reaudit.source_family_lanes || []).map((row) => [row.source_family, row]));
for (const [family, lane] of [
  ['Jastrow Dictionary', 'commercial_clean_candidate'],
  ['BDB Dictionary', 'commercial_clean_candidate'],
  ['BDB Aramaic Dictionary', 'commercial_clean_candidate'],
  ['Klein Dictionary', 'noncommercial_educational_candidate'],
  ['BDB Augmented Strong', 'blocked_or_needs_review'],
]) {
  requireEqual(lanes.get(family)?.license_lane, lane, `reaudit.source_family_lanes.${family}.license_lane`);
  requireTrue(lanes.get(family)?.agent6_boundary_required, `reaudit.source_family_lanes.${family}.agent6_boundary_required`);
}
for (const [family, row] of lanes.entries()) {
  requireEqual(row.source_name, family, `reaudit.source_family_lanes.${family}.source_name`);
  if (typeof row.license_label !== 'string' || row.license_label.length < 8) fail(`reaudit.source_family_lanes.${family}.license_label missing`);
  if (typeof row.source_url_or_citation !== 'string' || row.source_url_or_citation.length < 20) fail(`reaudit.source_family_lanes.${family}.source_url_or_citation missing`);
  requireFalse(row.commercial_export_allowed, `reaudit.source_family_lanes.${family}.commercial_export_allowed`);
  requireTrue(row.attribution_required, `reaudit.source_family_lanes.${family}.attribution_required`);
}
for (const family of ['Jastrow Dictionary', 'BDB Dictionary', 'BDB Aramaic Dictionary']) {
  requireEqual(lanes.get(family)?.license_label, 'public_domain_observed_pending_agent6_boundary', `reaudit.source_family_lanes.${family}.license_label`);
  requireFalse(lanes.get(family)?.derived_from_nc, `reaudit.source_family_lanes.${family}.derived_from_nc`);
}
const klein = lanes.get('Klein Dictionary');
requireEqual(klein?.license_label, 'CC-BY-NC-family-observed_pending_agent6_boundary', 'reaudit.Klein.license_label');
requireTrue(klein?.derived_from_nc, 'reaudit.Klein.derived_from_nc');
requireFalse(klein?.commercial_export_allowed, 'reaudit.Klein.commercial_export_allowed');
requireTrue(klein?.attribution_required, 'reaudit.Klein.attribution_required');
requireEqual(klein?.owner_use_attestation, 'noncommercial_educational_zero_profit_zero_kickback', 'reaudit.Klein.owner_use_attestation');
requireFalse(klein?.corpus_contamination, 'reaudit.Klein.corpus_contamination');
const augmentedStrong = lanes.get('BDB Augmented Strong');
requireEqual(augmentedStrong?.license_label, 'unresolved_needs_independent_source_license_custody_evidence', 'reaudit.BDB Augmented Strong.license_label');
requireFalse(augmentedStrong?.derived_from_nc, 'reaudit.BDB Augmented Strong.derived_from_nc');

for (const lane of ['commercial_clean_candidate', 'noncommercial_educational_candidate', 'metadata_or_link_only', 'blocked_or_needs_review']) {
  requireIncludes(reaudit.lane_policy?.allowed_lanes, lane, 'reaudit.lane_policy.allowed_lanes');
}
for (const key of [
  'new_dictionary_sources_are_not_automatically_nc',
  'old_excluded_dictionary_rows_are_not_automatically_blocked',
  'commercial_clean_and_nc_educational_outputs_must_remain_separate',
  'commercial_clean_export_excludes_nc_rows',
  'metadata_link_only_rows_do_not_emit_definition_text',
  'blocked_review_rows_stay_out_of_candidate_text_exports',
]) {
  requireTrue(reaudit.lane_policy?.[key], `reaudit.lane_policy.${key}`);
}
requireTrue(reaudit.boundary?.nonpublic_planning_evidence_only, 'reaudit.boundary.nonpublic_planning_evidence_only');
requireBoundaryFalse(
  reaudit.boundary,
  [
    'agent2_candidate_text_consumption_authorized',
    'source_provenance_acceptance_authorized',
    'license_legal_acceptance_authorized',
    'definition_authority_authorized',
    'answer_eligibility_authorized',
    'candidate_text_export_authorized',
    'definition_content_storage_authorized',
    'public_runtime_mutation_authorized',
    'route_shard_write_authorized',
    'publication_readiness_authorized',
    'commercial_export_permission_authorized',
    'nc_commercial_authorization',
  ],
  'reaudit.boundary',
);

for (const forbidden of [
  'source/provenance acceptance',
  'license acceptance',
  'Definition authority',
  'answer eligibility',
  'public/runtime acceptance',
  'publication readiness',
  'candidate-text export',
  'commercial export permission',
  'NC commercial authorization',
]) {
  requireIncludes(reaudit.what_must_not_be_accepted, forbidden, 'reaudit.what_must_not_be_accepted');
}

requireEqual(supplement.artifact_type, 'agent10_agent6_ready_old_dictionary_license_lane_export_partitions_supplement', 'supplement.artifact_type');
requireEqual(supplement.active_mode, 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE / controlled Spark support', 'supplement.active_mode');
requireEqual(supplement.status, 'agent6_ready_supplemental_partition_evidence_not_accepted', 'supplement.status');
requireEqual(supplement.review_scope, 'supplemental_nonpublic_lane_partition_planning_evidence_only', 'supplement.review_scope');
requireEqual(supplement.primary_boundary_packet, REAUDIT_PACKET, 'supplement.primary_boundary_packet');

requireEqual(supplement.partition_counts?.commercial_clean_candidate?.source_family_count, 3, 'supplement.partition_counts.commercial_clean_candidate.source_family_count');
requireEqual(supplement.partition_counts?.commercial_clean_candidate?.row_count, 500, 'supplement.partition_counts.commercial_clean_candidate.row_count');
requireEqual(supplement.partition_counts?.commercial_clean_candidate?.occurrence_count, 10940, 'supplement.partition_counts.commercial_clean_candidate.occurrence_count');
requireEqual(supplement.partition_counts?.noncommercial_educational_candidate?.source_family_count, 1, 'supplement.partition_counts.noncommercial_educational_candidate.source_family_count');
requireEqual(supplement.partition_counts?.noncommercial_educational_candidate?.row_count, 214, 'supplement.partition_counts.noncommercial_educational_candidate.row_count');
requireEqual(supplement.partition_counts?.noncommercial_educational_candidate?.occurrence_count, 4444, 'supplement.partition_counts.noncommercial_educational_candidate.occurrence_count');
requireEqual(supplement.partition_counts?.blocked_or_needs_review?.source_family_count, 1, 'supplement.partition_counts.blocked_or_needs_review.source_family_count');
requireEqual(supplement.partition_counts?.blocked_or_needs_review?.row_count, 222, 'supplement.partition_counts.blocked_or_needs_review.row_count');
requireEqual(supplement.partition_counts?.blocked_or_needs_review?.occurrence_count, 4435, 'supplement.partition_counts.blocked_or_needs_review.occurrence_count');

requireTrue(supplement.count_semantics?.partition_counts_are_source_family_hit_totals, 'supplement.count_semantics.partition_counts_are_source_family_hit_totals');
requireTrue(supplement.count_semantics?.row_count_is_not_exclusive_export_row_count, 'supplement.count_semantics.row_count_is_not_exclusive_export_row_count');
requireFalse(supplement.count_semantics?.exclusive_export_row_counts_authorized_now, 'supplement.count_semantics.exclusive_export_row_counts_authorized_now');

for (const key of [
  'commercial_clean_export_excludes_nc',
  'nc_educational_export_separate',
  'metadata_or_link_only_emits_citation_link_only',
  'blocked_or_needs_review_emits_no_candidate_text',
]) {
  requireTrue(supplement.lane_controls?.[key], `supplement.lane_controls.${key}`);
}
for (const key of ['commercial_export_allowed_now', 'public_emit_now', 'answer_eligible_now']) {
  requireFalse(supplement.lane_controls?.[key], `supplement.lane_controls.${key}`);
}
requireEqual(supplement.nc_controls?.klein_license_lane, 'noncommercial_educational_candidate', 'supplement.nc_controls.klein_license_lane');
requireTrue(supplement.nc_controls?.derived_from_nc, 'supplement.nc_controls.derived_from_nc');
requireFalse(supplement.nc_controls?.commercial_export_allowed, 'supplement.nc_controls.commercial_export_allowed');
requireTrue(supplement.nc_controls?.attribution_required, 'supplement.nc_controls.attribution_required');
requireEqual(supplement.nc_controls?.owner_use_attestation, 'noncommercial_educational_zero_profit_zero_kickback', 'supplement.nc_controls.owner_use_attestation');
requireFalse(supplement.nc_controls?.corpus_contamination, 'supplement.nc_controls.corpus_contamination');
requireZeroMap(
  supplement.zero_output_counts,
  [
    'answer_rows',
    'source_rows',
    'public_hud_rows',
    'route_jsonl_rows',
    'route_shard_writes',
    'runtime_files_changed',
    'source_files_changed',
    'token_index_files_changed',
    'lexical_payload_files_changed',
    'definition_content_rows',
    'accepted_text_rows',
    'public_reader_output_rows',
  ],
  'supplement.zero_output_counts',
);
requireTrue(supplement.boundary?.nonpublic_planning_evidence_only, 'supplement.boundary.nonpublic_planning_evidence_only');
requireTrue(supplement.boundary?.supplemental_to_primary_boundary_only, 'supplement.boundary.supplemental_to_primary_boundary_only');
requireBoundaryFalse(
  supplement.boundary,
  [
    'source_license_acceptance_authorized',
    'license_legal_acceptance_authorized',
    'candidate_text_export_authorized',
    'commercial_export_permission_authorized',
    'nc_commercial_authorization',
    'answer_eligibility_authorized',
    'definition_content_storage_authorized',
    'public_runtime_mutation_authorized',
    'route_shard_write_authorized',
    'publication_readiness_authorized',
  ],
  'supplement.boundary',
);

if (process.exitCode) process.exit(process.exitCode);
console.log('agent10 old-dictionary license-lane boundary packet validation passed');

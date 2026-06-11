#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = cleanRelativePath(process.argv[2] || 'reports/agent2-old-dictionary-lane-planning-intake-2026-06-04.json');
const artifact = readJson(artifactPath);
const issues = [];

expect(artifact.schema_version === '1.0', 'schema_version must be 1.0');
expect(artifact.artifact_type === 'agent2_old_dictionary_lane_planning_intake', 'unexpected artifact_type');
expect(artifact.status === 'old_dictionary_lane_planning_evidence_intaked_nonpublic_only', 'unexpected status');
expect(artifact.disposition === 'WARN-ACCEPTED', 'disposition must be WARN-ACCEPTED');
expect(artifact.accepted_scope === 'nonpublic_old_dictionary_source_family_license_lane_and_lane_partition_planning_evidence_only', 'accepted_scope mismatch');

for (const [key, relativePath] of Object.entries(artifact.inputs || {})) {
  requirePath(relativePath, `inputs.${key}`);
}

validatePlanningCounts(artifact.planning_counts);
validateSourceFamilies(artifact.source_family_lane_planning_evidence);
validatePartitions(artifact.supplemental_partition_planning_counts);
validateBlockerUpdate(artifact.blocker_update);
validateNextPipelineEffect(artifact.next_agent2_pipeline_effect);
validateHandoffContext(artifact.current_handoff_context);
validateZeroCounters(artifact.zero_output_counts);
validateBoundary(artifact);

if (issues.length) {
  console.error(`Agent 2 old-dictionary lane planning intake validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, 120)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 old-dictionary lane planning intake validation passed. Planning rows: 500; next missed: 50; candidate rows emitted: 0.');

function validatePlanningCounts(counts) {
  expect(counts?.audited_rows === 500, 'planning_counts.audited_rows must be 500');
  expect(counts?.audited_occurrences === 8427, 'planning_counts.audited_occurrences must be 8427');
  expect(counts?.public_domain_observed_rows === 297, 'planning_counts.public_domain_observed_rows must be 297');
  expect(counts?.public_domain_observed_occurrences === 5747, 'planning_counts.public_domain_observed_occurrences must be 5747');
  expect(counts?.blocked_only_non_public_domain_or_unresolved_rows === 17, 'planning_counts blocked/unresolved rows must be 17');
  expect(counts?.blocked_only_non_public_domain_or_unresolved_occurrences === 259, 'planning_counts blocked/unresolved occurrences must be 259');
  expect(counts?.no_sefaria_hit_rows === 186, 'planning_counts.no_sefaria_hit_rows must be 186');
  expect(counts?.no_sefaria_hit_occurrences === 2421, 'planning_counts.no_sefaria_hit_occurrences must be 2421');
  expect(counts?.next_missed_rows === 50, 'planning_counts.next_missed_rows must be 50');
  expect(counts?.next_missed_occurrences === 1193, 'planning_counts.next_missed_occurrences must be 1193');
}

function validateSourceFamilies(families) {
  const expected = {
    'Jastrow Dictionary': ['commercial_clean_candidate', 210, 4474],
    'BDB Dictionary': ['commercial_clean_candidate', 221, 4418],
    'BDB Aramaic Dictionary': ['commercial_clean_candidate', 69, 2048],
    'Klein Dictionary': ['noncommercial_educational_candidate', 214, 4444],
    'BDB Augmented Strong': ['blocked_or_needs_review', 222, 4435],
  };
  for (const [name, [lane, rows, occurrences]] of Object.entries(expected)) {
    const row = families?.[name];
    expect(Boolean(row), `missing source family ${name}`);
    expect(row?.license_lane === lane, `${name}.license_lane mismatch`);
    expect(row?.rows === rows, `${name}.rows mismatch`);
    expect(row?.occurrences === occurrences, `${name}.occurrences mismatch`);
  }
  const klein = families?.['Klein Dictionary'];
  expect(klein?.derived_from_nc === true, 'Klein must preserve derived_from_nc=true');
  expect(klein?.commercial_export_allowed === false, 'Klein must preserve commercial_export_allowed=false');
  expect(klein?.attribution_required === true, 'Klein must preserve attribution_required=true');
  expect(klein?.owner_use_attestation === 'noncommercial_educational_zero_profit_zero_kickback', 'Klein owner_use_attestation mismatch');
  expect(klein?.corpus_contamination === false, 'Klein must preserve corpus_contamination=false');
}

function validatePartitions(partitions) {
  const expected = {
    commercial_clean_candidate: [3, 500, 10940],
    noncommercial_educational_candidate: [1, 214, 4444],
    metadata_or_link_only: [0, 0, 0],
    blocked_or_needs_review: [1, 222, 4435],
  };
  for (const [lane, [sourceFamilies, rows, occurrences]] of Object.entries(expected)) {
    const row = partitions?.[lane];
    expect(row?.source_family_count === sourceFamilies, `${lane}.source_family_count mismatch`);
    expect(row?.rows === rows, `${lane}.rows mismatch`);
    expect(row?.occurrences === occurrences, `${lane}.occurrences mismatch`);
  }
}

function validateBlockerUpdate(blocker) {
  expect(blocker?.prior_blocker_replaced === 'source_lane_assignment_missing_before_agent1_reaudit', 'prior blocker replacement mismatch');
  expect(blocker?.replacement_status === 'resolved_for_nonpublic_source_family_license_lane_planning_evidence_intake_only', 'replacement status mismatch');
  expect(blocker?.remaining_exact_blocker === 'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary', 'remaining exact blocker mismatch');
  for (const key of [
    'candidate_text_consumption_allowed_now',
    'candidate_text_export_allowed_now',
    'definition_content_storage_allowed_now',
    'answer_eligible_now',
    'public_emit_allowed_now',
    'commercial_export_allowed_now',
    'nc_public_display_allowed_now',
    'nc_commercial_authorization_now',
  ]) {
    expect(blocker?.[key] === false, `blocker_update.${key} must be false`);
  }
}

function validateNextPipelineEffect(effect) {
  expect(effect?.may_use_as_nonpublic_planning_context === true, 'planning context should be allowed');
  expect(effect?.may_generate_candidate_text_rows === false, 'candidate text rows must not be generated');
  expect(effect?.may_generate_lane_partition_planning_rows === true, 'lane partition planning rows should be allowed');
  expect(effect?.may_rerun_orot_missed_dictionary_candidate_pipeline_without_changed_linkage === false, 'unchanged Orot rerun must be false');
  const text = JSON.stringify(effect?.required_next_input_for_candidate_generation || []);
  expect(text.includes('168 Orot unmatched rows'), 'required next input must mention 168 Orot unmatched rows');
  expect(text.includes('exact Agent 6 boundary'), 'required next input must mention exact Agent 6 boundary');
}

function validateHandoffContext(context) {
  requirePath(context?.bundle, 'current_handoff_context.bundle');
  expect(context?.runnable_pipelines === 7, 'current handoff runnable_pipelines must be 7');
  expect(context?.validator_only_checks === 24, 'current handoff validator_only_checks must be 24');
  expect(context?.orot_missed_dictionary_unmatched === 168, 'current handoff Orot unmatched count must be 168');
}

function validateZeroCounters(counters) {
  for (const [key, value] of Object.entries(counters || {})) {
    expect(value === 0, `zero_output_counts.${key} must be 0`);
  }
}

function validateBoundary(value) {
  const forbiddenTrueMarkers = [
    '"answer_eligible_now":true',
    '"public_emit_allowed_now":true',
    '"candidate_text_consumption_allowed_now":true',
    '"candidate_text_export_allowed_now":true',
    '"definition_content_storage_allowed_now":true',
    '"nc_commercial_authorization_now":true',
  ];
  const text = JSON.stringify(value);
  for (const marker of forbiddenTrueMarkers) expect(!text.includes(marker), `forbidden true marker present: ${marker}`);
  const boundary = JSON.stringify(value.what_must_not_be_accepted || []);
  for (const required of [
    'Definition authority',
    'answer eligibility',
    'public reader output',
    'route-shard edit',
    'candidate text consumption/export',
    'NC commercial authorization',
  ]) {
    expect(boundary.includes(required), `what_must_not_be_accepted must include ${required}`);
  }
}

function requirePath(relativePath, label) {
  expect(typeof relativePath === 'string' && relativePath.length > 0, `${label} path is required`);
  if (relativePath) expect(fs.existsSync(path.join(root, cleanRelativePath(relativePath))), `${label} path does not exist: ${relativePath}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

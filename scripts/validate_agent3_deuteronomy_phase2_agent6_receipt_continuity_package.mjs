#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] || 'reports/agent3-deuteronomy-phase2-agent6-receipt-continuity-package-2026-06-04.json';

const artifact = readJson(artifactPath);
const matrix = readJson('reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json');
const returnPackage = readJson('reports/agent3-deuteronomy-phase2-spark1-return-consumption-package-2026-06-04.json');
const supplementalConsumption = readJson(
  'reports/agent10-agent6-deuteronomy-phase2-agent3-supplemental-receipt-consumption-2026-06-04.json',
);
const agent2Readiness = readJson('reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.json');
const partitionPlan = readJson('reports/agent2-deuteronomy-phase2-partition-export-plan-2026-06-04.json');

const issues = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_deuteronomy_phase2_agent6_receipt_continuity_package', 'unexpected artifact_type');
expect(artifact.status === 'agent6_receipt_consumed_continuity_package', 'unexpected status');
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');

for (const input of artifact.reviewed_inputs || []) {
  expect(Boolean(input.role), 'reviewed input role missing');
  expect(Boolean(input.path), `reviewed input path missing for ${input.role}`);
  expect(fs.existsSync(resolve(input.path)), `reviewed input does not exist: ${input.path}`);
  expect(/^[a-f0-9]{64}$/.test(input.sha256 || ''), `reviewed input sha256 invalid: ${input.path}`);
}

expect(artifact.upstream_agent3_package?.status === returnPackage.status, 'upstream Agent 3 package status mismatch');
expect(artifact.agent6_transform_readiness_verdict?.disposition === 'WARN-ACCEPTED_exact_nonpublic_transform_readiness_planning_evidence_only', 'Agent 6 verdict disposition mismatch');
expect(artifact.agent6_supplemental_receipt?.disposition === 'RECEIVED_WARN_ACCEPTED_supplemental_linkage_dedupe_provenance_evidence_only', 'Agent 6 supplemental receipt disposition mismatch');
expect(artifact.agent6_supplemental_receipt?.widens_prior_verdict === false, 'supplemental receipt must not widen prior verdict');
expect(artifact.agent10_consumption_observed?.status === supplementalConsumption.status, 'Agent 10 supplemental consumption status mismatch');
expect(artifact.agent10_consumption_observed?.widens_prior_agent6_verdict === false, 'Agent 10 consumption must not widen prior Agent 6 verdict');

expectCounts(artifact.matrix_counts_current, matrix.counts, [
  'rows',
  'occurrences',
  'occurrence_units',
  'source_units',
  'manifest_chunks',
  'downstream_boundary_rows',
  'downstream_boundary_occurrences',
  'exact_blocker_rows',
  'exact_blocker_occurrences',
  'duplicate_key_collision_groups',
  'public_hud_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'runtime_files_changed',
  'source_files_changed',
  'token_index_files_changed',
  'lexical_payload_files_changed',
  'definition_content_rows',
  'nc_definition_content_rows',
  'answer_rows',
  'accepted_text_rows',
]);

expectCounts(artifact.agent2_readiness_current?.counts, agent2Readiness.counts, [
  'rows',
  'occurrences',
  'commercial_clean_candidate_rows',
  'commercial_clean_candidate_occurrences',
  'noncommercial_educational_candidate_rows',
  'noncommercial_educational_candidate_occurrences',
  'metadata_or_link_only_rows',
  'blocked_or_needs_review_rows',
  'answer_eligible_rows',
  'public_emit_rows',
  'definition_text_emitted_rows',
  'accepted_text_emitted_rows',
  'route_shard_write_rows',
]);
expectZeroObject(artifact.agent2_readiness_current?.zero_emission_counters || {}, 'Agent 2 readiness zero_emission_counters');

expect(artifact.agent2_partition_plan_observed?.status === partitionPlan.status, 'Agent 2 partition plan status mismatch');
expectCounts(artifact.agent2_partition_plan_observed?.counts, partitionPlan.counts, [
  'rows',
  'occurrences',
  'commercial_clean_candidate_rows',
  'commercial_clean_candidate_occurrences',
  'noncommercial_educational_candidate_rows',
  'noncommercial_educational_candidate_occurrences',
  'metadata_or_link_only_rows',
  'blocked_or_needs_review_rows',
  'candidate_text_export_rows',
  'answer_eligible_rows',
  'public_emit_rows',
]);
expectZeroObject(artifact.agent2_partition_plan_observed?.zero_emission_counters || {}, 'Agent 2 partition zero_emission_counters');

const summary = artifact.package_summary || {};
expect(summary.agent6_review_received_for_prior_agent3_package === true, 'Agent 6 review receipt must be observed');
expect(summary.agent10_consumed_agent6_receipt === true, 'Agent 10 consumption must be observed');
expect(summary.agent2_partition_plan_observed === true, 'Agent 2 partition plan must be observed');
expect(summary.current_carry_forward_state === 'nonpublic_planning_evidence_only', 'carry-forward state must stay nonpublic planning only');
expect(summary.exact_blocker_rows_still_blocked === 6779, 'blocked row count must remain 6779');
expect(summary.exact_blocker_occurrences_still_blocked === 9631, 'blocked occurrence count must remain 9631');
expect(summary.reviewed_planning_rows === 1334, 'reviewed planning rows must remain 1334');
expect(summary.reviewed_planning_occurrences === 2964, 'reviewed planning occurrences must remain 2964');

expect(!Object.prototype.hasOwnProperty.call(artifact, 'rows'), 'package must not copy row arrays');
expect(!Object.prototype.hasOwnProperty.call(artifact.agent2_partition_plan_observed || {}, 'rows'), 'package must not copy partition row arrays');
const serialized = JSON.stringify(artifact);
for (const forbidden of ['safe_rendering_options', 'accepted_text_value', 'definition_payload']) {
  expect(!serialized.includes(`"${forbidden}"`), `forbidden payload field copied: ${forbidden}`);
}

for (const claim of [
  'QA acceptance beyond exact Agent 6 dockets',
  'source/provenance acceptance',
  'license acceptance',
  'legal acceptance',
  'Definition authority',
  'usage-as-definition authority',
  'answer eligibility',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'accepted gloss/text',
  'definition-content storage',
]) {
  expect((artifact.what_must_not_be_accepted || []).includes(claim), `missing non-acceptance boundary: ${claim}`);
}

if (issues.length) {
  console.error('Agent 3 Deuteronomy Agent 6 receipt continuity package validation failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(
  `Agent 3 Deuteronomy Agent 6 receipt continuity package validation passed: planning rows ${summary.reviewed_planning_rows}; blocked rows ${summary.exact_blocker_rows_still_blocked}`,
);

function expectCounts(actual, expected, keys) {
  for (const key of keys) {
    expect(actual?.[key] === expected?.[key], `count ${key} mismatch: expected ${expected?.[key]}, found ${actual?.[key]}`);
  }
}

function expectZeroObject(values, label) {
  for (const [key, value] of Object.entries(values)) {
    expect(Number(value) === 0, `${label}.${key} expected 0, found ${value}`);
  }
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(resolve(file), 'utf8'));
}

function resolve(file) {
  return path.join(root, file);
}

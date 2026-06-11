#!/usr/bin/env node
import fs from 'node:fs';

const packetPath =
  process.argv[2] || 'reports/agent10-agent6-ready-old-dictionary-candidate-use-package-boundary-packet-2026-06-05.json';

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

const packet = readJson(packetPath);

expect(
  packet.artifact_type === 'agent10_agent6_ready_old_dictionary_candidate_use_package_boundary_packet',
  'artifact_type mismatch'
);
expect(packet.release_owner === 'Agent 10', 'release_owner must be Agent 10');
expect(packet.review_scope === 'nonpublic_old_dictionary_candidate_use_planning_package_only', 'review_scope mismatch');
expect(packet.package_workset === 'old_dictionary_morphology_candidate_use_planning_package', 'package_workset mismatch');

const inputs = packet.inputs_consumed || {};
for (const [field, expected] of [
  ['agent2_package_json', 'reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json'],
  ['agent4_gate_proof_json', 'reports/agent4-agent2-old-dictionary-morphology-candidate-use-package-gate-proof-2026-06-05.json'],
  ['agent10_consumption_json', 'reports/agent10-agent2-old-dictionary-morphology-candidate-use-package-consumption-2026-06-05.json'],
  ['prior_agent6_input_verdict_json', 'reports/agent6-old-dictionary-morphology-candidate-use-boundary-verdict-2026-06-05.json'],
  ['exact_row_source_json', 'reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json'],
  ['morphology_matrix_json', 'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json'],
]) {
  expect(inputs[field] === expected, `input ${field} mismatch`);
}

const boundary = packet.exact_boundary_requested || {};
expect(boundary.rows === 78, 'boundary rows must be 78');
expect(boundary.occurrences === 1461, 'boundary occurrences must be 1461');
expect(boundary.unique_queue_ids === 78, 'boundary unique_queue_ids must be 78');
expect(boundary.license_lane === 'commercial_clean_candidate', 'license_lane mismatch');
expect(boundary.noncommercial_educational_candidate_rows === 0, 'NC rows must be 0');
expect(boundary.preview_relation_class === 'exact_after_mark_strip', 'relation class mismatch');
expect(
  boundary.agent2_morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning',
  'Agent 2 morphology relation status mismatch'
);
expect(boundary.morphology_blocked_rows_excluded === 219, 'excluded morphology-blocked row count must be 219');
expect(boundary.candidate_use_scope === 'nonpublic_candidate_use_planning_package_only', 'candidate_use_scope mismatch');

const validatorResults = packet.validator_results || [];
expect(validatorResults.length === 2, 'expected two validator result rows');
expect(validatorResults.every((row) => row.result === 'passed'), 'all validator rows must pass');
expect(validatorResults.some((row) => row.rows === 78 && row.occurrences === 1461), 'missing 78/1461 validator count');

const carry = packet.requested_carry_forward || {};
expect(carry.carry_as_nonpublic_candidate_use_planning_package_only === true, 'carry flag must be true');
for (const field of [
  'candidate_text_allowed_now',
  'transform_output_allowed_now',
  'definition_lemma_reader_hint_content_storage_allowed_now',
  'answer_eligibility_allowed_now',
  'public_emit_allowed_now',
  'route_write_allowed_now',
  'source_license_legal_acceptance_allowed_now',
  'commercial_export_allowed_now',
  'nc_commercial_use_allowed_now',
  'release_action_allowed_now',
]) {
  expect(carry[field] === false, `${field} must be false`);
}

for (const [key, expected] of Object.entries(packet.zero_counters || {})) {
  expect(expected === 0, `zero counter ${key} must be 0`);
}

for (const blocker of [
  'candidate_text_export_blocked',
  'definition_lemma_reader_hint_content_storage_blocked',
  'answer_eligibility_blocked',
  'public_runtime_mutation_blocked',
  'route_writes_blocked',
  'accepted_text_blocked',
  'release_action_blocked',
  '219_morphology_blocked_rows_excluded',
  'actual_text_storage_transform_output_export_answer_or_runtime_mutation_requires_new_agent6_verdict',
]) {
  expect((packet.blockers_preserved || []).includes(blocker), `missing blocker: ${blocker}`);
}

for (const forbidden of [
  'QA acceptance',
  'source/provenance acceptance',
  'license/legal acceptance',
  'Definition authority',
  'usage-as-definition authority',
  'answer acceptance',
  'answer eligibility',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'product/data acceptance',
  'translation output',
  'accepted gloss/text',
  'public reader output',
  'route-shard edit',
  'public/runtime mutation',
  'candidate text export',
  'definition-content storage',
  'commercial export authorization',
  'NC commercial authorization',
  'release action',
]) {
  expect((packet.forbidden_claims || []).includes(forbidden), `missing forbidden claim: ${forbidden}`);
}

expect(
  packet.stop_condition.includes('Do not store candidate text'),
  'stop condition must preserve no-text/no-runtime boundary'
);

console.log(
  `Agent10 old-dictionary candidate-use package boundary packet validation passed. ` +
    `Rows: ${boundary.rows}; occurrences: ${boundary.occurrences}; zero counters: ${Object.keys(packet.zero_counters || {}).length}.`
);

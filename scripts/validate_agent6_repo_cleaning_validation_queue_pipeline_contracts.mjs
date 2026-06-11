#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath =
  process.argv[2] || 'reports/agent6-repo-cleaning-validation-queue-pipeline-contracts-2026-06-05.json';

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

const artifact = readJson(artifactPath);

expect(artifact.agent === 'Agent 6', 'agent must be Agent 6');
expect(artifact.disposition === 'contract_authored_not_implemented', 'disposition must remain contract_authored_not_implemented');
expect(
  artifact.scope === 'pipeline_contracts_for_repo_cleaning_repo_validation_and_queued_item_validation',
  'unexpected scope'
);
expect(
  artifact.stop_condition === 'three_reusable_contracts_authored_with_required_fields_no_implementation_or_acceptance_created',
  'stop_condition must preserve contract-only status'
);

const contracts = artifact.contracts || [];
expect(Array.isArray(contracts) && contracts.length === 3, 'expected exactly three pipeline contracts');
const requiredPipelines = new Set([
  'repo-cleaning classification pipeline',
  'repo-validation pipeline',
  'queued-item validation pipeline',
]);

const requiredFields = [
  'pipeline',
  'target_scope',
  'inputs',
  'command_or_script',
  'output_artifact_schema',
  'validator_docket_rule',
  'queued_item_handling',
  'agent7_handoff',
  'blocker',
  'stop_condition',
];

for (const contract of contracts) {
  expect(requiredPipelines.has(contract.pipeline), `unexpected pipeline: ${contract.pipeline}`);
  for (const field of requiredFields) {
    expect(contract[field] !== undefined, `${contract.pipeline} missing ${field}`);
  }
  expect(Array.isArray(contract.inputs) && contract.inputs.length > 0, `${contract.pipeline} needs inputs`);
  expect(typeof contract.command_or_script === 'string' && contract.command_or_script.includes('scripts/'), `${contract.pipeline} needs script command`);
  expect(
    Array.isArray(contract.output_artifact_schema) && contract.output_artifact_schema.length >= 5,
    `${contract.pipeline} needs output schema fields`
  );
}

const boundaries = artifact.boundaries || {};
for (const forbidden of [
  'git_add_A',
  'git_reset_hard',
  'blind_deletion',
  'destructive_cleanup_from_classification_alone',
  'accept_product_source_license_legal_runtime_publication_answer_without_exact_docket',
]) {
  expect((boundaries.agent6_may_not || []).includes(forbidden), `missing may_not boundary: ${forbidden}`);
}

const snapshot = artifact.current_calibration_snapshot || {};
const repo = snapshot.repo_dirt || {};
expect(repo.dirty_records === 17239, 'repo_dirt.dirty_records expected 17239');
expect(repo.tracked_deletions === 12231, 'repo_dirt.tracked_deletions expected 12231');
expect(repo.untracked === 3496, 'repo_dirt.untracked expected 3496');
expect(repo.data_public_hud_dirty_records === 11937, 'repo_dirt.data_public_hud_dirty_records expected 11937');

const queue = snapshot.agent6_queue || {};
expect(queue.validator_result === 'passed_0_warnings', 'agent6 queue validator_result must be passed_0_warnings');
expect(queue.items_observed === 37, 'agent6 queue items_observed expected 37');
expect(queue.pending_or_queued_like_items_observed === 6, 'agent6 pending/queued items expected 6');

const backlog = artifact.required_pipeline_implementation_backlog || [];
for (const expected of [
  'scripts/classify_agent6_repo_dirt.mjs',
  'scripts/validate_agent6_repo_dirt_classification.mjs',
  'scripts/validate_agent6_repo_dirt_batch.mjs',
  'scripts/select_agent6_queue_item.mjs',
  'scripts/validate_agent6_queue_item_evidence.mjs',
]) {
  expect(backlog.includes(expected), `missing implementation backlog item: ${expected}`);
}

const blockers = artifact.exact_blockers || [];
for (const blocker of [
  'durable_churn_blocked_until_proposed_scripts_or_equivalent_exact_commands_exist_and_are_validated',
  'repo_cleanup_blocked_from_destructive_execution_until_file_families_are_classified_and_owner_release_lane_approval_exists',
  'public_runtime_cleanup_blocked_by_11937_data_public_hud_dirty_deleted_records_until_agent10_changed_input_proof_exists',
  'control_state_cleanup_blocked_by_16_untracked_data_control_files_until_agent5_agent7_publish_reject_or_mark_local_only',
  'queue_item_acceptance_blocked_per_item_until_dated_agent6_verdict_exists',
]) {
  expect(blockers.includes(blocker), `missing exact blocker: ${blocker}`);
}

for (const forbidden of [
  'implementation',
  'staging',
  'deletion',
  'cleanup',
  'queue_state_update',
  'product_acceptance',
  'source_license_legal_acceptance',
  'public_runtime_acceptance',
  'definition_authority',
  'answer_eligibility',
  'publication_readiness',
  'accepted_text',
  'release_action',
]) {
  expect((artifact.must_not_be_accepted || []).includes(forbidden), `missing must_not_be_accepted: ${forbidden}`);
}

console.log(
  `Agent6 repo-cleaning/validation/queue pipeline contracts validation passed. ` +
    `Contracts: ${contracts.length}; backlog: ${backlog.length}; blockers: ${blockers.length}; ` +
    `queue items: ${queue.items_observed}.`
);

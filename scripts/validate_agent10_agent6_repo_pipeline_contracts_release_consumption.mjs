#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath =
  process.argv[2] || 'reports/agent10-agent6-repo-pipeline-contracts-release-consumption-2026-06-05.json';

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

expect(
  artifact.artifact_type === 'agent10_agent6_repo_pipeline_contracts_release_consumption',
  'unexpected artifact_type'
);
expect(artifact.release_owner === 'Agent 10', 'release_owner must be Agent 10');
expect(artifact.posture === 'direct_release_package_decision_mode', 'unexpected posture');

const inputs = artifact.inputs_consumed || [];
for (const expected of [
  'reports/agent6-repo-dirt-classification-support-2026-06-05.json',
  'reports/agent6-repo-cleaning-validation-queue-pipeline-contracts-2026-06-05.json',
  'reports/agent4-agent6-repo-dirt-classification-support-gate-proof-2026-06-05.json',
  'reports/agent4-agent6-repo-cleaning-validation-queue-pipeline-contracts-gate-proof-2026-06-05.json',
]) {
  expect(inputs.includes(expected), `missing consumed input: ${expected}`);
}

const dirt = artifact.repo_dirt_counts || {};
expect(dirt.dirty_records_total === 17239, 'dirty_records_total expected 17239');
expect(dirt.tracked_deletions === 12231, 'tracked_deletions expected 12231');
expect(dirt.untracked === 3496, 'untracked expected 3496');
expect(dirt.data_public_hud_records === 11937, 'data_public_hud_records expected 11937');
expect(dirt.reports_records === 2777, 'reports_records expected 2777');
expect(dirt.scripts_records === 442, 'scripts_records expected 442');

const contracts = artifact.agent6_contract_counts || {};
expect(contracts.contracts_authored === 3, 'contracts_authored expected 3');
expect(contracts.implementation_backlog_items === 5, 'implementation_backlog_items expected 5');
expect(contracts.exact_blockers === 5, 'exact_blockers expected 5');
expect(contracts.queue_items_observed === 37, 'queue_items_observed expected 37');
expect(contracts.pending_or_queued_like_items_observed === 6, 'pending_or_queued_like_items_observed expected 6');

const rows = artifact.rows || [];
expect(Array.isArray(rows) && rows.length === 2, 'expected two release-consumption rows');
for (const row of rows) {
  expect(row.release_question, 'each row needs release_question');
  expect(row.current_package_boundary_state, 'each row needs current_package_boundary_state');
  expect(row.agent6_route_needed, 'each row needs agent6_route_needed');
  expect(row.agent5_preservation_handoff, 'each row needs agent5_preservation_handoff');
  expect(row.exact_blocker, 'each row needs exact_blocker');
  expect(row.stop_condition, 'each row needs stop_condition');
}

const backlog = artifact.implementation_backlog || [];
for (const expected of [
  'scripts/classify_agent6_repo_dirt.mjs',
  'scripts/validate_agent6_repo_dirt_classification.mjs',
  'scripts/validate_agent6_repo_dirt_batch.mjs',
  'scripts/select_agent6_queue_item.mjs',
  'scripts/validate_agent6_queue_item_evidence.mjs',
]) {
  expect(backlog.includes(expected), `missing implementation_backlog item: ${expected}`);
}

const zero = artifact.zero_counters || {};
for (const key of [
  'public_runtime_mutation',
  'route_shard_writes',
  'route_jsonl_rows',
  'candidate_text_export_rows',
  'definition_content_rows',
  'answer_rows',
  'answer_eligible_rows',
  'accepted_text_rows',
  'public_reader_output_rows',
  'repo_cleanup_actions',
  'staging_actions',
  'deletion_actions',
  'queue_state_updates',
]) {
  expect(zero[key] === 0, `${key} must be 0`);
}

for (const forbidden of [
  'QA acceptance',
  'source/provenance acceptance',
  'license/legal acceptance',
  'Definition authority',
  'usage-as-definition authority',
  'answer acceptance',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'product/data acceptance',
  'accepted gloss/text',
  'public reader output',
  'route-shard edit',
  'public/runtime mutation',
  'candidate text export',
  'definition-content storage',
  'commercial export authorization',
  'NC commercial authorization',
  'repo cleanup authorization',
  'staging authorization',
  'deletion authorization',
  'queue item acceptance',
  'release action',
]) {
  expect((artifact.forbidden_claims || []).includes(forbidden), `missing forbidden claim: ${forbidden}`);
}

console.log(
  `Agent10 Agent6 repo-pipeline contracts release-consumption validation passed. ` +
    `Dirty records: ${dirt.dirty_records_total}; contracts: ${contracts.contracts_authored}; ` +
    `backlog: ${backlog.length}; zero counters checked: ${Object.keys(zero).length}.`
);

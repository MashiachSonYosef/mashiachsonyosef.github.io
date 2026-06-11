#!/usr/bin/env node
import fs from 'node:fs';

const artifactPath =
  process.argv[2] || 'reports/agent6-repo-dirt-classification-support-2026-06-05.json';

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
expect(artifact.disposition === 'warn_blocking_support_docket', 'unexpected disposition');
expect(
  artifact.scope === 'non_destructive_repo_dirt_classification_only',
  'scope must remain non-destructive classification only'
);
expect(
  artifact.stop_condition === 'classification_artifact_exists_no_destructive_action_taken',
  'stop_condition must preserve no destructive action'
);

const counts = artifact.counts || {};
for (const key of ['dirty_records_total', 'tracked_deletions', 'tracked_modified', 'tracked_added', 'untracked']) {
  expect(Number.isInteger(counts[key]) && counts[key] >= 0, `missing non-negative count: ${key}`);
}
expect(
  counts.dirty_records_total ===
    counts.tracked_deletions + counts.tracked_modified + counts.tracked_added + counts.untracked,
  'dirty_records_total must equal tracked_deletions + tracked_modified + tracked_added + untracked'
);

const families = artifact.path_family_counts || {};
for (const key of ['data/public-hud', 'reports', 'site-pages', 'scripts', 'data/control']) {
  expect(Number.isInteger(families[key]) && families[key] >= 0, `missing path_family_counts.${key}`);
}
expect(families['data/public-hud'] > 0, 'data/public-hud dirt must remain visible');
expect(families.reports > 0, 'reports dirt must remain visible');
expect(families.scripts > 0, 'scripts dirt must remain visible');

const deletion = artifact.deletion_classification || {};
expect(
  deletion['data/public-hud']?.classification === 'generated_output_churn_candidate_but_p0_until_reconciled',
  'data/public-hud deletion classification must remain p0 until reconciled'
);
expect(
  deletion.reports?.classification === 'provenance_docket_loss_risk_hold',
  'reports deletion classification must preserve provenance loss risk'
);
expect(
  deletion.scripts?.classification === 'validator_builder_loss_risk_hold',
  'scripts deletion classification must preserve validator/builder loss risk'
);

const blockers = artifact.exact_blockers || [];
const blockerNames = new Set(blockers.map((row) => row.blocker));
for (const blocker of [
  'public_hud_package_truth_blocked',
  'provenance_and_validator_recountability_blocked',
  'control_truth_blocked_if_untracked_files_are_relied_on',
  'runtime_public_claims_blocked',
  'source_provenance_claims_blocked',
  'destructive_cleanup_not_authorized',
]) {
  expect(blockerNames.has(blocker), `missing exact blocker: ${blocker}`);
}

for (const row of blockers) {
  expect(row.evidence, `blocker ${row.blocker || '<missing>'} missing evidence`);
  expect(row.handoff_owner, `blocker ${row.blocker || '<missing>'} missing handoff_owner`);
}

const mustNot = artifact.must_not_be_accepted || [];
for (const forbidden of [
  'staging',
  'deletion',
  'revert',
  'cleanup_complete',
  'qa_acceptance',
  'source_provenance_acceptance',
  'license_legal_acceptance',
  'runtime_public_acceptance',
  'definition_authority',
  'answer_eligibility',
  'publication_readiness',
  'accepted_text',
  'release_action',
]) {
  expect(mustNot.includes(forbidden), `missing must_not_be_accepted boundary: ${forbidden}`);
}

console.log(
  `Agent6 repo-dirt classification support validation passed. ` +
    `Dirty records: ${counts.dirty_records_total}; tracked deletions: ${counts.tracked_deletions}; ` +
    `untracked: ${counts.untracked}; blockers: ${blockers.length}.`
);

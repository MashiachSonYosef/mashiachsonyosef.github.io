#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const repoRoot = process.cwd();

const PATHS = {
  plan: 'reports/agent1-source-file-reconciliation-action-plan-2026-06-03.json',
  planMd: 'reports/agent1-source-file-reconciliation-action-plan-2026-06-03.md',
  trackingPacket: 'reports/agent1-source-custody-tracking-action-packet.json',
  licensePacket: 'reports/agent1-source-custody-license-normalization-action-packet.json',
  custodyBlocklist: 'reports/agent1-custody-blocklist.json',
  result: 'reports/agent1-source-file-reconciliation-action-plan-validator-result-2026-06-03.json',
  resultMd: 'reports/agent1-source-file-reconciliation-action-plan-validator-result-2026-06-03.md'
};

const MUST_NOT_ACCEPT = [
  'source/provenance custody',
  'source/provenance acceptance',
  'source publication',
  'source-file tracking approval',
  'source-file staging, commit, or merge',
  'downstream direct artifact acceptance',
  'downstream content-reference acceptance',
  'QA acceptance',
  'public/runtime acceptance',
  'publication readiness',
  'route publication support',
  'Definition authority',
  'product/data acceptance',
  'usage-as-definition authority',
  'translation output',
  'accepted translation text'
].sort((a, b) => a.localeCompare(b));

function fullPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(fullPath(relativePath), 'utf8');
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), value, 'utf8');
}

function assert(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

function sorted(values) {
  return [...values].sort((a, b) => String(a).localeCompare(String(b)));
}

function sameSet(actual, expected, label) {
  const left = sorted(actual || []);
  const right = sorted(expected || []);
  assert(left.length === right.length && left.every((value, index) => value === right[index]), `${label} mismatch`, { actual: left, expected: right });
}

function runGitStatus() {
  const output = execSync('git status --porcelain=v1 -- data/sources', {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const rows = new Map();
  for (const line of output.split(/\r?\n/).filter(Boolean)) {
    rows.set(line.slice(3), line.slice(0, 2));
  }
  return rows;
}

function assertBoundary(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'publication state must remain blocked_no_render');
  assert(boundary?.completion_claimed === false, 'completion must not be claimed');
  assert(boundary?.action_plan_only === true, 'plan must be action-plan-only');
  for (const key of [
    'source_provenance_custody_claimed',
    'source_provenance_acceptance_claimed',
    'source_publication_claimed',
    'source_file_tracking_approval_claimed',
    'source_file_staging_claimed',
    'downstream_direct_artifact_acceptance_claimed',
    'downstream_content_reference_acceptance_claimed',
    'qa_acceptance_claimed',
    'public_runtime_acceptance_claimed',
    'route_publication_support_claimed',
    'definition_authority_claimed',
    'product_data_acceptance_claimed',
    'usage_as_definition_authority_claimed',
    'translation_output_claimed',
    'accepted_translation_text_claimed'
  ]) {
    assert(boundary?.[key] === false, `boundary ${key} must be false`);
  }
}

function renderMarkdown(result) {
  return `# Agent 1 Source File Reconciliation Action Plan Validator Result

Generated: ${result.completed_at}

- OK: ${result.ok}
- Validated plan: \`${result.validated_plan}\`
- Track-candidate source files: ${result.track_candidate_source_files}
- Modified tracked source files: ${result.modified_tracked_source_files}
- Missing manifest source files: ${result.missing_manifest_source_files}
- Blocked direct/content-reference paths: ${result.blocked_downstream_direct_paths}/${result.blocked_downstream_content_reference_paths}
- Action performed: ${result.action_performed}
- Publication state: \`${result.boundary.publication_state}\`

This validator confirms the action plan is current, non-mutating, and review-only. It does not mark source/provenance custody, source tracking, QA, runtime, publication, Definition, product/data, usage-as-definition, translation output, or accepted text as accepted.
`;
}

function main() {
  const startedAt = new Date().toISOString();
  const plan = readJson(PATHS.plan);
  const tracking = readJson(PATHS.trackingPacket);
  const license = readJson(PATHS.licensePacket);
  const blocklist = readJson(PATHS.custodyBlocklist);
  const planMd = readText(PATHS.planMd);
  const gitStatus = runGitStatus();

  const trackPaths = tracking.track_candidate_sources.map((row) => row.source_path);
  const modifiedPaths = license.modified_tracked_sources.map((row) => row.source_path);
  const planTrackPaths = plan.proposed_actions.track_23_untracked_sources.paths.map((row) => row.path);
  const planModifiedPaths = plan.proposed_actions.accept_6_license_label_normalizations.paths.map((row) => row.path);

  assert(plan.artifact_type === 'agent1_source_file_reconciliation_action_plan', 'unexpected artifact type');
  sameSet(planTrackPaths, trackPaths, 'track candidate paths');
  sameSet(planModifiedPaths, modifiedPaths, 'modified tracked paths');
  assert(plan.summary.track_candidate_source_files === 23, 'expected 23 tracking candidates');
  assert(plan.summary.modified_tracked_source_files === 6, 'expected 6 modified tracked files');
  assert(plan.summary.total_source_file_reconciliation_candidates === 29, 'expected 29 reconciliation candidates');
  assert(plan.summary.missing_manifest_source_files === 0, 'expected zero missing manifest source files');
  assert(plan.summary.modified_tracked_non_license_diffs === 0, 'expected zero non-license diffs');
  assert(plan.summary.modified_tracked_non_pd_to_public_domain_diffs === 0, 'expected zero non-PD-to-Public-Domain diffs');
  assert(plan.summary.blocked_downstream_direct_paths === blocklist.summary.blocked_direct_artifact_paths, 'blocked direct path count mismatch');
  assert(plan.summary.blocked_downstream_content_reference_paths === blocklist.summary.blocked_content_reference_paths, 'blocked content-reference count mismatch');

  for (const row of plan.proposed_actions.track_23_untracked_sources.paths) {
    assert(row.git_status === '??', `plan track row must record ?? for ${row.path}`);
    assert(gitStatus.get(row.path) === '??', `live git status must remain ?? for ${row.path}`);
    assert(row.action_performed === false, `track action must not be performed for ${row.path}`);
  }
  for (const row of plan.proposed_actions.accept_6_license_label_normalizations.paths) {
    assert(row.git_status === ' M', `plan modified row must record space-M for ${row.path}`);
    assert(gitStatus.get(row.path) === ' M', `live git status must remain space-M for ${row.path}`);
    assert(row.action_performed === false, `license action must not be performed for ${row.path}`);
    assert(row.all_diffs_are_license_pd_to_public_domain === true, `license row must be PD to Public Domain only for ${row.path}`);
  }

  assert(plan.proposed_actions.track_23_untracked_sources.action_performed === false, 'tracking action must not be performed');
  assert(plan.proposed_actions.accept_6_license_label_normalizations.action_performed === false, 'license action must not be performed');
  assert(plan.proposed_actions.downstream_reliance.action_performed === false, 'downstream action must not be performed');
  assert(plan.proposed_actions.track_23_untracked_sources.display_only_git_add_command.startsWith('git add -- '), 'tracking display command missing');
  assert(plan.proposed_actions.accept_6_license_label_normalizations.display_only_git_add_command.startsWith('git add -- '), 'license display command missing');
  assert(planMd.includes('These commands are display-only evidence for review after Agent 6 disposition. They were not run.'), 'markdown must state commands were not run');
  assert(planMd.includes('## Agent 8 Callback'), 'markdown must include Agent 8 Callback');
  sameSet(plan.must_not_accept, MUST_NOT_ACCEPT, 'must-not-accept terms');
  assertBoundary(plan.boundary);

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_plan: PATHS.plan,
    validated_plan_md: PATHS.planMd,
    track_candidate_source_files: plan.summary.track_candidate_source_files,
    modified_tracked_source_files: plan.summary.modified_tracked_source_files,
    missing_manifest_source_files: plan.summary.missing_manifest_source_files,
    blocked_downstream_direct_paths: plan.summary.blocked_downstream_direct_paths,
    blocked_downstream_content_reference_paths: plan.summary.blocked_downstream_content_reference_paths,
    action_performed: false,
    boundary: plan.boundary
  };

  writeJson(PATHS.result, result);
  writeText(PATHS.resultMd, renderMarkdown(result));
  console.log(JSON.stringify(result, null, 2));
}

main();

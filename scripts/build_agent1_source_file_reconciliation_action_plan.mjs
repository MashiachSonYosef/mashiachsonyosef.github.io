#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const repoRoot = process.cwd();

const PATHS = {
  trackingPacket: 'reports/agent1-source-custody-tracking-action-packet.json',
  licensePacket: 'reports/agent1-source-custody-license-normalization-action-packet.json',
  custodyBlocklist: 'reports/agent1-custody-blocklist.json',
  refreshResult: 'reports/agent1-source-custody-refresh-result.json',
  completionAudit: 'reports/agent1-source-custody-objective-completion-audit-2026-06-03.json',
  outputJson: 'reports/agent1-source-file-reconciliation-action-plan-2026-06-03.json',
  outputMd: 'reports/agent1-source-file-reconciliation-action-plan-2026-06-03.md'
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
];

function fullPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(fullPath(relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(fullPath(relativePath)), { recursive: true });
  fs.writeFileSync(fullPath(relativePath), value, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runGitStatus() {
  const output = execSync('git status --porcelain=v1 -- data/sources', {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const rows = new Map();
  for (const line of output.split(/\r?\n/).filter(Boolean)) {
    const status = line.slice(0, 2);
    const sourcePath = line.slice(3);
    rows.set(sourcePath, status);
  }
  return rows;
}

function boundary() {
  return {
    agent1_status: 'evidence-ready / awaiting-Agent-6',
    publication_state: 'blocked_no_render',
    action_plan_only: true,
    source_provenance_custody_claimed: false,
    source_provenance_acceptance_claimed: false,
    source_publication_claimed: false,
    source_file_tracking_approval_claimed: false,
    source_file_staging_claimed: false,
    downstream_direct_artifact_acceptance_claimed: false,
    downstream_content_reference_acceptance_claimed: false,
    qa_acceptance_claimed: false,
    public_runtime_acceptance_claimed: false,
    route_publication_support_claimed: false,
    definition_authority_claimed: false,
    product_data_acceptance_claimed: false,
    usage_as_definition_authority_claimed: false,
    translation_output_claimed: false,
    accepted_translation_text_claimed: false
  };
}

function shellQuoteForDisplay(value) {
  return `"${value.replace(/"/g, '\\"')}"`;
}

function renderMarkdown(plan) {
  return `# Agent 1 Source File Reconciliation Action Plan

Generated: ${plan.generated_at}

Highest permissible claim: source-file reconciliation action evidence prepared for Agent 6 review.

This artifact is non-mutating. It did not stage, track, commit, merge, publish, render, edit source files, edit control state, or accept source/provenance custody.

## Summary

- Track-candidate untracked source files: ${plan.summary.track_candidate_source_files}
- Modified tracked license-normalization source files: ${plan.summary.modified_tracked_source_files}
- Total source-file reconciliation candidates: ${plan.summary.total_source_file_reconciliation_candidates}
- Missing manifest source files: ${plan.summary.missing_manifest_source_files}
- Blocked downstream direct artifact paths: ${plan.summary.blocked_downstream_direct_paths}
- Blocked downstream content-reference paths: ${plan.summary.blocked_downstream_content_reference_paths}
- Publication state: \`${plan.boundary.publication_state}\`
- Completion claimed: \`${plan.boundary.completion_claimed ?? false}\`

## Current Git Preconditions

- All 23 tracking candidates are currently \`??\` untracked source files.
- All 6 license-normalization candidates are currently \` M\` modified tracked source files.
- Live source-file action was not performed.

## Proposed Agent 6 Decisions

- Tracking decision needed: Agent 6 decides whether the 23 untracked source files may be tracked or must be excluded/quarantined.
- License-normalization decision needed: Agent 6 decides whether the six tracked source-file license-label diffs may be accepted.
- Downstream decision needed: downstream direct artifacts and content-reference rows remain blocked until source/provenance custody is accepted or explicitly narrowed.

## Non-Executed Command Evidence

These commands are display-only evidence for review after Agent 6 disposition. They were not run.

\`\`\`powershell
${plan.proposed_actions.track_23_untracked_sources.display_only_git_add_command}
${plan.proposed_actions.accept_6_license_label_normalizations.display_only_git_add_command}
\`\`\`

## Track-Candidate Source Files

${plan.proposed_actions.track_23_untracked_sources.paths.map((item) => `- \`${item.path}\` (${item.git_status})`).join('\n')}

## Modified Tracked Source Files

${plan.proposed_actions.accept_6_license_label_normalizations.paths.map((item) => `- \`${item.path}\` (${item.git_status}; ${item.scalar_diff_count} scalar diffs; ${item.drift_summary})`).join('\n')}

## Follow-Up Validation Required After Any Authorized Action

${plan.follow_up_validation_required.map((item) => `- ${item}`).join('\n')}

## Must Not Accept

${plan.must_not_accept.map((item) => `- ${item}`).join('\n')}

## Agent 8 Callback

- status: source-file reconciliation action plan prepared; evidence only
- artifact: \`${PATHS.outputMd}\`
- machine artifact: \`${PATHS.outputJson}\`
- blockers: ${plan.current_blocking_conditions.join('; ')}
- next action needed: Agent 6 disposition on tracking/exclusion and license-normalization review; Agent 5/Agent 8 relay remains needed for queue/control visibility
- continue condition: continue Agent 1 source/provenance evidence maintenance without staging, commit, queue mutation, render, publication, runtime validation, or custody acceptance
`;
}

function main() {
  const tracking = readJson(PATHS.trackingPacket);
  const license = readJson(PATHS.licensePacket);
  const blocklist = readJson(PATHS.custodyBlocklist);
  const completionAudit = readJson(PATHS.completionAudit);
  const gitStatus = runGitStatus();

  const trackRows = tracking.track_candidate_sources.map((row) => ({
    path: row.source_path,
    work_id: row.work_id,
    units: row.units,
    license_counts: row.license_counts,
    lexical_manifest_path: row.lexical_manifest_path,
    git_status: gitStatus.get(row.source_path) || '',
    source_sha256: row.source_fingerprint?.sha256,
    direct_downstream_artifact_path_count: row.direct_downstream_artifact_paths.length,
    content_reference_unique_path_count: row.content_reference_unique_path_count,
    proposed_disposition: row.proposed_disposition,
    action_performed: false
  }));

  const modifiedRows = license.modified_tracked_sources.map((row) => ({
    path: row.source_path,
    work_id: row.work_id,
    units_current: row.units_current,
    units_head: row.units_head,
    git_status: gitStatus.get(row.source_path) || '',
    scalar_diff_count: row.scalar_diff_count,
    all_diffs_are_license_pd_to_public_domain: row.all_diffs_are_license_pd_to_public_domain,
    source_sha256: row.source_fingerprint?.sha256,
    direct_downstream_artifact_path_count: row.direct_downstream_artifact_paths.length,
    content_reference_unique_path_count: row.content_reference_unique_path_count,
    drift_summary: row.drift_summary,
    proposed_disposition: row.proposed_disposition,
    action_performed: false
  }));

  assert(trackRows.length === 23, 'expected 23 track candidates');
  assert(modifiedRows.length === 6, 'expected 6 modified tracked candidates');
  assert(trackRows.every((row) => row.git_status === '??'), 'all track candidates must remain untracked');
  assert(modifiedRows.every((row) => row.git_status === ' M'), 'all license-normalization candidates must remain modified tracked files');
  assert(tracking.summary.missing_manifest_source_files === 0, 'tracking packet must have zero missing manifest source files');
  assert(license.summary.total_non_license_diff_count === 0, 'license packet must have zero non-license diffs');
  assert(license.summary.total_non_pd_to_public_domain_diff_count === 0, 'license packet must have zero non-PD-to-Public-Domain diffs');

  const plan = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_source_file_reconciliation_action_plan',
    highest_permissible_claim: 'source-file reconciliation action evidence prepared for Agent 6 review',
    source_artifacts: {
      tracking_packet: PATHS.trackingPacket,
      tracking_packet_generated_at: tracking.generated_at,
      license_normalization_packet: PATHS.licensePacket,
      license_normalization_packet_generated_at: license.generated_at,
      custody_blocklist: PATHS.custodyBlocklist,
      custody_blocklist_generated_at: blocklist.generated_at,
      refresh_result: PATHS.refreshResult,
      completion_audit: PATHS.completionAudit,
      completion_audit_generated_at: completionAudit.generated_at
    },
    summary: {
      track_candidate_source_files: trackRows.length,
      modified_tracked_source_files: modifiedRows.length,
      total_source_file_reconciliation_candidates: trackRows.length + modifiedRows.length,
      missing_manifest_source_files: tracking.summary.missing_manifest_source_files,
      track_candidate_total_units: tracking.summary.total_units,
      modified_tracked_total_scalar_diffs: license.summary.total_scalar_diff_count,
      modified_tracked_non_license_diffs: license.summary.total_non_license_diff_count,
      modified_tracked_non_pd_to_public_domain_diffs: license.summary.total_non_pd_to_public_domain_diff_count,
      blocked_downstream_direct_paths: blocklist.summary.blocked_direct_artifact_paths,
      blocked_downstream_content_reference_paths: blocklist.summary.blocked_content_reference_paths
    },
    proposed_actions: {
      track_23_untracked_sources: {
        action: 'track_or_exclude_after_agent6_disposition_only',
        owner_decision_needed: 'Agent 6 source-file tracking or exclusion disposition',
        action_performed: false,
        precondition: 'all listed paths remain git status ??',
        display_only_git_add_command: `git add -- ${trackRows.map((row) => shellQuoteForDisplay(row.path)).join(' ')}`,
        paths: trackRows
      },
      accept_6_license_label_normalizations: {
        action: 'accept_or_reject_license_label_normalization_after_agent6_disposition_only',
        owner_decision_needed: 'Agent 6 license-normalization disposition',
        action_performed: false,
        precondition: 'all listed paths remain git status space-M and parsed diffs are PD to Public Domain license labels only',
        display_only_git_add_command: `git add -- ${modifiedRows.map((row) => shellQuoteForDisplay(row.path)).join(' ')}`,
        paths: modifiedRows
      },
      downstream_reliance: {
        action: 'keep_blocked_until_source_provenance_disposition',
        action_performed: false,
        blocked_direct_artifact_paths: blocklist.summary.blocked_direct_artifact_paths,
        blocked_content_reference_paths: blocklist.summary.blocked_content_reference_paths
      }
    },
    current_blocking_conditions: completionAudit.current_blocking_conditions,
    follow_up_validation_required: [
      'Re-run node scripts/refresh_agent1_source_custody_evidence.mjs after any authorized source-file action.',
      'Re-run node scripts/validate_agent1_source_custody_refresh_result.mjs after the refresh.',
      'Re-run node scripts/validate_agent1_source_custody_completion_audit.mjs before claiming objective progress.',
      'Do not treat a clean action plan as source/provenance custody, source-file tracking approval, or publication readiness.'
    ],
    boundary: {
      ...boundary(),
      completion_claimed: false
    },
    must_not_accept: MUST_NOT_ACCEPT
  };

  writeJson(PATHS.outputJson, plan);
  writeText(PATHS.outputMd, renderMarkdown(plan));
  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    track_candidate_source_files: plan.summary.track_candidate_source_files,
    modified_tracked_source_files: plan.summary.modified_tracked_source_files,
    action_performed: false,
    publication_state: plan.boundary.publication_state
  }, null, 2));
}

main();

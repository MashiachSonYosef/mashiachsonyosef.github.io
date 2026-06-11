#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  actionPlan: 'reports/agent1-source-file-reconciliation-action-plan-2026-06-03.json',
  actionPlanValidator: 'reports/agent1-source-file-reconciliation-action-plan-validator-result-2026-06-03.json',
  currentBlockerPacket: 'reports/agent1-source-custody-current-blocker-packet-2026-06-03.json',
  currentBlockerPacketMd: 'reports/agent1-source-custody-current-blocker-packet-2026-06-03.md',
  currentBlockerPacketValidator: 'reports/agent1-source-custody-current-blocker-packet-validator-result-2026-06-03.json',
  directRelayPrompt: 'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.json',
  directRelayPromptMd: 'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.md',
  directRelayPromptValidator: 'reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.json',
  refreshResult: 'reports/agent1-source-custody-refresh-result.json',
  outputJson: 'reports/agent1-source-file-reconciliation-owner-checklist-2026-06-03.json',
  outputMd: 'reports/agent1-source-file-reconciliation-owner-checklist-2026-06-03.md'
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

function formatList(values) {
  return values.map((value) => `- ${value}`).join('\n');
}

function formatPathRows(rows) {
  return rows.map((row) => {
    const fields = [
      `path: \`${row.path}\``,
      `work_id: \`${row.work_id}\``,
      `git: \`${row.git_status}\``,
      `direct paths: ${row.direct_downstream_artifact_path_count}`,
      `content refs: ${row.content_reference_unique_path_count}`,
      `sha256: \`${row.source_sha256}\``
    ];
    if (typeof row.units === 'number') {
      fields.splice(3, 0, `units: ${row.units}`);
    }
    if (typeof row.scalar_diff_count === 'number') {
      fields.splice(3, 0, `scalar diffs: ${row.scalar_diff_count}`);
      fields.splice(4, 0, `license-only: ${row.all_diffs_are_license_pd_to_public_domain}`);
    }
    return `- ${fields.join('; ')}`;
  }).join('\n');
}

function boundary() {
  return {
    agent1_status: 'owner checklist evidence only / awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition',
    publication_state: 'blocked_no_render',
    checklist_only: true,
    action_performed: false,
    queue_mutation_performed: false,
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
    accepted_translation_text_claimed: false,
    completion_claimed: false
  };
}

function renderMarkdown(checklist) {
  const tracking = checklist.owner_checklist.agent6_tracking_or_exclusion;
  const license = checklist.owner_checklist.agent6_license_normalization;
  const relay = checklist.owner_checklist.agent5_or_agent8_relay;
  return `# Agent 1 Source File Reconciliation Owner Checklist

Generated: ${checklist.generated_at}

Highest permissible claim: source-file reconciliation owner checklist evidence prepared.

This checklist is non-mutating evidence. It does not stage, track, commit, merge, edit source files, mutate queue/control state, render, publish, or accept source/provenance custody.

## Summary

- Refresh completed: \`${checklist.refresh_completed_at}\`
- Publication state: \`${checklist.boundary.publication_state}\`
- Track-candidate source files: ${tracking.source_file_count}
- Modified tracked license-normalization files: ${license.source_file_count}
- Agent 6-ready request IDs: ${relay.request_ids.length}
- Direct relay prompt status: \`${relay.status}\`
- Queue mutation performed: ${checklist.boundary.queue_mutation_performed}
- Action performed: ${checklist.boundary.action_performed}

## Gate 1: Agent 5/8 Relay

- Owner: ${relay.owner}
- Status: \`${relay.status}\`
- Action needed: ${relay.action_needed}
- Direct relay prompt: \`${relay.direct_relay_prompt_md}\`
- Request IDs:
${formatList(relay.request_ids.map((id) => `\`${id}\``))}

## Gate 2: Agent 6 Tracking Or Exclusion

- Owner: ${tracking.owner}
- Request ID: \`${tracking.request_id}\`
- Action needed: ${tracking.action_needed}
- Source file count: ${tracking.source_file_count}
- Display-only command was not run: ${tracking.display_only_command_was_not_run}

${formatPathRows(tracking.paths)}

## Gate 3: Agent 6 License Normalization

- Owner: ${license.owner}
- Request ID: \`${license.request_id}\`
- Action needed: ${license.action_needed}
- Source file count: ${license.source_file_count}
- Display-only command was not run: ${license.display_only_command_was_not_run}

${formatPathRows(license.paths)}

## Downstream Reliance Still Blocked

- Blocked direct artifact paths: ${checklist.downstream_reliance.blocked_direct_artifact_paths}
- Blocked content-reference paths: ${checklist.downstream_reliance.blocked_content_reference_paths}
- Rule: ${checklist.downstream_reliance.rule}

## Current Blockers

${formatList(checklist.current_blockers)}

## Evidence Artifacts

${formatList(checklist.evidence_artifacts.map((artifact) => `\`${artifact}\``))}

## Must Not Accept

${formatList(checklist.must_not_accept)}

## Agent 8 Callback

- status: source-file reconciliation owner checklist prepared; awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition only
- artifact: \`${PATHS.outputMd}\`
- machine artifact: \`${PATHS.outputJson}\`
- blockers: ${checklist.current_blockers.join('; ')}
- next action needed: Agent 5/Agent 8 relay using \`${PATHS.directRelayPromptMd}\`, then Agent 6 tracking/exclusion and license-normalization disposition
- continue condition: continue Agent 1 source/provenance evidence maintenance without staging, commit, queue mutation, render, publication, runtime validation, or custody acceptance
`;
}

function main() {
  const actionPlan = readJson(PATHS.actionPlan);
  const actionPlanValidator = readJson(PATHS.actionPlanValidator);
  const blockerPacket = readJson(PATHS.currentBlockerPacket);
  const blockerValidator = readJson(PATHS.currentBlockerPacketValidator);
  const directRelayPrompt = readJson(PATHS.directRelayPrompt);
  const directRelayPromptValidator = readJson(PATHS.directRelayPromptValidator);
  const refreshResult = readJson(PATHS.refreshResult);

  const trackingAction = actionPlan.proposed_actions.track_23_untracked_sources;
  const licenseAction = actionPlan.proposed_actions.accept_6_license_label_normalizations;

  const checklist = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_source_file_reconciliation_owner_checklist',
    refresh_completed_at: refreshResult.completed_at,
    highest_permissible_claim: 'source-file reconciliation owner checklist evidence prepared',
    source_artifacts: {
      action_plan: PATHS.actionPlan,
      action_plan_validator: PATHS.actionPlanValidator,
      current_blocker_packet: PATHS.currentBlockerPacket,
      current_blocker_packet_validator: PATHS.currentBlockerPacketValidator,
      direct_relay_prompt: PATHS.directRelayPrompt,
      direct_relay_prompt_validator: PATHS.directRelayPromptValidator,
      refresh_result: PATHS.refreshResult
    },
    owner_checklist: {
      agent5_or_agent8_relay: {
        owner: 'Agent 5 or Agent 8',
        status: directRelayPrompt.status,
        action_needed: 'Relay the five Agent 1 Agent-5-shaped request IDs to Agent 6, or apply the validated add-only queue insertion patch under owner authority.',
        direct_relay_prompt_md: PATHS.directRelayPromptMd,
        request_ids: directRelayPrompt.request_ids,
        request_id_count: directRelayPromptValidator.request_id_count,
        queue_insertion_patch_operations: directRelayPromptValidator.queue_insertion_patch_operations,
        agent6_disposition_hits: directRelayPromptValidator.agent6_disposition_hits,
        relay_signal_hits: directRelayPromptValidator.relay_signal_hits,
        queue_mutation_performed: directRelayPromptValidator.boundary.queue_mutation_performed
      },
      agent6_tracking_or_exclusion: {
        owner: 'Agent 6',
        request_id: 'agent6-agent1-source-custody-tracking-action-review',
        action_needed: trackingAction.owner_decision_needed,
        source_file_count: trackingAction.paths.length,
        display_only_command_was_not_run: trackingAction.action_performed === false,
        paths: trackingAction.paths.map((row) => ({
          path: row.path,
          work_id: row.work_id,
          units: row.units,
          license_counts: row.license_counts,
          lexical_manifest_path: row.lexical_manifest_path,
          git_status: row.git_status,
          source_sha256: row.source_sha256,
          direct_downstream_artifact_path_count: row.direct_downstream_artifact_path_count,
          content_reference_unique_path_count: row.content_reference_unique_path_count,
          proposed_disposition: row.proposed_disposition,
          action_performed: row.action_performed
        }))
      },
      agent6_license_normalization: {
        owner: 'Agent 6',
        request_id: 'agent6-agent1-source-custody-license-normalization-review',
        action_needed: licenseAction.owner_decision_needed,
        source_file_count: licenseAction.paths.length,
        display_only_command_was_not_run: licenseAction.action_performed === false,
        paths: licenseAction.paths.map((row) => ({
          path: row.path,
          work_id: row.work_id,
          units_current: row.units_current,
          units_head: row.units_head,
          git_status: row.git_status,
          scalar_diff_count: row.scalar_diff_count,
          all_diffs_are_license_pd_to_public_domain: row.all_diffs_are_license_pd_to_public_domain,
          source_sha256: row.source_sha256,
          direct_downstream_artifact_path_count: row.direct_downstream_artifact_path_count,
          content_reference_unique_path_count: row.content_reference_unique_path_count,
          drift_summary: row.drift_summary,
          proposed_disposition: row.proposed_disposition,
          action_performed: row.action_performed
        }))
      }
    },
    downstream_reliance: {
      blocked_direct_artifact_paths: actionPlan.summary.blocked_downstream_direct_paths,
      blocked_content_reference_paths: actionPlan.summary.blocked_downstream_content_reference_paths,
      rule: actionPlan.proposed_actions.downstream_reliance.action
    },
    current_blockers: blockerPacket.exact_blockers.map((item) => item.blocker_id),
    current_counts: {
      track_candidate_source_files: actionPlan.summary.track_candidate_source_files,
      modified_tracked_source_files: actionPlan.summary.modified_tracked_source_files,
      total_source_file_reconciliation_candidates: actionPlan.summary.total_source_file_reconciliation_candidates,
      missing_manifest_source_files: actionPlan.summary.missing_manifest_source_files,
      blocked_downstream_direct_paths: actionPlan.summary.blocked_downstream_direct_paths,
      blocked_downstream_content_reference_paths: actionPlan.summary.blocked_downstream_content_reference_paths,
      current_blocker_exact_blocker_count: blockerValidator.exact_blocker_count,
      refresh_result_ok: refreshResult.ok,
      action_plan_validator_ok: actionPlanValidator.ok
    },
    evidence_artifacts: [
      PATHS.actionPlan,
      PATHS.actionPlanValidator,
      PATHS.currentBlockerPacket,
      PATHS.currentBlockerPacketMd,
      PATHS.currentBlockerPacketValidator,
      PATHS.directRelayPrompt,
      PATHS.directRelayPromptMd,
      PATHS.directRelayPromptValidator,
      PATHS.refreshResult
    ],
    boundary: boundary(),
    must_not_accept: MUST_NOT_ACCEPT
  };

  writeJson(PATHS.outputJson, checklist);
  writeText(PATHS.outputMd, renderMarkdown(checklist));
  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    refresh_completed_at: checklist.refresh_completed_at,
    track_candidate_source_files: checklist.owner_checklist.agent6_tracking_or_exclusion.source_file_count,
    modified_tracked_source_files: checklist.owner_checklist.agent6_license_normalization.source_file_count,
    request_id_count: checklist.owner_checklist.agent5_or_agent8_relay.request_id_count,
    action_performed: checklist.boundary.action_performed,
    queue_mutation_performed: checklist.boundary.queue_mutation_performed
  }, null, 2));
}

main();

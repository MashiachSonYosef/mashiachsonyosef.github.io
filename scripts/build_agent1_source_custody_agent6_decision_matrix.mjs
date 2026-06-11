#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  refreshResult: 'reports/agent1-source-custody-refresh-result.json',
  ownerChecklist: 'reports/agent1-source-file-reconciliation-owner-checklist-2026-06-03.json',
  ownerChecklistValidator: 'reports/agent1-source-file-reconciliation-owner-checklist-validator-result-2026-06-03.json',
  currentBlockerPacket: 'reports/agent1-source-custody-current-blocker-packet-2026-06-03.json',
  directRelayPrompt: 'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.json',
  directRelayPromptMd: 'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.md',
  directRelayPromptValidator: 'reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.json',
  agent6ReadyDocket: 'reports/agent1-source-provenance-agent6-ready-docket-2026-06-03.json',
  downstreamManifest: 'reports/agent1-downstream-quarantine-manifest.json',
  outputJson: 'reports/agent1-source-custody-agent6-decision-matrix-2026-06-03.json',
  outputMd: 'reports/agent1-source-custody-agent6-decision-matrix-2026-06-03.md'
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

function boundary() {
  return {
    agent1_status: 'Agent 6 decision matrix evidence only / awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition',
    publication_state: 'blocked_no_render',
    decision_matrix_only: true,
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

function formatList(values) {
  return values.map((value) => `- ${value}`).join('\n');
}

function formatRows(rows) {
  return rows.map((row) => {
    const fields = [
      `path: \`${row.path}\``,
      `work_id: \`${row.work_id}\``,
      `git: \`${row.git_status}\``
    ];
    if (typeof row.units === 'number') fields.push(`units: ${row.units}`);
    if (typeof row.units_current === 'number') fields.push(`units: ${row.units_current}`);
    if (typeof row.scalar_diff_count === 'number') fields.push(`scalar diffs: ${row.scalar_diff_count}`);
    fields.push(`direct paths: ${row.direct_downstream_artifact_path_count}`);
    fields.push(`content refs: ${row.content_reference_unique_path_count}`);
    fields.push(`sha256: \`${row.source_sha256}\``);
    return `- ${fields.join('; ')}`;
  }).join('\n');
}

function byRequestId(reviewItems) {
  return Object.fromEntries(reviewItems.map((item) => [item.request_id, item]));
}

function reviewGate(item, requiredDecision, evidenceQuestion, rowSummary = {}) {
  return {
    owner: 'Agent 6',
    request_id: item.request_id,
    lane: item.lane,
    gate: item.gate,
    status: item.status,
    requested_verdict: item.requested_verdict,
    required_decision: requiredDecision,
    evidence_question: evidenceQuestion,
    candidate_artifact: item.candidate_artifact,
    candidate_json: item.candidate_json,
    validator_result: item.validator_result,
    row_summary: rowSummary,
    action_performed: false,
    acceptance_claimed: false
  };
}

function renderMarkdown(matrix) {
  const tracking = matrix.agent6_decision_matrix.tracking_or_exclusion;
  const license = matrix.agent6_decision_matrix.license_normalization;
  return `# Agent 1 Source Custody Agent 6 Decision Matrix

Generated: ${matrix.generated_at}

Highest permissible claim: ${matrix.highest_permissible_claim}.

This is non-mutating evidence for Agent 5/8 relay and Agent 6 docketing. It does not stage, track, commit, merge, edit source files, mutate queue/control state, render, publish, or accept source/provenance custody.

## Summary

- Refresh completed: \`${matrix.refresh_completed_at}\`
- Publication state: \`${matrix.boundary.publication_state}\`
- Agent 6-ready request IDs: ${matrix.relay_gate.request_ids.length}
- Untracked tracking/exclusion rows: ${tracking.rows.length}
- Modified tracked license-normalization rows: ${license.rows.length}
- Blocked direct artifact paths: ${matrix.downstream_reliance.blocked_direct_artifact_paths}
- Blocked content-reference paths: ${matrix.downstream_reliance.blocked_content_reference_paths}
- Route/HUD content-reference rows: ${matrix.downstream_reliance.content_reference_rows_by_kind.route_cards_or_hud_surfaces}
- Reader/workbench content-reference rows: ${matrix.downstream_reliance.content_reference_rows_by_kind.reader_workbench_artifacts}
- Public lexical content-reference rows: ${matrix.downstream_reliance.content_reference_rows_by_kind.public_lexical_exports}
- Queue mutation performed: ${matrix.boundary.queue_mutation_performed}
- Action performed: ${matrix.boundary.action_performed}

## Relay Gate

- Owner: ${matrix.relay_gate.owner}
- Status: \`${matrix.relay_gate.status}\`
- Direct relay prompt: \`${matrix.relay_gate.direct_relay_prompt_md}\`
- Queue insertion patch operations: ${matrix.relay_gate.queue_insertion_patch_operations}
- Agent 6 disposition hits: ${matrix.relay_gate.agent6_disposition_hits}
- Agent 5/8 relay-signal hits: ${matrix.relay_gate.relay_signal_hits}
- Request IDs:
${formatList(matrix.relay_gate.request_ids.map((id) => `\`${id}\``))}

## Agent 6 Decision Gates

- \`${matrix.agent6_decision_matrix.manifest_remediation.request_id}\`: ${matrix.agent6_decision_matrix.manifest_remediation.required_decision}
- \`${tracking.request_id}\`: ${tracking.required_decision}
- \`${license.request_id}\`: ${license.required_decision}
- \`${matrix.agent6_decision_matrix.public_hud_source_rows.request_id}\`: ${matrix.agent6_decision_matrix.public_hud_source_rows.required_decision}
- \`${matrix.agent6_decision_matrix.orot_fill_source_rows.request_id}\`: ${matrix.agent6_decision_matrix.orot_fill_source_rows.required_decision}

## Tracking Or Exclusion Rows

${formatRows(tracking.rows)}

## License Normalization Rows

${formatRows(license.rows)}

## Current Blockers

${formatList(matrix.current_blockers)}

## Evidence Artifacts

${formatList(matrix.evidence_artifacts.map((artifact) => `\`${artifact}\``))}

## Must Not Accept

${formatList(matrix.must_not_accept)}

## Agent 8 Callback

- status: Agent 6 decision matrix prepared; awaiting-Agent-5-or-Agent-8 relay and Agent-6 disposition only
- artifact: \`${PATHS.outputMd}\`
- machine artifact: \`${PATHS.outputJson}\`
- blockers: ${matrix.current_blockers.join('; ')}
- next action needed: Agent 5/Agent 8 relay using \`${PATHS.directRelayPromptMd}\`, then Agent 6 pass/warn/block disposition for the five request IDs
- continue condition: continue Agent 1 source/provenance evidence maintenance without staging, commit, queue mutation, render, publication, runtime validation, or custody acceptance
`;
}

function main() {
  const refresh = readJson(PATHS.refreshResult);
  const checklist = readJson(PATHS.ownerChecklist);
  const checklistValidator = readJson(PATHS.ownerChecklistValidator);
  const blocker = readJson(PATHS.currentBlockerPacket);
  const relay = readJson(PATHS.directRelayPrompt);
  const relayValidator = readJson(PATHS.directRelayPromptValidator);
  const docket = readJson(PATHS.agent6ReadyDocket);
  const manifest = readJson(PATHS.downstreamManifest);
  const reviews = byRequestId(docket.review_items);
  const tracking = checklist.owner_checklist.agent6_tracking_or_exclusion;
  const license = checklist.owner_checklist.agent6_license_normalization;

  const matrix = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_source_custody_agent6_decision_matrix',
    refresh_completed_at: refresh.completed_at,
    highest_permissible_claim: 'source/provenance custody decision-matrix evidence prepared for Agent 6 review',
    source_artifacts: {
      refresh_result: PATHS.refreshResult,
      owner_checklist: PATHS.ownerChecklist,
      owner_checklist_validator: PATHS.ownerChecklistValidator,
      current_blocker_packet: PATHS.currentBlockerPacket,
      direct_relay_prompt: PATHS.directRelayPrompt,
      direct_relay_prompt_validator: PATHS.directRelayPromptValidator,
      agent6_ready_docket: PATHS.agent6ReadyDocket,
      downstream_quarantine_manifest: PATHS.downstreamManifest
    },
    current_source_scope: {
      source_rows: manifest.summary.source_rows,
      fingerprinted_source_rows: refresh.validator_summary.source_fingerprints.fingerprinted_source_rows,
      untracked_source_files: checklist.current_counts.track_candidate_source_files,
      modified_tracked_source_files: checklist.current_counts.modified_tracked_source_files,
      missing_lexical_manifest_source_files: checklist.current_counts.missing_manifest_source_files,
      exact_blockers: blocker.exact_blockers.length
    },
    downstream_reliance: {
      blocked_direct_artifact_paths: manifest.summary.direct_artifact_rows,
      blocked_content_reference_paths: manifest.summary.content_reference_rows,
      content_reference_rows_by_kind: manifest.summary.content_reference_rows_by_kind,
      rule: checklist.downstream_reliance.rule
    },
    relay_gate: {
      owner: checklist.owner_checklist.agent5_or_agent8_relay.owner,
      status: relay.status,
      direct_relay_prompt_md: PATHS.directRelayPromptMd,
      request_ids: checklist.owner_checklist.agent5_or_agent8_relay.request_ids,
      queue_insertion_patch_operations: relay.exact_relay_inputs.queue_insertion_patch_operation_count,
      queue_mutation_performed: false,
      agent6_disposition_hits: relayValidator.agent6_disposition_hits,
      relay_signal_hits: relayValidator.relay_signal_hits
    },
    agent6_decision_matrix: {
      manifest_remediation: reviewGate(
        reviews['agent6-agent1-source-custody-manifest-remediation-review'],
        'Issue a dated pass/warn/block verdict on Packet B manifest-remediation evidence only; source/provenance custody and downstream reliance stay blocked unless Agent 6 explicitly narrows them.',
        'Do the remediated missing lexical manifests satisfy Packet B evidence while preserving source/provenance custody boundaries?',
        {
          current_missing_manifest_source_files: 0,
          remediated_manifest_files: refresh.manifest_remediation_packet_summary.generated_manifest_files
        }
      ),
      tracking_or_exclusion: {
        ...reviewGate(
          reviews['agent6-agent1-source-custody-tracking-action-review'],
          'Issue a dated track/exclude/return disposition for the 23 untracked source files; Agent 1 does not approve tracking, staging, or custody.',
          'Should each untracked source file remain quarantined, be tracked under owner authority, or be excluded/returned for more evidence?',
          {
            source_file_count: tracking.source_file_count,
            direct_downstream_artifact_paths: tracking.paths.reduce((total, row) => total + row.direct_downstream_artifact_path_count, 0),
            content_reference_unique_paths: tracking.paths.reduce((total, row) => total + row.content_reference_unique_path_count, 0)
          }
        ),
        rows: tracking.paths
      },
      license_normalization: {
        ...reviewGate(
          reviews['agent6-agent1-source-custody-license-normalization-review'],
          'Issue a dated pass/warn/block verdict on six PD to Public Domain license-label normalization rows; Agent 1 does not accept or commit the drift.',
          'Do the six modified tracked source files remain license-label-only normalization, and should that drift be accepted, rejected, or returned for correction?',
          {
            source_file_count: license.source_file_count,
            direct_downstream_artifact_paths: license.paths.reduce((total, row) => total + row.direct_downstream_artifact_path_count, 0),
            content_reference_unique_paths: license.paths.reduce((total, row) => total + row.content_reference_unique_path_count, 0),
            all_diffs_are_license_pd_to_public_domain: license.paths.every((row) => row.all_diffs_are_license_pd_to_public_domain === true)
          }
        ),
        rows: license.paths
      },
      public_hud_source_rows: reviewGate(
        reviews['agent6-agent1-public-hud-source-row-review'],
        'Issue a dated pass/warn/block verdict on public-HUD source-row evidence only, without runtime/publication/source-custody acceptance.',
        'Are the public-HUD source/license rows sufficient as evidence for the candidate surfaces while preserving runtime and publication blockers?'
      ),
      orot_fill_source_rows: reviewGate(
        reviews['agent6-agent1-orot-fill-source-row-review'],
        'Issue a dated pass/warn/block verdict on Orot fill source-row evidence only, without downstream reliance or source-custody acceptance.',
        'Are the Orot fill source rows clean enough for evidence-only disposition while preserving source/provenance-sensitive boundaries?'
      )
    },
    current_blockers: checklist.current_blockers,
    evidence_artifacts: [
      PATHS.refreshResult,
      PATHS.ownerChecklist,
      PATHS.ownerChecklistValidator,
      PATHS.currentBlockerPacket,
      PATHS.directRelayPrompt,
      PATHS.directRelayPromptValidator,
      PATHS.agent6ReadyDocket,
      PATHS.downstreamManifest
    ],
    must_not_accept: MUST_NOT_ACCEPT,
    boundary: boundary()
  };

  writeJson(PATHS.outputJson, matrix);
  writeText(PATHS.outputMd, renderMarkdown(matrix));

  console.log(JSON.stringify({
    ok: true,
    artifact: PATHS.outputJson,
    markdown: PATHS.outputMd,
    refresh_completed_at: matrix.refresh_completed_at,
    request_id_count: matrix.relay_gate.request_ids.length,
    tracking_rows: matrix.agent6_decision_matrix.tracking_or_exclusion.rows.length,
    license_rows: matrix.agent6_decision_matrix.license_normalization.rows.length,
    blocked_direct_artifact_paths: matrix.downstream_reliance.blocked_direct_artifact_paths,
    blocked_content_reference_paths: matrix.downstream_reliance.blocked_content_reference_paths,
    action_performed: matrix.boundary.action_performed,
    queue_mutation_performed: matrix.boundary.queue_mutation_performed
  }, null, 2));
}

main();

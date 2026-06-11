#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  refreshResult: 'reports/agent1-source-custody-refresh-result.json',
  custodyValidator: 'reports/agent1-source-provenance-custody-validator-result.json',
  agent6ReadyDocket: 'reports/agent1-source-provenance-agent6-ready-docket-2026-06-03.json',
  agent6ReadyDocketValidator: 'reports/agent1-source-provenance-agent6-ready-docket-validator-result-2026-06-03.json',
  relayPacket: 'reports/agent1-agent5-agent6-docket-relay-packet-2026-06-03.json',
  relayValidator: 'reports/agent1-agent5-agent6-docket-relay-validator-result-2026-06-03.json',
  dryRunValidator: 'reports/agent1-agent6-validation-queue-dry-run-validator-result-2026-06-03.json',
  patchValidator: 'reports/agent1-agent5-agent6-queue-insertion-patch-validator-result-2026-06-03.json',
  directRelayPrompt: 'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.json',
  directRelayPromptMd: 'reports/agent1-agent5-agent8-direct-relay-prompt-2026-06-03.md',
  directRelayPromptValidator: 'reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.json',
  directRelayPromptValidatorMd: 'reports/agent1-agent5-agent8-direct-relay-prompt-validator-result-2026-06-03.md',
  dispositionWatch: 'reports/agent1-agent6-disposition-watch-2026-06-03.json',
  dispositionWatchValidator: 'reports/agent1-agent6-disposition-watch-validator-result-2026-06-03.json',
  outputJson: 'reports/agent1-source-custody-objective-completion-audit-2026-06-03.json',
  outputMd: 'reports/agent1-source-custody-objective-completion-audit-2026-06-03.md'
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
  'future publication support',
  'route publication support',
  'Definition authority',
  'usage-as-definition authority',
  'product/data acceptance',
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

function requirement(id, label, state, evidence, remaining = []) {
  return {
    id,
    label,
    state,
    evidence,
    remaining
  };
}

function boundary() {
  return {
    publication_state: 'blocked_no_render',
    completion_claimed: false,
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

function renderMarkdown(audit) {
  return `# Agent 1 Source Custody Objective Completion Audit

Generated: ${audit.generated_at}

Overall status: \`${audit.overall_status}\`

Highest permissible claim: source/provenance custody evidence and Agent 6-ready packet evidence are prepared; completion is not claimed.

Publication remains \`blocked_no_render\`. This audit does not accept source/provenance custody, source publication, source-file tracking, QA, public/runtime, route-publication, Definition, product/data, usage-as-definition, translation output, or accepted translation text.

## Current Evidence Snapshot

- Refresh result: \`${audit.current_evidence.refresh_result}\`
- Refresh completed: \`${audit.current_evidence.refresh_completed_at}\`
- Direct/audit untracked sources: ${audit.current_evidence.direct_untracked_sources}/${audit.current_evidence.audit_untracked_sources}
- Modified tracked source files: ${audit.current_evidence.live_modified_tracked_sources}
- Source rows/fingerprinted rows: ${audit.current_evidence.source_rows}/${audit.current_evidence.source_fingerprinted_rows}
- Blocked direct artifact paths: ${audit.current_evidence.blocked_downstream_direct_paths}
- Blocked content-reference paths: ${audit.current_evidence.blocked_downstream_content_reference_paths}
- Agent 6-ready review items: ${audit.current_evidence.agent6_ready_review_items.length}
- Live queue item count: ${audit.current_evidence.live_queue_item_count}
- Dry-run queue item count: ${audit.current_evidence.dry_run_queue_item_count}
- Live queue mutation performed: ${audit.current_evidence.live_queue_mutation_performed}
- Direct Agent 5/8 relay prompt: \`${audit.current_evidence.direct_relay_prompt}\`
- Direct relay prompt status: \`${audit.current_evidence.direct_relay_prompt_status}\`
- Direct relay prompt request IDs / queue patch operations: ${audit.current_evidence.direct_relay_prompt_request_ids}/${audit.current_evidence.direct_relay_prompt_patch_operations}
- Direct relay prompt Agent 6 disposition hits / relay signal hits: ${audit.current_evidence.direct_relay_prompt_agent6_disposition_hits}/${audit.current_evidence.direct_relay_prompt_relay_signal_hits}
- Direct relay prompt queue mutation performed: ${audit.current_evidence.direct_relay_prompt_queue_mutation_performed}

## Requirement Audit

${audit.requirements.map((item) => `### ${item.id}: ${item.label}

- State: \`${item.state}\`
- Evidence: ${item.evidence.map((evidence) => `\`${evidence}\``).join(', ')}
- Remaining: ${item.remaining.length ? item.remaining.join('; ') : 'none for evidence-prepared state'}
`).join('\n')}

## Current Blocking Conditions

${formatList(audit.current_blocking_conditions)}

## Next Owner Actions

${formatList(audit.next_owner_actions.map((item) => `${item.owner}: ${item.action}`))}

## Must Not Accept

${formatList(audit.must_not_accept)}

## Agent 8 Callback

- status: objective completion audit produced; evidence is current but objective is not complete
- artifact: \`${PATHS.outputMd}\`
- machine artifact: \`${PATHS.outputJson}\`
- blockers: ${audit.current_blocking_conditions.join('; ')}
- next action needed: Agent 5/Agent 8 relay using \`${PATHS.directRelayPromptMd}\` or Agent 6 disposition is needed before custody completion can be claimed
- continue condition: continue Agent 1 source/provenance evidence maintenance without render, staging, commit, publication, runtime validation, or custody acceptance
`;
}

function main() {
  const refresh = readJson(PATHS.refreshResult);
  const custodyValidator = readJson(PATHS.custodyValidator);
  const docket = readJson(PATHS.agent6ReadyDocket);
  const docketValidator = readJson(PATHS.agent6ReadyDocketValidator);
  const relayValidator = readJson(PATHS.relayValidator);
  const dryRunValidator = readJson(PATHS.dryRunValidator);
  const patchValidator = readJson(PATHS.patchValidator);
  const directRelayPromptValidator = readJson(PATHS.directRelayPromptValidator);
  const dispositionValidator = readJson(PATHS.dispositionWatchValidator);

  const currentEvidence = {
    refresh_result: PATHS.refreshResult,
    refresh_completed_at: refresh.completed_at,
    custody_validator: PATHS.custodyValidator,
    direct_untracked_sources: refresh.direct_untracked_sources,
    audit_untracked_sources: refresh.audit_untracked_sources,
    live_untracked_sources: custodyValidator.live_untracked_sources,
    live_modified_tracked_sources: custodyValidator.live_modified_tracked_sources,
    source_rows: custodyValidator.source_fingerprints.source_rows,
    source_fingerprinted_rows: custodyValidator.source_fingerprints.fingerprinted_source_rows,
    blocked_downstream_direct_paths: refresh.blocklist_summary.blocked_direct_artifact_paths,
    blocked_downstream_content_reference_paths: refresh.blocklist_summary.blocked_content_reference_paths,
    route_or_hud_content_reference_rows: refresh.control_sync_packet_summary.current.route_or_hud_content_reference_rows,
    reader_workbench_content_reference_rows: refresh.control_sync_packet_summary.current.reader_workbench_content_reference_rows,
    public_lexical_content_reference_rows: refresh.control_sync_packet_summary.current.public_lexical_content_reference_rows,
    agent6_ready_docket: PATHS.agent6ReadyDocket,
    agent6_ready_docket_validator: PATHS.agent6ReadyDocketValidator,
    agent6_ready_review_items: docket.review_items.map((item) => item.request_id),
    relay_status: relayValidator.status,
    missing_relay_request_ids: relayValidator.request_ids_missing_everywhere,
    agent6_disposition_watch_status: dispositionValidator.status,
    agent6_disposition_hits: dispositionValidator.agent6_disposition_hits,
    relay_signal_hits: dispositionValidator.relay_signal_hits,
    live_queue_item_count: dryRunValidator.live_queue_item_count,
    dry_run_queue_item_count: dryRunValidator.dry_run_queue_item_count,
    live_queue_mutation_performed: dryRunValidator.boundary.live_queue_mutation_performed,
    queue_patch_operation_count: patchValidator.operation_count,
    queue_patch_live_mutation_performed: patchValidator.boundary.live_queue_mutation_performed,
    direct_relay_prompt: PATHS.directRelayPrompt,
    direct_relay_prompt_md: PATHS.directRelayPromptMd,
    direct_relay_prompt_validator: PATHS.directRelayPromptValidator,
    direct_relay_prompt_validator_md: PATHS.directRelayPromptValidatorMd,
    direct_relay_prompt_status: directRelayPromptValidator.status,
    direct_relay_prompt_request_ids: directRelayPromptValidator.request_id_count,
    direct_relay_prompt_patch_operations: directRelayPromptValidator.queue_insertion_patch_operations,
    direct_relay_prompt_agent6_disposition_hits: directRelayPromptValidator.agent6_disposition_hits,
    direct_relay_prompt_relay_signal_hits: directRelayPromptValidator.relay_signal_hits,
    direct_relay_prompt_queue_mutation_performed: directRelayPromptValidator.boundary.queue_mutation_performed
  };

  const requirements = [
    requirement(
      'R1',
      'Keep live source-scope evidence current',
      'evidence_prepared_current_refresh_ok',
      [PATHS.refreshResult, PATHS.custodyValidator, 'reports/untracked-source-files-direct.txt', 'reports/untracked-source-scope-audit.json']
    ),
    requirement(
      'R2',
      'Reconcile quarantined untracked source files',
      'incomplete_pending_agent6_tracking_or_exclusion_disposition',
      [
        'reports/agent1-source-custody-tracking-action-packet.json',
        'reports/agent1-source-custody-tracking-action-queue-candidate.json',
        'reports/agent1-source-custody-tracking-action-queue-validator-result.json'
      ],
      [
        'Agent 6 has not accepted source/provenance custody or source-file tracking.',
        'Agent 1 has not staged, tracked, committed, or excluded the 23 untracked source files.'
      ]
    ),
    requirement(
      'R3',
      'Reconcile modified tracked source files',
      'incomplete_pending_agent6_license_normalization_disposition',
      [
        'reports/agent1-source-custody-license-normalization-action-packet.json',
        'reports/agent1-source-custody-license-normalization-queue-candidate.json',
        'reports/agent1-source-custody-license-normalization-queue-validator-result.json'
      ],
      [
        'Agent 6 has not accepted the six modified tracked source-file license-label normalization rows.',
        'Agent 1 has not committed or approved those source-file diffs.'
      ]
    ),
    requirement(
      'R4',
      'Document downstream reliance',
      'evidence_prepared_current_refresh_ok',
      [
        'reports/agent1-downstream-quarantine-manifest.json',
        'reports/agent1-custody-blocklist.json',
        'reports/agent1-source-custody-reference-diagnostics.json'
      ]
    ),
    requirement(
      'R5',
      'Produce Agent 6-ready custody packets',
      'evidence_prepared_awaiting_relay_and_agent6_disposition',
      [
        PATHS.agent6ReadyDocket,
        PATHS.agent6ReadyDocketValidator,
        PATHS.relayPacket,
        PATHS.relayValidator,
        PATHS.dryRunValidator,
        PATHS.patchValidator,
        PATHS.directRelayPrompt,
        PATHS.directRelayPromptMd,
        PATHS.directRelayPromptValidator,
        PATHS.directRelayPromptValidatorMd,
        PATHS.dispositionWatch,
        PATHS.dispositionWatchValidator
      ],
      [
        'Five current Agent 1 request IDs remain absent from Agent 6/Agent 5 control surfaces.',
        'The direct Agent 5/8 relay prompt is prepared but has not been relayed by Agent 5/8 or dispositioned by Agent 6.',
        'Agent 6 has not issued a disposition for those five current request IDs.'
      ]
    ),
    requirement(
      'R6',
      'Preserve non-acceptance boundary',
      'verified_current_boundary_false_flags',
      [
        PATHS.refreshResult,
        PATHS.agent6ReadyDocketValidator,
        PATHS.relayValidator,
        PATHS.dryRunValidator,
        PATHS.directRelayPromptValidator,
        PATHS.dispositionWatchValidator
      ]
    )
  ];

  const audit = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_source_custody_objective_completion_audit',
    objective: 'Agent 1 source/provenance custody: keep live source-scope evidence current, reconcile quarantined untracked and modified tracked source files, document downstream reliance, and produce Agent 6-ready custody packets without claiming source/provenance or publication acceptance.',
    overall_status: 'not_complete_evidence_current_awaiting_agent5_or_agent8_relay_and_agent6_disposition',
    highest_permissible_claim: 'source/provenance custody evidence and Agent 6-ready packet evidence prepared',
    current_evidence: currentEvidence,
    requirements,
    current_blocking_conditions: [
      'source/provenance custody remains unaccepted',
      '23 untracked source files remain untracked/quarantined pending Agent 6 tracking or exclusion disposition',
      '6 modified tracked source files remain unaccepted pending Agent 6 license-normalization disposition',
      'five current Agent 1 request IDs are absent from Agent 6/Agent 5 control surfaces',
      'Agent 6 disposition watch reports zero Agent 6 disposition hits and zero relay-signal hits',
      'publication remains blocked_no_render'
    ],
    next_owner_actions: [
      {
        owner: 'Agent 5 or Agent 8',
        action: 'Relay the five Agent 1 Agent-5-shaped request IDs to Agent 6 using the direct relay prompt or apply the validated queue-insertion patch under owner authority.'
      },
      {
        owner: 'Agent 6',
        action: 'Issue pass/warn/block dispositions for manifest remediation, tracking action, license normalization, public-HUD source rows, and Orot fill source rows.'
      },
      {
        owner: 'Agent 1',
        action: 'Keep source-scope evidence refreshed and do not stage, commit, render, publish, or claim source/provenance acceptance.'
      }
    ],
    evidence_artifacts: [
      PATHS.refreshResult,
      PATHS.custodyValidator,
      PATHS.agent6ReadyDocket,
      PATHS.agent6ReadyDocketValidator,
      PATHS.relayPacket,
      PATHS.relayValidator,
      PATHS.dryRunValidator,
      PATHS.patchValidator,
      PATHS.directRelayPrompt,
      PATHS.directRelayPromptMd,
      PATHS.directRelayPromptValidator,
      PATHS.directRelayPromptValidatorMd,
      PATHS.dispositionWatch,
      PATHS.dispositionWatchValidator,
      'reports/agent1-downstream-quarantine-manifest.json',
      'reports/agent1-custody-blocklist.json',
      'reports/agent1-source-custody-reference-diagnostics.json'
    ],
    boundary: boundary(),
    must_not_accept: MUST_NOT_ACCEPT
  };

  writeJson(PATHS.outputJson, audit);
  writeText(PATHS.outputMd, renderMarkdown(audit));
  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    overall_status: audit.overall_status,
    requirement_states: audit.requirements.map((item) => ({ id: item.id, state: item.state })),
    current_blocking_conditions: audit.current_blocking_conditions
  }, null, 2));
}

main();

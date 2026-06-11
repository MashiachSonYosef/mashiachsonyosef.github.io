import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  custodyValidator: 'reports/agent1-source-provenance-custody-validator-result.json',
  agent1State: 'reports/agent1-state.md',
  sourceFileReconciliationActionPlan: 'reports/agent1-source-file-reconciliation-action-plan-2026-06-03.md',
  sourceFileReconciliationActionPlanJson: 'reports/agent1-source-file-reconciliation-action-plan-2026-06-03.json',
  sourceFileReconciliationActionPlanValidator: 'reports/agent1-source-file-reconciliation-action-plan-validator-result-2026-06-03.json',
  outputJson: 'reports/agent1-source-provenance-agent6-ready-docket-2026-06-03.json',
  outputMd: 'reports/agent1-source-provenance-agent6-ready-docket-2026-06-03.md'
};

const REVIEW_ITEMS = [
  {
    lane: 'manifest_remediation',
    candidate: 'reports/agent1-source-custody-manifest-remediation-queue-candidate.json',
    candidate_md: 'reports/agent1-source-custody-manifest-remediation-queue-candidate.md',
    validator: 'reports/agent1-source-custody-manifest-remediation-queue-validator-result.json',
    request_id: 'agent6-agent1-source-custody-manifest-remediation-review',
    requested_verdict: 'pass_warn_block_packet_b_manifest_remediation_evidence_only',
    summary_key: 'remediation',
    review_order: 1,
    reason: 'Packet B missing-manifest blocker was remediated to zero current missing lexical manifests, but source/provenance and downstream blocking remain pending Agent 6 disposition.'
  },
  {
    lane: 'tracking_action',
    candidate: 'reports/agent1-source-custody-tracking-action-queue-candidate.json',
    candidate_md: 'reports/agent1-source-custody-tracking-action-queue-candidate.md',
    validator: 'reports/agent1-source-custody-tracking-action-queue-validator-result.json',
    request_id: 'agent6-agent1-source-custody-tracking-action-review',
    requested_verdict: 'pass_warn_block_23_source_tracking_review_action_packet_only',
    summary_key: 'tracking',
    review_order: 2,
    reason: 'The 23 live untracked source files are mechanically described as tracking-review candidates after manifest remediation, but Agent 1 does not approve tracking, staging, or source custody.'
  },
  {
    lane: 'license_normalization',
    candidate: 'reports/agent1-source-custody-license-normalization-queue-candidate.json',
    candidate_md: 'reports/agent1-source-custody-license-normalization-queue-candidate.md',
    validator: 'reports/agent1-source-custody-license-normalization-queue-validator-result.json',
    request_id: 'agent6-agent1-source-custody-license-normalization-review',
    requested_verdict: 'pass_warn_block_license_label_normalization_action_packet_only',
    summary_key: 'license_normalization',
    review_order: 3,
    reason: 'The six modified tracked source files have parsed JSON drift limited to unit license labels from PD to Public Domain, but Agent 1 does not accept the drift or approve any commit.'
  },
  {
    lane: 'public_hud_source_rows',
    candidate: 'reports/agent1-wartime-public-hud-source-row-queue-candidate-2026-06-03.json',
    candidate_md: 'reports/agent1-wartime-public-hud-source-row-queue-candidate-2026-06-03.md',
    validator: 'reports/agent1-wartime-public-hud-source-row-queue-validator-result-2026-06-03.json',
    request_id: 'agent6-agent1-public-hud-source-row-review',
    requested_verdict: 'pass_warn_block_public_hud_source_row_evidence_only',
    summary_key: 'public_hud_source_rows',
    review_order: 4,
    reason: 'The public-reader slice now has bounded public-HUD source/license row evidence, but source rows remain evidence only until Agent 6 dockets them.'
  },
  {
    lane: 'orot_fill_source_rows',
    candidate: 'reports/agent1-orot-fill-source-row-queue-candidate-2026-06-03.json',
    candidate_md: 'reports/agent1-orot-fill-source-row-queue-candidate-2026-06-03.md',
    validator: 'reports/agent1-orot-fill-source-row-queue-validator-result-2026-06-03.json',
    request_id: 'agent6-agent1-orot-fill-source-row-review',
    requested_verdict: 'pass_warn_block_orot_fill_source_row_evidence_only',
    summary_key: 'orot_fill_source_rows',
    review_order: 5,
    reason: 'The Orot fill source-row evidence remains source/provenance-sensitive and requires Agent 6 disposition before any downstream reliance, route release, runtime/publication claim, or source-custody claim.'
  }
];

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

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), value, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function extractSummary(candidate, summaryKey) {
  if (summaryKey === 'public_hud_source_rows') return candidate.current_evidence_summary;
  if (summaryKey === 'orot_fill_source_rows') return candidate.current_evidence_summary;
  return candidate.current_packet_summary?.[summaryKey];
}

function formatList(values) {
  return values.map((value) => `- ${value}`).join('\n');
}

function formatSummary(summary) {
  return Object.entries(summary)
    .map(([key, value]) => `  - ${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join('\n');
}

function main() {
  const custodyValidator = readJson(PATHS.custodyValidator);
  assert(custodyValidator.ok === true, 'custody validator must pass');

  const reviewItems = REVIEW_ITEMS.map((config) => {
    const candidate = readJson(config.candidate);
    const validator = readJson(config.validator);
    assert(validator.ok === true, `${config.lane} validator must pass`);
    assert(candidate.requested_queue_item?.request_id === config.request_id, `${config.lane} request id mismatch`);
    assert(candidate.requested_queue_item?.requested_verdict === config.requested_verdict, `${config.lane} requested verdict mismatch`);
    assert(candidate.requested_queue_item?.status === 'candidate_for_agent5_queue_relay_awaiting_agent6_review', `${config.lane} status mismatch`);

    return {
      lane: config.lane,
      review_order: config.review_order,
      request_id: config.request_id,
      requested_verdict: config.requested_verdict,
      status: candidate.requested_queue_item.status,
      gate: candidate.requested_queue_item.gate,
      reason: config.lane === 'orot_fill_source_rows'
        ? `${config.reason} Current evidence status: ${candidate.current_evidence_summary?.incomplete_curated_rows_attached === 0 ? 'pipeline_source_rows_clear' : 'block_or_review_required'}.`
        : config.reason,
      candidate_artifact: config.candidate_md,
      candidate_json: config.candidate,
      validator_result: config.validator,
      validator_ok: validator.ok,
      summary: extractSummary(candidate, config.summary_key),
      evidence_artifacts: candidate.requested_queue_item.evidence_artifacts || [],
      known_risks: candidate.requested_queue_item.known_risks || [],
      next_agent6_action: candidate.requested_queue_item.next_agent6_action || null
    };
  });

  const docket = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_source_provenance_agent6_ready_docket',
    scope: 'Consolidated non-mutating Agent 6-ready docket for outstanding Agent 1 source/provenance decisions',
    status: 'evidence_ready_awaiting_agent6',
    review_items: reviewItems,
    current_source_scope: {
      validator: PATHS.custodyValidator,
      live_untracked_sources: custodyValidator.live_untracked_sources,
      live_modified_tracked_sources: custodyValidator.live_modified_tracked_sources,
      source_rows: custodyValidator.agent6_intake_docket.packet_claims.source_rows,
      source_fingerprinted_rows: custodyValidator.agent6_intake_docket.packet_claims.source_fingerprinted_rows,
      missing_lexical_manifest_gaps: custodyValidator.agent6_intake_docket.packet_claims.missing_lexical_manifest_gaps,
      blocked_downstream_direct_paths: custodyValidator.agent6_source_custody_decision_packet.summary.blocked_downstream_direct_paths,
      blocked_downstream_content_reference_paths: custodyValidator.agent6_source_custody_decision_packet.summary.blocked_downstream_content_reference_paths,
      route_or_hud_content_reference_rows: custodyValidator.custody_control_sync_packet.current.route_or_hud_content_reference_rows,
      reader_workbench_content_reference_rows: custodyValidator.custody_control_sync_packet.current.reader_workbench_content_reference_rows,
      public_lexical_content_reference_rows: custodyValidator.custody_control_sync_packet.current.public_lexical_content_reference_rows
    },
    recommended_review_sequence: reviewItems.map((item) => ({
      review_order: item.review_order,
      request_id: item.request_id,
      reason: item.reason
    })),
    boundary: {
      agent1_status: 'evidence-ready / awaiting-Agent-6',
      publication_state: 'blocked_no_render',
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
    },
    must_not_accept: MUST_NOT_ACCEPT,
    evidence_artifacts: [
      PATHS.custodyValidator,
      PATHS.agent1State,
      PATHS.sourceFileReconciliationActionPlan,
      PATHS.sourceFileReconciliationActionPlanJson,
      PATHS.sourceFileReconciliationActionPlanValidator,
      ...reviewItems.flatMap((item) => [item.candidate_artifact, item.candidate_json, item.validator_result])
    ]
  };

  writeJson(PATHS.outputJson, docket);
  writeText(PATHS.outputMd, `# Agent 1 Source/Provenance Agent 6-Ready Docket

Generated: ${docket.generated_at}

Highest permissible claim: source/provenance custody evidence is prepared for Agent 6 review.

This docket consolidates currently validated Agent 1 review candidates. It does not mutate any queue, stage files, commit, render, publish, run runtime validation, or claim source/provenance/publication acceptance.

Publication remains \`blocked_no_render\`.

## Current Source Scope

- Live untracked source files: ${docket.current_source_scope.live_untracked_sources}
- Live modified tracked source files: ${docket.current_source_scope.live_modified_tracked_sources}
- Source rows: ${docket.current_source_scope.source_rows}
- Fingerprinted source rows: ${docket.current_source_scope.source_fingerprinted_rows}
- Missing lexical manifest gaps: ${docket.current_source_scope.missing_lexical_manifest_gaps}
- Blocked downstream direct paths: ${docket.current_source_scope.blocked_downstream_direct_paths}
- Blocked downstream content-reference paths: ${docket.current_source_scope.blocked_downstream_content_reference_paths}
- Route/HUD content-reference rows: ${docket.current_source_scope.route_or_hud_content_reference_rows}
- Reader/workbench content-reference rows: ${docket.current_source_scope.reader_workbench_content_reference_rows}
- Public lexical content-reference rows: ${docket.current_source_scope.public_lexical_content_reference_rows}

## Agent 6 Review Items

${reviewItems.map((item) => `### ${item.review_order}. ${item.request_id}

- Lane: \`${item.lane}\`
- Status: \`${item.status}\`
- Gate: \`${item.gate}\`
- Requested verdict: \`${item.requested_verdict}\`
- Candidate artifact: \`${item.candidate_artifact}\`
- Candidate JSON: \`${item.candidate_json}\`
- Validator result: \`${item.validator_result}\`
- Reason: ${item.reason}

Summary:

${formatSummary(item.summary)}

Next Agent 6 action: ${item.next_agent6_action}
`).join('\n')}

## Recommended Review Sequence

${docket.recommended_review_sequence.map((item) => `- ${item.review_order}. \`${item.request_id}\`: ${item.reason}`).join('\n')}

## Evidence Artifacts

${formatList(docket.evidence_artifacts)}

## Must Not Accept

${formatList(MUST_NOT_ACCEPT)}

## Agent 8 Callback

- status: consolidated Agent 6-ready source/provenance docket produced; evidence-ready / awaiting-Agent-6 only
- artifact: \`${PATHS.outputMd}\`
- machine artifact: \`${PATHS.outputJson}\`
- blockers: Agent 6 has not disposed the manifest-remediation, tracking-action, license-normalization, public-HUD source-row, or Orot fill source-row review candidates; source/provenance custody and publication remain blocked
- next action needed: Agent 5/Agent 8 may relay the ${reviewItems.length} request IDs to Agent 6 without queue mutation from Agent 1
- continue condition: continue Agent 1 source/provenance evidence maintenance without render, staging, commit, publication, runtime validation, or custody acceptance
`);

  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    review_items: reviewItems.map((item) => item.request_id),
    current_source_scope: docket.current_source_scope
  }, null, 2));
}

main();

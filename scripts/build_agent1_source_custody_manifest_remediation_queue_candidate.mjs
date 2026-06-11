import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  remediationPacket: 'reports/agent1-source-custody-manifest-remediation-packet.json',
  remediationPacketMd: 'reports/agent1-source-custody-manifest-remediation-packet.md',
  remediationValidator: 'reports/agent1-source-custody-manifest-remediation-validator-result.json',
  custodyValidator: 'reports/agent1-source-provenance-custody-validator-result.json',
  decisionPacket: 'reports/agent1-agent6-source-custody-decision-packet.json',
  followupVerdict: 'reports/agent6-agent1-source-custody-followup-packets-verdict-2026-06-02.md',
  agent1State: 'reports/agent1-state.md',
  outputJson: 'reports/agent1-source-custody-manifest-remediation-queue-candidate.json',
  outputMd: 'reports/agent1-source-custody-manifest-remediation-queue-candidate.md'
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
  'route publication support',
  'Definition authority',
  'usage-as-definition authority',
  'product/data acceptance',
  'product/data gate acceptance',
  'publication readiness',
  'future publication support',
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

function assertBoundary(boundary) {
  assert(boundary?.publication_state === 'blocked_no_render', 'publication_state must remain blocked_no_render');
  for (const key of [
    'source_provenance_acceptance_claimed',
    'source_file_tracking_approval_claimed',
    'source_file_staging_claimed',
    'public_runtime_acceptance_claimed',
    'route_publication_support_claimed',
    'definition_authority_claimed',
    'page_render_acceptance_claimed'
  ]) {
    assert(boundary[key] === false, `boundary ${key} must be false`);
  }
}

function formatList(values) {
  return values.map((value) => `- ${value}`).join('\n');
}

function main() {
  const remediation = readJson(PATHS.remediationPacket);
  const remediationValidator = readJson(PATHS.remediationValidator);
  const custodyValidator = readJson(PATHS.custodyValidator);
  const decision = readJson(PATHS.decisionPacket);

  assert(remediation.artifact_type === 'agent1_source_custody_manifest_remediation_packet', 'unexpected remediation packet type');
  assert(remediationValidator.ok === true, 'remediation validator must be passing');
  assert(custodyValidator.ok === true, 'custody validator must be passing');
  assertBoundary(remediation.boundary);

  const summary = remediation.summary;
  assert(summary.remediated_source_files === 6, 'expected six remediated source files');
  assert(summary.generated_manifest_files === 6, 'expected six generated manifest files');
  assert(summary.current_missing_manifest_source_files === 0, 'expected zero missing manifest source files');
  assert(summary.current_track_candidate_source_files === 23, 'expected 23 current track candidates');

  const requestedQueueItem = {
    request_id: 'agent6-agent1-source-custody-manifest-remediation-review',
    submitted_by: 'Agent 5',
    agent1_evidence_origin: 'Agent 1 evidence packet for Agent 5 relay / Agent 6 review',
    gate: 'source_provenance_custody_gate',
    scope: 'Packet B manifest-remediation evidence after Agent 6 preserved the missing-manifest blocker',
    status: 'candidate_for_agent5_queue_relay_awaiting_agent6_review',
    priority: 0,
    evidence_artifacts: [
      PATHS.followupVerdict,
      PATHS.remediationPacketMd,
      PATHS.remediationPacket,
      PATHS.remediationValidator,
      PATHS.custodyValidator,
      PATHS.decisionPacket,
      PATHS.agent1State,
      'scripts/build_agent1_source_custody_manifest_remediation_packet.mjs',
      'scripts/validate_agent1_source_custody_manifest_remediation_packet.mjs',
      'scripts/build_agent1_source_custody_manifest_remediation_queue_candidate.mjs'
    ],
    requested_verdict: 'pass_warn_block_packet_b_manifest_remediation_evidence_only',
    claimed_boundary: 'Agent 1 generated and validated lexical manifests for the six Packet B sources only. This resolves the missing-manifest evidence gap but does not accept source/provenance custody, approve source-file tracking, stage, commit, render, publish, release downstream artifacts, or accept public/runtime state. Publication remains blocked_no_render.',
    known_risks: [
      'The six remediated sources are still untracked source files and remain source/provenance-blocked until Agent 6 dockets their custody disposition.',
      'The generated lexical manifests and chunks are downstream artifacts; their presence does not approve source tracking or downstream publication.',
      'Packet A tracking-review candidates and Packet C license-label normalization remain separate lanes and are not accepted by this remediation candidate.',
      'Agent 1 worker evidence and this queue candidate are not Agent 6 acceptance.'
    ],
    what_changed_since_last_agent6_ruling: `Agent 6 preserved Packet B as a blocker pending manifest remediation or exclusion. Agent 1 generated and validated the six missing lexical manifests without broad rendering. Current custody validation now reports ${summary.current_missing_manifest_source_files} missing lexical manifest source files, ${summary.current_track_candidate_source_files} track-candidate source files, ${summary.current_blocked_downstream_direct_paths} blocked downstream direct paths, and ${summary.current_blocked_content_reference_source_rows} blocked content-reference source rows.`,
    what_must_not_be_accepted: MUST_NOT_ACCEPT,
    next_agent6_action: 'Issue a dated pass/warn/block verdict on Packet B manifest-remediation evidence only, preserving source/provenance and downstream blocking unless Agent 6 explicitly narrows it.'
  };

  const candidate = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_source_custody_manifest_remediation_queue_candidate',
    source_verdict: PATHS.followupVerdict,
    requested_queue_item: requestedQueueItem,
    current_packet_summary: {
      remediation: summary,
      custody_validator: {
        ok: custodyValidator.ok,
        live_untracked_sources: custodyValidator.live_untracked_sources,
        live_modified_tracked_sources: custodyValidator.live_modified_tracked_sources,
        untracked_license_unit_counts: custodyValidator.untracked_license_unit_counts,
        missing_lexical_manifest_gaps: custodyValidator.agent6_intake_docket.packet_claims.missing_lexical_manifest_gaps,
        blocked_downstream_direct_paths: decision.summary.blocked_downstream_direct_paths,
        blocked_downstream_content_reference_rows: decision.summary.blocked_downstream_content_reference_paths
      }
    },
    remediated_source_paths: remediation.remediated_sources.map((row) => row.source_path),
    generated_manifest_paths: remediation.remediated_sources.map((row) => row.manifest_path),
    boundary: remediation.boundary
  };

  writeJson(PATHS.outputJson, candidate);
  writeText(PATHS.outputMd, `# Agent 1 Source Custody Manifest Remediation Queue Candidate

Generated: ${candidate.generated_at}

Boundary: candidate for Agent 5 relay / Agent 6 review only. This does not mutate the validation queue and does not claim source/provenance acceptance.

## Requested Queue Item

- Request ID: \`${requestedQueueItem.request_id}\`
- Gate: \`${requestedQueueItem.gate}\`
- Status: \`${requestedQueueItem.status}\`
- Requested verdict: \`${requestedQueueItem.requested_verdict}\`

## Current Remediation Evidence

- Remediated source files: ${summary.remediated_source_files}
- Generated manifest files: ${summary.generated_manifest_files}
- Current missing manifest source files: ${summary.current_missing_manifest_source_files}
- Current track-candidate source files: ${summary.current_track_candidate_source_files}
- Current blocked downstream direct paths: ${summary.current_blocked_downstream_direct_paths}
- Current blocked content-reference source rows: ${summary.current_blocked_content_reference_source_rows}
- Remediated-source content-reference source rows: ${summary.remediated_sources_content_reference_source_rows}
- Remediated-source unique content-reference paths: ${summary.remediated_sources_unique_content_reference_paths}

## Remediated Sources

${formatList(candidate.remediated_source_paths)}

## Evidence Artifacts

${formatList(requestedQueueItem.evidence_artifacts)}

## Known Risks

${formatList(requestedQueueItem.known_risks)}

## Must Not Be Accepted

${formatList(MUST_NOT_ACCEPT)}
`);

  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    summary,
    requested_queue_item: requestedQueueItem.request_id
  }, null, 2));
}

main();

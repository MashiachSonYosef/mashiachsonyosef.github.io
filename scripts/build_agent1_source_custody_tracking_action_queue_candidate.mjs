import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  trackingPacket: 'reports/agent1-source-custody-tracking-action-packet.json',
  trackingPacketMd: 'reports/agent1-source-custody-tracking-action-packet.md',
  trackingValidator: 'reports/agent1-source-custody-tracking-action-validator-result.json',
  custodyValidator: 'reports/agent1-source-provenance-custody-validator-result.json',
  closureVerdict: 'reports/agent6-agent1-source-custody-closure-decision-verdict-2026-06-02.md',
  followupVerdict: 'reports/agent6-agent1-source-custody-followup-packets-verdict-2026-06-02.md',
  agent1State: 'reports/agent1-state.md',
  outputJson: 'reports/agent1-source-custody-tracking-action-queue-candidate.json',
  outputMd: 'reports/agent1-source-custody-tracking-action-queue-candidate.md'
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
  const tracking = readJson(PATHS.trackingPacket);
  const trackingValidator = readJson(PATHS.trackingValidator);
  const custodyValidator = readJson(PATHS.custodyValidator);

  assert(tracking.artifact_type === 'agent1_source_custody_tracking_action_packet', 'unexpected tracking packet type');
  assert(trackingValidator.ok === true, 'tracking validator must be passing');
  assert(custodyValidator.ok === true, 'custody validator must be passing');
  assertBoundary(tracking.boundary);
  assert(tracking.summary.track_candidate_source_files === 23, 'expected 23 track candidates');
  assert(tracking.summary.missing_manifest_source_files === 0, 'expected zero missing manifests');
  assert(tracking.proposed_action_boundary.no_staging_performed === true, 'no staging boundary required');
  assert(tracking.proposed_action_boundary.no_tracking_approval_claimed === true, 'no tracking approval boundary required');

  const requestedQueueItem = {
    request_id: 'agent6-agent1-source-custody-tracking-action-review',
    submitted_by: 'Agent 5',
    agent1_evidence_origin: 'Agent 1 evidence packet for Agent 5 relay / Agent 6 review',
    gate: 'source_provenance_custody_gate',
    scope: '23 untracked source-file tracking-review action packet after Packet B manifest remediation',
    status: 'candidate_for_agent5_queue_relay_awaiting_agent6_review',
    priority: 0,
    evidence_artifacts: [
      PATHS.closureVerdict,
      PATHS.followupVerdict,
      PATHS.trackingPacketMd,
      PATHS.trackingPacket,
      PATHS.trackingValidator,
      PATHS.custodyValidator,
      PATHS.agent1State,
      'scripts/build_agent1_source_custody_tracking_action_packet.mjs',
      'scripts/validate_agent1_source_custody_tracking_action_packet.mjs',
      'scripts/build_agent1_source_custody_tracking_action_queue_candidate.mjs'
    ],
    requested_verdict: 'pass_warn_block_23_source_tracking_review_action_packet_only',
    claimed_boundary: 'Agent 1 produced a source-file tracking-review action packet for the exact 23 untracked sources. This is not source/provenance acceptance, source-file tracking approval, staging, commit, render, publication, downstream artifact acceptance, public/runtime acceptance, route publication support, Definition authority, product/data acceptance, publication readiness, future publication support, translation output, or accepted translation text. Publication remains blocked_no_render.',
    known_risks: [
      'The packet can be misread as permission to stage or track the 23 sources; it is review evidence only.',
      'Downstream direct artifacts and content-reference rows remain blocked even if Agent 6 accepts the source-file candidate list.',
      'Six modified tracked source files remain a separate license-label normalization lane.',
      'Agent 1 worker evidence and this queue candidate are not Agent 6 acceptance.'
    ],
    what_changed_since_last_agent6_ruling: `After Agent 6 WARN-accepted Packet A as a candidate list and preserved Packet B as a missing-manifest blocker, Agent 1 remediated the manifest blocker and produced a current tracking-review action packet covering all ${tracking.summary.track_candidate_source_files} live untracked sources. The validator reports ${tracking.summary.total_units} total units, ${tracking.summary.public_domain_units} Public Domain units, ${tracking.summary.cc_by_units} CC-BY units, ${tracking.summary.missing_manifest_source_files} missing manifest source files, ${tracking.summary.direct_downstream_artifact_paths} blocked direct downstream paths, and ${tracking.summary.content_reference_source_rows} blocked content-reference source rows.`,
    what_must_not_be_accepted: MUST_NOT_ACCEPT,
    next_agent6_action: 'Issue a dated pass/warn/block verdict on the 23-source tracking-review action packet only, preserving downstream blocking unless explicitly narrowed by Agent 6.'
  };

  const candidate = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_source_custody_tracking_action_queue_candidate',
    requested_queue_item: requestedQueueItem,
    current_packet_summary: {
      tracking: tracking.summary,
      custody_validator: {
        ok: custodyValidator.ok,
        live_untracked_sources: custodyValidator.live_untracked_sources,
        live_modified_tracked_sources: custodyValidator.live_modified_tracked_sources,
        untracked_license_unit_counts: custodyValidator.untracked_license_unit_counts,
        missing_lexical_manifest_gaps: custodyValidator.agent6_intake_docket.packet_claims.missing_lexical_manifest_gaps
      }
    },
    track_candidate_source_paths: tracking.track_candidate_sources.map((row) => row.source_path),
    boundary: tracking.boundary
  };

  writeJson(PATHS.outputJson, candidate);
  writeText(PATHS.outputMd, `# Agent 1 Source Custody Tracking Action Queue Candidate

Generated: ${candidate.generated_at}

Boundary: candidate for Agent 5 relay / Agent 6 review only. This does not mutate the validation queue, stage source files, or claim source/provenance acceptance.

## Requested Queue Item

- Request ID: \`${requestedQueueItem.request_id}\`
- Gate: \`${requestedQueueItem.gate}\`
- Status: \`${requestedQueueItem.status}\`
- Requested verdict: \`${requestedQueueItem.requested_verdict}\`

## Current Tracking Evidence

- Track-candidate source files: ${tracking.summary.track_candidate_source_files}
- Total units: ${tracking.summary.total_units}
- Public Domain units: ${tracking.summary.public_domain_units}
- CC-BY units: ${tracking.summary.cc_by_units}
- Missing manifest source files: ${tracking.summary.missing_manifest_source_files}
- Direct downstream artifact paths: ${tracking.summary.direct_downstream_artifact_paths}
- Content-reference source rows: ${tracking.summary.content_reference_source_rows}
- Unique content-reference paths: ${tracking.summary.unique_content_reference_paths}

## Track-Candidate Source Files

${formatList(candidate.track_candidate_source_paths)}

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
    requested_queue_item: requestedQueueItem.request_id,
    summary: tracking.summary
  }, null, 2));
}

main();

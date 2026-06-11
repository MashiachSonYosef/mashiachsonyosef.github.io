import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  packet: 'reports/agent1-source-custody-license-normalization-action-packet.json',
  packetMd: 'reports/agent1-source-custody-license-normalization-action-packet.md',
  validator: 'reports/agent1-source-custody-license-normalization-action-validator-result.json',
  custodyValidator: 'reports/agent1-source-provenance-custody-validator-result.json',
  followupVerdict: 'reports/agent6-agent1-source-custody-followup-packets-verdict-2026-06-02.md',
  agent1State: 'reports/agent1-state.md',
  outputJson: 'reports/agent1-source-custody-license-normalization-queue-candidate.json',
  outputMd: 'reports/agent1-source-custody-license-normalization-queue-candidate.md'
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
  const packet = readJson(PATHS.packet);
  const validator = readJson(PATHS.validator);
  const custodyValidator = readJson(PATHS.custodyValidator);

  assert(packet.artifact_type === 'agent1_source_custody_license_normalization_action_packet', 'unexpected packet type');
  assert(validator.ok === true, 'license normalization validator must be passing');
  assert(custodyValidator.ok === true, 'custody validator must be passing');
  assertBoundary(packet.boundary);
  assert(packet.summary.modified_tracked_source_files === 6, 'expected six modified tracked source files');
  assert(packet.summary.total_non_license_diff_count === 0, 'expected zero non-license diffs');
  assert(packet.summary.total_non_pd_to_public_domain_diff_count === 0, 'expected zero non-PD-to-Public-Domain diffs');

  const requestedQueueItem = {
    request_id: 'agent6-agent1-source-custody-license-normalization-review',
    submitted_by: 'Agent 5',
    agent1_evidence_origin: 'Agent 1 evidence packet for Agent 5 relay / Agent 6 review',
    gate: 'source_provenance_custody_gate',
    scope: 'Six modified tracked source files with parsed JSON drift limited to unit license labels from PD to Public Domain',
    status: 'candidate_for_agent5_queue_relay_awaiting_agent6_review',
    priority: 0,
    evidence_artifacts: [
      PATHS.followupVerdict,
      PATHS.packetMd,
      PATHS.packet,
      PATHS.validator,
      PATHS.custodyValidator,
      PATHS.agent1State,
      'scripts/build_agent1_source_custody_license_normalization_action_packet.mjs',
      'scripts/validate_agent1_source_custody_license_normalization_action_packet.mjs',
      'scripts/build_agent1_source_custody_license_normalization_queue_candidate.mjs'
    ],
    requested_verdict: 'pass_warn_block_license_label_normalization_action_packet_only',
    claimed_boundary: 'Agent 1 produced a bounded license-label normalization action packet for six modified tracked source files. The packet proves parsed JSON drift is limited to unit license labels changing from PD to Public Domain. This is not source/provenance acceptance, source-file tracking approval, staging, commit, render, publication, downstream artifact acceptance, public/runtime acceptance, route publication support, Definition authority, product/data acceptance, publication readiness, future publication support, translation output, or accepted translation text. Publication remains blocked_no_render.',
    known_risks: [
      'The packet can be misread as permission to commit the six modified tracked files; it is review evidence only.',
      'Downstream direct artifacts and content-reference rows remain blocked even if Agent 6 accepts the license-label normalization classification.',
      'The 23 untracked source files remain a separate tracking-review lane.',
      'Agent 1 worker evidence and this queue candidate are not Agent 6 acceptance.'
    ],
    what_changed_since_last_agent6_ruling: `Agent 6 WARN-accepted Packet C as license-label normalization evidence only and allowed only a bounded license-label normalization action packet. Agent 1 produced a current packet for ${packet.summary.modified_tracked_source_files} modified tracked sources with ${packet.summary.total_scalar_diff_count} scalar diffs, ${packet.summary.total_non_license_diff_count} non-license diffs, ${packet.summary.total_non_pd_to_public_domain_diff_count} non-PD-to-Public-Domain diffs, ${packet.summary.direct_downstream_artifact_paths} blocked direct downstream paths, and ${packet.summary.content_reference_source_rows} blocked content-reference source rows.`,
    what_must_not_be_accepted: MUST_NOT_ACCEPT,
    next_agent6_action: 'Issue a dated pass/warn/block verdict on the license-label normalization action packet only, preserving downstream blocking unless explicitly narrowed by Agent 6.'
  };

  const candidate = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_source_custody_license_normalization_queue_candidate',
    requested_queue_item: requestedQueueItem,
    current_packet_summary: {
      license_normalization: packet.summary,
      custody_validator: {
        ok: custodyValidator.ok,
        live_untracked_sources: custodyValidator.live_untracked_sources,
        live_modified_tracked_sources: custodyValidator.live_modified_tracked_sources,
        missing_lexical_manifest_gaps: custodyValidator.agent6_intake_docket.packet_claims.missing_lexical_manifest_gaps
      }
    },
    modified_tracked_source_paths: packet.modified_tracked_sources.map((row) => row.source_path),
    boundary: packet.boundary
  };

  writeJson(PATHS.outputJson, candidate);
  writeText(PATHS.outputMd, `# Agent 1 Source Custody License Normalization Queue Candidate

Generated: ${candidate.generated_at}

Boundary: candidate for Agent 5 relay / Agent 6 review only. This does not mutate the validation queue, stage files, commit, or claim source/provenance acceptance.

## Requested Queue Item

- Request ID: \`${requestedQueueItem.request_id}\`
- Gate: \`${requestedQueueItem.gate}\`
- Status: \`${requestedQueueItem.status}\`
- Requested verdict: \`${requestedQueueItem.requested_verdict}\`

## Current License-Normalization Evidence

- Modified tracked source files: ${packet.summary.modified_tracked_source_files}
- Total scalar diffs: ${packet.summary.total_scalar_diff_count}
- Non-license diffs: ${packet.summary.total_non_license_diff_count}
- Non-\`PD\` to \`Public Domain\` diffs: ${packet.summary.total_non_pd_to_public_domain_diff_count}
- Direct downstream artifact paths: ${packet.summary.direct_downstream_artifact_paths}
- Content-reference source rows: ${packet.summary.content_reference_source_rows}
- Unique content-reference paths: ${packet.summary.unique_content_reference_paths}

## Modified Tracked Source Files

${formatList(candidate.modified_tracked_source_paths)}

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
    summary: packet.summary
  }, null, 2));
}

main();

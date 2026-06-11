import fs from 'node:fs';

const PATHS = {
  agent6Verdict: 'reports/agent6-agent1-source-custody-closure-decision-verdict-2026-06-02.md',
  packetAJson: 'reports/agent1-source-custody-packet-a-tracking-review.json',
  packetAMd: 'reports/agent1-source-custody-packet-a-tracking-review.md',
  packetBJson: 'reports/agent1-source-custody-packet-b-missing-manifest.json',
  packetBMd: 'reports/agent1-source-custody-packet-b-missing-manifest.md',
  packetCJson: 'reports/agent1-source-custody-packet-c-license-label-normalization.json',
  packetCMd: 'reports/agent1-source-custody-packet-c-license-label-normalization.md',
  packetsIndexJson: 'reports/agent1-source-custody-followup-packets-index.json',
  packetsIndexMd: 'reports/agent1-source-custody-followup-packets-index.md',
  packetsValidator: 'reports/agent1-source-custody-followup-packets-validator-result.json',
  custodyValidator: 'reports/agent1-source-provenance-custody-validator-result.json',
  agent1State: 'reports/agent1-state.md',
  queue: 'data/control/agent6_validation_queue.json',
  outputJson: 'reports/agent1-source-custody-followup-queue-intake-candidate.json',
  outputMd: 'reports/agent1-source-custody-followup-queue-intake-candidate.md'
};

const REQUEST_ID = 'agent6-agent1-source-custody-followup-packets';

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeMd(path, value) {
  fs.writeFileSync(path, value, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function summarizeQueue(queue) {
  const relevantItems = (queue.queue || [])
    .filter((item) => /agent1|source.*custody|provenance/i.test(`${item.request_id} ${item.gate} ${item.scope}`))
    .map((item) => ({
      request_id: item.request_id,
      status: item.status,
      gate: item.gate,
      priority: item.priority
    }));
  const existingFollowup = (queue.queue || []).find((item) => item.request_id === REQUEST_ID);
  return {
    generated_at: queue.generated_at,
    version: queue.version,
    publication_global_status: queue.publication_global_status,
    existing_followup_request: existingFollowup ? {
      request_id: existingFollowup.request_id,
      status: existingFollowup.status,
      gate: existingFollowup.gate
    } : null,
    relevant_source_custody_items: relevantItems
  };
}

function main() {
  const packetA = readJson(PATHS.packetAJson);
  const packetB = readJson(PATHS.packetBJson);
  const packetC = readJson(PATHS.packetCJson);
  const index = readJson(PATHS.packetsIndexJson);
  const packetsValidator = readJson(PATHS.packetsValidator);
  const custodyValidator = readJson(PATHS.custodyValidator);
  const queue = readJson(PATHS.queue);

  assert(packetsValidator.ok === true, 'follow-up packet validator result must be ok');
  assert(custodyValidator.ok === true, 'custody validator result must be ok');
  assert(queue.publication_global_status === 'blocked_no_render', 'queue publication_global_status must be blocked_no_render');
  assert(packetA.summary.track_candidate_source_files === 17, 'Packet A source count drift');
  assert(packetB.summary.missing_manifest_source_files === 6, 'Packet B source count drift');
  assert(packetC.summary.modified_tracked_source_files === 6, 'Packet C source count drift');
  assert(packetC.summary.total_scalar_diff_count === 1406, 'Packet C scalar diff count drift');
  assert(packetC.summary.total_non_license_diff_count === 0, 'Packet C non-license diff count drift');
  assert(packetC.summary.total_non_pd_to_public_domain_diff_count === 0, 'Packet C non-PD normalization diff count drift');

  const evidenceArtifacts = [
    PATHS.agent6Verdict,
    PATHS.packetsIndexMd,
    PATHS.packetsIndexJson,
    PATHS.packetAMd,
    PATHS.packetAJson,
    PATHS.packetBMd,
    PATHS.packetBJson,
    PATHS.packetCMd,
    PATHS.packetCJson,
    PATHS.packetsValidator,
    PATHS.custodyValidator,
    PATHS.agent1State,
    'scripts/build_agent1_source_custody_followup_packets.mjs',
    'scripts/validate_agent1_source_custody_followup_packets.mjs',
    'scripts/build_agent1_source_custody_followup_queue_candidate.mjs'
  ];

  const missingEvidence = evidenceArtifacts.filter((path) => !fs.existsSync(path));
  assert(missingEvidence.length === 0, `missing evidence artifacts: ${missingEvidence.join(', ')}`);

  const candidate = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_source_custody_followup_queue_intake_candidate',
    request_id: REQUEST_ID,
    queue_source: summarizeQueue(queue),
    requested_queue_item: {
      request_id: REQUEST_ID,
      submitted_by: 'Agent 1 evidence packet for Agent 5 relay / Agent 6 review',
      gate: 'source_provenance_custody_gate',
      scope: 'Agent 1 source/provenance custody follow-up packets A/B/C after Agent 6 disposition-control verdict',
      status: 'candidate_for_agent5_queue_relay_awaiting_agent6_review',
      priority: 0,
      evidence_artifacts: evidenceArtifacts,
      requested_verdict: 'pass_warn_block_source_custody_followup_packets_a_b_c_only',
      claimed_boundary: 'Agent 1 produced three bounded follow-up evidence packets only: Packet A tracking-review candidates, Packet B missing-manifest remediation/exclusion cases, and Packet C license-label normalization proof. This is not source/provenance acceptance, source-file tracking approval, staging, commit, render, source publication, downstream artifact acceptance, public/runtime acceptance, route publication support, Definition authority, product/data gate acceptance, publication readiness, future publication support, translation output, or accepted translation text. Publication remains blocked_no_render.',
      known_risks: [
        'Packet A could be misread as source-file tracking approval; it is only tracking-review evidence for 17 untracked sources.',
        'Packet B could be misread as a remediation pass; all 6 missing-manifest sources remain blocked until manifests are generated/validated or explicit exclusion is docketed.',
        'Packet C could be misread as acceptance of modified tracked files; it proves only license-label normalization classification with downstream blocking preserved.',
        'Downstream direct artifacts and content references remain blocked unless Agent 6 dockets a narrower release.',
        'Agent 1 worker evidence and this queue candidate are not Agent 6 acceptance.'
      ],
      what_changed_since_last_agent6_ruling: 'Agent 6 issued reports/agent6-agent1-source-custody-closure-decision-verdict-2026-06-02.md as WARN-ACCEPTED for disposition-control only and required three bounded follow-up packets. Agent 1 produced Packet A with 17 tracking-review candidates, 7,492 units, 153 blocked direct downstream paths, and 13 blocked content-reference paths; Packet B with 6 missing-manifest sources, 6 expected lexical manifest paths, 77,918 units, 30 blocked direct downstream paths, and 1 blocked content-reference path; and Packet C with 6 modified tracked source files, 1,406 scalar diffs, 0 non-license diffs, 0 non-PD-to-Public-Domain diffs, 59 blocked direct downstream paths, and 10 blocked content-reference paths. The follow-up packet validator passes and live untracked discovery remains 23 files.',
      what_must_not_be_accepted: [
        'source/provenance acceptance',
        'source publication',
        'source-file tracking approval',
        'source-file staging, commit, or merge',
        'downstream direct artifact acceptance',
        'downstream content-reference acceptance',
        'public/runtime acceptance',
        'route publication support',
        'Definition authority',
        'usage-as-definition authority',
        'product/data gate acceptance',
        'publication readiness',
        'future publication support',
        'translation output',
        'accepted translation text'
      ],
      next_agent6_action: 'Issue a dated pass/warn/block verdict on Packet A tracking-review candidates, Packet B missing-manifest remediation/exclusion cases, and Packet C license-label normalization proof, preserving downstream blocking unless explicitly narrowed by Agent 6.'
    },
    current_packet_summaries: {
      packet_a: packetA.summary,
      packet_b: packetB.summary,
      packet_c: packetC.summary,
      index: index.packets,
      validator: packetsValidator
    },
    boundary: {
      agent1_status: 'evidence-ready / awaiting-Agent-6',
      publication_state: 'blocked_no_render',
      source_provenance_acceptance_claimed: false,
      source_file_tracking_approval_claimed: false,
      source_file_staging_claimed: false,
      public_runtime_acceptance_claimed: false,
      route_publication_support_claimed: false,
      definition_authority_claimed: false,
      page_render_acceptance_claimed: false
    }
  };

  writeJson(PATHS.outputJson, candidate);

  const lines = [
    '# Agent 1 Source Custody Follow-Up Queue Intake Candidate',
    '',
    `Generated: ${candidate.generated_at}`,
    '',
    'This is a non-mutating queue-intake candidate for Agent 5 relay / Agent 6 review. It does not edit `data/control/agent6_validation_queue.json`.',
    '',
    '## Requested Queue Item',
    '',
    `- Request ID: \`${REQUEST_ID}\``,
    '- Gate: `source_provenance_custody_gate`',
    '- Requested verdict: `pass_warn_block_source_custody_followup_packets_a_b_c_only`',
    '- Publication state: `blocked_no_render`',
    '',
    '## Packet Summaries',
    '',
    `- Packet A: ${packetA.summary.track_candidate_source_files} tracking-review candidate sources; ${packetA.summary.blocked_downstream_direct_paths} blocked direct paths; ${packetA.summary.blocked_downstream_content_reference_paths} blocked content references.`,
    `- Packet B: ${packetB.summary.missing_manifest_source_files} missing-manifest sources; ${packetB.summary.expected_lexical_manifest_paths} expected manifest paths; ${packetB.summary.blocked_downstream_direct_paths} blocked direct paths; ${packetB.summary.blocked_downstream_content_reference_paths} blocked content references.`,
    `- Packet C: ${packetC.summary.modified_tracked_source_files} modified tracked sources; ${packetC.summary.total_scalar_diff_count} scalar diffs; ${packetC.summary.total_non_license_diff_count} non-license diffs; ${packetC.summary.total_non_pd_to_public_domain_diff_count} non-PD-to-Public-Domain diffs.`,
    '',
    '## Boundary',
    '',
    candidate.requested_queue_item.what_must_not_be_accepted.map((item) => `- Do not accept: ${item}`).join('\n'),
    ''
  ];
  writeMd(PATHS.outputMd, `${lines.join('\n')}\n`);

  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    request_id: REQUEST_ID,
    packet_summaries: candidate.current_packet_summaries,
    boundary: candidate.boundary
  }, null, 2));
}

main();

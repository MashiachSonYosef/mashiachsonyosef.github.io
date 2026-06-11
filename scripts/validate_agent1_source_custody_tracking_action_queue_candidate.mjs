import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();

const PATHS = {
  candidate: 'reports/agent1-source-custody-tracking-action-queue-candidate.json',
  trackingPacket: 'reports/agent1-source-custody-tracking-action-packet.json',
  trackingValidator: 'reports/agent1-source-custody-tracking-action-validator-result.json',
  result: 'reports/agent1-source-custody-tracking-action-queue-validator-result.json'
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
].sort((a, b) => a.localeCompare(b));

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assert(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

function git(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 100
  }).trim();
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function sameSet(actual, expected, label) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${label} mismatch`, { actual, expected });
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

function main() {
  const startedAt = new Date().toISOString();
  const candidate = readJson(PATHS.candidate);
  const tracking = readJson(PATHS.trackingPacket);
  const trackingValidator = readJson(PATHS.trackingValidator);

  assert(candidate.artifact_type === 'agent1_source_custody_tracking_action_queue_candidate', 'unexpected candidate artifact type');
  assert(candidate.requested_queue_item?.request_id === 'agent6-agent1-source-custody-tracking-action-review', 'unexpected request id');
  assert(candidate.requested_queue_item?.submitted_by === 'Agent 5', 'requested queue item must be shaped for Agent 5 relay');
  assert(candidate.requested_queue_item?.agent1_evidence_origin === 'Agent 1 evidence packet for Agent 5 relay / Agent 6 review', 'missing Agent 1 evidence origin');
  assert(candidate.requested_queue_item?.status === 'candidate_for_agent5_queue_relay_awaiting_agent6_review', 'unexpected candidate status');
  assert(candidate.requested_queue_item?.requested_verdict === 'pass_warn_block_23_source_tracking_review_action_packet_only', 'unexpected requested verdict');
  assert(typeof candidate.requested_queue_item?.what_changed_since_last_agent6_ruling === 'string' && candidate.requested_queue_item.what_changed_since_last_agent6_ruling.length > 0, 'missing Agent 6 change-history field');
  assertBoundary(candidate.boundary);
  assert(trackingValidator.ok === true, 'tracking packet validator must pass');

  const liveUntracked = git(['ls-files', '--others', '--exclude-standard', '--', 'data/sources/*.json'])
    .split(/\r?\n/)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  sameSet(sorted(candidate.track_candidate_source_paths), liveUntracked, 'candidate source paths vs live untracked sources');
  sameSet(sorted(candidate.track_candidate_source_paths), sorted(tracking.track_candidate_sources.map((row) => row.source_path)), 'candidate source paths vs tracking packet rows');
  sameSet(sorted(candidate.requested_queue_item.what_must_not_be_accepted), MUST_NOT_ACCEPT, 'must-not-accept list');

  const summary = candidate.current_packet_summary.tracking;
  assert(summary.track_candidate_source_files === 23, 'expected 23 track candidates');
  assert(summary.total_units === 85410, 'expected 85,410 total units');
  assert(summary.public_domain_units === 10727, 'expected 10,727 Public Domain units');
  assert(summary.cc_by_units === 74683, 'expected 74,683 CC-BY units');
  assert(summary.missing_manifest_source_files === 0, 'expected zero missing manifests');
  assert(summary.direct_downstream_artifact_paths === 189, 'expected 189 direct downstream paths');
  assert(summary.content_reference_source_rows === 120, 'expected 120 content-reference source rows');
  assert(summary.unique_content_reference_paths === 68, 'expected 68 unique content-reference paths');

  for (const artifact of candidate.requested_queue_item.evidence_artifacts || []) {
    assert(fs.existsSync(path.join(repoRoot, artifact)), `evidence artifact missing: ${artifact}`);
  }

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_candidate: PATHS.candidate,
    request_id: candidate.requested_queue_item.request_id,
    live_untracked_sources: liveUntracked.length,
    summary,
    boundary: candidate.boundary
  };
  writeJson(PATHS.result, result);
  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  const result = {
    ok: false,
    completed_at: new Date().toISOString(),
    error: error.message,
    details: error.details || null
  };
  writeJson(PATHS.result, result);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

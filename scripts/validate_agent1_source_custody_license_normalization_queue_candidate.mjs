import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();

const PATHS = {
  candidate: 'reports/agent1-source-custody-license-normalization-queue-candidate.json',
  licensePacket: 'reports/agent1-source-custody-license-normalization-action-packet.json',
  licenseValidator: 'reports/agent1-source-custody-license-normalization-action-validator-result.json',
  result: 'reports/agent1-source-custody-license-normalization-queue-validator-result.json'
};

const EXPECTED_MODIFIED_TRACKED_SOURCES = [
  'data/sources/abarbanel-on-guide-for-the-perplexed.json',
  'data/sources/crescas-on-guide-for-the-perplexed.json',
  'data/sources/efodi-on-guide-for-the-perplexed.json',
  'data/sources/narboni-on-guide-for-the-perplexed.json',
  'data/sources/shem-tov-on-guide-for-the-perplexed.json',
  'data/sources/yahel-ohr-on-zohar.json'
].sort((a, b) => a.localeCompare(b));

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
  }).replace(/\s+$/u, '');
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

function liveModifiedTrackedSources() {
  return git(['status', '--short', '--', 'data/sources/*.json'])
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((line) => line.startsWith(' M '))
    .map((line) => line.slice(3))
    .sort((a, b) => a.localeCompare(b));
}

function main() {
  const startedAt = new Date().toISOString();
  const candidate = readJson(PATHS.candidate);
  const licensePacket = readJson(PATHS.licensePacket);
  const licenseValidator = readJson(PATHS.licenseValidator);

  assert(candidate.artifact_type === 'agent1_source_custody_license_normalization_queue_candidate', 'unexpected candidate artifact type');
  assert(candidate.requested_queue_item?.request_id === 'agent6-agent1-source-custody-license-normalization-review', 'unexpected request id');
  assert(candidate.requested_queue_item?.submitted_by === 'Agent 5', 'requested queue item must be shaped for Agent 5 relay');
  assert(candidate.requested_queue_item?.agent1_evidence_origin === 'Agent 1 evidence packet for Agent 5 relay / Agent 6 review', 'missing Agent 1 evidence origin');
  assert(candidate.requested_queue_item?.status === 'candidate_for_agent5_queue_relay_awaiting_agent6_review', 'unexpected candidate status');
  assert(candidate.requested_queue_item?.requested_verdict === 'pass_warn_block_license_label_normalization_action_packet_only', 'unexpected requested verdict');
  assert(typeof candidate.requested_queue_item?.what_changed_since_last_agent6_ruling === 'string' && candidate.requested_queue_item.what_changed_since_last_agent6_ruling.length > 0, 'missing Agent 6 change-history field');
  assertBoundary(candidate.boundary);
  assert(licenseValidator.ok === true, 'license normalization packet validator must pass');

  const liveModified = liveModifiedTrackedSources();
  sameSet(liveModified, EXPECTED_MODIFIED_TRACKED_SOURCES, 'live modified tracked source paths');
  sameSet(sorted(candidate.modified_tracked_source_paths), EXPECTED_MODIFIED_TRACKED_SOURCES, 'candidate modified tracked source paths');
  sameSet(sorted(licensePacket.modified_tracked_sources.map((row) => row.source_path)), EXPECTED_MODIFIED_TRACKED_SOURCES, 'packet modified tracked source paths');
  sameSet(sorted(candidate.requested_queue_item.what_must_not_be_accepted), MUST_NOT_ACCEPT, 'must-not-accept list');

  const summary = candidate.current_packet_summary.license_normalization;
  assert(summary.modified_tracked_source_files === 6, 'expected six modified tracked source files');
  assert(summary.total_scalar_diff_count === 1406, 'expected 1,406 scalar diffs');
  assert(summary.total_non_license_diff_count === 0, 'expected zero non-license diffs');
  assert(summary.total_non_pd_to_public_domain_diff_count === 0, 'expected zero non-PD-to-Public-Domain diffs');
  assert(summary.all_diffs_are_license_fields === true, 'all diffs must be license fields');
  assert(summary.all_diffs_are_pd_to_public_domain === true, 'all diffs must be PD to Public Domain');
  assert(summary.direct_downstream_artifact_paths === 59, 'expected 59 direct downstream paths');
  assert(summary.content_reference_source_rows === 63, 'expected 63 content-reference source rows');
  assert(summary.unique_content_reference_paths === 42, 'expected 42 unique content-reference paths');
  assert(summary.visible_source_license_row_gaps === 0, 'expected zero visible source/license row gaps');

  const packetSummary = licensePacket.summary;
  for (const [key, value] of Object.entries(summary)) {
    assert(packetSummary[key] === value, `summary mismatch for ${key}`, { candidate: value, packet: packetSummary[key] });
  }

  for (const artifact of candidate.requested_queue_item.evidence_artifacts || []) {
    assert(fs.existsSync(path.join(repoRoot, artifact)), `evidence artifact missing: ${artifact}`);
  }

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_candidate: PATHS.candidate,
    request_id: candidate.requested_queue_item.request_id,
    live_modified_tracked_sources: liveModified.length,
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

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();

const PATHS = {
  candidate: 'reports/agent1-source-custody-manifest-remediation-queue-candidate.json',
  remediationPacket: 'reports/agent1-source-custody-manifest-remediation-packet.json',
  remediationValidator: 'reports/agent1-source-custody-manifest-remediation-validator-result.json',
  result: 'reports/agent1-source-custody-manifest-remediation-queue-validator-result.json'
};

const REQUIRED_REMEDIATED_SOURCES = [
  'data/sources/machzor-rosh-hashanah-ashkenaz-linear.json',
  'data/sources/machzor-rosh-hashanah-ashkenaz.json',
  'data/sources/machzor-yom-kippur-ashkenaz-linear.json',
  'data/sources/selichot-nusach-lita-linear.json',
  'data/sources/shabbat-siddur-sefard-linear.json',
  'data/sources/siddur-sefard.json'
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
  const remediation = readJson(PATHS.remediationPacket);
  const remediationValidator = readJson(PATHS.remediationValidator);

  assert(candidate.artifact_type === 'agent1_source_custody_manifest_remediation_queue_candidate', 'unexpected candidate artifact type');
  assert(candidate.requested_queue_item?.request_id === 'agent6-agent1-source-custody-manifest-remediation-review', 'unexpected request id');
  assert(candidate.requested_queue_item?.submitted_by === 'Agent 5', 'requested queue item must be shaped for Agent 5 relay');
  assert(candidate.requested_queue_item?.agent1_evidence_origin === 'Agent 1 evidence packet for Agent 5 relay / Agent 6 review', 'missing Agent 1 evidence origin');
  assert(candidate.requested_queue_item?.status === 'candidate_for_agent5_queue_relay_awaiting_agent6_review', 'unexpected queue candidate status');
  assert(candidate.requested_queue_item?.requested_verdict === 'pass_warn_block_packet_b_manifest_remediation_evidence_only', 'unexpected requested verdict');
  assert(typeof candidate.requested_queue_item?.what_changed_since_last_agent6_ruling === 'string' && candidate.requested_queue_item.what_changed_since_last_agent6_ruling.length > 0, 'missing Agent 6 change-history field');
  assertBoundary(candidate.boundary);

  const untrackedSources = git(['ls-files', '--others', '--exclude-standard', '--', 'data/sources/*.json'])
    .split(/\r?\n/)
    .filter(Boolean);
  assert(untrackedSources.length === 23, 'live untracked source count must remain 23', { live_untracked_sources: untrackedSources.length });

  assert(remediationValidator.ok === true, 'remediation validator must be passing');
  assert(candidate.current_packet_summary.remediation.current_missing_manifest_source_files === 0, 'candidate must record zero current missing manifests');
  assert(candidate.current_packet_summary.remediation.current_track_candidate_source_files === 23, 'candidate must record 23 track candidates');
  assert(candidate.current_packet_summary.remediation.current_blocked_downstream_direct_paths === 248, 'candidate must record 248 blocked direct paths');
  assert(candidate.current_packet_summary.remediation.current_blocked_content_reference_source_rows === 183, 'candidate must record 183 blocked content-reference source rows');
  assert(candidate.current_packet_summary.custody_validator.missing_lexical_manifest_gaps === 0, 'custody validator must record zero missing manifest gaps');

  sameSet(sorted(candidate.remediated_source_paths), REQUIRED_REMEDIATED_SOURCES, 'remediated source paths');
  sameSet(sorted(remediation.remediated_sources.map((row) => row.source_path)), REQUIRED_REMEDIATED_SOURCES, 'packet remediated source paths');
  sameSet(sorted(candidate.requested_queue_item.what_must_not_be_accepted), MUST_NOT_ACCEPT, 'must-not-accept list');

  for (const artifact of candidate.requested_queue_item.evidence_artifacts || []) {
    assert(fs.existsSync(path.join(repoRoot, artifact)), `evidence artifact missing: ${artifact}`);
  }

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_candidate: PATHS.candidate,
    request_id: candidate.requested_queue_item.request_id,
    live_untracked_sources: untrackedSources.length,
    summary: candidate.current_packet_summary.remediation,
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

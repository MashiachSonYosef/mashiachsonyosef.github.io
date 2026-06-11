import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();

const PATHS = {
  packet: 'reports/agent1-source-custody-tracking-action-packet.json',
  custodyPacket: 'reports/agent1-source-provenance-custody-packet.json',
  closureOptions: 'reports/agent1-source-custody-closure-options.json',
  preflight: 'reports/agent1-source-custody-reconciliation-preflight.json',
  result: 'reports/agent1-source-custody-tracking-action-validator-result.json'
};

const MUST_NOT_ACCEPT = [
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
  const packet = readJson(PATHS.packet);
  const custody = readJson(PATHS.custodyPacket);
  const closure = readJson(PATHS.closureOptions);
  const preflight = readJson(PATHS.preflight);

  assert(packet.artifact_type === 'agent1_source_custody_tracking_action_packet', 'unexpected packet artifact type');
  assertBoundary(packet.boundary);
  assert(packet.proposed_action_boundary?.no_staging_performed === true, 'packet must record no staging performed');
  assert(packet.proposed_action_boundary?.no_tracking_approval_claimed === true, 'packet must record no tracking approval claimed');
  assert(packet.proposed_action_boundary?.downstream_direct_artifacts_remain_blocked === true, 'direct artifacts must remain blocked');
  assert(packet.proposed_action_boundary?.downstream_content_references_remain_blocked === true, 'content references must remain blocked');

  const liveUntracked = git(['ls-files', '--others', '--exclude-standard', '--', 'data/sources/*.json'])
    .split(/\r?\n/)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const packetSourcePaths = sorted(packet.track_candidate_sources.map((row) => row.source_path));
  sameSet(packetSourcePaths, liveUntracked, 'packet source paths vs live untracked sources');
  sameSet(packetSourcePaths, sorted(closure.reconciliation_batches.untracked_track_candidate_source_files.source_paths), 'packet source paths vs closure track candidates');
  sameSet(packetSourcePaths, sorted(custody.untracked_dispositions.map((row) => row.source_path)), 'packet source paths vs custody untracked dispositions');

  assert(packet.summary.track_candidate_source_files === 23, 'expected 23 track-candidate source files');
  assert(packet.summary.total_units === 85410, 'expected 85,410 total source units');
  assert(packet.summary.public_domain_units === 10727, 'expected 10,727 Public Domain units');
  assert(packet.summary.cc_by_units === 74683, 'expected 74,683 CC-BY units');
  assert(packet.summary.missing_manifest_source_files === 0, 'expected 0 missing manifests');
  assert(packet.summary.direct_downstream_artifact_paths === 189, 'expected 189 direct downstream artifact paths');
  assert(packet.summary.content_reference_source_rows === 120, 'expected 120 content-reference source rows for 23 track candidates');
  assert(packet.summary.unique_content_reference_paths === 68, 'expected 68 unique content-reference paths for 23 track candidates');
  assert(packet.summary.visible_source_license_row_gaps === 0, 'expected 0 visible source/license row gaps');
  assert(packet.summary.lexical_manifest_gaps === 0, 'expected 0 lexical manifest gaps');

  sameSet(sorted(packet.what_must_not_be_accepted), MUST_NOT_ACCEPT, 'must-not-accept list');
  assert(packet.downstream_direct_artifact_paths.length === preflight.summary.track_candidate_downstream_direct_paths, 'direct downstream artifact path count must match preflight');
  assert(packet.downstream_direct_artifact_status_rows.length === preflight.summary.track_candidate_downstream_direct_paths, 'direct downstream status row count must match preflight');

  for (const row of packet.track_candidate_sources) {
    assert(row.git_status === '??', `source row must remain untracked: ${row.source_path}`);
    assert(row.visible_source_license_rows === true, `visible source/license rows missing: ${row.source_path}`);
    assert(row.lexical_manifest_exists === true, `lexical manifest missing: ${row.source_path}`);
    assert(row.remains_blocked_after_packet === true, `source row must remain blocked: ${row.source_path}`);
    assert(row.proposed_disposition === 'source_file_tracking_review_candidate_only', `unexpected proposed disposition: ${row.source_path}`);
    assert(row.source_fingerprint?.sha256, `source fingerprint missing: ${row.source_path}`);
    assert(Array.isArray(row.direct_downstream_artifact_paths), `direct downstream paths missing: ${row.source_path}`);
    assert(Array.isArray(row.content_reference_rows), `content reference rows missing: ${row.source_path}`);
    assert(row.content_reference_source_row_count === row.content_reference_rows.length, `content-reference row count mismatch: ${row.source_path}`);
    assert(row.content_reference_unique_path_count === new Set(row.content_reference_rows.map((entry) => entry.path)).size, `content-reference unique path count mismatch: ${row.source_path}`);
  }

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_packet: PATHS.packet,
    live_untracked_sources: liveUntracked.length,
    summary: packet.summary,
    boundary: packet.boundary
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

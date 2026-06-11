import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();

const PATHS = {
  packet: 'reports/agent1-source-custody-license-normalization-action-packet.json',
  result: 'reports/agent1-source-custody-license-normalization-action-validator-result.json'
};

const REQUIRED_MODIFIED_TRACKED = [
  'data/sources/abarbanel-on-guide-for-the-perplexed.json',
  'data/sources/crescas-on-guide-for-the-perplexed.json',
  'data/sources/efodi-on-guide-for-the-perplexed.json',
  'data/sources/narboni-on-guide-for-the-perplexed.json',
  'data/sources/shem-tov-on-guide-for-the-perplexed.json',
  'data/sources/yahel-ohr-on-zohar.json'
].sort((a, b) => a.localeCompare(b));

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

function getAtPath(value, parts) {
  let current = value;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}

function scalarDiffs(current, head, prefix = []) {
  if (Array.isArray(current) || Array.isArray(head)) {
    const length = Math.max(Array.isArray(current) ? current.length : 0, Array.isArray(head) ? head.length : 0);
    const diffs = [];
    for (let index = 0; index < length; index += 1) {
      diffs.push(...scalarDiffs(current?.[index], head?.[index], [...prefix, String(index)]));
    }
    return diffs;
  }

  const currentIsObject = current && typeof current === 'object';
  const headIsObject = head && typeof head === 'object';
  if (currentIsObject || headIsObject) {
    const keys = new Set([
      ...Object.keys(currentIsObject ? current : {}),
      ...Object.keys(headIsObject ? head : {})
    ]);
    const diffs = [];
    for (const key of [...keys].sort((a, b) => a.localeCompare(b))) {
      diffs.push(...scalarDiffs(current?.[key], head?.[key], [...prefix, key]));
    }
    return diffs;
  }

  if (current !== head) {
    return [{ path: prefix.join('.'), current, head }];
  }
  return [];
}

function validateScalarDiffs(sourcePath) {
  const current = JSON.parse(fs.readFileSync(path.join(repoRoot, sourcePath), 'utf8'));
  const head = JSON.parse(git(['show', `HEAD:${sourcePath}`]));
  const diffs = scalarDiffs(current, head);
  const nonLicenseDiffs = diffs.filter((diff) => !diff.path.endsWith('.license'));
  const nonPdToPublicDomain = diffs.filter((diff) => !(diff.path.endsWith('.license') && diff.head === 'PD' && diff.current === 'Public Domain'));
  return {
    scalar_diff_count: diffs.length,
    non_license_diff_count: nonLicenseDiffs.length,
    non_pd_to_public_domain_diff_count: nonPdToPublicDomain.length
  };
}

function main() {
  const startedAt = new Date().toISOString();
  const packet = readJson(PATHS.packet);

  assert(packet.artifact_type === 'agent1_source_custody_license_normalization_action_packet', 'unexpected packet artifact type');
  assertBoundary(packet.boundary);
  assert(packet.proposed_action_boundary?.no_staging_performed === true, 'packet must record no staging performed');
  assert(packet.proposed_action_boundary?.no_source_acceptance_claimed === true, 'packet must record no source acceptance claimed');
  assert(packet.proposed_action_boundary?.downstream_direct_artifacts_remain_blocked === true, 'direct artifacts must remain blocked');
  assert(packet.proposed_action_boundary?.downstream_content_references_remain_blocked === true, 'content references must remain blocked');

  const liveModified = git(['diff', '--name-only', '--', ...REQUIRED_MODIFIED_TRACKED])
    .split(/\r?\n/)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  sameSet(liveModified, REQUIRED_MODIFIED_TRACKED, 'live modified tracked source set');

  const packetSourcePaths = sorted(packet.modified_tracked_sources.map((row) => row.source_path));
  sameSet(packetSourcePaths, REQUIRED_MODIFIED_TRACKED, 'packet modified tracked source set');
  sameSet(sorted(packet.what_must_not_be_accepted), MUST_NOT_ACCEPT, 'must-not-accept list');

  let scalarDiffCount = 0;
  let nonLicenseDiffCount = 0;
  let nonPdToPublicDomainDiffCount = 0;
  for (const row of packet.modified_tracked_sources) {
    const diffSummary = validateScalarDiffs(row.source_path);
    scalarDiffCount += diffSummary.scalar_diff_count;
    nonLicenseDiffCount += diffSummary.non_license_diff_count;
    nonPdToPublicDomainDiffCount += diffSummary.non_pd_to_public_domain_diff_count;
    assert(row.scalar_diff_count === diffSummary.scalar_diff_count, `scalar diff count mismatch: ${row.source_path}`, diffSummary);
    assert(row.all_diffs_are_license_pd_to_public_domain === true, `row must be PD-to-Public-Domain only: ${row.source_path}`);
    assert(row.units_current === row.units_head, `unit count changed: ${row.source_path}`);
    assert(row.visible_source_license_rows === true, `visible source/license rows missing: ${row.source_path}`);
    assert(row.remains_blocked_after_packet === true, `row must remain blocked: ${row.source_path}`);
    assert(row.proposed_disposition === 'license_label_normalization_review_only', `unexpected proposed disposition: ${row.source_path}`);
  }

  assert(packet.summary.modified_tracked_source_files === 6, 'expected six modified tracked files');
  assert(packet.summary.total_scalar_diff_count === scalarDiffCount, 'total scalar diff count mismatch');
  assert(packet.summary.total_non_license_diff_count === nonLicenseDiffCount, 'total non-license diff count mismatch');
  assert(packet.summary.total_non_pd_to_public_domain_diff_count === nonPdToPublicDomainDiffCount, 'total non-PD-to-Public-Domain diff count mismatch');
  assert(packet.summary.total_scalar_diff_count === 1406, 'expected 1,406 scalar diffs');
  assert(packet.summary.total_non_license_diff_count === 0, 'expected zero non-license diffs');
  assert(packet.summary.total_non_pd_to_public_domain_diff_count === 0, 'expected zero non-PD-to-Public-Domain diffs');
  assert(packet.summary.direct_downstream_artifact_paths === 59, 'expected 59 direct downstream paths');
  assert(packet.summary.content_reference_source_rows === 63, 'expected 63 content-reference source rows');
  assert(packet.summary.unique_content_reference_paths === 42, 'expected 42 unique content-reference paths');
  assert(packet.summary.visible_source_license_row_gaps === 0, 'expected zero visible source/license gaps');

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_packet: PATHS.packet,
    live_modified_tracked_sources: liveModified.length,
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

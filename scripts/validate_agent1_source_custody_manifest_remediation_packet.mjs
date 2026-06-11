import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();

const PATHS = {
  packet: 'reports/agent1-source-custody-manifest-remediation-packet.json',
  decisionPacket: 'reports/agent1-agent6-source-custody-decision-packet.json',
  result: 'reports/agent1-source-custody-manifest-remediation-validator-result.json'
};

const REQUIRED_REMEDIATED_SOURCES = [
  'data/sources/machzor-rosh-hashanah-ashkenaz-linear.json',
  'data/sources/machzor-rosh-hashanah-ashkenaz.json',
  'data/sources/machzor-yom-kippur-ashkenaz-linear.json',
  'data/sources/selichot-nusach-lita-linear.json',
  'data/sources/shabbat-siddur-sefard-linear.json',
  'data/sources/siddur-sefard.json'
].sort();

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
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${label} mismatch`,
    { actual, expected }
  );
}

function assertBoundary(boundary) {
  assert(boundary, 'packet boundary missing');
  assert(boundary.publication_state === 'blocked_no_render', 'publication state must remain blocked_no_render');
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

function listChunkFiles(chunkDir) {
  const fullDir = path.join(repoRoot, chunkDir);
  assert(fs.existsSync(fullDir), `chunk directory missing: ${chunkDir}`);
  return fs.readdirSync(fullDir)
    .filter((name) => name.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b));
}

function validateManifest(row) {
  assert(row.manifest_path, `manifest path missing for ${row.source_path}`);
  assert(fs.existsSync(path.join(repoRoot, row.manifest_path)), `manifest missing for ${row.source_path}`, row);

  const manifest = readJson(row.manifest_path);
  const chunkStats = row.manifest_chunk_stats || {};
  assert(manifest.work_id === row.work_id, `manifest work_id mismatch for ${row.source_path}`, {
    manifest_work_id: manifest.work_id,
    row_work_id: row.work_id
  });
  assert(chunkStats.chunk_dir, `chunk_dir missing for ${row.source_path}`);

  const chunks = listChunkFiles(chunkStats.chunk_dir);
  assert(chunks.length === chunkStats.chunk_file_count, `chunk file count mismatch for ${row.source_path}`, {
    actual: chunks.length,
    expected: chunkStats.chunk_file_count
  });
  assert(chunkStats.chunk_file_count === chunkStats.listed_chunk_count, `listed chunk count mismatch for ${row.source_path}`, chunkStats);
  assert(Number.isInteger(chunkStats.total_manifest_token_count) && chunkStats.total_manifest_token_count > 0, `manifest token count invalid for ${row.source_path}`);
  assert(Number.isInteger(chunkStats.total_manifest_entry_count) && chunkStats.total_manifest_entry_count > 0, `manifest entry count invalid for ${row.source_path}`);
  assert(Number.isInteger(chunkStats.token_chunk_key_count) && chunkStats.token_chunk_key_count > 0, `token chunk key count invalid for ${row.source_path}`);
}

function main() {
  const startedAt = new Date().toISOString();
  const packet = readJson(PATHS.packet);
  const decision = readJson(PATHS.decisionPacket);

  assert(packet.artifact_type === 'agent1_source_custody_manifest_remediation_packet', 'unexpected packet artifact_type');
  assertBoundary(packet.boundary);

  const remediatedSourcePaths = sorted(packet.remediated_sources.map((row) => row.source_path));
  sameSet(remediatedSourcePaths, REQUIRED_REMEDIATED_SOURCES, 'remediated source set');

  const untrackedSources = git(['ls-files', '--others', '--exclude-standard', '--', 'data/sources/*.json'])
    .split(/\r?\n/)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  assert(untrackedSources.length === packet.summary.live_untracked_sources, 'live untracked source count mismatch', {
    live: untrackedSources.length,
    packet: packet.summary.live_untracked_sources
  });
  assert(packet.summary.live_untracked_sources === 23, 'expected 23 live untracked sources');
  assert(packet.summary.remediated_source_files === 6, 'expected 6 remediated source files');
  assert(packet.summary.generated_manifest_files === 6, 'expected 6 generated manifest files');
  assert(packet.summary.current_missing_manifest_source_files === 0, 'expected 0 current missing manifest source files');
  assert(packet.summary.current_track_candidate_source_files === 23, 'expected 23 current track candidates');
  assert(packet.summary.current_blocked_downstream_direct_paths === decision.summary.blocked_downstream_direct_paths, 'current blocked downstream direct path count mismatch', {
    expected: decision.summary.blocked_downstream_direct_paths,
    actual: packet.summary.current_blocked_downstream_direct_paths
  });
  assert(packet.summary.current_blocked_content_reference_source_rows === decision.summary.blocked_downstream_content_reference_paths, 'current blocked content-reference source row count mismatch', {
    expected: decision.summary.blocked_downstream_content_reference_paths,
    actual: packet.summary.current_blocked_content_reference_source_rows
  });
  assert(packet.summary.remediated_sources_content_reference_source_rows === 6, 'expected 6 remediated-source content-reference source rows');
  assert(packet.summary.remediated_sources_unique_content_reference_paths === 1, 'expected 1 remediated-source unique content-reference path');

  for (const row of packet.remediated_sources) {
    assert(row.prior_closure_bucket === 'requires_missing_lexical_manifest_remediation_or_explicit_exclusion', `prior closure bucket mismatch for ${row.source_path}`);
    assert(row.current_closure_bucket === 'track_candidate_requires_agent6_source_review', `current closure bucket mismatch for ${row.source_path}`);
    assert(Array.isArray(row.current_required_missing_artifact_paths) && row.current_required_missing_artifact_paths.length === 0, `current missing artifacts remain for ${row.source_path}`);
    assert(row.remains_blocked_after_remediation === true, `remediation row must remain blocked for ${row.source_path}`);
    assert(Array.isArray(row.downstream_direct_artifact_paths) && row.downstream_direct_artifact_paths.length > 0, `direct downstream paths missing for ${row.source_path}`);
    assert(Array.isArray(row.downstream_content_reference_source_rows), `content-reference rows missing for ${row.source_path}`);
    assert(Array.isArray(row.downstream_content_reference_unique_paths), `unique content-reference paths missing for ${row.source_path}`);
    validateManifest(row);
  }

  const result = {
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    validated_packet: PATHS.packet,
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

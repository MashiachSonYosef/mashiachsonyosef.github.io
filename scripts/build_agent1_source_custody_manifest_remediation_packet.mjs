import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const OUTPUT_JSON = 'reports/agent1-source-custody-manifest-remediation-packet.json';
const OUTPUT_MD = 'reports/agent1-source-custody-manifest-remediation-packet.md';

const PATHS = {
  priorPacketB: 'reports/agent1-source-custody-packet-b-missing-manifest.json',
  currentCustodyPacket: 'reports/agent1-source-provenance-custody-packet.json',
  currentClosureOptions: 'reports/agent1-source-custody-closure-options.json',
  currentDecisionPacket: 'reports/agent1-agent6-source-custody-decision-packet.json',
  currentRefreshResult: 'reports/agent1-source-custody-refresh-result.json',
  currentValidatorResult: 'reports/agent1-source-provenance-custody-validator-result.json',
  followupVerdict: 'reports/agent6-agent1-source-custody-followup-packets-verdict-2026-06-02.md'
};

const BOUNDARY = {
  agent1_status: 'evidence-ready / awaiting-Agent-6',
  publication_state: 'blocked_no_render',
  source_provenance_acceptance_claimed: false,
  source_file_tracking_approval_claimed: false,
  source_file_staging_claimed: false,
  public_runtime_acceptance_claimed: false,
  route_publication_support_claimed: false,
  definition_authority_claimed: false,
  page_render_acceptance_claimed: false
};

const MUST_NOT_BE_ACCEPTED = [
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
  if (!condition) throw new Error(message);
}

function sha256File(path) {
  return crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
}

function chunkStats(workId, manifest) {
  const chunkDir = `data/lexical/${workId}-chunks`;
  assert(fs.existsSync(chunkDir), `missing chunk dir for ${workId}: ${chunkDir}`);
  const chunkFiles = fs.readdirSync(chunkDir).filter((file) => file.endsWith('.json')).sort();
  assert(chunkFiles.length === manifest.chunks.length, `chunk file count mismatch for ${workId}`);
  const listedFiles = new Set(manifest.chunks.map((chunk) => chunk.url.split('/').pop()));
  for (const file of chunkFiles) {
    assert(listedFiles.has(file), `chunk file not listed in manifest for ${workId}: ${file}`);
  }
  return {
    chunk_dir: chunkDir,
    chunk_file_count: chunkFiles.length,
    listed_chunk_count: manifest.chunks.length,
    total_manifest_token_count: manifest.chunks.reduce((sum, chunk) => sum + (chunk.token_count || 0), 0),
    total_manifest_entry_count: manifest.chunks.reduce((sum, chunk) => sum + (chunk.entry_count || 0), 0),
    token_chunk_key_count: Object.keys(manifest.token_chunks || {}).length
  };
}

function findCurrentClosureRow(rows, sourcePath) {
  const row = rows.find((candidate) => candidate.source_path === sourcePath);
  assert(row, `missing current closure row for ${sourcePath}`);
  return row;
}

function main() {
  const priorPacketB = readJson(PATHS.priorPacketB);
  const custodyPacket = readJson(PATHS.currentCustodyPacket);
  const closure = readJson(PATHS.currentClosureOptions);
  const decision = readJson(PATHS.currentDecisionPacket);
  const validator = readJson(PATHS.currentValidatorResult);

  assert(validator.ok === true, 'current custody validator must be ok');
  assert(custodyPacket.summary?.untracked_missing_lexical_manifest === 0, 'current custody packet still reports missing lexical manifests');
  assert(decision.summary?.missing_manifest_source_files === 0, 'current decision packet still reports missing manifest source files');
  assert(closure.summary?.untracked_requires_missing_lexical_manifest_remediation === 0, 'current closure options still report missing manifest remediation rows');

  const currentRows = closure.untracked_closure_options || [];
  const remediatedSources = (priorPacketB.missing_manifest_sources || []).map((prior) => {
    const current = findCurrentClosureRow(currentRows, prior.source_path);
    assert(current.closure_bucket === 'track_candidate_requires_agent6_source_review', `remediated source not promoted to track-candidate bucket: ${prior.source_path}`);
    assert((current.required_missing_artifact_paths || []).length === 0, `remediated source still has required missing artifact paths: ${prior.source_path}`);
    const expectedManifestPaths = prior.expected_lexical_manifest_paths || [];
    assert(expectedManifestPaths.length === 1, `expected exactly one prior missing manifest path for ${prior.source_path}`);
    const manifestPath = expectedManifestPaths[0];
    assert(fs.existsSync(manifestPath), `remediated manifest is missing on disk: ${manifestPath}`);
    const manifest = readJson(manifestPath);
    const stats = chunkStats(current.work_id, manifest);
    assert(manifest.work_id === current.work_id, `manifest work_id mismatch for ${manifestPath}`);
    return {
      source_path: prior.source_path,
      work_id: current.work_id,
      units: current.units,
      license_counts: current.license_counts,
      source_fingerprint: current.source_fingerprint,
      prior_missing_manifest_paths: expectedManifestPaths,
      manifest_path: manifestPath,
      manifest_sha256: sha256File(manifestPath),
      manifest_schema_version: manifest.schema_version,
      manifest_generated_at: manifest.generated_at,
      manifest_chunk_stats: stats,
      prior_closure_bucket: 'requires_missing_lexical_manifest_remediation_or_explicit_exclusion',
      current_closure_bucket: current.closure_bucket,
      current_required_missing_artifact_paths: current.required_missing_artifact_paths || [],
      downstream_direct_artifact_paths: current.downstream_direct_artifact_paths || [],
      downstream_content_reference_source_rows: current.downstream_content_reference_paths || [],
      downstream_content_reference_unique_paths: [...new Set(current.downstream_content_reference_paths || [])].sort(),
      remains_blocked_after_remediation: true
    };
  });

  const totalSourceReferenceRows = remediatedSources.reduce((sum, row) => sum + row.downstream_content_reference_source_rows.length, 0);
  const uniqueContentPaths = new Set(remediatedSources.flatMap((row) => row.downstream_content_reference_unique_paths));
  const directPaths = new Set(remediatedSources.flatMap((row) => row.downstream_direct_artifact_paths));
  const sourcePaths = remediatedSources.map((row) => row.source_path).sort();
  const liveUntracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'data/sources/*.json'], {
    encoding: 'utf8'
  }).trim().split(/\r?\n/).filter(Boolean).sort();

  for (const sourcePath of sourcePaths) {
    assert(liveUntracked.includes(sourcePath), `remediated source is not still in live untracked discovery: ${sourcePath}`);
  }

  const packet = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_source_custody_manifest_remediation_packet',
    source_artifacts: PATHS,
    source_verdict: PATHS.followupVerdict,
    boundary: BOUNDARY,
    summary: {
      remediated_source_files: remediatedSources.length,
      generated_manifest_files: remediatedSources.length,
      current_missing_manifest_source_files: decision.summary.missing_manifest_source_files,
      current_track_candidate_source_files: decision.summary.track_candidate_source_files,
      current_blocked_downstream_direct_paths: decision.summary.blocked_downstream_direct_paths,
      current_blocked_content_reference_source_rows: decision.summary.blocked_downstream_content_reference_paths,
      remediated_sources_blocked_downstream_direct_paths: directPaths.size,
      remediated_sources_content_reference_source_rows: totalSourceReferenceRows,
      remediated_sources_unique_content_reference_paths: uniqueContentPaths.size,
      live_untracked_sources: liveUntracked.length
    },
    remediated_sources: remediatedSources,
    requested_agent6_review: {
      requested_verdict: 'pass_warn_block_missing_manifest_remediation_evidence_only',
      requested_boundary: 'Review whether Packet B missing-manifest remediation evidence is sufficient to move the six formerly blocked sources into the tracking-review candidate bucket, with downstream blocking preserved.',
      what_changed_since_last_agent6_ruling: `Agent 1 generated route-local lexical manifests/chunks for the six Packet B sources using scripts/write_lexical_payloads.mjs only. No HTML render, staging, source/provenance acceptance, or downstream acceptance is claimed. Current custody packet, decision packet, and validator now report 0 missing lexical manifests, 23 track-candidate untracked sources, 248 blocked direct downstream paths, and ${decision.summary.blocked_downstream_content_reference_paths} blocked content-reference source rows.`
    },
    must_not_be_accepted: MUST_NOT_BE_ACCEPTED
  };

  writeJson(OUTPUT_JSON, packet);

  const lines = [
    '# Agent 1 Source Custody Manifest Remediation Packet',
    '',
    `Generated: ${packet.generated_at}`,
    '',
    'Boundary: evidence-ready / awaiting-Agent-6 only. This packet documents route-local lexical manifest generation for the six formerly missing-manifest sources. It does not render, stage, track, commit, publish, or accept source/provenance state.',
    '',
    '## Summary',
    '',
    `- Remediated source files: ${packet.summary.remediated_source_files}`,
    `- Generated manifest files: ${packet.summary.generated_manifest_files}`,
    `- Current missing manifest source files: ${packet.summary.current_missing_manifest_source_files}`,
    `- Current track-candidate source files: ${packet.summary.current_track_candidate_source_files}`,
    `- Current blocked downstream direct paths: ${packet.summary.current_blocked_downstream_direct_paths}`,
    `- Current blocked content-reference source rows: ${packet.summary.current_blocked_content_reference_source_rows}`,
    `- Remediated-source content-reference source rows: ${packet.summary.remediated_sources_content_reference_source_rows}`,
    `- Remediated-source unique content-reference paths: ${packet.summary.remediated_sources_unique_content_reference_paths}`,
    '',
    '## Remediated Sources',
    ''
  ];
  for (const row of remediatedSources) {
    lines.push(`### ${row.source_path}`);
    lines.push('');
    lines.push(`- Work ID: \`${row.work_id}\``);
    lines.push(`- Units: ${row.units}`);
    lines.push(`- License counts: \`${JSON.stringify(row.license_counts)}\``);
    lines.push(`- Manifest: \`${row.manifest_path}\``);
    lines.push(`- Manifest SHA-256: \`${row.manifest_sha256}\``);
    lines.push(`- Chunk files: ${row.manifest_chunk_stats.chunk_file_count}`);
    lines.push(`- Manifest token count: ${row.manifest_chunk_stats.total_manifest_token_count}`);
    lines.push(`- Manifest entry count sum: ${row.manifest_chunk_stats.total_manifest_entry_count}`);
    lines.push(`- Content-reference source rows: ${row.downstream_content_reference_source_rows.length}`);
    lines.push(`- Unique content-reference paths: ${row.downstream_content_reference_unique_paths.length}`);
    lines.push('- Remains blocked after remediation until Agent 6 dockets source tracking/downstream disposition.');
    lines.push('');
  }
  lines.push('## Must Not Be Accepted');
  lines.push('');
  for (const item of MUST_NOT_BE_ACCEPTED) lines.push(`- ${item}`);
  lines.push('');
  writeMd(OUTPUT_MD, `${lines.join('\n')}\n`);

  console.log(JSON.stringify({
    ok: true,
    output_json: OUTPUT_JSON,
    output_md: OUTPUT_MD,
    summary: packet.summary,
    boundary: packet.boundary
  }, null, 2));
}

main();

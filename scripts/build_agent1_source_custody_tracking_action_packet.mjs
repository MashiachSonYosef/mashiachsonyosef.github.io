import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();

const PATHS = {
  custodyPacket: 'reports/agent1-source-provenance-custody-packet.json',
  closureOptions: 'reports/agent1-source-custody-closure-options.json',
  reconciliationPreflight: 'reports/agent1-source-custody-reconciliation-preflight.json',
  decisionPacket: 'reports/agent1-agent6-source-custody-decision-packet.json',
  remediationPacket: 'reports/agent1-source-custody-manifest-remediation-packet.json',
  outputJson: 'reports/agent1-source-custody-tracking-action-packet.json',
  outputMd: 'reports/agent1-source-custody-tracking-action-packet.md'
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

function git(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 100
  }).trim();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function flattenDirectArtifacts(directArtifacts) {
  return Object.values(directArtifacts || {})
    .filter((entry) => entry?.exists && entry.path)
    .map((entry) => entry.path)
    .sort((a, b) => a.localeCompare(b));
}

function flattenContentHits(contentHits) {
  const rows = [];
  for (const [kind, values] of Object.entries(contentHits || {})) {
    if (!Array.isArray(values)) continue;
    for (const value of values) {
      rows.push({ kind, path: value });
    }
  }
  return rows.sort((a, b) => `${a.kind}:${a.path}`.localeCompare(`${b.kind}:${b.path}`));
}

function formatList(values) {
  return values.map((value) => `- ${value}`).join('\n');
}

function main() {
  const custody = readJson(PATHS.custodyPacket);
  const closure = readJson(PATHS.closureOptions);
  const preflight = readJson(PATHS.reconciliationPreflight);
  const decision = readJson(PATHS.decisionPacket);
  const remediation = readJson(PATHS.remediationPacket);

  const batch = closure.reconciliation_batches.untracked_track_candidate_source_files;
  const dryRun = preflight.dry_run_buckets.track_candidate_source_files_only.paths;
  const directDryRun = preflight.dry_run_buckets.track_candidate_downstream_direct_paths.paths;
  const sourcePaths = sorted(batch.source_paths);
  const liveUntracked = git(['ls-files', '--others', '--exclude-standard', '--', 'data/sources/*.json'])
    .split(/\r?\n/)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  assert(sourcePaths.length === 23, 'expected 23 source paths');
  assert(JSON.stringify(sourcePaths) === JSON.stringify(liveUntracked), 'track-candidate source paths must match live untracked discovery');
  assert(remediation.summary.current_missing_manifest_source_files === 0, 'tracking action requires remediated missing manifests');
  assert(decision.summary.missing_manifest_source_files === 0, 'decision packet must have zero missing manifest source files');

  const dispositionByPath = new Map(custody.untracked_dispositions.map((row) => [row.source_path, row]));
  const dryRunByPath = new Map(dryRun.map((row) => [row.path, row.git_status]));
  const trackedCandidates = sourcePaths.map((sourcePath) => {
    const row = dispositionByPath.get(sourcePath);
    assert(row, `missing custody row for ${sourcePath}`);
    const directArtifactPaths = flattenDirectArtifacts(row.direct_artifacts);
    const contentReferenceRows = flattenContentHits(row.content_hits);
    return {
      source_path: sourcePath,
      work_id: row.work_id,
      work_slug: row.work_slug,
      units: row.units,
      license_counts: row.license_counts,
      source_fingerprint: row.source_fingerprint,
      git_status: dryRunByPath.get(sourcePath) || 'unknown',
      visible_source_license_rows: row.page_evidence?.visible_source_license_rows === true,
      lexical_manifest_exists: row.direct_artifacts?.lexical_manifest?.exists === true,
      lexical_manifest_path: row.direct_artifacts?.lexical_manifest?.path || null,
      direct_downstream_artifact_paths: directArtifactPaths,
      content_reference_rows: contentReferenceRows,
      content_reference_source_row_count: contentReferenceRows.length,
      content_reference_unique_path_count: new Set(contentReferenceRows.map((entry) => entry.path)).size,
      proposed_disposition: 'source_file_tracking_review_candidate_only',
      remains_blocked_after_packet: true
    };
  });

  const totalContentRows = trackedCandidates.reduce((sum, row) => sum + row.content_reference_source_row_count, 0);
  const totalUniqueContentPaths = new Set(trackedCandidates.flatMap((row) => row.content_reference_rows.map((entry) => entry.path))).size;
  const totalDirectArtifacts = directDryRun.length;

  const packet = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_source_custody_tracking_action_packet',
    source_artifacts: {
      custodyPacket: PATHS.custodyPacket,
      closureOptions: PATHS.closureOptions,
      reconciliationPreflight: PATHS.reconciliationPreflight,
      decisionPacket: PATHS.decisionPacket,
      remediationPacket: PATHS.remediationPacket
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
    },
    summary: {
      track_candidate_source_files: trackedCandidates.length,
      total_units: batch.total_units,
      public_domain_units: trackedCandidates.reduce((sum, row) => sum + (row.license_counts['Public Domain'] || 0), 0),
      cc_by_units: trackedCandidates.reduce((sum, row) => sum + (row.license_counts['CC-BY'] || 0), 0),
      missing_manifest_source_files: decision.summary.missing_manifest_source_files,
      direct_downstream_artifact_paths: totalDirectArtifacts,
      content_reference_source_rows: totalContentRows,
      unique_content_reference_paths: totalUniqueContentPaths,
      visible_source_license_row_gaps: trackedCandidates.filter((row) => !row.visible_source_license_rows).length,
      lexical_manifest_gaps: trackedCandidates.filter((row) => !row.lexical_manifest_exists).length
    },
    proposed_action_boundary: {
      action: 'Agent 6 review of source-file tracking candidates only',
      source_paths_may_be_considered_for_tracking_after_agent6_or_owner_action: sourcePaths,
      downstream_direct_artifacts_remain_blocked: true,
      downstream_content_references_remain_blocked: true,
      no_staging_performed: true,
      no_tracking_approval_claimed: true
    },
    track_candidate_sources: trackedCandidates,
    downstream_direct_artifact_paths: sorted(batch.downstream_direct_artifact_paths),
    downstream_direct_artifact_status_rows: directDryRun,
    what_must_not_be_accepted: MUST_NOT_ACCEPT
  };

  writeJson(PATHS.outputJson, packet);
  writeText(PATHS.outputMd, `# Agent 1 Source Custody Tracking Action Packet

Generated: ${packet.generated_at}

Boundary: evidence-ready / awaiting-Agent-6 only. This packet proposes the exact 23 untracked source files as tracking-review candidates after the missing-manifest gap was remediated. It does not stage, track, commit, merge, render, publish, or accept source/provenance state.

## Summary

- Track-candidate source files: ${packet.summary.track_candidate_source_files}
- Total units: ${packet.summary.total_units}
- Public Domain units: ${packet.summary.public_domain_units}
- CC-BY units: ${packet.summary.cc_by_units}
- Missing manifest source files: ${packet.summary.missing_manifest_source_files}
- Direct downstream artifact paths: ${packet.summary.direct_downstream_artifact_paths}
- Content-reference source rows: ${packet.summary.content_reference_source_rows}
- Unique content-reference paths: ${packet.summary.unique_content_reference_paths}
- Visible source/license row gaps: ${packet.summary.visible_source_license_row_gaps}
- Lexical manifest gaps: ${packet.summary.lexical_manifest_gaps}

## Candidate Source Files

${formatList(sourcePaths)}

## Required Boundary

- No staging performed.
- No source-file tracking approval claimed.
- Downstream direct artifacts remain blocked.
- Downstream content-reference rows remain blocked.
- Publication remains \`blocked_no_render\`.

## Must Not Be Accepted

${formatList(MUST_NOT_ACCEPT)}
`);

  console.log(JSON.stringify({
    ok: true,
    output_json: PATHS.outputJson,
    output_md: PATHS.outputMd,
    summary: packet.summary
  }, null, 2));
}

main();

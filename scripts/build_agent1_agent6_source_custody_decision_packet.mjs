#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const custodyPacketPath = path.join(repoRoot, 'reports', 'agent1-source-provenance-custody-packet.json');
const quarantineManifestPath = path.join(repoRoot, 'reports', 'agent1-downstream-quarantine-manifest.json');
const closurePath = path.join(repoRoot, 'reports', 'agent1-source-custody-closure-options.json');
const preflightPath = path.join(repoRoot, 'reports', 'agent1-source-custody-reconciliation-preflight.json');
const currentBlockerPacketPath = path.join(repoRoot, 'reports', 'agent1-source-custody-current-blocker-packet-2026-06-03.json');
const outputJsonPath = path.join(repoRoot, 'reports', 'agent1-agent6-source-custody-decision-packet.json');
const outputMdPath = path.join(repoRoot, 'reports', 'agent1-agent6-source-custody-decision-packet.md');

function readJson(fullPath) {
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(fullPath, value) {
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function bucketPaths(preflight, key) {
  return (preflight.dry_run_buckets?.[key]?.paths || []).map((row) => row.path);
}

function rowBySource(rows) {
  return new Map((rows || []).map((row) => [row.source_path, row]));
}

function untrackedDecisionRows(closure, preflight, bucketKey, closureBucket) {
  const bySource = rowBySource(closure.untracked_closure_options || []);
  return bucketPaths(preflight, bucketKey).map((sourcePath) => {
    const row = bySource.get(sourcePath) || {};
    return {
      source_path: sourcePath,
      work_id: row.work_id,
      units: row.units,
      license_counts: row.license_counts || {},
      visible_source_license_rows: row.visible_source_license_rows === true,
      downstream_direct_artifact_count: (row.downstream_direct_artifact_paths || []).length,
      downstream_content_reference_count: (row.downstream_content_reference_paths || []).length,
      required_missing_artifact_paths: row.required_missing_artifact_paths || [],
      closure_bucket: row.closure_bucket || closureBucket,
      source_fingerprint: row.source_fingerprint,
    };
  });
}

function modifiedDecisionRows(closure, preflight) {
  const bySource = rowBySource(closure.modified_tracked_closure_options || []);
  return bucketPaths(preflight, 'modified_tracked_license_label_sources').map((sourcePath) => {
    const row = bySource.get(sourcePath) || {};
    return {
      source_path: sourcePath,
      work_id: row.work_id,
      units_current: row.units_current,
      units_head: row.units_head,
      diff_count: row.diff_count,
      all_diffs_are_license_pd_to_public_domain: row.all_diffs_are_license_pd_to_public_domain === true,
      license_counts_current: row.license_counts_current || {},
      license_counts_head: row.license_counts_head || {},
      downstream_direct_artifact_count: (row.downstream_direct_artifact_paths || []).length,
      downstream_content_reference_count: (row.downstream_content_reference_paths || []).length,
      sample_diffs: row.sample_diffs || [],
      source_fingerprint: row.source_fingerprint,
    };
  });
}

function renderMarkdown(packet) {
  const lines = [];
  lines.push(
    '# Agent 1 -> Agent 6 Source Custody Decision Packet',
    '',
    `Generated: ${packet.generated_at}`,
    '',
    '## Boundary',
    '',
    '- This is an Agent 6 decision-input packet only.',
    '- It does not stage, track, delete, render, publish, or accept any source/provenance state.',
    `- Publication state: ${packet.boundary.publication_state}.`,
    '',
    '## Decision Questions',
    '',
  );
  for (const question of packet.agent6_decision_questions) lines.push(`- ${question}`);
  lines.push(
    '',
    '## Decision Inputs',
    '',
    `- Track-candidate untracked sources: ${packet.summary.track_candidate_source_files}`,
    `- Missing-manifest untracked sources: ${packet.summary.missing_manifest_source_files}`,
    `- Modified tracked license-label sources: ${packet.summary.modified_tracked_source_files}`,
    `- Blocked downstream direct artifact paths: ${packet.summary.blocked_downstream_direct_paths}`,
    `- Blocked downstream content-reference paths: ${packet.summary.blocked_downstream_content_reference_paths}`,
    '',
    '### Track-Candidate Untracked Sources',
    '',
    '| Source | Work | Units | Licenses | Direct artifacts | Content refs |',
    '| --- | --- | ---: | --- | ---: | ---: |',
  );
  for (const row of packet.track_candidate_source_review) {
    const licenses = Object.entries(row.license_counts).map(([license, count]) => `${license}: ${count}`).join('; ');
    lines.push(`| \`${row.source_path}\` | ${row.work_id} | ${row.units} | ${licenses} | ${row.downstream_direct_artifact_count} | ${row.downstream_content_reference_count} |`);
  }
  lines.push(
    '',
    '### Missing Lexical Manifest Sources',
    '',
    '| Source | Work | Missing manifest paths |',
    '| --- | --- | --- |',
  );
  for (const row of packet.missing_manifest_review) {
    lines.push(`| \`${row.source_path}\` | ${row.work_id} | ${row.required_missing_artifact_paths.map((item) => `\`${item}\``).join('<br>')} |`);
  }
  lines.push(
    '',
    '### Modified Tracked License-Label Drift Sources',
    '',
    '| Source | Work | Diff count | Current licenses | HEAD licenses |',
    '| --- | --- | ---: | --- | --- |',
  );
  for (const row of packet.modified_tracked_label_review) {
    const current = Object.entries(row.license_counts_current).map(([license, count]) => `${license}: ${count}`).join('; ');
    const head = Object.entries(row.license_counts_head).map(([license, count]) => `${license}: ${count}`).join('; ');
    lines.push(`| \`${row.source_path}\` | ${row.work_id} | ${row.diff_count} | ${current} | ${head} |`);
  }
  lines.push(
    '',
    '## Must Not Be Accepted From This Packet',
    '',
  );
  for (const item of packet.must_not_be_accepted) lines.push(`- ${item}`);
  lines.push('');
  return lines.join('\n');
}

for (const requiredPath of [custodyPacketPath, quarantineManifestPath, closurePath, preflightPath]) {
  if (!fs.existsSync(requiredPath)) {
    throw new Error(`Missing required custody artifact: ${path.relative(repoRoot, requiredPath)}`);
  }
}

const custodyPacket = readJson(custodyPacketPath);
const quarantineManifest = readJson(quarantineManifestPath);
const closure = readJson(closurePath);
const preflight = readJson(preflightPath);
const currentBlocker = fs.existsSync(currentBlockerPacketPath)
  ? readJson(currentBlockerPacketPath)
  : null;

const trackRows = untrackedDecisionRows(
  closure,
  preflight,
  'track_candidate_source_files_only',
  'track_candidate_requires_agent6_source_review',
);
const missingRows = untrackedDecisionRows(
  closure,
  preflight,
  'missing_manifest_source_files',
  'requires_missing_lexical_manifest_remediation_or_explicit_exclusion',
);
const modifiedRows = modifiedDecisionRows(closure, preflight);

const packet = {
  generated_at: new Date().toISOString(),
  artifact_type: 'agent1_agent6_source_custody_decision_packet',
  source_artifacts: {
    custody_packet: 'reports/agent1-source-provenance-custody-packet.json',
    downstream_quarantine_manifest: 'reports/agent1-downstream-quarantine-manifest.json',
    closure_options: 'reports/agent1-source-custody-closure-options.json',
    reconciliation_preflight: 'reports/agent1-source-custody-reconciliation-preflight.json',
  },
  boundary: {
    publication_state: 'blocked_no_render',
    source_provenance_acceptance_claimed: false,
    public_runtime_acceptance_claimed: false,
    route_publication_support_claimed: false,
    definition_authority_claimed: false,
    page_render_acceptance_claimed: false,
  },
  summary: {
    custody_source_rows: custodyPacket.summary?.source_rows,
    track_candidate_source_files: trackRows.length,
    missing_manifest_source_files: missingRows.length,
    modified_tracked_source_files: modifiedRows.length,
    blocked_downstream_direct_paths: quarantineManifest.summary?.direct_artifact_rows,
    blocked_downstream_content_reference_paths: currentBlocker?.downstream_reliance?.blocked_content_reference_paths
      || quarantineManifest.summary?.content_reference_rows,
  },
  agent6_decision_questions: [
    'Can the 17 untracked source files with lexical manifests proceed to source-file tracking review, with downstream artifacts still blocked until separate acceptance?',
    'For the 6 untracked source files missing lexical manifests, should Agent 1 generate missing manifests or explicitly exclude/quarantine downstream reliance?',
    'Can the 6 modified tracked source files be accepted as PD-to-Public-Domain license-label normalization drift only?',
    'Which downstream direct artifacts and content references must remain blocked after each source decision?',
  ],
  track_candidate_source_review: trackRows,
  missing_manifest_review: missingRows,
  modified_tracked_label_review: modifiedRows,
  must_not_be_accepted: custodyPacket.must_not_be_accepted || closure.must_not_be_accepted || [],
};

writeJson(outputJsonPath, packet);
fs.writeFileSync(outputMdPath, renderMarkdown(packet), 'utf8');
console.log(JSON.stringify({
  ok: true,
  output_json: path.relative(repoRoot, outputJsonPath).replace(/\\/g, '/'),
  output_md: path.relative(repoRoot, outputMdPath).replace(/\\/g, '/'),
  summary: packet.summary,
  boundary: packet.boundary,
}, null, 2));

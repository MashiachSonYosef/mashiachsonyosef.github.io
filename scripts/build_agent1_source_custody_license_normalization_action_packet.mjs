import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const PATHS = {
  custodyPacket: 'reports/agent1-source-provenance-custody-packet.json',
  packetC: 'reports/agent1-source-custody-packet-c-license-label-normalization.json',
  decisionPacket: 'reports/agent1-agent6-source-custody-decision-packet.json',
  outputJson: 'reports/agent1-source-custody-license-normalization-action-packet.json',
  outputMd: 'reports/agent1-source-custody-license-normalization-action-packet.md'
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
  const packetC = readJson(PATHS.packetC);
  const decision = readJson(PATHS.decisionPacket);

  const rows = custody.modified_tracked_drift || [];
  assert(rows.length === 6, 'expected six modified tracked source rows');
  assert(packetC.summary.modified_tracked_source_files === 6, 'Packet C must contain six modified tracked source rows');
  assert(packetC.summary.total_non_license_diff_count === 0, 'Packet C must have zero non-license diffs');
  assert(packetC.summary.total_non_pd_to_public_domain_diff_count === 0, 'Packet C must have zero non-PD-to-Public-Domain diffs');

  const normalizedRows = rows.map((row) => {
    const directPaths = flattenDirectArtifacts(row.direct_artifacts);
    const contentReferenceRows = flattenContentHits(row.content_hits);
    return {
      source_path: row.source_path,
      work_id: row.work_id,
      work_slug: row.work_slug,
      units_current: row.units_current,
      units_head: row.units_head,
      license_counts_current: row.license_counts_current,
      license_counts_head: row.license_counts_head,
      source_fingerprint: row.source_fingerprint,
      scalar_diff_count: row.diff_count,
      all_diffs_are_license_pd_to_public_domain: row.all_diffs_are_license_pd_to_public_domain,
      drift_summary: row.drift_summary,
      sample_diffs: row.sample_diffs,
      visible_source_license_rows: row.page_evidence?.visible_source_license_rows === true,
      direct_downstream_artifact_paths: directPaths,
      content_reference_rows: contentReferenceRows,
      content_reference_source_row_count: contentReferenceRows.length,
      content_reference_unique_path_count: new Set(contentReferenceRows.map((entry) => entry.path)).size,
      proposed_disposition: 'license_label_normalization_review_only',
      remains_blocked_after_packet: true
    };
  });

  const totalScalarDiffs = normalizedRows.reduce((sum, row) => sum + row.scalar_diff_count, 0);
  const directPathSet = new Set(normalizedRows.flatMap((row) => row.direct_downstream_artifact_paths));
  const contentReferenceRows = normalizedRows.flatMap((row) => row.content_reference_rows);
  const uniqueContentPaths = new Set(contentReferenceRows.map((entry) => entry.path));

  const packet = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent1_source_custody_license_normalization_action_packet',
    source_artifacts: {
      custodyPacket: PATHS.custodyPacket,
      packetC: PATHS.packetC,
      decisionPacket: PATHS.decisionPacket
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
      modified_tracked_source_files: normalizedRows.length,
      total_scalar_diff_count: totalScalarDiffs,
      total_non_license_diff_count: packetC.summary.total_non_license_diff_count,
      total_non_pd_to_public_domain_diff_count: packetC.summary.total_non_pd_to_public_domain_diff_count,
      all_diffs_are_license_fields: packetC.summary.all_diffs_are_license_fields,
      all_diffs_are_pd_to_public_domain: packetC.summary.all_diffs_are_pd_to_public_domain,
      direct_downstream_artifact_paths: directPathSet.size,
      content_reference_source_rows: contentReferenceRows.length,
      unique_content_reference_paths: uniqueContentPaths.size,
      visible_source_license_row_gaps: normalizedRows.filter((row) => !row.visible_source_license_rows).length,
      decision_packet_modified_tracked_source_files: decision.summary.modified_tracked_source_files
    },
    proposed_action_boundary: {
      action: 'Agent 6 review of license-label normalization evidence only',
      downstream_direct_artifacts_remain_blocked: true,
      downstream_content_references_remain_blocked: true,
      no_staging_performed: true,
      no_source_acceptance_claimed: true
    },
    modified_tracked_sources: normalizedRows,
    what_must_not_be_accepted: MUST_NOT_ACCEPT
  };

  writeJson(PATHS.outputJson, packet);
  writeText(PATHS.outputMd, `# Agent 1 Source Custody License Normalization Action Packet

Generated: ${packet.generated_at}

Boundary: evidence-ready / awaiting-Agent-6 only. This packet documents the six modified tracked source files whose parsed JSON drift is limited to unit license labels changing from \`PD\` to \`Public Domain\`. It does not stage, commit, merge, publish, render, or accept source/provenance state.

## Summary

- Modified tracked source files: ${packet.summary.modified_tracked_source_files}
- Total scalar diffs: ${packet.summary.total_scalar_diff_count}
- Non-license diffs: ${packet.summary.total_non_license_diff_count}
- Non-\`PD\` to \`Public Domain\` diffs: ${packet.summary.total_non_pd_to_public_domain_diff_count}
- Direct downstream artifact paths: ${packet.summary.direct_downstream_artifact_paths}
- Content-reference source rows: ${packet.summary.content_reference_source_rows}
- Unique content-reference paths: ${packet.summary.unique_content_reference_paths}
- Visible source/license row gaps: ${packet.summary.visible_source_license_row_gaps}

## Modified Tracked Source Files

${formatList(sorted(normalizedRows.map((row) => row.source_path)))}

## Required Boundary

- No staging performed.
- No source/provenance acceptance claimed.
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

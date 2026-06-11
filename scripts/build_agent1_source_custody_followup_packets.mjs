import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const REPORT_DIR = 'reports';

const PATHS = {
  custodyPacket: 'reports/agent1-source-provenance-custody-packet.json',
  closureOptions: 'reports/agent1-source-custody-closure-options.json',
  reconciliationPreflight: 'reports/agent1-source-custody-reconciliation-preflight.json',
  decisionPacket: 'reports/agent1-agent6-source-custody-decision-packet.json',
  verdict: 'reports/agent6-agent1-source-custody-closure-decision-verdict-2026-06-02.md',
  packetAJson: 'reports/agent1-source-custody-packet-a-tracking-review.json',
  packetAMd: 'reports/agent1-source-custody-packet-a-tracking-review.md',
  packetBJson: 'reports/agent1-source-custody-packet-b-missing-manifest.json',
  packetBMd: 'reports/agent1-source-custody-packet-b-missing-manifest.md',
  packetCJson: 'reports/agent1-source-custody-packet-c-license-label-normalization.json',
  packetCMd: 'reports/agent1-source-custody-packet-c-license-label-normalization.md',
  indexJson: 'reports/agent1-source-custody-followup-packets-index.json',
  indexMd: 'reports/agent1-source-custody-followup-packets-index.md'
};

const REQUIRED_MODIFIED_TRACKED = [
  'data/sources/abarbanel-on-guide-for-the-perplexed.json',
  'data/sources/crescas-on-guide-for-the-perplexed.json',
  'data/sources/efodi-on-guide-for-the-perplexed.json',
  'data/sources/narboni-on-guide-for-the-perplexed.json',
  'data/sources/shem-tov-on-guide-for-the-perplexed.json',
  'data/sources/yahel-ohr-on-zohar.json'
];

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

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeMd(path, value) {
  fs.writeFileSync(path, value, 'utf8');
}

function sha256File(path) {
  return crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
}

function gitHeadJson(path) {
  const raw = execFileSync('git', ['show', `HEAD:${path}`], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 80 * 1024 * 1024
  });
  return JSON.parse(raw);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function collectScalarDiffs(current, head, path = '$', out = []) {
  if (Array.isArray(current) || Array.isArray(head)) {
    const max = Math.max(Array.isArray(current) ? current.length : 0, Array.isArray(head) ? head.length : 0);
    for (let i = 0; i < max; i += 1) {
      collectScalarDiffs(current?.[i], head?.[i], `${path}[${i}]`, out);
    }
    return out;
  }
  if (isPlainObject(current) || isPlainObject(head)) {
    const keys = new Set([...Object.keys(current || {}), ...Object.keys(head || {})]);
    for (const key of [...keys].sort()) {
      collectScalarDiffs(current?.[key], head?.[key], `${path}.${key}`, out);
    }
    return out;
  }
  if (current !== head) {
    out.push({ path, head, current });
  }
  return out;
}

function summarizeLicenseLabelDiff(sourcePath) {
  const current = readJson(sourcePath);
  const head = gitHeadJson(sourcePath);
  const diffs = collectScalarDiffs(current, head);
  const nonLicenseDiffs = diffs.filter((diff) => !/(\.|^)license$/i.test(diff.path));
  const nonPdToPublicDomainDiffs = diffs.filter((diff) => diff.head !== 'PD' || diff.current !== 'Public Domain');
  return {
    source_path: sourcePath,
    scalar_diff_count: diffs.length,
    all_diffs_are_license_fields: nonLicenseDiffs.length === 0,
    all_diffs_are_pd_to_public_domain: nonPdToPublicDomainDiffs.length === 0,
    non_license_diff_count: nonLicenseDiffs.length,
    non_pd_to_public_domain_diff_count: nonPdToPublicDomainDiffs.length,
    sample_diffs: diffs.slice(0, 5)
  };
}

function rowsByPath(rows) {
  return new Map(rows.map((row) => [row.source_path, row]));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function sourceRowForClosure(row) {
  return {
    source_path: row.source_path,
    work_id: row.work_id,
    work_slug: row.work_slug,
    source_fingerprint: row.source_fingerprint,
    units: row.units ?? row.units_current,
    license_counts: row.license_counts ?? row.license_counts_current,
    public_page: row.public_page,
    visible_source_license_rows: row.visible_source_license_rows,
    route_hud_or_public_lexical_reliance: row.route_hud_or_public_lexical_reliance,
    downstream_direct_artifact_paths: row.downstream_direct_artifact_paths || [],
    downstream_content_reference_paths: row.downstream_content_reference_paths || [],
    acceptance_boundary: row.acceptance_boundary || 'evidence only; no source/provenance acceptance or downstream acceptance claimed'
  };
}

function mdList(items) {
  if (!items.length) return '- none\n';
  return items.map((item) => `- \`${item}\``).join('\n') + '\n';
}

function writePacketA(packet) {
  const rows = packet.track_candidate_sources;
  const lines = [
    '# Agent 1 Source Custody Packet A: Tracking Review Candidates',
    '',
    `Generated: ${packet.generated_at}`,
    '',
    'Boundary: evidence-ready / awaiting-Agent-6 only. No staging, tracking, commit, render, publication, source/provenance acceptance, or downstream acceptance is claimed.',
    '',
    '## Summary',
    '',
    `- Track candidate source files: ${packet.summary.track_candidate_source_files}`,
    `- Total units: ${packet.summary.total_units}`,
    `- Blocked downstream direct paths: ${packet.summary.blocked_downstream_direct_paths}`,
    `- Blocked downstream content references: ${packet.summary.blocked_downstream_content_reference_paths}`,
    '',
    '## Source Files',
    ''
  ];
  for (const row of rows) {
    lines.push(`### ${row.source_path}`);
    lines.push('');
    lines.push(`- Work ID: \`${row.work_id}\``);
    lines.push(`- Units: ${row.units}`);
    lines.push(`- License counts: \`${JSON.stringify(row.license_counts)}\``);
    lines.push(`- SHA-256: \`${row.source_fingerprint.sha256}\``);
    lines.push(`- Direct downstream paths: ${row.downstream_direct_artifact_paths.length}`);
    lines.push(`- Content-reference paths: ${row.downstream_content_reference_paths.length}`);
    lines.push('- Remains blocked after tracking review unless Agent 6 dockets a narrower downstream release.');
    lines.push('');
  }
  lines.push('## Must Not Be Accepted');
  lines.push('');
  lines.push(...packet.must_not_be_accepted.map((item) => `- ${item}`));
  lines.push('');
  writeMd(PATHS.packetAMd, `${lines.join('\n')}\n`);
}

function writePacketB(packet) {
  const lines = [
    '# Agent 1 Source Custody Packet B: Missing Lexical Manifest Remediation Or Exclusion',
    '',
    `Generated: ${packet.generated_at}`,
    '',
    'Boundary: evidence-ready / awaiting-Agent-6 only. These sources remain blocked pending missing manifest remediation or explicit exclusion/quarantine.',
    '',
    '## Summary',
    '',
    `- Missing-manifest source files: ${packet.summary.missing_manifest_source_files}`,
    `- Expected lexical manifest paths: ${packet.summary.expected_lexical_manifest_paths}`,
    `- Blocked downstream direct paths: ${packet.summary.blocked_downstream_direct_paths}`,
    `- Blocked downstream content references: ${packet.summary.blocked_downstream_content_reference_paths}`,
    '',
    '## Missing Manifest Sources',
    ''
  ];
  for (const row of packet.missing_manifest_sources) {
    lines.push(`### ${row.source_path}`);
    lines.push('');
    lines.push(`- Work ID: \`${row.work_id}\``);
    lines.push(`- Units: ${row.units}`);
    lines.push(`- License counts: \`${JSON.stringify(row.license_counts)}\``);
    lines.push(`- SHA-256: \`${row.source_fingerprint.sha256}\``);
    lines.push('- Expected missing manifest paths:');
    lines.push(mdList(row.expected_lexical_manifest_paths));
    lines.push(`- Direct downstream paths: ${row.downstream_direct_artifact_paths.length}`);
    lines.push(`- Content-reference paths: ${row.downstream_content_reference_paths.length}`);
    lines.push('- Required next step: generate and validate missing lexical manifest, or produce explicit exclusion/quarantine for this source and downstream reliance.');
    lines.push('');
  }
  lines.push('## Must Not Be Accepted');
  lines.push('');
  lines.push(...packet.must_not_be_accepted.map((item) => `- ${item}`));
  lines.push('');
  writeMd(PATHS.packetBMd, `${lines.join('\n')}\n`);
}

function writePacketC(packet) {
  const lines = [
    '# Agent 1 Source Custody Packet C: License Label Normalization Review',
    '',
    `Generated: ${packet.generated_at}`,
    '',
    'Boundary: evidence-ready / awaiting-Agent-6 only. This packet proves classification of current tracked-source drift; it does not stage, accept, or publish the modified files.',
    '',
    '## Summary',
    '',
    `- Modified tracked source files: ${packet.summary.modified_tracked_source_files}`,
    `- Total scalar diffs: ${packet.summary.total_scalar_diff_count}`,
    `- Non-license scalar diffs: ${packet.summary.total_non_license_diff_count}`,
    `- Non-PD-to-Public-Domain scalar diffs: ${packet.summary.total_non_pd_to_public_domain_diff_count}`,
    `- Blocked downstream direct paths: ${packet.summary.blocked_downstream_direct_paths}`,
    `- Blocked downstream content references: ${packet.summary.blocked_downstream_content_reference_paths}`,
    '',
    '## Modified Tracked Sources',
    ''
  ];
  for (const row of packet.modified_tracked_sources) {
    lines.push(`### ${row.source_path}`);
    lines.push('');
    lines.push(`- Work ID: \`${row.work_id}\``);
    lines.push(`- Current units: ${row.units_current}`);
    lines.push(`- HEAD units: ${row.units_head}`);
    lines.push(`- Current license counts: \`${JSON.stringify(row.license_counts_current)}\``);
    lines.push(`- HEAD license counts: \`${JSON.stringify(row.license_counts_head)}\``);
    lines.push(`- SHA-256: \`${row.source_fingerprint.sha256}\``);
    lines.push(`- Scalar diffs: ${row.scalar_diff_proof.scalar_diff_count}`);
    lines.push(`- All diffs are license fields: ${row.scalar_diff_proof.all_diffs_are_license_fields}`);
    lines.push(`- All diffs are PD to Public Domain: ${row.scalar_diff_proof.all_diffs_are_pd_to_public_domain}`);
    lines.push(`- Direct downstream paths: ${row.downstream_direct_artifact_paths.length}`);
    lines.push(`- Content-reference paths: ${row.downstream_content_reference_paths.length}`);
    lines.push('');
  }
  lines.push('## Must Not Be Accepted');
  lines.push('');
  lines.push(...packet.must_not_be_accepted.map((item) => `- ${item}`));
  lines.push('');
  writeMd(PATHS.packetCMd, `${lines.join('\n')}\n`);
}

function writeIndex(packetA, packetB, packetC, index) {
  const lines = [
    '# Agent 1 Source Custody Follow-Up Packets Index',
    '',
    `Generated: ${index.generated_at}`,
    '',
    'This index records the three Agent 6-requested follow-up packets after the 2026-06-02 source custody closure disposition-control verdict.',
    '',
    '## Packets',
    '',
    `- Packet A: \`${PATHS.packetAJson}\` / \`${PATHS.packetAMd}\` (${packetA.summary.track_candidate_source_files} source files)`,
    `- Packet B: \`${PATHS.packetBJson}\` / \`${PATHS.packetBMd}\` (${packetB.summary.missing_manifest_source_files} source files)`,
    `- Packet C: \`${PATHS.packetCJson}\` / \`${PATHS.packetCMd}\` (${packetC.summary.modified_tracked_source_files} source files)`,
    '',
    '## Boundary',
    '',
    '- Agent 1 status: evidence-ready / awaiting-Agent-6.',
    '- Publication state: blocked_no_render.',
    '- No source/provenance acceptance, source-file tracking approval, staging, publication, public/runtime acceptance, route publication support, Definition authority, or accepted translation text is claimed.',
    ''
  ];
  writeMd(PATHS.indexMd, `${lines.join('\n')}\n`);
}

function main() {
  for (const path of Object.values(PATHS).filter((p) => p.endsWith('.json') || p.endsWith('.md'))) {
    if (path.startsWith('reports/') && !fs.existsSync(REPORT_DIR)) {
      fs.mkdirSync(REPORT_DIR, { recursive: true });
    }
  }

  const now = new Date().toISOString();
  const custodyPacket = readJson(PATHS.custodyPacket);
  const closureOptions = readJson(PATHS.closureOptions);
  const preflight = readJson(PATHS.reconciliationPreflight);
  const decisionPacket = readJson(PATHS.decisionPacket);
  const manifest = readJson('reports/agent1-downstream-quarantine-manifest.json');

  const closureUntracked = closureOptions.untracked_closure_options || [];
  const closureModified = closureOptions.modified_tracked_closure_options || [];
  const trackRows = closureUntracked
    .filter((row) => row.closure_bucket === 'track_candidate_requires_agent6_source_review')
    .sort((a, b) => a.source_path.localeCompare(b.source_path));
  const missingRows = closureUntracked
    .filter((row) => row.closure_bucket === 'requires_missing_lexical_manifest_remediation_or_explicit_exclusion')
    .sort((a, b) => a.source_path.localeCompare(b.source_path));
  const modifiedRows = closureModified
    .filter((row) => row.closure_bucket === 'license_label_normalization_review_required')
    .sort((a, b) => a.source_path.localeCompare(b.source_path));

  assert(trackRows.length === 17, `expected 17 tracking-review candidates, got ${trackRows.length}`);
  assert(missingRows.length === 6, `expected 6 missing-manifest rows, got ${missingRows.length}`);
  assert(modifiedRows.length === 6, `expected 6 modified tracked rows, got ${modifiedRows.length}`);
  assert(JSON.stringify(modifiedRows.map((row) => row.source_path)) === JSON.stringify([...REQUIRED_MODIFIED_TRACKED].sort()), 'modified tracked source set mismatch');

  const trackSources = trackRows.map((row) => ({
    ...sourceRowForClosure(row),
    downstream_direct_artifact_paths: [...new Set(row.downstream_direct_artifact_paths || [])].sort(),
    downstream_content_reference_paths: [...new Set(row.downstream_content_reference_paths || [])].sort(),
    proposed_next_packet: 'source-file tracking review packet',
    remains_blocked_after_packet: true
  }));

  const missingSources = missingRows.map((row) => ({
    ...sourceRowForClosure(row),
    expected_lexical_manifest_paths: row.required_missing_artifact_paths || row.required_missing_artifacts || [],
    downstream_direct_artifact_paths: [...new Set(row.downstream_direct_artifact_paths || [])].sort(),
    downstream_content_reference_paths: [...new Set(row.downstream_content_reference_paths || [])].sort(),
    allowed_next_steps: [
      'generate and validate missing lexical manifest',
      'explicitly exclude/quarantine this source and all downstream reliance'
    ],
    remains_blocked_after_packet: true
  }));

  const modifiedSources = modifiedRows.map((row) => {
    const scalarDiffProof = summarizeLicenseLabelDiff(row.source_path);
    assert(row.diff_count === scalarDiffProof.scalar_diff_count, `diff count mismatch for ${row.source_path}: packet ${row.diff_count}, proof ${scalarDiffProof.scalar_diff_count}`);
    assert(scalarDiffProof.all_diffs_are_license_fields, `non-license diff found in ${row.source_path}`);
    assert(scalarDiffProof.all_diffs_are_pd_to_public_domain, `non-PD-to-Public-Domain diff found in ${row.source_path}`);
    return {
      ...sourceRowForClosure(row),
      units_current: row.units_current,
      units_head: row.units_head,
      license_counts_current: row.license_counts_current,
      license_counts_head: row.license_counts_head,
      diff_count_from_closure_packet: row.diff_count,
      scalar_diff_proof: scalarDiffProof,
      downstream_direct_artifact_paths: [...new Set(row.downstream_direct_artifact_paths || [])].sort(),
      downstream_content_reference_paths: [...new Set(row.downstream_content_reference_paths || [])].sort(),
      proposed_next_packet: 'license-label normalization review packet',
      remains_blocked_after_packet: true
    };
  });

  const packetA = {
    generated_at: now,
    artifact_type: 'agent1_source_custody_packet_a_tracking_review_candidates',
    source_artifacts: PATHS,
    source_verdict: PATHS.verdict,
    boundary: BOUNDARY,
    summary: {
      track_candidate_source_files: trackSources.length,
      total_units: trackSources.reduce((sum, row) => sum + (row.units || 0), 0),
      blocked_downstream_direct_paths: new Set(trackSources.flatMap((row) => row.downstream_direct_artifact_paths)).size,
      blocked_downstream_content_reference_paths: new Set(trackSources.flatMap((row) => row.downstream_content_reference_paths)).size
    },
    track_candidate_sources: trackSources,
    must_not_be_accepted: MUST_NOT_BE_ACCEPTED
  };

  const packetB = {
    generated_at: now,
    artifact_type: 'agent1_source_custody_packet_b_missing_manifest_remediation_or_exclusion',
    source_artifacts: PATHS,
    source_verdict: PATHS.verdict,
    boundary: BOUNDARY,
    summary: {
      missing_manifest_source_files: missingSources.length,
      expected_lexical_manifest_paths: new Set(missingSources.flatMap((row) => row.expected_lexical_manifest_paths)).size,
      total_units: missingSources.reduce((sum, row) => sum + (row.units || 0), 0),
      blocked_downstream_direct_paths: new Set(missingSources.flatMap((row) => row.downstream_direct_artifact_paths)).size,
      blocked_downstream_content_reference_paths: new Set(missingSources.flatMap((row) => row.downstream_content_reference_paths)).size
    },
    missing_manifest_sources: missingSources,
    must_not_be_accepted: MUST_NOT_BE_ACCEPTED
  };

  const totalScalarDiffCount = modifiedSources.reduce((sum, row) => sum + row.scalar_diff_proof.scalar_diff_count, 0);
  const totalNonLicenseDiffCount = modifiedSources.reduce((sum, row) => sum + row.scalar_diff_proof.non_license_diff_count, 0);
  const totalNonPdToPublicDomainDiffCount = modifiedSources.reduce((sum, row) => sum + row.scalar_diff_proof.non_pd_to_public_domain_diff_count, 0);
  const packetC = {
    generated_at: now,
    artifact_type: 'agent1_source_custody_packet_c_license_label_normalization',
    source_artifacts: PATHS,
    source_verdict: PATHS.verdict,
    boundary: BOUNDARY,
    summary: {
      modified_tracked_source_files: modifiedSources.length,
      total_scalar_diff_count: totalScalarDiffCount,
      total_non_license_diff_count: totalNonLicenseDiffCount,
      total_non_pd_to_public_domain_diff_count: totalNonPdToPublicDomainDiffCount,
      all_diffs_are_license_fields: totalNonLicenseDiffCount === 0,
      all_diffs_are_pd_to_public_domain: totalNonPdToPublicDomainDiffCount === 0,
      blocked_downstream_direct_paths: new Set(modifiedSources.flatMap((row) => row.downstream_direct_artifact_paths)).size,
      blocked_downstream_content_reference_paths: new Set(modifiedSources.flatMap((row) => row.downstream_content_reference_paths)).size
    },
    modified_tracked_sources: modifiedSources,
    must_not_be_accepted: MUST_NOT_BE_ACCEPTED
  };

  assert(packetA.summary.blocked_downstream_direct_paths === preflight.summary.track_candidate_downstream_direct_paths, 'Packet A direct downstream count does not match preflight');
  assert(packetB.summary.blocked_downstream_direct_paths === preflight.summary.missing_manifest_downstream_direct_paths, 'Packet B direct downstream count does not match preflight');
  assert(packetC.summary.blocked_downstream_direct_paths === preflight.summary.modified_tracked_downstream_direct_paths, 'Packet C direct downstream count does not match preflight');
  assert(totalScalarDiffCount === 1406, `expected 1406 total scalar diffs for Packet C, got ${totalScalarDiffCount}`);

  const index = {
    generated_at: now,
    artifact_type: 'agent1_source_custody_followup_packets_index',
    source_verdict: PATHS.verdict,
    source_artifacts: {
      custody_packet: PATHS.custodyPacket,
      closure_options: PATHS.closureOptions,
      reconciliation_preflight: PATHS.reconciliationPreflight,
      decision_packet: PATHS.decisionPacket
    },
    packets: {
      packet_a_tracking_review_candidates: {
        json: PATHS.packetAJson,
        md: PATHS.packetAMd,
        summary: packetA.summary
      },
      packet_b_missing_manifest_remediation_or_exclusion: {
        json: PATHS.packetBJson,
        md: PATHS.packetBMd,
        summary: packetB.summary
      },
      packet_c_license_label_normalization: {
        json: PATHS.packetCJson,
        md: PATHS.packetCMd,
        summary: packetC.summary
      }
    },
    boundary: BOUNDARY,
    must_not_be_accepted: MUST_NOT_BE_ACCEPTED
  };

  writeJson(PATHS.packetAJson, packetA);
  writeJson(PATHS.packetBJson, packetB);
  writeJson(PATHS.packetCJson, packetC);
  writeJson(PATHS.indexJson, index);
  writePacketA(packetA);
  writePacketB(packetB);
  writePacketC(packetC);
  writeIndex(packetA, packetB, packetC, index);

  console.log(JSON.stringify({
    ok: true,
    generated_at: now,
    packets: index.packets,
    boundary: BOUNDARY
  }, null, 2));
}

main();

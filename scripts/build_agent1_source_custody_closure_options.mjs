#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const packetPath = path.join(repoRoot, 'reports', 'agent1-source-provenance-custody-packet.json');
const outputJsonPath = path.join(repoRoot, 'reports', 'agent1-source-custody-closure-options.json');
const outputMdPath = path.join(repoRoot, 'reports', 'agent1-source-custody-closure-options.md');

function readJson(fullPath) {
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(fullPath, value) {
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function yesNo(value) {
  return value ? 'yes' : 'no';
}

function hasAnyContentReliance(row) {
  const hits = row.content_hits || {};
  return [
    ...(hits.route_cards_or_hud_surfaces || []),
    ...(hits.reader_workbench_artifacts || []),
    ...(hits.translation_memory_paths || []),
    ...(hits.public_lexical_exports || []),
  ].length > 0;
}

function missingArtifactKinds(row) {
  const missing = [];
  for (const [kind, artifact] of Object.entries(row.direct_artifacts || {})) {
    if (kind === 'lexical_token_index_by_id' || kind === 'public_lexical_by_work_jsonl' || kind === 'coverage_report') continue;
    if (!artifact?.exists) missing.push(kind);
  }
  return missing;
}

function missingRequiredArtifacts(row) {
  const missing = [];
  if (!row.direct_artifacts?.overlay_json?.exists) missing.push('overlay_json');
  if (!row.direct_artifacts?.public_page?.exists) missing.push('public_page');
  if (!row.direct_artifacts?.lexical_manifest?.exists) missing.push('lexical_manifest');
  return missing;
}

function sourceSummary(row) {
  return {
    source_path: row.source_path,
    work_id: row.work_id,
    work_slug: row.work_slug,
    source_fingerprint: row.source_fingerprint,
    units: row.units ?? row.units_current,
    license_counts: row.license_counts || row.license_counts_current || {},
    public_page: row.direct_artifacts?.public_page?.path || null,
    visible_source_license_rows: row.page_evidence?.visible_source_license_rows === true,
    route_hud_or_public_lexical_reliance: hasAnyContentReliance(row),
  };
}

function untrackedClosureRow(row) {
  const requiredMissing = missingRequiredArtifacts(row);
  const missingKinds = missingArtifactKinds(row);
  const hasManifest = row.direct_artifacts?.lexical_manifest?.exists === true;
  const requiredMissingPaths = requiredMissing.map((kind) => (
    kind === 'lexical_manifest'
      ? missingLexicalManifestPath(row)
      : row.direct_artifacts?.[kind]?.path || kind
  ));
  return {
    ...sourceSummary(row),
    current_disposition: row.disposition || 'quarantine',
    closure_bucket: hasManifest
      ? 'track_candidate_requires_agent6_source_review'
      : 'requires_missing_lexical_manifest_remediation_or_explicit_exclusion',
    required_missing_artifacts: requiredMissing,
    required_missing_artifact_paths: requiredMissingPaths,
    other_missing_artifacts: missingKinds.filter((kind) => !requiredMissing.includes(kind)),
    downstream_direct_artifact_paths: directArtifactPaths(row),
    downstream_content_reference_paths: contentReferencePaths(row),
    mechanical_next_step: hasManifest
      ? 'If source policy allows, track this source file and keep downstream artifacts blocked until Agent 6 source/provenance review.'
      : 'Generate the missing lexical manifest or explicitly exclude/quarantine all downstream reliance before any source/provenance or route/HUD claim.',
    acceptance_boundary: 'No source/provenance acceptance, publication support, route support, or page/render acceptance is claimed by this closure option.',
  };
}

function modifiedClosureRow(row) {
  return {
    ...sourceSummary(row),
    current_disposition: row.disposition || 'modified_tracked_drift_blocked_until_Agent6_review',
    closure_bucket: row.all_diffs_are_license_pd_to_public_domain
      ? 'license_label_normalization_review_required'
      : 'non_license_drift_review_required',
    units_current: row.units_current,
    units_head: row.units_head,
    diff_count: row.diff_count,
    all_diffs_are_license_pd_to_public_domain: row.all_diffs_are_license_pd_to_public_domain === true,
    license_counts_current: row.license_counts_current || {},
    license_counts_head: row.license_counts_head || {},
    sample_diffs: row.sample_diffs || [],
    downstream_direct_artifact_paths: directArtifactPaths(row),
    downstream_content_reference_paths: contentReferencePaths(row),
    mechanical_next_step: row.all_diffs_are_license_pd_to_public_domain
      ? 'Ask Agent 6 to review whether PD-to-Public-Domain unit license label normalization is acceptable source-drift disposition.'
      : 'Keep blocked and inspect non-license drift before any source/provenance custody claim.',
    acceptance_boundary: 'No acceptance of the modified tracked source file or its downstream artifacts is claimed by this closure option.',
  };
}

function directArtifactPaths(row) {
  return Object.values(row.direct_artifacts || {})
    .filter((artifact) => artifact?.exists && artifact.path)
    .map((artifact) => artifact.path)
    .sort((a, b) => a.localeCompare(b));
}

function contentReferencePaths(row) {
  const hits = row.content_hits || {};
  return [
    ...(hits.route_cards_or_hud_surfaces || []),
    ...(hits.reader_workbench_artifacts || []),
    ...(hits.translation_memory_paths || []),
    ...(hits.public_lexical_exports || []),
  ].sort((a, b) => a.localeCompare(b));
}

function missingLexicalManifestPath(row) {
  return row.direct_artifacts?.lexical_manifest?.path || `data/lexical/${row.work_id}.manifest.json`;
}

function buildReconciliationBatches(untrackedOptions, modifiedOptions) {
  const trackCandidates = untrackedOptions.filter((row) => row.closure_bucket === 'track_candidate_requires_agent6_source_review');
  const missingManifest = untrackedOptions.filter((row) => row.closure_bucket === 'requires_missing_lexical_manifest_remediation_or_explicit_exclusion');
  const modifiedLabelOnly = modifiedOptions.filter((row) => row.closure_bucket === 'license_label_normalization_review_required');
  return {
    untracked_track_candidate_source_files: {
      count: trackCandidates.length,
      source_paths: trackCandidates.map((row) => row.source_path),
      total_units: trackCandidates.reduce((sum, row) => sum + (row.units || 0), 0),
      downstream_direct_artifact_paths: trackCandidates.flatMap((row) => row.downstream_direct_artifact_paths || []),
      downstream_content_reference_paths: [...new Set(trackCandidates.flatMap((row) => row.downstream_content_reference_paths || []))].sort((a, b) => a.localeCompare(b)),
      action: 'Agent 6 may review these as mechanical track candidates; Agent 1 is not staging, tracking, or accepting them in this packet.',
    },
    untracked_missing_lexical_manifest_source_files: {
      count: missingManifest.length,
      source_paths: missingManifest.map((row) => row.source_path),
      expected_lexical_manifest_paths: missingManifest.flatMap((row) => row.required_missing_artifact_paths || []),
      total_units: missingManifest.reduce((sum, row) => sum + (row.units || 0), 0),
      downstream_direct_artifact_paths: missingManifest.flatMap((row) => row.downstream_direct_artifact_paths || []),
      downstream_content_reference_paths: [...new Set(missingManifest.flatMap((row) => row.downstream_content_reference_paths || []))].sort((a, b) => a.localeCompare(b)),
      action: 'Generate missing lexical manifests or explicitly exclude downstream reliance before any source/provenance or route/HUD claim.',
    },
    modified_tracked_license_label_normalization_files: {
      count: modifiedLabelOnly.length,
      source_paths: modifiedLabelOnly.map((row) => row.source_path),
      total_diff_count: modifiedLabelOnly.reduce((sum, row) => sum + (row.diff_count || 0), 0),
      downstream_direct_artifact_paths: modifiedLabelOnly.flatMap((row) => row.downstream_direct_artifact_paths || []),
      downstream_content_reference_paths: [...new Set(modifiedLabelOnly.flatMap((row) => row.downstream_content_reference_paths || []))].sort((a, b) => a.localeCompare(b)),
      action: 'Agent 6 must separately review whether PD-to-Public-Domain unit label normalization is acceptable source-drift disposition.',
    },
  };
}

function renderMarkdown(report) {
  const lines = [];
  lines.push(
    '# Agent 1 Source Custody Closure Options',
    '',
    `Generated: ${report.generated_at}`,
    '',
    '## Boundary',
    '',
    '- This is a closure-options evidence packet only.',
    '- It does not track files, delete files, render pages, or make publication/source acceptance claims.',
    `- Publication state: ${report.boundary.publication_state}.`,
    '- Agent 6 remains the source/provenance custody authority.',
    '',
    '## Summary',
    '',
    `- Untracked source files: ${report.summary.untracked_source_rows}`,
    `- Untracked track candidates with lexical manifests: ${report.summary.untracked_track_candidates_with_lexical_manifest}`,
    `- Untracked sources requiring missing lexical manifest remediation/exclusion: ${report.summary.untracked_requires_missing_lexical_manifest_remediation}`,
    `- Modified tracked source files: ${report.summary.modified_tracked_source_rows}`,
    `- Modified tracked files with only PD-to-Public-Domain label drift: ${report.summary.modified_tracked_license_label_only_rows}`,
    `- Track-candidate downstream direct artifact paths: ${report.reconciliation_batches.untracked_track_candidate_source_files.downstream_direct_artifact_paths.length}`,
    `- Track-candidate downstream content-reference paths: ${report.reconciliation_batches.untracked_track_candidate_source_files.downstream_content_reference_paths.length}`,
    `- Missing-manifest downstream direct artifact paths: ${report.reconciliation_batches.untracked_missing_lexical_manifest_source_files.downstream_direct_artifact_paths.length}`,
    `- Modified tracked downstream direct artifact paths: ${report.reconciliation_batches.modified_tracked_license_label_normalization_files.downstream_direct_artifact_paths.length}`,
    '',
    '## Reconciliation Batches',
    '',
    '### Untracked Track Candidates',
    '',
    `Action: ${report.reconciliation_batches.untracked_track_candidate_source_files.action}`,
    '',
  );
  for (const sourcePath of report.reconciliation_batches.untracked_track_candidate_source_files.source_paths) {
    lines.push(`- \`${sourcePath}\``);
  }
  lines.push(
    '',
    '### Untracked Missing Lexical Manifest Remediation',
    '',
    `Action: ${report.reconciliation_batches.untracked_missing_lexical_manifest_source_files.action}`,
    '',
  );
  for (const row of report.untracked_closure_options.filter((option) => option.closure_bucket === 'requires_missing_lexical_manifest_remediation_or_explicit_exclusion')) {
    lines.push(`- \`${row.source_path}\` -> missing \`${row.required_missing_artifact_paths.join('`, `')}\``);
  }
  lines.push(
    '',
    '### Modified Tracked License-Label Normalization Review',
    '',
    `Action: ${report.reconciliation_batches.modified_tracked_license_label_normalization_files.action}`,
    '',
  );
  for (const sourcePath of report.reconciliation_batches.modified_tracked_license_label_normalization_files.source_paths) {
    lines.push(`- \`${sourcePath}\``);
  }
  lines.push(
    '',
    '## Untracked Closure Buckets',
    '',
    '| Source | Work | Units | Licenses | Visible source/license | Downstream reliance | Bucket |',
    '| --- | --- | ---: | --- | --- | --- | --- |',
  );
  for (const row of report.untracked_closure_options) {
    const licenses = Object.entries(row.license_counts).map(([license, count]) => `${license}: ${count}`).join('; ');
    lines.push(`| \`${row.source_path}\` | ${row.work_id} | ${row.units} | ${licenses} | ${yesNo(row.visible_source_license_rows)} | ${yesNo(row.route_hud_or_public_lexical_reliance)} | ${row.closure_bucket} |`);
  }
  lines.push(
    '',
    '## Modified Tracked Drift Buckets',
    '',
    '| Source | Work | Diffs | Current licenses | HEAD licenses | Bucket |',
    '| --- | --- | ---: | --- | --- | --- |',
  );
  for (const row of report.modified_tracked_closure_options) {
    const current = Object.entries(row.license_counts_current).map(([license, count]) => `${license}: ${count}`).join('; ');
    const head = Object.entries(row.license_counts_head).map(([license, count]) => `${license}: ${count}`).join('; ');
    lines.push(`| \`${row.source_path}\` | ${row.work_id} | ${row.diff_count} | ${current} | ${head} | ${row.closure_bucket} |`);
  }
  lines.push(
    '',
    '## Required Agent 6 Review Questions',
    '',
  );
  for (const question of report.agent6_review_questions) lines.push(`- ${question}`);
  lines.push(
    '',
    '## Must Not Be Accepted From This Packet',
    '',
  );
  for (const item of report.must_not_be_accepted) lines.push(`- ${item}`);
  lines.push('');
  return lines.join('\n');
}

if (!fs.existsSync(packetPath)) {
  throw new Error(`Missing custody packet: ${path.relative(repoRoot, packetPath)}`);
}

const packet = readJson(packetPath);
const untracked = packet.untracked_dispositions || [];
const modified = packet.modified_tracked_drift || [];
const untrackedOptions = untracked.map(untrackedClosureRow);
const modifiedOptions = modified.map(modifiedClosureRow);
const reconciliationBatches = buildReconciliationBatches(untrackedOptions, modifiedOptions);
const report = {
  generated_at: new Date().toISOString(),
  artifact_type: 'agent1_source_custody_closure_options',
  source_packet: 'reports/agent1-source-provenance-custody-packet.json',
  boundary: {
    publication_state: 'blocked_no_render',
    source_provenance_acceptance_claimed: false,
    public_runtime_acceptance_claimed: false,
    route_publication_support_claimed: false,
    definition_authority_claimed: false,
    page_render_acceptance_claimed: false,
  },
  summary: {
    untracked_source_rows: untrackedOptions.length,
    untracked_track_candidates_with_lexical_manifest: untrackedOptions.filter((row) => row.closure_bucket === 'track_candidate_requires_agent6_source_review').length,
    untracked_requires_missing_lexical_manifest_remediation: untrackedOptions.filter((row) => row.closure_bucket === 'requires_missing_lexical_manifest_remediation_or_explicit_exclusion').length,
    modified_tracked_source_rows: modifiedOptions.length,
    modified_tracked_license_label_only_rows: modifiedOptions.filter((row) => row.closure_bucket === 'license_label_normalization_review_required').length,
  },
  reconciliation_batches: reconciliationBatches,
  untracked_closure_options: untrackedOptions,
  modified_tracked_closure_options: modifiedOptions,
  agent6_review_questions: [
    'For each untracked source file with complete required artifacts, should Agent 1 track it for source/provenance review or keep it quarantined?',
    'For each untracked source missing a lexical manifest, should Agent 1 generate the missing manifest or explicitly exclude downstream reliance?',
    'For the six modified tracked sources, can PD-to-Public-Domain unit license label normalization be accepted as source-drift disposition?',
    'Which downstream artifacts must remain blocked until the source file custody decision is made?',
  ],
  must_not_be_accepted: [
    'source/provenance acceptance',
    'publication readiness',
    'future publication support',
    'public/runtime acceptance',
    'Definition authority',
    'route publication support',
    'product/data gate acceptance',
    'accepted translation text',
    'page/render acceptance',
    'acceptance of the six modified tracked source files',
  ],
};

writeJson(outputJsonPath, report);
fs.writeFileSync(outputMdPath, renderMarkdown(report), 'utf8');
console.log(JSON.stringify({
  ok: true,
  output_json: path.relative(repoRoot, outputJsonPath).replace(/\\/g, '/'),
  output_md: path.relative(repoRoot, outputMdPath).replace(/\\/g, '/'),
  summary: report.summary,
  boundary: report.boundary,
}, null, 2));

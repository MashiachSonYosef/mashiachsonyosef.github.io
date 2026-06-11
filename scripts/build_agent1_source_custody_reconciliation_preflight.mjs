#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();
const closurePath = path.join(repoRoot, 'reports', 'agent1-source-custody-closure-options.json');
const outputJsonPath = path.join(repoRoot, 'reports', 'agent1-source-custody-reconciliation-preflight.json');
const outputMdPath = path.join(repoRoot, 'reports', 'agent1-source-custody-reconciliation-preflight.md');

function readJson(fullPath) {
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(fullPath, value) {
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function gitStatus(paths) {
  if (!paths.length) return new Map();
  const output = execFileSync('git', ['status', '--short', '--', ...paths], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 50,
  });
  const status = new Map();
  for (const rawLine of output.split(/\r?\n/).filter(Boolean)) {
    const code = rawLine.slice(0, 2);
    const filePath = rawLine.slice(3).replace(/\\/g, '/');
    status.set(filePath, code);
  }
  return status;
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function expandPathStatus(paths, statusMap) {
  return paths.map((filePath) => ({
    path: filePath,
    git_status: statusMap.get(filePath) || 'clean_or_directory_expansion_required',
  }));
}

function renderMarkdown(report) {
  const lines = [];
  lines.push(
    '# Agent 1 Source Custody Reconciliation Preflight',
    '',
    `Generated: ${report.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Dry-run preflight only.',
    '- No files were staged, committed, deleted, rendered, accepted, or published by this artifact.',
    `- Publication state: ${report.boundary.publication_state}.`,
    '',
    '## Summary',
    '',
    `- Track-candidate untracked source files: ${report.summary.track_candidate_source_files}`,
    `- Track-candidate downstream direct paths: ${report.summary.track_candidate_downstream_direct_paths}`,
    `- Missing-manifest source files: ${report.summary.missing_manifest_source_files}`,
    `- Missing-manifest expected manifest paths: ${report.summary.missing_manifest_expected_paths}`,
    `- Modified tracked source files requiring label review: ${report.summary.modified_tracked_source_files}`,
    '',
    '## Dry-Run Git Status Buckets',
    '',
  );
  for (const [bucketName, bucket] of Object.entries(report.dry_run_buckets)) {
    lines.push(`### ${bucketName}`, '');
    lines.push(`Action boundary: ${bucket.action_boundary}`, '');
    for (const item of bucket.paths) {
      lines.push(`- \`${item.path}\` | git status: \`${item.git_status}\``);
    }
    lines.push('');
  }
  lines.push(
    '## Must Not Be Accepted From This Preflight',
    '',
  );
  for (const item of report.must_not_be_accepted) lines.push(`- ${item}`);
  lines.push('');
  return lines.join('\n');
}

if (!fs.existsSync(closurePath)) {
  throw new Error(`Missing closure options packet: ${path.relative(repoRoot, closurePath)}`);
}

const closure = readJson(closurePath);
const batches = closure.reconciliation_batches || {};
const trackCandidateSourcePaths = uniq(batches.untracked_track_candidate_source_files?.source_paths || []);
const trackCandidateDownstreamPaths = uniq(batches.untracked_track_candidate_source_files?.downstream_direct_artifact_paths || []);
const missingManifestSourcePaths = uniq(batches.untracked_missing_lexical_manifest_source_files?.source_paths || []);
const missingManifestExpectedPaths = uniq(batches.untracked_missing_lexical_manifest_source_files?.expected_lexical_manifest_paths || []);
const missingManifestDownstreamPaths = uniq(batches.untracked_missing_lexical_manifest_source_files?.downstream_direct_artifact_paths || []);
const modifiedTrackedSourcePaths = uniq(batches.modified_tracked_license_label_normalization_files?.source_paths || []);
const modifiedTrackedDownstreamPaths = uniq(batches.modified_tracked_license_label_normalization_files?.downstream_direct_artifact_paths || []);

const statusPaths = uniq([
  ...trackCandidateSourcePaths,
  ...trackCandidateDownstreamPaths,
  ...missingManifestSourcePaths,
  ...missingManifestExpectedPaths,
  ...missingManifestDownstreamPaths,
  ...modifiedTrackedSourcePaths,
  ...modifiedTrackedDownstreamPaths,
]);
const statusMap = gitStatus(statusPaths);

const report = {
  generated_at: new Date().toISOString(),
  artifact_type: 'agent1_source_custody_reconciliation_preflight',
  source_closure_options: 'reports/agent1-source-custody-closure-options.json',
  boundary: {
    publication_state: 'blocked_no_render',
    source_provenance_acceptance_claimed: false,
    public_runtime_acceptance_claimed: false,
    route_publication_support_claimed: false,
    definition_authority_claimed: false,
    page_render_acceptance_claimed: false,
  },
  summary: {
    track_candidate_source_files: trackCandidateSourcePaths.length,
    track_candidate_downstream_direct_paths: trackCandidateDownstreamPaths.length,
    missing_manifest_source_files: missingManifestSourcePaths.length,
    missing_manifest_expected_paths: missingManifestExpectedPaths.length,
    missing_manifest_downstream_direct_paths: missingManifestDownstreamPaths.length,
    modified_tracked_source_files: modifiedTrackedSourcePaths.length,
    modified_tracked_downstream_direct_paths: modifiedTrackedDownstreamPaths.length,
  },
  dry_run_buckets: {
    track_candidate_source_files_only: {
      action_boundary: 'Candidate source-only tracking list for Agent 6 review; not staged by this preflight.',
      paths: expandPathStatus(trackCandidateSourcePaths, statusMap),
    },
    track_candidate_downstream_direct_paths: {
      action_boundary: 'Downstream paths that remain blocked until source custody is accepted; not staged by this preflight.',
      paths: expandPathStatus(trackCandidateDownstreamPaths, statusMap),
    },
    missing_manifest_source_files: {
      action_boundary: 'Sources requiring missing lexical manifest remediation or explicit downstream exclusion before custody closure.',
      paths: expandPathStatus(missingManifestSourcePaths, statusMap),
    },
    missing_manifest_expected_paths: {
      action_boundary: 'Expected manifest paths currently missing by custody evidence; generation is not performed by this preflight.',
      paths: expandPathStatus(missingManifestExpectedPaths, statusMap),
    },
    modified_tracked_license_label_sources: {
      action_boundary: 'Modified tracked sources requiring Agent 6 source-drift review; not accepted by this preflight.',
      paths: expandPathStatus(modifiedTrackedSourcePaths, statusMap),
    },
    modified_tracked_downstream_direct_paths: {
      action_boundary: 'Downstream paths relying on modified tracked sources; remain blocked until source-drift review.',
      paths: expandPathStatus(modifiedTrackedDownstreamPaths, statusMap),
    },
  },
  must_not_be_accepted: closure.must_not_be_accepted || [],
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

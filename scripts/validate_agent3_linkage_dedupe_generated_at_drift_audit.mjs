#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath =
  process.argv[2] || 'reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.json';
const artifact = readJson(artifactPath);

const expectedInputs = [
  {
    path: 'reports/agent3-orot-169-row-route-card-candidate-card-dedupe-review-2026-06-04.json',
    head_generated_at_observed_by_git_diff: '2026-06-04T13:16:27.105Z',
  },
  {
    path: 'reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.json',
    head_generated_at_observed_by_git_diff: '2026-06-04T13:55:17.808Z',
  },
];
const issues = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_linkage_dedupe_generated_at_drift_audit', 'unexpected artifact_type');
expect(artifact.status === 'matrix_status_only_no_new_workset', 'status must be matrix status-only no-new-workset');
expect(artifact.publication_state === 'blocked_no_render', 'publication_state must be blocked_no_render');
expect(artifact.lane_owner === 'Agent 3', 'lane_owner must be Agent 3');
expect(artifact.counts?.audited_files === expectedInputs.length, 'audited file count mismatch');
expect(artifact.counts?.status_only_files === expectedInputs.length, 'status-only file count mismatch');
expect(artifact.counts?.generated_at_only_files === 0, 'generated-at-only file count must be 0 when git diff is empty');
expect(artifact.counts?.substantive_changed_files === 0, 'substantive changed file count must be 0');
expect(artifact.counts?.source_files_committed_by_this_package === 0, 'source files committed count must be 0');

const rowsByPath = new Map((artifact.audited_artifacts || []).map((row) => [row.path, row]));
for (const expectedInput of expectedInputs) {
  const expectedPath = expectedInput.path;
  const row = rowsByPath.get(expectedPath);
  expect(Boolean(row), `missing audited artifact ${expectedPath}`);
  if (!row) continue;
  const current = readJson(expectedPath);
  expect(row.content_equal_ignoring_generated_at === true, `${expectedPath} must match HEAD ignoring generated_at`);
  expect(row.git_diff_has_content === false, `${expectedPath} git diff must be empty`);
  expect(typeof row.git_status_short === 'string', `${expectedPath} git_status_short must be recorded`);
  expect(row.changed_top_level_fields.length === 0, `${expectedPath} changed_top_level_fields must be empty`);
  expect(row.substantive_changed_fields.length === 0, `${expectedPath} artifact substantive fields not empty`);
  expect(row.worktree_generated_at === current.generated_at, `${expectedPath} worktree generated_at mismatch`);
  expect(
    row.head_generated_at_observed_by_git_diff === expectedInput.head_generated_at_observed_by_git_diff,
    `${expectedPath} observed HEAD generated_at mismatch`,
  );
  expect(row.counts.rows === row.expected_counts.rows, `${expectedPath} row count mismatch`);
  expect(row.counts.occurrences === row.expected_counts.occurrences, `${expectedPath} occurrence count mismatch`);
  expect(
    row.counts.exact_blocker_rows === row.expected_counts.exact_blocker_rows,
    `${expectedPath} exact blocker rows mismatch`,
  );
  expect(
    row.counts.exact_blocker_occurrences === row.expected_counts.exact_blocker_occurrences,
    `${expectedPath} exact blocker occurrences mismatch`,
  );
  expectZeroOutputs(row.counts, [
    'public_hud_rows',
    'route_jsonl_rows',
    'route_shard_writes',
    'runtime_files_changed',
    'source_files_changed',
    'token_index_files_changed',
    'lexical_payload_files_changed',
    'definition_content_rows',
    'answer_rows',
    'accepted_text_rows',
  ]);
}

expectZeroOutputs(artifact.counts, [
  'public_hud_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'runtime_files_changed',
  'source_files_changed',
  'token_index_files_changed',
  'lexical_payload_files_changed',
  'definition_content_rows',
  'answer_rows',
  'accepted_text_rows',
  'public_reader_output_rows',
]);
for (const [key, value] of Object.entries(artifact.boundary || {})) {
  expect(value === true, `boundary flag must be true: ${key}`);
}
expect(artifact.package_summary?.executable_workset_created === false, 'executable workset must not be created');

if (issues.length) {
  console.error(JSON.stringify({ ok: false, artifact: artifactPath, issues }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      artifact: artifactPath,
      status: artifact.status,
      audited_files: artifact.counts.audited_files,
      generated_at_only_files: artifact.counts.generated_at_only_files,
      substantive_changed_files: artifact.counts.substantive_changed_files,
      source_files_committed_by_this_package: artifact.counts.source_files_committed_by_this_package,
    },
    null,
    2,
  ),
);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(resolve(relativePath), 'utf8'));
}

function resolve(relativePath) {
  return path.resolve(root, relativePath);
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

function expectZeroOutputs(actual, keys) {
  for (const key of keys) {
    expect(actual?.[key] === 0, `${key} must be 0`);
  }
}

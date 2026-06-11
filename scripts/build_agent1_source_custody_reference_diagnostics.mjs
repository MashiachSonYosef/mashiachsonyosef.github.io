#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const packetPath = path.join(repoRoot, 'reports', 'agent1-source-provenance-custody-packet.json');
const outputJsonPath = path.join(repoRoot, 'reports', 'agent1-source-custody-reference-diagnostics.json');
const outputMdPath = path.join(repoRoot, 'reports', 'agent1-source-custody-reference-diagnostics.md');

const bucketLabels = {
  route_cards_or_hud_surfaces: 'Route/HUD surfaces',
  reader_workbench_artifacts: 'Reader/workbench artifacts',
  translation_memory_paths: 'Translation-memory/options paths',
  public_lexical_exports: 'Public lexical exports',
  reports_or_audit_artifacts: 'Reports/audit artifacts',
};

const countedBlockingBuckets = [
  'route_cards_or_hud_surfaces',
  'reader_workbench_artifacts',
  'translation_memory_paths',
  'public_lexical_exports',
];

function readJson(fullPath) {
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(fullPath, value) {
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function listFiles(root) {
  const fullRoot = path.join(repoRoot, root);
  if (!fs.existsSync(fullRoot)) return [];
  const out = [];
  const stack = [fullRoot];
  while (stack.length) {
    const current = stack.pop();
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, item.name);
      if (item.isDirectory()) {
        stack.push(fullPath);
      } else if (item.isFile()) {
        out.push(path.relative(repoRoot, fullPath).replace(/\\/g, '/'));
      }
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function sumBucket(rows, bucket) {
  return rows.reduce((sum, row) => sum + (row.content_hits?.[bucket]?.length || 0), 0);
}

function uniqueBucketPaths(rows, bucket) {
  return [...new Set(rows.flatMap((row) => row.content_hits?.[bucket] || []))]
    .sort((a, b) => a.localeCompare(b));
}

function rowsWithBucket(rows, bucket) {
  return rows
    .filter((row) => (row.content_hits?.[bucket]?.length || 0) > 0)
    .map((row) => ({
      source_path: row.source_path,
      work_id: row.work_id,
      hit_count: row.content_hits[bucket].length,
      hit_paths: row.content_hits[bucket],
    }));
}

function renderMarkdown(report) {
  const lines = [];
  lines.push(
    '# Agent 1 Source Custody Reference Diagnostics',
    '',
    `Generated: ${report.generated_at}`,
    '',
    '## Boundary',
    '',
    '- Diagnostics only.',
    '- No files were staged, committed, rendered, accepted, or published by this artifact.',
    `- Publication state: ${report.boundary.publication_state}.`,
    '',
    '## Bucket Counts',
    '',
    '| Bucket | Row hits | Unique paths | Counts as blocked content reference |',
    '| --- | ---: | ---: | --- |',
  );
  for (const bucket of Object.keys(bucketLabels)) {
    const row = report.bucket_counts[bucket];
    lines.push(`| ${bucketLabels[bucket]} | ${row.row_hit_count} | ${row.unique_path_count} | ${row.counts_as_blocking_content_reference ? 'yes' : 'no'} |`);
  }
  lines.push(
    '',
    '## Search Roots',
    '',
    '| Root | Exists | File count |',
    '| --- | --- | ---: |',
  );
  for (const root of report.search_roots) {
    lines.push(`| \`${root.root}\` | ${root.exists ? 'yes' : 'no'} | ${root.file_count} |`);
  }
  lines.push(
    '',
    '## Notes',
    '',
    `- Blocking content-reference rows: ${report.summary.blocking_content_reference_rows}.`,
    `- Reports/audit hits are recorded separately (${report.bucket_counts.reports_or_audit_artifacts.row_hit_count}) and are not counted as downstream public/runtime/workbench reliance.`,
    `- Reader/workbench matching rows in current packet: ${report.bucket_counts.reader_workbench_artifacts.row_hit_count}.`,
    '',
  );
  return lines.join('\n');
}

if (!fs.existsSync(packetPath)) {
  throw new Error(`Missing custody packet: ${path.relative(repoRoot, packetPath)}`);
}

const packet = readJson(packetPath);
const rows = [
  ...(packet.untracked_dispositions || []),
  ...(packet.modified_tracked_drift || []),
];
const bucketCounts = {};
for (const bucket of Object.keys(bucketLabels)) {
  const uniquePaths = uniqueBucketPaths(rows, bucket);
  bucketCounts[bucket] = {
    row_hit_count: sumBucket(rows, bucket),
    unique_path_count: uniquePaths.length,
    unique_paths: uniquePaths,
    source_rows_with_hits: rowsWithBucket(rows, bucket),
    counts_as_blocking_content_reference: countedBlockingBuckets.includes(bucket),
  };
}

const report = {
  generated_at: new Date().toISOString(),
  artifact_type: 'agent1_source_custody_reference_diagnostics',
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
    source_rows: rows.length,
    blocking_content_reference_rows: countedBlockingBuckets.reduce((sum, bucket) => sum + bucketCounts[bucket].row_hit_count, 0),
    report_or_audit_reference_rows: bucketCounts.reports_or_audit_artifacts.row_hit_count,
  },
  search_roots: [
    'data/definitions',
    'data/workbench-evidence',
    'data/translation-memory',
    'data/translation-options',
    'data/public-lexical',
    'reports',
    'data/reports',
  ].map((root) => {
    const files = listFiles(root);
    return { root, exists: fs.existsSync(path.join(repoRoot, root)), file_count: files.length };
  }),
  bucket_counts: bucketCounts,
  must_not_be_accepted: packet.must_not_be_accepted || [],
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

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  slicesDir: '.local-cache/workbench-evidence',
  output: '.local-cache/workbench-evidence/usage-selected-slices-index.json',
  report: 'reports/workbench-usage-selected-slices-index.md',
};

const options = parseArgs(process.argv.slice(2));
const slicesDir = path.join(root, options.slicesDir);
const sliceFiles = fs.existsSync(slicesDir)
  ? fs.readdirSync(slicesDir).filter((name) => /^usage-slice-.*\.json$/i.test(name)).sort((a, b) => a.localeCompare(b))
  : [];

const slices = [];
const totals = {
  slices: 0,
  rows: 0,
  works: 0,
  clusters: 0,
  route_ids: 0,
  supported: 0,
  candidate: 0,
  weak: 0,
  route_linked_observed_usage: 0,
  observed_usage_only: 0,
};

for (const fileName of sliceFiles) {
  const artifactPath = `${options.slicesDir}/${fileName}`;
  const artifact = readJson(artifactPath);
  if (artifact.artifact_type !== 'workbench_usage_navigation_slice_index') continue;
  const entry = {
    slice_id: artifact.filter?.slice_id || null,
    label: artifact.filter?.label || null,
    work_prefix: artifact.filter?.work_prefix || null,
    source_ref_prefix: artifact.filter?.source_ref_prefix || null,
    artifact_path: artifactPath,
    report_path: `reports/workbench-${fileName.replace(/\.json$/i, '.md')}`,
    counts: {
      rows: Number(artifact.counts?.slice_rows || 0),
      works: Number(artifact.counts?.works || 0),
      clusters: Number(artifact.counts?.clusters || 0),
      route_ids: Number(artifact.counts?.route_ids || 0),
      supported: Number(artifact.counts?.status_counts?.supported || 0),
      candidate: Number(artifact.counts?.status_counts?.candidate || 0),
      weak: Number(artifact.counts?.status_counts?.weak || 0),
      route_linked_observed_usage: Number(artifact.counts?.route_link_state_counts?.route_linked_observed_usage || 0),
      observed_usage_only: Number(artifact.counts?.route_link_state_counts?.observed_usage_only || 0),
    },
    authority_policy: artifact.authority_policy || null,
  };
  slices.push(entry);
  totals.slices += 1;
  for (const key of Object.keys(entry.counts)) totals[key] += entry.counts[key];
}

const output = {
  schema_version: 1,
  artifact_type: 'workbench_usage_navigation_selected_slices_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_slices_index.mjs',
  policy: 'Manifest over prebuilt usage-navigation slice artifacts. It summarizes slice discovery only and does not scan new sources, rank routes, select visible answers, or make meaning claims.',
  inputs: {
    slices_dir: options.slicesDir,
  },
  authority_policy: {
    usage_navigation_only: true,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
  },
  counts: totals,
  slices,
};

writeJson(options.output, output);
writeReport(options.report, output);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage selected slices index slices ${output.counts.slices}; rows ${output.counts.rows}`);

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--slices-dir=')) parsed.slicesDir = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Slices Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Slices: ${artifact.counts.slices}`,
    `- Rows: ${artifact.counts.rows}`,
    `- Works: ${artifact.counts.works}`,
    `- Clusters: ${artifact.counts.clusters}`,
    `- Route IDs: ${artifact.counts.route_ids}`,
    `- Status counts: supported ${artifact.counts.supported}, candidate ${artifact.counts.candidate}, weak ${artifact.counts.weak}`,
    `- Route link states: route-linked ${artifact.counts.route_linked_observed_usage}, observed-only ${artifact.counts.observed_usage_only}`,
    '',
    '## Policy',
    '',
    'This is a discovery manifest over selected slice artifacts. It carries no definition, translation, route ranking, or visible-answer authority.',
    '',
    '## Slices',
    '',
    '| slice id | label | work prefix | source ref prefix | rows | works | clusters | supported | candidate | weak | route-linked | observed-only | artifact | report |',
    '|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|',
    ...artifact.slices.map((slice) => `| ${[
      slice.slice_id,
      slice.label,
      slice.work_prefix || '(none)',
      slice.source_ref_prefix || '(none)',
      slice.counts.rows,
      slice.counts.works,
      slice.counts.clusters,
      slice.counts.supported,
      slice.counts.candidate,
      slice.counts.weak,
      slice.counts.route_linked_observed_usage,
      slice.counts.observed_usage_only,
      slice.artifact_path,
      slice.report_path,
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  return arg.split('=').slice(1).join('=');
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

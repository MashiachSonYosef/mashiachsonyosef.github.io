#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedSlicesIndex: '.local-cache/workbench-evidence/usage-selected-slices-index.json',
  output: '.local-cache/workbench-evidence/usage-selected-occurrences.json',
  report: 'reports/workbench-usage-selected-occurrences.md',
};

const options = parseArgs(process.argv.slice(2));
const selectedSlicesIndex = readJson(options.selectedSlicesIndex);
if (selectedSlicesIndex.artifact_type !== 'workbench_usage_navigation_selected_slices_index') {
  throw new Error(`${options.selectedSlicesIndex} is not a selected slices index artifact`);
}

const rowsByOccurrenceId = new Map();
const sliceMembershipRows = [];
for (const slice of selectedSlicesIndex.slices || []) {
  const sliceArtifact = readJson(slice.artifact_path);
  if (sliceArtifact.artifact_type !== 'workbench_usage_navigation_slice_index') continue;
  for (const occurrence of sliceArtifact.occurrence_refs || []) {
    const occurrenceId = occurrence.occurrence_id || occurrence.candidate_id;
    if (!occurrenceId) continue;
    if (!rowsByOccurrenceId.has(occurrenceId)) rowsByOccurrenceId.set(occurrenceId, compactOccurrence(occurrence));
    const row = rowsByOccurrenceId.get(occurrenceId);
    if (!row.slice_ids.includes(slice.slice_id)) row.slice_ids.push(slice.slice_id);
    sliceMembershipRows.push({
      occurrence_id: occurrenceId,
      slice_id: slice.slice_id,
      source_ref: occurrence.source_ref || null,
      status: occurrence.status || null,
    });
  }
}

const rows = [...rowsByOccurrenceId.values()].map((row) => ({
  ...row,
  slice_ids: row.slice_ids.sort((a, b) => a.localeCompare(b)),
})).sort(compareRows);

const counts = buildCounts(rows, sliceMembershipRows);
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_navigation_selected_occurrences',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_occurrences.mjs',
  policy: 'De-duplicated occurrence packet for selected usage-navigation slices. It preserves observed usage rows, provenance, slice membership, and route links only; it does not rank routes, select visible answers, translate, or make meaning claims.',
  inputs: {
    selected_slices_index: options.selectedSlicesIndex,
  },
  authority_policy: {
    usage_navigation_only: true,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
  },
  counts,
  rows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage selected occurrences rows ${artifact.counts.occurrence_refs}; memberships ${artifact.counts.slice_memberships}`);

function compactOccurrence(occurrence) {
  const routeIds = Array.isArray(occurrence.route_ids) ? occurrence.route_ids.filter(Boolean) : [];
  return {
    occurrence_id: occurrence.occurrence_id || null,
    candidate_id: occurrence.candidate_id || null,
    token_key: occurrence.token_key || null,
    token_surface: occurrence.token_surface || null,
    token_normalized: occurrence.token_normalized || null,
    focus_surface: occurrence.focus_surface || null,
    focus_normalized: occurrence.focus_normalized || null,
    cluster_id: occurrence.cluster_id || null,
    usage_frame_label: occurrence.usage_frame_label || null,
    status: occurrence.status || null,
    raw_score: occurrence.raw_score ?? null,
    navigation_label: occurrence.navigation_label || (routeIds.length ? 'route-linked observed usage' : 'observed usage only'),
    route_link_state: occurrence.route_link_state || (routeIds.length ? 'route_linked_observed_usage' : 'observed_usage_only'),
    source_ref: occurrence.source_ref || null,
    source_href: occurrence.source_href || null,
    work_anchor_href: occurrence.work_anchor_href || null,
    work_id: occurrence.work_id || null,
    work_title: occurrence.work_title || null,
    work_slug: occurrence.work_slug || null,
    unit_id: occurrence.unit_id || null,
    version_title: occurrence.version_title || null,
    version_source: occurrence.version_source || null,
    license: occurrence.license || null,
    license_url: occurrence.license_url || null,
    route_ids: routeIds,
    slice_ids: [],
    context_focus_marked: occurrence.context_focus_marked || '',
  };
}

function buildCounts(rows, sliceMembershipRows) {
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  const routeLinkStateCounts = {
    route_linked_observed_usage: 0,
    observed_usage_only: 0,
  };
  const works = new Set();
  const clusters = new Set();
  const routeIds = new Set();
  const licenses = new Map();
  const sliceIds = new Set();

  for (const row of rows) {
    if (Object.hasOwn(statusCounts, row.status)) statusCounts[row.status] += 1;
    if (Object.hasOwn(routeLinkStateCounts, row.route_link_state)) routeLinkStateCounts[row.route_link_state] += 1;
    if (row.work_slug || row.work_id || row.work_title) works.add(row.work_slug || row.work_id || row.work_title);
    if (row.cluster_id) clusters.add(row.cluster_id);
    for (const routeId of row.route_ids) routeIds.add(routeId);
    for (const sliceId of row.slice_ids) sliceIds.add(sliceId);
    const license = row.license || 'unknown';
    licenses.set(license, (licenses.get(license) || 0) + 1);
  }

  return {
    occurrence_refs: rows.length,
    slice_memberships: sliceMembershipRows.length,
    duplicate_slice_memberships: Math.max(0, sliceMembershipRows.length - rows.length),
    slices: sliceIds.size,
    works: works.size,
    clusters: clusters.size,
    route_ids: routeIds.size,
    status_counts: statusCounts,
    route_link_state_counts: routeLinkStateCounts,
    license_counts: Object.fromEntries([...licenses.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
  };
}

function compareRows(a, b) {
  return String(a.source_ref || '').localeCompare(String(b.source_ref || ''), undefined, { numeric: true })
    || String(a.work_slug || '').localeCompare(String(b.work_slug || ''))
    || String(a.occurrence_id || '').localeCompare(String(b.occurrence_id || ''));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--selected-slices-index=')) parsed.selectedSlicesIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Occurrences',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Occurrence refs: ${artifact.counts.occurrence_refs}`,
    `- Slice memberships: ${artifact.counts.slice_memberships}`,
    `- Duplicate slice memberships: ${artifact.counts.duplicate_slice_memberships}`,
    `- Slices: ${artifact.counts.slices}`,
    `- Works: ${artifact.counts.works}`,
    `- Clusters: ${artifact.counts.clusters}`,
    `- Route IDs: ${artifact.counts.route_ids}`,
    `- Status counts: supported ${artifact.counts.status_counts.supported}, candidate ${artifact.counts.status_counts.candidate}, weak ${artifact.counts.status_counts.weak}`,
    `- Route link states: route-linked ${artifact.counts.route_link_state_counts.route_linked_observed_usage}, observed-only ${artifact.counts.route_link_state_counts.observed_usage_only}`,
    `- License counts: ${Object.entries(artifact.counts.license_counts).map(([key, value]) => `${key} ${value}`).join(', ') || '(none)'}`,
    '',
    '## Policy',
    '',
    'This packet is usage-navigation data only. It carries no definition, translation, route ranking, or visible-answer authority.',
    '',
    '## Occurrences',
    '',
    '| status | score | source | work anchor | token | normalized | frame | slices | route ids | license | context |',
    '|---|---:|---|---|---|---|---|---|---|---|---|',
    ...artifact.rows.map((row) => `| ${[
      row.status,
      row.raw_score,
      mdLink(row.source_ref, row.source_href),
      mdLink(row.source_ref, row.work_anchor_href),
      row.focus_surface || row.token_surface,
      row.focus_normalized || row.token_normalized,
      row.usage_frame_label || row.cluster_id,
      row.slice_ids.join(', '),
      row.route_ids.join(', '),
      mdLink(row.license, row.license_url),
      row.context_focus_marked,
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

function mdLink(label, href) {
  if (!label) return '';
  if (!href) return label;
  return `[${String(label).replace(/\]/g, '\\]')}](${href})`;
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

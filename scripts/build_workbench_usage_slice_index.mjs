#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  concordance: 'data/workbench-evidence/usage-concordance.json',
  output: '.local-cache/workbench-evidence/usage-slice-index.json',
  report: 'reports/workbench-usage-slice-index.md',
  sliceId: 'selected-usage-slice',
  label: 'Selected usage slice',
  workPrefix: '',
  sourceRefPrefix: '',
  maxSamples: 20,
};

const options = parseArgs(process.argv.slice(2));
const concordance = readJson(options.concordance);
if (concordance.artifact_type !== 'workbench_usage_navigation_concordance') {
  throw new Error(`${options.concordance} is not a usage concordance artifact`);
}
if (!options.workPrefix && !options.sourceRefPrefix) {
  throw new Error('At least one filter is required: --work-prefix=... or --source-ref-prefix=...');
}

const rows = (concordance.rows || []).filter(rowMatches);
const works = new Map();
const clusters = new Map();
const routes = new Map();
const samples = [];
const occurrenceRefs = [];
const counts = {
  supported: 0,
  candidate: 0,
  weak: 0,
  route_linked_observed_usage: 0,
  observed_usage_only: 0,
};

for (const row of rows) {
  const occurrence = compactOccurrence(row);
  occurrenceRefs.push(occurrence);
  addCount(counts, occurrence.status);
  addCount(counts, occurrence.route_link_state);
  addMapCount(works, occurrence.work_slug || 'unknown', occurrence.work_title || occurrence.work_slug || 'unknown', occurrence);
  addMapCount(clusters, occurrence.cluster_id || 'unclustered', occurrence.usage_frame_label || 'unclustered', occurrence);
  for (const routeId of occurrence.route_ids) addMapCount(routes, routeId, routeId, occurrence);
  if (samples.length < options.maxSamples) samples.push({
    occurrence_id: occurrence.occurrence_id,
    candidate_id: occurrence.candidate_id,
    cluster_id: occurrence.cluster_id,
    status: occurrence.status,
    raw_score: occurrence.raw_score,
    source_ref: occurrence.source_ref,
    source_href: occurrence.source_href,
    work_anchor_href: occurrence.work_anchor_href,
    route_ids: occurrence.route_ids,
    context_focus_marked: occurrence.context_focus_marked,
  });
}

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_navigation_slice_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_slice_index.mjs',
  policy: 'Filtered slice over existing usage-navigation concordance rows. It does not scan new sources, rank routes, select visible answers, translate, or make meaning claims.',
  inputs: {
    concordance: options.concordance,
  },
  filter: {
    slice_id: options.sliceId,
    label: options.label,
    work_prefix: options.workPrefix || null,
    source_ref_prefix: options.sourceRefPrefix || null,
  },
  reader_facing_policy: concordance.reader_facing_policy,
  authority_policy: {
    usage_navigation_only: true,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    no_route_label: concordance.reader_facing_policy?.no_route_label || 'observed usage only',
  },
  counts: {
    concordance_rows: Number(concordance.counts?.rows || 0),
    slice_rows: rows.length,
    works: works.size,
    clusters: clusters.size,
    route_ids: routes.size,
    status_counts: {
      supported: counts.supported,
      candidate: counts.candidate,
      weak: counts.weak,
    },
    route_link_state_counts: {
      route_linked_observed_usage: counts.route_linked_observed_usage,
      observed_usage_only: counts.observed_usage_only,
    },
    audit_only_counts: concordance.counts?.audit_only_counts || {},
  },
  works: finalizeMap(works),
  clusters: finalizeMap(clusters),
  routes: finalizeMap(routes),
  samples,
  occurrence_refs: occurrenceRefs,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage slice ${options.sliceId} rows ${artifact.counts.slice_rows}; works ${artifact.counts.works}; clusters ${artifact.counts.clusters}`);

function rowMatches(row) {
  const workSlug = String(row.source?.work_slug || '');
  const sourceRef = String(row.source?.source_ref || '');
  return (!options.workPrefix || workSlug.startsWith(options.workPrefix))
    && (!options.sourceRefPrefix || sourceRef.startsWith(options.sourceRefPrefix));
}

function compactOccurrence(row) {
  const routeIds = Array.isArray(row.agent2_route_ids) ? row.agent2_route_ids : [];
  return {
    occurrence_id: row.ids?.occurrence_id || null,
    candidate_id: row.ids?.candidate_id || null,
    token_key: row.ids?.token_key || null,
    cluster_id: row.ids?.cluster_id || row.usage_frame?.cluster_id || null,
    token_surface: row.token?.token_surface || null,
    token_normalized: row.token?.token_normalized || null,
    focus_surface: row.token?.focus_surface || null,
    focus_normalized: row.token?.focus_normalized || null,
    usage_frame_label: row.usage_frame?.frame_label || null,
    status: row.status?.candidate_status || null,
    raw_score: row.status?.raw_score ?? null,
    navigation_label: row.navigation_label || (routeIds.length ? 'route-linked observed usage' : 'observed usage only'),
    route_link_state: row.route_link_state || (routeIds.length ? 'route_linked_observed_usage' : 'observed_usage_only'),
    source_ref: row.source?.source_ref || null,
    source_href: row.occurrence_links?.source_ref?.href || row.source?.source_url || null,
    work_anchor_href: row.occurrence_links?.work_anchor?.href || null,
    work_id: row.source?.work_id || null,
    work_title: row.source?.work_title || null,
    work_slug: row.source?.work_slug || row.occurrence_links?.work_anchor?.work_slug || null,
    unit_id: row.source?.unit_id || row.occurrence_links?.work_anchor?.unit_id || null,
    version_title: row.source?.version_title || null,
    version_source: row.source?.version_source || null,
    license: row.source?.license || null,
    license_url: row.source?.license_url || null,
    route_ids: routeIds,
    context_focus_marked: markFocusFromTokens(row.phrase?.phrase_tokens),
  };
}

function addMapCount(map, key, label, occurrence) {
  if (!map.has(key)) {
    map.set(key, {
      key,
      label,
      counts: {
        rows: 0,
        status_counts: { supported: 0, candidate: 0, weak: 0 },
        route_link_state_counts: {
          route_linked_observed_usage: 0,
          observed_usage_only: 0,
        },
      },
      occurrence_ids: [],
    });
  }
  const item = map.get(key);
  item.counts.rows += 1;
  addCount(item.counts.status_counts, occurrence.status);
  addCount(item.counts.route_link_state_counts, occurrence.route_link_state);
  if (occurrence.occurrence_id) item.occurrence_ids.push(occurrence.occurrence_id);
}

function finalizeMap(map) {
  return [...map.values()].sort((a, b) => b.counts.rows - a.counts.rows || a.key.localeCompare(b.key));
}

function addCount(target, key) {
  if (Object.hasOwn(target, key)) target[key] += 1;
}

function markFocusFromTokens(tokens) {
  if (!Array.isArray(tokens) || !tokens.length) return '';
  return tokens.map((token) => token.role === 'focus-token' ? `[${token.surface}]` : token.surface).join(' ');
}

function writeReport(relativePath, artifact) {
  const lines = [
    `# Workbench Usage Slice: ${artifact.filter.label}`,
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Slice ID: ${artifact.filter.slice_id}`,
    `- Work prefix: ${artifact.filter.work_prefix || '(none)'}`,
    `- Source ref prefix: ${artifact.filter.source_ref_prefix || '(none)'}`,
    `- Concordance rows: ${artifact.counts.concordance_rows}`,
    `- Slice rows: ${artifact.counts.slice_rows}`,
    `- Works: ${artifact.counts.works}`,
    `- Clusters: ${artifact.counts.clusters}`,
    `- Route IDs: ${artifact.counts.route_ids}`,
    `- Status counts: supported ${artifact.counts.status_counts.supported}, candidate ${artifact.counts.status_counts.candidate}, weak ${artifact.counts.status_counts.weak}`,
    `- Route link states: route-linked ${artifact.counts.route_link_state_counts.route_linked_observed_usage}, observed-only ${artifact.counts.route_link_state_counts.observed_usage_only}`,
    `- Audit-only rows in source concordance: ambiguous ${artifact.counts.audit_only_counts.ambiguous}, blocked ${artifact.counts.audit_only_counts.blocked}`,
    '',
    '## Policy',
    '',
    'This is a filtered view of existing usage-navigation rows. It is not a new corpus scan and carries no definition, translation, route ranking, or visible-answer authority.',
    '',
    '## Clusters',
    '',
    '| cluster | frame | rows | supported | candidate | weak |',
    '|---|---|---:|---:|---:|---:|',
    ...artifact.clusters.map((cluster) => `| ${[
      cluster.key,
      cluster.label,
      cluster.counts.rows,
      cluster.counts.status_counts.supported,
      cluster.counts.status_counts.candidate,
      cluster.counts.status_counts.weak,
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Works',
    '',
    '| work | rows | supported | candidate | weak |',
    '|---|---:|---:|---:|---:|',
    ...artifact.works.map((work) => `| ${[
      work.label,
      work.counts.rows,
      work.counts.status_counts.supported,
      work.counts.status_counts.candidate,
      work.counts.status_counts.weak,
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Samples',
    '',
    '| status | score | source | work anchor | cluster | route ids | context |',
    '|---|---:|---|---|---|---|---|',
    ...artifact.samples.map((sample) => `| ${[
      sample.status,
      sample.raw_score,
      mdLink(sample.source_ref, sample.source_href),
      mdLink(sample.source_ref, sample.work_anchor_href),
      sample.cluster_id,
      sample.route_ids.join(', '),
      sample.context_focus_marked,
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--concordance=')) parsed.concordance = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--slice-id=')) parsed.sliceId = String(valueAfterEquals(arg));
    else if (arg.startsWith('--label=')) parsed.label = String(valueAfterEquals(arg));
    else if (arg.startsWith('--work-prefix=')) parsed.workPrefix = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--source-ref-prefix=')) parsed.sourceRefPrefix = String(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples=')) parsed.maxSamples = Math.max(0, Number(valueAfterEquals(arg)) || 0);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
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

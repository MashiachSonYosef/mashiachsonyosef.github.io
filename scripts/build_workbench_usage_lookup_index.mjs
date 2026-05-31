#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  concordance: 'data/workbench-evidence/usage-concordance.json',
  output: '.local-cache/workbench-evidence/usage-lookup-index.json',
  report: 'reports/workbench-usage-lookup-index.md',
  maxWorks: 25,
};

const options = parseArgs(process.argv.slice(2));
const concordance = readJson(options.concordance);
if (concordance.artifact_type !== 'workbench_usage_navigation_concordance') {
  throw new Error(`${options.concordance} is not a usage concordance artifact`);
}

const tokenKeys = new Map();
const clusters = new Map();
const works = new Map();
const routes = new Map();
const occurrenceRefs = [];

for (const row of concordance.rows || []) {
  const occurrence = compactOccurrence(row);
  occurrenceRefs.push(occurrence);
  addToken(row, occurrence);
  addCluster(row, occurrence);
  addWork(row, occurrence);
  addRoutes(row, occurrence);
}

const tokenList = [...tokenKeys.values()].map(finalizeIndexEntry).sort((a, b) => b.counts.rows - a.counts.rows || a.token_key.localeCompare(b.token_key));
const clusterList = [...clusters.values()].map(finalizeIndexEntry).sort((a, b) => b.counts.rows - a.counts.rows || a.cluster_id.localeCompare(b.cluster_id));
const workList = [...works.values()].map(finalizeIndexEntry).sort((a, b) => b.counts.rows - a.counts.rows || a.work_slug.localeCompare(b.work_slug));
const routeList = [...routes.values()].map(finalizeIndexEntry).sort((a, b) => b.counts.rows - a.counts.rows || a.route_id.localeCompare(b.route_id));

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_navigation_lookup_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_lookup_index.mjs',
  policy: 'Lookup index for usage-navigation rows. It keeps every selected occurrence addressable by stable IDs and source/work links; it does not rank routes, select visible answers, translate, or make meaning claims.',
  inputs: {
    concordance: options.concordance,
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
    rows: Number(concordance.counts?.rows || 0),
    occurrence_refs: occurrenceRefs.length,
    token_keys: tokenList.length,
    clusters: clusterList.length,
    works: workList.length,
    route_ids: routeList.length,
    status_counts: concordance.counts?.status_counts || {},
    route_link_state_counts: concordance.counts?.route_link_state_counts || {},
    audit_only_counts: concordance.counts?.audit_only_counts || {},
  },
  token_keys: tokenList,
  clusters: clusterList,
  works: workList,
  routes: routeList,
  occurrence_refs: occurrenceRefs,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage lookup index occurrences ${artifact.counts.occurrence_refs}; works ${artifact.counts.works}; clusters ${artifact.counts.clusters}`);

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
  };
}

function addToken(row, occurrence) {
  const tokenKey = occurrence.token_key || 'unknown';
  if (!tokenKeys.has(tokenKey)) {
    tokenKeys.set(tokenKey, createEntry({
      token_key: tokenKey,
      token_surface: occurrence.token_surface,
      token_normalized: occurrence.token_normalized,
      focus_surface: occurrence.focus_surface,
      focus_normalized: occurrence.focus_normalized,
    }));
  }
  addOccurrenceToEntry(tokenKeys.get(tokenKey), occurrence);
}

function addCluster(row, occurrence) {
  const clusterId = occurrence.cluster_id || 'unclustered';
  if (!clusters.has(clusterId)) {
    clusters.set(clusterId, createEntry({
      cluster_id: clusterId,
      frame_label: occurrence.usage_frame_label,
    }));
  }
  addOccurrenceToEntry(clusters.get(clusterId), occurrence);
}

function addWork(row, occurrence) {
  const workSlug = occurrence.work_slug || 'unknown';
  if (!works.has(workSlug)) {
    works.set(workSlug, createEntry({
      work_slug: workSlug,
      work_id: occurrence.work_id,
      work_title: occurrence.work_title,
    }));
  }
  addOccurrenceToEntry(works.get(workSlug), occurrence);
}

function addRoutes(row, occurrence) {
  for (const link of row.route_links || []) {
    const routeId = String(link.route_id || '').trim();
    if (!routeId) continue;
    if (!routes.has(routeId)) {
      routes.set(routeId, createEntry({
        route_id: routeId,
        route_source: link.route_source || null,
        route_family: link.route_family || null,
        route_type: link.route_type || null,
        display_section: link.display_section || null,
      }));
    }
    addOccurrenceToEntry(routes.get(routeId), occurrence);
  }
}

function createEntry(fields) {
  return {
    ...fields,
    counts: {
      rows: 0,
      status_counts: { supported: 0, candidate: 0, weak: 0 },
      route_link_state_counts: {
        route_linked_observed_usage: 0,
        observed_usage_only: 0,
      },
    },
    cluster_ids: new Set(),
    work_slugs: new Set(),
    route_ids: new Set(),
    occurrence_ids: [],
  };
}

function addOccurrenceToEntry(entry, occurrence) {
  entry.counts.rows += 1;
  if (Object.hasOwn(entry.counts.status_counts, occurrence.status)) entry.counts.status_counts[occurrence.status] += 1;
  if (Object.hasOwn(entry.counts.route_link_state_counts, occurrence.route_link_state)) {
    entry.counts.route_link_state_counts[occurrence.route_link_state] += 1;
  }
  if (occurrence.cluster_id) entry.cluster_ids.add(occurrence.cluster_id);
  if (occurrence.work_slug) entry.work_slugs.add(occurrence.work_slug);
  for (const routeId of occurrence.route_ids || []) entry.route_ids.add(routeId);
  if (occurrence.occurrence_id) entry.occurrence_ids.push(occurrence.occurrence_id);
}

function finalizeIndexEntry(entry) {
  return {
    ...Object.fromEntries(Object.entries(entry).filter(([key]) => !['cluster_ids', 'work_slugs', 'route_ids'].includes(key))),
    cluster_ids: [...entry.cluster_ids].sort(),
    work_slugs: [...entry.work_slugs].sort(),
    route_ids: [...entry.route_ids].sort(),
  };
}

function writeReport(relativePath, artifact) {
  const topWorks = artifact.works.slice(0, options.maxWorks);
  const lines = [
    '# Workbench Usage Lookup Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Occurrence refs: ${artifact.counts.occurrence_refs}`,
    `- Token keys: ${artifact.counts.token_keys}`,
    `- Clusters: ${artifact.counts.clusters}`,
    `- Works: ${artifact.counts.works}`,
    `- Route IDs: ${artifact.counts.route_ids}`,
    `- Status counts: supported ${artifact.counts.status_counts.supported}, candidate ${artifact.counts.status_counts.candidate}, weak ${artifact.counts.status_counts.weak}`,
    `- Route link states: route-linked ${artifact.counts.route_link_state_counts.route_linked_observed_usage}, observed-only ${artifact.counts.route_link_state_counts.observed_usage_only}`,
    `- Audit-only rows: ambiguous ${artifact.counts.audit_only_counts.ambiguous}, blocked ${artifact.counts.audit_only_counts.blocked}`,
    '',
    '## Policy',
    '',
    'This report summarizes the compact lookup JSON. The JSON keeps every selected occurrence addressable by stable occurrence ID, token key, cluster, work anchor, source URL, and related route IDs. It is usage navigation only and carries no definition, translation, route ranking, or visible-answer authority.',
    '',
    '## Token Keys',
    '',
    '| token key | normalized | rows | supported | candidate | weak | clusters | works | route ids |',
    '|---|---|---:|---:|---:|---:|---:|---:|---|',
    ...artifact.token_keys.map((token) => `| ${[
      token.token_key,
      token.token_normalized,
      token.counts.rows,
      token.counts.status_counts.supported,
      token.counts.status_counts.candidate,
      token.counts.status_counts.weak,
      token.cluster_ids.length,
      token.work_slugs.length,
      token.route_ids.join(', '),
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Clusters',
    '',
    '| cluster | frame | rows | supported | candidate | weak | works | route ids |',
    '|---|---|---:|---:|---:|---:|---:|---|',
    ...artifact.clusters.map((cluster) => `| ${[
      cluster.cluster_id,
      cluster.frame_label,
      cluster.counts.rows,
      cluster.counts.status_counts.supported,
      cluster.counts.status_counts.candidate,
      cluster.counts.status_counts.weak,
      cluster.work_slugs.length,
      cluster.route_ids.join(', '),
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Top Works',
    '',
    '| work | rows | supported | candidate | weak | clusters | route ids |',
    '|---|---:|---:|---:|---:|---:|---|',
    ...topWorks.map((work) => `| ${[
      work.work_title || work.work_slug,
      work.counts.rows,
      work.counts.status_counts.supported,
      work.counts.status_counts.candidate,
      work.counts.status_counts.weak,
      work.cluster_ids.length,
      work.route_ids.join(', '),
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
    else if (arg.startsWith('--max-works=')) parsed.maxWorks = Math.max(0, Number(valueAfterEquals(arg)) || 0);
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

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

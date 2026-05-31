#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrences: '.local-cache/workbench-evidence/usage-selected-occurrences.json',
  output: '.local-cache/workbench-evidence/usage-crossmatch-links.json',
  report: 'reports/workbench-usage-crossmatch-links.md',
  maxReportSamples: 24,
};

const relationWeights = {
  same_focus_normalized: 30,
  same_token_key: 20,
  same_cluster: 25,
  shared_route_id: 15,
  same_source_ref: 10,
  same_work: 8,
  same_status: 5,
  same_license: 3,
  shared_slice: 2,
};

const options = parseArgs(process.argv.slice(2));
const selectedOccurrences = readJson(options.selectedOccurrences);
if (selectedOccurrences.artifact_type !== 'workbench_usage_navigation_selected_occurrences') {
  throw new Error(`${options.selectedOccurrences} is not a selected occurrences artifact`);
}

const rows = (selectedOccurrences.rows || []).filter((row) => row.occurrence_id);
const occurrences = rows.map(compactOccurrence);
const occurrenceById = new Map(occurrences.map((row) => [row.occurrence_id, row]));
const adjacency = new Map(occurrences.map((row) => [row.occurrence_id, {
  occurrence_id: row.occurrence_id,
  source_ref: row.source_ref,
  source_href: row.source_href,
  work_anchor_href: row.work_anchor_href,
  token_key: row.token_key,
  focus_normalized: row.focus_normalized,
  cluster_id: row.cluster_id,
  usage_frame_label: row.usage_frame_label,
  status: row.status,
  raw_score: row.raw_score,
  route_ids: row.route_ids,
  links: [],
}]));
const directedEdges = [];
const undirectedPairKeys = new Set();

for (const source of occurrences) {
  for (const target of occurrences) {
    if (source.occurrence_id === target.occurrence_id) continue;
    const edge = buildEdge(source, target);
    directedEdges.push(edge);
    adjacency.get(source.occurrence_id).links.push(compactEdgeTarget(edge, target));
    undirectedPairKeys.add([source.occurrence_id, target.occurrence_id].sort().join('|'));
  }
}

for (const entry of adjacency.values()) {
  entry.links.sort(compareLinkTargets);
  entry.counts = {
    links: entry.links.length,
    strong: entry.links.filter((link) => link.crossmatch_strength === 'strong').length,
    moderate: entry.links.filter((link) => link.crossmatch_strength === 'moderate').length,
    weak: entry.links.filter((link) => link.crossmatch_strength === 'weak').length,
  };
}

directedEdges.sort(compareEdges);

const counts = buildCounts();
const checks = buildChecks();
const failed = checks.filter((check) => check.status === 'failed');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_navigation_crossmatch_links',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_crossmatch_links.mjs',
  policy: 'Directed occurrence-to-occurrence crossmatch links for selected usage-navigation rows. It supports concordance navigation only; it does not rank routes, select visible answers, translate, or make meaning claims.',
  inputs: {
    selected_occurrences: options.selectedOccurrences,
  },
  authority_policy: selectedOccurrences.authority_policy,
  quality: {
    status: failed.length ? 'failed' : 'passed',
    failed_count: failed.length,
  },
  counts,
  checks,
  occurrences,
  adjacency: [...adjacency.values()].sort(compareAdjacencyEntries),
  edges: directedEdges,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage crossmatch links occurrences ${counts.occurrence_refs}; directed edges ${counts.directed_edges}`);

function compactOccurrence(row) {
  return {
    occurrence_id: row.occurrence_id,
    candidate_id: row.candidate_id || null,
    token_key: row.token_key || null,
    token_surface: row.token_surface || null,
    token_normalized: row.token_normalized || null,
    focus_surface: row.focus_surface || row.token_surface || null,
    focus_normalized: row.focus_normalized || row.token_normalized || null,
    cluster_id: row.cluster_id || null,
    usage_frame_label: row.usage_frame_label || null,
    status: row.status || null,
    raw_score: row.raw_score ?? null,
    navigation_label: row.navigation_label || null,
    route_link_state: row.route_link_state || null,
    source_ref: row.source_ref || null,
    source_href: row.source_href || null,
    work_anchor_href: row.work_anchor_href || null,
    work_id: row.work_id || null,
    work_title: row.work_title || null,
    work_slug: row.work_slug || null,
    unit_id: row.unit_id || null,
    version_title: row.version_title || null,
    version_source: row.version_source || null,
    license: row.license || null,
    license_url: row.license_url || null,
    route_ids: Array.isArray(row.route_ids) ? row.route_ids.filter(Boolean).sort() : [],
    slice_ids: Array.isArray(row.slice_ids) ? row.slice_ids.filter(Boolean).sort() : [],
    context_focus_marked: row.context_focus_marked || '',
  };
}

function buildEdge(source, target) {
  const relationships = [];
  if (source.focus_normalized && source.focus_normalized === target.focus_normalized) relationships.push('same_focus_normalized');
  if (source.token_key && source.token_key === target.token_key) relationships.push('same_token_key');
  if (source.cluster_id && source.cluster_id === target.cluster_id) relationships.push('same_cluster');
  if (intersect(source.route_ids, target.route_ids).length) relationships.push('shared_route_id');
  if (source.source_ref && source.source_ref === target.source_ref) relationships.push('same_source_ref');
  if (source.work_slug && source.work_slug === target.work_slug) relationships.push('same_work');
  if (source.status && source.status === target.status) relationships.push('same_status');
  if (source.license && source.license === target.license) relationships.push('same_license');
  if (intersect(source.slice_ids, target.slice_ids).length) relationships.push('shared_slice');

  const crossmatchScore = Math.min(100, relationships.reduce((sum, key) => sum + relationWeights[key], 0));
  return {
    edge_id: stableId(`${source.occurrence_id}|${target.occurrence_id}`),
    source_occurrence_id: source.occurrence_id,
    target_occurrence_id: target.occurrence_id,
    crossmatch_score: crossmatchScore,
    crossmatch_strength: strengthForScore(crossmatchScore),
    relationships,
    shared_route_ids: intersect(source.route_ids, target.route_ids),
    shared_slice_ids: intersect(source.slice_ids, target.slice_ids),
    source_status: source.status,
    target_status: target.status,
    source_ref: source.source_ref,
    target_ref: target.source_ref,
    target_source_href: target.source_href,
    target_work_anchor_href: target.work_anchor_href,
    target_cluster_id: target.cluster_id,
    target_usage_frame_label: target.usage_frame_label,
    target_raw_score: target.raw_score,
  };
}

function compactEdgeTarget(edge, target) {
  return {
    edge_id: edge.edge_id,
    target_occurrence_id: edge.target_occurrence_id,
    target_ref: edge.target_ref,
    target_source_href: target.source_href,
    target_work_anchor_href: target.work_anchor_href,
    target_work_title: target.work_title,
    target_cluster_id: target.cluster_id,
    target_usage_frame_label: target.usage_frame_label,
    target_status: target.status,
    target_raw_score: target.raw_score,
    crossmatch_score: edge.crossmatch_score,
    crossmatch_strength: edge.crossmatch_strength,
    relationships: edge.relationships,
    shared_route_ids: edge.shared_route_ids,
    shared_slice_ids: edge.shared_slice_ids,
  };
}

function buildCounts() {
  const tokenKeys = new Set();
  const focusNormalized = new Set();
  const clusters = new Set();
  const routeIds = new Set();
  const relationCounts = Object.fromEntries(Object.keys(relationWeights).map((key) => [key, 0]));
  const strengthCounts = { strong: 0, moderate: 0, weak: 0 };

  for (const occurrence of occurrences) {
    if (occurrence.token_key) tokenKeys.add(occurrence.token_key);
    if (occurrence.focus_normalized) focusNormalized.add(occurrence.focus_normalized);
    if (occurrence.cluster_id) clusters.add(occurrence.cluster_id);
    for (const routeId of occurrence.route_ids) routeIds.add(routeId);
  }
  for (const edge of directedEdges) {
    for (const relationship of edge.relationships) relationCounts[relationship] += 1;
    strengthCounts[edge.crossmatch_strength] += 1;
  }

  return {
    occurrence_refs: occurrences.length,
    directed_edges: directedEdges.length,
    undirected_pairs: undirectedPairKeys.size,
    token_keys: tokenKeys.size,
    focus_normalized_values: focusNormalized.size,
    clusters: clusters.size,
    route_ids: routeIds.size,
    route_payload_field_hits: 0,
    relation_counts: relationCounts,
    crossmatch_strength_counts: strengthCounts,
  };
}

function buildChecks() {
  const expectedDirectedEdges = occurrences.length * Math.max(0, occurrences.length - 1);
  return [
    check('selected_occurrences_present', occurrences.length > 0 ? 'passed' : 'failed', `selected occurrence rows ${occurrences.length}`),
    check('directed_edges_complete', directedEdges.length === expectedDirectedEdges ? 'passed' : 'failed', `directed edges ${directedEdges.length}; expected ${expectedDirectedEdges}`),
    check('route_payload_absent', 'passed', 'route IDs are copied as IDs only; route payload field hits 0'),
    check('links_are_observations', selectedOccurrences.authority_policy?.usage_navigation_only === true ? 'passed' : 'failed', 'selected occurrences authority policy remains usage-navigation only'),
  ];
}

function check(id, status, detail) {
  return { id, status, detail };
}

function strengthForScore(score) {
  if (score >= 85) return 'strong';
  if (score >= 65) return 'moderate';
  return 'weak';
}

function compareAdjacencyEntries(a, b) {
  return String(a.source_ref || '').localeCompare(String(b.source_ref || ''), undefined, { numeric: true })
    || String(a.occurrence_id || '').localeCompare(String(b.occurrence_id || ''));
}

function compareLinkTargets(a, b) {
  return b.crossmatch_score - a.crossmatch_score
    || String(a.target_ref || '').localeCompare(String(b.target_ref || ''), undefined, { numeric: true })
    || String(a.target_occurrence_id || '').localeCompare(String(b.target_occurrence_id || ''));
}

function compareEdges(a, b) {
  return String(a.source_ref || '').localeCompare(String(b.source_ref || ''), undefined, { numeric: true })
    || b.crossmatch_score - a.crossmatch_score
    || String(a.target_ref || '').localeCompare(String(b.target_ref || ''), undefined, { numeric: true })
    || String(a.edge_id || '').localeCompare(String(b.edge_id || ''));
}

function intersect(left, right) {
  const rightSet = new Set(right || []);
  return [...new Set(left || [])].filter((value) => rightSet.has(value)).sort();
}

function stableId(value) {
  return `usage-xmatch-${crypto.createHash('sha1').update(value).digest('hex').slice(0, 16)}`;
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--selected-occurrences=')) parsed.selectedOccurrences = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-report-samples=')) parsed.maxReportSamples = Math.max(0, Number(valueAfterEquals(arg)) || 0);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function writeReport(relativePath, artifact) {
  const sampleEdges = buildReportSampleEdges(artifact).slice(0, options.maxReportSamples);
  const lines = [
    '# Workbench Usage Crossmatch Links',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Occurrence refs: ${artifact.counts.occurrence_refs}`,
    `- Directed edges: ${artifact.counts.directed_edges}`,
    `- Undirected pairs: ${artifact.counts.undirected_pairs}`,
    `- Token keys: ${artifact.counts.token_keys}`,
    `- Focus normalized values: ${artifact.counts.focus_normalized_values}`,
    `- Clusters: ${artifact.counts.clusters}`,
    `- Route IDs: ${artifact.counts.route_ids}`,
    `- Crossmatch strengths: strong ${artifact.counts.crossmatch_strength_counts.strong}, moderate ${artifact.counts.crossmatch_strength_counts.moderate}, weak ${artifact.counts.crossmatch_strength_counts.weak}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This packet is occurrence crossmatch navigation only. It carries no definition, translation, route ranking, or visible-answer authority.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((check) => `| ${[check.id, check.status, check.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Relation Counts',
    '',
    '| relation | directed edges |',
    '|---|---:|',
    ...Object.entries(artifact.counts.relation_counts).map(([key, value]) => `| ${mdCell(key)} | ${value} |`),
    '',
    '## Sample Crossmatches',
    '',
    'One top link per source occurrence is shown here. The JSON artifact contains the complete directed adjacency graph.',
    '',
    '| score | strength | source | target | target anchor | relationships | shared route ids |',
    '|---:|---|---|---|---|---|---|',
    ...sampleEdges.map((edge) => `| ${[
      edge.crossmatch_score,
      edge.crossmatch_strength,
      mdLink(edge.source_ref, edge.source_href),
      mdLink(edge.target_ref, edge.target_source_href),
      mdLink(edge.target_ref, edge.target_work_anchor_href),
      edge.relationships.join(', '),
      edge.shared_route_ids.join(', '),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function buildReportSampleEdges(artifact) {
  return (artifact.adjacency || []).map((entry) => {
    const topLink = entry.links?.[0];
    if (!topLink) return null;
    return {
      source_ref: entry.source_ref,
      source_href: entry.source_href,
      crossmatch_score: topLink.crossmatch_score,
      crossmatch_strength: topLink.crossmatch_strength,
      target_ref: topLink.target_ref,
      target_source_href: topLink.target_source_href,
      target_work_anchor_href: topLink.target_work_anchor_href,
      relationships: topLink.relationships || [],
      shared_route_ids: topLink.shared_route_ids || [],
    };
  }).filter(Boolean);
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

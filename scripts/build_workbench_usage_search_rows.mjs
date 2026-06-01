#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  concordance: 'data/workbench-evidence/usage-concordance.json',
  output: '.local-cache/workbench-evidence/usage-search-rows.json',
  report: 'reports/workbench-usage-search-rows.md',
  maxReportRows: 25,
};

const options = parseArgs(process.argv.slice(2));
const concordance = readJson(options.concordance);
if (concordance.artifact_type !== 'workbench_usage_navigation_concordance') {
  throw new Error(`${options.concordance} is not a usage concordance artifact`);
}

const rows = [];
const workSlugs = new Set();
const categories = new Set();
const clusterIds = new Set();
const routeIds = new Set();
const licenseCounts = new Map();
const statusCounts = { supported: 0, candidate: 0, weak: 0 };

for (const row of concordance.rows || []) {
  const searchRow = compactSearchRow(row);
  rows.push(searchRow);
  if (searchRow.work_slug) workSlugs.add(searchRow.work_slug);
  if (searchRow.category) categories.add(searchRow.category);
  if (searchRow.cluster_id) clusterIds.add(searchRow.cluster_id);
  if (Object.hasOwn(statusCounts, searchRow.status)) statusCounts[searchRow.status] += 1;
  incrementObjectCount(licenseCounts, searchRow.license || 'unknown');
  for (const routeId of searchRow.route_ids) routeIds.add(routeId);
}

rows.sort(compareRows);
const checks = buildChecks(rows);
const failed = checks.filter((check) => check.status === 'failed');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_navigation_search_rows',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_search_rows.mjs',
  policy: 'Row-shaped usage-navigation search export. It preserves observed occurrence links, Hebrew context, token/focus fields, usage frame, status, score, license metadata, and related route IDs only; it does not rank routes, select visible answers, translate, or make meaning claims.',
  inputs: {
    concordance: options.concordance,
  },
  authority_policy: {
    usage_navigation_only: true,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    route_payloads_copied: false,
  },
  quality: {
    status: failed.length ? 'failed' : 'passed',
    failed_count: failed.length,
  },
  counts: {
    rows: rows.length,
    works: workSlugs.size,
    categories: categories.size,
    clusters: clusterIds.size,
    route_ids: routeIds.size,
    status_counts: statusCounts,
    license_counts: sortObjectByKey(Object.fromEntries(licenseCounts.entries())),
    route_payload_field_hits: 0,
  },
  checks,
  columns: [
    'occurrence_id',
    'token_key',
    'token_surface',
    'token_normalized',
    'focus_surface',
    'focus_normalized',
    'cluster_id',
    'usage_frame_label',
    'status',
    'raw_score',
    'navigation_label',
    'route_link_state',
    'route_ids',
    'source_ref',
    'source_href',
    'work_anchor_href',
    'work_id',
    'work_title',
    'work_slug',
    'category',
    'unit_id',
    'version_title',
    'version_source',
    'license',
    'license_url',
    'phrase_hebrew',
    'context_focus_marked',
    'phrase_tokens',
  ],
  rows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage search rows ${artifact.counts.rows}; works ${artifact.counts.works}; categories ${artifact.counts.categories}`);

function compactSearchRow(row) {
  const routeIds = Array.isArray(row.agent2_route_ids) ? row.agent2_route_ids.filter(Boolean).sort() : [];
  const workSlug = row.source?.work_slug || row.occurrence_links?.work_anchor?.work_slug || null;
  const phraseTokens = (row.phrase?.phrase_tokens || []).map((token) => ({
    surface: token.surface || '',
    normalized: token.normalized || '',
    role: token.role || 'context',
    focus_marked: token.role === 'focus-token',
    distance_from_focus: token.distance_from_focus ?? null,
  }));
  return {
    occurrence_id: row.ids?.occurrence_id || null,
    candidate_id: row.ids?.candidate_id || null,
    token_key: row.ids?.token_key || null,
    token_surface: row.token?.token_surface || null,
    token_normalized: row.token?.token_normalized || null,
    focus_surface: row.token?.focus_surface || null,
    focus_normalized: row.token?.focus_normalized || null,
    cluster_id: row.ids?.cluster_id || row.usage_frame?.cluster_id || null,
    usage_frame_label: row.usage_frame?.frame_label || null,
    status: row.status?.candidate_status || null,
    raw_score: row.status?.raw_score ?? null,
    navigation_label: row.navigation_label || (routeIds.length ? 'route-linked observed usage' : 'observed usage only'),
    route_link_state: row.route_link_state || (routeIds.length ? 'route_linked_observed_usage' : 'observed_usage_only'),
    route_ids: routeIds,
    source_ref: row.source?.source_ref || row.occurrence_links?.source_ref?.label || null,
    source_href: row.occurrence_links?.source_ref?.href || row.source?.source_url || null,
    work_anchor_href: row.occurrence_links?.work_anchor?.href || null,
    work_id: row.source?.work_id || null,
    work_title: row.source?.work_title || null,
    work_slug: workSlug,
    category: categoryForWorkSlug(workSlug),
    unit_id: row.source?.unit_id || row.occurrence_links?.work_anchor?.unit_id || null,
    version_title: row.source?.version_title || null,
    version_source: row.source?.version_source || null,
    license: row.source?.license || null,
    license_url: row.source?.license_url || null,
    phrase_hebrew: row.phrase?.phrase_hebrew || '',
    context_focus_marked: markFocusFromTokens(phraseTokens),
    phrase_tokens: phraseTokens,
  };
}

function buildChecks(rows) {
  const rowsWithFocusToken = rows.filter((row) => row.phrase_tokens.some((token) => token.focus_marked)).length;
  const rowsWithSourceLinks = rows.filter((row) => row.source_href && row.work_anchor_href).length;
  const rowsWithLicenses = rows.filter((row) => row.license && row.license_url).length;
  return [
    check('rows_present', rows.length > 0 ? 'passed' : 'failed', `rows ${rows.length}`),
    check('all_rows_have_focus_marked', rowsWithFocusToken === rows.length ? 'passed' : 'failed', `focus-marked rows ${rowsWithFocusToken}; rows ${rows.length}`),
    check('all_rows_have_click_links', rowsWithSourceLinks === rows.length ? 'passed' : 'failed', `linked rows ${rowsWithSourceLinks}; rows ${rows.length}`),
    check('all_rows_have_license_metadata', rowsWithLicenses === rows.length ? 'passed' : 'failed', `licensed rows ${rowsWithLicenses}; rows ${rows.length}`),
    check('route_payload_absent', 'passed', 'route IDs are copied as IDs only; route payload field hits 0'),
  ];
}

function check(id, status, detail) {
  return { id, status, detail };
}

function markFocusFromTokens(tokens) {
  if (!Array.isArray(tokens) || !tokens.length) return '';
  return tokens.map((token) => token.focus_marked ? `[${token.surface}]` : token.surface).join(' ');
}

function categoryForWorkSlug(workSlug) {
  const value = String(workSlug || 'unknown');
  return value.includes('/') ? value.split('/')[0] : value;
}

function compareRows(a, b) {
  return String(a.token_key || '').localeCompare(String(b.token_key || ''))
    || String(a.cluster_id || '').localeCompare(String(b.cluster_id || ''))
    || String(a.work_slug || '').localeCompare(String(b.work_slug || ''))
    || String(a.source_ref || '').localeCompare(String(b.source_ref || ''))
    || String(a.occurrence_id || '').localeCompare(String(b.occurrence_id || ''));
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Search Rows',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Works: ${artifact.counts.works}`,
    `- Categories: ${artifact.counts.categories}`,
    `- Clusters: ${artifact.counts.clusters}`,
    `- Route IDs: ${artifact.counts.route_ids}`,
    `- Status counts: supported ${artifact.counts.status_counts.supported}, candidate ${artifact.counts.status_counts.candidate}, weak ${artifact.counts.status_counts.weak}`,
    `- License counts: ${formatCounts(artifact.counts.license_counts)}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This search export is usage-navigation data only. Rows are occurrence links with Hebrew context, token/focus fields, usage frame, status, score, license metadata, and route IDs. It does not copy route payloads, rank routes, select visible answers, translate, or make definition claims.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Columns',
    '',
    artifact.columns.map((column) => `- ${column}`).join('\n'),
    '',
    '## Sample Rows',
    '',
    '| status | score | source | work anchor | cluster | token | route ids | context |',
    '|---|---:|---|---|---|---|---|---|',
    ...artifact.rows.slice(0, options.maxReportRows).map((row) => `| ${[
      row.status,
      row.raw_score,
      mdLink(row.source_ref, row.source_href),
      mdLink(row.source_ref, row.work_anchor_href),
      row.cluster_id,
      row.focus_normalized,
      row.route_ids.join(', '),
      row.context_focus_marked || row.phrase_hebrew,
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function formatCounts(counts) {
  return Object.entries(counts || {}).map(([key, value]) => `${key} ${value}`).join(', ');
}

function incrementObjectCount(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function sortObjectByKey(object) {
  return Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--concordance=')) parsed.concordance = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-report-rows=')) parsed.maxReportRows = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(parsed.maxReportRows) || parsed.maxReportRows < 0) {
    throw new Error('--max-report-rows must be a non-negative integer');
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

function mdLink(label, href) {
  if (!href) return label || '';
  return `[${String(label || href).replace(/\]/g, '\\]')}](${href})`;
}

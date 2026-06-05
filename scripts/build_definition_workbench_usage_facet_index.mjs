#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  occurrenceDetailIndex: 'data/definitions/definition-workbench-usage-occurrence-detail-index.json',
  output: 'data/definitions/definition-workbench-usage-facet-index.json',
  report: 'reports/definition-workbench-usage-facet-index.md',
};
const facetSpecs = [
  ['route_id', 'related_route_ids'],
  ['token_key', 'token_key'],
  ['focus_normalized', 'focus_normalized'],
  ['cluster_id', 'cluster_id'],
  ['usage_frame', 'usage_frame_label'],
  ['status', 'status'],
  ['work', 'work_slug'],
  ['source_ref', 'source_ref'],
  ['provenance', 'provenance_key'],
  ['license', 'license_url'],
];

const options = parseArgs(process.argv.slice(2));
const detailIndex = readJson(options.occurrenceDetailIndex);

if (detailIndex.artifact_type !== 'definition_workbench_usage_occurrence_detail_index') {
  throw new Error(`${options.occurrenceDetailIndex} is not a Definition Workbench usage occurrence-detail index`);
}

const occurrenceDetails = detailIndex.occurrence_details || [];
const occurrenceRows = occurrenceDetails.map(toOccurrenceRow);
const facets = Object.fromEntries(facetSpecs.map(([facetKind, field]) => [facetKind, buildFacets(facetKind, field)]));
const routeConcentration = buildRouteConcentration();
const counts = buildCounts();
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_facet_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_facet_index.mjs',
  policy: 'Selected-scope Agent 3 Definition Workbench usage-navigation facet index. It supports search/filter/navigation over already validated occurrence detail rows and exposes route concentration as a governance warning. It is not a definition layer, semantic arbiter, route ranking surface, HUD implementation, publication claim, or accepted translation text source.',
  inputs: {
    occurrence_detail_index: options.occurrenceDetailIndex,
  },
  authority_policy: {
    usage_navigation_only: true,
    selected_scope_only: true,
    observed_usage_only: true,
    route_ids_only: true,
    source_license_required: true,
    reader_facing: false,
    copies_route_payloads: false,
    ranks_routes: false,
    selects_visible_result: false,
    semantic_arbitration: false,
    publication_claim: false,
  },
  route_concentration: routeConcentration,
  occurrence_rows: occurrenceRows,
  facets,
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts,
  checks,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);

console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Definition Workbench usage facet index ${artifact.quality.status}; occurrences ${counts.occurrence_rows}; facets ${counts.facets_total}; route facets ${counts.route_id_facets}; max route share ${counts.max_route_share_basis_points}/10000`);

function toOccurrenceRow(row) {
  return {
    occurrence_id: row.occurrence_id,
    detail_id: row.detail_id,
    row_id: row.row_id,
    token_key: row.token_key,
    token_surface: row.token_surface,
    token_normalized: row.token_normalized,
    focus_surface: row.focus_surface,
    focus_normalized: row.focus_normalized,
    usage_label: row.usage_label,
    navigation_label: row.navigation_label,
    status: row.status,
    raw_score: row.raw_score,
    cluster_id: row.cluster_id,
    usage_frame_label: row.usage_frame_label,
    source_ref: row.source_ref,
    source_href: row.source_href,
    work_title: row.work_title,
    work_slug: row.work_slug,
    work_anchor_href: row.work_anchor_href,
    context_focus_marked: row.context_focus_marked,
    related_route_ids: Array.isArray(row.related_route_ids) ? row.related_route_ids : [],
    route_sources: Array.isArray(row.route_sources) ? row.route_sources : [],
    route_resolution_status: row.route_resolution_status,
    unresolved_route_ids: Array.isArray(row.unresolved_route_ids) ? row.unresolved_route_ids : [],
    source_ref_bucket_key: row.source_ref_bucket_key,
    source_cluster_key: row.source_cluster_key,
    work_bucket_key: row.work_bucket_key,
    work_frame_key: row.work_frame_key,
    provenance_key: row.provenance_key,
    provenance_frame_key: row.provenance_frame_key,
    provenance_id: row.provenance_id,
    version_title: row.version_title,
    version_source: row.version_source,
    license: row.license,
    license_url: row.license_url,
    neighbor_summary: row.neighbor_summary || {},
    usage_boundary: {
      observed_usage_only: true,
      reader_facing: false,
      route_ids_only: true,
      not_answer_authority: true,
      not_definition_authority: true,
      not_semantic_arbitration: true,
    },
  };
}

function buildFacets(facetKind, field) {
  const buckets = new Map();
  for (const row of occurrenceRows) {
    const values = field === 'related_route_ids' ? row.related_route_ids : [row[field]];
    for (const value of values.filter((item) => item !== undefined && item !== null && item !== '')) {
      const key = String(value);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(row);
    }
  }
  return [...buckets.entries()]
    .sort((left, right) => right[1].length - left[1].length || left[0].localeCompare(right[0]))
    .map(([facetKey, rows], index) => buildFacet(facetKind, facetKey, rows, index));
}

function buildFacet(facetKind, facetKey, rows, index) {
  const routeIds = unique(rows.flatMap((row) => row.related_route_ids));
  const occurrenceIds = rows.map((row) => row.occurrence_id);
  const shareBasisPoints = occurrenceRows.length ? Math.round((rows.length / occurrenceRows.length) * 10000) : 0;
  return {
    facet_id: `${facetKind}-${hashText(facetKey)}`,
    facet_kind: facetKind,
    facet_key: facetKey,
    facet_label: facetLabel(facetKind, facetKey, rows),
    facet_rank: index + 1,
    occurrence_count: rows.length,
    selected_row_share_basis_points: shareBasisPoints,
    occurrence_ids: occurrenceIds,
    status_counts: countBy(rows, 'status'),
    cluster_ids: unique(rows.map((row) => row.cluster_id)),
    usage_frame_labels: unique(rows.map((row) => row.usage_frame_label)),
    source_refs: unique(rows.map((row) => row.source_ref)),
    work_slugs: unique(rows.map((row) => row.work_slug)),
    route_ids: routeIds,
    unresolved_route_ids: unique(rows.flatMap((row) => row.unresolved_route_ids)),
    license_urls: unique(rows.map((row) => row.license_url)),
    version_sources: unique(rows.map((row) => row.version_source)),
    provenance_keys: unique(rows.map((row) => row.provenance_key)),
    metadata_counts: {
      rows_with_source_link: rows.filter((row) => Boolean(row.source_href)).length,
      rows_with_work_anchor: rows.filter((row) => Boolean(row.work_anchor_href)).length,
      rows_with_context: rows.filter((row) => Boolean(row.context_focus_marked)).length,
      rows_with_focus_marker: rows.filter((row) => String(row.context_focus_marked || '').includes('[') && String(row.context_focus_marked || '').includes(']')).length,
      rows_with_license: rows.filter((row) => Boolean(row.license && row.license_url)).length,
      rows_with_version: rows.filter((row) => Boolean(row.version_title && row.version_source)).length,
      rows_with_route_ids: rows.filter((row) => row.related_route_ids.length > 0).length,
    },
    usage_boundary: {
      observed_usage_only: true,
      reader_facing: false,
      route_ids_only: true,
      not_answer_authority: true,
      not_definition_authority: true,
      not_semantic_arbitration: true,
    },
    sample_occurrence_links: rows.slice(0, 8).map((row) => ({
      occurrence_id: row.occurrence_id,
      source_ref: row.source_ref,
      source_href: row.source_href,
      work_anchor_href: row.work_anchor_href,
      status: row.status,
      raw_score: row.raw_score,
      cluster_id: row.cluster_id,
      usage_frame_label: row.usage_frame_label,
      related_route_ids: row.related_route_ids,
      license: row.license,
      license_url: row.license_url,
    })),
  };
}

function facetLabel(facetKind, facetKey, rows) {
  if (facetKind === 'work') return rows[0]?.work_title || facetKey;
  if (facetKind === 'license') return rows[0]?.license || facetKey;
  return facetKey;
}

function buildRouteConcentration() {
  const routeFacets = facets.route_id || [];
  const maxFacet = routeFacets[0] || null;
  const routeIds = unique(occurrenceRows.flatMap((row) => row.related_route_ids));
  const allSelectedRowsSameRoute = Boolean(maxFacet && maxFacet.occurrence_count === occurrenceRows.length && routeIds.length === 1);
  return {
    unique_route_ids: routeIds.length,
    route_ids: routeIds,
    max_route_occurrence_count: maxFacet?.occurrence_count || 0,
    max_route_share_basis_points: maxFacet?.selected_row_share_basis_points || 0,
    all_selected_rows_same_route: allSelectedRowsSameRoute,
    concentration_warning: allSelectedRowsSameRoute,
    warning_label: allSelectedRowsSameRoute
      ? 'selected usage rows are route-linked observed usage only and are not independent semantic route diversity'
      : null,
  };
}

function buildCounts() {
  const facetCounts = Object.fromEntries(Object.entries(facets).map(([key, rows]) => [`${key}_facets`, rows.length]));
  return {
    occurrence_rows: occurrenceRows.length,
    facet_groups: Object.keys(facets).length,
    facets_total: sum(Object.values(facets).map((rows) => rows.length)),
    ...facetCounts,
    route_ids: routeConcentration.unique_route_ids,
    max_route_occurrence_count: routeConcentration.max_route_occurrence_count,
    max_route_share_basis_points: routeConcentration.max_route_share_basis_points,
    route_concentration_warning: routeConcentration.concentration_warning ? 1 : 0,
    rows_with_source_link: occurrenceRows.filter((row) => Boolean(row.source_href)).length,
    rows_with_work_anchor: occurrenceRows.filter((row) => Boolean(row.work_anchor_href)).length,
    rows_with_context: occurrenceRows.filter((row) => Boolean(row.context_focus_marked)).length,
    rows_with_focus_marker: occurrenceRows.filter((row) => String(row.context_focus_marked || '').includes('[') && String(row.context_focus_marked || '').includes(']')).length,
    rows_with_license: occurrenceRows.filter((row) => Boolean(row.license && row.license_url)).length,
    rows_with_version: occurrenceRows.filter((row) => Boolean(row.version_title && row.version_source)).length,
    rows_with_route_ids: occurrenceRows.filter((row) => row.related_route_ids.length > 0).length,
    observed_usage_only_rows: occurrenceRows.length,
    reader_facing_rows: 0,
    route_payload_field_hits: 0,
    forbidden_authority_field_hits: 0,
    unresolved_route_ids: unique(occurrenceRows.flatMap((row) => row.unresolved_route_ids)).length,
  };
}

function buildChecks(counts) {
  return [
    check('occurrence_rows_present', counts.occurrence_rows > 0 ? 'passed' : 'failed', `rows ${counts.occurrence_rows}`),
    check('facet_groups_present', counts.facet_groups === facetSpecs.length && counts.facets_total > 0 ? 'passed' : 'failed', `groups/facets ${counts.facet_groups}/${counts.facets_total}`),
    check('metadata_complete', allEqual(counts.occurrence_rows, [
      counts.rows_with_source_link,
      counts.rows_with_work_anchor,
      counts.rows_with_context,
      counts.rows_with_focus_marker,
      counts.rows_with_license,
      counts.rows_with_version,
      counts.rows_with_route_ids,
      counts.observed_usage_only_rows,
    ]) ? 'passed' : 'failed', `rows/source/work/context/focus/license/version/routes ${counts.occurrence_rows}/${counts.rows_with_source_link}/${counts.rows_with_work_anchor}/${counts.rows_with_context}/${counts.rows_with_focus_marker}/${counts.rows_with_license}/${counts.rows_with_version}/${counts.rows_with_route_ids}`),
    check('route_concentration_marked', counts.route_ids === 1 && counts.max_route_share_basis_points === 10000 && counts.route_concentration_warning === 1 ? 'warning' : 'passed', `route IDs ${counts.route_ids}; max share ${counts.max_route_share_basis_points}/10000; warning ${counts.route_concentration_warning}`),
    check('usage_boundary_only', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 && counts.unresolved_route_ids === 0 ? 'passed' : 'failed', `reader-facing ${counts.reader_facing_rows}; route-payload ${counts.route_payload_field_hits}; forbidden ${counts.forbidden_authority_field_hits}; unresolved ${counts.unresolved_route_ids}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Definition Workbench Usage Facet Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Status: ${artifact.quality.status}`,
    `- Occurrence rows: ${artifact.counts.occurrence_rows}`,
    `- Facet groups / total facets: ${artifact.counts.facet_groups}/${artifact.counts.facets_total}`,
    `- Route IDs / max route share: ${artifact.counts.route_ids}/${artifact.counts.max_route_share_basis_points}/10000`,
    `- Route concentration warning: ${artifact.route_concentration.concentration_warning}`,
    `- Metadata complete rows: source ${artifact.counts.rows_with_source_link}, work ${artifact.counts.rows_with_work_anchor}, context ${artifact.counts.rows_with_context}, focus ${artifact.counts.rows_with_focus_marker}, license ${artifact.counts.rows_with_license}, version ${artifact.counts.rows_with_version}`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${artifact.counts.reader_facing_rows}/${artifact.counts.route_payload_field_hits}/${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Facets',
    '',
    '| facet group | facets |',
    '|---|---:|',
    ...Object.entries(artifact.facets).map(([facetKind, rows]) => `| ${mdCell(facetKind)} | ${rows.length} |`),
    '',
    '## Route Concentration',
    '',
    `- All selected rows same route: ${artifact.route_concentration.all_selected_rows_same_route}`,
    `- Warning label: ${artifact.route_concentration.warning_label || 'none'}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${mdCell(checkRow.id)} | ${checkRow.status} | ${mdCell(checkRow.detail)} |`),
    '',
    '## Boundary',
    '',
    'This facet index is selected-scope usage navigation only. It supports lookup/filter/navigation over occurrence links and does not rank routes, select visible answers, copy route payloads, arbitrate definitions, make publication claims, or provide accepted translation text.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function countBy(rows, field) {
  const counts = {};
  for (const row of rows) {
    const key = String(row[field] ?? '');
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])));
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null && value !== '').map(String))].sort();
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function allEqual(expected, values) {
  return values.every((value) => value === expected);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function hashText(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--occurrence-detail-index=')) parsed.occurrenceDetailIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(stripJsonBom(fs.readFileSync(path.join(root, relativePath), 'utf8')));
}

function stripJsonBom(text) {
  return text.replace(/^\uFEFF/, '');
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text, 'utf8');
}

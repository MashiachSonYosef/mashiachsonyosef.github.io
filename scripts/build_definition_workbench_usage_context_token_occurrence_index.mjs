#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  contextTokenLinks: 'data/definitions/definition-workbench-usage-context-token-links.json',
  output: 'data/definitions/definition-workbench-usage-context-token-occurrence-index.json',
  report: 'reports/definition-workbench-usage-context-token-occurrence-index.md',
};

const options = parseArgs(process.argv.slice(2));
const contextTokenLinks = readJson(options.contextTokenLinks);

if (contextTokenLinks.artifact_type !== 'definition_workbench_usage_context_token_links') {
  throw new Error(`${options.contextTokenLinks} is not a Definition Workbench usage context-token links packet`);
}

const links = contextTokenLinks.context_token_links || [];
const contextTokenOccurrenceRows = buildContextTokenOccurrenceRows(links);
const routeConcentration = buildRouteConcentration(links);
const counts = buildCounts(contextTokenOccurrenceRows, links, routeConcentration);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_context_token_occurrence_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_context_token_occurrence_index.mjs',
  lane_owner: 'Agent 3',
  policy: 'Selected-scope Agent 3 Definition Workbench usage-navigation reverse index. It groups Hebrew context-token appearance links by normalized token so consumers can navigate selected occurrence rows, source refs, work anchors, context snippets, and route IDs. It is not a definition, translation, ranking, semantic arbitration, public UI acceptance, publication claim, or accepted text source.',
  inputs: {
    context_token_links: options.contextTokenLinks,
  },
  authority_policy: {
    usage_navigation_only: true,
    selected_scope_only: true,
    observed_usage_only: true,
    context_token_reverse_lookup_only: true,
    route_ids_only: true,
    source_license_required: true,
    reader_facing: false,
    copies_route_payloads: false,
    copies_definition_payloads: false,
    ranks_routes: false,
    selects_visible_result: false,
    semantic_arbitration: false,
    reviewed_lexical_authority: false,
    accepted_translation_output: false,
    publication_readiness: false,
    publication_claim: false,
  },
  route_concentration: routeConcentration,
  context_token_occurrence_rows: contextTokenOccurrenceRows,
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
console.log(`Definition Workbench usage context-token occurrence index ${artifact.quality.status}; tokens ${counts.context_token_occurrence_rows}; links ${counts.context_token_link_rows}; occurrences ${counts.occurrence_rows}`);

function buildContextTokenOccurrenceRows(linkRows) {
  const buckets = new Map();
  for (const link of linkRows) {
    const normalized = link.context_normalized;
    if (!normalized) continue;
    const bucket = getBucket(buckets, normalized);
    bucket.context_token_ids.add(link.context_token_id);
    bucket.surface_samples.add(link.context_surface);
    bucket.context_token_link_ids.push(link.context_token_link_id);
    bucket.occurrence_ids.add(link.occurrence_id);
    bucket.detail_ids.add(link.detail_id);
    bucket.row_ids.add(link.row_id);
    bucket.status_counts[link.status] = (bucket.status_counts[link.status] || 0) + 1;
    bucket.context_link_role_counts[link.context_link_role] = (bucket.context_link_role_counts[link.context_link_role] || 0) + 1;
    bucket.cluster_ids.add(link.cluster_id);
    bucket.usage_frame_labels.add(link.usage_frame_label);
    bucket.source_refs.add(link.source_ref);
    bucket.source_hrefs.add(link.source_href);
    bucket.work_slugs.add(link.work_slug);
    bucket.work_anchor_hrefs.add(link.work_anchor_href);
    bucket.related_route_ids = new Set([...bucket.related_route_ids, ...unique(link.related_route_ids || [])]);
    bucket.licenses.add(link.license);
    bucket.license_urls.add(link.license_url);
    bucket.version_sources.add(link.version_source);
    bucket.provenance_ids.add(link.provenance_id);
    if (link.context_link_role === 'focus') bucket.focus_link_count += 1;
    if (link.context_link_role === 'context' || link.context_link_role === 'repeated_focus_context') bucket.context_link_count += 1;
    if (link.is_repeated_focus_token) bucket.repeated_focus_context_link_count += 1;
    if (link.cross_frame_context_token) bucket.cross_frame_link_count += 1;
    if (Number.isFinite(link.distance_from_focus) && link.distance_from_focus < 0) bucket.before_focus_count += 1;
    if (Number.isFinite(link.distance_from_focus) && link.distance_from_focus > 0) bucket.after_focus_count += 1;
    bucket.occurrence_links.push({
      context_token_link_id: link.context_token_link_id,
      occurrence_id: link.occurrence_id,
      detail_id: link.detail_id,
      row_id: link.row_id,
      context_surface: link.context_surface,
      context_link_role: link.context_link_role,
      focus_marked: link.focus_marked === true,
      is_repeated_focus_token: link.is_repeated_focus_token === true,
      distance_from_focus: link.distance_from_focus,
      source_ref: link.source_ref,
      source_href: link.source_href,
      work_anchor_href: link.work_anchor_href,
      context_focus_marked: link.context_focus_marked,
      status: link.status,
      raw_score: link.raw_score,
      cluster_id: link.cluster_id,
      usage_frame_label: link.usage_frame_label,
      related_route_ids: unique(link.related_route_ids || []),
      license: link.license,
      license_url: link.license_url,
      version_source: link.version_source,
    });
  }

  return [...buckets.values()]
    .map((bucket) => ({
      context_token_occurrence_index_id: `definition-workbench-usage-context-token-occurrence-${hash(bucket.context_normalized)}`,
      context_normalized: bucket.context_normalized,
      context_token_ids: [...bucket.context_token_ids].filter(Boolean).sort(),
      surface_samples: [...bucket.surface_samples].filter(Boolean).slice(0, 12),
      context_token_link_ids: bucket.context_token_link_ids,
      occurrence_ids: [...bucket.occurrence_ids].filter(Boolean).sort(),
      detail_ids: [...bucket.detail_ids].filter(Boolean).sort(),
      row_ids: [...bucket.row_ids].filter(Boolean).sort(),
      total_link_count: bucket.context_token_link_ids.length,
      occurrence_count: bucket.occurrence_ids.size,
      selected_row_share_basis_points: shareBasisPoints(bucket.occurrence_ids.size, countsSafeOccurrenceDenominator(linkRows)),
      focus_link_count: bucket.focus_link_count,
      context_link_count: bucket.context_link_count,
      repeated_focus_context_link_count: bucket.repeated_focus_context_link_count,
      cross_frame_link_count: bucket.cross_frame_link_count,
      cross_frame_context_token: bucket.cross_frame_link_count > 0 || bucket.cluster_ids.size > 1 || bucket.usage_frame_labels.size > 1,
      before_focus_count: bucket.before_focus_count,
      after_focus_count: bucket.after_focus_count,
      status_counts: bucket.status_counts,
      context_link_role_counts: bucket.context_link_role_counts,
      cluster_ids: [...bucket.cluster_ids].filter(Boolean).sort(),
      usage_frame_labels: [...bucket.usage_frame_labels].filter(Boolean).sort(),
      source_refs: [...bucket.source_refs].filter(Boolean).sort(),
      source_hrefs: [...bucket.source_hrefs].filter(Boolean).sort(),
      work_slugs: [...bucket.work_slugs].filter(Boolean).sort(),
      work_anchor_hrefs: [...bucket.work_anchor_hrefs].filter(Boolean).sort(),
      related_route_ids: [...bucket.related_route_ids].filter(Boolean).sort(),
      provenance_ids: [...bucket.provenance_ids].filter(Boolean).sort(),
      licenses: [...bucket.licenses].filter(Boolean).sort(),
      license_urls: [...bucket.license_urls].filter(Boolean).sort(),
      version_sources: [...bucket.version_sources].filter(Boolean).sort(),
      occurrence_links: bucket.occurrence_links.sort((a, b) => String(a.occurrence_id).localeCompare(String(b.occurrence_id))),
      usage_boundary: usageBoundary(),
    }))
    .sort((a, b) => b.occurrence_count - a.occurrence_count || b.total_link_count - a.total_link_count || a.context_normalized.localeCompare(b.context_normalized, 'he'));
}

function getBucket(buckets, normalized) {
  if (!buckets.has(normalized)) {
    buckets.set(normalized, {
      context_normalized: normalized,
      context_token_ids: new Set(),
      surface_samples: new Set(),
      context_token_link_ids: [],
      occurrence_ids: new Set(),
      detail_ids: new Set(),
      row_ids: new Set(),
      focus_link_count: 0,
      context_link_count: 0,
      repeated_focus_context_link_count: 0,
      cross_frame_link_count: 0,
      before_focus_count: 0,
      after_focus_count: 0,
      status_counts: {},
      context_link_role_counts: {},
      cluster_ids: new Set(),
      usage_frame_labels: new Set(),
      source_refs: new Set(),
      source_hrefs: new Set(),
      work_slugs: new Set(),
      work_anchor_hrefs: new Set(),
      related_route_ids: new Set(),
      provenance_ids: new Set(),
      licenses: new Set(),
      license_urls: new Set(),
      version_sources: new Set(),
      occurrence_links: [],
    });
  }
  return buckets.get(normalized);
}

function countsSafeOccurrenceDenominator(linkRows) {
  return new Set(linkRows.map((row) => row.occurrence_id).filter(Boolean)).size || 1;
}

function buildRouteConcentration(linkRows) {
  const routeCounts = new Map();
  for (const link of linkRows) {
    for (const routeId of unique(link.related_route_ids || [])) {
      routeCounts.set(routeId, (routeCounts.get(routeId) || 0) + 1);
    }
  }
  const total = [...routeCounts.values()].reduce((sum, count) => sum + count, 0);
  const max = Math.max(0, ...routeCounts.values());
  return {
    route_ids: [...routeCounts.keys()].sort(),
    unique_route_ids: routeCounts.size,
    route_link_rows: total,
    max_route_share_basis_points: shareBasisPoints(max, total || 1),
    concentration_warning: routeCounts.size <= 1,
    semantic_independence_claim_allowed: false,
  };
}

function buildCounts(rows, linkRows, routeConcentration) {
  const occurrenceIds = new Set();
  const sourceRefs = new Set();
  const works = new Set();
  const licenses = new Set();
  const versionSources = new Set();
  const routeIds = new Set();
  const unresolvedRouteIds = new Set();
  let focusLinkRows = 0;
  let contextLinkRows = 0;
  let repeatedFocusRows = 0;
  let crossFrameLinkRows = 0;
  let linkRowsWithSource = 0;
  let linkRowsWithWork = 0;
  let linkRowsWithContext = 0;
  let linkRowsWithFocus = 0;
  let linkRowsWithRoute = 0;
  let linkRowsWithLicense = 0;
  let linkRowsWithVersion = 0;
  let observedUsageOnlyRows = 0;
  let readerFacingRows = 0;
  let routePayloadHits = 0;
  let forbiddenAuthorityHits = 0;

  for (const link of linkRows) {
    occurrenceIds.add(link.occurrence_id);
    sourceRefs.add(link.source_ref);
    works.add(link.work_slug);
    licenses.add(link.license);
    versionSources.add(link.version_source);
    for (const routeId of unique(link.related_route_ids || [])) routeIds.add(routeId);
    for (const routeId of unique(link.unresolved_route_ids || [])) unresolvedRouteIds.add(routeId);
    if (link.context_link_role === 'focus') focusLinkRows += 1;
    if (link.context_link_role === 'context' || link.context_link_role === 'repeated_focus_context') contextLinkRows += 1;
    if (link.is_repeated_focus_token) repeatedFocusRows += 1;
    if (link.cross_frame_context_token) crossFrameLinkRows += 1;
    if (link.source_ref && link.source_href) linkRowsWithSource += 1;
    if (link.work_slug && link.work_anchor_href) linkRowsWithWork += 1;
    if (link.context_focus_marked) linkRowsWithContext += 1;
    if (link.focus_surface && link.focus_normalized) linkRowsWithFocus += 1;
    if ((link.related_route_ids || []).length > 0) linkRowsWithRoute += 1;
    if (link.license && link.license_url) linkRowsWithLicense += 1;
    if (link.version_title && link.version_source) linkRowsWithVersion += 1;
    if (link.usage_boundary?.observed_usage_only === true) observedUsageOnlyRows += 1;
    if (link.usage_boundary?.reader_facing === true) readerFacingRows += 1;
    if (hasAnyKey(link, ['route_payload', 'route_payloads', 'route_metadata'])) routePayloadHits += 1;
    if (hasAnyKey(link, forbiddenAuthorityKeys())) forbiddenAuthorityHits += 1;
  }

  return {
    context_token_occurrence_rows: rows.length,
    context_token_link_rows: linkRows.length,
    input_context_token_link_rows: Number(contextTokenLinks.counts?.context_token_link_rows || 0),
    occurrence_rows: occurrenceIds.size,
    input_occurrence_rows: Number(contextTokenLinks.counts?.occurrence_rows || 0),
    focus_link_rows: focusLinkRows,
    input_focus_link_rows: Number(contextTokenLinks.counts?.focus_marked_link_rows || 0),
    context_link_rows: contextLinkRows,
    input_context_link_rows: Number(contextTokenLinks.counts?.context_role_link_rows || 0),
    repeated_focus_context_link_rows: repeatedFocusRows,
    cross_frame_context_token_rows: rows.filter((row) => row.cross_frame_context_token).length,
    cross_frame_context_token_link_rows: crossFrameLinkRows,
    rows_with_focus_links: rows.filter((row) => row.focus_link_count > 0).length,
    rows_with_context_links: rows.filter((row) => row.context_link_count > 0).length,
    rows_with_repeated_focus_context_links: rows.filter((row) => row.repeated_focus_context_link_count > 0).length,
    rows_with_cross_frame_links: rows.filter((row) => row.cross_frame_link_count > 0).length,
    source_refs: sourceRefs.size,
    works: works.size,
    licenses: licenses.size,
    version_sources: versionSources.size,
    route_ids: routeIds.size,
    unresolved_route_ids: unresolvedRouteIds.size,
    max_route_share_basis_points: routeConcentration.max_route_share_basis_points,
    route_concentration_warning: routeConcentration.concentration_warning ? 1 : 0,
    link_rows_with_source_link: linkRowsWithSource,
    link_rows_with_work_anchor: linkRowsWithWork,
    link_rows_with_hebrew_context: linkRowsWithContext,
    link_rows_with_focus_marker: linkRowsWithFocus,
    link_rows_with_route_ids: linkRowsWithRoute,
    link_rows_with_license_metadata: linkRowsWithLicense,
    link_rows_with_version_metadata: linkRowsWithVersion,
    observed_usage_only_link_rows: observedUsageOnlyRows,
    reader_facing_rows: readerFacingRows,
    route_payload_field_hits: routePayloadHits,
    forbidden_authority_field_hits: forbiddenAuthorityHits,
  };
}

function buildChecks(counts) {
  return [
    check('context_token_occurrence_rows_present', counts.context_token_occurrence_rows > 0 ? 'passed' : 'failed', `rows ${counts.context_token_occurrence_rows}`),
    check('input_link_coverage_preserved', counts.context_token_link_rows === counts.input_context_token_link_rows && counts.focus_link_rows === counts.input_focus_link_rows && counts.context_link_rows === counts.input_context_link_rows && counts.occurrence_rows === counts.input_occurrence_rows ? 'passed' : 'failed', `links ${counts.context_token_link_rows}/${counts.input_context_token_link_rows}; focus ${counts.focus_link_rows}/${counts.input_focus_link_rows}; context ${counts.context_link_rows}/${counts.input_context_link_rows}; occurrences ${counts.occurrence_rows}/${counts.input_occurrence_rows}`),
    check('reverse_lookup_links_complete', counts.link_rows_with_source_link === counts.context_token_link_rows && counts.link_rows_with_work_anchor === counts.context_token_link_rows && counts.link_rows_with_hebrew_context === counts.context_token_link_rows && counts.link_rows_with_focus_marker === counts.context_token_link_rows && counts.link_rows_with_route_ids === counts.context_token_link_rows && counts.link_rows_with_license_metadata === counts.context_token_link_rows && counts.link_rows_with_version_metadata === counts.context_token_link_rows ? 'passed' : 'failed', `source/work/context/focus/route/license/version ${counts.link_rows_with_source_link}/${counts.link_rows_with_work_anchor}/${counts.link_rows_with_hebrew_context}/${counts.link_rows_with_focus_marker}/${counts.link_rows_with_route_ids}/${counts.link_rows_with_license_metadata}/${counts.link_rows_with_version_metadata}`),
    check('focus_and_context_roles_visible', counts.rows_with_focus_links > 0 && counts.rows_with_context_links > 0 && counts.rows_with_repeated_focus_context_links > 0 ? 'warning' : 'failed', `focus/context/repeated rows ${counts.rows_with_focus_links}/${counts.rows_with_context_links}/${counts.rows_with_repeated_focus_context_links}`),
    check('cross_frame_tokens_visible', counts.cross_frame_context_token_rows > 0 && counts.cross_frame_context_token_link_rows > 0 ? 'warning' : 'failed', `cross-frame rows/links ${counts.cross_frame_context_token_rows}/${counts.cross_frame_context_token_link_rows}`),
    check('route_ids_only', counts.route_ids > 0 && counts.unresolved_route_ids === 0 ? 'passed' : 'failed', `route IDs ${counts.route_ids}; unresolved ${counts.unresolved_route_ids}`),
    check('route_concentration_marked', counts.max_route_share_basis_points === 10000 && counts.route_concentration_warning === 1 ? 'warning' : 'failed', `max share ${counts.max_route_share_basis_points}/10000; warning ${counts.route_concentration_warning}`),
    check('usage_boundary_only', counts.observed_usage_only_link_rows === counts.context_token_link_rows && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `observed/reader-facing/payload/forbidden ${counts.observed_usage_only_link_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const topRows = artifact.context_token_occurrence_rows.slice(0, 25);
  const lines = [
    '# Definition Workbench Usage Context Token Occurrence Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Status: ${artifact.quality.status}`,
    `- Context-token occurrence rows: ${artifact.counts.context_token_occurrence_rows}`,
    `- Link rows / occurrence rows: ${artifact.counts.context_token_link_rows}/${artifact.counts.occurrence_rows}`,
    `- Focus/context/repeated-focus links: ${artifact.counts.focus_link_rows}/${artifact.counts.context_link_rows}/${artifact.counts.repeated_focus_context_link_rows}`,
    `- Cross-frame rows / links: ${artifact.counts.cross_frame_context_token_rows}/${artifact.counts.cross_frame_context_token_link_rows}`,
    `- Source refs / works / licenses / version sources: ${artifact.counts.source_refs}/${artifact.counts.works}/${artifact.counts.licenses}/${artifact.counts.version_sources}`,
    `- Route IDs / unresolved / max route share: ${artifact.counts.route_ids}/${artifact.counts.unresolved_route_ids}/${artifact.counts.max_route_share_basis_points}/10000`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${artifact.counts.reader_facing_rows}/${artifact.counts.route_payload_field_hits}/${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Top Reverse-Lookup Tokens',
    '',
    '| token | occurrence rows | links | focus | context | repeated focus | cross-frame | source refs | works |',
    '|---|---:|---:|---:|---:|---:|---|---:|---:|',
    ...topRows.map((row) => `| ${mdCell(row.context_normalized)} | ${row.occurrence_count} | ${row.total_link_count} | ${row.focus_link_count} | ${row.context_link_count} | ${row.repeated_focus_context_link_count} | ${row.cross_frame_context_token} | ${row.source_refs.length} | ${row.work_slugs.length} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${mdCell(checkRow.id)} | ${mdCell(checkRow.status)} | ${mdCell(checkRow.detail)} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function usageBoundary() {
  return {
    observed_usage_only: true,
    reader_facing: false,
    route_ids_only: true,
    context_token_reverse_lookup_only: true,
    not_answer_authority: true,
    not_definition_authority: true,
    not_semantic_arbitration: true,
  };
}

function forbiddenAuthorityKeys() {
  return [
    'definition',
    'definition_text',
    'meaning',
    'meaning_claim',
    'translation',
    'translation_text',
    'accepted_translation',
    'final_answer',
    'winner',
    'route_payload',
    'route_payloads',
    'route_metadata',
  ];
}

function hasAnyKey(value, keys) {
  if (!value || typeof value !== 'object') return false;
  for (const key of Object.keys(value)) {
    if (keys.includes(key)) return true;
    if (hasAnyKey(value[key], keys)) return true;
  }
  return false;
}

function check(id, status, detail) {
  return { id, status, detail };
}

function shareBasisPoints(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 10000);
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 12);
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--context-token-links=')) parsed.contextTokenLinks = cleanRelativePath(valueAfterEquals(arg));
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
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, value);
}

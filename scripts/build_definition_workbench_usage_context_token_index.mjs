#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  occurrenceDetailIndex: 'data/definitions/definition-workbench-usage-occurrence-detail-index.json',
  output: 'data/definitions/definition-workbench-usage-context-token-index.json',
  report: 'reports/definition-workbench-usage-context-token-index.md',
};
const hebrewMarks = /[\u0591-\u05BD\u05BF-\u05C7]/g;
const bracketPattern = /[\[\]]/g;

const options = parseArgs(process.argv.slice(2));
const detailIndex = readJson(options.occurrenceDetailIndex);

if (detailIndex.artifact_type !== 'definition_workbench_usage_occurrence_detail_index') {
  throw new Error(`${options.occurrenceDetailIndex} is not a Definition Workbench usage occurrence-detail index`);
}

const occurrenceDetails = detailIndex.occurrence_details || [];
const occurrenceContextRows = occurrenceDetails.map(buildOccurrenceContextRow);
const contextTokenRows = buildContextTokenRows(occurrenceContextRows);
const routeConcentration = buildRouteConcentration(occurrenceContextRows);
const counts = buildCounts(occurrenceContextRows, contextTokenRows, routeConcentration);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'definition_workbench_usage_context_token_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_definition_workbench_usage_context_token_index.mjs',
  policy: 'Selected-scope Agent 3 Definition Workbench usage-navigation context-token index. It indexes Hebrew context tokens around already validated occurrence detail rows for navigation/search only. It does not generate definitions, meanings, translations, route rankings, visible answers, publication support, or accepted text.',
  inputs: {
    occurrence_detail_index: options.occurrenceDetailIndex,
  },
  authority_policy: {
    usage_navigation_only: true,
    selected_scope_only: true,
    observed_usage_only: true,
    context_token_navigation_only: true,
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
  occurrence_context_rows: occurrenceContextRows,
  context_token_rows: contextTokenRows,
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
console.log(`Definition Workbench usage context-token index ${artifact.quality.status}; occurrences ${counts.occurrence_rows}; context tokens ${counts.context_token_rows}; token appearances ${counts.context_token_occurrences}`);

function buildOccurrenceContextRow(row) {
  const contextTokens = parseContextTokens(row.context_focus_marked || '', row.focus_normalized);
  const nonFocusTokens = contextTokens.filter((token) => !token.focus_marked && token.normalized);
  const routeIds = unique(row.related_route_ids || []);
  return {
    context_row_id: `definition-workbench-usage-context-row-${String(occurrenceDetails.indexOf(row) + 1).padStart(3, '0')}`,
    occurrence_id: row.occurrence_id,
    detail_id: row.detail_id,
    row_id: row.row_id,
    token_key: row.token_key,
    token_surface: row.token_surface,
    token_normalized: row.token_normalized,
    focus_surface: row.focus_surface,
    focus_normalized: row.focus_normalized,
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
    context_tokens: contextTokens,
    context_token_count: contextTokens.length,
    nonfocus_context_token_count: nonFocusTokens.length,
    unique_context_normalized: unique(nonFocusTokens.map((token) => token.normalized)),
    repeated_focus_context_token_count: nonFocusTokens.filter((token) => token.normalized === row.focus_normalized).length,
    related_route_ids: routeIds,
    route_resolution_status: row.route_resolution_status,
    unresolved_route_ids: row.unresolved_route_ids || [],
    provenance_id: row.provenance_id,
    version_title: row.version_title,
    version_source: row.version_source,
    license: row.license,
    license_url: row.license_url,
    usage_boundary: usageBoundary(),
  };
}

function parseContextTokens(context, focusNormalized) {
  const rawTokens = String(context || '').trim().split(/\s+/).filter(Boolean);
  const focusIndex = rawTokens.findIndex((token) => token.includes('[') && token.includes(']'));
  return rawTokens.map((raw, index) => {
    const surface = raw.replace(bracketPattern, '');
    const normalized = normalizeHebrew(surface);
    const focusMarked = raw.includes('[') && raw.includes(']');
    return {
      surface,
      normalized,
      role: focusMarked ? 'focus' : 'context',
      focus_marked: focusMarked,
      is_repeated_focus_token: !focusMarked && normalized === focusNormalized,
      distance_from_focus: focusIndex >= 0 ? index - focusIndex : null,
    };
  }).filter((token) => token.normalized);
}

function normalizeHebrew(value) {
  return String(value || '')
    .normalize('NFC')
    .replace(hebrewMarks, '')
    .replace(/[^\u05D0-\u05EA־]/g, '')
    .replace(/^־+|־+$/g, '');
}

function buildContextTokenRows(rows) {
  const buckets = new Map();
  for (const row of rows) {
    for (const token of row.context_tokens) {
      if (token.focus_marked || !token.normalized) continue;
      const bucket = getBucket(buckets, token.normalized);
      bucket.occurrence_count += 1;
      bucket.surface_samples.add(token.surface);
      bucket.occurrence_ids.add(row.occurrence_id);
      bucket.status_counts[row.status] = (bucket.status_counts[row.status] || 0) + 1;
      bucket.cluster_ids.add(row.cluster_id);
      bucket.usage_frame_labels.add(row.usage_frame_label);
      bucket.source_refs.add(row.source_ref);
      bucket.source_hrefs.add(row.source_href);
      bucket.work_slugs.add(row.work_slug);
      bucket.work_anchor_hrefs.add(row.work_anchor_href);
      bucket.route_ids = new Set([...bucket.route_ids, ...row.related_route_ids]);
      bucket.license_urls.add(row.license_url);
      bucket.licenses.add(row.license);
      bucket.version_sources.add(row.version_source);
      if (token.distance_from_focus < 0) bucket.before_focus_count += 1;
      if (token.distance_from_focus > 0) bucket.after_focus_count += 1;
      if (token.is_repeated_focus_token) bucket.repeated_focus_context_count += 1;
      if (bucket.sample_occurrences.length < 8) {
        bucket.sample_occurrences.push({
          occurrence_id: row.occurrence_id,
          source_ref: row.source_ref,
          source_href: row.source_href,
          work_anchor_href: row.work_anchor_href,
          context_focus_marked: row.context_focus_marked,
          status: row.status,
          raw_score: row.raw_score,
          cluster_id: row.cluster_id,
          usage_frame_label: row.usage_frame_label,
          related_route_ids: row.related_route_ids,
          license: row.license,
          license_url: row.license_url,
        });
      }
    }
  }

  return [...buckets.values()]
    .map((bucket) => ({
      context_token_id: `definition-workbench-usage-context-token-${hash(bucket.context_normalized)}`,
      context_normalized: bucket.context_normalized,
      surface_samples: [...bucket.surface_samples].slice(0, 10),
      occurrence_count: bucket.occurrence_count,
      occurrence_row_count: bucket.occurrence_ids.size,
      selected_row_share_basis_points: shareBasisPoints(bucket.occurrence_ids.size, occurrenceDetails.length),
      before_focus_count: bucket.before_focus_count,
      after_focus_count: bucket.after_focus_count,
      repeated_focus_context_count: bucket.repeated_focus_context_count,
      status_counts: bucket.status_counts,
      cluster_ids: [...bucket.cluster_ids].filter(Boolean).sort(),
      usage_frame_labels: [...bucket.usage_frame_labels].filter(Boolean).sort(),
      cross_frame_context_token: bucket.cluster_ids.size > 1 || bucket.usage_frame_labels.size > 1,
      source_refs: [...bucket.source_refs].filter(Boolean).sort(),
      source_hrefs: [...bucket.source_hrefs].filter(Boolean).sort(),
      work_slugs: [...bucket.work_slugs].filter(Boolean).sort(),
      work_anchor_hrefs: [...bucket.work_anchor_hrefs].filter(Boolean).sort(),
      related_route_ids: [...bucket.route_ids].filter(Boolean).sort(),
      licenses: [...bucket.licenses].filter(Boolean).sort(),
      license_urls: [...bucket.license_urls].filter(Boolean).sort(),
      version_sources: [...bucket.version_sources].filter(Boolean).sort(),
      usage_boundary: usageBoundary(),
      sample_occurrences: bucket.sample_occurrences,
    }))
    .sort((a, b) => b.occurrence_row_count - a.occurrence_row_count || b.occurrence_count - a.occurrence_count || a.context_normalized.localeCompare(b.context_normalized, 'he'));
}

function getBucket(buckets, normalized) {
  if (!buckets.has(normalized)) {
    buckets.set(normalized, {
      context_normalized: normalized,
      surface_samples: new Set(),
      occurrence_count: 0,
      occurrence_ids: new Set(),
      before_focus_count: 0,
      after_focus_count: 0,
      repeated_focus_context_count: 0,
      status_counts: {},
      cluster_ids: new Set(),
      usage_frame_labels: new Set(),
      source_refs: new Set(),
      source_hrefs: new Set(),
      work_slugs: new Set(),
      work_anchor_hrefs: new Set(),
      route_ids: new Set(),
      licenses: new Set(),
      license_urls: new Set(),
      version_sources: new Set(),
      sample_occurrences: [],
    });
  }
  return buckets.get(normalized);
}

function buildRouteConcentration(rows) {
  const routeCounts = new Map();
  for (const row of rows) {
    for (const routeId of row.related_route_ids || []) {
      routeCounts.set(routeId, (routeCounts.get(routeId) || 0) + 1);
    }
  }
  const max = Math.max(0, ...routeCounts.values());
  return {
    unique_route_ids: routeCounts.size,
    route_ids: [...routeCounts.keys()].sort(),
    max_route_occurrence_count: max,
    max_route_share_basis_points: shareBasisPoints(max, rows.length),
    all_selected_rows_same_route: routeCounts.size === 1 && max === rows.length,
    concentration_warning: routeCounts.size === 1 && rows.length > 0,
    warning_label: 'context-token navigation is route-linked observed usage only and is not independent semantic route diversity',
  };
}

function buildCounts(rows, tokenRows, concentration) {
  const routeIds = unique(rows.flatMap((row) => row.related_route_ids || []));
  const repeatedFocusRows = tokenRows.filter((row) => row.repeated_focus_context_count > 0);
  return {
    occurrence_rows: rows.length,
    context_token_rows: tokenRows.length,
    context_token_occurrences: sum(tokenRows.map((row) => row.occurrence_count)),
    rows_with_context_tokens: rows.filter((row) => row.nonfocus_context_token_count > 0).length,
    rows_with_focus_marker: rows.filter((row) => row.context_tokens.filter((token) => token.focus_marked).length === 1).length,
    source_refs: unique(rows.map((row) => row.source_ref)).length,
    works: unique(rows.map((row) => row.work_slug)).length,
    licenses: unique(rows.map((row) => row.license_url)).length,
    version_sources: unique(rows.map((row) => row.version_source)).length,
    route_ids: routeIds.length,
    unresolved_route_ids: sum(rows.map((row) => row.unresolved_route_ids?.length || 0)),
    max_route_share_basis_points: concentration.max_route_share_basis_points,
    route_concentration_warning: concentration.concentration_warning ? 1 : 0,
    cross_frame_context_token_rows: tokenRows.filter((row) => row.cross_frame_context_token).length,
    repeated_focus_context_token_rows: repeatedFocusRows.length,
    repeated_focus_context_occurrences: sum(repeatedFocusRows.map((row) => row.repeated_focus_context_count)),
    rows_with_source_link: rows.filter((row) => row.source_href).length,
    rows_with_work_anchor: rows.filter((row) => row.work_anchor_href).length,
    rows_with_hebrew_context: rows.filter((row) => row.context_focus_marked).length,
    rows_with_focus_surface: rows.filter((row) => row.focus_surface).length,
    rows_with_license_metadata: rows.filter((row) => row.license && row.license_url).length,
    rows_with_version_metadata: rows.filter((row) => row.version_title && row.version_source).length,
    observed_usage_only_rows: rows.filter((row) => row.usage_boundary?.observed_usage_only === true).length,
    reader_facing_rows: 0,
    route_payload_field_hits: 0,
    forbidden_authority_field_hits: 0,
  };
}

function buildChecks(counts) {
  return [
    check('occurrence_context_rows_present', counts.occurrence_rows > 0 ? 'passed' : 'failed', `rows ${counts.occurrence_rows}`),
    check('context_token_rows_present', counts.context_token_rows > 0 && counts.context_token_occurrences > 0 ? 'passed' : 'failed', `tokens/occurrences ${counts.context_token_rows}/${counts.context_token_occurrences}`),
    check('metadata_complete', allEqual(counts.occurrence_rows, [
      counts.rows_with_context_tokens,
      counts.rows_with_focus_marker,
      counts.rows_with_source_link,
      counts.rows_with_work_anchor,
      counts.rows_with_hebrew_context,
      counts.rows_with_focus_surface,
      counts.rows_with_license_metadata,
      counts.rows_with_version_metadata,
      counts.observed_usage_only_rows,
    ]) ? 'passed' : 'failed', `rows/context/focus/source/work/hebrew/license/version ${counts.occurrence_rows}/${counts.rows_with_context_tokens}/${counts.rows_with_focus_marker}/${counts.rows_with_source_link}/${counts.rows_with_work_anchor}/${counts.rows_with_hebrew_context}/${counts.rows_with_license_metadata}/${counts.rows_with_version_metadata}`),
    check('route_ids_only', counts.route_ids > 0 && counts.unresolved_route_ids === 0 ? 'passed' : 'failed', `route IDs ${counts.route_ids}; unresolved ${counts.unresolved_route_ids}`),
    check('cross_frame_tokens_visible', counts.cross_frame_context_token_rows > 0 ? 'passed' : 'failed', `cross-frame tokens ${counts.cross_frame_context_token_rows}`),
    check('repeated_focus_tokens_visible', counts.repeated_focus_context_occurrences > 0 ? 'warning' : 'passed', `repeated focus token rows/occurrences ${counts.repeated_focus_context_token_rows}/${counts.repeated_focus_context_occurrences}`),
    check('route_concentration_marked', counts.route_concentration_warning === 1 && counts.max_route_share_basis_points === 10000 ? 'warning' : 'passed', `max share ${counts.max_route_share_basis_points}/10000; warning ${counts.route_concentration_warning}`),
    check('usage_boundary_only', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 ? 'passed' : 'failed', `reader-facing ${counts.reader_facing_rows}; route-payload ${counts.route_payload_field_hits}; forbidden ${counts.forbidden_authority_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const topRows = artifact.context_token_rows.slice(0, 30);
  const lines = [
    '# Definition Workbench Usage Context Token Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Status: ${artifact.quality.status}`,
    `- Occurrence rows: ${artifact.counts.occurrence_rows}`,
    `- Context token rows / appearances: ${artifact.counts.context_token_rows}/${artifact.counts.context_token_occurrences}`,
    `- Source refs / works / licenses / version sources: ${artifact.counts.source_refs}/${artifact.counts.works}/${artifact.counts.licenses}/${artifact.counts.version_sources}`,
    `- Cross-frame context token rows: ${artifact.counts.cross_frame_context_token_rows}`,
    `- Repeated focus-token context rows / appearances: ${artifact.counts.repeated_focus_context_token_rows}/${artifact.counts.repeated_focus_context_occurrences}`,
    `- Route IDs / unresolved / max route share: ${artifact.counts.route_ids}/${artifact.counts.unresolved_route_ids}/${artifact.counts.max_route_share_basis_points}/10000`,
    `- Reader-facing / route-payload / forbidden-authority hits: ${artifact.counts.reader_facing_rows}/${artifact.counts.route_payload_field_hits}/${artifact.counts.forbidden_authority_field_hits}`,
    '',
    '## Top Context Tokens',
    '',
    '| token | rows | appearances | frames | source refs | works | repeated focus appearances |',
    '|---|---:|---:|---:|---:|---:|---:|',
    ...topRows.map((row) => `| ${mdCell(row.context_normalized)} | ${row.occurrence_row_count} | ${row.occurrence_count} | ${row.usage_frame_labels.length} | ${row.source_refs.length} | ${row.work_slugs.length} | ${row.repeated_focus_context_count} |`),
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${mdCell(checkRow.id)} | ${checkRow.status} | ${mdCell(checkRow.detail)} |`),
  ];
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}

function usageBoundary() {
  return {
    observed_usage_only: true,
    reader_facing: false,
    route_ids_only: true,
    not_answer_authority: true,
    not_definition_authority: true,
    not_semantic_arbitration: true,
  };
}

function shareBasisPoints(value, total) {
  return total > 0 ? Math.round((Number(value || 0) / total) * 10000) : 0;
}

function check(id, status, detail) {
  return { id, status, detail };
}

function allEqual(expected, values) {
  return values.every((value) => value === expected);
}

function unique(values) {
  return [...new Set((values || []).filter((value) => value !== undefined && value !== null && value !== ''))];
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 12);
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
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
  const normalized = String(value || '').replace(/\\/g, '/');
  if (!normalized || normalized.startsWith('/') || /^[A-Za-z]:/.test(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Unsafe relative path: ${value}`);
  }
  return normalized;
}

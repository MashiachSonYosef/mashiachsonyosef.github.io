#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrenceNavigationIndex: '.local-cache/workbench-evidence/usage-selected-occurrence-navigation-index.json',
  output: '.local-cache/workbench-evidence/usage-selected-focus-neighbor-index.json',
  report: 'reports/workbench-usage-selected-focus-neighbor-index.md',
  maxWindow: 3,
  maxSamples: 8,
};

const options = parseArgs(process.argv.slice(2));
const navigationIndex = readJson(options.selectedOccurrenceNavigationIndex);
if (navigationIndex.artifact_type !== 'workbench_usage_selected_occurrence_navigation_index') {
  throw new Error(`${options.selectedOccurrenceNavigationIndex} is not a selected occurrence navigation index`);
}

const sourceRows = Array.isArray(navigationIndex.navigation_rows) ? navigationIndex.navigation_rows : [];
const occurrence_rows = sourceRows.map((row) => buildOccurrenceRow(row, options)).sort(compareOccurrenceRows);
const neighbor_buckets = buildNeighborBuckets(occurrence_rows, options);
const counts = buildCounts(occurrence_rows, neighbor_buckets, navigationIndex);
const checks = buildChecks(counts);
const failedCount = checks.filter((check) => check.status !== 'passed').length;

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_focus_neighbor_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_focus_neighbor_index.mjs',
  policy: 'Selected focus-neighbor index for usage navigation. It records observed Hebrew tokens around the marked focus token, with source links, usage frames, route IDs, and provenance metadata only; it does not rank routes, select visible answers, translate, or make meaning claims.',
  inputs: {
    selected_occurrence_navigation_index: options.selectedOccurrenceNavigationIndex,
  },
  authority_policy: {
    usage_navigation_only: true,
    observed_usage_only: true,
    reader_facing: false,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    route_payloads_copied: false,
  },
  quality: {
    status: failedCount ? 'failed' : 'passed',
    failed_count: failedCount,
    warning_count: 0,
  },
  counts,
  checks,
  occurrence_rows,
  neighbor_buckets,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected focus-neighbor rows ${counts.occurrence_rows}; observations ${counts.neighbor_observations}; buckets ${counts.neighbor_buckets}; route payload hits ${counts.route_payload_field_hits}`);

function buildOccurrenceRow(row, options) {
  const parsed = parseMarkedContext(row.context_focus_marked || '', options.maxWindow);
  return {
    occurrence_id: row.occurrence_id,
    token_surface: row.token_surface || null,
    token_normalized: row.token_normalized || null,
    focus_surface: row.focus_surface || null,
    focus_normalized: row.focus_normalized || null,
    source_ref: row.source_ref || null,
    source_href: row.source_href || null,
    work_anchor_href: row.work_anchor_href || null,
    work_title: row.work_title || null,
    work_slug: row.work_slug || null,
    status: row.status || null,
    raw_score: row.raw_score ?? null,
    cluster_id: row.cluster_id || null,
    usage_frame_label: row.usage_frame_label || null,
    context_focus_marked: row.context_focus_marked || null,
    related_route_ids: Array.isArray(row.related_route_ids) ? row.related_route_ids : [],
    provenance_id: row.provenance_id || null,
    version_title: row.version_title || null,
    version_source: row.version_source || null,
    license: row.license || null,
    license_url: row.license_url || null,
    focus_marker_count: parsed.focus_marker_count,
    neighbor_tokens: parsed.neighbor_tokens,
    navigation_flags: {
      observed_usage_only: true,
      reader_facing: false,
      has_focus_marker: parsed.focus_marker_count === 1,
      has_neighbor_window: parsed.neighbor_tokens.length > 0,
      has_immediate_neighbor: parsed.neighbor_tokens.some((token) => Math.abs(token.offset) === 1),
      has_source_link: Boolean(row.source_href),
      has_work_anchor: Boolean(row.work_anchor_href),
      has_marked_context: Boolean(row.context_focus_marked),
      has_provenance: Boolean(row.provenance_id && row.license && row.license_url && row.version_source),
      route_ids_only: true,
    },
  };
}

function parseMarkedContext(context, maxWindow) {
  const matches = [...String(context || '').matchAll(/\[([^\]]+)\]/g)];
  const first = matches[0];
  if (!first) return { focus_marker_count: 0, neighbor_tokens: [] };
  const before = context.slice(0, first.index);
  const after = context.slice(first.index + first[0].length);
  const leftTokens = tokenizeHebrewContext(before).slice(-maxWindow).reverse();
  const rightTokens = tokenizeHebrewContext(after).slice(0, maxWindow);
  const neighborTokens = [];
  for (const [index, token] of leftTokens.entries()) {
    neighborTokens.push({ ...token, side: 'left', offset: -(index + 1) });
  }
  for (const [index, token] of rightTokens.entries()) {
    neighborTokens.push({ ...token, side: 'right', offset: index + 1 });
  }
  return {
    focus_marker_count: matches.length,
    neighbor_tokens: neighborTokens.sort((left, right) => left.offset - right.offset),
  };
}

function tokenizeHebrewContext(value) {
  return String(value || '')
    .split(/\s+/)
    .map(cleanTokenSurface)
    .filter(Boolean)
    .map((surface) => ({ surface, normalized: normalizeHebrewToken(surface) }))
    .filter((token) => token.normalized);
}

function cleanTokenSurface(value) {
  return String(value || '')
    .replace(/^[^\u0590-\u05FF]+|[^\u0590-\u05FF]+$/g, '')
    .trim();
}

function normalizeHebrewToken(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/[\u05F3\u05F4"'\u05BE\u05C0\u05C3\u05C6:.,;!?(){}\[\]<>]/g, '')
    .replace(/[^\u05D0-\u05EA]/g, '')
    .normalize('NFC')
    .trim();
}

function buildNeighborBuckets(rows, options) {
  const buckets = new Map();
  for (const row of rows) {
    for (const token of row.neighbor_tokens || []) {
      const key = `${token.offset}:${token.normalized}`;
      if (!buckets.has(key)) buckets.set(key, createBucket(token));
      addObservation(buckets.get(key), token, row, options);
    }
  }
  return [...buckets.values()].map(finalizeBucket).sort(compareBuckets);
}

function createBucket(token) {
  return {
    neighbor_bucket_id: `selected-focus-neighbor-${token.offset}-${stableHash(token.normalized)}`,
    offset: token.offset,
    side: token.side,
    token_normalized: token.normalized,
    token_surfaces: new Map(),
    status_counts: { supported: 0, candidate: 0, weak: 0 },
    frame_counts: new Map(),
    source_refs: new Set(),
    work_slugs: new Set(),
    route_ids: new Set(),
    provenance_ids: new Set(),
    licenses: new Set(),
    version_sources: new Set(),
    samples: [],
    counts: {
      observations: 0,
    },
  };
}

function addObservation(bucket, token, row, options) {
  bucket.counts.observations += 1;
  incrementMap(bucket.token_surfaces, token.surface || token.normalized);
  if (Object.hasOwn(bucket.status_counts, row.status)) bucket.status_counts[row.status] += 1;
  incrementMap(bucket.frame_counts, row.usage_frame_label || row.cluster_id || 'unlabeled');
  if (row.source_ref) bucket.source_refs.add(row.source_ref);
  if (row.work_slug) bucket.work_slugs.add(row.work_slug);
  for (const routeId of row.related_route_ids || []) bucket.route_ids.add(routeId);
  if (row.provenance_id) bucket.provenance_ids.add(row.provenance_id);
  if (row.license) bucket.licenses.add(row.license);
  if (row.version_source) bucket.version_sources.add(row.version_source);
  if (bucket.samples.length < options.maxSamples) {
    bucket.samples.push({
      occurrence_id: row.occurrence_id,
      source_ref: row.source_ref,
      source_href: row.source_href,
      work_anchor_href: row.work_anchor_href,
      work_title: row.work_title,
      status: row.status,
      raw_score: row.raw_score,
      usage_frame_label: row.usage_frame_label,
      cluster_id: row.cluster_id,
      context_focus_marked: row.context_focus_marked,
      license: row.license,
      license_url: row.license_url,
    });
  }
}

function finalizeBucket(bucket) {
  return {
    neighbor_bucket_id: bucket.neighbor_bucket_id,
    offset: bucket.offset,
    side: bucket.side,
    token_normalized: bucket.token_normalized,
    token_surfaces: mapToCountObjects(bucket.token_surfaces, 'surface'),
    status_counts: bucket.status_counts,
    frame_counts: mapToCountObjects(bucket.frame_counts, 'usage_frame_label'),
    source_refs: [...bucket.source_refs].sort(),
    work_slugs: [...bucket.work_slugs].sort(),
    route_ids: [...bucket.route_ids].sort(),
    provenance: {
      provenance_ids: [...bucket.provenance_ids].sort(),
      licenses: [...bucket.licenses].sort(),
      version_sources: [...bucket.version_sources].sort(),
    },
    samples: bucket.samples,
    counts: {
      observations: bucket.counts.observations,
      source_refs: bucket.source_refs.size,
      works: bucket.work_slugs.size,
      route_ids: bucket.route_ids.size,
      provenance_buckets: bucket.provenance_ids.size,
      licenses: bucket.licenses.size,
      version_sources: bucket.version_sources.size,
      samples: bucket.samples.length,
      samples_with_links: bucket.samples.filter((sample) => sample.source_href && sample.work_anchor_href).length,
      samples_with_context: bucket.samples.filter((sample) => sample.context_focus_marked).length,
    },
    navigation_flags: {
      observed_usage_only: true,
      reader_facing: false,
      route_ids_only: true,
    },
  };
}

function buildCounts(rows, buckets, navigationIndex) {
  const routeIds = sortedUnique(rows.flatMap((row) => row.related_route_ids || []));
  const provenanceIds = sortedUnique(rows.map((row) => row.provenance_id).filter(Boolean));
  const neighborObservations = rows.reduce((sum, row) => sum + row.neighbor_tokens.length, 0);
  const immediateNeighborObservations = rows.reduce((sum, row) => sum + row.neighbor_tokens.filter((token) => Math.abs(token.offset) === 1).length, 0);
  const uniqueOffsets = sortedUnique(buckets.map((bucket) => String(bucket.offset)));
  const uniqueTokens = sortedUnique(buckets.map((bucket) => bucket.token_normalized));
  return {
    occurrence_rows: rows.length,
    expected_occurrence_rows: Number(navigationIndex.counts?.rows || 0),
    rows_with_focus_marker: rows.filter((row) => row.navigation_flags.has_focus_marker).length,
    rows_with_neighbor_window: rows.filter((row) => row.navigation_flags.has_neighbor_window).length,
    rows_with_immediate_neighbor: rows.filter((row) => row.navigation_flags.has_immediate_neighbor).length,
    rows_with_source_link: rows.filter((row) => row.navigation_flags.has_source_link).length,
    rows_with_work_anchor: rows.filter((row) => row.navigation_flags.has_work_anchor).length,
    rows_with_marked_context: rows.filter((row) => row.navigation_flags.has_marked_context).length,
    rows_with_provenance: rows.filter((row) => row.navigation_flags.has_provenance).length,
    neighbor_observations: neighborObservations,
    immediate_neighbor_observations: immediateNeighborObservations,
    offsets: uniqueOffsets.length,
    neighbor_buckets: buckets.length,
    unique_neighbor_tokens: uniqueTokens.length,
    source_refs: sortedUnique(rows.map((row) => row.source_ref).filter(Boolean)).length,
    works: sortedUnique(rows.map((row) => row.work_slug).filter(Boolean)).length,
    usage_frames: sortedUnique(rows.map((row) => row.usage_frame_label).filter(Boolean)).length,
    route_ids: routeIds.length,
    provenance_buckets: provenanceIds.length,
    reader_facing_rows: rows.filter((row) => row.navigation_flags.reader_facing).length + buckets.filter((bucket) => bucket.navigation_flags.reader_facing).length,
    route_payload_field_hits: countForbiddenKeys(rows) + countForbiddenKeys(buckets),
  };
}

function buildChecks(counts) {
  return [
    check('selected_rows_present', counts.occurrence_rows > 0, `selected rows ${counts.occurrence_rows}`),
    check('selected_rows_complete', counts.occurrence_rows === counts.expected_occurrence_rows, `rows ${counts.occurrence_rows}; expected ${counts.expected_occurrence_rows}`),
    check('focus_markers_complete', counts.rows_with_focus_marker === counts.occurrence_rows, `focus marker rows ${counts.rows_with_focus_marker}; rows ${counts.occurrence_rows}`),
    check('neighbor_windows_present', counts.rows_with_neighbor_window === counts.occurrence_rows, `neighbor-window rows ${counts.rows_with_neighbor_window}; rows ${counts.occurrence_rows}`),
    check('immediate_neighbors_present', counts.rows_with_immediate_neighbor > 0 && counts.immediate_neighbor_observations > 0, `immediate rows ${counts.rows_with_immediate_neighbor}; observations ${counts.immediate_neighbor_observations}`),
    check('neighbor_buckets_present', counts.neighbor_buckets > 0 && counts.unique_neighbor_tokens > 0, `buckets ${counts.neighbor_buckets}; tokens ${counts.unique_neighbor_tokens}`),
    check('source_links_complete', counts.rows_with_source_link === counts.occurrence_rows && counts.rows_with_work_anchor === counts.occurrence_rows, `source/work links ${counts.rows_with_source_link}/${counts.rows_with_work_anchor}; rows ${counts.occurrence_rows}`),
    check('context_and_provenance_complete', counts.rows_with_marked_context === counts.occurrence_rows && counts.rows_with_provenance === counts.occurrence_rows, `context/provenance ${counts.rows_with_marked_context}/${counts.rows_with_provenance}; rows ${counts.occurrence_rows}`),
    check('route_ids_present_without_payloads', counts.route_ids > 0 && counts.route_payload_field_hits === 0, `route IDs ${counts.route_ids}; payload hits ${counts.route_payload_field_hits}`),
    check('reader_facing_blocked', counts.reader_facing_rows === 0, `reader-facing rows ${counts.reader_facing_rows}`),
  ];
}

function check(id, passed, detail) {
  return { id, status: passed ? 'passed' : 'failed', detail };
}

function compareOccurrenceRows(left, right) {
  return String(left.source_ref || '').localeCompare(String(right.source_ref || ''))
    || String(left.occurrence_id || '').localeCompare(String(right.occurrence_id || ''));
}

function compareBuckets(left, right) {
  return left.offset - right.offset
    || right.counts.observations - left.counts.observations
    || String(left.token_normalized).localeCompare(String(right.token_normalized));
}

function incrementMap(map, key) {
  const normalizedKey = String(key || 'unknown');
  map.set(normalizedKey, (map.get(normalizedKey) || 0) + 1);
}

function mapToCountObjects(map, keyName) {
  return [...map.entries()]
    .sort(([left], [right]) => String(left).localeCompare(String(right)))
    .map(([key, count]) => ({ [keyName]: key, count }));
}

function countForbiddenKeys(value) {
  const forbidden = new Set([
    'definition',
    'definition_text',
    'meaning',
    'meaning_claim',
    'translation',
    'translation_text',
    'english',
    'english_text',
    'english_translation',
    'imported_translation',
    'final_answer',
    'winner',
    'route_payload',
    'route_payloads',
    'route_links',
  ]);
  let hits = 0;
  walk(value);
  return hits;

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (forbidden.has(key)) hits += 1;
      walk(child);
    }
  }
}

function stableHash(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function sortedUnique(values) {
  return [...new Set(values)].sort((left, right) => String(left).localeCompare(String(right)));
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Focus Neighbor Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Occurrence rows: ${artifact.counts.occurrence_rows}`,
    `- Neighbor observations: ${artifact.counts.neighbor_observations}`,
    `- Immediate neighbor observations: ${artifact.counts.immediate_neighbor_observations}`,
    `- Offsets: ${artifact.counts.offsets}`,
    `- Neighbor buckets: ${artifact.counts.neighbor_buckets}`,
    `- Unique neighbor tokens: ${artifact.counts.unique_neighbor_tokens}`,
    `- Source refs / works / frames: ${artifact.counts.source_refs}/${artifact.counts.works}/${artifact.counts.usage_frames}`,
    `- Route IDs / provenance buckets: ${artifact.counts.route_ids}/${artifact.counts.provenance_buckets}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((row) => `| ${mdCell(row.id)} | ${mdCell(row.status)} | ${mdCell(row.detail)} |`),
    '',
    '## Neighbor Buckets',
    '',
    '| offset | token | observations | sources | works | frames | route IDs | samples |',
    '|---:|---|---:|---:|---:|---:|---:|---:|',
    ...artifact.neighbor_buckets.slice(0, 80).map((row) => `| ${row.offset} | ${mdCell(row.token_normalized)} | ${row.counts.observations} | ${row.counts.source_refs} | ${row.counts.works} | ${row.frame_counts.length} | ${row.counts.route_ids} | ${row.counts.samples} |`),
    '',
    '## Boundary',
    '',
    'This neighbor index is observed usage navigation only. It indexes Hebrew context tokens around the marked focus token and carries route IDs as IDs only; it does not rank routes, select visible answers, translate, or assert semantic conclusions.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--selected-occurrence-navigation-index=')) parsed.selectedOccurrenceNavigationIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-window=')) parsed.maxWindow = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples=')) parsed.maxSamples = Number(valueAfterEquals(arg));
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

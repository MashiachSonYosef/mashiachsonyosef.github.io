#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedFocusNeighborIndex: '.local-cache/workbench-evidence/usage-selected-focus-neighbor-index.json',
  selectedFrameSummary: '.local-cache/workbench-evidence/usage-selected-frame-summary.json',
  output: '.local-cache/workbench-evidence/usage-selected-frame-neighbor-matrix.json',
  report: 'reports/workbench-usage-selected-frame-neighbor-matrix.md',
  maxSamplesPerCell: 5,
  maxNeighborsPerFrame: 12,
  maxComparisonRows: 40,
};

const options = parseArgs(process.argv.slice(2));
const focusNeighborIndex = readJson(options.selectedFocusNeighborIndex);
const frameSummary = readJson(options.selectedFrameSummary);
if (focusNeighborIndex.artifact_type !== 'workbench_usage_selected_focus_neighbor_index') {
  throw new Error(`${options.selectedFocusNeighborIndex} is not a selected focus-neighbor index`);
}
if (frameSummary.artifact_type !== 'workbench_usage_selected_frame_summary') {
  throw new Error(`${options.selectedFrameSummary} is not a selected frame summary`);
}

const frameIdByLabel = new Map((frameSummary.frame_rows || []).map((row) => [row.usage_frame_label, row.frame_id]));
const neighborCells = buildNeighborCells(focusNeighborIndex.occurrence_rows || []);
const frameRows = buildFrameRows(neighborCells, focusNeighborIndex.occurrence_rows || []);
const bucketComparison = buildBucketComparison(neighborCells, options);
const counts = buildCounts(frameRows, neighborCells, bucketComparison);
const checks = buildChecks(counts);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_frame_neighbor_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_frame_neighbor_matrix.mjs',
  policy: 'Audit-only selected frame-neighbor matrix. It groups observed Hebrew context tokens by selected usage frame, offset, and normalized neighbor token so QA can inspect shared and frame-specific usage signals; it does not rank routes, select visible answers, translate, copy route payloads, or assert semantic conclusions.',
  inputs: {
    selected_focus_neighbor_index: options.selectedFocusNeighborIndex,
    selected_frame_summary: options.selectedFrameSummary,
  },
  authority_policy: {
    usage_navigation_only: true,
    observed_usage_only: true,
    audit_only: true,
    reader_facing: false,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    route_payloads_copied: false,
  },
  quality: {
    status: failed.length ? 'failed' : warnings.length ? 'pass_with_warnings' : 'passed',
    warning_count: warnings.length,
    failed_count: failed.length,
  },
  counts,
  checks,
  frame_rows: frameRows,
  neighbor_cells: neighborCells,
  bucket_comparison: bucketComparison,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected frame-neighbor matrix frames ${counts.frame_rows}; cells ${counts.neighbor_cells}; observations ${counts.neighbor_observations}; shared ${counts.shared_neighbor_buckets}; frame-specific ${counts.frame_specific_neighbor_buckets}; route payload hits ${counts.route_payload_field_hits}`);

function buildNeighborCells(rows) {
  const cells = new Map();
  for (const row of rows) {
    const frameLabel = row.usage_frame_label || row.cluster_id || 'unlabeled usage frame';
    const frameId = frameIdByLabel.get(frameLabel) || slugify(`${row.cluster_id || 'cluster'}-${frameLabel}`);
    for (const token of row.neighbor_tokens || []) {
      const key = `${frameId}||${token.offset}||${token.normalized}`;
      if (!cells.has(key)) cells.set(key, createCell(frameId, frameLabel, token));
      addObservation(cells.get(key), token, row);
    }
  }
  return [...cells.values()].map(finalizeCell).sort(compareCells);
}

function createCell(frameId, frameLabel, token) {
  return {
    frame_neighbor_cell_id: `selected-frame-neighbor-${stableHash(`${frameId}:${token.offset}:${token.normalized}`)}`,
    neighbor_bucket_key: `${token.offset}:${token.normalized}`,
    frame_id: frameId,
    usage_frame_label: frameLabel,
    offset: token.offset,
    side: token.side,
    token_normalized: token.normalized,
    token_surfaces: new Map(),
    status_counts: { supported: 0, candidate: 0, weak: 0 },
    source_refs: new Set(),
    work_slugs: new Set(),
    route_ids: new Set(),
    provenance_ids: new Set(),
    licenses: new Set(),
    version_sources: new Set(),
    samples: [],
    counts: {
      observations: 0,
      immediate_observations: 0,
    },
  };
}

function addObservation(cell, token, row) {
  cell.counts.observations += 1;
  if (Math.abs(Number(token.offset || 0)) === 1) cell.counts.immediate_observations += 1;
  incrementMap(cell.token_surfaces, token.surface || token.normalized);
  if (Object.hasOwn(cell.status_counts, row.status)) cell.status_counts[row.status] += 1;
  if (row.source_ref) cell.source_refs.add(row.source_ref);
  if (row.work_slug) cell.work_slugs.add(row.work_slug);
  for (const routeId of row.related_route_ids || []) cell.route_ids.add(routeId);
  if (row.provenance_id) cell.provenance_ids.add(row.provenance_id);
  if (row.license) cell.licenses.add(row.license);
  if (row.version_source) cell.version_sources.add(row.version_source);
  if (cell.samples.length < options.maxSamplesPerCell) {
    cell.samples.push({
      occurrence_id: row.occurrence_id,
      source_ref: row.source_ref,
      source_href: row.source_href,
      work_anchor_href: row.work_anchor_href,
      work_title: row.work_title,
      status: row.status,
      raw_score: row.raw_score,
      cluster_id: row.cluster_id,
      usage_frame_label: row.usage_frame_label,
      context_focus_marked: row.context_focus_marked,
      related_route_ids: row.related_route_ids || [],
      license: row.license,
      license_url: row.license_url,
      sample_flags: {
        observed_usage_only: true,
        reader_facing: false,
        audit_only: true,
        route_ids_only: true,
      },
    });
  }
}

function finalizeCell(cell) {
  return {
    frame_neighbor_cell_id: cell.frame_neighbor_cell_id,
    neighbor_bucket_key: cell.neighbor_bucket_key,
    frame_id: cell.frame_id,
    usage_frame_label: cell.usage_frame_label,
    offset: cell.offset,
    side: cell.side,
    token_normalized: cell.token_normalized,
    token_surfaces: mapToCountObjects(cell.token_surfaces, 'surface'),
    status_counts: cell.status_counts,
    source_refs: [...cell.source_refs].sort(),
    work_slugs: [...cell.work_slugs].sort(),
    route_ids: [...cell.route_ids].sort(),
    provenance: {
      provenance_ids: [...cell.provenance_ids].sort(),
      licenses: [...cell.licenses].sort(),
      version_sources: [...cell.version_sources].sort(),
    },
    counts: {
      observations: cell.counts.observations,
      immediate_observations: cell.counts.immediate_observations,
      source_refs: cell.source_refs.size,
      works: cell.work_slugs.size,
      route_ids: cell.route_ids.size,
      provenance_buckets: cell.provenance_ids.size,
      samples: cell.samples.length,
      samples_with_links: cell.samples.filter((sample) => sample.source_href && sample.work_anchor_href).length,
      samples_with_context: cell.samples.filter((sample) => sample.context_focus_marked).length,
    },
    navigation_flags: {
      observed_usage_only: true,
      reader_facing: false,
      audit_only: true,
      route_ids_only: true,
      has_route_ids: cell.route_ids.size > 0,
      has_provenance: cell.provenance_ids.size > 0,
    },
    samples: cell.samples.sort(compareSamples),
  };
}

function buildFrameRows(cells, occurrenceRows) {
  const frames = new Map();
  for (const row of occurrenceRows) {
    const frameLabel = row.usage_frame_label || row.cluster_id || 'unlabeled usage frame';
    const frameId = frameIdByLabel.get(frameLabel) || slugify(`${row.cluster_id || 'cluster'}-${frameLabel}`);
    if (!frames.has(frameId)) {
      frames.set(frameId, {
        frame_id: frameId,
        usage_frame_label: frameLabel,
        cluster_ids: new Set(),
        occurrence_ids: new Set(),
        source_refs: new Set(),
        work_slugs: new Set(),
        route_ids: new Set(),
        provenance_ids: new Set(),
        status_counts: { supported: 0, candidate: 0, weak: 0 },
      });
    }
    const frame = frames.get(frameId);
    frame.cluster_ids.add(row.cluster_id);
    frame.occurrence_ids.add(row.occurrence_id);
    if (row.source_ref) frame.source_refs.add(row.source_ref);
    if (row.work_slug) frame.work_slugs.add(row.work_slug);
    for (const routeId of row.related_route_ids || []) frame.route_ids.add(routeId);
    if (row.provenance_id) frame.provenance_ids.add(row.provenance_id);
    if (Object.hasOwn(frame.status_counts, row.status)) frame.status_counts[row.status] += 1;
  }
  const cellsByFrame = groupBy(cells, (cell) => cell.frame_id);
  return [...frames.values()].map((frame) => {
    const frameCells = cellsByFrame.get(frame.frame_id) || [];
    const offsets = new Set(frameCells.map((cell) => cell.offset));
    const tokens = new Set(frameCells.map((cell) => cell.token_normalized));
    const neighborObservations = frameCells.reduce((sum, cell) => sum + Number(cell.counts?.observations || 0), 0);
    const immediateObservations = frameCells.reduce((sum, cell) => sum + Number(cell.counts?.immediate_observations || 0), 0);
    return {
      frame_id: frame.frame_id,
      usage_frame_label: frame.usage_frame_label,
      cluster_ids: [...frame.cluster_ids].sort(),
      selected_occurrence_rows: frame.occurrence_ids.size,
      status_counts: frame.status_counts,
      source_refs: [...frame.source_refs].sort(),
      work_slugs: [...frame.work_slugs].sort(),
      route_ids: [...frame.route_ids].sort(),
      provenance_ids: [...frame.provenance_ids].sort(),
      counts: {
        neighbor_cells: frameCells.length,
        neighbor_observations: neighborObservations,
        immediate_neighbor_observations: immediateObservations,
        offsets: offsets.size,
        unique_neighbor_tokens: tokens.size,
        source_refs: frame.source_refs.size,
        works: frame.work_slugs.size,
        route_ids: frame.route_ids.size,
        provenance_buckets: frame.provenance_ids.size,
      },
      top_neighbors: frameCells
        .slice()
        .sort((left, right) => Number(right.counts?.observations || 0) - Number(left.counts?.observations || 0) || Math.abs(left.offset) - Math.abs(right.offset) || left.token_normalized.localeCompare(right.token_normalized))
        .slice(0, options.maxNeighborsPerFrame)
        .map((cell) => ({
          neighbor_bucket_key: cell.neighbor_bucket_key,
          offset: cell.offset,
          side: cell.side,
          token_normalized: cell.token_normalized,
          observations: cell.counts.observations,
          source_refs: cell.counts.source_refs,
          works: cell.counts.works,
        })),
      navigation_flags: {
        observed_usage_only: true,
        reader_facing: false,
        audit_only: true,
        route_ids_only: true,
      },
    };
  }).sort(compareFrameRows);
}

function buildBucketComparison(cells, options) {
  const buckets = groupBy(cells, (cell) => cell.neighbor_bucket_key);
  const rows = [...buckets.entries()].map(([neighborBucketKey, bucketCells]) => {
    const frames = [...new Set(bucketCells.map((cell) => cell.frame_id))].sort();
    const routeIds = new Set();
    const sourceRefs = new Set();
    const works = new Set();
    for (const cell of bucketCells) {
      for (const routeId of cell.route_ids || []) routeIds.add(routeId);
      for (const sourceRef of cell.source_refs || []) sourceRefs.add(sourceRef);
      for (const work of cell.work_slugs || []) works.add(work);
    }
    const first = bucketCells[0];
    return {
      neighbor_bucket_key: neighborBucketKey,
      offset: first.offset,
      side: first.side,
      token_normalized: first.token_normalized,
      frame_count: frames.length,
      frames,
      observations: bucketCells.reduce((sum, cell) => sum + Number(cell.counts?.observations || 0), 0),
      source_refs: sourceRefs.size,
      works: works.size,
      route_ids: [...routeIds].sort(),
      cell_ids: bucketCells.map((cell) => cell.frame_neighbor_cell_id).sort(),
    };
  }).sort((left, right) => Number(right.observations || 0) - Number(left.observations || 0) || Math.abs(left.offset) - Math.abs(right.offset) || left.token_normalized.localeCompare(right.token_normalized));
  return {
    shared_neighbor_buckets: rows.filter((row) => row.frame_count > 1).slice(0, options.maxComparisonRows),
    frame_specific_neighbor_buckets: rows.filter((row) => row.frame_count === 1).slice(0, options.maxComparisonRows),
    counts: {
      all_neighbor_buckets: rows.length,
      shared_neighbor_buckets: rows.filter((row) => row.frame_count > 1).length,
      frame_specific_neighbor_buckets: rows.filter((row) => row.frame_count === 1).length,
      shared_neighbor_bucket_rows_listed: rows.filter((row) => row.frame_count > 1).slice(0, options.maxComparisonRows).length,
      frame_specific_neighbor_bucket_rows_listed: rows.filter((row) => row.frame_count === 1).slice(0, options.maxComparisonRows).length,
    },
  };
}

function buildCounts(frameRows, cells, comparison) {
  const sourceRefs = new Set();
  const works = new Set();
  const routeIds = new Set();
  const provenanceIds = new Set();
  const offsets = new Set();
  const tokens = new Set();
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  let observations = 0;
  let immediateObservations = 0;
  let readerFacingRows = 0;
  let routePayloadFieldHits = 0;
  for (const cell of cells) {
    observations += Number(cell.counts?.observations || 0);
    immediateObservations += Number(cell.counts?.immediate_observations || 0);
    offsets.add(cell.offset);
    tokens.add(cell.token_normalized);
    for (const sourceRef of cell.source_refs || []) sourceRefs.add(sourceRef);
    for (const work of cell.work_slugs || []) works.add(work);
    for (const routeId of cell.route_ids || []) routeIds.add(routeId);
    for (const provenanceId of cell.provenance?.provenance_ids || []) provenanceIds.add(provenanceId);
    for (const [status, count] of Object.entries(cell.status_counts || {})) {
      if (Object.hasOwn(statusCounts, status)) statusCounts[status] += Number(count || 0);
    }
    if (cell.navigation_flags?.reader_facing !== false) readerFacingRows += 1;
    for (const sample of cell.samples || []) {
      if (sample.sample_flags?.reader_facing !== false) readerFacingRows += 1;
    }
    routePayloadFieldHits += countForbiddenKeys(cell);
  }
  for (const frame of frameRows) {
    if (frame.navigation_flags?.reader_facing !== false) readerFacingRows += 1;
    routePayloadFieldHits += countForbiddenKeys(frame);
  }
  return {
    frame_rows: frameRows.length,
    expected_frame_rows: Number(frameSummary.counts?.frames || 0),
    occurrence_rows: Number(focusNeighborIndex.counts?.occurrence_rows || 0),
    neighbor_cells: cells.length,
    neighbor_observations: observations,
    expected_neighbor_observations: Number(focusNeighborIndex.counts?.neighbor_observations || 0),
    immediate_neighbor_observations: immediateObservations,
    offsets: offsets.size,
    unique_neighbor_tokens: tokens.size,
    source_refs: sourceRefs.size,
    works: works.size,
    route_ids: routeIds.size,
    provenance_buckets: provenanceIds.size,
    status_counts: statusCounts,
    shared_neighbor_buckets: comparison.counts.shared_neighbor_buckets,
    frame_specific_neighbor_buckets: comparison.counts.frame_specific_neighbor_buckets,
    shared_neighbor_bucket_rows_listed: comparison.counts.shared_neighbor_bucket_rows_listed,
    frame_specific_neighbor_bucket_rows_listed: comparison.counts.frame_specific_neighbor_bucket_rows_listed,
    reader_facing_rows: readerFacingRows,
    route_payload_field_hits: routePayloadFieldHits,
  };
}

function buildChecks(counts) {
  return [
    check('frame_rows_present', counts.frame_rows > 0 ? 'passed' : 'failed', `frame rows ${counts.frame_rows}`),
    check('frame_rows_complete', counts.frame_rows === counts.expected_frame_rows ? 'passed' : 'failed', `frame rows ${counts.frame_rows}; expected ${counts.expected_frame_rows}`),
    check('neighbor_cells_present', counts.neighbor_cells > 0 ? 'passed' : 'failed', `neighbor cells ${counts.neighbor_cells}`),
    check('neighbor_observations_complete', counts.neighbor_observations === counts.expected_neighbor_observations ? 'passed' : 'failed', `observations ${counts.neighbor_observations}; expected ${counts.expected_neighbor_observations}`),
    check('immediate_neighbors_present', counts.immediate_neighbor_observations > 0 ? 'passed' : 'failed', `immediate observations ${counts.immediate_neighbor_observations}`),
    check('shared_neighbor_buckets_visible', counts.shared_neighbor_buckets > 0 ? 'passed' : 'warning', `shared buckets ${counts.shared_neighbor_buckets}`),
    check('frame_specific_neighbor_buckets_visible', counts.frame_specific_neighbor_buckets > 0 ? 'passed' : 'warning', `frame-specific buckets ${counts.frame_specific_neighbor_buckets}`),
    check('route_ids_present_without_payloads', counts.route_ids > 0 && counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route IDs ${counts.route_ids}; payload hits ${counts.route_payload_field_hits}`),
    check('provenance_present', counts.provenance_buckets > 0 ? 'passed' : 'failed', `provenance buckets ${counts.provenance_buckets}`),
    check('reader_facing_blocked', counts.reader_facing_rows === 0 ? 'passed' : 'failed', `reader-facing rows ${counts.reader_facing_rows}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Frame Neighbor Matrix',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Frame rows: ${artifact.counts.frame_rows}`,
    `- Occurrence rows represented: ${artifact.counts.occurrence_rows}`,
    `- Neighbor cells: ${artifact.counts.neighbor_cells}`,
    `- Neighbor observations: ${artifact.counts.neighbor_observations}`,
    `- Immediate neighbor observations: ${artifact.counts.immediate_neighbor_observations}`,
    `- Offsets / unique neighbor tokens: ${artifact.counts.offsets}/${artifact.counts.unique_neighbor_tokens}`,
    `- Shared / frame-specific neighbor buckets: ${artifact.counts.shared_neighbor_buckets}/${artifact.counts.frame_specific_neighbor_buckets}`,
    `- Source refs / works / route IDs / provenance buckets: ${artifact.counts.source_refs}/${artifact.counts.works}/${artifact.counts.route_ids}/${artifact.counts.provenance_buckets}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Frame Rows',
    '',
    '| frame | occurrence rows | observations | cells | unique tokens | sources | works | route IDs | top neighbors |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---|',
    ...artifact.frame_rows.map((row) => `| ${[
      row.usage_frame_label || row.frame_id,
      row.selected_occurrence_rows,
      row.counts.neighbor_observations,
      row.counts.neighbor_cells,
      row.counts.unique_neighbor_tokens,
      row.counts.source_refs,
      row.counts.works,
      row.counts.route_ids,
      row.top_neighbors.map((neighbor) => `${neighbor.offset}:${neighbor.token_normalized} (${neighbor.observations})`).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Shared Neighbor Buckets',
    '',
    '| offset | token | observations | frames | sources | works | route IDs |',
    '|---:|---|---:|---:|---:|---:|---:|',
    ...artifact.bucket_comparison.shared_neighbor_buckets.map((row) => `| ${[
      row.offset,
      row.token_normalized,
      row.observations,
      row.frame_count,
      row.source_refs,
      row.works,
      row.route_ids.length,
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Frame-Specific Neighbor Buckets',
    '',
    '| offset | token | observations | frame | sources | works | route IDs |',
    '|---:|---|---:|---|---:|---:|---:|',
    ...artifact.bucket_comparison.frame_specific_neighbor_buckets.map((row) => `| ${[
      row.offset,
      row.token_normalized,
      row.observations,
      row.frames.join(', '),
      row.source_refs,
      row.works,
      row.route_ids.length,
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Boundary',
    '',
    'This matrix is observed usage navigation only. Shared or frame-specific neighbor buckets are distribution facts about selected Hebrew context rows, not definition authority or route-ranking evidence.',
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function compareCells(left, right) {
  return left.frame_id.localeCompare(right.frame_id)
    || Number(left.offset || 0) - Number(right.offset || 0)
    || left.token_normalized.localeCompare(right.token_normalized);
}

function compareFrameRows(left, right) {
  return String(left.usage_frame_label || '').localeCompare(String(right.usage_frame_label || ''));
}

function compareSamples(left, right) {
  return Number(right.raw_score || 0) - Number(left.raw_score || 0)
    || String(left.source_ref || '').localeCompare(String(right.source_ref || ''), undefined, { numeric: true });
}

function mapToCountObjects(map, keyName) {
  return [...map.entries()]
    .map(([value, count]) => ({ [keyName]: value, count }))
    .sort((left, right) => Number(right.count || 0) - Number(left.count || 0) || String(left[keyName] || '').localeCompare(String(right[keyName] || '')));
}

function incrementMap(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function groupBy(values, keyFn) {
  const grouped = new Map();
  for (const value of values) {
    const key = keyFn(value);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(value);
  }
  return grouped;
}

function sumStatusCounts(statusCounts) {
  return Object.values(statusCounts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
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

function check(id, status, detail) {
  return { id, status, detail };
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--selected-focus-neighbor-index=')) parsed.selectedFocusNeighborIndex = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-frame-summary=')) parsed.selectedFrameSummary = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples-per-cell=')) parsed.maxSamplesPerCell = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-neighbors-per-frame=')) parsed.maxNeighborsPerFrame = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-comparison-rows=')) parsed.maxComparisonRows = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function valueAfterEquals(arg) {
  return arg.slice(arg.indexOf('=') + 1);
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text);
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function slugify(value) {
  return String(value || 'row')
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'row';
}

function stableHash(value) {
  let hash = 2166136261;
  for (const char of String(value || '')) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

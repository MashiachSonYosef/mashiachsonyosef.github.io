#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrenceCards: '.local-cache/workbench-evidence/usage-selected-occurrence-cards.json',
  selectedRouteResolution: '.local-cache/workbench-evidence/usage-selected-route-resolution.json',
  selectedProvenanceMatrix: '.local-cache/workbench-evidence/usage-selected-provenance-matrix.json',
  output: '.local-cache/workbench-evidence/usage-selected-route-provenance-audit.json',
  report: 'reports/workbench-usage-selected-route-provenance-audit.md',
};

const options = parseArgs(process.argv.slice(2));
const selectedCards = readJson(options.selectedOccurrenceCards);
const routeResolution = readJson(options.selectedRouteResolution);
const provenanceMatrix = readJson(options.selectedProvenanceMatrix);
if (selectedCards.artifact_type !== 'workbench_usage_selected_occurrence_cards') {
  throw new Error(`${options.selectedOccurrenceCards} is not a selected occurrence cards artifact`);
}
if (routeResolution.artifact_type !== 'workbench_usage_selected_route_resolution') {
  throw new Error(`${options.selectedRouteResolution} is not a selected route resolution artifact`);
}
if (provenanceMatrix.artifact_type !== 'workbench_usage_selected_provenance_matrix') {
  throw new Error(`${options.selectedProvenanceMatrix} is not a selected provenance matrix artifact`);
}

const provenanceByOccurrenceId = buildProvenanceLookup(provenanceMatrix.provenance_rows || []);
const routeById = new Map((routeResolution.routes || []).map((route) => [route.route_id, route]));
const routeRows = buildRouteRows(selectedCards.cards || []);
const checks = buildChecks(routeRows);
const failed = checks.filter((checkRow) => checkRow.status === 'failed');
const warnings = checks.filter((checkRow) => checkRow.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_route_provenance_audit',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_route_provenance_audit.mjs',
  policy: 'Audit-only selected route/provenance join. It links selected occurrence cards to route IDs and provenance buckets for QA; it does not rank routes, select visible answers, translate, copy route payloads, or assert authority.',
  inputs: {
    selected_occurrence_cards: options.selectedOccurrenceCards,
    selected_route_resolution: options.selectedRouteResolution,
    selected_provenance_matrix: options.selectedProvenanceMatrix,
  },
  authority_policy: {
    usage_navigation_only: true,
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
  counts: buildCounts(routeRows),
  checks,
  route_rows: routeRows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected route/provenance rows ${artifact.counts.route_rows}; route links ${artifact.counts.selected_route_links}; provenance buckets ${artifact.counts.provenance_buckets}`);

function buildRouteRows(cards) {
  const buckets = new Map();
  for (const card of cards) {
    for (const routeId of card.route_ids || []) {
      if (!buckets.has(routeId)) buckets.set(routeId, newRouteBucket(routeId));
      const bucket = buckets.get(routeId);
      const provenanceId = provenanceByOccurrenceId.get(card.occurrence_id);
      bucket.occurrence_ids.add(card.occurrence_id);
      bucket.source_refs.add(card.source_ref);
      bucket.work_anchors.add(card.work_anchor_href);
      bucket.works.add(card.work_slug || card.work_title);
      bucket.cluster_ids.add(card.cluster_id);
      bucket.usage_frames.add(card.usage_frame_label);
      bucket.provenance_ids.add(provenanceId);
      incrementObjectCount(bucket.provenance_counts, provenanceId || 'missing-provenance');
      incrementObjectCount(bucket.license_counts, card.license || 'unknown');
      incrementObjectCount(bucket.version_source_counts, card.version_source || 'unknown');
      if (Object.hasOwn(bucket.status_counts, card.status)) bucket.status_counts[card.status] += 1;
      bucket.sample_occurrences.push(sampleForCard(card, provenanceId));
    }
  }
  return [...buckets.values()].map(finalizeRouteBucket).sort(compareRoutes);
}

function newRouteBucket(routeId) {
  const route = routeById.get(routeId);
  return {
    route_id: routeId,
    route_identity: route
      ? {
          route_source: route.route_source,
          normalized: route.normalized,
          surface: route.surface,
          route_family: route.route_family,
          route_type: route.route_type,
          display_section: route.display_section,
          route_raw_score: route.route_raw_score,
        }
      : null,
    route_resolution: route
      ? {
          resolved_by_route_coverage: route.resolution?.resolved_by_route_coverage === true,
          resolved_by_route_link_check: route.resolution?.resolved_by_route_link_check === true,
          route_payload_copied: route.resolution?.route_payload_copied === true,
          reader_facing: route.resolution?.reader_facing === true,
          observed_usage_only: route.resolution?.observed_usage_only === true,
        }
      : null,
    occurrence_ids: new Set(),
    source_refs: new Set(),
    work_anchors: new Set(),
    works: new Set(),
    cluster_ids: new Set(),
    usage_frames: new Set(),
    provenance_ids: new Set(),
    provenance_counts: {},
    license_counts: {},
    version_source_counts: {},
    status_counts: { supported: 0, candidate: 0, weak: 0 },
    sample_occurrences: [],
  };
}

function finalizeRouteBucket(bucket) {
  return {
    route_id: bucket.route_id,
    route_identity: bucket.route_identity,
    route_resolution: bucket.route_resolution,
    selected_occurrence_rows: bucket.occurrence_ids.size,
    unique_source_refs: bucket.source_refs.size,
    unique_work_anchors: bucket.work_anchors.size,
    unique_works: bucket.works.size,
    cluster_ids: [...bucket.cluster_ids].filter(Boolean).sort(),
    usage_frames: [...bucket.usage_frames].filter(Boolean).sort(),
    provenance_ids: [...bucket.provenance_ids].filter(Boolean).sort(),
    provenance_counts: sortObjectByKey(bucket.provenance_counts),
    license_counts: sortObjectByKey(bucket.license_counts),
    version_source_counts: sortObjectByKey(bucket.version_source_counts),
    status_counts: bucket.status_counts,
    route_flags: {
      observed_usage_only: true,
      reader_facing: false,
      audit_only: true,
      route_payload_copied: bucket.route_resolution?.route_payload_copied === true,
      route_resolved: bucket.route_resolution?.resolved_by_route_coverage === true && bucket.route_resolution?.resolved_by_route_link_check === true,
    },
    sample_occurrences: bucket.sample_occurrences.sort(compareSamples),
  };
}

function sampleForCard(card, provenanceId) {
  return {
    occurrence_id: card.occurrence_id,
    provenance_id: provenanceId || null,
    token_key: card.token_key,
    token_surface: card.token_surface,
    token_normalized: card.token_normalized,
    focus_surface: card.focus_surface,
    focus_normalized: card.focus_normalized,
    source_ref: card.source_ref,
    source_href: card.source_href,
    work_anchor_href: card.work_anchor_href,
    work_title: card.work_title,
    work_slug: card.work_slug,
    status: card.status,
    raw_score: card.raw_score,
    cluster_id: card.cluster_id,
    usage_frame_label: card.usage_frame_label,
    context_focus_marked: card.context_focus_marked,
    version_title: card.version_title,
    version_source: card.version_source,
    license: card.license,
    license_url: card.license_url,
    sample_flags: {
      observed_usage_only: true,
      reader_facing: false,
      audit_only: true,
    },
  };
}

function buildProvenanceLookup(rows) {
  const lookup = new Map();
  for (const row of rows) {
    for (const sample of row.sample_occurrences || []) {
      lookup.set(sample.occurrence_id, row.provenance_id);
    }
  }
  return lookup;
}

function buildCounts(rows) {
  const routeIds = new Set();
  const provenanceIds = new Set();
  const works = new Set();
  const frames = new Set();
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  let selectedRouteLinks = 0;
  let unresolvedRouteRows = 0;
  let missingProvenanceRows = 0;
  let routePayloadCopiedRows = 0;
  let sampleOccurrences = 0;
  let readerFacingRows = 0;
  let routePayloadFieldHits = 0;
  for (const row of rows) {
    routeIds.add(row.route_id);
    if (row.route_flags?.route_resolved !== true) unresolvedRouteRows += 1;
    if (row.route_flags?.route_payload_copied === true) routePayloadCopiedRows += 1;
    if (row.route_flags?.reader_facing !== false) readerFacingRows += 1;
    selectedRouteLinks += row.selected_occurrence_rows;
    sampleOccurrences += row.sample_occurrences.length;
    for (const provenanceId of row.provenance_ids || []) provenanceIds.add(provenanceId);
    for (const frame of row.usage_frames || []) frames.add(frame);
    for (const [status, count] of Object.entries(row.status_counts || {})) {
      if (Object.hasOwn(statusCounts, status)) statusCounts[status] += Number(count || 0);
    }
    for (const sample of row.sample_occurrences || []) {
      if (sample.work_slug || sample.work_title) works.add(sample.work_slug || sample.work_title);
      if (!sample.provenance_id) missingProvenanceRows += 1;
      if (sample.sample_flags?.reader_facing !== false) readerFacingRows += 1;
    }
    routePayloadFieldHits += countForbiddenKeys(row);
  }
  return {
    route_rows: rows.length,
    selected_route_links: selectedRouteLinks,
    unique_route_ids: routeIds.size,
    provenance_buckets: provenanceIds.size,
    unique_works: works.size,
    usage_frames: frames.size,
    status_counts: statusCounts,
    unresolved_route_rows: unresolvedRouteRows,
    missing_provenance_rows: missingProvenanceRows,
    route_payload_copied_rows: routePayloadCopiedRows,
    sample_occurrences: sampleOccurrences,
    reader_facing_rows: readerFacingRows,
    route_payload_field_hits: routePayloadFieldHits,
  };
}

function buildChecks(rows) {
  const counts = buildCounts(rows);
  return [
    check('route_rows_present', counts.route_rows > 0 ? 'passed' : 'failed', `route rows ${counts.route_rows}`),
    check('selected_route_links_complete', counts.selected_route_links === Number(selectedCards.counts?.cards_with_route_ids || 0) ? 'passed' : 'failed', `route links ${counts.selected_route_links}; selected cards with route IDs ${selectedCards.counts?.cards_with_route_ids}`),
    check('route_resolution_rows_match', counts.unique_route_ids === Number(routeResolution.counts?.route_id_buckets || 0) ? 'passed' : 'failed', `route IDs ${counts.unique_route_ids}; route buckets ${routeResolution.counts?.route_id_buckets}`),
    check('provenance_present_for_each_sample', counts.missing_provenance_rows === 0 ? 'passed' : 'failed', `missing provenance rows ${counts.missing_provenance_rows}`),
    check('provenance_bucket_coverage', counts.provenance_buckets === Number(provenanceMatrix.counts?.provenance_buckets || 0) ? 'passed' : 'failed', `route/provenance buckets ${counts.provenance_buckets}; provenance matrix buckets ${provenanceMatrix.counts?.provenance_buckets}`),
    check('route_ids_resolved', counts.unresolved_route_rows === 0 ? 'passed' : 'failed', `unresolved route rows ${counts.unresolved_route_rows}`),
    check('route_payload_not_copied', counts.route_payload_copied_rows === 0 ? 'passed' : 'failed', `route payload copied rows ${counts.route_payload_copied_rows}`),
    check('samples_cover_route_links', counts.sample_occurrences === counts.selected_route_links ? 'passed' : 'failed', `samples ${counts.sample_occurrences}; route links ${counts.selected_route_links}`),
    check('status_counts_complete', sumStatusCounts(counts.status_counts) === counts.selected_route_links ? 'passed' : 'failed', `status rows ${sumStatusCounts(counts.status_counts)}; route links ${counts.selected_route_links}`),
    check('reader_facing_zero', counts.reader_facing_rows === 0 ? 'passed' : 'failed', `reader-facing rows ${counts.reader_facing_rows}`),
    check('route_payload_absent', counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route payload-like field hits ${counts.route_payload_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Route Provenance Audit',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Route rows: ${artifact.counts.route_rows}`,
    `- Selected route links: ${artifact.counts.selected_route_links}`,
    `- Provenance buckets: ${artifact.counts.provenance_buckets}`,
    `- Works: ${artifact.counts.unique_works}`,
    `- Usage frames: ${artifact.counts.usage_frames}`,
    `- Status counts: supported ${artifact.counts.status_counts.supported}, candidate ${artifact.counts.status_counts.candidate}, weak ${artifact.counts.status_counts.weak}`,
    `- Unresolved route rows: ${artifact.counts.unresolved_route_rows}`,
    `- Missing provenance rows: ${artifact.counts.missing_provenance_rows}`,
    `- Route payload copied rows: ${artifact.counts.route_payload_copied_rows}`,
    `- Sample occurrences: ${artifact.counts.sample_occurrences}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This audit joins selected occurrence rows to route IDs and provenance buckets. It keeps route identity and observed usage links only; it does not copy route payloads, rank routes, select visible answers, translate, or assert authority.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Route Rows',
    '',
    '| route ID | route type | rows | provenance buckets | works | frames | supported | candidate | weak | samples |',
    '|---|---|---:|---:|---:|---:|---:|---:|---:|---|',
    ...artifact.route_rows.map((row) => `| ${[
      row.route_id,
      row.route_identity?.route_type || '',
      row.selected_occurrence_rows,
      row.provenance_ids.length,
      row.unique_works,
      row.usage_frames.length,
      row.status_counts.supported,
      row.status_counts.candidate,
      row.status_counts.weak,
      row.sample_occurrences.slice(0, 8).map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function compareRoutes(a, b) {
  return b.selected_occurrence_rows - a.selected_occurrence_rows || String(a.route_id || '').localeCompare(String(b.route_id || ''));
}

function compareSamples(a, b) {
  return Number(b.raw_score || 0) - Number(a.raw_score || 0)
    || String(a.source_ref || '').localeCompare(String(b.source_ref || ''), undefined, { numeric: true });
}

function incrementObjectCount(target, key) {
  target[key] = Number(target[key] || 0) + 1;
}

function sortObjectByKey(value) {
  return Object.fromEntries(Object.entries(value || {}).sort(([a], [b]) => a.localeCompare(b)));
}

function sumStatusCounts(statusCounts) {
  return Object.values(statusCounts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
}

function check(id, status, detail) {
  return { id, status, detail };
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

  function walk(current) {
    if (Array.isArray(current)) {
      current.forEach(walk);
      return;
    }
    if (!current || typeof current !== 'object') return;
    for (const [key, item] of Object.entries(current)) {
      if (forbidden.has(key)) hits += 1;
      walk(item);
    }
  }
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--selected-occurrence-cards=')) parsed.selectedOccurrenceCards = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-route-resolution=')) parsed.selectedRouteResolution = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--selected-provenance-matrix=')) parsed.selectedProvenanceMatrix = cleanRelativePath(valueAfterEquals(arg));
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
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
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

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function mdLink(label, href) {
  return `[${String(label || '').replace(/\]/g, '\\]')}](${href})`;
}

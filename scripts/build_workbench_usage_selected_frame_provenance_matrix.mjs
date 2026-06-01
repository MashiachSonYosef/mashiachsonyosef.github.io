#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrenceCards: '.local-cache/workbench-evidence/usage-selected-occurrence-cards.json',
  selectedFrameSummary: '.local-cache/workbench-evidence/usage-selected-frame-summary.json',
  selectedProvenanceMatrix: '.local-cache/workbench-evidence/usage-selected-provenance-matrix.json',
  output: '.local-cache/workbench-evidence/usage-selected-frame-provenance-matrix.json',
  report: 'reports/workbench-usage-selected-frame-provenance-matrix.md',
};

const options = parseArgs(process.argv.slice(2));
const selectedCards = readJson(options.selectedOccurrenceCards);
const frameSummary = readJson(options.selectedFrameSummary);
const provenanceMatrix = readJson(options.selectedProvenanceMatrix);
if (selectedCards.artifact_type !== 'workbench_usage_selected_occurrence_cards') {
  throw new Error(`${options.selectedOccurrenceCards} is not a selected occurrence cards artifact`);
}
if (frameSummary.artifact_type !== 'workbench_usage_selected_frame_summary') {
  throw new Error(`${options.selectedFrameSummary} is not a selected frame summary artifact`);
}
if (provenanceMatrix.artifact_type !== 'workbench_usage_selected_provenance_matrix') {
  throw new Error(`${options.selectedProvenanceMatrix} is not a selected provenance matrix artifact`);
}

const frameIdByLabel = new Map((frameSummary.frame_rows || []).map((row) => [row.usage_frame_label, row.frame_id]));
const provenanceByOccurrenceId = buildProvenanceLookup(provenanceMatrix.provenance_rows || []);
const provenanceMetaById = new Map((provenanceMatrix.provenance_rows || []).map((row) => [row.provenance_id, row]));
const matrixRows = buildRows(selectedCards.cards || []);
const checks = buildChecks(matrixRows);
const failed = checks.filter((checkRow) => checkRow.status === 'failed');
const warnings = checks.filter((checkRow) => checkRow.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_frame_provenance_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_frame_provenance_matrix.mjs',
  policy: 'Audit-only selected frame/provenance matrix. It groups selected occurrence cards by observed usage frame and provenance bucket for concentration review; it does not rank routes, select visible answers, translate, copy route payloads, or assert authority.',
  inputs: {
    selected_occurrence_cards: options.selectedOccurrenceCards,
    selected_frame_summary: options.selectedFrameSummary,
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
  counts: buildCounts(matrixRows),
  checks,
  matrix_rows: matrixRows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected frame/provenance matrix rows ${artifact.counts.matrix_rows}; selected rows ${artifact.counts.selected_rows}; provenance buckets ${artifact.counts.provenance_buckets}`);

function buildRows(cards) {
  const buckets = new Map();
  for (const card of cards) {
    const provenanceId = provenanceByOccurrenceId.get(card.occurrence_id);
    const provenance = provenanceMetaById.get(provenanceId);
    const frameLabel = card.usage_frame_label || card.cluster_id || 'unlabeled usage frame';
    const frameId = frameIdByLabel.get(frameLabel) || slugify(`${card.cluster_id || 'cluster'}-${frameLabel}`);
    const key = `${frameId}||${provenanceId || 'missing-provenance'}`;
    if (!buckets.has(key)) {
      buckets.set(key, {
        bucket_id: slugify(key),
        frame_id: frameId,
        usage_frame_label: frameLabel,
        provenance_id: provenanceId || null,
        license: provenance?.license || card.license,
        license_url: provenance?.license_url || card.license_url,
        version_title: provenance?.version_title || card.version_title,
        version_source: provenance?.version_source || card.version_source,
        occurrence_ids: new Set(),
        source_refs: new Set(),
        work_anchors: new Set(),
        works: new Set(),
        categories: new Set(),
        route_ids: new Set(),
        cluster_ids: new Set(),
        status_counts: { supported: 0, candidate: 0, weak: 0 },
        sample_occurrences: [],
      });
    }
    const bucket = buckets.get(key);
    bucket.occurrence_ids.add(card.occurrence_id);
    bucket.source_refs.add(card.source_ref);
    bucket.work_anchors.add(card.work_anchor_href);
    bucket.works.add(card.work_slug || card.work_title);
    bucket.categories.add(card.category);
    bucket.cluster_ids.add(card.cluster_id);
    for (const routeId of card.route_ids || []) bucket.route_ids.add(routeId);
    if (Object.hasOwn(bucket.status_counts, card.status)) bucket.status_counts[card.status] += 1;
    bucket.sample_occurrences.push(sampleForCard(card, provenanceId));
  }
  return [...buckets.values()].map(finalizeBucket).sort(compareRows);
}

function finalizeBucket(bucket) {
  return {
    bucket_id: bucket.bucket_id,
    frame_id: bucket.frame_id,
    usage_frame_label: bucket.usage_frame_label,
    provenance_id: bucket.provenance_id,
    license: bucket.license,
    license_url: bucket.license_url,
    version_title: bucket.version_title,
    version_source: bucket.version_source,
    selected_occurrence_rows: bucket.occurrence_ids.size,
    unique_source_refs: bucket.source_refs.size,
    unique_work_anchors: bucket.work_anchors.size,
    unique_works: bucket.works.size,
    categories: [...bucket.categories].filter(Boolean).sort(),
    cluster_ids: [...bucket.cluster_ids].filter(Boolean).sort(),
    route_ids: [...bucket.route_ids].sort(),
    status_counts: bucket.status_counts,
    matrix_flags: {
      observed_usage_only: true,
      reader_facing: false,
      audit_only: true,
      has_provenance: Boolean(bucket.provenance_id),
      has_route_ids: bucket.route_ids.size > 0,
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
    route_ids: card.route_ids || [],
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
    for (const sample of row.sample_occurrences || []) lookup.set(sample.occurrence_id, row.provenance_id);
  }
  return lookup;
}

function buildCounts(rows) {
  const frames = new Set();
  const provenanceIds = new Set();
  const routeIds = new Set();
  const works = new Set();
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  let selectedRows = 0;
  let missingProvenanceRows = 0;
  let sampleOccurrences = 0;
  let readerFacingRows = 0;
  let routePayloadFieldHits = 0;
  for (const row of rows) {
    frames.add(row.frame_id);
    if (row.provenance_id) provenanceIds.add(row.provenance_id);
    for (const routeId of row.route_ids || []) routeIds.add(routeId);
    selectedRows += row.selected_occurrence_rows;
    sampleOccurrences += row.sample_occurrences.length;
    if (row.matrix_flags?.reader_facing !== false) readerFacingRows += 1;
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
    matrix_rows: rows.length,
    selected_rows: selectedRows,
    frames: frames.size,
    provenance_buckets: provenanceIds.size,
    unique_works: works.size,
    unique_route_ids: routeIds.size,
    status_counts: statusCounts,
    missing_provenance_rows: missingProvenanceRows,
    sample_occurrences: sampleOccurrences,
    reader_facing_rows: readerFacingRows,
    route_payload_field_hits: routePayloadFieldHits,
  };
}

function buildChecks(rows) {
  const counts = buildCounts(rows);
  return [
    check('matrix_rows_present', counts.matrix_rows > 0 ? 'passed' : 'failed', `matrix rows ${counts.matrix_rows}`),
    check('selected_rows_complete', counts.selected_rows === Number(selectedCards.counts?.cards || 0) ? 'passed' : 'failed', `matrix rows ${counts.selected_rows}; selected cards ${selectedCards.counts?.cards}`),
    check('frame_coverage_complete', counts.frames === Number(frameSummary.counts?.frames || 0) ? 'passed' : 'failed', `matrix frames ${counts.frames}; frame summary frames ${frameSummary.counts?.frames}`),
    check('provenance_coverage_complete', counts.provenance_buckets === Number(provenanceMatrix.counts?.provenance_buckets || 0) ? 'passed' : 'failed', `matrix provenance buckets ${counts.provenance_buckets}; provenance buckets ${provenanceMatrix.counts?.provenance_buckets}`),
    check('provenance_present_for_each_sample', counts.missing_provenance_rows === 0 ? 'passed' : 'failed', `missing provenance rows ${counts.missing_provenance_rows}`),
    check('works_visible', counts.unique_works > 1 ? 'passed' : 'failed', `works ${counts.unique_works}`),
    check('route_ids_present', counts.unique_route_ids > 0 ? 'passed' : 'failed', `route IDs ${counts.unique_route_ids}`),
    check('samples_cover_rows', counts.sample_occurrences === counts.selected_rows ? 'passed' : 'failed', `samples ${counts.sample_occurrences}; selected rows ${counts.selected_rows}`),
    check('status_counts_complete', sumStatusCounts(counts.status_counts) === counts.selected_rows ? 'passed' : 'failed', `status rows ${sumStatusCounts(counts.status_counts)}; selected rows ${counts.selected_rows}`),
    check('reader_facing_zero', counts.reader_facing_rows === 0 ? 'passed' : 'failed', `reader-facing rows ${counts.reader_facing_rows}`),
    check('route_payload_absent', counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route payload-like field hits ${counts.route_payload_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Frame Provenance Matrix',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Matrix rows: ${artifact.counts.matrix_rows}`,
    `- Selected rows: ${artifact.counts.selected_rows}`,
    `- Frames: ${artifact.counts.frames}`,
    `- Provenance buckets: ${artifact.counts.provenance_buckets}`,
    `- Works: ${artifact.counts.unique_works}`,
    `- Route IDs: ${artifact.counts.unique_route_ids}`,
    `- Status counts: supported ${artifact.counts.status_counts.supported}, candidate ${artifact.counts.status_counts.candidate}, weak ${artifact.counts.status_counts.weak}`,
    `- Missing provenance rows: ${artifact.counts.missing_provenance_rows}`,
    `- Sample occurrences: ${artifact.counts.sample_occurrences}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This matrix crosses selected usage frames with provenance buckets for concentration review. It preserves observed usage links and license/version metadata without ranking routes, selecting visible answers, translating, or asserting authority.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Matrix',
    '',
    '| frame | provenance | license | version | rows | works | supported | candidate | weak | samples |',
    '|---|---|---|---|---:|---:|---:|---:|---:|---|',
    ...artifact.matrix_rows.map((row) => `| ${[
      row.usage_frame_label,
      row.provenance_id,
      `${row.license} (${row.license_url})`,
      row.version_title,
      row.selected_occurrence_rows,
      row.unique_works,
      row.status_counts.supported,
      row.status_counts.candidate,
      row.status_counts.weak,
      row.sample_occurrences.slice(0, 5).map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function compareRows(a, b) {
  return String(a.frame_id || '').localeCompare(String(b.frame_id || ''))
    || b.selected_occurrence_rows - a.selected_occurrence_rows
    || String(a.provenance_id || '').localeCompare(String(b.provenance_id || ''));
}

function compareSamples(a, b) {
  return Number(b.raw_score || 0) - Number(a.raw_score || 0)
    || String(a.source_ref || '').localeCompare(String(b.source_ref || ''), undefined, { numeric: true });
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'frame-provenance';
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
    else if (arg.startsWith('--selected-frame-summary=')) parsed.selectedFrameSummary = cleanRelativePath(valueAfterEquals(arg));
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

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrenceCards: '.local-cache/workbench-evidence/usage-selected-occurrence-cards.json',
  selectedFrameSummary: '.local-cache/workbench-evidence/usage-selected-frame-summary.json',
  output: '.local-cache/workbench-evidence/usage-selected-work-frame-matrix.json',
  report: 'reports/workbench-usage-selected-work-frame-matrix.md',
  maxSamplesPerBucket: 5,
};

const options = parseArgs(process.argv.slice(2));
const selectedCards = readJson(options.selectedOccurrenceCards);
const frameSummary = readJson(options.selectedFrameSummary);
if (selectedCards.artifact_type !== 'workbench_usage_selected_occurrence_cards') {
  throw new Error(`${options.selectedOccurrenceCards} is not a selected occurrence cards artifact`);
}
if (frameSummary.artifact_type !== 'workbench_usage_selected_frame_summary') {
  throw new Error(`${options.selectedFrameSummary} is not a selected frame summary artifact`);
}

const frameIdByLabel = new Map((frameSummary.frame_rows || []).map((row) => [row.usage_frame_label, row.frame_id]));
const matrixRows = buildRows(selectedCards.cards || []);
const checks = buildChecks(matrixRows);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_work_frame_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_work_frame_matrix.mjs',
  policy: 'Audit-only selected work/frame matrix. It groups selected occurrence cards by work and observed usage frame for navigation and QA; it does not rank routes, select visible answers, translate, or assert authority.',
  inputs: {
    selected_occurrence_cards: options.selectedOccurrenceCards,
    selected_frame_summary: options.selectedFrameSummary,
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
console.log(`Selected work/frame matrix rows ${artifact.counts.matrix_rows}; works ${artifact.counts.works}; frames ${artifact.counts.frames}; route payload hits ${artifact.counts.route_payload_field_hits}`);

function buildRows(cards) {
  const buckets = new Map();
  for (const card of cards) {
    const frameLabel = card.usage_frame_label || card.cluster_id || 'unlabeled usage frame';
    const frameId = frameIdByLabel.get(frameLabel) || slugify(`${card.cluster_id || 'cluster'}-${frameLabel}`);
    const workKey = card.work_slug || card.work_title || 'unknown-work';
    const key = `${workKey}||${frameId}`;
    if (!buckets.has(key)) {
      buckets.set(key, {
        bucket_id: slugify(key),
        work_slug: card.work_slug,
        work_title: card.work_title,
        category: card.category,
        usage_frame_label: frameLabel,
        frame_id: frameId,
        cluster_ids: new Set(),
        occurrence_ids: new Set(),
        source_refs: new Set(),
        work_anchors: new Set(),
        route_ids: new Set(),
        licenses: new Set(),
        status_counts: { supported: 0, candidate: 0, weak: 0 },
        raw_scores: [],
        samples: [],
      });
    }
    const bucket = buckets.get(key);
    bucket.cluster_ids.add(card.cluster_id);
    bucket.occurrence_ids.add(card.occurrence_id);
    bucket.source_refs.add(card.source_ref);
    bucket.work_anchors.add(card.work_anchor_href);
    for (const routeId of card.route_ids || []) bucket.route_ids.add(routeId);
    bucket.licenses.add(`${card.license || ''} ${card.license_url || ''}`.trim());
    if (Object.hasOwn(bucket.status_counts, card.status)) bucket.status_counts[card.status] += 1;
    bucket.raw_scores.push(Number(card.raw_score || 0));
    bucket.samples.push(sampleForCard(card));
  }
  return [...buckets.values()].map(finalizeBucket).sort(compareRows);
}

function finalizeBucket(bucket) {
  const sortedScores = bucket.raw_scores.slice().sort((a, b) => a - b);
  const scoreSum = bucket.raw_scores.reduce((sum, score) => sum + score, 0);
  const samples = bucket.samples
    .sort((a, b) => Number(b.raw_score || 0) - Number(a.raw_score || 0) || String(a.source_ref || '').localeCompare(String(b.source_ref || ''), undefined, { numeric: true }))
    .slice(0, options.maxSamplesPerBucket);
  return {
    bucket_id: bucket.bucket_id,
    work_slug: bucket.work_slug,
    work_title: bucket.work_title,
    category: bucket.category,
    usage_frame_label: bucket.usage_frame_label,
    frame_id: bucket.frame_id,
    cluster_ids: [...bucket.cluster_ids].sort(),
    selected_occurrence_rows: bucket.occurrence_ids.size,
    status_counts: bucket.status_counts,
    unique_source_refs: bucket.source_refs.size,
    unique_work_anchors: bucket.work_anchors.size,
    route_ids: [...bucket.route_ids].sort(),
    license_keys: [...bucket.licenses].sort(),
    raw_score_summary: {
      min: sortedScores[0] ?? null,
      max: sortedScores[sortedScores.length - 1] ?? null,
      average: bucket.raw_scores.length ? Number((scoreSum / bucket.raw_scores.length).toFixed(2)) : null,
    },
    matrix_flags: {
      observed_usage_only: true,
      reader_facing: false,
      audit_only: true,
      has_route_ids: bucket.route_ids.size > 0,
      multi_ref_bucket: bucket.source_refs.size > 1,
    },
    sample_occurrences: samples,
  };
}

function sampleForCard(card) {
  return {
    occurrence_id: card.occurrence_id,
    source_ref: card.source_ref,
    source_href: card.source_href,
    work_anchor_href: card.work_anchor_href,
    status: card.status,
    raw_score: card.raw_score,
    context_focus_marked: card.context_focus_marked,
    route_ids: card.route_ids || [],
    license: card.license,
    license_url: card.license_url,
    sample_flags: {
      observed_usage_only: true,
      reader_facing: false,
      audit_only: true,
    },
  };
}

function buildCounts(rows) {
  const works = new Set();
  const frames = new Set();
  const routeIds = new Set();
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  let selectedRows = 0;
  let sourceRefTotal = 0;
  let sampleRows = 0;
  let readerFacingRows = 0;
  let routePayloadFieldHits = 0;
  for (const row of rows) {
    works.add(row.work_slug || row.work_title);
    frames.add(row.frame_id);
    selectedRows += row.selected_occurrence_rows;
    sourceRefTotal += row.unique_source_refs;
    sampleRows += row.sample_occurrences.length;
    for (const routeId of row.route_ids || []) routeIds.add(routeId);
    for (const [status, count] of Object.entries(row.status_counts || {})) {
      if (Object.hasOwn(statusCounts, status)) statusCounts[status] += Number(count || 0);
    }
    if (row.matrix_flags?.reader_facing !== false) readerFacingRows += 1;
    for (const sample of row.sample_occurrences || []) {
      if (sample.sample_flags?.reader_facing !== false) readerFacingRows += 1;
    }
    routePayloadFieldHits += countForbiddenKeys(row);
  }
  return {
    matrix_rows: rows.length,
    selected_rows: selectedRows,
    works: works.size,
    frames: frames.size,
    unique_route_ids: routeIds.size,
    status_counts: statusCounts,
    source_ref_bucket_total: sourceRefTotal,
    sample_occurrences: sampleRows,
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
    check('work_coverage_visible', counts.works > 1 ? 'passed' : 'failed', `works ${counts.works}`),
    check('status_counts_complete', sumStatusCounts(counts.status_counts) === counts.selected_rows ? 'passed' : 'failed', `status rows ${sumStatusCounts(counts.status_counts)}; selected rows ${counts.selected_rows}`),
    check('route_ids_present', counts.unique_route_ids > 0 ? 'passed' : 'failed', `route IDs ${counts.unique_route_ids}`),
    check('samples_present', counts.sample_occurrences >= counts.matrix_rows ? 'passed' : 'failed', `samples ${counts.sample_occurrences}; matrix rows ${counts.matrix_rows}`),
    check('reader_facing_zero', counts.reader_facing_rows === 0 ? 'passed' : 'failed', `reader-facing rows ${counts.reader_facing_rows}`),
    check('route_payload_absent', counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route payload-like field hits ${counts.route_payload_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Work Frame Matrix',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Matrix rows: ${artifact.counts.matrix_rows}`,
    `- Selected rows: ${artifact.counts.selected_rows}`,
    `- Works: ${artifact.counts.works}`,
    `- Frames: ${artifact.counts.frames}`,
    `- Unique route IDs: ${artifact.counts.unique_route_ids}`,
    `- Status counts: supported ${artifact.counts.status_counts.supported}, candidate ${artifact.counts.status_counts.candidate}, weak ${artifact.counts.status_counts.weak}`,
    `- Source-ref bucket total: ${artifact.counts.source_ref_bucket_total}`,
    `- Sample occurrences: ${artifact.counts.sample_occurrences}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This matrix groups selected usage-navigation rows by work and frame for concordance navigation. It does not rank routes, select visible answers, translate, or assert authority.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Matrix',
    '',
    '| work | frame | rows | supported | candidate | weak | source refs | score avg | route IDs | samples |',
    '|---|---|---:|---:|---:|---:|---:|---:|---|---|',
    ...artifact.matrix_rows.map((row) => `| ${[
      row.work_title || row.work_slug,
      row.usage_frame_label,
      row.selected_occurrence_rows,
      row.status_counts.supported,
      row.status_counts.candidate,
      row.status_counts.weak,
      row.unique_source_refs,
      row.raw_score_summary.average,
      row.route_ids.join(', '),
      row.sample_occurrences.map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function sumStatusCounts(statusCounts) {
  return Object.values(statusCounts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
}

function compareRows(a, b) {
  return b.selected_occurrence_rows - a.selected_occurrence_rows
    || String(a.work_slug || '').localeCompare(String(b.work_slug || ''))
    || String(a.frame_id || '').localeCompare(String(b.frame_id || ''));
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'work-frame';
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
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples-per-bucket=')) parsed.maxSamplesPerBucket = Number(valueAfterEquals(arg));
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

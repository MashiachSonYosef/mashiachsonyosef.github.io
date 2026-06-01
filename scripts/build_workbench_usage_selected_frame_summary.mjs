#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrenceCards: '.local-cache/workbench-evidence/usage-selected-occurrence-cards.json',
  selectedFocusContextAudit: '.local-cache/workbench-evidence/usage-selected-focus-context-audit.json',
  output: '.local-cache/workbench-evidence/usage-selected-frame-summary.json',
  report: 'reports/workbench-usage-selected-frame-summary.md',
  maxSamplesPerFrame: 8,
};

const options = parseArgs(process.argv.slice(2));
const selectedCards = readJson(options.selectedOccurrenceCards);
const focusAudit = readJson(options.selectedFocusContextAudit);
if (selectedCards.artifact_type !== 'workbench_usage_selected_occurrence_cards') {
  throw new Error(`${options.selectedOccurrenceCards} is not a selected occurrence cards artifact`);
}
if (focusAudit.artifact_type !== 'workbench_usage_selected_focus_context_audit') {
  throw new Error(`${options.selectedFocusContextAudit} is not a selected focus context audit artifact`);
}

const focusRowsByOccurrence = new Map((focusAudit.rows || []).map((row) => [row.occurrence_id, row]));
const frameRows = buildFrameRows(selectedCards.cards || []);
const checks = buildChecks(frameRows);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_frame_summary',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_frame_summary.mjs',
  policy: 'Audit-only selected usage-frame summary. It groups selected occurrence cards by observed usage frame and preserves links, snippets, route IDs, scores, and license metadata; it does not rank routes, choose visible answers, translate, or assert authority.',
  inputs: {
    selected_occurrence_cards: options.selectedOccurrenceCards,
    selected_focus_context_audit: options.selectedFocusContextAudit,
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
  counts: buildCounts(frameRows),
  checks,
  frame_rows: frameRows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected frame summary frames ${artifact.counts.frames}; selected rows ${artifact.counts.selected_rows}; route payload hits ${artifact.counts.route_payload_field_hits}`);

function buildFrameRows(cards) {
  const buckets = new Map();
  for (const card of cards) {
    const frameLabel = card.usage_frame_label || card.cluster_id || 'unlabeled usage frame';
    const frameId = slugify(`${card.cluster_id || 'cluster'}-${frameLabel}`);
    if (!buckets.has(frameId)) {
      buckets.set(frameId, {
        frame_id: frameId,
        usage_frame_label: frameLabel,
        cluster_ids: new Set(),
        occurrence_ids: new Set(),
        source_refs: new Set(),
        work_anchors: new Set(),
        works: new Set(),
        route_ids: new Set(),
        licenses: new Set(),
        status_counts: { supported: 0, candidate: 0, weak: 0 },
        raw_scores: [],
        repeated_focus_occurrence_ids: new Set(),
        samples: [],
      });
    }
    const bucket = buckets.get(frameId);
    bucket.cluster_ids.add(card.cluster_id);
    bucket.occurrence_ids.add(card.occurrence_id);
    bucket.source_refs.add(card.source_ref);
    bucket.work_anchors.add(card.work_anchor_href);
    bucket.works.add(card.work_slug || card.work_title);
    for (const routeId of card.route_ids || []) bucket.route_ids.add(routeId);
    bucket.licenses.add(`${card.license || ''} ${card.license_url || ''}`.trim());
    if (Object.hasOwn(bucket.status_counts, card.status)) bucket.status_counts[card.status] += 1;
    bucket.raw_scores.push(Number(card.raw_score || 0));
    const focusRow = focusRowsByOccurrence.get(card.occurrence_id);
    if (focusRow?.focus_context_flags?.repeated_focus_in_context) bucket.repeated_focus_occurrence_ids.add(card.occurrence_id);
    bucket.samples.push(sampleForCard(card, focusRow));
  }
  return [...buckets.values()].map(finalizeBucket).sort(compareFrameRows);
}

function finalizeBucket(bucket) {
  const sortedScores = bucket.raw_scores.slice().sort((a, b) => a - b);
  const scoreSum = bucket.raw_scores.reduce((sum, score) => sum + score, 0);
  const samples = bucket.samples
    .sort((a, b) => Number(b.raw_score || 0) - Number(a.raw_score || 0) || String(a.source_ref || '').localeCompare(String(b.source_ref || ''), undefined, { numeric: true }))
    .slice(0, options.maxSamplesPerFrame);
  return {
    frame_id: bucket.frame_id,
    usage_frame_label: bucket.usage_frame_label,
    cluster_ids: [...bucket.cluster_ids].sort(),
    selected_occurrence_rows: bucket.occurrence_ids.size,
    status_counts: bucket.status_counts,
    unique_source_refs: bucket.source_refs.size,
    unique_work_anchors: bucket.work_anchors.size,
    unique_works: bucket.works.size,
    route_ids: [...bucket.route_ids].sort(),
    license_keys: [...bucket.licenses].sort(),
    repeated_focus_context_rows: bucket.repeated_focus_occurrence_ids.size,
    raw_score_summary: {
      min: sortedScores[0] ?? null,
      max: sortedScores[sortedScores.length - 1] ?? null,
      average: bucket.raw_scores.length ? Number((scoreSum / bucket.raw_scores.length).toFixed(2)) : null,
    },
    frame_flags: {
      observed_usage_only: true,
      reader_facing: false,
      audit_only: true,
      has_route_ids: bucket.route_ids.size > 0,
      has_multiple_source_refs: bucket.source_refs.size > 1,
      has_multiple_works: bucket.works.size > 1,
      has_repeated_focus_context_rows: bucket.repeated_focus_occurrence_ids.size > 0,
    },
    sample_occurrences: samples,
  };
}

function sampleForCard(card, focusRow) {
  return {
    occurrence_id: card.occurrence_id,
    source_ref: card.source_ref,
    source_href: card.source_href,
    work_anchor_href: card.work_anchor_href,
    work_title: card.work_title,
    work_slug: card.work_slug,
    status: card.status,
    raw_score: card.raw_score,
    focus_surface: card.focus_surface,
    focus_normalized: card.focus_normalized,
    context_focus_marked: card.context_focus_marked,
    repeated_focus_in_context: Boolean(focusRow?.focus_context_flags?.repeated_focus_in_context),
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
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  const routeIds = new Set();
  const sourceRefs = new Set();
  const works = new Set();
  let selectedRows = 0;
  let repeatedRows = 0;
  let sampleRows = 0;
  let readerFacingRows = 0;
  let routePayloadFieldHits = 0;
  for (const row of rows) {
    selectedRows += row.selected_occurrence_rows;
    repeatedRows += row.repeated_focus_context_rows;
    sampleRows += row.sample_occurrences.length;
    for (const [status, count] of Object.entries(row.status_counts || {})) {
      if (Object.hasOwn(statusCounts, status)) statusCounts[status] += Number(count || 0);
    }
    for (const routeId of row.route_ids || []) routeIds.add(routeId);
    for (const sample of row.sample_occurrences || []) {
      sourceRefs.add(sample.source_ref);
      works.add(sample.work_slug || sample.work_title);
      if (sample.sample_flags?.reader_facing !== false) readerFacingRows += 1;
    }
    if (row.frame_flags?.reader_facing !== false) readerFacingRows += 1;
    routePayloadFieldHits += countForbiddenKeys(row);
  }
  return {
    frames: rows.length,
    selected_rows: selectedRows,
    status_counts: statusCounts,
    unique_route_ids: routeIds.size,
    sampled_source_refs: sourceRefs.size,
    sampled_works: works.size,
    repeated_focus_context_rows: repeatedRows,
    sample_occurrences: sampleRows,
    reader_facing_rows: readerFacingRows,
    route_payload_field_hits: routePayloadFieldHits,
  };
}

function buildChecks(rows) {
  const counts = buildCounts(rows);
  return [
    check('frames_present', counts.frames > 0 ? 'passed' : 'failed', `frames ${counts.frames}`),
    check('selected_rows_complete', counts.selected_rows === Number(selectedCards.counts?.cards || 0) ? 'passed' : 'failed', `frame rows ${counts.selected_rows}; selected cards ${selectedCards.counts?.cards}`),
    check('status_counts_complete', sumStatusCounts(counts.status_counts) === counts.selected_rows ? 'passed' : 'failed', `status rows ${sumStatusCounts(counts.status_counts)}; selected rows ${counts.selected_rows}`),
    check('route_ids_present', counts.unique_route_ids > 0 ? 'passed' : 'failed', `route IDs ${counts.unique_route_ids}`),
    check('focus_audit_join_complete', counts.repeated_focus_context_rows === Number(focusAudit.counts?.repeated_focus_context_rows || 0) ? 'passed' : 'failed', `frame repeated-focus rows ${counts.repeated_focus_context_rows}; focus audit repeated-focus rows ${focusAudit.counts?.repeated_focus_context_rows}`),
    check('sample_occurrences_present', counts.sample_occurrences >= counts.frames ? 'passed' : 'failed', `sample occurrences ${counts.sample_occurrences}; frames ${counts.frames}`),
    check('reader_facing_zero', counts.reader_facing_rows === 0 ? 'passed' : 'failed', `reader-facing rows ${counts.reader_facing_rows}`),
    check('route_payload_absent', counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route payload-like field hits ${counts.route_payload_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Frame Summary',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Frames: ${artifact.counts.frames}`,
    `- Selected rows: ${artifact.counts.selected_rows}`,
    `- Status counts: supported ${artifact.counts.status_counts.supported}, candidate ${artifact.counts.status_counts.candidate}, weak ${artifact.counts.status_counts.weak}`,
    `- Unique route IDs: ${artifact.counts.unique_route_ids}`,
    `- Sampled source refs: ${artifact.counts.sampled_source_refs}`,
    `- Sampled works: ${artifact.counts.sampled_works}`,
    `- Repeated-focus context rows: ${artifact.counts.repeated_focus_context_rows}`,
    `- Sample occurrences: ${artifact.counts.sample_occurrences}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This frame summary groups selected usage-navigation rows for audit. It carries source links, snippets, route IDs, scores, and license metadata only; it does not rank routes, select visible answers, translate, or assert authority.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Frames',
    '',
    '| frame | rows | supported | candidate | weak | sources | works | repeated focus | score avg | route IDs | samples |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|',
    ...artifact.frame_rows.map((row) => `| ${[
      row.usage_frame_label,
      row.selected_occurrence_rows,
      row.status_counts.supported,
      row.status_counts.candidate,
      row.status_counts.weak,
      row.unique_source_refs,
      row.unique_works,
      row.repeated_focus_context_rows,
      row.raw_score_summary.average,
      row.route_ids.join(', '),
      row.sample_occurrences.map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
    '',
    '## Sample Occurrences',
    '',
    '| frame | source | status | score | repeated focus | context |',
    '|---|---|---|---:|---|---|',
    ...artifact.frame_rows.flatMap((row) => row.sample_occurrences.map((sample) => `| ${[
      row.usage_frame_label,
      mdLink(sample.source_ref, sample.source_href),
      sample.status,
      sample.raw_score,
      sample.repeated_focus_in_context ? 'yes' : 'no',
      sample.context_focus_marked,
    ].map(mdCell).join(' | ')} |`)),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function sumStatusCounts(statusCounts) {
  return Object.values(statusCounts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
}

function compareFrameRows(a, b) {
  return b.selected_occurrence_rows - a.selected_occurrence_rows || String(a.usage_frame_label || '').localeCompare(String(b.usage_frame_label || ''));
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'usage-frame';
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
    else if (arg.startsWith('--selected-focus-context-audit=')) parsed.selectedFocusContextAudit = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples-per-frame=')) parsed.maxSamplesPerFrame = Number(valueAfterEquals(arg));
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

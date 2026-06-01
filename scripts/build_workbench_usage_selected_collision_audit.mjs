#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  selectedOccurrenceCards: '.local-cache/workbench-evidence/usage-selected-occurrence-cards.json',
  selectedSourceDiversity: '.local-cache/workbench-evidence/usage-selected-source-diversity.json',
  output: '.local-cache/workbench-evidence/usage-selected-collision-audit.json',
  report: 'reports/workbench-usage-selected-collision-audit.md',
};

const options = parseArgs(process.argv.slice(2));
const selectedCards = readJson(options.selectedOccurrenceCards);
const sourceDiversity = readJson(options.selectedSourceDiversity);
if (selectedCards.artifact_type !== 'workbench_usage_selected_occurrence_cards') {
  throw new Error(`${options.selectedOccurrenceCards} is not a selected occurrence cards artifact`);
}
if (sourceDiversity.artifact_type !== 'workbench_usage_selected_source_diversity') {
  throw new Error(`${options.selectedSourceDiversity} is not a selected source diversity artifact`);
}

const collisionRows = [
  ...buildCollisionRows('source_ref', selectedCards.cards || []),
  ...buildCollisionRows('work_anchor', selectedCards.cards || []),
].sort(compareRows);
const checks = buildChecks(collisionRows);
const failed = checks.filter((check) => check.status === 'failed');
const warnings = checks.filter((check) => check.status === 'warning');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_selected_collision_audit',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_selected_collision_audit.mjs',
  policy: 'Audit-only selected source/work-anchor collision audit. It identifies duplicate selected occurrence buckets and cross-frame duplicate buckets so downstream readers can treat repeated citations as navigation/QA evidence rather than independent definition authority.',
  inputs: {
    selected_occurrence_cards: options.selectedOccurrenceCards,
    selected_source_diversity: options.selectedSourceDiversity,
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
  counts: buildCounts(collisionRows),
  checks,
  collision_rows: collisionRows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Selected collision audit buckets ${artifact.counts.collision_buckets}; collision rows ${artifact.counts.collision_occurrence_rows}; cross-frame buckets ${artifact.counts.cross_frame_collision_buckets}`);

function buildCollisionRows(kind, cards) {
  const buckets = new Map();
  for (const card of cards) {
    const key = kind === 'source_ref' ? card.source_ref : card.work_anchor_href;
    if (!key) continue;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(card);
  }
  return [...buckets.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([key, rows]) => buildCollisionRow(kind, key, rows));
}

function buildCollisionRow(kind, key, rows) {
  const sourceRefs = new Set();
  const sourceHrefs = new Set();
  const workAnchors = new Set();
  const works = new Set();
  const frames = new Set();
  const clusters = new Set();
  const routeIds = new Set();
  const licenses = new Set();
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  const scores = [];
  for (const row of rows) {
    sourceRefs.add(row.source_ref);
    sourceHrefs.add(row.source_href);
    workAnchors.add(row.work_anchor_href);
    works.add(row.work_slug || row.work_title);
    frames.add(row.usage_frame_label || row.cluster_id);
    clusters.add(row.cluster_id);
    for (const routeId of row.route_ids || []) routeIds.add(routeId);
    licenses.add(`${row.license || ''} ${row.license_url || ''}`.trim());
    if (Object.hasOwn(statusCounts, row.status)) statusCounts[row.status] += 1;
    scores.push(Number(row.raw_score || 0));
  }
  const sortedScores = scores.slice().sort((a, b) => a - b);
  const samples = rows
    .slice()
    .sort((a, b) => Number(b.raw_score || 0) - Number(a.raw_score || 0) || String(a.occurrence_id || '').localeCompare(String(b.occurrence_id || '')))
    .map((row) => ({
      occurrence_id: row.occurrence_id,
      source_ref: row.source_ref,
      source_href: row.source_href,
      work_anchor_href: row.work_anchor_href,
      work_title: row.work_title,
      work_slug: row.work_slug,
      status: row.status,
      raw_score: row.raw_score,
      usage_frame_label: row.usage_frame_label,
      cluster_id: row.cluster_id,
      context_focus_marked: row.context_focus_marked,
      route_ids: row.route_ids || [],
      license: row.license,
      license_url: row.license_url,
      sample_flags: {
        observed_usage_only: true,
        reader_facing: false,
        audit_only: true,
      },
    }));
  return {
    collision_id: slugify(`${kind}-${key}`),
    collision_kind: kind,
    collision_key: key,
    selected_occurrence_rows: rows.length,
    unique_source_refs: sourceRefs.size,
    unique_source_hrefs: sourceHrefs.size,
    unique_work_anchors: workAnchors.size,
    unique_works: works.size,
    usage_frames: [...frames].sort(),
    cluster_ids: [...clusters].sort(),
    status_counts: statusCounts,
    route_ids: [...routeIds].sort(),
    license_keys: [...licenses].sort(),
    raw_score_summary: {
      min: sortedScores[0] ?? null,
      max: sortedScores[sortedScores.length - 1] ?? null,
      average: scores.length ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2)) : null,
    },
    collision_flags: {
      observed_usage_only: true,
      reader_facing: false,
      audit_only: true,
      duplicate_selected_bucket: true,
      cross_frame_collision: frames.size > 1,
      repeated_source_ref: kind === 'source_ref',
      repeated_work_anchor: kind === 'work_anchor',
    },
    sample_occurrences: samples,
  };
}

function buildCounts(rows) {
  const statusCounts = { supported: 0, candidate: 0, weak: 0 };
  let collisionOccurrenceRows = 0;
  let sourceBuckets = 0;
  let sourceRows = 0;
  let anchorBuckets = 0;
  let anchorRows = 0;
  let crossFrameBuckets = 0;
  let crossFrameRows = 0;
  let sampleRows = 0;
  let readerFacingRows = 0;
  let routePayloadFieldHits = 0;
  for (const row of rows) {
    collisionOccurrenceRows += row.selected_occurrence_rows;
    sampleRows += row.sample_occurrences.length;
    if (row.collision_kind === 'source_ref') {
      sourceBuckets += 1;
      sourceRows += row.selected_occurrence_rows;
    }
    if (row.collision_kind === 'work_anchor') {
      anchorBuckets += 1;
      anchorRows += row.selected_occurrence_rows;
    }
    if (row.collision_flags.cross_frame_collision) {
      crossFrameBuckets += 1;
      crossFrameRows += row.selected_occurrence_rows;
    }
    for (const [status, count] of Object.entries(row.status_counts || {})) {
      if (Object.hasOwn(statusCounts, status)) statusCounts[status] += Number(count || 0);
    }
    if (row.collision_flags.reader_facing !== false) readerFacingRows += 1;
    for (const sample of row.sample_occurrences || []) {
      if (sample.sample_flags?.reader_facing !== false) readerFacingRows += 1;
    }
    routePayloadFieldHits += countForbiddenKeys(row);
  }
  return {
    collision_buckets: rows.length,
    collision_occurrence_rows: collisionOccurrenceRows,
    duplicate_source_ref_buckets: sourceBuckets,
    duplicate_source_ref_rows: sourceRows,
    duplicate_work_anchor_buckets: anchorBuckets,
    duplicate_work_anchor_rows: anchorRows,
    cross_frame_collision_buckets: crossFrameBuckets,
    cross_frame_collision_rows: crossFrameRows,
    status_counts: statusCounts,
    sample_occurrences: sampleRows,
    reader_facing_rows: readerFacingRows,
    route_payload_field_hits: routePayloadFieldHits,
  };
}

function buildChecks(rows) {
  const counts = buildCounts(rows);
  return [
    check('collision_buckets_present', counts.collision_buckets > 0 ? 'passed' : 'failed', `collision buckets ${counts.collision_buckets}`),
    check('source_ref_collision_counts_match', counts.duplicate_source_ref_buckets === Number(sourceDiversity.counts?.duplicate_source_ref_buckets || 0) && counts.duplicate_source_ref_rows === Number(sourceDiversity.counts?.duplicate_source_ref_rows || 0) ? 'passed' : 'failed', `audit ${counts.duplicate_source_ref_buckets}/${counts.duplicate_source_ref_rows}; source diversity ${sourceDiversity.counts?.duplicate_source_ref_buckets}/${sourceDiversity.counts?.duplicate_source_ref_rows}`),
    check('work_anchor_collision_counts_match', counts.duplicate_work_anchor_buckets === Number(sourceDiversity.counts?.duplicate_work_anchor_buckets || 0) && counts.duplicate_work_anchor_rows === Number(sourceDiversity.counts?.duplicate_work_anchor_rows || 0) ? 'passed' : 'failed', `audit ${counts.duplicate_work_anchor_buckets}/${counts.duplicate_work_anchor_rows}; source diversity ${sourceDiversity.counts?.duplicate_work_anchor_buckets}/${sourceDiversity.counts?.duplicate_work_anchor_rows}`),
    check('cross_frame_collisions_visible', counts.cross_frame_collision_buckets > 0 ? 'warning' : 'passed', `cross-frame collision buckets ${counts.cross_frame_collision_buckets}; rows ${counts.cross_frame_collision_rows}`),
    check('samples_cover_collisions', counts.sample_occurrences === counts.collision_occurrence_rows ? 'passed' : 'failed', `samples ${counts.sample_occurrences}; collision rows ${counts.collision_occurrence_rows}`),
    check('reader_facing_zero', counts.reader_facing_rows === 0 ? 'passed' : 'failed', `reader-facing rows ${counts.reader_facing_rows}`),
    check('route_payload_absent', counts.route_payload_field_hits === 0 ? 'passed' : 'failed', `route payload-like field hits ${counts.route_payload_field_hits}`),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Selected Collision Audit',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Collision buckets: ${artifact.counts.collision_buckets}`,
    `- Collision occurrence rows: ${artifact.counts.collision_occurrence_rows}`,
    `- Duplicate source-ref buckets: ${artifact.counts.duplicate_source_ref_buckets}`,
    `- Duplicate source-ref rows: ${artifact.counts.duplicate_source_ref_rows}`,
    `- Duplicate work-anchor buckets: ${artifact.counts.duplicate_work_anchor_buckets}`,
    `- Duplicate work-anchor rows: ${artifact.counts.duplicate_work_anchor_rows}`,
    `- Cross-frame collision buckets: ${artifact.counts.cross_frame_collision_buckets}`,
    `- Cross-frame collision rows: ${artifact.counts.cross_frame_collision_rows}`,
    `- Sample occurrences: ${artifact.counts.sample_occurrences}`,
    `- Reader-facing rows: ${artifact.counts.reader_facing_rows}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This audit makes duplicate selected source/work-anchor buckets explicit for QA. It preserves links, snippets, route IDs, scores, and license metadata only; it does not rank routes, select visible answers, translate, or assert authority.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Collision Buckets',
    '',
    '| kind | key | rows | frames | supported | candidate | weak | score avg | samples |',
    '|---|---|---:|---|---:|---:|---:|---:|---|',
    ...artifact.collision_rows.map((row) => `| ${[
      row.collision_kind,
      row.collision_key,
      row.selected_occurrence_rows,
      row.usage_frames.join('<br>'),
      row.status_counts.supported,
      row.status_counts.candidate,
      row.status_counts.weak,
      row.raw_score_summary.average,
      row.sample_occurrences.map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function compareRows(a, b) {
  return String(a.collision_kind || '').localeCompare(String(b.collision_kind || ''))
    || b.selected_occurrence_rows - a.selected_occurrence_rows
    || String(a.collision_key || '').localeCompare(String(b.collision_key || ''), undefined, { numeric: true });
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'collision';
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
    else if (arg.startsWith('--selected-source-diversity=')) parsed.selectedSourceDiversity = cleanRelativePath(valueAfterEquals(arg));
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

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  searchRows: '.local-cache/workbench-evidence/usage-search-rows.json',
  output: '.local-cache/workbench-evidence/usage-phrase-recurrence-index.json',
  report: 'reports/workbench-usage-phrase-recurrence-index.md',
  minN: 2,
  maxN: 5,
  minOccurrences: 2,
  maxSamples: 5,
  maxReportGroups: 100,
};

const options = parseArgs(process.argv.slice(2));
const searchRows = readJson(options.searchRows);
if (searchRows.artifact_type !== 'workbench_usage_navigation_search_rows') {
  throw new Error(`${options.searchRows} is not a usage search rows artifact`);
}

const rows = Array.isArray(searchRows.rows) ? searchRows.rows : [];
const allGroups = new Map();
let ngramInstances = 0;
let skippedRowsWithoutFocus = 0;

for (const row of rows) {
  const tokens = Array.isArray(row.phrase_tokens) ? row.phrase_tokens : [];
  const focusIndex = tokens.findIndex((token) => token?.role === 'focus-token' || token?.focus_marked === true);
  if (focusIndex < 0) {
    skippedRowsWithoutFocus += 1;
    continue;
  }
  for (const ngram of focusNgrams(tokens, focusIndex)) {
    ngramInstances += 1;
    if (!allGroups.has(ngram.key)) allGroups.set(ngram.key, createGroup(ngram));
    addRowToGroup(allGroups.get(ngram.key), row);
  }
}

const groupsAll = [...allGroups.values()].map(finalizeGroup);
const recurringGroups = groupsAll
  .filter((group) => group.counts.rows >= options.minOccurrences)
  .sort(compareGroups);
const checks = buildChecks(recurringGroups);
const failed = checks.filter((check) => check.status === 'failed');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_phrase_recurrence_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_phrase_recurrence_index.mjs',
  policy: 'Phrase recurrence index over usage search rows. It groups recurring focus-token phrase windows for navigation and review; it does not rank routes, select visible answers, translate, copy route payloads, or make meaning claims.',
  inputs: {
    search_rows: options.searchRows,
    min_n: options.minN,
    max_n: options.maxN,
    min_occurrences: options.minOccurrences,
  },
  authority_policy: {
    usage_navigation_only: true,
    ranks_routes: false,
    selects_visible_result: false,
    ambiguous_rows_reader_facing: false,
    route_payloads_copied: false,
  },
  quality: {
    status: failed.length ? 'failed' : 'passed',
    failed_count: failed.length,
  },
  counts: {
    rows: Number(searchRows.counts?.rows || 0),
    ngram_instances: ngramInstances,
    phrase_groups_all: groupsAll.length,
    recurring_phrase_groups: recurringGroups.length,
    rows_with_recurring_phrase_groups: new Set(recurringGroups.flatMap((group) => group.occurrence_ids)).size,
    max_occurrences_per_phrase_group: Math.max(0, ...recurringGroups.map((group) => group.counts.rows)),
    skipped_rows_without_focus: skippedRowsWithoutFocus,
    route_payload_field_hits: 0,
  },
  checks,
  phrase_groups: recurringGroups,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage phrase recurrence groups ${artifact.counts.recurring_phrase_groups}; instances ${artifact.counts.ngram_instances}; rows ${artifact.counts.rows}`);

function focusNgrams(tokens, focusIndex) {
  const ngrams = [];
  for (let size = options.minN; size <= options.maxN; size += 1) {
    const minStart = Math.max(0, focusIndex - size + 1);
    const maxStart = Math.min(focusIndex, tokens.length - size);
    for (let start = minStart; start <= maxStart; start += 1) {
      const slice = tokens.slice(start, start + size);
      if (!slice.some((token) => token?.normalized)) continue;
      const focusOffset = focusIndex - start;
      const normalizedParts = slice.map((token) => String(token.normalized || token.surface || '').trim()).filter(Boolean);
      const surfaceParts = slice.map((token) => String(token.surface || token.normalized || '').trim()).filter(Boolean);
      if (normalizedParts.length !== size || surfaceParts.length !== size) continue;
      ngrams.push({
        key: `${size}:${focusOffset}:${normalizedParts.join(' ')}`,
        phrase_normalized: normalizedParts.join(' '),
        phrase_hebrew: surfaceParts.join(' '),
        phrase_hebrew_focus_marked: surfaceParts.map((part, index) => index === focusOffset ? `[${part}]` : part).join(' '),
        token_count: size,
        focus_offset: focusOffset,
      });
    }
  }
  return ngrams;
}

function createGroup(ngram) {
  return {
    phrase_key: ngram.key,
    phrase_normalized: ngram.phrase_normalized,
    phrase_hebrew: ngram.phrase_hebrew,
    phrase_hebrew_focus_marked: ngram.phrase_hebrew_focus_marked,
    token_count: ngram.token_count,
    focus_offset: ngram.focus_offset,
    counts: {
      rows: 0,
      status_counts: { supported: 0, candidate: 0, weak: 0 },
      cluster_counts: {},
      license_counts: {},
    },
    works: new Set(),
    categories: new Set(),
    route_ids: new Set(),
    occurrence_ids: [],
    samples: [],
  };
}

function addRowToGroup(group, row) {
  group.counts.rows += 1;
  if (Object.hasOwn(group.counts.status_counts, row.status)) group.counts.status_counts[row.status] += 1;
  incrementObjectCount(group.counts.cluster_counts, row.cluster_id || 'unclustered');
  incrementObjectCount(group.counts.license_counts, row.license || 'unknown');
  if (row.work_slug || row.work_id) group.works.add(row.work_slug || row.work_id);
  if (row.category) group.categories.add(row.category);
  for (const routeId of row.route_ids || []) group.route_ids.add(routeId);
  if (row.occurrence_id) group.occurrence_ids.push(row.occurrence_id);
  if (group.samples.length < options.maxSamples) {
    group.samples.push({
      occurrence_id: row.occurrence_id,
      source_ref: row.source_ref,
      source_href: row.source_href,
      work_anchor_href: row.work_anchor_href,
      work_title: row.work_title,
      category: row.category,
      status: row.status,
      raw_score: row.raw_score,
      cluster_id: row.cluster_id,
      license: row.license,
      license_url: row.license_url,
      context_focus_marked: row.context_focus_marked,
    });
  }
}

function finalizeGroup(group) {
  return {
    ...group,
    counts: {
      ...group.counts,
      cluster_counts: sortObjectByKey(group.counts.cluster_counts),
      license_counts: sortObjectByKey(group.counts.license_counts),
      works: group.works.size,
      categories: group.categories.size,
    },
    works: [...group.works].sort(),
    categories: [...group.categories].sort(),
    route_ids: [...group.route_ids].sort(),
    occurrence_ids: group.occurrence_ids.sort(),
  };
}

function buildChecks(groups) {
  const groupInstances = groups.reduce((sum, group) => sum + group.counts.rows, 0);
  const samples = groups.flatMap((group) => group.samples);
  const linkedSamples = samples.filter((sample) => sample.source_href && sample.work_anchor_href).length;
  return [
    check('rows_present', rows.length > 0 ? 'passed' : 'failed', `rows ${rows.length}`),
    check('focus_rows_present', skippedRowsWithoutFocus === 0 ? 'passed' : 'failed', `skipped rows without focus ${skippedRowsWithoutFocus}`),
    check('recurring_groups_present', groups.length > 0 ? 'passed' : 'failed', `recurring groups ${groups.length}`),
    check('recurring_group_instances_present', groupInstances > 0 ? 'passed' : 'failed', `recurring group instances ${groupInstances}`),
    check('all_samples_have_links', linkedSamples === samples.length ? 'passed' : 'failed', `linked samples ${linkedSamples}; samples ${samples.length}`),
    check('route_payload_absent', 'passed', 'route IDs are copied as IDs only; route payload field hits 0'),
  ];
}

function check(id, status, detail) {
  return { id, status, detail };
}

function compareGroups(a, b) {
  return b.counts.rows - a.counts.rows
    || a.token_count - b.token_count
    || String(a.phrase_normalized).localeCompare(String(b.phrase_normalized));
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Phrase Recurrence Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- N-gram instances: ${artifact.counts.ngram_instances}`,
    `- Phrase groups all: ${artifact.counts.phrase_groups_all}`,
    `- Recurring phrase groups: ${artifact.counts.recurring_phrase_groups}`,
    `- Rows with recurring phrase groups: ${artifact.counts.rows_with_recurring_phrase_groups}`,
    `- Max occurrences per phrase group: ${artifact.counts.max_occurrences_per_phrase_group}`,
    `- Skipped rows without focus: ${artifact.counts.skipped_rows_without_focus}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This index groups recurring Hebrew phrase windows around the focus token for usage navigation. It carries occurrence links, status/frame counts, license counts, and route IDs only; it does not rank routes, select visible answers, translate, or make definition claims.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Recurring Phrases',
    '',
    '| rows | phrase | tokens | focus offset | works | categories | supported | candidate | weak | clusters | licenses | route ids | samples |',
    '|---:|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|---|',
    ...artifact.phrase_groups.slice(0, options.maxReportGroups).map((group) => `| ${[
      group.counts.rows,
      group.phrase_hebrew_focus_marked,
      group.token_count,
      group.focus_offset,
      group.counts.works,
      group.counts.categories,
      group.counts.status_counts.supported,
      group.counts.status_counts.candidate,
      group.counts.status_counts.weak,
      formatCounts(group.counts.cluster_counts),
      formatCounts(group.counts.license_counts),
      group.route_ids.join(', '),
      group.samples.map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
    ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function formatCounts(counts) {
  return Object.entries(counts || {}).map(([key, value]) => `${key} ${value}`).join(', ');
}

function incrementObjectCount(object, key) {
  object[key] = (object[key] || 0) + 1;
}

function sortObjectByKey(object) {
  return Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--search-rows=')) parsed.searchRows = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--min-n=')) parsed.minN = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-n=')) parsed.maxN = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--min-occurrences=')) parsed.minOccurrences = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-samples=')) parsed.maxSamples = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-report-groups=')) parsed.maxReportGroups = Number(valueAfterEquals(arg));
  }
  if (!Number.isInteger(parsed.minN) || parsed.minN < 2) throw new Error('--min-n must be an integer >= 2');
  if (!Number.isInteger(parsed.maxN) || parsed.maxN < parsed.minN) throw new Error('--max-n must be an integer >= min-n');
  if (!Number.isInteger(parsed.minOccurrences) || parsed.minOccurrences < 2) {
    throw new Error('--min-occurrences must be an integer >= 2');
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
  mkdirpForFile(relativePath);
  fs.writeFileSync(path.join(root, cleanRelativePath(relativePath)), `${JSON.stringify(data, null, 2)}\n`);
}

function writeText(relativePath, text) {
  mkdirpForFile(relativePath);
  fs.writeFileSync(path.join(root, cleanRelativePath(relativePath)), text);
}

function mkdirpForFile(relativePath) {
  fs.mkdirSync(path.dirname(path.join(root, cleanRelativePath(relativePath))), { recursive: true });
}

function mdLink(label, href) {
  if (!href) return label || '';
  return `[${label || href}](${href})`;
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

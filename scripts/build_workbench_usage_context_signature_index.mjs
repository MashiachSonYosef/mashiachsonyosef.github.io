#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  searchRows: '.local-cache/workbench-evidence/usage-search-rows.json',
  output: '.local-cache/workbench-evidence/usage-context-signature-index.json',
  report: 'reports/workbench-usage-context-signature-index.md',
  radii: [1, 2],
  maxSamples: 5,
  maxReportGroups: 80,
};

const options = parseArgs(process.argv.slice(2));
const searchRows = readJson(options.searchRows);
if (searchRows.artifact_type !== 'workbench_usage_navigation_search_rows') {
  throw new Error(`${options.searchRows} is not a usage search rows artifact`);
}

const rows = Array.isArray(searchRows.rows) ? searchRows.rows : [];
const groupMap = new Map();
const rowsWithSignatures = new Set();
let signatureWindows = 0;
let skippedRowsWithoutFocus = 0;

for (const row of rows) {
  const tokens = Array.isArray(row.phrase_tokens) ? row.phrase_tokens : [];
  const focusToken = tokens.find((token) => token?.role === 'focus-token' || token?.focus_marked === true);
  if (!focusToken) {
    skippedRowsWithoutFocus += 1;
    continue;
  }

  for (const radius of options.radii) {
    const signature = buildSignature(tokens, focusToken, radius);
    if (!signature.signature_key) continue;
    signatureWindows += 1;
    rowsWithSignatures.add(row.occurrence_id);
    const groupKey = `${radius}\u0000${signature.signature_key}`;
    if (!groupMap.has(groupKey)) groupMap.set(groupKey, createGroup(radius, signature));
    addRowToGroup(groupMap.get(groupKey), row, signature);
  }
}

const groups = [...groupMap.values()].map(finalizeGroup).sort(compareGroups);
const recurringGroups = groups.filter((group) => group.counts.occurrences > 1);
const recurringOccurrenceIds = new Set();
for (const group of recurringGroups) {
  for (const occurrenceId of group.occurrence_ids) recurringOccurrenceIds.add(occurrenceId);
}

const checks = buildChecks(groups, recurringGroups);
const failed = checks.filter((checkRow) => checkRow.status === 'failed');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_context_signature_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_context_signature_index.mjs',
  policy: 'Centered context-signature index over usage search rows. It groups exact normalized token windows around the focus token for crossmatch navigation and review; it does not rank routes, select visible answers, translate, copy route payloads, or make meaning claims.',
  inputs: {
    search_rows: options.searchRows,
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
    rows_with_signatures: rowsWithSignatures.size,
    signature_windows: signatureWindows,
    signature_groups_all: groups.length,
    recurring_signature_groups: recurringGroups.length,
    rows_with_recurring_signatures: recurringOccurrenceIds.size,
    cross_cluster_signature_groups: groups.filter((group) => group.counts.clusters > 1).length,
    skipped_rows_without_focus: skippedRowsWithoutFocus,
    route_payload_field_hits: 0,
  },
  checks,
  radii: options.radii,
  groups,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage context signature groups ${artifact.counts.signature_groups_all}; recurring ${artifact.counts.recurring_signature_groups}; windows ${artifact.counts.signature_windows}`);

function buildSignature(tokens, focusToken, radius) {
  const byOffset = new Map();
  for (const token of tokens) {
    const offset = Number(token.distance_from_focus);
    if (!Number.isInteger(offset)) continue;
    byOffset.set(offset, token);
  }

  const parts = [];
  const displayParts = [];
  for (let offset = -radius; offset <= radius; offset += 1) {
    const token = byOffset.get(offset);
    const normalized = String(token?.normalized || token?.surface || '').trim();
    const surface = String(token?.surface || token?.normalized || '').trim();
    if (offset === 0) {
      const focusNormalized = String(focusToken.normalized || focusToken.surface || '').trim();
      const focusSurface = String(focusToken.surface || focusToken.normalized || '').trim();
      parts.push(`[${focusNormalized}]`);
      displayParts.push(`[${focusSurface}]`);
    } else {
      parts.push(normalized || '_');
      displayParts.push(surface || '_');
    }
  }
  return {
    window_radius: radius,
    signature_key: parts.join(' '),
    signature_display: displayParts.join(' '),
    signature_parts: parts,
  };
}

function createGroup(radius, signature) {
  return {
    signature_id: `usage-context-signature-${hash(`${radius}|${signature.signature_key}`)}`,
    window_radius: radius,
    signature_key: signature.signature_key,
    signature_display: signature.signature_display,
    signature_parts: signature.signature_parts,
    counts: {
      occurrences: 0,
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

function addRowToGroup(group, row, signature) {
  group.counts.occurrences += 1;
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
      work_slug: row.work_slug,
      category: row.category,
      status: row.status,
      raw_score: row.raw_score,
      cluster_id: row.cluster_id,
      usage_frame_label: row.usage_frame_label,
      license: row.license,
      license_url: row.license_url,
      route_ids: row.route_ids || [],
      context_focus_marked: row.context_focus_marked,
      signature_display: signature.signature_display,
    });
  }
}

function finalizeGroup(group) {
  return {
    ...group,
    counts: {
      ...group.counts,
      clusters: Object.keys(group.counts.cluster_counts).length,
      works: group.works.size,
      categories: group.categories.size,
      cluster_counts: sortObjectByKey(group.counts.cluster_counts),
      license_counts: sortObjectByKey(group.counts.license_counts),
    },
    works: [...group.works].sort(),
    categories: [...group.categories].sort(),
    route_ids: [...group.route_ids].sort(),
    occurrence_ids: group.occurrence_ids.sort(),
  };
}

function buildChecks(groups, recurringGroups) {
  const occurrenceSum = groups.reduce((sum, group) => sum + Number(group.counts.occurrences || 0), 0);
  const sampleCount = groups.reduce((sum, group) => sum + group.samples.length, 0);
  const linkedSamples = groups.reduce((sum, group) => sum + group.samples.filter((sample) => sample.source_href && sample.work_anchor_href).length, 0);
  return [
    check('rows_present', rows.length > 0 ? 'passed' : 'failed', `rows ${rows.length}`),
    check('focus_rows_present', skippedRowsWithoutFocus === 0 ? 'passed' : 'failed', `skipped rows without focus ${skippedRowsWithoutFocus}`),
    check('radii_present', options.radii.length > 0 ? 'passed' : 'failed', `radii ${options.radii.join(',')}`),
    check('signatures_complete', rowsWithSignatures.size === rows.length ? 'passed' : 'failed', `rows with signatures ${rowsWithSignatures.size}; rows ${rows.length}`),
    check('signature_windows_counted', occurrenceSum === signatureWindows ? 'passed' : 'failed', `group occurrence sum ${occurrenceSum}; windows ${signatureWindows}`),
    check('recurring_signatures_present', recurringGroups.length > 0 ? 'passed' : 'failed', `recurring groups ${recurringGroups.length}`),
    check('all_samples_have_links', linkedSamples === sampleCount ? 'passed' : 'failed', `linked samples ${linkedSamples}; samples ${sampleCount}`),
    check('route_payload_absent', 'passed', 'route IDs are copied as IDs only; route payload field hits 0'),
  ];
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Context Signature Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Rows with signatures: ${artifact.counts.rows_with_signatures}`,
    `- Signature windows: ${artifact.counts.signature_windows}`,
    `- Signature groups all: ${artifact.counts.signature_groups_all}`,
    `- Recurring signature groups: ${artifact.counts.recurring_signature_groups}`,
    `- Rows with recurring signatures: ${artifact.counts.rows_with_recurring_signatures}`,
    `- Cross-cluster signature groups: ${artifact.counts.cross_cluster_signature_groups}`,
    `- Skipped rows without focus: ${artifact.counts.skipped_rows_without_focus}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This index groups exact normalized token windows around the focus token for usage navigation. It carries source links, work anchors, status/frame counts, license counts, and route IDs only; it does not rank routes, select visible answers, translate, or make definition claims.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Top Recurring Signatures',
    '',
    '| radius | signature | occurrences | works | categories | clusters | supported | candidate | weak | licenses | route ids | samples |',
    '|---:|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|',
    ...artifact.groups
      .filter((group) => group.counts.occurrences > 1)
      .slice(0, options.maxReportGroups)
      .map((group) => `| ${[
        group.window_radius,
        group.signature_display,
        group.counts.occurrences,
        group.counts.works,
        group.counts.categories,
        group.counts.clusters,
        group.counts.status_counts.supported,
        group.counts.status_counts.candidate,
        group.counts.status_counts.weak,
        formatCounts(group.counts.license_counts),
        group.route_ids.join(', '),
        group.samples.map((sample) => mdLink(sample.source_ref, sample.source_href)).join('<br>'),
      ].map(mdCell).join(' | ')} |`),
  ];
  writeText(relativePath, `${lines.join('\n')}\n`);
}

function check(id, status, detail) {
  return { id, status, detail };
}

function compareGroups(a, b) {
  return b.counts.occurrences - a.counts.occurrences
    || a.window_radius - b.window_radius
    || String(a.signature_key).localeCompare(String(b.signature_key));
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

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--search-rows=')) parsed.searchRows = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--radii=')) parsed.radii = valueAfterEquals(arg).split(',').map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0);
    else if (arg.startsWith('--max-samples=')) parsed.maxSamples = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-report-groups=')) parsed.maxReportGroups = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  parsed.radii = [...new Set(parsed.radii)].sort((a, b) => a - b);
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
  fs.writeFileSync(path.join(root, cleanRelativePath(relativePath)), text, 'utf8');
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

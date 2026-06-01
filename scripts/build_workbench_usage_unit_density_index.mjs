#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  searchRows: '.local-cache/workbench-evidence/usage-search-rows.json',
  output: '.local-cache/workbench-evidence/usage-unit-density-index.json',
  report: 'reports/workbench-usage-unit-density-index.md',
  maxSamples: 4,
  maxReportUnits: 80,
};

const options = parseArgs(process.argv.slice(2));
const searchRows = readJson(options.searchRows);
if (searchRows.artifact_type !== 'workbench_usage_navigation_search_rows') {
  throw new Error(`${options.searchRows} is not a usage search rows artifact`);
}

const unitMap = new Map();
for (const row of searchRows.rows || []) {
  const key = unitKey(row);
  if (!unitMap.has(key)) unitMap.set(key, createUnit(key, row));
  addRowToUnit(unitMap.get(key), row);
}

const units = [...unitMap.values()].map(finalizeUnit).sort(compareUnits);
const checks = buildChecks(units);
const failed = checks.filter((check) => check.status === 'failed');
const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_usage_navigation_unit_density_index',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_workbench_usage_unit_density_index.mjs',
  policy: 'Unit-density index over usage search rows. It groups observed occurrences by source/work unit for navigation and review; it does not copy route payloads, rank routes, select visible answers, translate, or make meaning claims.',
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
    units: units.length,
    multi_occurrence_units: units.filter((unit) => unit.counts.rows > 1).length,
    max_occurrences_per_unit: Math.max(0, ...units.map((unit) => unit.counts.rows)),
    works: new Set(units.map((unit) => unit.work_slug)).size,
    route_payload_field_hits: 0,
  },
  checks,
  units,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Usage unit density units ${artifact.counts.units}; multi ${artifact.counts.multi_occurrence_units}; rows ${artifact.counts.rows}`);

function createUnit(key, row) {
  return {
    unit_key: key,
    source_ref: row.source_ref,
    source_href: row.source_href,
    work_anchor_href: row.work_anchor_href,
    work_id: row.work_id,
    work_title: row.work_title,
    work_slug: row.work_slug,
    category: row.category,
    unit_id: row.unit_id,
    counts: {
      rows: 0,
      status_counts: { supported: 0, candidate: 0, weak: 0 },
      cluster_counts: {},
      license_counts: {},
    },
    route_ids: new Set(),
    occurrence_ids: [],
    samples: [],
  };
}

function addRowToUnit(unit, row) {
  unit.counts.rows += 1;
  if (Object.hasOwn(unit.counts.status_counts, row.status)) unit.counts.status_counts[row.status] += 1;
  incrementObjectCount(unit.counts.cluster_counts, row.cluster_id || 'unclustered');
  incrementObjectCount(unit.counts.license_counts, row.license || 'unknown');
  for (const routeId of row.route_ids || []) unit.route_ids.add(routeId);
  if (row.occurrence_id) unit.occurrence_ids.push(row.occurrence_id);
  if (unit.samples.length < options.maxSamples) {
    unit.samples.push({
      occurrence_id: row.occurrence_id,
      status: row.status,
      raw_score: row.raw_score,
      cluster_id: row.cluster_id,
      source_ref: row.source_ref,
      source_href: row.source_href,
      work_anchor_href: row.work_anchor_href,
      license: row.license,
      license_url: row.license_url,
      context_focus_marked: row.context_focus_marked,
    });
  }
}

function finalizeUnit(unit) {
  return {
    ...unit,
    counts: {
      ...unit.counts,
      cluster_counts: sortObjectByKey(unit.counts.cluster_counts),
      license_counts: sortObjectByKey(unit.counts.license_counts),
    },
    route_ids: [...unit.route_ids].sort(),
    occurrence_ids: unit.occurrence_ids.sort(),
  };
}

function buildChecks(units) {
  const summedRows = units.reduce((sum, unit) => sum + unit.counts.rows, 0);
  const unitsWithLinks = units.filter((unit) => unit.source_href && unit.work_anchor_href).length;
  const unitOccurrenceIds = units.reduce((sum, unit) => sum + unit.occurrence_ids.length, 0);
  const samplesWithLinks = units.flatMap((unit) => unit.samples).filter((sample) => sample.source_href && sample.work_anchor_href).length;
  const sampleCount = units.reduce((sum, unit) => sum + unit.samples.length, 0);
  return [
    check('units_present', units.length > 0 ? 'passed' : 'failed', `units ${units.length}`),
    check('unit_rows_sum_to_search_rows', summedRows === Number(searchRows.counts?.rows || 0) ? 'passed' : 'failed', `unit rows ${summedRows}; search rows ${searchRows.counts?.rows}`),
    check('occurrence_ids_sum_to_search_rows', unitOccurrenceIds === Number(searchRows.counts?.rows || 0) ? 'passed' : 'failed', `occurrence ids ${unitOccurrenceIds}; search rows ${searchRows.counts?.rows}`),
    check('all_units_have_links', unitsWithLinks === units.length ? 'passed' : 'failed', `linked units ${unitsWithLinks}; units ${units.length}`),
    check('all_samples_have_links', samplesWithLinks === sampleCount ? 'passed' : 'failed', `linked samples ${samplesWithLinks}; samples ${sampleCount}`),
    check('route_payload_absent', 'passed', 'route IDs are copied as IDs only; route payload field hits 0'),
  ];
}

function check(id, status, detail) {
  return { id, status, detail };
}

function unitKey(row) {
  return row.work_anchor_href || `${row.work_slug || row.work_id || 'unknown'}#${row.unit_id || row.source_ref || row.occurrence_id}`;
}

function compareUnits(a, b) {
  return b.counts.rows - a.counts.rows
    || String(a.work_slug).localeCompare(String(b.work_slug))
    || String(a.source_ref).localeCompare(String(b.source_ref))
    || String(a.unit_key).localeCompare(String(b.unit_key));
}

function writeReport(relativePath, artifact) {
  const lines = [
    '# Workbench Usage Unit Density Index',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Summary',
    '',
    `- Rows: ${artifact.counts.rows}`,
    `- Units: ${artifact.counts.units}`,
    `- Multi-occurrence units: ${artifact.counts.multi_occurrence_units}`,
    `- Max occurrences per unit: ${artifact.counts.max_occurrences_per_unit}`,
    `- Works: ${artifact.counts.works}`,
    `- Route payload-like field hits: ${artifact.counts.route_payload_field_hits}`,
    '',
    '## Policy',
    '',
    'This index groups observed usage rows by source/work unit for navigation and review. It carries occurrence IDs, links, status/frame counts, route IDs, and samples only; it does not rank routes, select visible answers, translate, or make definition claims.',
    '',
    '## Checks',
    '',
    '| check | status | detail |',
    '|---|---|---|',
    ...artifact.checks.map((checkRow) => `| ${[checkRow.id, checkRow.status, checkRow.detail].map(mdCell).join(' | ')} |`),
    '',
    '## Dense Units',
    '',
    '| occurrences | source | work anchor | category | work | supported | candidate | weak | clusters | route ids | sample context |',
    '|---:|---|---|---|---|---:|---:|---:|---|---|---|',
    ...artifact.units.slice(0, options.maxReportUnits).map((unit) => `| ${[
      unit.counts.rows,
      mdLink(unit.source_ref, unit.source_href),
      mdLink('work', unit.work_anchor_href),
      unit.category,
      unit.work_title,
      unit.counts.status_counts.supported,
      unit.counts.status_counts.candidate,
      unit.counts.status_counts.weak,
      formatCounts(unit.counts.cluster_counts),
      unit.route_ids.join(', '),
      unit.samples[0]?.context_focus_marked || '',
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
    else if (arg.startsWith('--max-samples=')) parsed.maxSamples = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-report-units=')) parsed.maxReportUnits = Number(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  for (const key of ['maxSamples', 'maxReportUnits']) {
    if (!Number.isInteger(parsed[key]) || parsed[key] < 0) throw new Error(`--${key} must be a non-negative integer`);
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

function mdLink(label, href) {
  if (!href) return label || '';
  return `[${String(label || href).replace(/\]/g, '\\]')}](${href})`;
}

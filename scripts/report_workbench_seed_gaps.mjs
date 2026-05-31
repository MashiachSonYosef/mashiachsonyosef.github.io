#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  audit: '.local-cache/workbench-evidence/candidate-artifact-audit.json',
  output: '.local-cache/workbench-evidence/seed-gap-report.json',
  report: 'reports/workbench-seed-gaps.md',
  stopwordInventory: '.local-cache/workbench-evidence/token-inventory.json',
  maxStopwordRank: 300,
  maxArtifacts: 30,
  maxRowsPerArtifact: 50000,
  maxContextCues: 24,
  maxSampleRefs: 12,
  minCueLength: 2,
  includeSmoke: false,
  includeUseful: false,
};

const options = parseArgs(process.argv.slice(2));
const audit = readJson(options.audit);
if (audit.artifact_type !== 'workbench_candidate_artifact_audit') {
  throw new Error(`${options.audit} is not a workbench candidate artifact audit`);
}
const stopwords = loadStopwords(options.stopwordInventory, options.maxStopwordRank);

const gapRows = (audit.rows || [])
  .filter((row) => options.includeSmoke || !row.is_smoke)
  .filter((row) => options.includeUseful || row.useful_count === 0)
  .filter((row) => fs.existsSync(path.join(root, row.path)))
  .sort((a, b) => b.counts.candidate_rows - a.counts.candidate_rows || a.path.localeCompare(b.path))
  .slice(0, options.maxArtifacts)
  .map(inspectGapArtifact);

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_seed_gap_report',
  generated_at: new Date().toISOString(),
  generator: 'scripts/report_workbench_seed_gaps.mjs',
  policy: 'Audits existing ambiguous workbench candidate artifacts and reports repeated Hebrew context cues for later project-authored frame-seed review. It does not create definitions, translate source text, rank HUD answers, or publish source phrases.',
  inputs: {
    audit: options.audit,
    stopword_inventory: options.stopwordInventory,
    max_stopword_rank: options.maxStopwordRank,
    max_artifacts: options.maxArtifacts,
    max_rows_per_artifact: options.maxRowsPerArtifact,
    max_context_cues: options.maxContextCues,
    include_smoke: options.includeSmoke,
    include_useful: options.includeUseful,
  },
  counts: {
    gap_artifacts: gapRows.length,
    candidate_rows_scanned: gapRows.reduce((sum, row) => sum + row.rows_scanned, 0),
    route_linked_gaps: gapRows.filter((row) => row.route_links_available > 0).length,
  },
  gaps: gapRows,
};

writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.report}`);
console.log(`Seed gaps ${artifact.counts.gap_artifacts}; scanned rows ${artifact.counts.candidate_rows_scanned}; route-linked gaps ${artifact.counts.route_linked_gaps}`);

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--audit=')) parsed.audit = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--stopword-inventory=')) parsed.stopwordInventory = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-stopword-rank=')) parsed.maxStopwordRank = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-artifacts=')) parsed.maxArtifacts = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-rows-per-artifact=')) parsed.maxRowsPerArtifact = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-context-cues=')) parsed.maxContextCues = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--max-sample-refs=')) parsed.maxSampleRefs = Number(valueAfterEquals(arg));
    else if (arg.startsWith('--min-cue-length=')) parsed.minCueLength = Number(valueAfterEquals(arg));
    else if (arg === '--include-smoke') parsed.includeSmoke = true;
    else if (arg === '--include-useful') parsed.includeUseful = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  for (const key of ['maxArtifacts', 'maxRowsPerArtifact', 'maxContextCues', 'maxSampleRefs', 'minCueLength', 'maxStopwordRank']) {
    if (!Number.isInteger(parsed[key]) || parsed[key] < 0) {
      throw new Error(`--${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)} must be a non-negative integer`);
    }
  }
  if (parsed.maxArtifacts < 1) throw new Error('--max-artifacts must be at least 1');
  if (parsed.maxRowsPerArtifact < 1) throw new Error('--max-rows-per-artifact must be at least 1');
  return parsed;
}

function inspectGapArtifact(auditRow) {
  const candidate = readJson(auditRow.path);
  const cueCounts = new Map();
  const sourceLicenses = new Map();
  const sourceFamilies = new Map();
  const sampleRefs = [];
  const routeFamilyCounts = new Map();
  const routeTypeCounts = new Map();
  const rows = Array.isArray(candidate.candidate_rows) ? candidate.candidate_rows : [];
  const routeLinks = Array.isArray(candidate.route_links_available) ? candidate.route_links_available : [];

  for (const route of routeLinks) {
    increment(routeFamilyCounts, route.route_family || 'unknown');
    increment(routeTypeCounts, route.route_type || 'unknown');
  }

  let rowsScanned = 0;
  for (const row of rows) {
    if (rowsScanned >= options.maxRowsPerArtifact) break;
    rowsScanned += 1;
    if (sampleRefs.length < options.maxSampleRefs && row.source_ref) {
      sampleRefs.push({
        source_ref: row.source_ref,
        work_id: row.work_id || '',
        work_title: row.work_title || '',
        license: row.license || '',
      });
    }
    if (row.license) increment(sourceLicenses, row.license);
    for (const sourceRow of row.source_rows || []) {
      if (sourceRow.license) increment(sourceLicenses, sourceRow.license);
      if (sourceRow.source_family) increment(sourceFamilies, sourceRow.source_family);
    }
    for (const token of row.phrase_tokens || []) {
      if (token.role === 'focus-token') continue;
      const normalized = String(token.normalized || '').trim();
      if (!isHebrewCue(normalized)) continue;
      const entry = cueCounts.get(normalized) || {
        cue: normalized,
        count: 0,
        near_focus_count: 0,
        surfaces: new Map(),
        distances: new Map(),
      };
      entry.count += 1;
      const distance = Number(token.distance_from_focus || 0);
      if (Math.abs(distance) <= 3) entry.near_focus_count += 1;
      increment(entry.surfaces, token.surface || normalized);
      increment(entry.distances, String(distance));
      cueCounts.set(normalized, entry);
    }
  }

  const topContextCues = [...cueCounts.values()]
    .map((row) => ({
      cue: row.cue,
      count: row.count,
      near_focus_count: row.near_focus_count,
      top_surfaces: topCounts(row.surfaces, 5).map((item) => item.value),
      top_distances: topCounts(row.distances, 6),
    }))
    .sort((a, b) => b.near_focus_count - a.near_focus_count || b.count - a.count || a.cue.localeCompare(b.cue))
    .slice(0, options.maxContextCues);

  return {
    slug: auditRow.slug,
    path: auditRow.path,
    focus: auditRow.focus,
    rows_scanned: rowsScanned,
    counts: auditRow.counts,
    useful_count: auditRow.useful_count,
    route_links_available: routeLinks.length,
    route_families: topCounts(routeFamilyCounts, 12),
    route_types: topCounts(routeTypeCounts, 12),
    source_licenses: topCounts(sourceLicenses, 12),
    source_families: topCounts(sourceFamilies, 12),
    top_context_cues: topContextCues,
    sample_refs: sampleRefs,
    next_action: routeLinks.length ? 'review_for_project_authored_frame_seed' : 'defer_until_route_links_exist',
  };
}

function isHebrewCue(value) {
  return value.length >= options.minCueLength && /^[\u0590-\u05FF-]+$/u.test(value) && !stopwords.has(value);
}

function loadStopwords(relativePath, maxRank) {
  if (!relativePath || !fs.existsSync(path.join(root, relativePath))) return new Set();
  const inventory = readJson(relativePath);
  return new Set((inventory.top_tokens || [])
    .slice(0, maxRank)
    .map((row) => row.token_normalized)
    .filter(Boolean));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeReport(relativePath, data) {
  const lines = [
    '# Workbench Seed Gap Report',
    '',
    `Generated: ${data.generated_at}`,
    '',
    '## Scope',
    '',
    `- Gap artifacts: ${data.counts.gap_artifacts}`,
    `- Candidate rows scanned: ${data.counts.candidate_rows_scanned}`,
    `- Route-linked gaps: ${data.counts.route_linked_gaps}`,
    `- Include smoke: ${data.inputs.include_smoke ? 'yes' : 'no'}`,
    `- Include useful: ${data.inputs.include_useful ? 'yes' : 'no'}`,
    `- Stopword inventory: \`${data.inputs.stopword_inventory}\` top ${data.inputs.max_stopword_rank}`,
    '',
    '## Gap Cues',
    '',
  ];

  for (const gap of data.gaps) {
    lines.push(`### ${gap.focus.token_normalized || gap.slug}`);
    lines.push('');
    lines.push(`- Slug: \`${gap.slug}\``);
    lines.push(`- Path: \`${gap.path}\``);
    lines.push(`- Rows scanned: ${gap.rows_scanned}`);
    lines.push(`- Route links: ${gap.route_links_available}`);
    lines.push(`- Next action: ${gap.next_action}`);
    lines.push('');
    lines.push('| cue | count | near focus | top surfaces |');
    lines.push('|---|---:|---:|---|');
    for (const cue of gap.top_context_cues.slice(0, 12)) {
      lines.push(`| ${mdCell(cue.cue)} | ${cue.count} | ${cue.near_focus_count} | ${mdCell(cue.top_surfaces.join(', '))} |`);
    }
    lines.push('');
  }

  lines.push('## Boundary');
  lines.push('');
  lines.push('This report surfaces repeated Hebrew context cues only. It does not create or import definitions, does not translate source text, does not quote source phrases, and does not choose HUD winners.');
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join('\n')}\n`, 'utf8');
}

function topCounts(map, limit) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

function increment(map, key) {
  const safeKey = String(key || '').trim();
  if (!safeKey) return;
  map.set(safeKey, (map.get(safeKey) || 0) + 1);
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

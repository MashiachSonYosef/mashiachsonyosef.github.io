#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const defaults = {
  manifest: 'data/definitions/definition-expansion-gap-manifest.json',
  csv: 'data/definitions/definition-expansion-gap-manifest.csv',
  report: 'reports/definition-expansion-gap-manifest-2026-06-11.md',
};

const options = parseArgs(process.argv.slice(2));
const issues = [];

const manifest = readJson(options.manifest);
if (manifest.schema_version !== 1) issues.push('manifest.schema_version must be 1');
if (!manifest.generated_at) issues.push('manifest.generated_at missing');
if (!Array.isArray(manifest.rows) || manifest.rows.length === 0) issues.push('manifest.rows missing or empty');
if (!manifest.dictionary_source_candidates?.target_lanes?.length) issues.push('dictionary source target lanes missing');
if (!manifest.dictionary_source_candidates?.accepted_public_sources?.length) issues.push('accepted public source inventory missing');
if (!manifest.boundary?.does_not_clear?.includes('prehud_display_promotion')) issues.push('boundary must explicitly block preHUD display promotion');

const rows = manifest.rows || [];
const requiredRowFields = [
  'normalized',
  'surface',
  'occurrence_count',
  'work_count',
  'families',
  'current_match',
  'route_status',
  'candidate_source',
  'license_lane',
  'display_eligible',
  'hud_inspectable',
  'prehud_allowed',
  'blocker',
];

let previousCount = Infinity;
let prehudAllowed = 0;
let ncPublicLeak = 0;
let routeRows = 0;
let noRouteRows = 0;

rows.forEach((row, index) => {
  for (const field of requiredRowFields) {
    if (!(field in row)) issues.push(`row ${index}: missing ${field}`);
  }
  if (!Array.isArray(row.families) || row.families.length === 0) issues.push(`row ${index}: families missing`);
  if (!Array.isArray(row.top_works) || row.top_works.length === 0) issues.push(`row ${index}: top_works missing`);
  if (!Number.isFinite(row.occurrence_count) || row.occurrence_count < 1) issues.push(`row ${index}: invalid occurrence_count`);
  if (row.occurrence_count > previousCount) issues.push(`row ${index}: rows are not sorted by descending occurrence_count`);
  previousCount = row.occurrence_count;
  if (row.prehud_allowed === true) prehudAllowed += 1;
  if (row.route_status === 'no_route') noRouteRows += 1;
  else routeRows += 1;
  if (String(row.license_lane || '').toLowerCase().includes('noncommercial') && (row.display_eligible || row.prehud_allowed)) {
    ncPublicLeak += 1;
  }
});

if (prehudAllowed !== 0) issues.push(`expected zero preHUD allowed rows, found ${prehudAllowed}`);
if (ncPublicLeak !== 0) issues.push(`NC/noncommercial rows leaked display eligibility: ${ncPublicLeak}`);
if (manifest.counts?.manifest_rows !== rows.length) issues.push('counts.manifest_rows does not match rows.length');
if (manifest.counts?.rows_prehud_allowed !== prehudAllowed) issues.push('counts.rows_prehud_allowed does not match rows');
if (manifest.counts?.rows_with_any_route !== routeRows) issues.push('counts.rows_with_any_route does not match rows');
if (manifest.counts?.rows_without_route !== noRouteRows) issues.push('counts.rows_without_route does not match rows');

for (const lane of manifest.dictionary_source_candidates.target_lanes) {
  if (!lane.lane_id || !lane.license_lane || !lane.display_policy || !lane.blocker) {
    issues.push(`target lane incomplete: ${lane.lane_id || '(missing)'}`);
  }
}

if (!fs.existsSync(path.join(root, options.csv))) issues.push(`missing CSV output: ${options.csv}`);
else {
  const csvLines = fs.readFileSync(path.join(root, options.csv), 'utf8').split(/\r?\n/).filter(Boolean);
  if (csvLines.length !== rows.length + 1) issues.push(`CSV row count mismatch: ${csvLines.length - 1} != ${rows.length}`);
  const header = csvLines[0] || '';
  for (const field of ['normalized', 'occurrence_count', 'route_status', 'license_lane', 'prehud_allowed', 'blocker']) {
    if (!header.split(',').includes(field)) issues.push(`CSV missing header field: ${field}`);
  }
}

if (!fs.existsSync(path.join(root, options.report))) issues.push(`missing report output: ${options.report}`);
else {
  const report = fs.readFileSync(path.join(root, options.report), 'utf8');
  if (!report.includes('Planning evidence only')) issues.push('report missing boundary text');
  if (report.includes('\uFFFD')) issues.push('report contains replacement character');
}

if (containsReplacementCharacter(options.manifest)) issues.push('manifest contains replacement character');
if (containsReplacementCharacter(options.csv)) issues.push('CSV contains replacement character');

if (issues.length) {
  console.error(`Definition expansion gap manifest validation failed with ${issues.length} issue(s).`);
  for (const issue of issues.slice(0, 100)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'passed',
  manifest: options.manifest,
  rows: rows.length,
  route_rows: routeRows,
  no_route_rows: noRouteRows,
  prehud_allowed_rows: prehudAllowed,
  candidate_lanes: manifest.dictionary_source_candidates.target_lanes.length,
  nc_evidence_reports: manifest.dictionary_source_candidates.nc_evidence_reports?.length || 0,
}, null, 2));

function parseArgs(args) {
  const parsed = { ...defaults };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--manifest') parsed.manifest = cleanRelativePath(args[++index]);
    else if (arg === '--csv') parsed.csv = cleanRelativePath(args[++index]);
    else if (arg === '--report') parsed.report = cleanRelativePath(args[++index]);
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (parsed.help) {
    console.log([
      'Usage: node scripts/validate_definition_expansion_gap_manifest.mjs [options]',
      '',
      'Options:',
      '  --manifest data/definitions/definition-expansion-gap-manifest.json',
      '  --csv data/definitions/definition-expansion-gap-manifest.csv',
      '  --report reports/definition-expansion-gap-manifest-2026-06-11.md',
    ].join('\n'));
    process.exit(0);
  }
  return parsed;
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('\0')) throw new Error(`Invalid path: ${value}`);
  if (path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to repo root: ${value}`);
  }
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function containsReplacementCharacter(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return false;
  return fs.readFileSync(fullPath, 'utf8').includes('\uFFFD');
}

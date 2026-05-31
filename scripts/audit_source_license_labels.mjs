#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const reportPath = process.argv[2] || 'reports/source-license-label-audit.md';
const sourceDir = 'data/sources';

const allowedLicenses = new Set([
  'CC-BY-SA',
  'CC-BY-SA 4.0',
  'CC BY-SA 4.0',
  'CC-BY',
  'CC-BY 4.0',
  'CC BY 4.0',
  'CC0',
  'Public Domain',
  'Public Domain Mark',
]);
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;

function count(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function sortedEntries(map, limit = 50) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

function trackedSourceFiles() {
  const stdout = execFileSync('git', ['ls-files', '--', `${sourceDir}/*.json`], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return stdout.split(/\r?\n/).filter(Boolean).sort();
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function licenseStatus(license) {
  if (!license) return 'missing';
  if (forbiddenLicenseRe.test(license)) return 'forbidden';
  if (allowedLicenses.has(license)) return 'allowed';
  return 'unrecognized';
}

const files = trackedSourceFiles();
const stats = {
  source_files: files.length,
  units: 0,
  allowed_units: 0,
  forbidden_units: 0,
  unrecognized_units: 0,
  missing_units: 0,
};
const licenseCounts = new Map();
const statusCounts = new Map();
const rejectedWorks = new Map();
const rejectedFiles = new Map();

for (const relativePath of files) {
  const data = readJson(relativePath);
  const workId = data.work_id || path.basename(relativePath, '.json');
  for (const unit of Array.isArray(data.units) ? data.units : []) {
    const license = String(unit.license || data.license || '').trim();
    const status = licenseStatus(license);
    stats.units += 1;
    count(licenseCounts, license || '(missing)');
    count(statusCounts, status);
    if (status === 'allowed') stats.allowed_units += 1;
    if (status === 'forbidden') stats.forbidden_units += 1;
    if (status === 'unrecognized') stats.unrecognized_units += 1;
    if (status === 'missing') stats.missing_units += 1;
    if (status !== 'allowed') {
      count(rejectedWorks, `${workId} | ${license || '(missing)'}`);
      count(rejectedFiles, `${relativePath} | ${license || '(missing)'}`);
    }
  }
}

const report = [
  '# Source License Label Audit',
  '',
  'Generated from tracked `data/sources/*.json` files.',
  '',
  '## Scope',
  '',
  '- This report audits source unit license labels only.',
  '- It does not normalize, relabel, or accept shorthand labels.',
  '- Importers should continue rejecting unrecognized shorthand such as `PD` until source metadata is deliberately normalized.',
  '',
  '## Counts',
  '',
  `- Source files: ${stats.source_files}`,
  `- Source units: ${stats.units}`,
  `- Allowed units: ${stats.allowed_units}`,
  `- Forbidden units: ${stats.forbidden_units}`,
  `- Unrecognized units: ${stats.unrecognized_units}`,
  `- Missing-license units: ${stats.missing_units}`,
  '',
  '## Status Counts',
  '',
  ...sortedEntries(statusCounts).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## License Labels',
  '',
  ...sortedEntries(licenseCounts).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Top Rejected Works',
  '',
  ...sortedEntries(rejectedWorks, 40).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Top Rejected Files',
  '',
  ...sortedEntries(rejectedFiles, 40).map(([key, value]) => `- ${key}: ${value}`),
  '',
].join('\n');

fs.mkdirSync(path.dirname(path.join(root, reportPath)), { recursive: true });
fs.writeFileSync(path.join(root, reportPath), report, 'utf8');

console.log(`Source license label audit complete. Unrecognized units: ${stats.unrecognized_units}. Report: ${reportPath}`);

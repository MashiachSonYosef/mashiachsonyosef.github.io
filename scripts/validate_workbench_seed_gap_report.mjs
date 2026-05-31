#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/seed-gap-report.json');
const report = readJson(reportPath);
const issues = [];

const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
const forbiddenFieldNames = new Set([
  'definition',
  'definition_text',
  'gloss',
  'meaning',
  'meaning_claim',
  'meanings',
  'translation',
  'english_translation',
  'imported_translation',
  'winner',
  'final_answer',
  'phrase_hebrew',
  'source_phrase',
]);

if (report.schema_version !== 1) issues.push('schema_version must be 1');
if (report.artifact_type !== 'workbench_seed_gap_report') issues.push('artifact_type must be workbench_seed_gap_report');
if (!Array.isArray(report.gaps)) issues.push('gaps must be an array');

for (const [index, gap] of (report.gaps || []).entries()) {
  validateGap(gap, `gaps[${index}]`);
}
walk(report, reportPath);

if (issues.length) {
  console.error(`Workbench seed gap report validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench seed gap report validation passed. Gaps: ${(report.gaps || []).length}.`);

function validateGap(gap, context) {
  if (!gap.slug) issues.push(`${context}: missing slug`);
  if (!gap.path) issues.push(`${context}: missing path`);
  if (!fs.existsSync(path.join(root, cleanRelativePath(gap.path || '')))) issues.push(`${context}: missing candidate artifact ${gap.path}`);
  if (!/^[\u0590-\u05FF-]+$/u.test(String(gap.focus?.token_normalized || ''))) {
    issues.push(`${context}: focus.token_normalized must be normalized Hebrew text`);
  }
  for (const [cueIndex, cue] of (gap.top_context_cues || []).entries()) {
    if (!/^[\u0590-\u05FF-]+$/u.test(String(cue.cue || ''))) {
      issues.push(`${context}.top_context_cues[${cueIndex}]: cue must be Hebrew text`);
    }
    if (!Number.isInteger(cue.count) || cue.count < 0) issues.push(`${context}.top_context_cues[${cueIndex}]: invalid count`);
    if (!Number.isInteger(cue.near_focus_count) || cue.near_focus_count < 0) issues.push(`${context}.top_context_cues[${cueIndex}]: invalid near_focus_count`);
  }
  for (const [licenseIndex, row] of (gap.source_licenses || []).entries()) {
    if (forbiddenLicenseRe.test(String(row.value || ''))) {
      issues.push(`${context}.source_licenses[${licenseIndex}]: unsafe or unclear license ${row.value}`);
    }
  }
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing seed gap report: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function walk(value, context, pathParts = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, context, [...pathParts, String(index)]));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    const itemPath = [...pathParts, key].join('.');
    if (forbiddenFieldNames.has(key)) issues.push(`${context}.${itemPath}: forbidden definition/translation/source-phrase field ${key}`);
    walk(item, context, [...pathParts, key]);
  }
}

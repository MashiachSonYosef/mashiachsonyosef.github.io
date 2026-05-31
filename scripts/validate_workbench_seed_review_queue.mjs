#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const queuePath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/seed-review-queue.json');
const queue = readJson(queuePath);
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
  'suggested_definition',
  'suggested_gloss',
]);

if (queue.schema_version !== 1) issues.push('schema_version must be 1');
if (queue.artifact_type !== 'workbench_seed_review_queue') issues.push('artifact_type must be workbench_seed_review_queue');
if (!Array.isArray(queue.targets)) issues.push('targets must be an array');

for (const [index, target] of (queue.targets || []).entries()) {
  validateTarget(target, `targets[${index}]`);
}
walk(queue, queuePath);

if (issues.length) {
  console.error(`Workbench seed review queue validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench seed review queue validation passed. Targets: ${(queue.targets || []).length}.`);

function validateTarget(target, context) {
  if (!target.review_id) issues.push(`${context}: missing review_id`);
  if (!target.candidate_artifact) issues.push(`${context}: missing candidate_artifact`);
  else if (!fs.existsSync(path.join(root, cleanRelativePath(target.candidate_artifact)))) {
    issues.push(`${context}: missing candidate artifact ${target.candidate_artifact}`);
  }
  if (!/^[\u0590-\u05FF-]+$/u.test(String(target.focus?.token_normalized || ''))) {
    issues.push(`${context}: focus.token_normalized must be normalized Hebrew text`);
  }
  if (!Number.isInteger(target.priority_score) || target.priority_score < 0) {
    issues.push(`${context}: priority_score must be a non-negative integer`);
  }
  if (!Array.isArray(target.selected_context_cues) || !target.selected_context_cues.length) {
    issues.push(`${context}: selected_context_cues must be non-empty`);
  }
  for (const [cueIndex, cue] of (target.selected_context_cues || []).entries()) {
    const cueContext = `${context}.selected_context_cues[${cueIndex}]`;
    if (!/^[\u0590-\u05FF-]+$/u.test(String(cue.cue || ''))) issues.push(`${cueContext}: cue must be Hebrew text`);
    if (!Number.isInteger(cue.count) || cue.count < 0) issues.push(`${cueContext}: invalid count`);
    if (!Number.isInteger(cue.near_focus_count) || cue.near_focus_count < 0) issues.push(`${cueContext}: invalid near_focus_count`);
  }
  for (const [licenseIndex, row] of (target.source_licenses || []).entries()) {
    if (forbiddenLicenseRe.test(String(row.value || ''))) {
      issues.push(`${context}.source_licenses[${licenseIndex}]: unsafe or unclear license ${row.value}`);
    }
  }
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing seed review queue: ${relativePath}`);
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

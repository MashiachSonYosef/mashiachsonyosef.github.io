#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const queuePath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/smoke-target-queue.json');
const queue = readJson(queuePath);
const issues = [];
const forbiddenTextRe = /\bAI says\b|\bChatGPT\b|\bLLM\b|\bprobably\b|\bmaybe\b|\bPotential\b|potential option|Non-?Commercial|\bNC\b|all rights reserved|copyright unclear/i;
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
]);

if (queue.schema_version !== 1) issues.push('schema_version must be 1');
if (queue.artifact_type !== 'workbench_target_queue') issues.push('artifact_type must be workbench_target_queue');
if (!Array.isArray(queue.targets) || !queue.targets.length) issues.push('targets must be a non-empty array');

const seenSlugs = new Set();
const seenSourceFiles = new Map();
for (const [index, target] of (queue.targets || []).entries()) {
  validateTarget(target, `targets[${index}]`);
}
walk(queue, queuePath);

if (issues.length) {
  console.error(`Workbench smoke target validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench smoke target validation passed. Targets: ${(queue.targets || []).length}.`);

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing smoke target queue: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function validateTarget(target, context) {
  for (const field of ['token_key', 'token_normalized', 'slug', 'target_reason', 'target_kind', 'priority_score', 'source_files']) {
    if (target?.[field] === undefined || target?.[field] === null || target?.[field] === '') {
      issues.push(`${context}: missing ${field}`);
    }
  }
  if (target.slug) {
    if (seenSlugs.has(target.slug)) issues.push(`${context}: duplicate slug ${target.slug}`);
    seenSlugs.add(target.slug);
  }
  if (target.known_nonzero_support !== true) issues.push(`${context}: known_nonzero_support must be true`);
  if (target.allow_prefix_family !== false) issues.push(`${context}: allow_prefix_family must be false for smoke queues`);
  if (!['seeded_nonzero_support_smoke', 'known_nonzero_support_smoke'].includes(String(target.target_kind || ''))) {
    issues.push(`${context}: target_kind must be seeded_nonzero_support_smoke or known_nonzero_support_smoke`);
  }
  if (!['seeded_frame_available', 'known_nonzero_support_smoke'].includes(String(target.target_reason || ''))) {
    issues.push(`${context}: target_reason must be seeded_frame_available or known_nonzero_support_smoke`);
  }
  if (!/^[\u0590-\u05FF-]+$/u.test(String(target.token_normalized || ''))) {
    issues.push(`${context}: token_normalized must be normalized Hebrew text`);
  }
  if (!Array.isArray(target.source_files) || target.source_files.length < 1 || target.source_files.length > 5) {
    issues.push(`${context}: source_files must include 1-5 files`);
  }
  for (const [sourceIndex, sourceFile] of (target.source_files || []).entries()) {
    const sourceContext = `${context}.source_files[${sourceIndex}]`;
    const cleanPath = cleanRelativePath(sourceFile);
    if (!cleanPath.startsWith('data/sources/') || !cleanPath.endsWith('.json')) {
      issues.push(`${sourceContext}: must point to data/sources/*.json`);
    }
    if (!fs.existsSync(path.join(root, cleanPath))) issues.push(`${sourceContext}: missing source file ${cleanPath}`);
    const firstContext = seenSourceFiles.get(cleanPath);
    if (firstContext) issues.push(`${sourceContext}: duplicate source file already listed at ${firstContext}`);
    else seenSourceFiles.set(cleanPath, sourceContext);
  }
  const counts = target.expected_status_counts || {};
  const nonAmbiguous = Number(counts.supported || 0) + Number(counts.candidate || 0) + Number(counts.weak || 0);
  if (nonAmbiguous <= 0) issues.push(`${context}: expected_status_counts must include nonzero supported/candidate/weak evidence`);
}

function walk(value, context, pathParts = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, context, [...pathParts, String(index)]));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    const itemPath = [...pathParts, key].join('.');
    if (forbiddenFieldNames.has(key)) issues.push(`${context}.${itemPath}: forbidden definition/translation field ${key}`);
    if (typeof item === 'string' && forbiddenTextRe.test(item)) {
      issues.push(`${context}.${itemPath}: forbidden wording ${item.slice(0, 120)}`);
    }
    walk(item, context, [...pathParts, key]);
  }
}

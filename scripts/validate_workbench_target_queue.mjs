#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const queuePath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/target-queue.json');
const queue = readJson(queuePath);
const issues = [];

const maxSourceFiles = Number(process.env.WORKBENCH_MAX_SOURCE_FILES || 5);
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
for (const [index, target] of (queue.targets || []).entries()) {
  validateTarget(target, `targets[${index}]`);
}
walk(queue, queuePath);

if (issues.length) {
  console.error(`Workbench target queue validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench target queue validation passed. Targets: ${(queue.targets || []).length}.`);

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
  if (!/^[a-zA-Z0-9._-]+$/.test(String(target.slug || ''))) issues.push(`${context}: slug must be filesystem-safe`);
  if (!/^[\u0590-\u05FF-]+$/u.test(String(target.token_normalized || ''))) {
    issues.push(`${context}: token_normalized must be normalized Hebrew text`);
  }
  if (!Number.isFinite(Number(target.priority_score))) issues.push(`${context}: priority_score must be numeric`);
  if (target.allow_prefix_family !== false) issues.push(`${context}: allow_prefix_family must be false unless reviewed for expansion`);
  if (typeof target.known_nonzero_support !== 'boolean') issues.push(`${context}: known_nonzero_support must be boolean`);
  if (!Array.isArray(target.source_files) || target.source_files.length < 1 || target.source_files.length > maxSourceFiles) {
    issues.push(`${context}: source_files must include 1-${maxSourceFiles} files`);
  }
  for (const [sourceIndex, sourceFile] of (target.source_files || []).entries()) {
    validateSourceFile(sourceFile, `${context}.source_files[${sourceIndex}]`);
  }
  for (const [summaryIndex, summary] of (target.source_file_summaries || []).entries()) {
    if (summary?.source_file) validateSourceFile(summary.source_file, `${context}.source_file_summaries[${summaryIndex}].source_file`);
  }
}

function validateSourceFile(sourceFile, context) {
  const cleanPath = cleanRelativePath(sourceFile);
  if (!cleanPath.startsWith('data/sources/') || !cleanPath.endsWith('.json')) {
    issues.push(`${context}: must point to data/sources/*.json`);
    return;
  }
  if (cleanPath.includes('..') || path.isAbsolute(cleanPath)) {
    issues.push(`${context}: unsafe path ${sourceFile}`);
    return;
  }
  if (!fs.existsSync(path.join(root, cleanPath))) issues.push(`${context}: missing source file ${cleanPath}`);
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing target queue: ${relativePath}`);
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
    if (forbiddenFieldNames.has(key)) issues.push(`${context}.${itemPath}: forbidden definition/translation field ${key}`);
    if (typeof item === 'string' && forbiddenTextRe.test(item)) {
      issues.push(`${context}.${itemPath}: forbidden wording ${item.slice(0, 120)}`);
    }
    walk(item, context, [...pathParts, key]);
  }
}

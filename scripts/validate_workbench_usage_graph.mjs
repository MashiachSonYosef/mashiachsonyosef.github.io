#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const graphPath = process.argv[2] || '.local-cache/workbench-evidence/full/reshit-occurrence-graph.json';
const candidatesPath = process.argv[3] || '.local-cache/workbench-evidence/full/reshit-candidate-evidence.json';

const allowedStatuses = new Set(['supported', 'candidate', 'weak', 'ambiguous', 'blocked']);
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
const forbiddenVerdictRe = /\btherefore\b.*\bmeans\b|\bdefinition:\b|\bAI says\b|\bChatGPT\b|\bLLM\b|\bprobably\b|\bmaybe\b/i;
const forbiddenFields = new Set([
  'definition',
  'definition_text',
  'gloss',
  'meanings',
  'meaning_claim',
  'english_translation',
  'imported_translation',
  'ai_as_citation',
  'final_answer',
  'winner',
]);

const issues = [];
const graph = readJson(graphPath);
const candidates = readJson(candidatesPath);

if (graph.schema_version !== 1) issues.push('graph schema_version must be 1');
if (graph.artifact_type !== 'workbench_occurrence_graph') issues.push('graph artifact_type must be workbench_occurrence_graph');
if (candidates.schema_version !== 1) issues.push('candidate schema_version must be 1');
if (candidates.artifact_type !== 'workbench_candidate_evidence') issues.push('candidate artifact_type must be workbench_candidate_evidence');
if (!graph.focus?.token_key) issues.push('graph focus.token_key is required');
if (candidates.focus?.token_key !== graph.focus?.token_key) issues.push('candidate focus token_key must match graph');

const occurrenceIds = new Set();
for (const [index, occurrence] of asArray(graph.occurrence_markers).entries()) {
  const context = `occurrence_markers[${index}]`;
  requireFields(occurrence, [
    'occurrence_id',
    'token_key',
    'token_surface',
    'token_normalized',
    'focus_normalized',
    'match_basis',
    'cluster_id',
    'source_ref',
    'work_id',
    'work_title',
    'source_url',
    'version_title',
    'version_source',
    'license',
    'license_url',
  ], context);
  occurrenceIds.add(occurrence.occurrence_id);
  if (!hasFocusToken(occurrence.phrase_window?.phrase_tokens)) issues.push(`${context}: phrase_window.phrase_tokens must include role=focus-token`);
  validateSourceRows(occurrence.source_rows, context);
  checkLicense(occurrence.license, `${context}.license`);
  walk(occurrence, context);
}

for (const [index, row] of asArray(candidates.candidate_rows).entries()) {
  const context = `candidate_rows[${index}]`;
  requireFields(row, [
    'candidate_id',
    'occurrence_id',
    'token_key',
    'token_surface',
    'token_normalized',
    'focus_normalized',
    'route_type',
    'candidate_status',
    'cluster_id',
    'raw_score',
    'phrase_hebrew',
    'source_ref',
    'work_id',
    'work_title',
    'source_url',
    'version_title',
    'version_source',
    'license',
    'license_url',
    'usage_note',
  ], context);
  if (!occurrenceIds.has(row.occurrence_id)) issues.push(`${context}: occurrence_id does not exist in graph`);
  if (row.route_type !== 'workbench_usage_commentary') issues.push(`${context}: route_type must be workbench_usage_commentary`);
  if (!allowedStatuses.has(row.candidate_status)) issues.push(`${context}: invalid candidate_status ${row.candidate_status}`);
  if (row.not_a_definition !== true) issues.push(`${context}: not_a_definition must be true`);
  if (row.observed_usage_only !== true) issues.push(`${context}: observed_usage_only must be true`);
  if (!Number.isFinite(row.raw_score) || row.raw_score < 0 || row.raw_score > 100) issues.push(`${context}: raw_score must be 0..100`);
  if (!hasFocusToken(row.phrase_tokens)) issues.push(`${context}: phrase_tokens must include role=focus-token`);
  validateSourceRows(row.source_rows, context);
  checkLicense(row.license, `${context}.license`);
  walk(row, context);
}

for (const [index, row] of asArray(graph.blocked_rows).entries()) validateBlocked(row, `graph.blocked_rows[${index}]`);
for (const [index, row] of asArray(candidates.blocked_rows).entries()) validateBlocked(row, `candidate.blocked_rows[${index}]`);

if (issues.length) {
  console.error(`Workbench usage graph validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench usage graph validation passed. Occurrences: ${occurrenceIds.size}. Candidates: ${asArray(candidates.candidate_rows).length}.`);

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing file: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function requireFields(row, fields, context) {
  for (const field of fields) {
    if (row?.[field] === undefined || row?.[field] === null || row?.[field] === '') {
      issues.push(`${context}: missing ${field}`);
    }
  }
}

function hasFocusToken(tokens) {
  return asArray(tokens).some((token) => token?.role === 'focus-token');
}

function validateSourceRows(rows, context) {
  if (!asArray(rows).length) {
    issues.push(`${context}: missing source_rows`);
    return;
  }
  for (const [index, row] of rows.entries()) {
    const rowContext = `${context}.source_rows[${index}]`;
    requireFields(row, ['source_name', 'source_family', 'source_id', 'source_url', 'version_title', 'version_source', 'license', 'license_url'], rowContext);
    checkLicense(row.license, `${rowContext}.license`);
  }
}

function validateBlocked(row, context) {
  requireFields(row, ['blocked_id', 'reason', 'source_file', 'work_id', 'work_title', 'license', 'note'], context);
  if (!/Blocked before source text quotation/.test(row.note || '')) {
    issues.push(`${context}: blocked note must confirm no source text quotation`);
  }
}

function checkLicense(license, context) {
  if (!license || forbiddenLicenseRe.test(String(license))) issues.push(`${context}: unsafe or unclear license ${license || 'missing'}`);
}

function walk(value, context, pathParts = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, context, [...pathParts, String(index)]));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    const itemPath = [...pathParts, key].join('.');
    if (forbiddenFields.has(key)) issues.push(`${context}.${itemPath}: forbidden verdict/definition field ${key}`);
    if (typeof item === 'string' && forbiddenVerdictRe.test(item)) {
      issues.push(`${context}.${itemPath}: forbidden verdict wording ${item.slice(0, 120)}`);
    }
    walk(item, context, [...pathParts, key]);
  }
}

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const manifestPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/handoff/reshit/manifest.json');
const manifest = readJson(manifestPath);
const issues = [];

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

if (manifest.schema_version !== 1) issues.push('manifest schema_version must be 1');
if (manifest.artifact_type !== 'workbench_usage_handoff_manifest') {
  issues.push('manifest artifact_type must be workbench_usage_handoff_manifest');
}
if (!manifest.focus?.token_key) issues.push('manifest focus.token_key is required');

let occurrenceCount = 0;
const occurrenceIds = new Set();
await readJsonl(manifest.paths?.occurrences_jsonl, (row, lineNumber) => {
  occurrenceCount += 1;
  const context = `occurrences line ${lineNumber}`;
  requireFields(row, ['occurrence_id', 'token_key', 'token_surface', 'token_normalized', 'focus_normalized', 'source_ref', 'work_id', 'license'], context);
  occurrenceIds.add(row.occurrence_id);
  if (!hasFocusToken(row.phrase_window?.phrase_tokens)) issues.push(`${context}: missing focus-token`);
  validateSourceRows(row.source_rows, context);
  checkLicense(row.license, `${context}.license`);
  walk(row, context);
});

let candidateCount = 0;
await readJsonl(manifest.paths?.candidates_jsonl, (row, lineNumber) => {
  candidateCount += 1;
  const context = `candidates line ${lineNumber}`;
  requireFields(row, ['candidate_id', 'occurrence_id', 'token_key', 'candidate_status', 'route_type', 'raw_score', 'usage_note'], context);
  if (!occurrenceIds.has(row.occurrence_id)) issues.push(`${context}: unknown occurrence_id`);
  if (row.route_type !== 'workbench_usage_commentary') issues.push(`${context}: invalid route_type ${row.route_type}`);
  if (!allowedStatuses.has(row.candidate_status)) issues.push(`${context}: invalid candidate_status ${row.candidate_status}`);
  if (row.not_a_definition !== true) issues.push(`${context}: not_a_definition must be true`);
  if (row.observed_usage_only !== true) issues.push(`${context}: observed_usage_only must be true`);
  if (!Number.isFinite(row.raw_score) || row.raw_score < 0 || row.raw_score > 100) issues.push(`${context}: raw_score must be 0..100`);
  if (!hasFocusToken(row.phrase_tokens)) issues.push(`${context}: missing focus-token`);
  validateSourceRows(row.source_rows, context);
  checkLicense(row.license, `${context}.license`);
  walk(row, context);
});

const clusters = readJson(manifest.paths?.clusters_json);
if (clusters.artifact_type !== 'workbench_cluster_index') issues.push('clusters artifact_type must be workbench_cluster_index');
if (!Array.isArray(clusters.clusters)) issues.push('clusters.clusters must be an array');

let blockedCount = 0;
await readJsonl(manifest.paths?.blocked_jsonl, (row, lineNumber) => {
  blockedCount += 1;
  const context = `blocked line ${lineNumber}`;
  requireFields(row, ['blocked_id', 'reason', 'source_file', 'work_id', 'work_title', 'license'], context);
});

if (manifest.counts?.occurrence_markers !== occurrenceCount) issues.push('manifest occurrence count does not match JSONL');
if (manifest.counts?.candidate_rows !== candidateCount) issues.push('manifest candidate count does not match JSONL');
if (manifest.counts?.blocked_rows !== blockedCount) issues.push('manifest blocked count does not match JSONL');

if (issues.length) {
  console.error(`Workbench usage handoff validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench usage handoff validation passed. Occurrences: ${occurrenceCount}. Candidates: ${candidateCount}. Blocked: ${blockedCount}.`);

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function readJson(relativePath) {
  if (!relativePath) throw new Error('Missing path');
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

async function readJsonl(relativePath, onRow) {
  if (!relativePath) {
    issues.push('missing JSONL path');
    return;
  }
  const fullPath = path.join(root, cleanRelativePath(relativePath));
  if (!fs.existsSync(fullPath)) {
    issues.push(`missing JSONL file ${relativePath}`);
    return;
  }
  const rl = readline.createInterface({
    input: fs.createReadStream(fullPath, 'utf8'),
    crlfDelay: Infinity,
  });
  let lineNumber = 0;
  for await (const line of rl) {
    lineNumber += 1;
    const trimmed = line.trim();
    if (!trimmed) continue;
    let row;
    try {
      row = JSON.parse(trimmed);
    } catch (error) {
      issues.push(`${relativePath} line ${lineNumber}: invalid JSON ${error.message}`);
      continue;
    }
    onRow(row, lineNumber);
  }
}

function requireFields(row, fields, context) {
  for (const field of fields) {
    if (row?.[field] === undefined || row?.[field] === null || row?.[field] === '') {
      issues.push(`${context}: missing ${field}`);
    }
  }
}

function hasFocusToken(tokens) {
  return Array.isArray(tokens) && tokens.some((token) => token?.role === 'focus-token');
}

function validateSourceRows(rows, context) {
  if (!Array.isArray(rows) || !rows.length) {
    issues.push(`${context}: missing source_rows`);
    return;
  }
  for (const [index, row] of rows.entries()) {
    const rowContext = `${context}.source_rows[${index}]`;
    requireFields(row, ['source_name', 'source_family', 'source_id', 'source_url', 'version_title', 'version_source', 'license', 'license_url'], rowContext);
    checkLicense(row.license, `${rowContext}.license`);
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

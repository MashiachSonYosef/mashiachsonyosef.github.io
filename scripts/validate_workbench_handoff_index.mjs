#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const indexPath = cleanRelativePath(process.argv[2] || '.local-cache/workbench-evidence/handoff-index.json');
const artifact = readJson(indexPath);
const issues = [];

const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
const forbiddenTextRe = /\bAI says\b|\bChatGPT\b|\bLLM\b|\bprobably\b|\bmaybe\b|\bPotential\b|potential option/i;
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

if (artifact.schema_version !== 1) issues.push('schema_version must be 1');
if (artifact.artifact_type !== 'workbench_handoff_index') issues.push('artifact_type must be workbench_handoff_index');
if (!Array.isArray(artifact.evidence_dirs) || !artifact.evidence_dirs.length) issues.push('evidence_dirs must be a non-empty array');
if (!Array.isArray(artifact.manifests)) issues.push('manifests must be an array');

const manifestRows = Array.isArray(artifact.manifests) ? artifact.manifests : [];
const seenTokenKeys = new Set();
const expectedCounts = {
  manifests: manifestRows.length,
  occurrence_markers: 0,
  candidate_rows: 0,
  clusters: 0,
  blocked_rows: 0,
};

for (const [index, manifest] of manifestRows.entries()) {
  const context = `manifests[${index}]`;
  validateManifestEntry(manifest, context);
}

for (const [key, expected] of Object.entries(expectedCounts)) {
  if (Number(artifact.counts?.[key] || 0) !== expected) {
    issues.push(`counts.${key} expected ${expected}, found ${artifact.counts?.[key]}`);
  }
}

walk(artifact, indexPath);

if (issues.length) {
  console.error(`Workbench handoff index validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench handoff index validation passed. Manifests: ${manifestRows.length}. Candidates: ${expectedCounts.candidate_rows}.`);

function validateManifestEntry(row, context) {
  requireFields(row, ['slug', 'manifest_path', 'generated_at', 'focus', 'paths', 'counts'], context);
  const tokenKey = row.focus?.token_key || row.focus?.token_normalized;
  if (!tokenKey) issues.push(`${context}: focus token key is required`);
  if (artifact.options?.dedupe !== false && tokenKey) {
    if (seenTokenKeys.has(tokenKey)) issues.push(`${context}: duplicate focus token ${tokenKey}`);
    seenTokenKeys.add(tokenKey);
  }
  if (artifact.options?.include_smoke !== true && /smoke/i.test(String(row.slug || row.manifest_path || ''))) {
    issues.push(`${context}: smoke handoff included without include_smoke`);
  }
  if (artifact.options?.only_smoke === true && !/smoke/i.test(String(row.slug || row.manifest_path || ''))) {
    issues.push(`${context}: non-smoke handoff included with only_smoke`);
  }
  if (!/^[\u0590-\u05FF-]+$/u.test(String(row.focus?.token_normalized || ''))) {
    issues.push(`${context}: focus.token_normalized must be normalized Hebrew text`);
  }
  validateRelativeFile(row.manifest_path, `${context}.manifest_path`);
  for (const field of ['occurrences_jsonl', 'candidates_jsonl', 'clusters_json', 'blocked_jsonl']) {
    validateRelativeFile(row.paths?.[field], `${context}.paths.${field}`);
  }
  for (const field of ['graph', 'candidates']) {
    if (row.source_artifacts?.[field]) validateRelativeFile(row.source_artifacts[field], `${context}.source_artifacts.${field}`);
  }
  for (const key of ['occurrence_markers', 'candidate_rows', 'clusters', 'blocked_rows']) {
    const value = Number(row.counts?.[key]);
    if (!Number.isInteger(value) || value < 0) {
      issues.push(`${context}.counts.${key}: must be a non-negative integer`);
    } else {
      expectedCounts[key] += value;
    }
  }
}

function requireFields(row, fields, context) {
  for (const field of fields) {
    if (row?.[field] === undefined || row?.[field] === null || row?.[field] === '') {
      issues.push(`${context}: missing ${field}`);
    }
  }
}

function validateRelativeFile(relativePath, context) {
  const cleanPath = cleanRelativePath(relativePath);
  if (!cleanPath) {
    issues.push(`${context}: missing path`);
    return;
  }
  if (path.isAbsolute(cleanPath) || cleanPath.includes('..')) {
    issues.push(`${context}: unsafe path ${relativePath}`);
    return;
  }
  if (!fs.existsSync(path.join(root, cleanPath))) issues.push(`${context}: missing file ${cleanPath}`);
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing workbench handoff index: ${relativePath}`);
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
    if (key.toLowerCase().includes('license') && typeof item === 'string' && forbiddenLicenseRe.test(item)) {
      issues.push(`${context}.${itemPath}: unsafe or unclear license ${item.slice(0, 120)}`);
    }
    if (typeof item === 'string' && forbiddenTextRe.test(item)) {
      issues.push(`${context}.${itemPath}: forbidden wording ${item.slice(0, 120)}`);
    }
    walk(item, context, [...pathParts, key]);
  }
}

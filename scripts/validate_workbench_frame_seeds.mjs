#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const seedPaths = process.argv.slice(2).length
  ? process.argv.slice(2).map(cleanRelativePath)
  : [
    'data/workbench-evidence/frame-seeds.json',
    'data/paraphrase-evidence/route-frame-seeds.json',
  ];

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
  'final_answer',
  'winner',
]);

const issues = [];

for (const seedPath of seedPaths) {
  validateSeedFile(seedPath);
}

if (issues.length) {
  console.error(`Workbench frame seed validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Workbench frame seed validation passed for ${seedPaths.length} file(s).`);

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    issues.push(`${relativePath}: missing seed file`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (error) {
    issues.push(`${relativePath}: invalid JSON ${error.message}`);
    return null;
  }
}

function validateSeedFile(seedPath) {
  const data = readJson(seedPath);
  if (!data) return;
  const context = seedPath;
  if (data.schema_version !== 1) issues.push(`${context}: schema_version must be 1`);
  validateSourceRows(data.source_rows, `${context}.source_rows`);
  if (!Array.isArray(data.frames) || !data.frames.length) issues.push(`${context}: frames must be a non-empty array`);
  for (const [index, frame] of (data.frames || []).entries()) {
    validateFrame(frame, `${context}.frames[${index}]`);
  }
  walk(data, context);
}

function validateSourceRows(rows, context) {
  if (!Array.isArray(rows) || !rows.length) {
    issues.push(`${context}: missing project-authored source row`);
    return;
  }
  for (const [index, row] of rows.entries()) {
    const rowContext = `${context}[${index}]`;
    for (const field of ['source_name', 'source_family', 'source_id', 'source_url', 'license', 'license_url']) {
      if (!row?.[field]) issues.push(`${rowContext}: missing ${field}`);
    }
    if (row?.source_family !== 'workspace') issues.push(`${rowContext}: source_family must be workspace`);
    if (row?.license !== 'project-authored / CC0') issues.push(`${rowContext}: seed license must be project-authored / CC0`);
    if (forbiddenLicenseRe.test(String(row?.license || ''))) issues.push(`${rowContext}: unsafe license ${row?.license || 'missing'}`);
  }
}

function validateFrame(frame, context) {
  for (const field of ['frame_id', 'token_normalized']) {
    if (!frame?.[field]) issues.push(`${context}: missing ${field}`);
  }
  if (!/^[\u0590-\u05FF-]+$/u.test(String(frame?.token_normalized || ''))) {
    issues.push(`${context}: token_normalized must be normalized Hebrew text`);
  }
  if (!Array.isArray(frame?.route_selectors) || !frame.route_selectors.length) {
    issues.push(`${context}: route_selectors must be non-empty`);
  }
  if (!Array.isArray(frame?.context_cues) || !frame.context_cues.length) {
    issues.push(`${context}: context_cues must be non-empty`);
  }
  for (const [index, cue] of (frame?.context_cues || []).entries()) {
    const cueContext = `${context}.context_cues[${index}]`;
    if (!/^[\u0590-\u05FF-]+$/u.test(String(cue?.cue || ''))) {
      issues.push(`${cueContext}: cue must be normalized Hebrew text`);
    }
    if (!Number.isFinite(cue?.weight) || cue.weight <= 0 || cue.weight > 100) {
      issues.push(`${cueContext}: weight must be > 0 and <= 100`);
    }
  }
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
      issues.push(`${context}.${itemPath}: forbidden uncertain/AI wording ${item.slice(0, 120)}`);
    }
    walk(item, context, [...pathParts, key]);
  }
}

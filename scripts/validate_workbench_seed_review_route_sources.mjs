#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const defaults = {
  queue: '.local-cache/workbench-evidence/seed-review-queue.json',
  maxIssues: 80,
};

const allowedLicenses = new Set([
  'project-authored / CC0',
  'CC0',
  'CC BY 4.0',
  'CC-BY',
  'CC-BY 4.0',
  'CC BY-SA 4.0',
  'CC-BY-SA',
  'CC-BY-SA 4.0',
  'CC BY-SA 4.0 / GFDL',
  'CC BY-SA 4.0/GFDL',
  'Public Domain',
  'Public Domain Mark',
  'N/A - project lexical rule',
  'N/A - project-authored lexical rules',
]);
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
const finalLetters = new Map([
  ['\u05da', '\u05db'],
  ['\u05dd', '\u05de'],
  ['\u05df', '\u05e0'],
  ['\u05e3', '\u05e4'],
  ['\u05e5', '\u05e6'],
]);
const forbiddenSampleFields = new Set([
  'answer_score',
  'raw_score',
  'adjusted_score',
  'confidence_percent',
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

const options = parseArgs(process.argv.slice(2));
const queue = readJson(options.queue);
const issues = [];
const refs = [];

if (queue.schema_version !== 1) addIssue('queue: schema_version must be 1');
if (queue.artifact_type !== 'workbench_seed_review_queue') addIssue('queue: artifact_type must be workbench_seed_review_queue');
if (!Array.isArray(queue.targets)) addIssue('queue: targets must be an array');

for (const [targetIndex, target] of (queue.targets || []).entries()) {
  const sampleLinks = Array.isArray(target.sample_route_links) ? target.sample_route_links : [];
  if (!sampleLinks.length) addIssue(`targets[${targetIndex}]: sample_route_links must be non-empty`);
  for (const [routeIndex, route] of sampleLinks.entries()) {
    const context = `targets[${targetIndex}].sample_route_links[${routeIndex}]`;
    validateSampleRouteLink(route, context);
  }
}

const refsByPath = groupRefsByPath(refs);
for (const [relativePath, fileRefs] of refsByPath.entries()) {
  await validateRouteFile(relativePath, fileRefs);
}

if (issues.length) {
  console.error(`Workbench seed review route-source validation failed with ${issues.length} issue(s):`);
  for (const issue of issues.slice(0, options.maxIssues)) console.error(`- ${issue}`);
  if (issues.length > options.maxIssues) console.error(`- ... ${issues.length - options.maxIssues} additional issue(s) omitted`);
  process.exit(1);
}

console.log(`Workbench seed review route-source validation passed. Targets: ${(queue.targets || []).length}; route samples: ${refs.length}.`);

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--queue=')) parsed.queue = cleanRelativePath(valueAfterEquals(arg));
    else if (arg.startsWith('--max-issues=')) parsed.maxIssues = Number(valueAfterEquals(arg));
    else if (!arg.startsWith('--') && arg.trim()) parsed.queue = cleanRelativePath(arg);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(parsed.maxIssues) || parsed.maxIssues < 0) throw new Error('--max-issues must be a non-negative integer');
  return parsed;
}

function validateSampleRouteLink(route, context) {
  if (!route || typeof route !== 'object') {
    addIssue(`${context}: route link must be an object`);
    return;
  }
  const routeId = String(route.route_id || '');
  const routeSource = String(route.route_source || '');
  if (!routeId) addIssue(`${context}: missing route_id`);
  if (!routeSource) addIssue(`${context}: missing route_source`);
  for (const key of Object.keys(route)) {
    if (forbiddenSampleFields.has(key)) {
      addIssue(`${context}: sampled route link must not carry answer/evidence text or score field ${key}`);
    }
  }
  const parsedSource = parseRouteSource(routeSource);
  if (!parsedSource) {
    addIssue(`${context}: route_source must be a JSONL line pointer, got ${routeSource}`);
    return;
  }
  refs.push({
    context,
    routeId,
    route,
    relativePath: parsedSource.relativePath,
    lineNumber: parsedSource.lineNumber,
  });
}

function parseRouteSource(routeSource) {
  const match = String(routeSource || '').match(/^(.+\.jsonl):([1-9][0-9]*)$/);
  if (!match) return null;
  return {
    relativePath: cleanRelativePath(match[1]),
    lineNumber: Number(match[2]),
  };
}

function groupRefsByPath(items) {
  const grouped = new Map();
  for (const item of items) {
    if (!grouped.has(item.relativePath)) grouped.set(item.relativePath, []);
    grouped.get(item.relativePath).push(item);
  }
  return grouped;
}

async function validateRouteFile(relativePath, fileRefs) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    for (const ref of fileRefs) addIssue(`${ref.context}: missing route source file ${relativePath}`);
    return;
  }
  const refsByLine = new Map();
  for (const ref of fileRefs) {
    if (!refsByLine.has(ref.lineNumber)) refsByLine.set(ref.lineNumber, []);
    refsByLine.get(ref.lineNumber).push(ref);
  }
  const pendingLines = new Set(refsByLine.keys());
  const rl = readline.createInterface({
    input: fs.createReadStream(fullPath, 'utf8'),
    crlfDelay: Infinity,
  });
  let lineNumber = 0;
  for await (const line of rl) {
    lineNumber += 1;
    if (!pendingLines.has(lineNumber)) continue;
    pendingLines.delete(lineNumber);
    let row;
    try {
      row = JSON.parse(line);
    } catch (error) {
      for (const ref of refsByLine.get(lineNumber) || []) {
        addIssue(`${ref.context}: invalid JSON at ${relativePath}:${lineNumber}: ${error.message}`);
      }
      continue;
    }
    for (const ref of refsByLine.get(lineNumber) || []) validateRouteRow(ref, row);
    if (!pendingLines.size) rl.close();
  }
  for (const missingLine of pendingLines) {
    for (const ref of refsByLine.get(missingLine) || []) {
      addIssue(`${ref.context}: route source line not found ${relativePath}:${missingLine}`);
    }
  }
}

function validateRouteRow(ref, row) {
  const rowRouteId = routeIdForRow(row);
  if (!rowRouteId) addIssue(`${ref.context}: source row is missing claim/evidence/card route ID`);
  else if (rowRouteId !== ref.routeId) {
    addIssue(`${ref.context}: route_id mismatch, queue has ${ref.routeId}, source row has ${rowRouteId}`);
  }
  compareOptionalField(ref, row, 'route_family');
  compareOptionalField(ref, row, 'route_type');
  compareOptionalField(ref, row, 'normalized', row.normalized || row.focus_normalized || row.containing_token_normalized);
  compareOptionalField(ref, row, 'surface', row.surface || row.focus_surface || row.containing_token_surface);
  validateSourceRows(row, ref.context);
  if (Number.isInteger(ref.route.source_row_count)) {
    const actualSourceRows = Array.isArray(row.source_rows) ? row.source_rows.length : 0;
    if (Number(ref.route.source_row_count) !== actualSourceRows) {
      addIssue(`${ref.context}: source_row_count mismatch, queue has ${ref.route.source_row_count}, source row has ${actualSourceRows}`);
    }
  }
}

function compareOptionalField(ref, row, field, rowValueOverride = undefined) {
  const queueValue = ref.route[field];
  if (queueValue === undefined || queueValue === null || queueValue === '') return;
  const rowValue = rowValueOverride === undefined ? row[field] : rowValueOverride;
  if (rowValue === undefined || rowValue === null || rowValue === '') return;
  if (field === 'normalized') {
    const queueKey = hebrewRouteKey(queueValue);
    const rowKey = hebrewRouteKey(rowValue);
    if (queueKey && rowKey && queueKey === rowKey) return;
  }
  if (String(queueValue) !== String(rowValue)) {
    addIssue(`${ref.context}: ${field} mismatch, queue has ${queueValue}, source row has ${rowValue}`);
  }
}

function validateSourceRows(row, context) {
  const sourceRows = Array.isArray(row.source_rows) ? row.source_rows : [];
  if (!sourceRows.length) {
    addIssue(`${context}: source route row has no source_rows`);
    return;
  }
  for (const [sourceIndex, sourceRow] of sourceRows.entries()) {
    const sourceContext = `${context}.source_rows[${sourceIndex}]`;
    const license = String(sourceRow?.license || '');
    if (!license) addIssue(`${sourceContext}: missing license`);
    else if (forbiddenLicenseRe.test(license) || !allowedLicenses.has(license)) {
      addIssue(`${sourceContext}: unsafe or unallowlisted license ${license}`);
    }
    for (const field of ['source_name', 'source_family', 'source_id', 'source_url', 'license_url']) {
      if (!sourceRow?.[field]) addIssue(`${sourceContext}: missing ${field}`);
    }
  }
}

function routeIdForRow(row) {
  return String(row?.claim_id || row?.evidence_id || row?.card_id || row?.route_id || '');
}

function hebrewRouteKey(value) {
  return normalizeFinalLetters(String(value || '')
    .normalize('NFC')
    .replace(/[\u0591-\u05BD\u05BF-\u05C7]/gu, '')
    .replace(/\u05BE/gu, '-')
    .replace(/[^\u0590-\u05FF-]+/gu, ' ')
    .replace(/\s*-\s*/g, '-')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, ''));
}

function normalizeFinalLetters(value) {
  return Array.from(value, (ch) => finalLetters.get(ch) || ch).join('');
}

function addIssue(message) {
  issues.push(message);
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing seed review queue: ${relativePath}`);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  return arg.split('=').slice(1).join('=');
}

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const contractPath = path.join(root, 'data', 'definitions', 'paraphrase-evidence-contract.json');
const samplePath = path.join(root, 'data', 'definitions', 'paraphrase-evidence-sample.json');
const localJsonlPath = path.join(root, '.local-cache', 'definition-routes', 'source-paraphrase-evidence.jsonl');

const allowedRouteTypes = new Set([
  'biblical_paraphrase_evidence',
  'citable_paraphrase_evidence',
]);

const allowedStatuses = new Set(['proposed', 'accepted', 'rejected']);

const allowedLicensePatterns = [
  /^CC0$/i,
  /^CC BY 4\.0$/i,
  /^CC-BY$/i,
  /^CC-BY 4\.0$/i,
  /^CC BY-SA 4\.0$/i,
  /^CC-BY-SA$/i,
  /^CC-BY-SA 4\.0$/i,
  /^CC BY-SA 4\.0 \/ GFDL$/i,
  /^CC BY-SA 4\.0\/GFDL$/i,
  /^Public Domain$/i,
  /^Public Domain Mark$/i,
  /^project-authored \/ CC0$/i,
];

const forbiddenTextRe = /\bPotential\b|potential option|copyright unclear|all rights reserved|Non-?Commercial|\bNC\b|AI as citation|ai-as-citation/i;
const forbiddenFieldNames = new Set([
  'imported_translation',
  'english_translation',
  'source_translation',
  'ai_as_citation',
  'license_override',
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeLicense(row) {
  const license = String(row?.license || '').trim();
  return allowedLicensePatterns.some((pattern) => pattern.test(license));
}

function walk(value, visit, pathParts = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visit, [...pathParts, String(index)]));
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      visit(key, item, [...pathParts, key]);
      walk(item, visit, [...pathParts, key]);
    }
  }
}

function validateSourceRows(rows, context, issues) {
  if (!asArray(rows).length) {
    issues.push(`${context}: missing source_rows`);
    return;
  }
  for (const [index, row] of rows.entries()) {
    const rowContext = `${context}.source_rows[${index}]`;
    for (const field of ['source_name', 'source_family', 'source_id', 'source_url', 'license', 'license_url']) {
      if (!row?.[field]) issues.push(`${rowContext}: missing ${field}`);
    }
    if (!safeLicense(row)) issues.push(`${rowContext}: unsafe or unclear license ${row?.license || 'missing'}`);
  }
}

function hasFocusToken(tokens) {
  return asArray(tokens).some((token) => token?.role === 'focus-token');
}

function validateRow(row, context, issues) {
  for (const field of ['evidence_id', 'route_type', 'candidate_status', 'focus_surface', 'focus_normalized', 'definition', 'match_type', 'phrase_hebrew', 'source_ref', 'work_id', 'work_title']) {
    if (!row?.[field]) issues.push(`${context}: missing ${field}`);
  }
  if (!allowedRouteTypes.has(row?.route_type)) issues.push(`${context}: invalid route_type ${row?.route_type || 'missing'}`);
  if (!allowedStatuses.has(row?.candidate_status)) issues.push(`${context}: invalid candidate_status ${row?.candidate_status || 'missing'}`);
  if (!Number.isFinite(row?.raw_score) || row.raw_score < 0 || row.raw_score > 100) {
    issues.push(`${context}: raw_score must be 0..100`);
  }
  if (row?.score_handicap !== 20) issues.push(`${context}: score_handicap must be 20`);
  if (Number.isFinite(row?.raw_score) && row?.adjusted_score !== row.raw_score - 20) {
    issues.push(`${context}: adjusted_score must equal raw_score - 20`);
  }
  if (!hasFocusToken(row?.phrase_tokens)) issues.push(`${context}: phrase_tokens must include role=focus-token`);
  validateSourceRows(row?.source_rows, context, issues);

  walk(row, (key, value, pathParts) => {
    if (forbiddenFieldNames.has(key)) issues.push(`${context}.${pathParts.join('.')}: forbidden field ${key}`);
    if (typeof value === 'string' && forbiddenTextRe.test(value)) {
      issues.push(`${context}.${pathParts.join('.')}: forbidden text ${value.slice(0, 120)}`);
    }
  });
}

async function readJsonl(filePath, onRow) {
  if (!fs.existsSync(filePath)) return 0;
  const stream = fs.createReadStream(filePath, 'utf8');
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let count = 0;
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    count += 1;
    let row;
    try {
      row = JSON.parse(trimmed);
    } catch (error) {
      onRow(null, count, error);
      continue;
    }
    onRow(row, count, null);
  }
  return count;
}

const issues = [];
if (!fs.existsSync(contractPath)) issues.push(`missing contract: ${contractPath}`);
if (!fs.existsSync(samplePath)) issues.push(`missing sample: ${samplePath}`);

if (!issues.length) {
  const contract = readJson(contractPath);
  const sample = readJson(samplePath);
  if (contract.schema_version !== 1) issues.push('contract schema_version must be 1');
  if (contract.scoring?.required_score_handicap !== 20) issues.push('contract scoring.required_score_handicap must be 20');
  for (const routeType of allowedRouteTypes) {
    if (!asArray(contract.route_types).includes(routeType)) issues.push(`contract route_types missing ${routeType}`);
  }
  validateSourceRows(contract.source_rows, 'contract', issues);

  if (sample.schema_version !== 1) issues.push('sample schema_version must be 1');
  for (const [index, row] of asArray(sample.samples).entries()) {
    validateRow(row, `sample.samples[${index}]`, issues);
  }
}

const localRowsRead = await readJsonl(localJsonlPath, (row, lineNumber, error) => {
  if (error) {
    issues.push(`local JSONL line ${lineNumber}: invalid JSON ${error.message}`);
    return;
  }
  validateRow(row, `local JSONL line ${lineNumber}`, issues);
});

if (issues.length) {
  console.error(`Paraphrase evidence validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Paraphrase evidence validation passed. Local rows read: ${localRowsRead}.`);

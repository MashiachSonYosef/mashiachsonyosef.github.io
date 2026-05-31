#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const inputPath = process.argv[2] || '.local-cache/definition-routes/source-phrase-evidence.jsonl';
const reportPath = process.argv[3] || 'reports/phrase-evidence-audit.md';

const allowedRouteTypes = new Set(['phrase_evidence', 'subphrase_evidence']);
const allowedLicensePatterns = [
  /^CC0$/i,
  /^CC BY 4\.0$/i,
  /^CC-BY$/i,
  /^CC-BY 4\.0$/i,
  /^CC BY-SA 4\.0$/i,
  /^CC-BY-SA$/i,
  /^CC-BY-SA 4\.0$/i,
  /^Public Domain$/i,
  /^Public Domain Mark$/i,
];
const forbiddenTextRe = /\bPotential\b|potential option|copyright unclear|all rights reserved|Non-?Commercial|\bNC\b|AI as citation|ai-as-citation/i;
const forbiddenFieldNames = new Set([
  'definition',
  'gloss',
  'imported_translation',
  'english_translation',
  'source_translation',
  'ai_as_citation',
  'license_override',
]);

function count(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function sortedEntries(map, limit = 30) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

function safeLicense(license) {
  return allowedLicensePatterns.some((pattern) => pattern.test(String(license || '').trim()));
}

function hasFocusToken(tokens) {
  return Array.isArray(tokens) && tokens.some((token) => token?.role === 'focus-token');
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

async function readRows(relativePath, onRow) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing phrase evidence JSONL: ${relativePath}`);
  const rl = readline.createInterface({
    input: fs.createReadStream(fullPath, 'utf8'),
    crlfDelay: Infinity,
  });
  let lineNumber = 0;
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    lineNumber += 1;
    onRow(JSON.parse(trimmed), lineNumber);
  }
  return lineNumber;
}

const stats = {
  rows: 0,
  phrase_rows: 0,
  subphrase_rows: 0,
  min_evidence_strength: null,
  max_evidence_strength: null,
};
const issues = [];
const routeTypes = new Map();
const workIds = new Map();
const sourceLicenses = new Map();
const focusTokens = new Map();

await readRows(inputPath, (row, lineNumber) => {
  stats.rows += 1;
  if (row.route_type === 'phrase_evidence') stats.phrase_rows += 1;
  if (row.route_type === 'subphrase_evidence') stats.subphrase_rows += 1;

  const context = `line ${lineNumber}`;
  if (row.route_family !== 'source_phrase_evidence') issues.push(`${context}: route_family must be source_phrase_evidence`);
  if (!allowedRouteTypes.has(row.route_type)) issues.push(`${context}: invalid route_type ${row.route_type || 'missing'}`);
  for (const field of ['evidence_id', 'focus_surface', 'focus_normalized', 'containing_token_surface', 'containing_token_normalized', 'phrase_hebrew', 'source_ref', 'work_id', 'work_title']) {
    if (!row?.[field]) issues.push(`${context}: missing ${field}`);
  }
  if (row.meaning_claim !== null) issues.push(`${context}: meaning_claim must be null for phrase evidence`);
  if (!hasFocusToken(row.phrase_tokens)) issues.push(`${context}: phrase_tokens missing focus-token`);
  if (!Number.isFinite(row.evidence_strength) || row.evidence_strength < 0 || row.evidence_strength > 100) {
    issues.push(`${context}: evidence_strength must be 0..100`);
  }
  if (row.route_type === 'phrase_evidence' && row.focus_part_index !== null) {
    issues.push(`${context}: phrase_evidence focus_part_index must be null`);
  }
  if (row.route_type === 'subphrase_evidence') {
    if (!Number.isInteger(row.focus_part_index) || row.focus_part_index < 0) {
      issues.push(`${context}: subphrase_evidence focus_part_index must be a non-negative integer`);
    }
    if (row.focus_surface === row.containing_token_surface) {
      issues.push(`${context}: subphrase_evidence must preserve a distinct containing token`);
    }
  }

  if (!Array.isArray(row.source_rows) || !row.source_rows.length) {
    issues.push(`${context}: missing source_rows`);
  }
  for (const [index, sourceRow] of (row.source_rows || []).entries()) {
    const sourceContext = `${context}.source_rows[${index}]`;
    for (const field of ['source_name', 'source_family', 'source_id', 'source_url', 'license', 'license_url']) {
      if (!sourceRow?.[field]) issues.push(`${sourceContext}: missing ${field}`);
    }
    if (sourceRow?.source_family !== 'hebrew_source_text') issues.push(`${sourceContext}: source_family must be hebrew_source_text`);
    if (!safeLicense(sourceRow?.license)) issues.push(`${sourceContext}: unsafe license ${sourceRow?.license || 'missing'}`);
    count(sourceLicenses, sourceRow?.license || '(missing)');
  }

  walk(row, (key, value, pathParts) => {
    if (forbiddenFieldNames.has(key)) issues.push(`${context}.${pathParts.join('.')}: forbidden field ${key}`);
    if (typeof value === 'string' && forbiddenTextRe.test(value)) {
      issues.push(`${context}.${pathParts.join('.')}: forbidden text ${value.slice(0, 120)}`);
    }
  });

  count(routeTypes, row.route_type || '(missing)');
  count(workIds, row.work_id || '(missing)');
  count(focusTokens, row.focus_normalized || '(missing)');
  stats.min_evidence_strength = stats.min_evidence_strength === null ? row.evidence_strength : Math.min(stats.min_evidence_strength, row.evidence_strength);
  stats.max_evidence_strength = stats.max_evidence_strength === null ? row.evidence_strength : Math.max(stats.max_evidence_strength, row.evidence_strength);
});

const report = [
  '# Phrase Evidence Audit',
  '',
  'Generated from the current local phrase evidence JSONL.',
  '',
  '## Scope',
  '',
  `- Input: ${inputPath}`,
  '- Lane: Hebrew phrase and subphrase usage evidence only.',
  '- Rows do not contain English definitions, imported translations, or inferred meanings.',
  '- Subphrase rows are limited to explicit maqaf-linked token parts preserved in the source text.',
  '',
  '## Counts',
  '',
  `- Rows: ${stats.rows}`,
  `- Phrase rows: ${stats.phrase_rows}`,
  `- Subphrase rows: ${stats.subphrase_rows}`,
  `- Evidence strength range: ${stats.min_evidence_strength ?? 'n/a'}-${stats.max_evidence_strength ?? 'n/a'}`,
  `- Distinct works: ${workIds.size}`,
  `- Distinct focus tokens: ${focusTokens.size}`,
  '',
  '## Route Types',
  '',
  ...sortedEntries(routeTypes).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Source Licenses',
  '',
  ...sortedEntries(sourceLicenses).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Top Works',
  '',
  ...sortedEntries(workIds, 20).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Top Focus Tokens',
  '',
  ...sortedEntries(focusTokens, 20).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Validation',
  '',
  issues.length ? `- Issues: ${issues.length}` : '- Issues: 0',
  ...issues.slice(0, 80).map((issue) => `- ${issue}`),
  '',
].join('\n');

fs.mkdirSync(path.dirname(path.join(root, reportPath)), { recursive: true });
fs.writeFileSync(path.join(root, reportPath), report, 'utf8');

if (issues.length) {
  console.error(`Phrase evidence audit failed with ${issues.length} issue(s).`);
  for (const issue of issues.slice(0, 80)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Phrase evidence audit passed. Rows: ${stats.rows}. Report: ${reportPath}`);

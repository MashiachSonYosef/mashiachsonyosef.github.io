#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const inputPath = process.argv[2] || '.local-cache/definition-routes/source-citable-paraphrase-evidence.jsonl';
const reportPath = process.argv[3] || 'reports/citable-paraphrase-evidence-audit.md';

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

const biblicalWorkIds = new Set([
  'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
  'joshua', 'judges', 'i-samuel', 'ii-samuel', 'i-kings', 'ii-kings',
  'isaiah', 'jeremiah', 'ezekiel', 'hosea', 'joel', 'amos', 'obadiah',
  'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai',
  'zechariah', 'malachi', 'psalms', 'proverbs', 'job', 'song-of-songs',
  'ruth', 'lamentations', 'ecclesiastes', 'esther', 'daniel', 'ezra',
  'nehemiah', 'i-chronicles', 'ii-chronicles',
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

async function readRows(relativePath, onRow) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing citable evidence JSONL: ${relativePath}`);
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
  accepted_rows: 0,
  proposed_rows: 0,
  rejected_rows: 0,
  min_raw_score: null,
  max_raw_score: null,
  min_adjusted_score: null,
  max_adjusted_score: null,
};
const issues = [];
const routeTypes = new Map();
const workIds = new Map();
const definitionSources = new Map();
const sourceLicenses = new Map();
const usageLicenses = new Map();
const focusTokens = new Map();

await readRows(inputPath, (row, lineNumber) => {
  stats.rows += 1;
  if (row.candidate_status === 'accepted') stats.accepted_rows += 1;
  else if (row.candidate_status === 'proposed') stats.proposed_rows += 1;
  else if (row.candidate_status === 'rejected') stats.rejected_rows += 1;
  else issues.push(`line ${lineNumber}: invalid candidate_status ${row.candidate_status || 'missing'}`);

  if (row.route_type !== 'citable_paraphrase_evidence') issues.push(`line ${lineNumber}: unexpected route_type ${row.route_type || 'missing'}`);
  if (biblicalWorkIds.has(String(row.work_id || '').toLowerCase())) issues.push(`line ${lineNumber}: biblical work leaked into citable lane: ${row.work_id}`);
  if (!hasFocusToken(row.phrase_tokens)) issues.push(`line ${lineNumber}: missing phrase_tokens focus-token`);
  if (row.score_handicap !== 20) issues.push(`line ${lineNumber}: score_handicap must be 20`);
  if (!Number.isFinite(row.raw_score) || row.raw_score < 0 || row.raw_score > 100) issues.push(`line ${lineNumber}: raw_score must be 0..100`);
  if (Number.isFinite(row.raw_score) && row.adjusted_score !== row.raw_score - 20) {
    issues.push(`line ${lineNumber}: adjusted_score must equal raw_score - 20`);
  }

  count(routeTypes, row.route_type || '(missing)');
  count(workIds, row.work_id || '(missing)');
  count(focusTokens, row.focus_normalized || '(missing)');
  if (row.source_definition_route_family) count(definitionSources, row.source_definition_route_family);

  for (const [index, sourceRow] of (row.source_rows || []).entries()) {
    const license = sourceRow?.license || '(missing)';
    count(sourceLicenses, license);
    if (!safeLicense(license)) issues.push(`line ${lineNumber}.source_rows[${index}]: unsafe license ${license}`);
    if (sourceRow?.source_family === 'hebrew_source_text') count(usageLicenses, license);
  }

  stats.min_raw_score = stats.min_raw_score === null ? row.raw_score : Math.min(stats.min_raw_score, row.raw_score);
  stats.max_raw_score = stats.max_raw_score === null ? row.raw_score : Math.max(stats.max_raw_score, row.raw_score);
  stats.min_adjusted_score = stats.min_adjusted_score === null ? row.adjusted_score : Math.min(stats.min_adjusted_score, row.adjusted_score);
  stats.max_adjusted_score = stats.max_adjusted_score === null ? row.adjusted_score : Math.max(stats.max_adjusted_score, row.adjusted_score);
});

const report = [
  '# Citable Paraphrase Evidence Audit',
  '',
  'Generated from the current local citable paraphrase evidence JSONL.',
  '',
  '## Scope',
  '',
  `- Input: ${inputPath}`,
  '- Lane: citable definitions/paraphrases only.',
  '- Biblical definition rows are intentionally excluded; the biblical cross-reference worker owns that lane.',
  '- Rows combine a licensed lexical definition or project morphology source row with a licensed non-biblical Hebrew usage row.',
  '- This report does not publish row definitions or source excerpts; it only summarizes provenance and scoring health.',
  '',
  '## Counts',
  '',
  `- Rows: ${stats.rows}`,
  `- Accepted rows: ${stats.accepted_rows}`,
  `- Proposed rows: ${stats.proposed_rows}`,
  `- Rejected rows: ${stats.rejected_rows}`,
  `- Raw score range: ${stats.min_raw_score ?? 'n/a'}-${stats.max_raw_score ?? 'n/a'}`,
  `- Adjusted score range: ${stats.min_adjusted_score ?? 'n/a'}-${stats.max_adjusted_score ?? 'n/a'}`,
  `- Distinct works: ${workIds.size}`,
  `- Distinct focus tokens: ${focusTokens.size}`,
  '',
  '## Route Types',
  '',
  ...sortedEntries(routeTypes).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Definition Sources',
  '',
  ...sortedEntries(definitionSources).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Usage Licenses',
  '',
  ...sortedEntries(usageLicenses).map(([key, value]) => `- ${key}: ${value}`),
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
  console.error(`Citable paraphrase audit failed with ${issues.length} issue(s).`);
  for (const issue of issues.slice(0, 80)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Citable paraphrase audit passed. Rows: ${stats.rows}. Report: ${reportPath}`);

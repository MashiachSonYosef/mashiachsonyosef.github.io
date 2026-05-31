#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();
const phrasePath = process.argv[2] || '.local-cache/definition-routes/source-phrase-evidence.jsonl';
const citablePath = process.argv[3] || '.local-cache/definition-routes/source-citable-paraphrase-evidence.jsonl';
const reportPath = process.argv[4] || 'reports/definition-coverage-audit.md';

function count(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function sortedEntries(map, limit = 30) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

function percent(part, total) {
  if (!total) return '0.00%';
  return `${((part / total) * 100).toFixed(2)}%`;
}

async function readJsonl(relativePath, onRow) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing JSONL input: ${relativePath}`);
  const rl = readline.createInterface({
    input: fs.createReadStream(fullPath, 'utf8'),
    crlfDelay: Infinity,
  });
  let rows = 0;
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    rows += 1;
    onRow(JSON.parse(trimmed), rows);
  }
  return rows;
}

const phrase = {
  rows: 0,
  focus: new Set(),
  focusCounts: new Map(),
  routeTypes: new Map(),
  works: new Map(),
};
const citable = {
  rows: 0,
  acceptedRows: 0,
  focus: new Set(),
  focusCounts: new Map(),
  definitionSources: new Map(),
  works: new Map(),
};
const issues = [];

phrase.rows = await readJsonl(phrasePath, (row, lineNumber) => {
  if (!row.focus_normalized) issues.push(`${phrasePath} line ${lineNumber}: missing focus_normalized`);
  if (!['phrase_evidence', 'subphrase_evidence'].includes(row.route_type)) {
    issues.push(`${phrasePath} line ${lineNumber}: unexpected route_type ${row.route_type || 'missing'}`);
  }
  if (row.focus_normalized) {
    phrase.focus.add(row.focus_normalized);
    count(phrase.focusCounts, row.focus_normalized);
  }
  count(phrase.routeTypes, row.route_type || '(missing)');
  count(phrase.works, row.work_id || '(missing)');
});

citable.rows = await readJsonl(citablePath, (row, lineNumber) => {
  if (row.route_type !== 'citable_paraphrase_evidence') {
    issues.push(`${citablePath} line ${lineNumber}: unexpected route_type ${row.route_type || 'missing'}`);
  }
  if (row.candidate_status === 'accepted') citable.acceptedRows += 1;
  else issues.push(`${citablePath} line ${lineNumber}: non-accepted candidate_status ${row.candidate_status || 'missing'}`);
  if (!row.focus_normalized) issues.push(`${citablePath} line ${lineNumber}: missing focus_normalized`);
  if (row.focus_normalized) {
    citable.focus.add(row.focus_normalized);
    count(citable.focusCounts, row.focus_normalized);
  }
  count(citable.definitionSources, row.source_definition_route_family || '(missing)');
  count(citable.works, row.work_id || '(missing)');
});

let phraseCoveredByCitable = 0;
const uncoveredPhraseCounts = new Map();
for (const normalized of phrase.focus) {
  if (citable.focus.has(normalized)) {
    phraseCoveredByCitable += 1;
  } else {
    uncoveredPhraseCounts.set(normalized, phrase.focusCounts.get(normalized) || 0);
  }
}

let citableSeenInPhrase = 0;
for (const normalized of citable.focus) {
  if (phrase.focus.has(normalized)) citableSeenInPhrase += 1;
}

const report = [
  '# Definition Coverage Audit',
  '',
  'Generated from local phrase evidence and citable paraphrase evidence JSONL files.',
  '',
  '## Scope',
  '',
  `- Phrase input: ${phrasePath}`,
  `- Citable input: ${citablePath}`,
  '- This is a planning audit only. It publishes no definitions, source excerpts, or HUD cards.',
  '',
  '## Coverage',
  '',
  `- Phrase rows read: ${phrase.rows}`,
  `- Citable rows read: ${citable.rows}`,
  `- Accepted citable rows: ${citable.acceptedRows}`,
  `- Distinct phrase/subphrase focus tokens: ${phrase.focus.size}`,
  `- Distinct citable definition-backed focus tokens: ${citable.focus.size}`,
  `- Phrase focus tokens with citable route: ${phraseCoveredByCitable}`,
  `- Phrase focus token coverage: ${percent(phraseCoveredByCitable, phrase.focus.size)}`,
  `- Citable focus tokens also seen in phrase evidence: ${citableSeenInPhrase}`,
  `- Citable overlap with phrase evidence: ${percent(citableSeenInPhrase, citable.focus.size)}`,
  '',
  '## Phrase Route Types',
  '',
  ...sortedEntries(phrase.routeTypes).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Citable Definition Sources',
  '',
  ...sortedEntries(citable.definitionSources).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Top Phrase Works',
  '',
  ...sortedEntries(phrase.works, 20).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Top Citable Works',
  '',
  ...sortedEntries(citable.works, 20).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Top Phrase Tokens Without Citable Route',
  '',
  ...sortedEntries(uncoveredPhraseCounts, 30).map(([key, value]) => `- ${key}: ${value}`),
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
  console.error(`Definition coverage audit failed with ${issues.length} issue(s).`);
  for (const issue of issues.slice(0, 80)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Definition coverage audit passed. Phrase coverage: ${percent(phraseCoveredByCitable, phrase.focus.size)}. Report: ${reportPath}`);

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
  let rows = 0;
  for (const input of jsonlInputs(relativePath)) {
    const fullPath = path.join(root, input);
    const rl = readline.createInterface({
      input: fs.createReadStream(fullPath, 'utf8'),
      crlfDelay: Infinity,
    });
    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      rows += 1;
      onRow(JSON.parse(trimmed), rows);
    }
  }
  return rows;
}

function jsonlInputs(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing JSONL input: ${relativePath}`);
  const head = readHead(fullPath);
  if (!head.includes('"jsonl-shards"')) return [relativePath];
  const manifest = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  if (manifest.format !== 'jsonl-shards' || !Array.isArray(manifest.shards)) {
    throw new Error(`Invalid JSONL shard manifest: ${relativePath}`);
  }
  return manifest.shards.map((shard) => {
    const shardPath = typeof shard === 'string' ? shard : shard?.path;
    if (!shardPath) throw new Error(`Invalid shard entry in ${relativePath}`);
    if (!fs.existsSync(path.join(root, shardPath))) throw new Error(`Missing JSONL shard: ${shardPath}`);
    return shardPath;
  });
}

function readHead(fullPath) {
  const fd = fs.openSync(fullPath, 'r');
  try {
    const buffer = Buffer.alloc(8192);
    const bytes = fs.readSync(fd, buffer, 0, buffer.length, 0);
    return buffer.toString('utf8', 0, bytes);
  } finally {
    fs.closeSync(fd);
  }
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
  proposedRows: 0,
  rejectedRows: 0,
  focus: new Set(),
  acceptedFocus: new Set(),
  proposedFocus: new Set(),
  focusCounts: new Map(),
  statusCounts: new Map(),
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
  else if (row.candidate_status === 'proposed') citable.proposedRows += 1;
  else if (row.candidate_status === 'rejected') citable.rejectedRows += 1;
  else issues.push(`${citablePath} line ${lineNumber}: invalid candidate_status ${row.candidate_status || 'missing'}`);
  if (!row.focus_normalized) issues.push(`${citablePath} line ${lineNumber}: missing focus_normalized`);
  if (row.focus_normalized) {
    citable.focus.add(row.focus_normalized);
    if (row.candidate_status === 'accepted') citable.acceptedFocus.add(row.focus_normalized);
    if (row.candidate_status === 'proposed') citable.proposedFocus.add(row.focus_normalized);
    count(citable.focusCounts, row.focus_normalized);
  }
  count(citable.statusCounts, row.candidate_status || '(missing)');
  count(citable.definitionSources, row.source_definition_route_family || '(missing)');
  count(citable.works, row.work_id || '(missing)');
});

let phraseCoveredByCitable = 0;
let phraseCoveredByAcceptedCitable = 0;
let phraseCoveredByProposedCitable = 0;
const uncoveredPhraseCounts = new Map();
for (const normalized of phrase.focus) {
  if (citable.focus.has(normalized)) phraseCoveredByCitable += 1;
  if (citable.acceptedFocus.has(normalized)) phraseCoveredByAcceptedCitable += 1;
  if (citable.proposedFocus.has(normalized)) phraseCoveredByProposedCitable += 1;
  if (!citable.focus.has(normalized)) uncoveredPhraseCounts.set(normalized, phrase.focusCounts.get(normalized) || 0);
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
  `- Proposed citable rows: ${citable.proposedRows}`,
  `- Rejected citable rows: ${citable.rejectedRows}`,
  `- Distinct phrase/subphrase focus tokens: ${phrase.focus.size}`,
  `- Distinct citable focus tokens, all statuses: ${citable.focus.size}`,
  `- Distinct accepted citable focus tokens: ${citable.acceptedFocus.size}`,
  `- Distinct proposed citable focus tokens: ${citable.proposedFocus.size}`,
  `- Phrase focus tokens with any citable route: ${phraseCoveredByCitable}`,
  `- Phrase focus token coverage, any status: ${percent(phraseCoveredByCitable, phrase.focus.size)}`,
  `- Phrase focus tokens with accepted citable route: ${phraseCoveredByAcceptedCitable}`,
  `- Phrase focus token coverage, accepted only: ${percent(phraseCoveredByAcceptedCitable, phrase.focus.size)}`,
  `- Phrase focus tokens with proposed citable route: ${phraseCoveredByProposedCitable}`,
  `- Citable focus tokens also seen in phrase evidence: ${citableSeenInPhrase}`,
  `- Citable overlap with phrase evidence: ${percent(citableSeenInPhrase, citable.focus.size)}`,
  '',
  '## Citable Statuses',
  '',
  ...sortedEntries(citable.statusCounts).map(([key, value]) => `- ${key}: ${value}`),
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

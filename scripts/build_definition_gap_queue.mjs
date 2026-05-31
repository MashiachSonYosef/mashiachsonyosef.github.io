#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const root = process.cwd();

const defaults = {
  phrase: '.local-cache/definition-routes/source-phrase-evidence.jsonl',
  phraseIndex: '',
  citable: '.local-cache/definition-routes/source-citable-paraphrase-evidence.jsonl',
  csv: '.local-cache/definition-routes/definition-gap-queue.csv',
  report: 'reports/definition-gap-queue-report.md',
  limit: 5000,
};

const options = parseArgs(process.argv.slice(2));

const phraseCounts = new Map();
const phraseTotalOccurrences = new Map();
const phraseSurfaces = new Map();
const citableCounts = new Map();
const acceptedCounts = new Map();
const proposedCounts = new Map();
const rejectedCounts = new Map();
const definitionSources = new Map();

loadPhraseIndex();

await readJsonl(options.phrase, (row) => {
  const normalized = row.focus_normalized || '';
  if (!normalized) return;
  count(phraseCounts, normalized);
  if (!phraseSurfaces.has(normalized) && row.focus_surface) phraseSurfaces.set(normalized, row.focus_surface);
});

await readJsonl(options.citable, (row) => {
  const normalized = row.focus_normalized || '';
  if (!normalized) return;
  count(citableCounts, normalized);
  if (row.candidate_status === 'accepted') count(acceptedCounts, normalized);
  else if (row.candidate_status === 'proposed') count(proposedCounts, normalized);
  else if (row.candidate_status === 'rejected') count(rejectedCounts, normalized);
  const source = row.source_definition_route_family || '(missing)';
  if (!definitionSources.has(normalized)) definitionSources.set(normalized, new Map());
  count(definitionSources.get(normalized), source);
});

const rows = [...phraseCounts.entries()].map(([normalized, phraseRows]) => {
  const acceptedRows = acceptedCounts.get(normalized) || 0;
  const proposedRows = proposedCounts.get(normalized) || 0;
  const rejectedRows = rejectedCounts.get(normalized) || 0;
  const anyRows = citableCounts.get(normalized) || 0;
  const queue = acceptedRows > 0 ? 'covered' : proposedRows > 0 ? 'proposed_only' : 'uncovered';
  const totalOccurrences = phraseTotalOccurrences.get(normalized) || phraseRows;
  return {
    normalized,
    surface: phraseSurfaces.get(normalized) || '',
    queue,
    total_occurrences: totalOccurrences,
    phrase_rows: phraseRows,
    citable_rows_any_status: anyRows,
    accepted_citable_rows: acceptedRows,
    proposed_citable_rows: proposedRows,
    rejected_citable_rows: rejectedRows,
    definition_sources: sourceSummary(definitionSources.get(normalized)),
  };
}).sort((a, b) => {
  const rank = queueRank(a.queue) - queueRank(b.queue);
  if (rank) return rank;
  return b.total_occurrences - a.total_occurrences || a.normalized.localeCompare(b.normalized);
});

const queuedRows = rows.filter((row) => row.queue !== 'covered').slice(0, options.limit);
writeCsv(options.csv, queuedRows);
writeReport(options.report, rows, queuedRows);

console.log(JSON.stringify({
  phrase_tokens: phraseCounts.size,
  phrase_index_tokens: phraseTotalOccurrences.size,
  citable_tokens: citableCounts.size,
  accepted_tokens: acceptedCounts.size,
  proposed_tokens: proposedCounts.size,
  queued_rows: queuedRows.length,
  csv: options.csv,
  report: options.report,
}, null, 2));

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--phrase=')) parsed.phrase = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--phrase-index=')) parsed.phraseIndex = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--citable=')) parsed.citable = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--csv=')) parsed.csv = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--limit=')) parsed.limit = Number(arg.split('=')[1]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(parsed.limit) || parsed.limit < 0) throw new Error('--limit must be a non-negative integer');
  return parsed;
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('\0')) throw new Error(`Invalid path: ${value}`);
  if (path.isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`Path must be relative to the repo root: ${value}`);
  }
  return normalized;
}

function count(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function queueRank(queue) {
  if (queue === 'uncovered') return 0;
  if (queue === 'proposed_only') return 1;
  return 2;
}

function sourceSummary(map) {
  if (!map) return '';
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}:${value}`)
    .join('; ');
}

function loadPhraseIndex() {
  if (!options.phraseIndex) return;
  const fullPath = path.join(root, options.phraseIndex);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing phrase index: ${options.phraseIndex}`);
  const index = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  for (const row of index.token_totals || index.top_tokens || []) {
    if (!row?.normalized || !Number.isFinite(row.total_occurrences)) continue;
    phraseTotalOccurrences.set(row.normalized, row.total_occurrences);
  }
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

function csvEscape(value) {
  const text = String(value ?? '');
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function writeCsv(relativePath, queueRows) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  const header = [
    'queue',
    'normalized',
    'surface',
    'total_occurrences',
    'phrase_rows',
    'citable_rows_any_status',
    'accepted_citable_rows',
    'proposed_citable_rows',
    'rejected_citable_rows',
    'definition_sources',
  ];
  const lines = [
    header.join(','),
    ...queueRows.map((row) => header.map((key) => csvEscape(row[key])).join(',')),
  ];
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`, 'utf8');
}

function writeReport(relativePath, allRows, queueRows) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  const uncovered = allRows.filter((row) => row.queue === 'uncovered');
  const proposedOnly = allRows.filter((row) => row.queue === 'proposed_only');
  const covered = allRows.filter((row) => row.queue === 'covered');
  const report = [
    '# Definition Gap Queue Report',
    '',
    'Generated from local phrase evidence and citable definition evidence.',
    '',
    '## Scope',
    '',
    `- Phrase input: ${options.phrase}`,
    `- Phrase index: ${options.phraseIndex || '(not provided)'}`,
    `- Citable input: ${options.citable}`,
    `- CSV output: ${options.csv}`,
    '- Purpose: prioritize importer work for frequent source tokens that still lack accepted citable definitions.',
    '- This report publishes token forms and counts only; it does not publish source excerpts or English source-text translations.',
    '',
    '## Counts',
    '',
    `- Distinct phrase tokens: ${phraseCounts.size}`,
    `- Phrase index tokens with total occurrence counts: ${phraseTotalOccurrences.size}`,
    `- Distinct citable tokens, any status: ${citableCounts.size}`,
    `- Distinct accepted citable tokens: ${acceptedCounts.size}`,
    `- Distinct proposed citable tokens: ${proposedCounts.size}`,
    `- Tokens with accepted route: ${covered.length}`,
    `- Tokens with proposed-only route: ${proposedOnly.length}`,
    `- Tokens with no citable route: ${uncovered.length}`,
    `- Queue rows written: ${queueRows.length}`,
    '',
    '## Top Queue Rows',
    '',
    ...queueRows.slice(0, 80).map((row) => `- ${row.queue} | ${row.surface || row.normalized} | occurrences ${row.total_occurrences} | evidence rows ${row.phrase_rows} | accepted ${row.accepted_citable_rows} | proposed ${row.proposed_citable_rows}`),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(root, relativePath), report, 'utf8');
}

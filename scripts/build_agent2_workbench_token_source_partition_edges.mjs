#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const defaults = {
  sourceDir: 'data/sources',
  tokenJsonl: '.local-cache/workbench-evidence/token-inventory-5000.tokens.jsonl',
  partitions: 'reports/agent1-workbench-full-source-name-custody-partitions-2026-06-04.json',
  output: '.local-cache/workbench-evidence/token-source-partition-edges-5000.jsonl',
  report: 'reports/workbench-token-source-partition-edges-5000.md',
  summary: 'reports/workbench-token-source-partition-edges-5000-summary.json',
  limitTokens: 5000,
  sourceFileLimit: 0,
  sourceFileOffset: 0,
  includeUntracked: false,
};
const options = parseArgs(process.argv.slice(2));

const topTokens = await readTopTokenSet(options.tokenJsonl, options.limitTokens);
const partitionIndex = buildPartitionIndex(readJson(options.partitions));
const edgeMap = new Map();
let sourceFilesRead = 0;
let unitsRead = 0;
let unitsWithPartition = 0;
let totalTokenOccurrencesScanned = 0;
let matchedTokenOccurrences = 0;
let unjoinedUnits = 0;

const sourceFiles = collectSourceFiles(options.sourceDir, options.includeUntracked)
  .slice(options.sourceFileOffset, options.sourceFileLimit ? options.sourceFileOffset + options.sourceFileLimit : undefined);

for (const relativePath of sourceFiles) {
  const source = readJson(relativePath);
  sourceFilesRead += 1;
  for (const unit of source.units || []) {
    unitsRead += 1;
    const partition = partitionForUnit(unit, source, partitionIndex);
    if (!partition) {
      unjoinedUnits += 1;
      continue;
    }
    unitsWithPartition += 1;
    for (const token of tokenize(flattenHebrew(unit.hebrew))) {
      totalTokenOccurrencesScanned += 1;
      if (!topTokens.has(token.token_key)) continue;
      matchedTokenOccurrences += 1;
      const edgeKey = [
        token.token_key,
        partition.source_name_partition_id,
        unit.work_id || source.work_id || '',
      ].join('|');
      const edge = edgeMap.get(edgeKey) || makeEdge(token, unit, source, partition);
      edge.occurrence_count += 1;
      if (edge.sample_source_refs.length < 5 && unit.source_ref) edge.sample_source_refs.push(unit.source_ref);
      edgeMap.set(edgeKey, edge);
    }
  }
}

const edgeRows = Array.from(edgeMap.values())
  .sort((a, b) => b.occurrence_count - a.occurrence_count || a.token_key.localeCompare(b.token_key));

writeJsonl(options.output, edgeRows);
const summary = {
  schema_version: '1.0',
  artifact_type: 'workbench_token_source_partition_edges_summary',
  status: 'nonpublic_token_source_partition_edges_built_pre_agent6_boundary',
  generator: 'scripts/build_agent2_workbench_token_source_partition_edges.mjs',
  inputs: {
    source_dir: options.sourceDir,
    token_jsonl: options.tokenJsonl,
    partitions: options.partitions,
    include_untracked: options.includeUntracked,
    source_file_offset: options.sourceFileOffset,
    source_file_limit: options.sourceFileLimit,
  },
  outputs: {
    edges_jsonl: options.output,
    report: options.report,
    summary: options.summary,
  },
  counts: {
    limit_tokens: options.limitTokens,
    source_file_offset: options.sourceFileOffset,
    source_files_selected: sourceFiles.length,
    source_files_read: sourceFilesRead,
    units_read: unitsRead,
    units_with_partition: unitsWithPartition,
    unjoined_units: unjoinedUnits,
    total_token_occurrences_scanned: totalTokenOccurrencesScanned,
    matched_token_occurrences: matchedTokenOccurrences,
    edge_rows: edgeRows.length,
  },
  zero_emission_counters: zeroCounters(),
  boundary: 'Nonpublic source-partition edge metadata only; no Definition authority, candidate text export, answer eligibility, public output, or source/license acceptance.',
};
writeJson(options.summary, summary);
writeReport(options.report, summary);
console.log(`wrote ${options.output}`);
console.log(`wrote ${options.summary}`);
console.log(`wrote ${options.report}`);

function makeEdge(token, unit, source, partition) {
  return {
    token_key: token.token_key,
    token_normalized: token.normalized,
    work_id: unit.work_id || source.work_id || null,
    work_title: unit.work_title || source.work_title || null,
    source_name: partition.source_name,
    source_family: partition.source_family,
    license_label: partition.license_label,
    license_lane: partition.license_lane,
    source_url_or_citation: unit.source_url || partition.version_source || null,
    source_name_partition_id: partition.source_name_partition_id,
    agent6_boundary_required: true,
    source_ref: unit.source_ref || unit.sefaria_ref || null,
    sample_source_refs: [],
    occurrence_count: 0,
    answer_eligible: false,
    public_emit: false,
    definition_content_storage_now: false,
    candidate_text_export_now: false,
  };
}

function buildPartitionIndex(artifact) {
  const index = new Map();
  for (const row of artifact.partition_rows || []) {
    const normalized = {
      ...row,
      source_name_partition_id: stableId('source-name-partition', [
        row.source_name,
        row.license_label,
        row.version_source,
      ]),
    };
    index.set(partitionKey(row.source_name, row.license_label, row.version_source), normalized);
  }
  return index;
}

function partitionForUnit(unit, source, index) {
  const sourceName = unit.version_title || source.version_title || null;
  const license = unit.license || source.license || null;
  const versionSource = unit.version_source || source.version_source || null;
  return index.get(partitionKey(sourceName, license, versionSource));
}

function partitionKey(sourceName, license, versionSource) {
  return JSON.stringify([sourceName || '', license || '', versionSource || '']);
}

async function readTopTokenSet(relativePath, limit) {
  const result = new Set();
  const rl = readline.createInterface({
    input: fs.createReadStream(path.join(root, relativePath), { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    if (!line.trim()) continue;
    const row = JSON.parse(line);
    result.add(row.token_key);
    if (result.size >= limit) {
      rl.close();
      break;
    }
  }
  return result;
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg === '--include-untracked') parsed.includeUntracked = true;
    else if (arg.startsWith('--source-dir=')) parsed.sourceDir = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--token-jsonl=')) parsed.tokenJsonl = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--partitions=')) parsed.partitions = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--summary=')) parsed.summary = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--limit-tokens=')) parsed.limitTokens = Number(arg.split('=')[1]);
    else if (arg.startsWith('--source-file-limit=')) parsed.sourceFileLimit = Number(arg.split('=')[1]);
    else if (arg.startsWith('--source-file-offset=')) parsed.sourceFileOffset = Number(arg.split('=')[1]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(parsed.limitTokens) || parsed.limitTokens < 1) throw new Error('--limit-tokens must be a positive integer');
  if (!Number.isInteger(parsed.sourceFileLimit) || parsed.sourceFileLimit < 0) throw new Error('--source-file-limit must be a non-negative integer');
  if (!Number.isInteger(parsed.sourceFileOffset) || parsed.sourceFileOffset < 0) throw new Error('--source-file-offset must be a non-negative integer');
  return parsed;
}

function collectSourceFiles(sourceDir, includeUntracked) {
  if (includeUntracked) {
    return fs.readdirSync(path.join(root, sourceDir)).filter((name) => name.endsWith('.json')).map((name) => `${sourceDir}/${name}`).sort();
  }
  return execFileSync('git', ['ls-files', '--', `${sourceDir}/*.json`], { cwd: root, encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean)
    .sort();
}

function tokenize(text) {
  const tokens = [];
  for (const match of String(text || '').matchAll(/[\u0590-\u05FF]+(?:[\u05BE-][\u0590-\u05FF]+)*/gu)) {
    const surface = match[0];
    const normalized = normalizeHebrew(surface);
    if (normalized) tokens.push({ surface, normalized, token_key: `he:${normalized}` });
  }
  return tokens;
}

function normalizeHebrew(value) {
  const finalLetters = new Map([['\u05da', '\u05db'], ['\u05dd', '\u05de'], ['\u05df', '\u05e0'], ['\u05e3', '\u05e4'], ['\u05e5', '\u05e6']]);
  return Array.from(String(value || '').normalize('NFC').replace(/[\u0591-\u05BD\u05BF-\u05C7]/gu, '').replace(/[^\u0590-\u05FF-]/gu, ''), (ch) => finalLetters.get(ch) || ch).join('');
}

function flattenHebrew(value) {
  if (Array.isArray(value)) return value.map(flattenHebrew).filter(Boolean).join(' ');
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function stableId(prefix, payload) {
  return `${prefix}-${crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex').slice(0, 16)}`;
}

function zeroCounters() {
  return {
    answer_rows: 0,
    answer_eligible_rows: 0,
    public_reader_output_rows: 0,
    route_jsonl_rows: 0,
    route_shard_writes: 0,
    definition_content_rows: 0,
    candidate_text_export_rows: 0,
    accepted_text_rows: 0,
    public_runtime_mutation: 0,
  };
}

function cleanRelativePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || normalized.split('/').includes('..')) throw new Error(`Path must be repo-relative: ${value}`);
  return normalized;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, cleanRelativePath(relativePath)), 'utf8'));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeJsonl(relativePath, rows) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), rows.map((row) => JSON.stringify(row)).join('\n') + '\n');
}

function writeReport(relativePath, summary) {
  const lines = [
    '# Workbench Token Source Partition Edges 5000',
    '',
    `Status: ${summary.status}.`,
    '',
    `- Source files read: ${summary.counts.source_files_read}.`,
    `- Units read / joined: ${summary.counts.units_read} / ${summary.counts.units_with_partition}.`,
    `- Matched top-token occurrences: ${summary.counts.matched_token_occurrences}.`,
    `- Edge rows: ${summary.counts.edge_rows}.`,
    '- Definition, lemma, reader-hint, candidate-text, answer-eligible, and public-emission rows: 0.',
    '',
    'Boundary: nonpublic source-partition edge metadata only.',
  ];
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`);
}

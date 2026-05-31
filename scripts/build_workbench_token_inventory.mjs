#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const generatedAt = new Date().toISOString();

const defaults = {
  sourceDir: 'data/sources',
  output: '.local-cache/workbench-evidence/token-inventory.json',
  tokensJsonl: '.local-cache/workbench-evidence/token-inventory.tokens.jsonl',
  blockedJsonl: '.local-cache/workbench-evidence/token-inventory.blocked.jsonl',
  report: 'reports/workbench-token-inventory.md',
  includeUntracked: false,
  maxTopSurfaces: 8,
  maxTopWorks: 8,
  maxFirstRefs: 5,
  summaryLimit: 1000,
};

const options = parseArgs(process.argv.slice(2));

const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
const allowedSourceLicenses = new Set([
  'CC-BY-SA',
  'CC-BY-SA 4.0',
  'CC BY-SA 4.0',
  'CC BY-SA 4.0 / GFDL',
  'CC BY-SA 4.0/GFDL',
  'CC-BY',
  'CC-BY 4.0',
  'CC BY 4.0',
  'CC0',
  'Public Domain',
  'Public Domain Mark',
  'project-authored / CC0',
]);

const niqqudAndCantillationRe = /[\u0591-\u05BD\u05BF-\u05C7]/gu;
const htmlTagRe = /<[^>]+>/g;
const tokenRe = /[\u0590-\u05FF]+(?:[\u05BE-][\u0590-\u05FF]+)*/gu;
const finalLetters = new Map([
  ['\u05da', '\u05db'],
  ['\u05dd', '\u05de'],
  ['\u05df', '\u05e0'],
  ['\u05e3', '\u05e4'],
  ['\u05e5', '\u05e6'],
]);

const sourceFiles = collectSourceFiles();
const tokensByNormalized = new Map();
const licenseCounts = new Map();
const blocked = [];

let sourceFilesRead = 0;
let allowedUnits = 0;
let blockedUnits = 0;
let totalTokens = 0;

for (const relativePath of sourceFiles) {
  const source = readJson(relativePath);
  sourceFilesRead += 1;
  const units = Array.isArray(source.units) ? source.units : [];
  for (const unit of units) {
    const license = unit.license || source.license || '';
    if (!isAllowedLicense(license)) {
      blockedUnits += 1;
      if (blocked.length < 200) blocked.push(makeBlockedRow(source, unit, relativePath, license));
      continue;
    }
    allowedUnits += 1;
    increment(licenseCounts, license);
    const workId = source.work_id || unit.work_id || path.basename(relativePath, '.json');
    const workTitle = source.work_title || unit.work_title || workId;
    const sourceRef = unit.source_ref || unit.sefaria_ref || '';
    const hebrew = flattenHebrew(unit.hebrew);
    for (const token of tokenize(hebrew)) {
      totalTokens += 1;
      const entry = getTokenEntry(token.normalized);
      entry.occurrence_count += 1;
      increment(entry.surface_counts, token.surface);
      increment(entry.work_counts, workId);
      if (!entry.work_titles[workId]) entry.work_titles[workId] = workTitle;
      if (entry.first_refs.length < options.maxFirstRefs) {
        entry.first_refs.push({ source_ref: sourceRef, work_id: workId, work_title: workTitle });
      }
    }
  }
}

const tokenRows = Array.from(tokensByNormalized.values()).map((entry) => ({
  token_key: tokenKey(entry.normalized),
  token_normalized: entry.normalized,
  occurrence_count: entry.occurrence_count,
  work_count: entry.work_counts.size,
  top_surfaces: topCounts(entry.surface_counts, 'surface', options.maxTopSurfaces),
  top_works: topCounts(entry.work_counts, 'work_id', options.maxTopWorks).map((row) => ({
    ...row,
    work_title: entry.work_titles[row.work_id] || row.work_id,
  })),
  first_refs: entry.first_refs,
})).sort((a, b) => b.occurrence_count - a.occurrence_count || a.token_normalized.localeCompare(b.token_normalized));

const artifact = {
  schema_version: 1,
  artifact_type: 'workbench_token_inventory',
  generated_at: generatedAt,
  generator: 'scripts/build_workbench_token_inventory.mjs',
  policy: 'High-recall token inventory over eligible Hebrew/Aramaic source text. This is an indexing artifact, not a definition source.',
  inputs: {
    source_files_scanned: sourceFiles.length,
    include_untracked: options.includeUntracked,
  },
  counts: {
    source_files_read: sourceFilesRead,
    allowed_units: allowedUnits,
    blocked_units: blockedUnits,
    total_tokens: totalTokens,
    distinct_normalized_tokens: tokenRows.length,
  },
  paths: {
    tokens_jsonl: options.tokensJsonl,
    blocked_jsonl: options.blockedJsonl,
  },
  license_counts: topCounts(licenseCounts, 'license', 50),
  top_tokens: tokenRows.slice(0, options.summaryLimit),
  blocked_rows_sample: blocked,
};

await writeJsonl(options.tokensJsonl, tokenRows);
await writeJsonl(options.blockedJsonl, blocked);
writeJson(options.output, artifact);
writeReport(options.report, artifact);
console.log(`Wrote ${options.output}`);
console.log(`Wrote ${options.tokensJsonl}`);
console.log(`Wrote ${options.blockedJsonl}`);
console.log(`Wrote ${options.report}`);

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg === '--include-untracked') parsed.includeUntracked = true;
    else if (arg.startsWith('--output=')) parsed.output = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--tokens-jsonl=')) parsed.tokensJsonl = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--blocked-jsonl=')) parsed.blockedJsonl = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--report=')) parsed.report = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--max-top-surfaces=')) parsed.maxTopSurfaces = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-top-works=')) parsed.maxTopWorks = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-first-refs=')) parsed.maxFirstRefs = Number(arg.split('=')[1]);
    else if (arg.startsWith('--summary-limit=')) parsed.summaryLimit = Number(arg.split('=')[1]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  for (const key of ['maxTopSurfaces', 'maxTopWorks', 'maxFirstRefs', 'summaryLimit']) {
    if (!Number.isInteger(parsed[key]) || parsed[key] < 0) {
      throw new Error(`--${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)} must be a non-negative integer`);
    }
  }
  return parsed;
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function collectSourceFiles() {
  const dir = path.join(root, options.sourceDir);
  if (options.includeUntracked) {
    return fs.readdirSync(dir)
      .filter((name) => name.endsWith('.json'))
      .map((name) => `${options.sourceDir}/${name}`)
      .sort();
  }
  try {
    return execFileSync('git', ['ls-files', '--', `${options.sourceDir}/*.json`], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).split(/\r?\n/).filter(Boolean).sort();
  } catch {
    return fs.readdirSync(dir)
      .filter((name) => name.endsWith('.json'))
      .map((name) => `${options.sourceDir}/${name}`)
      .sort();
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, data) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeJsonl(relativePath, rows) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(path.join(root, relativePath), { encoding: 'utf8' });
    stream.on('error', reject);
    stream.on('finish', resolve);
    for (const row of rows) stream.write(`${JSON.stringify(row)}\n`);
    stream.end();
  });
}

function cleanHebrewText(value) {
  return String(value ?? '')
    .replace(htmlTagRe, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function flattenHebrew(value) {
  if (Array.isArray(value)) return value.map(flattenHebrew).filter(Boolean).join(' ');
  return cleanHebrewText(value);
}

function tokenize(text) {
  const tokens = [];
  for (const match of String(text || '').matchAll(tokenRe)) {
    const surface = match[0];
    const normalized = normalizeHebrew(surface);
    if (!normalized) continue;
    tokens.push({ surface, normalized });
  }
  return tokens;
}

function normalizeHebrewPunctuation(value) {
  return String(value || '')
    .normalize('NFC')
    .replace(/([\u0590-\u05FF])'/gu, '$1\u05F3')
    .replace(/([\u0590-\u05FF])"(?=[\u0590-\u05FF])/gu, '$1\u05F4')
    .replace(/\u2010|\u2011|\u2012|\u2013|\u2014/g, '-');
}

function normalizeHebrew(value) {
  let normalized = normalizeHebrewPunctuation(value)
    .replace(niqqudAndCantillationRe, '')
    .replace(/[^\u0590-\u05FF-]/gu, '');
  normalized = Array.from(normalized, (ch) => finalLetters.get(ch) || ch).join('');
  return normalized;
}

function tokenKey(normalized) {
  return `he:${normalized}`;
}

function isAllowedLicense(license) {
  if (!license || typeof license !== 'string') return false;
  if (forbiddenLicenseRe.test(license)) return false;
  return allowedSourceLicenses.has(license);
}

function getTokenEntry(normalized) {
  if (!tokensByNormalized.has(normalized)) {
    tokensByNormalized.set(normalized, {
      normalized,
      occurrence_count: 0,
      surface_counts: new Map(),
      work_counts: new Map(),
      work_titles: {},
      first_refs: [],
    });
  }
  return tokensByNormalized.get(normalized);
}

function makeBlockedRow(source, unit, relativePath, license) {
  const workId = source.work_id || unit.work_id || path.basename(relativePath, '.json');
  return {
    blocked_id: stableId('token-inv-blocked', [relativePath, unit.unit_id || unit.source_ref || unit.sefaria_ref || '', license]),
    source_file: relativePath,
    source_ref: unit.source_ref || unit.sefaria_ref || '',
    work_id: workId,
    work_title: source.work_title || unit.work_title || workId,
    license: license || '',
    reason: 'unsafe_or_missing_license',
  };
}

function stableId(prefix, payload) {
  return `${prefix}-${crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex').slice(0, 16)}`;
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function topCounts(map, keyName, limit) {
  return Array.from(map.entries())
    .map(([key, count]) => ({ [keyName]: key, count }))
    .sort((a, b) => b.count - a.count || String(a[keyName]).localeCompare(String(b[keyName])))
    .slice(0, limit);
}

function writeReport(relativePath, artifact) {
  const topTokens = artifact.top_tokens.slice(0, 25).map((row) => (
    `- ${row.token_normalized}: ${row.occurrence_count} occurrence(s), ${row.work_count} work(s)`
  ));
  const lines = [
    '# Workbench Token Inventory',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    '## Scope',
    '',
    `- Source files scanned: ${artifact.inputs.source_files_scanned}`,
    `- Include untracked sources: ${artifact.inputs.include_untracked}`,
    `- Allowed units: ${artifact.counts.allowed_units}`,
    `- Blocked units: ${artifact.counts.blocked_units}`,
    `- Total tokens: ${artifact.counts.total_tokens}`,
    `- Distinct normalized tokens: ${artifact.counts.distinct_normalized_tokens}`,
    `- Tokens JSONL: ${artifact.paths.tokens_jsonl}`,
    `- Blocked JSONL: ${artifact.paths.blocked_jsonl}`,
    '',
    '## Top Tokens',
    '',
    ...topTokens,
    '',
    '## Boundary',
    '',
    'This inventory only marks token presence and does not produce definitions or usage verdicts.',
    '',
  ];
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${lines.join('\n')}\n`, 'utf8');
}

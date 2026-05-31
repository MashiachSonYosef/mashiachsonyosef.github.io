#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const generatedAt = new Date().toISOString();

const defaults = {
  sourceDir: 'data/sources',
  localDir: '.local-cache/definition-routes',
  claimFiles: [
    '.local-cache/definition-routes/source-layer-definition-claims.jsonl',
    '.local-cache/definition-routes/kaikki-definition-claims.jsonl',
  ],
  morphologyRules: 'data/lexical/morphology-rules.json',
  jsonl: '.local-cache/definition-routes/source-citable-paraphrase-evidence.jsonl',
  jsonlShardMaxBytes: 0,
  csv: '.local-cache/definition-routes/source-citable-paraphrase-evidence.csv',
  index: '.local-cache/definition-routes/source-citable-paraphrase-token-index.json',
  sample: 'data/definitions/citable-paraphrase-evidence-sample.json',
  manifest: 'data/definitions/manifest.json',
  report: 'reports/definition-pipeline-report.md',
  maxPerToken: 40,
  maxTotalRows: 200000,
  maxClaimsPerNormalized: 6,
  maxDefinitionsPerOccurrence: 1,
  maxSourceFiles: 0,
  window: 3,
  candidateStatus: 'accepted',
  morphologyCandidateStatus: 'proposed',
  includeBiblical: false,
  includeUntracked: false,
  includeMorphology: false,
  includeRiskyMorphology: false,
  localOnly: false,
  sourceFiles: [],
};

const options = parseArgs(process.argv.slice(2));
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
const forbiddenTextRe = /\bPotential\b|potential option|AI as citation|ai-as-citation|copyright unclear|all rights reserved|Non-?Commercial|\bNC\b/i;
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

const licenseUrls = new Map([
  ['CC-BY-SA', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['CC-BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['CC BY-SA 4.0 / GFDL', 'https://en.wiktionary.org/wiki/Wiktionary:Copyrights'],
  ['CC BY-SA 4.0/GFDL', 'https://en.wiktionary.org/wiki/Wiktionary:Copyrights'],
  ['CC-BY', 'https://creativecommons.org/licenses/by/4.0/'],
  ['CC-BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
  ['CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
  ['CC0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
  ['Public Domain', 'https://creativecommons.org/publicdomain/mark/1.0/'],
  ['Public Domain Mark', 'https://creativecommons.org/publicdomain/mark/1.0/'],
  ['project-authored / CC0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
]);

const biblicalWorkIds = new Set([
  'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
  'joshua', 'judges', 'i-samuel', 'ii-samuel', 'i-kings', 'ii-kings',
  'isaiah', 'jeremiah', 'ezekiel', 'hosea', 'joel', 'amos', 'obadiah',
  'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai',
  'zechariah', 'malachi', 'psalms', 'proverbs', 'job', 'song-of-songs',
  'ruth', 'lamentations', 'ecclesiastes', 'esther', 'daniel', 'ezra',
  'nehemiah', 'i-chronicles', 'ii-chronicles',
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

function parseArgs(args) {
  const parsed = { ...defaults, claimFiles: [...defaults.claimFiles], sourceFiles: [] };
  for (const arg of args) {
    if (arg === '--include-biblical') parsed.includeBiblical = true;
    else if (arg === '--include-untracked') parsed.includeUntracked = true;
    else if (arg === '--include-morphology') parsed.includeMorphology = true;
    else if (arg === '--include-risky-morphology') parsed.includeRiskyMorphology = true;
    else if (arg === '--local-only') parsed.localOnly = true;
    else if (arg.startsWith('--source-file=')) parsed.sourceFiles.push(cleanRelativePath(arg.split('=').slice(1).join('=')));
    else if (arg.startsWith('--claim-file=')) parsed.claimFiles.push(cleanRelativePath(arg.split('=').slice(1).join('=')));
    else if (arg.startsWith('--morphology-rules=')) parsed.morphologyRules = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--jsonl=')) parsed.jsonl = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--jsonl-shard-max-bytes=')) parsed.jsonlShardMaxBytes = Number(arg.split('=')[1]);
    else if (arg.startsWith('--csv=')) parsed.csv = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--index=')) parsed.index = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--sample=')) parsed.sample = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--max-per-token=')) parsed.maxPerToken = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-total-rows=')) parsed.maxTotalRows = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-claims-per-normalized=')) parsed.maxClaimsPerNormalized = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-definitions-per-occurrence=')) parsed.maxDefinitionsPerOccurrence = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-source-files=')) parsed.maxSourceFiles = Number(arg.split('=')[1]);
    else if (arg.startsWith('--window=')) parsed.window = Number(arg.split('=')[1]);
    else if (arg.startsWith('--candidate-status=')) parsed.candidateStatus = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--morphology-candidate-status=')) parsed.morphologyCandidateStatus = arg.split('=').slice(1).join('=');
    else throw new Error(`Unknown argument: ${arg}`);
  }
  for (const key of ['maxPerToken', 'maxTotalRows', 'maxClaimsPerNormalized', 'maxDefinitionsPerOccurrence', 'maxSourceFiles', 'window', 'jsonlShardMaxBytes']) {
    if (!Number.isInteger(parsed[key]) || parsed[key] < 0) {
      throw new Error(`--${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)} must be a non-negative integer`);
    }
  }
  if (!['proposed', 'accepted', 'rejected'].includes(parsed.candidateStatus)) {
    throw new Error('--candidate-status must be proposed, accepted, or rejected');
  }
  if (!['proposed', 'accepted', 'rejected'].includes(parsed.morphologyCandidateStatus)) {
    throw new Error('--morphology-candidate-status must be proposed, accepted, or rejected');
  }
  if (parsed.localOnly && parsed.sample === defaults.sample) {
    parsed.sample = `${parsed.localDir}/source-citable-paraphrase-evidence-sample.json`;
  }
  parsed.claimFiles = [...new Set(parsed.claimFiles.map(cleanRelativePath))];
  return parsed;
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function mkdirp(relativePath) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
}

function createWriteErrorMessage(relativePath, error) {
  return `Failed writing ${relativePath}: ${error?.message || error}`;
}

function writeStreamChunk(stream, relativePath, chunk) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      stream.off('drain', onDrain);
      stream.off('error', onError);
    };
    const onDrain = () => {
      cleanup();
      resolve();
    };
    const onError = (error) => {
      cleanup();
      reject(new Error(createWriteErrorMessage(relativePath, error)));
    };
    stream.once('error', onError);
    const ready = stream.write(chunk, 'utf8');
    if (ready) {
      cleanup();
      resolve();
    } else {
      stream.once('drain', onDrain);
    }
  });
}

function endStream(stream, relativePath) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      stream.off('finish', onFinish);
      stream.off('error', onError);
    };
    const onFinish = () => {
      cleanup();
      resolve();
    };
    const onError = (error) => {
      cleanup();
      reject(new Error(createWriteErrorMessage(relativePath, error)));
    };
    stream.once('finish', onFinish);
    stream.once('error', onError);
    stream.end();
  });
}

class JsonlWriter {
  constructor(relativePath, shardMaxBytes) {
    this.relativePath = relativePath;
    this.shardMaxBytes = shardMaxBytes;
    this.sharded = shardMaxBytes > 0;
    this.rows = 0;
    this.bytes = 0;
    this.shards = [];
    this.currentStream = null;
    this.currentPath = '';
    this.currentBytes = 0;
    this.currentRows = 0;
    this.shardIndex = 0;
    this.shardDir = `${relativePath}.shards`;
    this.basename = path.basename(relativePath).replace(/\.jsonl$/i, '');
  }

  async write(line) {
    const bytes = Buffer.byteLength(line, 'utf8');
    if (!this.currentStream || (this.sharded && this.currentBytes > 0 && this.currentBytes + bytes > this.shardMaxBytes)) {
      await this.rotate();
    }
    await writeStreamChunk(this.currentStream, this.currentPath, line);
    this.currentBytes += bytes;
    this.currentRows += 1;
    this.bytes += bytes;
    this.rows += 1;
  }

  async rotate() {
    if (this.currentStream) await this.closeCurrent();
    if (this.sharded) {
      this.shardIndex += 1;
      const shardName = `${this.basename}.part-${String(this.shardIndex).padStart(6, '0')}.jsonl`;
      this.currentPath = path.posix.join(this.shardDir, shardName);
    } else {
      this.currentPath = this.relativePath;
    }
    mkdirp(this.currentPath);
    this.currentStream = fs.createWriteStream(path.join(root, this.currentPath), { encoding: 'utf8' });
    this.currentBytes = 0;
    this.currentRows = 0;
  }

  async closeCurrent() {
    await endStream(this.currentStream, this.currentPath);
    this.shards.push({
      path: this.currentPath,
      rows: this.currentRows,
      bytes: this.currentBytes,
    });
    this.currentStream = null;
  }

  async close() {
    if (this.currentStream) await this.closeCurrent();
    if (this.sharded) {
      writeJson(this.relativePath, {
        schema_version: 1,
        format: 'jsonl-shards',
        generated_at: generatedAt,
        rows: this.rows,
        bytes: this.bytes,
        shard_max_bytes: this.shardMaxBytes,
        shards: this.shards,
      });
    }
    return {
      path: this.relativePath,
      sharded: this.sharded,
      rows: this.rows,
      bytes: this.bytes,
      shards: this.shards.length,
    };
  }
}

function readJson(relativePath, required = true) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    if (required) throw new Error(`Missing required file: ${relativePath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(relativePath, data) {
  mkdirp(relativePath);
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function stableId(prefix, payload) {
  return `${prefix}-${crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex').slice(0, 16)}`;
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

function cleanDefinition(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
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

function isAllowedLicense(license) {
  if (!license || typeof license !== 'string') return false;
  if (forbiddenLicenseRe.test(license)) return false;
  return allowedSourceLicenses.has(license);
}

function safeSourceRows(rows) {
  return Array.isArray(rows)
    && rows.length
    && rows.every((row) => row?.source_name && row?.source_id && row?.source_url && isAllowedLicense(row?.license));
}

function compactSourceRow(row) {
  return {
    source_name: row?.source_name || '',
    source_family: row?.source_family || '',
    source_id: row?.source_id || '',
    source_url: row?.source_url || '',
    license: row?.license || '',
    license_url: row?.license_url || licenseUrls.get(row?.license || '') || '',
    fields_used: Array.isArray(row?.fields_used) ? row.fields_used : [],
    notes: row?.notes || '',
  };
}

function collectSourceFiles() {
  const dir = path.join(root, options.sourceDir);
  if (options.sourceFiles.length) {
    return options.sourceFiles.map(cleanRelativePath).filter((file) => {
      if (!file.startsWith(`${options.sourceDir}/`) || !file.endsWith('.json')) {
        throw new Error(`--source-file must point to a JSON file under ${options.sourceDir}: ${file}`);
      }
      if (!fs.existsSync(path.join(root, file))) throw new Error(`--source-file does not exist: ${file}`);
      return true;
    }).sort();
  }
  let files;
  if (options.includeUntracked) {
    files = fs.readdirSync(dir)
      .filter((name) => name.endsWith('.json'))
      .map((name) => path.join(options.sourceDir, name).replace(/\\/g, '/'));
  } else {
    try {
      const stdout = execFileSync('git', ['ls-files', '--', `${options.sourceDir}/*.json`], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      files = stdout.split(/\r?\n/).filter(Boolean);
    } catch (error) {
      throw new Error(`Unable to list tracked source files with git. Pass explicit --source-file paths or use --include-untracked deliberately. ${error.message}`);
    }
  }
  files = files.sort();
  return options.maxSourceFiles > 0 ? files.slice(0, options.maxSourceFiles) : files;
}

function flattenHebrew(value) {
  if (Array.isArray(value)) return value.map(flattenHebrew).filter(Boolean).join(' ');
  return cleanHebrewText(value);
}

function tokenize(text) {
  const tokens = [];
  for (const match of text.matchAll(tokenRe)) {
    const surface = match[0];
    const normalized = normalizeHebrew(surface);
    if (!normalized) continue;
    tokens.push({ surface, normalized });
  }
  return tokens;
}

function isBiblicalWork(data, relativePath) {
  if (options.includeBiblical) return false;
  const slug = String(data?.work_slug || '').toLowerCase();
  const workId = String(data?.work_id || path.basename(relativePath, '.json')).toLowerCase();
  return slug.startsWith('tanakh/') || biblicalWorkIds.has(workId);
}

async function readJsonl(relativePath, onRow) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return 0;
  const rl = readline.createInterface({
    input: fs.createReadStream(fullPath, 'utf8'),
    crlfDelay: Infinity,
  });
  let count = 0;
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    count += 1;
    onRow(JSON.parse(trimmed), count, relativePath);
  }
  return count;
}

function claimScore(claim) {
  return Number(claim?.answer_score ?? claim?.confidence ?? 0);
}

function claimDefinition(claim) {
  return cleanDefinition(claim?.gloss || (Array.isArray(claim?.meanings) ? claim.meanings.join('; ') : ''));
}

function shouldUseClaim(claim) {
  if (!claim?.normalized || !['lemma', 'form'].includes(claim?.route_type)) return false;
  if (claim.meaning_quality && claim.meaning_quality !== 'definition') return false;
  if (claim.answer_eligible === false) return false;
  const definition = claimDefinition(claim);
  if (!definition || forbiddenTextRe.test(definition)) return false;
  return safeSourceRows(claim.source_rows);
}

function addClaim(index, claim) {
  if (!shouldUseClaim(claim)) return false;
  const normalized = normalizeHebrew(claim.normalized);
  if (!normalized) return false;
  const compact = {
    claim_id: claim.claim_id,
    route_family: claim.route_family || '',
    route_type: claim.route_type || '',
    language: claim.language || 'Hebrew',
    surface: claim.surface || '',
    normalized,
    match_type: claim.match_type || claim.route_type || 'definition route',
    confidence: Number.isFinite(claim.confidence) ? claim.confidence : null,
    answer_score: Number.isFinite(claim.answer_score) ? claim.answer_score : null,
    context_rank_score: Number.isFinite(claim.context_rank_score) ? claim.context_rank_score : null,
    meaning_quality: claim.meaning_quality || 'definition',
    part_of_speech: claim.part_of_speech || '',
    definition: claimDefinition(claim),
    source_rows: (claim.source_rows || []).map(compactSourceRow),
  };
  if (!index.has(normalized)) index.set(normalized, []);
  const bucket = index.get(normalized);
  bucket.push(compact);
  bucket.sort((a, b) => claimScore(b) - claimScore(a) || String(a.claim_id).localeCompare(String(b.claim_id)));
  if (bucket.length > options.maxClaimsPerNormalized) bucket.length = options.maxClaimsPerNormalized;
  return true;
}

async function loadClaimIndex() {
  const index = new Map();
  const stats = {
    claim_files_read: 0,
    claims_read: 0,
    claims_indexed: 0,
    distinct_normalized_claims: 0,
  };
  for (const file of options.claimFiles) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) continue;
    stats.claim_files_read += 1;
    stats.claims_read += await readJsonl(file, (claim) => {
      if (addClaim(index, claim)) stats.claims_indexed += 1;
    });
  }
  stats.distinct_normalized_claims = index.size;
  return { index, stats };
}

function morphologySourceRow(layer, rule) {
  return compactSourceRow({
    source_name: layer.source_name || 'Project-authored conservative morphology rules',
    source_family: layer.source_family || 'workspace',
    source_id: `${layer.layer_id || 'project-morphology-rules'}:${rule.rule_id || rule.normalized || rule.hebrew}`,
    source_url: `local:${layer.layer_id || 'project-morphology-rules'}`,
    license: layer.license || 'project-authored / CC0',
    license_url: layer.license_url || licenseUrls.get('project-authored / CC0') || '',
    fields_used: ['rule_id', 'kind', 'normalized', 'meanings'],
    notes: 'Project-authored morphology rule. Grammar metadata only; no external definition text imported.',
  });
}

function loadMorphologyRules() {
  if (!options.includeMorphology) return null;
  const layer = readJson(options.morphologyRules);
  const prefixRules = [];
  const suffixRules = [];
  for (const rule of Array.isArray(layer.rules) ? layer.rules : []) {
    if (!rule.safe_default) continue;
    if (!['prefix', 'suffix'].includes(rule.route_role)) continue;
    const normalized = normalizeHebrew(rule.normalized || rule.hebrew || '');
    if (!normalized) continue;
    const compact = {
      rule_id: rule.rule_id || stableId('morph-rule', [rule.kind, rule.hebrew, normalized]),
      kind: rule.kind,
      language: rule.language || 'Hebrew/Aramaic',
      surface: rule.hebrew || normalized,
      normalized,
      meanings: Array.isArray(rule.meanings) ? rule.meanings.map(cleanDefinition).filter(Boolean) : [],
      confidence: Number.isFinite(rule.confidence) ? rule.confidence : 80,
      source_rows: [morphologySourceRow(layer, rule)],
    };
    if (!compact.meanings.length || !safeSourceRows(compact.source_rows)) continue;
    if (rule.route_role === 'prefix') prefixRules.push(compact);
    if (rule.route_role === 'suffix') suffixRules.push(compact);
  }
  suffixRules.sort((a, b) => b.normalized.length - a.normalized.length);
  return { prefixRules, suffixRules };
}

function enumeratePrefixSplits(normalizedToken, prefixRules, maxDepth = 3) {
  const results = [{ prefixes: [], rest: normalizedToken }];
  function visit(rest, prefixes) {
    if (prefixes.length >= maxDepth) return;
    for (const rule of prefixRules) {
      if (!rest.startsWith(rule.normalized) || rest.length <= rule.normalized.length + 1) continue;
      const next = rest.slice(rule.normalized.length);
      const nextPrefixes = [...prefixes, rule];
      results.push({ prefixes: nextPrefixes, rest: next });
      visit(next, nextPrefixes);
    }
  }
  visit(normalizedToken, []);
  return results;
}

function suffixSplits(rest, suffixRules) {
  const splits = [{ suffix: null, base: rest }];
  for (const rule of suffixRules) {
    if (rest.endsWith(rule.normalized) && rest.length > rule.normalized.length + 1) {
      splits.push({ suffix: rule, base: rest.slice(0, -rule.normalized.length) });
    }
  }
  return splits;
}

function morphologyBaseClaim(base, claimIndex) {
  return (claimIndex.get(base) || []).find((claim) => claim.route_family !== 'wiktionary_definition') || null;
}

function claimRoleParts(claim, role) {
  return Array.isArray(claim?.morphology_breakdown)
    ? claim.morphology_breakdown.filter((part) => part?.role === role)
    : [];
}

function claimMeaningsText(part) {
  return Array.isArray(part?.meanings) ? part.meanings.join('; ') : '';
}

function hasDuplicatePrefix(prefixes) {
  const seen = new Set();
  for (const prefix of prefixes) {
    const key = prefix.normalized || prefix.surface || '';
    if (!key) continue;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

function morphologyRiskFlags(claim) {
  const risks = [];
  const prefixes = claimRoleParts(claim, 'prefix');
  const main = claimRoleParts(claim, 'main word')[0];
  const endings = claimRoleParts(claim, 'ending');
  const mainText = claimMeaningsText(main);
  if (!Array.isArray(claim?.morphology_breakdown) || !claim.morphology_breakdown.length) risks.push('missing_breakdown');
  if (prefixes.length > 1) risks.push('stacked_prefixes');
  if (hasDuplicatePrefix(prefixes)) risks.push('duplicate_prefix');
  if (endings.length && String(main?.normalized || '').length <= 2) risks.push('short_base_with_suffix');
  if (prefixes.length && /direct-object marker|object marker/i.test(mainText)) risks.push('object_marker_base_with_prefix');
  if (/\b[A-Z][a-z]+,\s*(biblical|place|person|name|gem|king|town|city)\b/.test(mainText) || /;\s*[A-Z][a-z]+(?:$|;)/.test(mainText)) {
    risks.push('proper_name_like_base');
  }
  if (/\(;|;\s*(he|it|shall|are \(|any other form)\b/i.test(mainText) || /\([^)]*$/.test(mainText)) {
    risks.push('fragmentary_base_gloss');
  }
  if (String(claim.definition || '').length > 180) risks.push('long_combined_definition');
  return risks;
}

function makeMorphologyClaim(token, claimIndex, morphology) {
  if (!morphology) return null;
  const normalizedToken = token.normalized;
  if (!normalizedToken || claimIndex.has(normalizedToken)) return null;
  const candidates = [];
  for (const split of enumeratePrefixSplits(normalizedToken, morphology.prefixRules)) {
    for (const option of suffixSplits(split.rest, morphology.suffixRules)) {
      const { suffix, base } = option;
      if (!split.prefixes.length && !suffix) continue;
      if (!base || base.length < 2) continue;
      const baseClaim = morphologyBaseClaim(base, claimIndex);
      if (!baseClaim?.definition) continue;
      const morphologyConfidence = Math.min(
        ...[
          ...split.prefixes.map((rule) => rule.confidence),
          ...(suffix ? [suffix.confidence] : []),
        ],
      );
      const baseScore = claimScore(baseClaim);
      const rawScore = Math.max(55, Math.min(96, Math.round((baseScore * 0.72) + (morphologyConfidence * 0.28) - (split.prefixes.length * 2) - (suffix ? 2 : 0))));
      candidates.push({
        prefixes: split.prefixes,
        suffix,
        base,
        baseClaim,
        rawScore,
        score: rawScore + base.length - (split.prefixes.length * 2),
      });
    }
  }
  candidates.sort((a, b) => b.score - a.score || b.base.length - a.base.length);
  const selected = candidates[0];
  if (!selected) return null;
  const prefixMeanings = selected.prefixes.flatMap((rule) => rule.meanings.slice(0, 1));
  const suffixMeanings = selected.suffix?.meanings || [];
  const meanings = [...prefixMeanings, selected.baseClaim.definition, ...suffixMeanings];
  return {
    claim_id: stableId('def-citable-morphology', [
      normalizedToken,
      selected.prefixes.map((rule) => rule.rule_id),
      selected.baseClaim.claim_id,
      selected.suffix?.rule_id || '',
    ]),
    route_family: 'project_morphology',
    route_type: 'morphology_parse',
    language: selected.prefixes.some((rule) => rule.language === 'Aramaic') || selected.suffix?.language === 'Aramaic' ? 'Aramaic/Hebrew' : 'Hebrew',
    surface: token.surface,
    normalized: normalizedToken,
    match_type: selected.prefixes.length && selected.suffix ? 'prefix_base_suffix' : selected.prefixes.length ? 'prefix_base' : 'base_suffix',
    confidence: selected.rawScore,
    answer_score: selected.rawScore,
    candidate_status: options.morphologyCandidateStatus,
    meaning_quality: 'definition',
    part_of_speech: selected.baseClaim.part_of_speech || '',
    definition: meanings.join(' + '),
    morphology_breakdown: [
      ...selected.prefixes.map((rule) => ({
        role: 'prefix',
        surface: rule.surface,
        normalized: rule.normalized,
        meanings: rule.meanings,
      })),
      {
        role: 'main word',
        surface: selected.baseClaim.surface,
        normalized: selected.base,
        meanings: [selected.baseClaim.definition],
      },
      ...(selected.suffix ? [{
        role: 'ending',
        surface: selected.suffix.surface,
        normalized: selected.suffix.normalized,
        meanings: selected.suffix.meanings,
      }] : []),
    ],
    source_rows: [
      ...selected.prefixes.flatMap((rule) => rule.source_rows),
      ...selected.baseClaim.source_rows,
      ...(selected.suffix?.source_rows || []),
    ],
  };
}

function makeSourceRow(data, unit, relativePath, license) {
  return {
    source_name: unit.version_title || data.work_title || path.basename(relativePath, '.json'),
    source_family: 'hebrew_source_text',
    source_id: stableId('source-version', [
      data.work_id || unit.work_id || path.basename(relativePath, '.json'),
      unit.version_title || '',
      unit.version_source || '',
      license,
    ]),
    source_url: unit.source_url || data.source_base_url || unit.version_source || '',
    license,
    license_url: licenseUrls.get(license) || '',
    fields_used: ['hebrew', 'source_ref', 'version_title', 'version_source', 'license'],
    notes: 'Hebrew usage evidence only. No English source-text translation is imported from this row.',
  };
}

function phraseFor(tokens, tokenIndex) {
  const start = Math.max(0, tokenIndex - options.window);
  const end = Math.min(tokens.length, tokenIndex + options.window + 1);
  return tokens.slice(start, end).map((token, index) => ({
    surface: token.surface,
    normalized: token.normalized,
    role: start + index === tokenIndex ? 'focus-token' : 'context',
  }));
}

function rawScoreForClaim(claim) {
  const definitionScore = Number(claim.answer_score ?? claim.confidence ?? 80);
  return Math.max(0, Math.min(100, Math.round((definitionScore * 0.85) + 15)));
}

function makeEvidenceRow({ claim, data, unit, relativePath, tokens, tokenIndex, license }) {
  const token = tokens[tokenIndex];
  const phraseTokens = phraseFor(tokens, tokenIndex);
  const rawScore = rawScoreForClaim(claim);
  const scoreHandicap = 20;
  return {
    evidence_id: stableId('citable-para', [
      claim.claim_id,
      data.work_id || unit.work_id || relativePath,
      unit.unit_id || unit.source_ref || unit.sefaria_ref || '',
      tokenIndex,
      token.normalized,
      options.window,
    ]),
    route_type: 'citable_paraphrase_evidence',
    route_family: 'citable_paraphrase_evidence',
    candidate_status: claim.candidate_status || options.candidateStatus,
    focus_surface: token.surface,
    focus_normalized: token.normalized,
    definition: claim.definition,
    raw_score: rawScore,
    score_handicap: scoreHandicap,
    adjusted_score: rawScore - scoreHandicap,
    match_type: `${claim.route_type} definition plus licensed workbench usage`,
    language: claim.language || 'Hebrew',
    source_definition_claim_id: claim.claim_id,
    source_definition_route_family: claim.route_family,
    source_definition_route_type: claim.route_type,
    morphology_breakdown: claim.morphology_breakdown,
    morphology_risk_flags: claim.morphology_risk_flags,
    phrase_hebrew: phraseTokens.map((phraseToken) => phraseToken.surface).join(' '),
    phrase_tokens: phraseTokens,
    source_ref: unit.source_ref || unit.sefaria_ref || '',
    sefaria_ref: unit.sefaria_ref || '',
    work_id: data.work_id || unit.work_id || '',
    work_title: data.work_title || unit.work_title || '',
    unit_id: unit.unit_id || '',
    source_rows: [
      ...claim.source_rows,
      makeSourceRow(data, unit, relativePath, license),
    ],
  };
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function csvHeaderLine() {
  return [
    'evidence_id',
    'candidate_status',
    'focus_surface',
    'focus_normalized',
    'definition',
    'raw_score',
    'adjusted_score',
    'source_definition_claim_id',
    'phrase_hebrew',
    'source_ref',
    'work_id',
    'work_title',
  ].join(',') + '\n';
}

function csvRowLine(row) {
  return [
    row.evidence_id,
    row.candidate_status,
    row.focus_surface,
    row.focus_normalized,
    row.definition,
    row.raw_score,
    row.adjusted_score,
    row.source_definition_claim_id,
    row.phrase_hebrew,
    row.source_ref,
    row.work_id,
    row.work_title,
  ].map(csvEscape).join(',') + '\n';
}

function shouldEmit(normalized, emittedByToken, totalRows) {
  if (options.maxTotalRows > 0 && totalRows >= options.maxTotalRows) return false;
  if (options.maxPerToken === 0) return true;
  return (emittedByToken.get(normalized) || 0) < options.maxPerToken;
}

function count(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function sortedObject(map) {
  return Object.fromEntries([...map.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  }));
}

function maybeCollectSample(row, samples, sampleWorkCounts) {
  if (samples.length >= 120) return;
  const workId = row.work_id || '(missing)';
  if ((sampleWorkCounts.get(workId) || 0) >= 20) return;
  sampleWorkCounts.set(workId, (sampleWorkCounts.get(workId) || 0) + 1);
  samples.push(row);
}

function patchManifest(stats) {
  const manifest = readJson(options.manifest, false);
  if (!manifest) return;
  manifest.citable_paraphrase_evidence = {
    generated_at: generatedAt,
    source_policy: 'Citable paraphrase rows join an accepted lexical definition row to a licensed non-biblical Hebrew usage row. Biblical-definition rows are produced by a separate lane.',
    include_biblical: options.includeBiblical,
    include_morphology: options.includeMorphology,
    include_risky_morphology: options.includeRiskyMorphology,
    candidate_status: options.candidateStatus,
    morphology_candidate_status: options.morphologyCandidateStatus,
    max_per_token: options.maxPerToken,
    max_total_rows: options.maxTotalRows,
    counts: stats,
  };
  manifest.local_cache = manifest.local_cache || { directory: options.localDir, files: [] };
  manifest.local_cache.directory = options.localDir;
  for (const file of [
    path.basename(options.jsonl),
    path.basename(options.csv),
    path.basename(options.index),
  ]) {
    if (!manifest.local_cache.files.includes(file)) manifest.local_cache.files.push(file);
  }
  manifest.public_artifacts = manifest.public_artifacts || [];
  if (!manifest.public_artifacts.includes(options.sample)) manifest.public_artifacts.push(options.sample);
  writeJson(options.manifest, manifest);
}

function patchReport(stats) {
  const fullPath = path.join(root, options.report);
  if (!fs.existsSync(fullPath)) return;
  let report = fs.readFileSync(fullPath, 'utf8');
  report = report.replace(/\n## Citable Paraphrase Evidence[\s\S]*?(?=\n## |\s*$)/, '').trimEnd();
  const section = [
    '',
    '',
    '## Citable Paraphrase Evidence',
    '',
    `- Generated: ${generatedAt}`,
    `- Source files scanned: ${stats.source_files_scanned}`,
    `- Biblical source files skipped: ${stats.biblical_source_files_skipped}`,
    `- Allowed source units scanned: ${stats.allowed_units}`,
    `- Rejected source units skipped: ${stats.rejected_units}`,
    `- Definition claims read: ${stats.claims_read}`,
    `- Definition claims indexed: ${stats.claims_indexed}`,
    `- Citable rows emitted: ${stats.evidence_rows}`,
    `- Morphology-derived citable rows emitted: ${stats.morphology_evidence_rows || 0}`,
    `- Risk-flagged morphology rows skipped: ${stats.skipped_risky_morphology_rows || 0}`,
    `- Candidate status: ${options.candidateStatus}`,
    `- Morphology candidate status: ${options.morphologyCandidateStatus}`,
    `- Morphology parsing enabled: ${options.includeMorphology ? 'yes' : 'no'}`,
    `- Max rows per normalized token: ${options.maxPerToken === 0 ? 'unlimited' : options.maxPerToken}`,
    `- Public sample: ${options.sample}`,
    `- Local cache: ${options.jsonl}`,
    '- Lane rule: citable importers produce source-backed rows and scores only; final HUD/ranking owns winner selection and rendering.',
    '',
  ].join('\n');
  fs.writeFileSync(fullPath, `${report}${section}`, 'utf8');
}

async function main() {
  mkdirp(options.jsonl);
  mkdirp(options.csv);
  mkdirp(options.index);
  mkdirp(options.sample);

  const { index: claimIndex, stats: claimStats } = await loadClaimIndex();
  const morphology = loadMorphologyRules();
  const sourceFiles = collectSourceFiles();
  const jsonl = new JsonlWriter(options.jsonl, options.jsonlShardMaxBytes);
  const csv = fs.createWriteStream(path.join(root, options.csv), { encoding: 'utf8' });
  await writeStreamChunk(csv, options.csv, csvHeaderLine());

  const emittedByToken = new Map();
  const tokenTotals = new Map();
  const acceptedLicenseCounts = new Map();
  const rejectedLicenseCounts = new Map();
  const sampleWorkCounts = new Map();
  const samples = [];
  const stats = {
    ...claimStats,
    source_files_scanned: 0,
    biblical_source_files_skipped: 0,
    allowed_units: 0,
    rejected_units: 0,
    token_occurrences: 0,
    evidence_rows: 0,
    morphology_evidence_rows: 0,
    risky_morphology_rows: 0,
    skipped_risky_morphology_rows: 0,
    distinct_normalized_tokens_seen: 0,
    distinct_normalized_tokens_emitted: 0,
  };

  for (const relativePath of sourceFiles) {
    if (options.maxTotalRows > 0 && stats.evidence_rows >= options.maxTotalRows) break;
    const data = readJson(relativePath);
    stats.source_files_scanned += 1;
    if (isBiblicalWork(data, relativePath)) {
      stats.biblical_source_files_skipped += 1;
      continue;
    }
    for (const unit of Array.isArray(data.units) ? data.units : []) {
      if (options.maxTotalRows > 0 && stats.evidence_rows >= options.maxTotalRows) break;
      const license = unit.license || data.license || '';
      if (!isAllowedLicense(license)) {
        stats.rejected_units += 1;
        count(rejectedLicenseCounts, license || '(missing)');
        continue;
      }
      const text = flattenHebrew(unit.hebrew);
      if (!text) continue;
      const tokens = tokenize(text);
      if (!tokens.length) continue;
      stats.allowed_units += 1;
      count(acceptedLicenseCounts, license);
      for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex += 1) {
        if (options.maxTotalRows > 0 && stats.evidence_rows >= options.maxTotalRows) break;
        const token = tokens[tokenIndex];
        stats.token_occurrences += 1;
        count(tokenTotals, token.normalized);
        let claims = (claimIndex.get(token.normalized) || []).slice(0, options.maxDefinitionsPerOccurrence);
        if (!claims.length && options.includeMorphology) {
          const morphologyClaim = makeMorphologyClaim(token, claimIndex, morphology);
          if (morphologyClaim) {
            const riskFlags = morphologyRiskFlags(morphologyClaim);
            morphologyClaim.morphology_risk_flags = riskFlags;
            if (riskFlags.length) {
              stats.risky_morphology_rows += 1;
              if (!options.includeRiskyMorphology) {
                stats.skipped_risky_morphology_rows += 1;
                continue;
              }
            }
            claims = [morphologyClaim];
          }
        }
        if (!claims.length || !shouldEmit(token.normalized, emittedByToken, stats.evidence_rows)) continue;
        for (const claim of claims) {
          if (!shouldEmit(token.normalized, emittedByToken, stats.evidence_rows)) break;
          const row = makeEvidenceRow({ claim, data, unit, relativePath, tokens, tokenIndex, license });
          await jsonl.write(`${JSON.stringify(row)}\n`);
          await writeStreamChunk(csv, options.csv, csvRowLine(row));
          count(emittedByToken, token.normalized);
          maybeCollectSample(row, samples, sampleWorkCounts);
          stats.evidence_rows += 1;
          if (claim.route_family === 'project_morphology') stats.morphology_evidence_rows += 1;
        }
      }
    }
  }

  const jsonlInfo = await jsonl.close();
  await endStream(csv, options.csv);

  stats.distinct_normalized_tokens_seen = tokenTotals.size;
  stats.distinct_normalized_tokens_emitted = emittedByToken.size;
  stats.accepted_license_counts = sortedObject(acceptedLicenseCounts);
  stats.rejected_license_counts = sortedObject(rejectedLicenseCounts);

  writeJson(options.index, {
    schema_version: 1,
    generated_at: generatedAt,
    include_biblical: options.includeBiblical,
    include_morphology: options.includeMorphology,
    include_risky_morphology: options.includeRiskyMorphology,
    max_per_token: options.maxPerToken,
    max_total_rows: options.maxTotalRows,
    distinct_normalized_tokens_seen: tokenTotals.size,
    distinct_normalized_tokens_emitted: emittedByToken.size,
    top_emitted_tokens: [...emittedByToken.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 1000)
      .map(([normalized, emitted_occurrences]) => ({
        normalized,
        emitted_occurrences,
        total_occurrences: tokenTotals.get(normalized) || 0,
      })),
  });
  writeJson(options.sample, {
    schema_version: 1,
    generated_at: generatedAt,
    route_policy: 'Citable rows join an accepted lexical definition row to licensed non-biblical Hebrew usage evidence. They do not import English source-text translations.',
    candidate_status: options.candidateStatus,
    morphology_candidate_status: options.morphologyCandidateStatus,
    include_biblical: options.includeBiblical,
    include_morphology: options.includeMorphology,
    include_risky_morphology: options.includeRiskyMorphology,
    samples,
  });
  if (!options.localOnly) {
    patchManifest(stats);
    patchReport(stats);
  }

  console.log(JSON.stringify({
    generated_at: generatedAt,
    local_only: options.localOnly,
    counts: stats,
    local_cache: options.localDir,
    jsonl: options.jsonl,
    jsonl_info: jsonlInfo,
    sample: options.sample,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

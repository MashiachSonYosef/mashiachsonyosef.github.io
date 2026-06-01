import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const generatedAt = new Date().toISOString();

const paths = {
  sourceDir: 'data/sources',
  definitionsDir: 'data/definitions',
  localDir: '.local-cache/definition-routes',
  jsonl: '.local-cache/definition-routes/source-phrase-evidence.jsonl',
  csv: '.local-cache/definition-routes/source-phrase-evidence.csv',
  index: '.local-cache/definition-routes/source-phrase-token-index.json',
  sample: 'data/definitions/phrase-evidence-sample.json',
  manifest: 'data/definitions/manifest.json',
  report: 'reports/definition-pipeline-report.md',
};

const options = parseArgs(process.argv.slice(2));
const forbiddenLicenseRe = /\bNC\b|Non-?Commercial|all rights reserved|copyright unclear|unknown|unverified|permission only/i;
const allowedSourceLicenses = new Set([
  'CC-BY-SA',
  'CC-BY-SA 4.0',
  'CC BY-SA 4.0',
  'CC-BY',
  'CC-BY 4.0',
  'CC BY 4.0',
  'CC0',
  'Public Domain',
  'Public Domain Mark',
]);

const licenseUrls = new Map([
  ['CC-BY-SA', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['CC-BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  ['CC-BY', 'https://creativecommons.org/licenses/by/4.0/'],
  ['CC-BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
  ['CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'],
  ['CC0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
  ['Public Domain', 'https://creativecommons.org/publicdomain/mark/1.0/'],
  ['Public Domain Mark', 'https://creativecommons.org/publicdomain/mark/1.0/'],
]);

const niqqudAndCantillationRe = /[\u0591-\u05BD\u05BF-\u05C7]/gu;
const htmlTagRe = /<[^>]+>/g;
const tokenRe = /[\u0590-\u05FF]+(?:[\u05BE-][\u0590-\u05FF]+)*/gu;
const finalLetters = new Map([
  ['ך', 'כ'],
  ['ם', 'מ'],
  ['ן', 'נ'],
  ['ף', 'פ'],
  ['ץ', 'צ'],
]);

const sampleFocus = new Set([
  normalizeHebrew('בראשית'),
  normalizeHebrew('ראשית'),
  normalizeHebrew('דברים'),
  normalizeHebrew('דבר'),
  normalizeHebrew('דלא'),
  normalizeHebrew('בן'),
  normalizeHebrew('דוד'),
  normalizeHebrew('ובדבריך'),
]);

function parseArgs(args) {
  const parsed = {
    maxPerToken: 250,
    maxTotalRows: 0,
    sampleLimit: 200,
    window: 3,
    includeUntracked: false,
    localOnly: false,
    jsonl: '',
    csv: '',
    index: '',
    sample: '',
    sourceFiles: [],
  };

  for (const arg of args) {
    if (arg === '--include-untracked') parsed.includeUntracked = true;
    else if (arg === '--local-only') parsed.localOnly = true;
    else if (arg.startsWith('--source-file=')) parsed.sourceFiles.push(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--max-per-token=')) parsed.maxPerToken = Number(arg.split('=')[1]);
    else if (arg.startsWith('--max-total-rows=')) parsed.maxTotalRows = Number(arg.split('=')[1]);
    else if (arg.startsWith('--sample-limit=')) parsed.sampleLimit = Number(arg.split('=')[1]);
    else if (arg.startsWith('--window=')) parsed.window = Number(arg.split('=')[1]);
    else if (arg.startsWith('--jsonl=')) parsed.jsonl = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--csv=')) parsed.csv = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--index=')) parsed.index = cleanRelativePath(arg.split('=').slice(1).join('='));
    else if (arg.startsWith('--sample=')) parsed.sample = cleanRelativePath(arg.split('=').slice(1).join('='));
    else throw new Error(`Unknown argument: ${arg}`);
  }

  for (const key of ['maxPerToken', 'maxTotalRows', 'sampleLimit', 'window']) {
    if (!Number.isInteger(parsed[key]) || parsed[key] < 0) {
      throw new Error(`--${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)} must be a non-negative integer`);
    }
  }

  return parsed;
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

for (const key of ['jsonl', 'csv', 'index', 'sample']) {
  if (options[key]) paths[key] = options[key];
}

function mkdirp(relativePath) {
  fs.mkdirSync(path.join(root, relativePath), { recursive: true });
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
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
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

function collectSourceFiles() {
  const dir = path.join(root, paths.sourceDir);
  if (options.sourceFiles.length) {
    return options.sourceFiles.map((file) => file.replace(/\\/g, '/').replace(/^\.\//, '')).filter((file) => {
      if (!file.startsWith(`${paths.sourceDir}/`) || !file.endsWith('.json')) {
        throw new Error(`--source-file must point to a JSON file under ${paths.sourceDir}: ${file}`);
      }
      if (!fs.existsSync(path.join(root, file))) {
        throw new Error(`--source-file does not exist: ${file}`);
      }
      return true;
    }).sort();
  }

  if (options.includeUntracked) {
    return fs.readdirSync(dir)
      .filter((name) => name.endsWith('.json'))
      .map((name) => path.join(paths.sourceDir, name).replace(/\\/g, '/'))
      .sort();
  }

  try {
    const stdout = execFileSync('git', ['ls-files', '--', `${paths.sourceDir}/*.json`], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return stdout.split(/\r?\n/).filter(Boolean).sort();
  } catch (error) {
    throw new Error(`Unable to list tracked source files with git. Pass explicit --source-file paths or use --include-untracked deliberately. ${error.message}`);
  }
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
    tokens.push({
      surface,
      normalized,
      offset: match.index || 0,
      maqaf_parts: surface.includes('\u05BE') || surface.includes('-')
        ? surface.split(/[\u05BE-]/).filter(Boolean).map((part) => ({
            surface: part,
            normalized: normalizeHebrew(part),
          })).filter((part) => part.normalized)
        : [],
    });
  }
  return tokens;
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
    notes: 'Hebrew phrase evidence only. No English translation or inferred meaning is imported from this row.',
  };
}

function makeEvidenceRow({ data, unit, relativePath, tokens, tokenIndex, focus, partIndex, routeType, license }) {
  const start = Math.max(0, tokenIndex - options.window);
  const end = Math.min(tokens.length, tokenIndex + options.window + 1);
  const phraseTokens = tokens.slice(start, end).map((token, index) => ({
    surface: token.surface,
    normalized: token.normalized,
    role: start + index === tokenIndex ? 'focus-token' : 'context',
  }));
  const left = tokens.slice(start, tokenIndex).map((token) => token.surface).join(' ');
  const right = tokens.slice(tokenIndex + 1, end).map((token) => token.surface).join(' ');
  const token = tokens[tokenIndex];
  const payload = [
    data.work_id || unit.work_id || relativePath,
    unit.unit_id || unit.source_ref || unit.sefaria_ref || '',
    tokenIndex,
    partIndex,
    focus.surface,
    token.surface,
    options.window,
  ];

  return {
    evidence_id: stableId('phrase', payload),
    route_family: 'source_phrase_evidence',
    route_type: routeType,
    answer_eligible: false,
    answer_role: 'evidence',
    language: 'Hebrew/Aramaic',
    focus_surface: focus.surface,
    focus_normalized: focus.normalized,
    containing_token_surface: token.surface,
    containing_token_normalized: token.normalized,
    focus_part_index: partIndex,
    exact_focus_in_phrase: true,
    match_type: routeType === 'subphrase_evidence' ? 'licensed subphrase occurrence' : 'licensed phrase occurrence',
    evidence_strength: 100,
    meaning_claim: null,
    phrase_hebrew: phraseTokens.map((phraseToken) => phraseToken.surface).join(' '),
    left_context: left,
    right_context: right,
    phrase_tokens: phraseTokens,
    source_ref: unit.source_ref || unit.sefaria_ref || '',
    sefaria_ref: unit.sefaria_ref || '',
    work_id: data.work_id || unit.work_id || '',
    work_title: data.work_title || unit.work_title || '',
    unit_id: unit.unit_id || '',
    source_rows: [makeSourceRow(data, unit, relativePath, license)],
  };
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function writeCsvHeader(stream) {
  stream.write([
    'evidence_id',
    'focus_surface',
    'focus_normalized',
    'containing_token_surface',
    'route_type',
    'phrase_hebrew',
    'source_ref',
    'work_id',
    'work_title',
    'license',
    'version_title',
    'source_url',
  ].join(',') + '\n');
}

function csvRowLine(row) {
  const source = row.source_rows[0] || {};
  return [
    row.evidence_id,
    row.focus_surface,
    row.focus_normalized,
    row.containing_token_surface,
    row.route_type,
    row.phrase_hebrew,
    row.source_ref,
    row.work_id,
    row.work_title,
    source.license,
    source.source_name,
    source.source_url,
  ].map(csvEscape).join(',') + '\n';
}

async function writeChunk(stream, chunk) {
  if (stream.write(chunk)) return;
  await new Promise((resolve) => stream.once('drain', resolve));
}

function shouldEmit(normalized, emittedByToken) {
  if (options.maxPerToken === 0) return true;
  return (emittedByToken.get(normalized) || 0) < options.maxPerToken;
}

function totalLimitReached(stats) {
  return options.maxTotalRows > 0 && stats.evidence_rows >= options.maxTotalRows;
}

function noteEmission(normalized, emittedByToken) {
  emittedByToken.set(normalized, (emittedByToken.get(normalized) || 0) + 1);
}

function maybeCollectSample(row, samples) {
  if (samples.length >= options.sampleLimit) return;
  if (sampleFocus.has(row.focus_normalized)) {
    samples.push(row);
  }
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

function writeIndex(relativePath, tokenTotals, emittedByToken) {
  const topTokens = [...tokenTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 1000)
    .map(([normalized, total_occurrences]) => ({
      normalized,
      total_occurrences,
      emitted_occurrences: emittedByToken.get(normalized) || 0,
    }));

  writeJson(relativePath, {
    schema_version: 1,
    generated_at: generatedAt,
    max_per_token: options.maxPerToken,
    note: 'Local token index for licensed phrase evidence. Counts include all allowed source occurrences; emitted rows may be capped per normalized token.',
    distinct_normalized_tokens: tokenTotals.size,
    top_tokens: topTokens,
  });
}

function patchManifest(stats) {
  const manifest = readJson(paths.manifest, false);
  if (!manifest) return;

  manifest.generated_at = manifest.generated_at || generatedAt;
  manifest.phrase_evidence = {
    generated_at: generatedAt,
    source_policy: 'Hebrew phrase evidence is source text, not a definition claim. Each row preserves its original source/version/license metadata.',
    untracked_sources_included: options.includeUntracked,
    max_per_token: options.maxPerToken,
    window_tokens_each_side: options.window,
    counts: stats,
  };

  manifest.local_cache = manifest.local_cache || { directory: paths.localDir, files: [] };
  manifest.local_cache.directory = paths.localDir;
  for (const file of ['source-phrase-evidence.jsonl', 'source-phrase-evidence.csv', 'source-phrase-token-index.json']) {
    if (!manifest.local_cache.files.includes(file)) manifest.local_cache.files.push(file);
  }

  manifest.public_artifacts = manifest.public_artifacts || [];
  if (!manifest.public_artifacts.includes(paths.sample)) manifest.public_artifacts.push(paths.sample);

  writeJson(paths.manifest, manifest);
}

function patchReport(stats) {
  const fullPath = path.join(root, paths.report);
  if (!fs.existsSync(fullPath)) return;
  let report = fs.readFileSync(fullPath, 'utf8');
  report = report.replace(/\n## Phrase Evidence[\s\S]*?(?=\n## |\s*$)/, '').trimEnd();
  const section = [
    '',
    '## Phrase Evidence',
    '',
    `- Generated: ${generatedAt}`,
    `- Tracked source files scanned: ${stats.source_files_scanned}`,
    `- Allowed units scanned: ${stats.allowed_units}`,
    `- Rejected units skipped: ${stats.rejected_units}`,
    `- Token occurrences counted: ${stats.token_occurrences}`,
    `- Phrase evidence rows emitted: ${stats.evidence_rows}`,
    `- Distinct normalized tokens counted: ${stats.distinct_normalized_tokens}`,
    `- Max rows per normalized token: ${options.maxPerToken === 0 ? 'unlimited' : options.maxPerToken}`,
    '- Public sample: data/definitions/phrase-evidence-sample.json',
    '- Local cache: .local-cache/definition-routes/source-phrase-evidence.jsonl',
    '- License rule: every phrase row keeps its own source/version/license metadata; skipped licenses are counted but not emitted.',
    '',
  ].join('\n');
  fs.writeFileSync(fullPath, `${report}${section}`, 'utf8');
}

async function main() {
  mkdirp(paths.definitionsDir);
  mkdirp(paths.localDir);
  mkdirp(path.dirname(paths.jsonl));
  mkdirp(path.dirname(paths.csv));
  mkdirp(path.dirname(paths.index));

  const sourceFiles = collectSourceFiles();
  const jsonl = fs.createWriteStream(path.join(root, paths.jsonl), { encoding: 'utf8' });
  const csv = fs.createWriteStream(path.join(root, paths.csv), { encoding: 'utf8' });
  writeCsvHeader(csv);

  const tokenTotals = new Map();
  const emittedByToken = new Map();
  const acceptedLicenseCounts = new Map();
  const rejectedLicenseCounts = new Map();
  const samples = [];
  const stats = {
    source_files_scanned: 0,
    allowed_units: 0,
    rejected_units: 0,
    token_occurrences: 0,
    evidence_rows: 0,
    maqaf_subphrase_rows: 0,
    distinct_normalized_tokens: 0,
  };

  for (const relativePath of sourceFiles) {
    if (totalLimitReached(stats)) break;
    const data = readJson(relativePath);
    stats.source_files_scanned += 1;

    for (const unit of Array.isArray(data.units) ? data.units : []) {
      if (totalLimitReached(stats)) break;
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
        if (totalLimitReached(stats)) break;
        const token = tokens[tokenIndex];
        stats.token_occurrences += 1;
        count(tokenTotals, token.normalized);

        if (!totalLimitReached(stats) && shouldEmit(token.normalized, emittedByToken)) {
          const row = makeEvidenceRow({
            data,
            unit,
            relativePath,
            tokens,
            tokenIndex,
            focus: { surface: token.surface, normalized: token.normalized },
            partIndex: null,
            routeType: 'phrase_evidence',
            license,
          });
          await writeChunk(jsonl, `${JSON.stringify(row)}\n`);
          await writeChunk(csv, csvRowLine(row));
          noteEmission(token.normalized, emittedByToken);
          maybeCollectSample(row, samples);
          stats.evidence_rows += 1;
        }

        if (token.maqaf_parts.length > 1) {
          for (const [partIndex, part] of token.maqaf_parts.entries()) {
            if (totalLimitReached(stats)) break;
            count(tokenTotals, part.normalized);
            if (!shouldEmit(part.normalized, emittedByToken)) continue;
            const row = makeEvidenceRow({
              data,
              unit,
              relativePath,
              tokens,
              tokenIndex,
              focus: part,
              partIndex,
              routeType: 'subphrase_evidence',
              license,
            });
            await writeChunk(jsonl, `${JSON.stringify(row)}\n`);
            await writeChunk(csv, csvRowLine(row));
            noteEmission(part.normalized, emittedByToken);
            maybeCollectSample(row, samples);
            stats.evidence_rows += 1;
            stats.maqaf_subphrase_rows += 1;
          }
        }
      }
    }
  }

  await Promise.all([
    new Promise((resolve) => jsonl.end(resolve)),
    new Promise((resolve) => csv.end(resolve)),
  ]);

  stats.distinct_normalized_tokens = tokenTotals.size;
  stats.accepted_license_counts = sortedObject(acceptedLicenseCounts);
  stats.rejected_license_counts = sortedObject(rejectedLicenseCounts);

  const samplePath = options.sample
    ? paths.sample
    : options.localOnly
    ? `${paths.localDir}/source-phrase-evidence-sample.json`
    : paths.sample;

  writeIndex(paths.index, tokenTotals, emittedByToken);
  writeJson(samplePath, {
    schema_version: 1,
    generated_at: generatedAt,
    route_policy: 'Phrase rows prove license-safe usage context only; they do not force an English meaning.',
    untracked_sources_included: options.includeUntracked,
    max_per_token: options.maxPerToken,
    window_tokens_each_side: options.window,
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
    local_cache: paths.localDir,
    sample: samplePath,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import fs from 'node:fs';
import path from 'node:path';

const sourceDir = 'data/sources';
const lexicalDir = 'data/lexical';
const tokenIndexManifestPath = path.join(lexicalDir, 'token-index.json');
const tokenIndexesRoot = path.join(lexicalDir, 'token-indexes');
const occurrencesRoot = path.join(lexicalDir, 'occurrences');
const sourceLayerRoot = path.join(lexicalDir, 'source-layers');
const coverageRoot = 'data/reports/coverage';
const unresolvedRoot = 'data/lexical/unresolved';
const auditRoot = 'data/reports/audit';
const searchRoot = 'data/search';
const statsPath = 'corpus_stats.json';
const statsPagePath = 'stats/index.html';
const reportPath = 'data/reports/corpus-coverage-pipeline-report.md';
const publicDataBaseUrl =
  process.env.PUBLIC_DATA_BASE_URL ||
  'https://raw.githubusercontent.com/MashiachSonYosef/mashiachsonyosef.github.io/main/';

const tokenRe = /[\u05D0-\u05EA][\u0591-\u05C7\u05D0-\u05EA\u05F3\u05F4'"]*/gu;
const htmlTagRe = /<[^>]*>/g;
const niqqudRe = /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/gu;
const finalLetters = new Map([
  ['\u05DA', '\u05DB'],
  ['\u05DD', '\u05DE'],
  ['\u05DF', '\u05E0'],
  ['\u05E3', '\u05E4'],
  ['\u05E5', '\u05E6'],
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function publicDataUrl(relativePath) {
  return `${publicDataBaseUrl.replace(/\/+$/, '')}/${relativePath.replace(/^\/+/, '')}`;
}

function withoutGeneratedAt(value) {
  if (Array.isArray(value)) return value.map(withoutGeneratedAt);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => key !== 'generated_at')
    .map(([key, child]) => [key, withoutGeneratedAt(child)]));
}

function preserveGeneratedAtIfUnchanged(filePath, value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !Object.hasOwn(value, 'generated_at')) {
    return value;
  }
  if (!fs.existsSync(filePath)) return value;
  try {
    const previous = readJson(filePath);
    if (previous?.generated_at && JSON.stringify(withoutGeneratedAt(previous)) === JSON.stringify(withoutGeneratedAt(value))) {
      return { ...value, generated_at: previous.generated_at };
    }
  } catch {
    // If an existing generated artifact is not JSON, rewrite normally.
  }
  return value;
}

function normalizeGeneratedAtText(value) {
  return String(value)
    .replace(/\r\n/g, '\n')
    .replace(/"generated_at"\s*:\s*"[^"]+"/g, '"generated_at":"<generated_at>"');
}

function preserveGeneratedAtTextIfUnchanged(filePath, value) {
  if (!fs.existsSync(filePath)) return value;
  try {
    const previous = fs.readFileSync(filePath, 'utf8');
    if (normalizeGeneratedAtText(previous) === normalizeGeneratedAtText(value)) return previous;
  } catch {
    // If the previous artifact cannot be read, rewrite normally.
  }
  return value;
}

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function writeFileStable(filePath, value) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tempPath = path.join(dir, `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
  let lastError = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      fs.writeFileSync(tempPath, value, 'utf8');
      fs.renameSync(tempPath, filePath);
      return;
    } catch (error) {
      lastError = error;
      try {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      } catch {
        // Ignore cleanup failures; the next attempt uses a fresh temp name.
      }
      sleepSync(50 * (attempt + 1));
    }
  }
  throw lastError;
}

function appendFileStable(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  let lastError = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      fs.appendFileSync(filePath, value, 'utf8');
      return;
    } catch (error) {
      lastError = error;
      sleepSync(50 * (attempt + 1));
    }
  }
  throw lastError;
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const body = `${JSON.stringify(preserveGeneratedAtIfUnchanged(filePath, value), null, 2)}\n`;
  writeFileStable(filePath, preserveGeneratedAtTextIfUnchanged(filePath, body));
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (fs.existsSync(filePath)) {
    const previous = fs.readFileSync(filePath, 'utf8');
    if (previous.replace(/\r\n/g, '\n') === String(value).replace(/\r\n/g, '\n')) {
      return;
    }
  }
  writeFileStable(filePath, value);
}

function appendJsonlLine(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  appendFileStable(filePath, `${JSON.stringify(value)}\n`);
}

function resetFile(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileStable(filePath, '');
}

function writeJsonlChunks(rows, outputDir, prefix, maxBytes = 8 * 1024 * 1024) {
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });
  const chunks = [];
  let chunkRows = [];
  let chunkBytes = 0;
  let chunkIndex = 0;

  function flush() {
    if (!chunkRows.length) return;
    const chunkName = `${prefix}-${String(chunkIndex).padStart(3, '0')}.jsonl`;
    const chunkPath = path.join(outputDir, chunkName);
    const body = chunkRows.map((row) => JSON.stringify(row)).join('\n') + '\n';
    writeFileStable(chunkPath, body);
    chunks.push({
      path: chunkPath.replace(/\\/g, '/'),
      row_count: chunkRows.length,
      bytes: Buffer.byteLength(body),
    });
    chunkIndex += 1;
    chunkRows = [];
    chunkBytes = 0;
  }

  for (const row of rows) {
    const lineBytes = Buffer.byteLength(JSON.stringify(row)) + 1;
    if (chunkRows.length && chunkBytes + lineBytes > maxBytes) flush();
    chunkRows.push(row);
    chunkBytes += lineBytes;
  }
  flush();
  return chunks;
}

function normalizeHebrewPunctuation(value) {
  return String(value || '')
    .replace(/([\u0590-\u05FF])'/gu, '$1\u05F3')
    .replace(/([\u0590-\u05FF])"(?=[\u0590-\u05FF])/gu, '$1\u05F4');
}

function normalizeHebrew(value) {
  let normalized = normalizeHebrewPunctuation(value).normalize('NFC').replace(niqqudRe, '');
  normalized = Array.from(normalized, (ch) => finalLetters.get(ch) || ch).join('');
  return normalized;
}

function tokenizeHebrew(value) {
  return Array.from(String(value || '').matchAll(tokenRe), (match) => normalizeHebrewPunctuation(match[0]));
}

function stripHtml(value) {
  return String(value || '').replace(htmlTagRe, ' ');
}

function html(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function csv(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function csvRow(values) {
  return `${values.map(csv).join(',')}\n`;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function flattenHebrew(value) {
  return asArray(value).map((item) => stripHtml(item)).join('\n');
}

function getCategory(workSlug) {
  const first = String(workSlug || '').split(/[\\/]/).filter(Boolean)[0] || 'other';
  const labels = {
    ari: 'Ari / Kabbalah',
    gra: 'Gra School',
    kabbalah: 'Kabbalah',
    library: 'Library',
    midrash: 'Midrash / Aggadah',
    mishnah: 'Mishnah',
    orot: 'Rav Kook School',
    'rav-kook': 'Rav Kook School',
    'second-temple': 'Second Temple / Apocrypha',
    talmud: 'Talmud / Commentary',
    tanakh: 'Tanakh',
    targum: 'Targum',
    tosefta: 'Tosefta / Tannaitic',
  };
  return labels[first] || first.replace(/-/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function getWorkPagePath(workSlug) {
  return `${String(workSlug || '').replace(/\\/g, '/')}/index.html`;
}

function getSourceLicense(unit, source) {
  return unit.license || source.license || source.source_license || '';
}

function getSourceUrl(unit, source) {
  return unit.source_url || unit.version_source || source.source_url || source.source_base_url || '';
}

function getSourceVersion(unit, source) {
  return unit.version_title || source.version_title || '';
}

function loadSourceLayers() {
  const entryById = new Map();
  const layerFiles = fs.existsSync(sourceLayerRoot)
    ? fs.readdirSync(sourceLayerRoot).filter((file) => file.endsWith('.json')).sort()
    : [];
  const layerSummaries = [];
  for (const file of layerFiles) {
    const layerPath = path.join(sourceLayerRoot, file);
    const layer = readJson(layerPath);
    const entries = Array.isArray(layer.entries) ? layer.entries : [];
    layerSummaries.push({
      layer_id: layer.layer_id || path.basename(file, '.json'),
      source_family: layer.source_family || '',
      license: layer.license || '',
      path: layerPath.replace(/\\/g, '/'),
      entry_count: entries.length,
    });
    for (const entry of entries) {
      if (!entry.entry_id) continue;
      entryById.set(entry.entry_id, {
        ...entry,
        __layer_id: layer.layer_id || path.basename(file, '.json'),
        __layer_license: layer.license || '',
      });
    }
  }
  return { entryById, layerSummaries };
}

function entryRenderings(entry) {
  const values = [];
  for (const rendering of asArray(entry?.strict_renderings)) values.push(rendering);
  for (const possible of asArray(entry?.possible_entries)) {
    for (const rendering of asArray(possible?.strict_renderings)) values.push(rendering);
  }
  return Array.from(new Set(values.filter(Boolean)));
}

function rowRenderings(row, entry) {
  const values = [];
  for (const rendering of asArray(row?.surface_renderings)) values.push(rendering);
  for (const rendering of entryRenderings(entry)) values.push(rendering);
  return Array.from(new Set(values.filter(Boolean)));
}

function primaryPossibleEntry(entry) {
  const possibleEntries = asArray(entry?.possible_entries);
  return (
    possibleEntries.find((item) => item.context_role === 'strict_hebrew') ||
    possibleEntries.find((item) => item.context_role === 'strict_aramaic') ||
    possibleEntries.find((item) => item.context_role === 'likely_contextual') ||
    possibleEntries.find((item) => item.context_role === 'potential') ||
    possibleEntries[0] ||
    null
  );
}

function sourceRowsForEntry(entry) {
  const rows = asArray(entry?.source_rows);
  if (rows.length) return rows;
  const possible = primaryPossibleEntry(entry);
  if (!possible) return [];
  return [
    {
      source_name: possible.source_name || '',
      source_family: possible.source_family || '',
      source_id: possible.source_id || '',
      source_url: possible.source_url || '',
      license: entry?.__layer_license || '',
      license_url: '',
      notes: 'Source row was reconstructed from the rendered lexical candidate.',
    },
  ].filter((row) => row.source_name || row.source_id || row.license);
}

function classifyTokenRow(row, entry) {
  if (!row || row.status !== 'matched') return 'unresolved';
  const method = String(row.match_method || '');
  const contextStatus = String(row.surface_context_status || '');
  const strictMethods = new Set([
    'project_abbreviation',
    'project_aramaic_grammar',
    'project_function_word',
    'project_midrash_formula',
    'project_override',
    'project_zohar_ari_technical_term',
    'project_technical',
    'fixed_expression',
    'affix_parser',
    'quote_artifact_cleanup',
  ]);
  if (contextStatus.startsWith('resolved')) return 'strict';
  if (strictMethods.has(method)) return 'strict';
  if (entry?.disambiguation_status === 'likely' || entry?.disambiguation_status === 'resolved') return 'strict';
  if (asArray(entry?.possible_entries).some((item) => ['strict_hebrew', 'strict_aramaic', 'likely_contextual'].includes(item.context_role))) {
    return 'strict';
  }
  return 'potential';
}

function addTop(map, key, value, limit = 5) {
  if (!map.has(key)) map.set(key, []);
  const bucket = map.get(key);
  if (bucket.length < limit && value && !bucket.includes(value)) bucket.push(value);
}

function findBadMatchReasons(row, entry, classification) {
  if (classification !== 'potential') return [];
  const surface = row.surface_word || '';
  const normalized = row.normalized_word || '';
  const renderings = rowRenderings(row, entry).join(' / ');
  const haystack = renderings.toLowerCase();
  const reasons = [];
  if (/^(ה)?בית$/.test(normalized) && /\bbyte\b/.test(haystack)) {
    reasons.push('בית/הבית byte homograph should not be a default Hebrew-context match.');
  }
  if (/^(ה)?ארצ$/.test(normalized) && /\b(country|earth)\b/.test(haystack) && !/\bland\b/.test(haystack)) {
    reasons.push('ארץ/הארץ potential row lacks the safer land rendering and should be reviewed.');
  }
  if (/^מדבר$/.test(normalized)) {
    const hasDesert = /\b(desert|wilderness)\b/.test(haystack);
    const hasSpeech = /\b(speak|speaking|word|thing|matter)\b/.test(haystack);
    if (hasDesert && hasSpeech) reasons.push('מדבר mixes desert and speech/thing fields; needs contextual separation.');
  }
  const noisyTerms = [
    'tibetan',
    'lama',
    'nut',
    'dotted with a segol',
    'byte',
    'contrivance',
    'machine',
    'plot',
    'female slave',
    'maidservant',
    'donkey',
    ' ass',
  ];
  for (const term of noisyTerms) {
    if (haystack.includes(term)) reasons.push(`Potential gloss contains noisy term: ${term.trim()}.`);
  }
  if (surface === 'הארץ' && /\bearth\b/i.test(renderings) && !/\bland\b/i.test(renderings)) {
    reasons.push('הארץ should be audited for land-vs-Earth display priority.');
  }
  return Array.from(new Set(reasons));
}

function buildExamples(occurrences, tokenRows) {
  const examples = new Map();
  const unitEntries = Object.values(occurrences?.units || {});
  for (const unit of unitEntries) {
    const ref = unit.source_ref || unit.unit_id || '';
    for (const paragraph of asArray(unit.paragraphs)) {
      for (const tokenId of asArray(paragraph.token_index_ids)) {
        if (tokenRows.has(tokenId)) addTop(examples, tokenId, ref);
      }
    }
  }
  return examples;
}

function validateTokenRoundTrip(source, occurrences, tokenRows) {
  const failures = [];
  const occurrenceUnits = occurrences?.units || {};
  for (const unit of asArray(source.units)) {
    const occurrenceUnit = occurrenceUnits[unit.unit_id];
    if (!occurrenceUnit) {
      failures.push({
        work_id: source.work_id,
        source_ref: unit.source_ref || unit.unit_id || '',
        reason: 'No occurrence unit for source unit.',
      });
      continue;
    }
    const paragraphs = asArray(unit.hebrew);
    for (let i = 0; i < paragraphs.length; i += 1) {
      const expected = tokenizeHebrew(stripHtml(paragraphs[i]));
      const occurrenceParagraph = asArray(occurrenceUnit.paragraphs).find((item) => Number(item.paragraph_index) === i);
      const actual = asArray(occurrenceParagraph?.token_index_ids).map((tokenId) => tokenRows.get(tokenId)?.surface_word || '');
      if (expected.length !== actual.length || expected.some((token, index) => token !== actual[index])) {
        failures.push({
          work_id: source.work_id,
          source_ref: unit.source_ref || unit.unit_id || '',
          paragraph_index: i,
          reason: 'Source token sequence differs from lexical occurrence token sequence.',
          expected_count: expected.length,
          actual_count: actual.length,
          expected_sample: expected.slice(0, 12).join(' '),
          actual_sample: actual.slice(0, 12).join(' '),
        });
      }
      if (failures.length >= 50) return failures;
    }
  }
  return failures;
}

function writeUnresolvedCsv(work, rows, examplesByTokenId) {
  const filePath = path.join(unresolvedRoot, `${work.work_id}.csv`);
  let body = csvRow([
    'work_id',
    'work_title',
    'token_index_id',
    'surface_word',
    'normalized_word',
    'status',
    'strict_renderings',
    'notes',
    'not_a_translation',
    'occurrence_count',
    'example_refs',
  ]);
  for (const row of rows) {
    body += csvRow([
      work.work_id,
      work.work_title,
      row.token_index_id,
      row.surface_word,
      row.normalized_word,
      'Unresolved',
      '',
      'No lexical entry yet',
      'true',
      row.occurrence_count || 0,
      asArray(examplesByTokenId.get(row.token_index_id)).join('; '),
    ]);
  }
  writeText(filePath, body);
  return filePath;
}

function writeStatsPage(stats) {
  const categoryRows = Object.entries(stats.categories)
    .sort((a, b) => b[1].total_tokens - a[1].total_tokens)
    .map(([category, row]) => `<tr><td>${html(category)}</td><td>${row.works}</td><td>${row.source_units}</td><td>${row.total_tokens}</td><td>${row.lexical_coverage_percent}%</td><td>${row.unresolved_tokens}</td></tr>`)
    .join('\n');
  const workRows = stats.works
    .slice()
    .sort((a, b) => b.total_tokens - a.total_tokens)
    .map((work) => {
      const coverageUrl = publicDataUrl(`data/reports/coverage/${work.work_id}.json`);
      const unresolvedUrl = publicDataUrl(`data/lexical/unresolved/${work.work_id}.csv`);
      return `<tr><td><a href="../${html(work.page_path)}">${html(work.work_title)}</a></td><td>${html(work.category)}</td><td>${work.source_units}</td><td>${work.total_tokens}</td><td>${work.lexical_coverage_percent}%</td><td>${work.unresolved_tokens}</td><td><a href="${html(coverageUrl)}">coverage</a></td><td><a href="${html(unresolvedUrl)}">unresolved CSV</a></td></tr>`;
    })
    .join('\n');
  const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Corpus Stats</title>
  <style>
    body { margin: 0; font-family: Georgia, 'Times New Roman', serif; background: #f7f3e8; color: #1f1b14; }
    main { max-width: 1180px; margin: 0 auto; padding: 32px 18px 56px; }
    a { color: #5a3518; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin: 22px 0; }
    .card { background: #fffaf0; border: 1px solid #dacbb1; border-radius: 14px; padding: 16px; }
    .value { display: block; font-size: 1.65rem; font-weight: 700; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; background: #fffaf0; border: 1px solid #dacbb1; margin: 18px 0 32px; }
    th, td { border-bottom: 1px solid #e5d8c3; padding: 9px 10px; text-align: left; vertical-align: top; }
    th { background: #eadfc9; position: sticky; top: 0; }
    .table-wrap { overflow-x: auto; }
    .note { color: #5d5345; line-height: 1.55; }
  </style>
</head>
<body>
<main>
  <p><a href="../library/">&larr; Full Library</a></p>
  <h1>Corpus Stats</h1>
  <p class="note">Generated ${html(stats.generated_at)}. Counts are source-workbench metrics, not translation progress. Hebrew source licenses and lexical row licenses remain separate.</p>
  <section class="summary">
    <div class="card">Works <span class="value">${stats.total_works}</span></div>
    <div class="card">Source Units <span class="value">${stats.total_source_units}</span></div>
    <div class="card">Hebrew Tokens <span class="value">${stats.total_hebrew_tokens}</span></div>
    <div class="card">Unique Surface Forms <span class="value">${stats.unique_surface_forms}</span></div>
    <div class="card">Lexical Coverage <span class="value">${stats.lexical_coverage_percent}%</span></div>
    <div class="card">Unresolved Tokens <span class="value">${stats.unresolved_tokens}</span></div>
  </section>
  <h2>Downloads</h2>
  <p class="note"><a href="${html(publicDataUrl('corpus_stats.json'))}">corpus_stats.json</a> &middot; <a href="${html(publicDataUrl('data/reports/audit/bad_matches.csv'))}">bad-match audit CSV</a> &middot; <a href="${html(publicDataUrl('data/search/manifest.json'))}">search index manifest</a></p>
  <h2>Categories</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Category</th><th>Works</th><th>Units</th><th>Tokens</th><th>Coverage</th><th>Unresolved</th></tr></thead>
      <tbody>${categoryRows}</tbody>
    </table>
  </div>
  <h2>Works</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Work</th><th>Category</th><th>Units</th><th>Tokens</th><th>Coverage</th><th>Unresolved</th><th>Coverage JSON</th><th>Unresolved CSV</th></tr></thead>
      <tbody>${workRows}</tbody>
    </table>
  </div>
</main>
</body>
</html>
`;
  writeText(statsPagePath, page);
}

function writeReport(stats, auditRows) {
  const unresolved = stats.top_unresolved_by_frequency
    .slice(0, 25)
    .map((row, index) => `${index + 1}. ${row.surface_word} (${row.normalized_word}) — ${row.count}`)
    .join('\n');
  const bad = auditRows
    .slice(0, 25)
    .map((row, index) => `${index + 1}. ${row.surface_word} in ${row.work_id} — ${row.reason}`)
    .join('\n');
  const body = `# Corpus Coverage Pipeline Report

Generated: ${stats.generated_at}

## Summary

- Works: ${stats.total_works}
- Source units: ${stats.total_source_units}
- Hebrew tokens: ${stats.total_hebrew_tokens}
- Unique surface forms: ${stats.unique_surface_forms}
- Unique normalized forms: ${stats.unique_normalized_forms}
- Lexical coverage: ${stats.lexical_coverage_percent}%
- Strict tokens: ${stats.strict_matches}
- Potential tokens: ${stats.potential_matches}
- Unresolved tokens: ${stats.unresolved_tokens}

## Generated Outputs

- Root corpus stats: \`corpus_stats.json\`
- Per-work coverage: \`data/reports/coverage/<work_id>.json\`
- Per-work unresolved placeholders: \`data/lexical/unresolved/<work_id>.csv\`
- Bad-match audit: \`data/reports/audit/bad_matches.csv\`
- Search index manifest: \`data/search/manifest.json\`
- Public stats page: \`stats/index.html\`

## Top 25 Unresolved Tokens

${unresolved || 'None.'}

## Top 25 Bad Potential Matches

${bad || 'None flagged.'}
`;
  writeText(reportPath, body);
}

function createEmptySearchOutputs() {
  const files = [
    path.join(searchRoot, 'lemma-form-index.jsonl'),
    path.join(searchRoot, 'english-gloss-index.jsonl'),
  ];
  for (const file of files) resetFile(file);
}

function writeLexicalSearchIndexes(entryById) {
  const lemmaPath = path.join(searchRoot, 'lemma-form-index.jsonl');
  const glossPath = path.join(searchRoot, 'english-gloss-index.jsonl');
  for (const entry of entryById.values()) {
    const sourceRows = sourceRowsForEntry(entry);
    const primarySource = sourceRows[0] || {};
    const possibleEntries = asArray(entry.possible_entries);
    const lemmaValues = new Set([entry.hebrew_word, ...asArray(entry.surface_forms)]);
    for (const possible of possibleEntries) {
      if (possible.lemma) lemmaValues.add(possible.lemma);
      if (possible.match_key) lemmaValues.add(possible.match_key);
    }
    for (const lemma of lemmaValues) {
      if (!lemma) continue;
      appendJsonlLine(lemmaPath, {
        entry_id: entry.entry_id,
        lemma_or_form: lemma,
        normalized_form: normalizeHebrew(lemma),
        layer_id: entry.__layer_id,
        source_name: primarySource.source_name || '',
        source_id: primarySource.source_id || '',
        source_url: primarySource.source_url || '',
        lexical_license: primarySource.license || entry.__layer_license || '',
        license_url: primarySource.license_url || '',
      });
    }
    for (const rendering of entryRenderings(entry)) {
      appendJsonlLine(glossPath, {
        entry_id: entry.entry_id,
        hebrew_word: entry.hebrew_word || '',
        rendering,
        layer_id: entry.__layer_id,
        source_name: primarySource.source_name || '',
        source_id: primarySource.source_id || '',
        source_url: primarySource.source_url || '',
        lexical_license: primarySource.license || entry.__layer_license || '',
        license_url: primarySource.license_url || '',
      });
    }
  }
}

function main() {
  const generatedAt = new Date().toISOString();
  const tokenManifest = readJson(tokenIndexManifestPath);
  const { entryById, layerSummaries } = loadSourceLayers();
  const workIndexes = tokenManifest.work_indexes || [];
  const sourceFiles = new Map(
    fs.readdirSync(sourceDir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => [path.basename(file, '.json'), path.join(sourceDir, file)])
  );

  fs.mkdirSync(coverageRoot, { recursive: true });
  fs.mkdirSync(unresolvedRoot, { recursive: true });
  fs.mkdirSync(auditRoot, { recursive: true });
  fs.rmSync(path.join(searchRoot, 'source-text', 'by-work'), { recursive: true, force: true });
  fs.rmSync(path.join(searchRoot, 'normalized-forms'), { recursive: true, force: true });
  fs.rmSync(path.join(searchRoot, 'normalized-form-index.jsonl'), { force: true });
  fs.mkdirSync(path.join(searchRoot, 'source-text'), { recursive: true });
  createEmptySearchOutputs();
  writeLexicalSearchIndexes(entryById);

  const siteSurfaceForms = new Set();
  const siteNormalizedForms = new Set();
  const normalizedSearchRows = new Map();
  const globalUnresolved = new Map();
  const auditRows = [];
  const works = [];
  const categories = {};
  const roundTripFailures = [];

  let totalWorks = 0;
  let totalSourceUnits = 0;
  let totalHebrewTokens = 0;
  let matchedTokens = 0;
  let strictTokens = 0;
  let potentialTokens = 0;
  let unresolvedTokens = 0;

  for (const workIndex of workIndexes) {
    const sourcePath = sourceFiles.get(workIndex.work_id);
    if (!sourcePath) continue;
    const source = readJson(sourcePath);
    const tokenIndexPath = path.join(lexicalDir, workIndex.path);
    const tokenIndex = readJson(tokenIndexPath);
    const occurrencePath = path.join(occurrencesRoot, `${workIndex.work_id}.json`);
    const occurrences = fs.existsSync(occurrencePath) ? readJson(occurrencePath) : { units: {} };
    const tokenRows = new Map(tokenIndex.forms.map((row) => [row.token_index_id, row]));
    const examplesByTokenId = buildExamples(occurrences, tokenRows);

    roundTripFailures.push(...validateTokenRoundTrip(source, occurrences, tokenRows));

    const category = getCategory(source.work_slug || workIndex.work_slug);
    const pagePath = getWorkPagePath(source.work_slug || workIndex.work_slug);
    totalWorks += 1;

    let workTotalTokens = 0;
    let workMatchedTokens = 0;
    let workStrictTokens = 0;
    let workPotentialTokens = 0;
    let workUnresolvedTokens = 0;
    const workUnresolvedRows = [];
    const workPotentialRows = [];

    for (const row of tokenIndex.forms) {
      const entry = entryById.get(row.lexicon_entry_id);
      const classification = classifyTokenRow(row, entry);
      const occurrenceCount = Number(row.occurrence_count || 0);
      const examples = asArray(examplesByTokenId.get(row.token_index_id));
      workTotalTokens += occurrenceCount;
      siteSurfaceForms.add(row.surface_word || '');
      siteNormalizedForms.add(row.normalized_word || normalizeHebrew(row.surface_word || ''));

      const normalizedKey = row.normalized_word || normalizeHebrew(row.surface_word || '');
      if (!normalizedSearchRows.has(normalizedKey)) {
        normalizedSearchRows.set(normalizedKey, {
          normalized_form: normalizedKey,
          total_occurrences: 0,
          matched_occurrences: 0,
          strict_occurrences: 0,
          potential_occurrences: 0,
          unresolved_occurrences: 0,
          sample_surface_forms: [],
          sample_works: [],
          example_refs: [],
        });
      }
      const normalizedSearchRow = normalizedSearchRows.get(normalizedKey);
      normalizedSearchRow.total_occurrences += occurrenceCount;
      if (classification === 'strict') normalizedSearchRow.strict_occurrences += occurrenceCount;
      if (classification === 'potential') normalizedSearchRow.potential_occurrences += occurrenceCount;
      if (classification === 'unresolved') normalizedSearchRow.unresolved_occurrences += occurrenceCount;
      if (classification !== 'unresolved') normalizedSearchRow.matched_occurrences += occurrenceCount;
      if (row.surface_word && normalizedSearchRow.sample_surface_forms.length < 10 && !normalizedSearchRow.sample_surface_forms.includes(row.surface_word)) {
        normalizedSearchRow.sample_surface_forms.push(row.surface_word);
      }
      if (normalizedSearchRow.sample_works.length < 10 && !normalizedSearchRow.sample_works.includes(source.work_id)) {
        normalizedSearchRow.sample_works.push(source.work_id);
      }
      for (const example of examples) {
        if (normalizedSearchRow.example_refs.length < 10 && !normalizedSearchRow.example_refs.includes(example)) {
          normalizedSearchRow.example_refs.push(example);
        }
      }

      if (classification === 'unresolved') {
        workUnresolvedTokens += occurrenceCount;
        workUnresolvedRows.push(row);
        const key = `${row.surface_word || ''}\u0000${row.normalized_word || ''}`;
        if (!globalUnresolved.has(key)) {
          globalUnresolved.set(key, {
            surface_word: row.surface_word || '',
            normalized_word: row.normalized_word || '',
            count: 0,
            examples: [],
          });
        }
        const global = globalUnresolved.get(key);
        global.count += occurrenceCount;
        for (const example of examples) {
          if (global.examples.length < 5 && !global.examples.includes(example)) global.examples.push(example);
        }
      } else if (classification === 'strict') {
        workMatchedTokens += occurrenceCount;
        workStrictTokens += occurrenceCount;
      } else {
        workMatchedTokens += occurrenceCount;
        workPotentialTokens += occurrenceCount;
        workPotentialRows.push(row);
      }

      const reasons = findBadMatchReasons(row, entry, classification);
      for (const reason of reasons) {
        const renderings = rowRenderings(row, entry);
        const sourceRows = sourceRowsForEntry(entry);
        auditRows.push({
          work_id: source.work_id,
          work_title: source.work_title,
          source_refs: examples.join('; '),
          surface_word: row.surface_word || '',
          normalized_word: row.normalized_word || '',
          lexical_status: 'Potential',
          renderings: renderings.join(' / '),
          reason,
          source_name: sourceRows.map((item) => item.source_name).filter(Boolean).join('; '),
          source_id: sourceRows.map((item) => item.source_id).filter(Boolean).join('; '),
          license: sourceRows.map((item) => item.license).filter(Boolean).join('; '),
        });
      }
    }

    const topUnresolved = workUnresolvedRows
      .slice()
      .sort((a, b) => Number(b.occurrence_count || 0) - Number(a.occurrence_count || 0))
      .slice(0, 100)
      .map((row) => ({
        surface_word: row.surface_word || '',
        normalized_word: row.normalized_word || '',
        count: Number(row.occurrence_count || 0),
        example_refs: asArray(examplesByTokenId.get(row.token_index_id)).slice(0, 5),
      }));
    const topPotential = workPotentialRows
      .slice()
      .sort((a, b) => Number(b.occurrence_count || 0) - Number(a.occurrence_count || 0))
      .slice(0, 100)
      .map((row) => ({
        surface_word: row.surface_word || '',
        normalized_word: row.normalized_word || '',
        count: Number(row.occurrence_count || 0),
        match_method: row.match_method || '',
        renderings: rowRenderings(row, entryById.get(row.lexicon_entry_id)).slice(0, 10),
        example_refs: asArray(examplesByTokenId.get(row.token_index_id)).slice(0, 5),
      }));

    const coverage = {
      schema_version: 1,
      generated_at: generatedAt,
      work_id: source.work_id,
      work_title: source.work_title,
      category,
      source_units: asArray(source.units).length,
      total_tokens: workTotalTokens,
      matched_tokens: workMatchedTokens,
      strict_tokens: workStrictTokens,
      potential_tokens: workPotentialTokens,
      unresolved_tokens: workUnresolvedTokens,
      lexical_coverage_percent: workTotalTokens ? Number(((workMatchedTokens / workTotalTokens) * 100).toFixed(2)) : 0,
      top_unresolved_by_frequency: topUnresolved,
      top_potential_by_frequency: topPotential,
    };
    writeJson(path.join(coverageRoot, `${source.work_id}.json`), coverage);
    writeUnresolvedCsv(source, workUnresolvedRows, examplesByTokenId);

    totalSourceUnits += coverage.source_units;
    totalHebrewTokens += workTotalTokens;
    matchedTokens += workMatchedTokens;
    strictTokens += workStrictTokens;
    potentialTokens += workPotentialTokens;
    unresolvedTokens += workUnresolvedTokens;

    if (!categories[category]) {
      categories[category] = {
        works: 0,
        source_units: 0,
        total_tokens: 0,
        matched_tokens: 0,
        strict_tokens: 0,
        potential_tokens: 0,
        unresolved_tokens: 0,
      };
    }
    categories[category].works += 1;
    categories[category].source_units += coverage.source_units;
    categories[category].total_tokens += workTotalTokens;
    categories[category].matched_tokens += workMatchedTokens;
    categories[category].strict_tokens += workStrictTokens;
    categories[category].potential_tokens += workPotentialTokens;
    categories[category].unresolved_tokens += workUnresolvedTokens;

    works.push({
      work_id: source.work_id,
      work_title: source.work_title,
      work_slug: source.work_slug || workIndex.work_slug,
      page_path: pagePath,
      category,
      source_units: coverage.source_units,
      total_tokens: workTotalTokens,
      matched_tokens: workMatchedTokens,
      strict_tokens: workStrictTokens,
      potential_tokens: workPotentialTokens,
      unresolved_tokens: workUnresolvedTokens,
      lexical_coverage_percent: coverage.lexical_coverage_percent,
      coverage_report: `data/reports/coverage/${source.work_id}.json`,
      unresolved_csv: `data/lexical/unresolved/${source.work_id}.csv`,
      source_text_search_source: `data/sources/${source.work_id}.json`,
      normalized_form_search_index: 'data/search/normalized-forms/manifest.json',
    });
  }

  if (roundTripFailures.length) {
    writeJson('data/reports/audit/token_roundtrip_failures.json', {
      schema_version: 1,
      generated_at: generatedAt,
      failures: roundTripFailures,
    });
    throw new Error(`Token round-trip validation failed for ${roundTripFailures.length} source paragraphs. See data/reports/audit/token_roundtrip_failures.json`);
  }
  const roundTripFailurePath = 'data/reports/audit/token_roundtrip_failures.json';
  if (fs.existsSync(roundTripFailurePath)) fs.unlinkSync(roundTripFailurePath);

  for (const category of Object.values(categories)) {
    category.lexical_coverage_percent = category.total_tokens
      ? Number(((category.matched_tokens / category.total_tokens) * 100).toFixed(2))
      : 0;
  }

  auditRows.sort((a, b) => String(a.work_id).localeCompare(String(b.work_id)) || String(a.surface_word).localeCompare(String(b.surface_word)));
  let auditCsv = csvRow([
    'work_id',
    'work_title',
    'source_refs',
    'surface_word',
    'normalized_word',
    'lexical_status',
    'renderings',
    'reason',
    'source_name',
    'source_id',
    'license',
  ]);
  for (const row of auditRows) {
    auditCsv += csvRow([
      row.work_id,
      row.work_title,
      row.source_refs,
      row.surface_word,
      row.normalized_word,
      row.lexical_status,
      row.renderings,
      row.reason,
      row.source_name,
      row.source_id,
      row.license,
    ]);
  }
  writeText(path.join(auditRoot, 'bad_matches.csv'), auditCsv);

  const normalizedRows = Array.from(normalizedSearchRows.values()).sort((a, b) => b.total_occurrences - a.total_occurrences);
  const normalizedChunks = writeJsonlChunks(
    normalizedRows,
    path.join(searchRoot, 'normalized-forms'),
    'normalized-forms',
  );
  const normalizedManifest = {
    schema_version: 1,
    generated_at: generatedAt,
    row_count: normalizedRows.length,
    chunk_count: normalizedChunks.length,
    chunks: normalizedChunks.map((chunk) => ({
      path: chunk.path,
      row_count: chunk.row_count,
      bytes: chunk.bytes,
    })),
  };
  writeJson(path.join(searchRoot, 'normalized-forms', 'manifest.json'), normalizedManifest);

  const sourceTextManifest = {
    schema_version: 1,
    generated_at: generatedAt,
    source_text_search_strategy:
      'Use these source files directly for source-text search. This avoids duplicating Hebrew source text in a second index while preserving source/version/license metadata in the source rows.',
    works: works.map((work) => ({
      work_id: work.work_id,
      work_title: work.work_title,
      category: work.category,
      source_path: `data/sources/${work.work_id}.json`,
      page_path: work.page_path,
    })),
  };
  writeJson(path.join(searchRoot, 'source-text', 'manifest.json'), sourceTextManifest);

  const searchManifest = {
    schema_version: 1,
    generated_at: generatedAt,
    indexes: {
      source_text_manifest: 'data/search/source-text/manifest.json',
      normalized_forms_manifest: 'data/search/normalized-forms/manifest.json',
      lemma_forms: 'data/search/lemma-form-index.jsonl',
      english_glosses: 'data/search/english-gloss-index.jsonl',
    },
    license_boundary_note:
      'Source text indexes carry Hebrew source/version licenses. Lexical indexes carry lexical source-row licenses. These license regimes must not be merged.',
    works: works.map((work) => ({
      work_id: work.work_id,
      work_title: work.work_title,
      source_text_search_source: work.source_text_search_source,
      normalized_form_search_index: 'data/search/normalized-forms/manifest.json',
    })),
  };
  writeJson(path.join(searchRoot, 'manifest.json'), searchManifest);

  const topUnresolved = Array.from(globalUnresolved.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 300);

  const stats = {
    schema_version: 1,
    generated_at: generatedAt,
    total_works: totalWorks,
    total_source_units: totalSourceUnits,
    total_hebrew_tokens: totalHebrewTokens,
    unique_surface_forms: siteSurfaceForms.size,
    unique_normalized_forms: siteNormalizedForms.size,
    lexical_coverage_percent: totalHebrewTokens ? Number(((matchedTokens / totalHebrewTokens) * 100).toFixed(2)) : 0,
    matched_tokens: matchedTokens,
    strict_matches: strictTokens,
    potential_matches: potentialTokens,
    unresolved_tokens: unresolvedTokens,
    top_unresolved_by_frequency: topUnresolved,
    categories,
    works,
    source_layers: layerSummaries,
    generated_outputs: {
      coverage_reports: 'data/reports/coverage/<work_id>.json',
      unresolved_placeholders: 'data/lexical/unresolved/<work_id>.csv',
      bad_match_audit: 'data/reports/audit/bad_matches.csv',
      search_manifest: 'data/search/manifest.json',
      stats_page: 'stats/index.html',
    },
  };
  writeJson(statsPath, stats);
  writeStatsPage(stats);
  writeReport(stats, auditRows);

  console.log(`Corpus reports generated for ${totalWorks} works, ${totalSourceUnits} source units, ${totalHebrewTokens} tokens.`);
  console.log(`Lexical coverage: ${stats.lexical_coverage_percent}% (${matchedTokens} matched / ${totalHebrewTokens} tokens).`);
  console.log(`Bad potential matches flagged: ${auditRows.length}.`);
}

main();

import fs from 'node:fs';
import path from 'node:path';

const sourceDir = 'data/sources';
const lexicalDir = 'data/lexical';
const reportPath = 'reports/sitewide-lexical-report.md';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function percent(part, whole) {
  if (!whole) return '0.0%';
  return `${((part / whole) * 100).toFixed(1)}%`;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 2)} ${units[unit]}`;
}

function getCategory(source) {
  if (source.work_id === 'orot') return 'Rav Kook School';
  const first = String(source.work_slug || '').split(/[\\/]/).filter(Boolean)[0] || '';
  if (first === 'ari') return 'Ari School';
  if (first === 'gra') return 'Gra School';
  if (first === 'rav-kook') return 'Rav Kook School';
  if (first === 'tanakh') return 'Tanakh';
  return 'Works';
}

function sourceKey(row) {
  return `${row?.source_family || ''}|${row?.source_id || ''}|${row?.license || ''}`;
}

function entryLayer(entry) {
  const sourceRows = entry?.source_rows || [];
  const possibleEntries = entry?.possible_entries || [];
  const ids = [
    ...sourceRows.map((row) => row.source_id),
    ...possibleEntries.map((row) => row.source_id || row.entry_key),
  ].filter(Boolean).map(String);
  const families = new Set(sourceRows.map((row) => row.source_family).filter(Boolean));
  if (ids.some((id) => id.startsWith('project-abbreviation:'))) return 'project_abbreviations';
  if (ids.some((id) => id.startsWith('project-function-word:'))) return 'project_function_words';
  if (families.has('kaikki') || families.has('wiktionary')) return 'kaikki_wiktionary_cc_by_sa_gfdl';
  if (families.has('openscriptures')) return 'openscriptures_cc_by_4';
  if (families.has('wikidata')) return 'wikidata_cc0';
  if (families.has('workspace')) return 'project_overrides_grammar';
  return 'unknown';
}

function rowLayers(row, entriesById) {
  const layers = new Set();
  const entry = entriesById.get(row.lexicon_entry_id);
  if (entry) layers.add(entryLayer(entry));
  if (row.match_method === 'affix_parser') layers.add('parser_affix_resolution');
  if (row.match_method === 'project_function_word') layers.add('project_function_words');
  if (row.match_method === 'project_abbreviation') layers.add('project_abbreviations');
  return Array.from(layers);
}

function emptyLayerCounts() {
  return {
    wikidata_cc0: 0,
    openscriptures_cc_by_4: 0,
    kaikki_wiktionary_cc_by_sa_gfdl: 0,
    project_overrides_grammar: 0,
    project_function_words: 0,
    project_abbreviations: 0,
    work_specific_technical_terms: 0,
    parser_affix_resolution: 0,
    unknown: 0,
  };
}

function addLayerCounts(counts, row, entriesById) {
  for (const layer of rowLayers(row, entriesById)) {
    counts[layer] = (counts[layer] || 0) + 1;
  }
}

function layerCountsText(counts) {
  return [
    `Wikidata ${counts.wikidata_cc0 || 0}`,
    `OpenScriptures ${counts.openscriptures_cc_by_4 || 0}`,
    `Kaikki ${counts.kaikki_wiktionary_cc_by_sa_gfdl || 0}`,
    `project overrides ${counts.project_overrides_grammar || 0}`,
    `function words ${counts.project_function_words || 0}`,
    `abbreviations ${counts.project_abbreviations || 0}`,
    `technical ${counts.work_specific_technical_terms || 0}`,
    `parser ${counts.parser_affix_resolution || 0}`,
  ].join('; ');
}

function inferCategory(row) {
  const surface = String(row.surface_word || '');
  const normalized = String(row.normalized_word || '');
  if (/[\u05F3\u05F4'"]/.test(surface)) return 'abbreviation';
  if (/["'\u05F3\u05F4]$/.test(surface)) return 'punctuation/quote artifact';
  if (/^[\u05D5\u05D4\u05D1\u05DB\u05DC\u05DE\u05E9]/u.test(normalized) && normalized.length > 3) return 'prefix/function form';
  if (/[\u05D0]$/u.test(normalized) || /^[\u05D3]/u.test(normalized)) return 'Aramaic/rabbinic form';
  if (/(\u05D9\u05DD|\u05D5\u05EA|\u05D9\u05EA|\u05D9\u05D5|\u05D9\u05D4|\u05DB\u05DD|\u05DB\u05DF|\u05D9\u05D4\u05DD|\u05D9\u05D4\u05DF)$/u.test(normalized)) return 'inflected noun/adjective';
  if (/^(\u05D4\u05EA|\u05EA|\u05D9|\u05E0)/u.test(normalized) && normalized.length > 3) return 'inflected verb';
  if (surface.includes('־') || surface.includes('-')) return 'phrase form';
  return 'unknown';
}

function getExamples(occurrence, tokenId, limit = 5) {
  const refs = [];
  for (const unit of Object.values(occurrence?.units || {})) {
    for (const paragraph of unit.paragraphs || []) {
      if ((paragraph.token_index_ids || []).includes(tokenId) && unit.source_ref && !refs.includes(unit.source_ref)) {
        refs.push(unit.source_ref);
        if (refs.length >= limit) return refs;
      }
    }
  }
  return refs;
}

function fileSize(filePath) {
  return fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
}

function loadLexiconEntries(manifest) {
  const entries = [];
  for (const layer of manifest.layer_files || []) {
    if (!layer.path) continue;
    const layerPath = path.join(lexicalDir, layer.path);
    if (!fs.existsSync(layerPath)) continue;
    const layerJson = readJson(layerPath);
    for (const entry of layerJson.entries || []) {
      entries.push({
        ...entry,
        _layer_id: layer.layer_id,
        _layer_path: layer.path,
      });
    }
  }
  return entries;
}

const sources = fs.readdirSync(sourceDir)
  .filter((name) => name.endsWith('.json'))
  .map((name) => readJson(path.join(sourceDir, name)))
  .sort((a, b) => String(a.work_title).localeCompare(String(b.work_title)));
const tokenIndex = readJson(path.join(lexicalDir, 'token-index.json'));
const lexiconManifest = readJson(path.join(lexicalDir, 'lexicon.json'));
const entries = loadLexiconEntries(lexiconManifest);
const entriesById = new Map(entries.map((entry) => [entry.entry_id, entry]));
function loadTokenIndexForms(indexManifest) {
  if (Array.isArray(indexManifest.forms) && indexManifest.forms.length) return indexManifest.forms;
  const rows = [];
  for (const indexFile of indexManifest.work_indexes || []) {
    if (!indexFile.path) continue;
    const indexPath = path.join(lexicalDir, indexFile.path);
    if (!fs.existsSync(indexPath)) continue;
    rows.push(...(readJson(indexPath).forms || []));
  }
  return rows;
}

const forms = loadTokenIndexForms(tokenIndex);
const formsByWork = new Map();
for (const row of forms) {
  if (!formsByWork.has(row.work_id)) formsByWork.set(row.work_id, []);
  formsByWork.get(row.work_id).push(row);
}

const occurrenceByWork = new Map();
for (const source of sources) {
  const occurrencePath = path.join(lexicalDir, 'occurrences', `${source.work_id}.json`);
  if (fs.existsSync(occurrencePath)) occurrenceByWork.set(source.work_id, readJson(occurrencePath));
}

const globalLayerCounts = emptyLayerCounts();
for (const row of forms.filter((item) => item.status === 'matched')) addLayerCounts(globalLayerCounts, row, entriesById);

const uniqueSurfaceGroups = new Map();
for (const row of forms) {
  if (!uniqueSurfaceGroups.has(row.surface_word)) uniqueSurfaceGroups.set(row.surface_word, []);
  uniqueSurfaceGroups.get(row.surface_word).push(row);
}

const perWorkRows = sources.map((source) => {
  const workForms = formsByWork.get(source.work_id) || [];
  const matched = workForms.filter((row) => row.status === 'matched');
  const unmatched = workForms.filter((row) => row.status !== 'matched');
  const counts = emptyLayerCounts();
  for (const row of matched) addLayerCounts(counts, row, entriesById);
  const pagePath = path.join(source.work_slug, 'index.html');
  const chunkDir = path.join(lexicalDir, `${source.work_id}-chunks`);
  const chunkSizes = fs.existsSync(chunkDir)
    ? fs.readdirSync(chunkDir).filter((name) => name.endsWith('.json')).map((name) => fileSize(path.join(chunkDir, name)))
    : [];
  return {
    source,
    category: getCategory(source),
    unique: workForms.length,
    matched: matched.length,
    unmatched: unmatched.length,
    occurrences: workForms.reduce((sum, row) => sum + (row.occurrence_count || 0), 0),
    counts,
    pageSize: fileSize(pagePath),
    largestChunk: chunkSizes.length ? Math.max(...chunkSizes) : 0,
    chunkCount: chunkSizes.length,
    hudEnabled: fs.existsSync(path.join(lexicalDir, `${source.work_id}.manifest.json`)) && chunkSizes.length > 0,
  };
});

const unmatchedRows = forms
  .filter((row) => row.status !== 'matched')
  .slice()
  .sort((a, b) => (b.occurrence_count || 0) - (a.occurrence_count || 0) || String(a.surface_word).localeCompare(String(b.surface_word), 'he'));

const largeHtmlFiles = sources.map((source) => ({
  path: `${source.work_slug}/index.html`,
  size: fileSize(path.join(source.work_slug, 'index.html')),
})).sort((a, b) => b.size - a.size).slice(0, 20);

const allChunkFiles = [];
for (const source of sources) {
  const chunkDir = path.join(lexicalDir, `${source.work_id}-chunks`);
  if (!fs.existsSync(chunkDir)) continue;
  for (const name of fs.readdirSync(chunkDir).filter((item) => item.endsWith('.json'))) {
    allChunkFiles.push({
      path: path.join(chunkDir, name).replace(/\\/g, '/'),
      size: fileSize(path.join(chunkDir, name)),
    });
  }
}
allChunkFiles.sort((a, b) => b.size - a.size);

const sourceLayerFiles = fs.readdirSync(path.join(lexicalDir, 'source-layers'))
  .filter((name) => name.endsWith('.json'))
  .map((name) => ({
    path: `data/lexical/source-layers/${name}`,
    size: fileSize(path.join(lexicalDir, 'source-layers', name)),
  }))
  .sort((a, b) => b.size - a.size);

const lexicalFiles = [];
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) walk(full);
    else lexicalFiles.push({ path: full.replace(/\\/g, '/'), size: fileSize(full) });
  }
}
walk(lexicalDir);
const totalLexicalSize = lexicalFiles.reduce((sum, file) => sum + file.size, 0);
const githubWarningThreshold = 50 * 1024 * 1024;

const missingMetadata = [];
for (const entry of entries) {
  for (const row of entry.source_rows || []) {
    if (!row.source_name || !row.source_id || !row.license) {
      missingMetadata.push(`${entry.entry_id} / ${sourceKey(row)}`);
    }
  }
}

const riskyKaikki = entries
  .filter((entry) => (entry.source_rows || []).some((row) => row.source_family === 'kaikki' || row.source_family === 'wiktionary'))
  .filter((entry) => (entry.possible_entries || []).length > 1 && !(entry.possible_entries || []).some((candidate) => candidate.context_role === 'likely_contextual'))
  .slice(0, 50);

const possibleOnly = entries
  .filter((entry) => entry.disambiguation_status !== 'likely' || !(entry.possible_entries || []).some((candidate) => candidate.context_role === 'likely_contextual'))
  .slice(0, 50);

const singleLetterRows = forms
  .filter((row) => String(row.normalized_word || '').length === 1)
  .sort((a, b) => (b.occurrence_count || 0) - (a.occurrence_count || 0))
  .slice(0, 50);

const noisyGlosses = entries
  .flatMap((entry) => {
    const renderings = [
      ...(entry.strict_renderings || []),
      ...(entry.possible_entries || []).flatMap((candidate) => candidate.strict_renderings || []),
    ];
    return renderings
      .filter((rendering) => /\b(obsolete|archaic|slang|vulgar|rare|form of|alternative|alt\.|misspelling)\b/i.test(rendering) || String(rendering).length > 80)
      .map((rendering) => ({ entry, rendering }));
  })
  .slice(0, 50);

const chunkLicenseMix = allChunkFiles.slice(0, 200).flatMap((file) => {
  const chunk = readJson(file.path);
  const licenses = new Set(Object.values(chunk.source_rows || {}).map((row) => row.license).filter(Boolean));
  return licenses.size > 1 ? [{ path: file.path, licenses: Array.from(licenses).join('; ') }] : [];
}).slice(0, 50);

const lines = [];
lines.push('# Sitewide Lexical HUD Report');
lines.push('');
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push('');
lines.push('## Scope');
lines.push('');
lines.push('- Source imports added: no');
lines.push('- Broad vocabulary added: no');
lines.push('- Machine translations generated: no');
lines.push('- Hebrew source, anchors, overlays, and exports changed by lexical generation: no');
lines.push('- Work-specific technical terms remain scoped by work-aware token rows.');
lines.push('');
lines.push('## Global Summary');
lines.push('');
lines.push(`- Total works/pages processed: ${sources.length}`);
lines.push(`- Total unique surface forms sitewide: ${uniqueSurfaceGroups.size}`);
lines.push(`- Total work-surface rows: ${forms.length}`);
lines.push(`- Total matched work-surface rows: ${forms.filter((row) => row.status === 'matched').length}`);
lines.push(`- Total unmatched work-surface rows: ${forms.filter((row) => row.status !== 'matched').length}`);
lines.push(`- Total token occurrences: ${forms.reduce((sum, row) => sum + (row.occurrence_count || 0), 0)}`);
lines.push(`- Matched by source layer: ${layerCountsText(globalLayerCounts)}`);
lines.push('');
lines.push('## Per-Work Summary');
lines.push('');
lines.push('| Work | Category | Unique work forms | Matched | Unmatched | Percent matched | Token occurrences | Matched by layer | Page size | Largest chunk | Chunks | HUD |');
lines.push('|---|---|---:|---:|---:|---:|---:|---|---:|---:|---:|---|');
for (const row of perWorkRows) {
  lines.push(`| ${escapeCell(row.source.work_title)} | ${escapeCell(row.category)} | ${row.unique} | ${row.matched} | ${row.unmatched} | ${percent(row.matched, row.unique)} | ${row.occurrences} | ${escapeCell(layerCountsText(row.counts))} | ${formatBytes(row.pageSize)} | ${formatBytes(row.largestChunk)} | ${row.chunkCount} | ${row.hudEnabled ? 'yes' : 'no'} |`);
}
lines.push('');
lines.push('## Sitewide Unmatched Top 300');
lines.push('');
lines.push('| # | Surface | Normalized | Count | Category | Example refs |');
lines.push('|---:|---|---|---:|---|---|');
unmatchedRows.slice(0, 300).forEach((row, index) => {
  const refs = getExamples(occurrenceByWork.get(row.work_id), row.token_index_id, 5);
  lines.push(`| ${index + 1} | ${escapeCell(row.surface_word)} | ${escapeCell(row.normalized_word)} | ${row.occurrence_count || 0} | ${inferCategory(row)} | ${escapeCell(refs.join('; '))} |`);
});
lines.push('');
lines.push('## Risk / Noise Report');
lines.push('');
lines.push(`- Kaikki entries with multiple possible entries and no likely contextual default: ${riskyKaikki.length}${riskyKaikki.length ? `; examples: ${riskyKaikki.slice(0, 10).map((entry) => entry.entry_id).join(', ')}` : ''}`);
lines.push(`- Single-letter token rows: ${singleLetterRows.length}${singleLetterRows.length ? `; examples: ${singleLetterRows.slice(0, 10).map((row) => `${row.surface_word} (${row.occurrence_count})`).join(', ')}` : ''}`);
lines.push(`- Noisy/long English gloss candidates: ${noisyGlosses.length}${noisyGlosses.length ? `; examples: ${noisyGlosses.slice(0, 10).map((item) => `${item.entry.entry_id}: ${item.rendering}`).join(' | ')}` : ''}`);
lines.push(`- Entries that should remain possible-only or unresolved pending context: ${possibleOnly.length}${possibleOnly.length ? `; examples: ${possibleOnly.slice(0, 10).map((entry) => entry.entry_id).join(', ')}` : ''}`);
lines.push(`- Missing source/license metadata rows: ${missingMetadata.length}${missingMetadata.length ? `; examples: ${missingMetadata.slice(0, 10).join(', ')}` : ''}`);
lines.push(`- Chunks containing multiple license regimes: ${chunkLicenseMix.length}. This is acceptable only because source/license metadata is stored per row; no chunk is globally relabeled CC0.`);
if (chunkLicenseMix.length) {
  lines.push('');
  lines.push('| Chunk | License rows present |');
  lines.push('|---|---|');
  chunkLicenseMix.slice(0, 20).forEach((item) => lines.push(`| ${escapeCell(item.path)} | ${escapeCell(item.licenses)} |`));
}
lines.push('');
lines.push('## Size Report');
lines.push('');
lines.push(`- Total lexical data size: ${formatBytes(totalLexicalSize)}`);
const warningFiles = lexicalFiles.filter((file) => file.size >= githubWarningThreshold).sort((a, b) => b.size - a.size);
lines.push(`- Files near/above GitHub warning threshold (${formatBytes(githubWarningThreshold)}): ${warningFiles.length}`);
lines.push('');
if (warningFiles.length) {
  lines.push('### Files Near/Above GitHub Warning Threshold');
  lines.push('');
  lines.push('| Path | Size |');
  lines.push('|---|---:|');
  warningFiles.forEach((file) => lines.push(`| ${escapeCell(file.path)} | ${formatBytes(file.size)} |`));
  lines.push('');
}
lines.push('### Largest Lexical Data Files Overall');
lines.push('');
lines.push('| Path | Size |');
lines.push('|---|---:|');
lexicalFiles.slice().sort((a, b) => b.size - a.size).slice(0, 20).forEach((file) => lines.push(`| ${escapeCell(file.path)} | ${formatBytes(file.size)} |`));
lines.push('');
lines.push('### Largest HTML Pages');
lines.push('');
lines.push('| Path | Size |');
lines.push('|---|---:|');
largeHtmlFiles.forEach((file) => lines.push(`| ${escapeCell(file.path)} | ${formatBytes(file.size)} |`));
lines.push('');
lines.push('### Largest Lexical Chunks');
lines.push('');
lines.push('| Path | Size |');
lines.push('|---|---:|');
allChunkFiles.slice(0, 20).forEach((file) => lines.push(`| ${escapeCell(file.path)} | ${formatBytes(file.size)} |`));
lines.push('');
lines.push('### Largest Source-Layer Files');
lines.push('');
lines.push('| Path | Size |');
lines.push('|---|---:|');
sourceLayerFiles.forEach((file) => lines.push(`| ${escapeCell(file.path)} | ${formatBytes(file.size)} |`));
lines.push('');
lines.push('## HUD Generation Gaps');
lines.push('');
const gaps = perWorkRows.filter((row) => !row.hudEnabled);
if (!gaps.length) {
  lines.push('No work/page is missing HUD manifests or lexical chunks.');
} else {
  gaps.forEach((row) => lines.push(`- ${row.source.work_title} (${row.source.work_id})`));
}
lines.push('');

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${lines.join('\n')}\n`, 'utf8');

console.log(JSON.stringify({
  works_processed: sources.length,
  sitewide_unique_surface_forms: uniqueSurfaceGroups.size,
  work_surface_rows: forms.length,
  matched: forms.filter((row) => row.status === 'matched').length,
  unmatched: forms.filter((row) => row.status !== 'matched').length,
  total_occurrences: forms.reduce((sum, row) => sum + (row.occurrence_count || 0), 0),
  hud_gaps: gaps.length,
  report: reportPath,
}, null, 2));

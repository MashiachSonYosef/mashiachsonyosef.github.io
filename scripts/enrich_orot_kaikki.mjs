import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const lexicalDir = 'data/lexical';
const cachePath = path.join(lexicalDir, '.cache', 'kaikki.org-dictionary-Hebrew.jsonl');
const tokenIndexPath = path.join(lexicalDir, 'token-index.json');
const layerPath = path.join(lexicalDir, 'source-layers', 'kaikki-wiktionary-cc-by-sa-gfdl.json');
const manifestPath = path.join(lexicalDir, 'lexicon.json');
const occurrencePath = path.join(lexicalDir, 'occurrences', 'orot.json');
const reportPath = path.join('reports', 'orot-kaikki-enrichment-report.md');

const HEBREW_RE = /[\u0590-\u05FF]/;
const HEBREW_MARKS_RE = /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/g;
const FINAL_LETTERS = new Map([
  ['\u05DA', '\u05DB'],
  ['\u05DD', '\u05DE'],
  ['\u05DF', '\u05E0'],
  ['\u05E3', '\u05E4'],
  ['\u05E5', '\u05E6'],
]);

const KAIKKI_SOURCE_NAME = 'Wiktionary via Kaikki';
const KAIKKI_SOURCE_FAMILY = 'kaikki';
const KAIKKI_LICENSE = 'CC BY-SA 4.0 / GFDL';
const KAIKKI_SOURCE_URL = 'https://kaikki.org/dictionary/Hebrew/index.html';
const KAIKKI_DATA_URL = 'https://kaikki.org/dictionary/Hebrew/kaikki.org-dictionary-Hebrew.jsonl';
const KAIKKI_LICENSE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function stableId(prefix, value) {
  return `${prefix}-${crypto.createHash('sha1').update(value).digest('hex').slice(0, 12)}`;
}

function normalizeHebrew(value) {
  return String(value || '')
    .normalize('NFC')
    .replace(HEBREW_MARKS_RE, '')
    .replace(/[\u05DA\u05DD\u05DF\u05E3\u05E5]/g, (char) => FINAL_LETTERS.get(char) || char)
    .replace(/\u05F3/g, "'")
    .replace(/\u05F4/g, '"')
    .replace(/[\u05BE\s]+$/g, '')
    .trim();
}

function isHebrewForm(value) {
  return typeof value === 'string' && HEBREW_RE.test(value);
}

function cleanGloss(value) {
  let gloss = String(value || '').trim();
  if (!gloss) return '';
  gloss = gloss.replace(/\s+/g, ' ');
  if (!gloss || gloss.length > 100) return '';
  if (/[{}\[\]|]/.test(gloss)) return '';
  if (/^(defective spelling|alternative form|misspelling|nonstandard|pronunciation spelling|form of|plural of|construct of)/i.test(gloss)) {
    return '';
  }
  return gloss;
}

function hasFormOnlyTags(sense) {
  const tags = new Set((sense?.tags || []).map((tag) => String(tag).toLowerCase()));
  for (const tag of ['alt-of', 'form-of', 'misspelling', 'nonstandard', 'obsolete']) {
    if (tags.has(tag)) return true;
  }
  return false;
}

function extractGlosses(entry) {
  const glosses = [];
  for (const sense of entry.senses || []) {
    if (hasFormOnlyTags(sense)) continue;
    for (const rawGloss of sense.glosses || []) {
      const gloss = cleanGloss(rawGloss);
      if (gloss && !glosses.includes(gloss)) glosses.push(gloss);
      if (glosses.length >= 4) return glosses;
    }
  }
  return glosses;
}

function extractRomanization(entry) {
  const candidates = [];
  for (const form of entry.forms || []) {
    const tags = new Set((form.tags || []).map((tag) => String(tag).toLowerCase()));
    if (tags.has('romanization') && typeof form.form === 'string') candidates.push(form.form.trim());
  }
  for (const template of entry.head_templates || []) {
    if (template?.args?.tr) candidates.push(String(template.args.tr).trim());
  }
  return candidates.find(Boolean) || '';
}

function getEntryForms(entry) {
  const forms = new Set();
  if (isHebrewForm(entry.word)) forms.add(entry.word);
  for (const form of entry.forms || []) {
    if (isHebrewForm(form.form)) forms.add(form.form);
  }
  return forms;
}

function examplesByTokenId(occurrences) {
  const examples = new Map();
  for (const unit of Object.values(occurrences.units || {})) {
    const seen = new Set();
    for (const paragraph of unit.paragraphs || []) {
      for (const tokenId of paragraph.token_index_ids || []) seen.add(tokenId);
    }
    for (const tokenId of seen) {
      const refs = examples.get(tokenId) || [];
      if (refs.length < 3 && unit.source_ref && !refs.includes(unit.source_ref)) refs.push(unit.source_ref);
      examples.set(tokenId, refs);
    }
  }
  return examples;
}

function layerFamilies(entry) {
  return new Set((entry?.source_rows || [])
    .map((row) => row.source_family || row.source_name)
    .filter(Boolean));
}

function countLayers(forms, entriesById) {
  const matched = forms.filter((row) => row.status === 'matched');
  return {
    project_overrides: matched.filter((row) => layerFamilies(entriesById.get(row.lexicon_entry_id)).has('workspace')).length,
    wikidata_cc0: matched.filter((row) => layerFamilies(entriesById.get(row.lexicon_entry_id)).has('wikidata')).length,
    openscriptures_cc_by_4: matched.filter((row) => layerFamilies(entriesById.get(row.lexicon_entry_id)).has('openscriptures')).length,
    parser_affix_resolution: matched.filter((row) => row.match_method === 'affix_parser').length,
    kaikki_wiktionary_cc_by_sa_gfdl: matched.filter((row) => {
      const families = layerFamilies(entriesById.get(row.lexicon_entry_id));
      return families.has('kaikki') || families.has('wiktionary');
    }).length,
  };
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function makeCandidate(rawEntry, matchedKeys) {
  const sourceId = stableId('kaikki', `${rawEntry.word}|${rawEntry.pos || ''}|${rawEntry.etymology_number || ''}|${(rawEntry.senses || []).map((sense) => sense.id || '').join('|')}`);
  const rowKey = `${KAIKKI_SOURCE_FAMILY}|${sourceId}`;
  const glosses = extractGlosses(rawEntry);
  return {
    sourceId,
    rowKey,
    word: rawEntry.word,
    pos: rawEntry.pos || '',
    transliteration: extractRomanization(rawEntry),
    glosses,
    matchedKeys: [...matchedKeys].sort(),
    sourceRow: {
      source_name: KAIKKI_SOURCE_NAME,
      source_family: KAIKKI_SOURCE_FAMILY,
      source_id: sourceId,
      source_url: KAIKKI_SOURCE_URL,
      license: KAIKKI_LICENSE,
      license_url: KAIKKI_LICENSE_URL,
      fields_used: [
        'Hebrew lemma/form fields',
        'Wiktionary glosses via Kaikki JSONL',
      ],
      notes: `Separated optional Wiktionary layer. Source data file: ${KAIKKI_DATA_URL}. Context is not resolved by this row.`,
    },
  };
}

async function collectKaikkiCandidates(targetByNormalized) {
  if (!fs.existsSync(cachePath)) {
    throw new Error(`Missing Kaikki cache file: ${cachePath}`);
  }

  const candidatesByKey = new Map();
  const input = fs.createReadStream(cachePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input, crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line.trim()) continue;
    let rawEntry;
    try {
      rawEntry = JSON.parse(line);
    } catch {
      continue;
    }
    if (rawEntry.lang_code !== 'he') continue;
    const glosses = extractGlosses(rawEntry);
    if (!glosses.length) continue;

    const matchedKeys = new Set();
    for (const form of getEntryForms(rawEntry)) {
      const normalized = normalizeHebrew(form);
      if (targetByNormalized.has(normalized)) matchedKeys.add(normalized);
    }
    if (!matchedKeys.size) continue;

    const candidate = makeCandidate({ ...rawEntry, senses: rawEntry.senses, glosses }, matchedKeys);
    candidate.glosses = glosses;
    for (const key of matchedKeys) {
      if (!candidatesByKey.has(key)) candidatesByKey.set(key, []);
      const candidates = candidatesByKey.get(key);
      if (!candidates.some((existing) => existing.sourceId === candidate.sourceId)) candidates.push(candidate);
    }
  }

  return candidatesByKey;
}

function makeAggregateEntry(normalizedKey, tokenRows, candidates) {
  const entryId = stableId('lex-kaikki', normalizedKey);
  const sourceRows = candidates.map((candidate) => candidate.sourceRow);
  const possibleEntries = candidates.map((candidate) => ({
    entry_key: `kaikki:${candidate.sourceId}`,
    lemma: candidate.word,
    match_key: normalizedKey,
    source_name: KAIKKI_SOURCE_NAME,
    source_family: KAIKKI_SOURCE_FAMILY,
    source_id: candidate.sourceId,
    transliteration: candidate.transliteration,
    strict_renderings: candidate.glosses,
    root: '',
    root_transliteration: '',
    root_meaning: [],
    context_role: 'other_possible',
    relation_label: candidate.pos ? `possible ${candidate.pos}` : 'possible Wiktionary entry',
    source_row_keys: [candidate.rowKey],
  }));

  const strictRenderings = candidates.length === 1 ? candidates[0].glosses : [];
  const surfaceForms = [...new Set(tokenRows.map((row) => row.surface_word).filter(Boolean))].sort();

  return {
    entry_id: entryId,
    hebrew_word: normalizedKey,
    surface_forms: surfaceForms,
    transliteration: candidates.length === 1 ? candidates[0].transliteration : '',
    strict_renderings: strictRenderings,
    root: '',
    root_transliteration: '',
    root_meaning: [],
    disambiguation_status: 'possible',
    context_note: 'Possible Wiktionary/Kaikki lexical match. Context not resolved.',
    possible_entries_truncated: 0,
    possible_entries: possibleEntries,
    source_rows: sourceRows,
  };
}

function updateManifest(manifest, layerEntryCount) {
  const layer = (manifest.layer_files || []).find((item) => item.layer_id === 'kaikki-wiktionary-cc-by-sa-gfdl');
  if (!layer) throw new Error('Lexicon manifest is missing the Kaikki/Wiktionary source layer.');
  layer.status = layerEntryCount > 0 ? 'active' : 'placeholder';
  layer.entries = layerEntryCount;
  layer.description = 'Optional separated Wiktionary lexical enrichment imported via Kaikki. Data remains CC BY-SA 4.0 / GFDL and is not part of the CC0 English overlay.';
  manifest.generated_at = new Date().toISOString();
}

function writeReport({ beforeMatched, afterMatched, forms, layerCounts, newlyMatchedRows, examples, entries, sizes }) {
  const unmatched = forms.filter((row) => row.status !== 'matched');
  const top50 = unmatched
    .slice()
    .sort((a, b) => (b.occurrence_count || 0) - (a.occurrence_count || 0) || String(a.surface_word).localeCompare(String(b.surface_word), 'he'))
    .slice(0, 50);
  const sampleRows = newlyMatchedRows
    .slice()
    .sort((a, b) => (b.occurrence_count || 0) - (a.occurrence_count || 0) || String(a.surface_word).localeCompare(String(b.surface_word), 'he'))
    .slice(0, 20);

  const lines = [];
  lines.push('# Orot Kaikki/Wiktionary Lexical Enrichment Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Scope');
  lines.push('');
  lines.push('- Work: Orot only');
  lines.push('- Source added: Hebrew Wiktionary entries via Kaikki JSONL');
  lines.push('- License: CC BY-SA 4.0 / GFDL');
  lines.push('- License separation: Kaikki rows remain in `data/lexical/source-layers/kaikki-wiktionary-cc-by-sa-gfdl.json`');
  lines.push('- Hebrew source text changed: no');
  lines.push('- Overlay/export data changed: no');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Matched before Kaikki: ${beforeMatched}`);
  lines.push(`- Newly matched by Kaikki: ${newlyMatchedRows.length}`);
  lines.push(`- Total matched after Kaikki: ${afterMatched}`);
  lines.push(`- Unmatched after Kaikki: ${unmatched.length}`);
  lines.push(`- Total unique Orot surface forms: ${forms.length}`);
  lines.push('');
  lines.push('## Matched By Layer');
  lines.push('');
  lines.push('| Layer | Count |');
  lines.push('|---|---:|');
  lines.push(`| Project overrides | ${layerCounts.project_overrides} |`);
  lines.push(`| Wikidata CC0 | ${layerCounts.wikidata_cc0} |`);
  lines.push(`| OpenScriptures CC BY 4.0 | ${layerCounts.openscriptures_cc_by_4} |`);
  lines.push(`| Parser/affix resolution | ${layerCounts.parser_affix_resolution} |`);
  lines.push(`| Kaikki/Wiktionary CC BY-SA/GFDL | ${layerCounts.kaikki_wiktionary_cc_by_sa_gfdl} |`);
  lines.push('');
  lines.push('## Size Impact');
  lines.push('');
  lines.push(`- Kaikki source layer size: ${sizes.kaikkiLayerBytes.toLocaleString()} bytes`);
  lines.push(`- Orot page size: ${sizes.orotPageBytes.toLocaleString()} bytes`);
  lines.push(`- Largest Orot lexical chunk: ${sizes.largestChunkBytes.toLocaleString()} bytes`);
  lines.push('');
  lines.push('## 20 Sample Kaikki-Resolved Entries');
  lines.push('');
  lines.push('| # | Surface form | Normalized form | Count | Renderings | Example refs |');
  lines.push('|---:|---|---|---:|---|---|');
  sampleRows.forEach((row, index) => {
    const entry = entries.get(row.lexicon_entry_id);
    const renderings = (row.surface_renderings?.length ? row.surface_renderings : entry?.strict_renderings || []).join('; ');
    lines.push(`| ${index + 1} | ${escapeCell(row.surface_word)} | ${escapeCell(row.normalized_word)} | ${row.occurrence_count || 0} | ${escapeCell(renderings || 'N/A')} | ${escapeCell((examples.get(row.token_index_id) || [row.first_source_ref].filter(Boolean)).join('; '))} |`);
  });
  lines.push('');
  lines.push('## Top 50 Still Unmatched');
  lines.push('');
  lines.push('| # | Surface form | Normalized form | Count | Example refs |');
  lines.push('|---:|---|---|---:|---|');
  top50.forEach((row, index) => {
    lines.push(`| ${index + 1} | ${escapeCell(row.surface_word)} | ${escapeCell(row.normalized_word)} | ${row.occurrence_count || 0} | ${escapeCell((examples.get(row.token_index_id) || [row.first_source_ref].filter(Boolean)).join('; '))} |`);
  });
  lines.push('');

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
}

async function main() {
  const tokenIndex = readJson(tokenIndexPath);
  const occurrences = readJson(occurrencePath);
  const manifest = readJson(manifestPath);

  const forms = tokenIndex.forms || [];
  for (const row of forms) {
    if (row.match_method === 'kaikki' || String(row.lexicon_entry_id || '').startsWith('lex-kaikki-')) {
      row.status = 'unmatched';
      row.match_method = 'unmatched';
      row.lexicon_entry_id = '';
      row.surface_context_status = '';
      row.surface_context_note = '';
      row.surface_renderings = [];
      if (!Array.isArray(row.breakdown)) row.breakdown = [];
    }
  }
  const beforeMatched = forms.filter((row) => row.status === 'matched').length;
  const unmatched = forms.filter((row) => row.status !== 'matched');
  const targetByNormalized = new Map();
  for (const row of unmatched) {
    if (!row.normalized_word) continue;
    if (!targetByNormalized.has(row.normalized_word)) targetByNormalized.set(row.normalized_word, []);
    targetByNormalized.get(row.normalized_word).push(row);
  }

  const candidatesByKey = await collectKaikkiCandidates(targetByNormalized);
  const entries = [];
  const entriesById = new Map();
  const newlyMatchedRows = [];

  for (const [normalizedKey, candidates] of [...candidatesByKey.entries()].sort((a, b) => a[0].localeCompare(b[0], 'he'))) {
    const tokenRows = targetByNormalized.get(normalizedKey) || [];
    if (!tokenRows.length || !candidates.length) continue;
    const entry = makeAggregateEntry(normalizedKey, tokenRows, candidates);
    entries.push(entry);
    entriesById.set(entry.entry_id, entry);
    for (const row of tokenRows) {
      row.status = 'matched';
      row.match_method = 'kaikki';
      row.lexicon_entry_id = entry.entry_id;
      row.surface_context_status = 'possible_kaikki_match';
      row.surface_context_note = 'Possible Wiktionary/Kaikki lexical match. Context not resolved.';
      row.surface_renderings = entry.strict_renderings || [];
      if (!Array.isArray(row.breakdown)) row.breakdown = [];
      newlyMatchedRows.push(row);
    }
  }

  const layer = {
    schema_version: 1,
    layer_id: 'kaikki-wiktionary-cc-by-sa-gfdl',
    source_family: KAIKKI_SOURCE_FAMILY,
    license: KAIKKI_LICENSE,
    status: entries.length > 0 ? 'active' : 'placeholder',
    source_url: KAIKKI_SOURCE_URL,
    data_url: KAIKKI_DATA_URL,
    license_url: KAIKKI_LICENSE_URL,
    description: 'Optional separated Hebrew Wiktionary lexical enrichment imported via Kaikki. These rows are CC BY-SA 4.0 / GFDL and are not part of the CC0 English overlay.',
    generated_at: new Date().toISOString(),
    entries,
  };
  writeJson(layerPath, layer);

  const afterMatched = forms.filter((row) => row.status === 'matched').length;
  tokenIndex.generated_at = new Date().toISOString();
  tokenIndex.matched_surface_forms = afterMatched;
  tokenIndex.unmatched_surface_forms = forms.length - afterMatched;
  tokenIndex.matched_kaikki_surface_forms = newlyMatchedRows.length;
  tokenIndex.kaikki_source_layer = 'data/lexical/source-layers/kaikki-wiktionary-cc-by-sa-gfdl.json';
  writeJson(tokenIndexPath, tokenIndex);

  updateManifest(manifest, entries.length);
  writeJson(manifestPath, manifest);

  const allEntriesById = new Map(entriesById);
  for (const layerFile of manifest.layer_files || []) {
    if (!layerFile.path || layerFile.layer_id === 'kaikki-wiktionary-cc-by-sa-gfdl') continue;
    const sourceLayer = readJson(path.join(lexicalDir, layerFile.path));
    for (const entry of sourceLayer.entries || []) allEntriesById.set(entry.entry_id, entry);
  }
  for (const entry of entries) allEntriesById.set(entry.entry_id, entry);

  const examples = examplesByTokenId(occurrences);
  const layerCounts = countLayers(forms, allEntriesById);
  const chunkDir = path.join(lexicalDir, 'orot-chunks');
  const chunkSizes = fs.existsSync(chunkDir)
    ? fs.readdirSync(chunkDir).filter((name) => name.endsWith('.json')).map((name) => fs.statSync(path.join(chunkDir, name)).size)
    : [0];
  const sizes = {
    kaikkiLayerBytes: fs.statSync(layerPath).size,
    orotPageBytes: fs.existsSync(path.join('orot', 'index.html')) ? fs.statSync(path.join('orot', 'index.html')).size : 0,
    largestChunkBytes: Math.max(...chunkSizes, 0),
  };
  writeReport({
    beforeMatched,
    afterMatched,
    forms,
    layerCounts,
    newlyMatchedRows,
    examples,
    entries: allEntriesById,
    sizes,
  });

  console.log(JSON.stringify({
    beforeMatched,
    newlyMatchedByKaikki: newlyMatchedRows.length,
    afterMatched,
    unmatchedAfterKaikki: forms.length - afterMatched,
    layerEntries: entries.length,
    report: reportPath,
  }, null, 2));
}

await main();

#!/usr/bin/env node
/**
 * Route-local lexical payload writer.
 *
 * This mirrors render_site.ps1's Write-WorkLexicalPayloadFiles output without
 * re-rendering HTML. It is intentionally narrow: token indexes and source-layer
 * files must already exist, and the script only writes per-work manifests/chunks.
 */
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const lexicalDir = path.join(repoRoot, 'data', 'lexical');
const maxFormsPerChunkDefault = 1000;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value)}\n`, 'utf8');
}

function parseArgs(argv) {
  const args = {
    workIds: [],
    workIdsPath: '',
    lexicalDir,
    chunkSize: maxFormsPerChunkDefault,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--work-id') {
      args.workIds.push(argv[++i]);
    } else if (arg === '--work-ids-path') {
      args.workIdsPath = argv[++i];
    } else if (arg === '--lexical-dir') {
      args.lexicalDir = path.resolve(argv[++i]);
    } else if (arg === '--chunk-size') {
      args.chunkSize = Number(argv[++i]);
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (args.workIdsPath) {
    const fromFile = fs.readFileSync(args.workIdsPath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    args.workIds.push(...fromFile);
  }

  args.workIds = [...new Set(args.workIds.filter(Boolean))];
  if (!Number.isFinite(args.chunkSize) || args.chunkSize < 1) {
    throw new Error(`Invalid --chunk-size: ${args.chunkSize}`);
  }
  return args;
}

function usage() {
  return [
    'Usage:',
    '  node scripts/write_lexical_payloads.mjs --work-id orot',
    '  node scripts/write_lexical_payloads.mjs --work-ids-path .codex-tmp/work-ids.txt',
    '',
    'Options:',
    '  --lexical-dir data/lexical',
    '  --chunk-size 1000',
  ].join('\n');
}

function sourceRowKey(row) {
  if (!row) return '';
  return `${row.source_family || ''}|${row.source_id || ''}`;
}

function entrySourceKeys(entry) {
  const keys = [];
  for (const key of entry?.source_row_keys || []) {
    if (key) keys.push(String(key));
  }
  if (entry?.source_family || entry?.source_id) {
    keys.push(`${entry.source_family || ''}|${entry.source_id || ''}`);
  }
  return [...new Set(keys.filter((key) => key && key !== '|'))];
}

function isExcludedOtherLexicalEntry(entry) {
  if (entry?.context_role === 'likely_contextual') return false;
  const renderingText = [
    entry?.lemma,
    entry?.match_key,
    entry?.source_id,
    ...(entry?.strict_renderings || []),
  ].filter(Boolean).join(' ').toLowerCase();
  return [
    /tibetan/,
    /lama, title/,
    /fastener/,
    /threaded hole/,
    /\bnut\b/,
    /metheg-ha-ammah/,
    /epithet of gath/,
    /hill in palestine/,
    /\bpalestine\b/,
  ].some((pattern) => pattern.test(renderingText));
}

function fallbackSourceRow(entry) {
  if (!entry || (!entry.source_family && !entry.source_id)) return null;
  const family = String(entry.source_family || '');
  const sourceId = String(entry.source_id || '');
  if (!sourceId) return null;

  if (family === 'wikidata') {
    return {
      source_name: entry.source_name || 'Wikidata Lexeme',
      source_family: 'wikidata',
      source_id: sourceId,
      source_url: `https://www.wikidata.org/wiki/Lexeme:${sourceId}`,
      license: 'CC0',
      license_url: 'https://www.wikidata.org/wiki/Wikidata:Licensing',
      fields_used: ['lemma/form coverage', 'English sense glosses or sense-item labels where available'],
      notes: 'Fallback source row reconstructed from rendered lexical candidate metadata.',
    };
  }

  if (family === 'openscriptures') {
    const sourceName = entry.source_name || 'OpenScriptures HebrewLexicon';
    const sourceUrl = /morphHB/.test(sourceName)
      ? 'https://github.com/openscriptures/morphhb/tree/master/wlc'
      : 'https://github.com/openscriptures/HebrewLexicon/blob/master/HebrewStrong.xml';
    return {
      source_name: sourceName,
      source_family: 'openscriptures',
      source_id: sourceId,
      source_url: sourceUrl,
      license: 'CC BY 4.0',
      license_url: 'https://creativecommons.org/licenses/by/4.0/',
      fields_used: ['lexical candidate metadata'],
      notes: 'Fallback source row reconstructed from rendered lexical candidate metadata.',
    };
  }

  if (family === 'kaikki' || family === 'wiktionary') {
    return {
      source_name: entry.source_name || 'Wiktionary via Kaikki',
      source_family: family,
      source_id: sourceId,
      source_url: 'https://kaikki.org/dictionary/Hebrew/index.html',
      license: 'CC BY-SA 4.0 / GFDL',
      license_url: 'https://creativecommons.org/licenses/by-sa/4.0/',
      fields_used: ['lexical candidate metadata'],
      notes: 'Fallback source row reconstructed from rendered lexical candidate metadata.',
    };
  }

  return {
    source_name: entry.source_name || 'Lexical candidate source',
    source_family: family,
    source_id: sourceId,
    source_url: '',
    license: 'source metadata incomplete',
    license_url: '',
    fields_used: ['lexical candidate metadata'],
    notes: 'Rendered candidate carried a source id, but no full cached source/license row was available. Treat as caution/incomplete metadata.',
  };
}

function addFallbackSourceRows(sourceRows, entries) {
  const rows = [...(sourceRows || [])];
  const known = new Set(rows.map(sourceRowKey).filter(Boolean));
  for (const entry of entries || []) {
    const key = sourceRowKey(entry);
    if (!key || known.has(key)) continue;
    const fallback = fallbackSourceRow(entry);
    if (!fallback) continue;
    rows.push(fallback);
    known.add(key);
  }
  return rows;
}

function selectSourceRows(sourceRows, keys) {
  const keySet = new Set((keys || []).filter(Boolean).map(String));
  return (sourceRows || []).filter((row) => {
    const key = sourceRowKey(row);
    return key && keySet.has(key);
  });
}

function compactEntry(entry) {
  const rawPossibleEntries = (entry.possible_entries || [])
    .filter((candidate) => !isExcludedOtherLexicalEntry(candidate));
  const primaryEntries = rawPossibleEntries.filter((candidate) => (
    candidate.context_role === 'likely_contextual'
      || (
        candidate.source_family !== 'kaikki'
        && candidate.source_family !== 'wiktionary'
        && (candidate.match_key === entry.hebrew_word || candidate.lemma === entry.hebrew_word)
      )
  ));
  const primaryEntryKeys = new Set(primaryEntries.map((candidate) => candidate.entry_key).filter(Boolean));
  const secondaryEntries = rawPossibleEntries.filter((candidate) => (
    !(candidate.entry_key && primaryEntryKeys.has(candidate.entry_key))
  ));
  const selectionSourceRows = addFallbackSourceRows(entry.source_rows || [], rawPossibleEntries);
  let primarySourceRows = selectSourceRows(
    selectionSourceRows,
    primaryEntries.flatMap((candidate) => entrySourceKeys(candidate)),
  );
  const secondarySourceRows = selectSourceRows(
    selectionSourceRows,
    secondaryEntries.flatMap((candidate) => entrySourceKeys(candidate)),
  );

  if (!primarySourceRows.length && (entry.strict_renderings || []).length) {
    primarySourceRows = selectionSourceRows.filter((row) => (
      row.source_family === 'kaikki' || row.source_family === 'wiktionary'
    ));
  }

  return {
    entry_id: entry.entry_id,
    hebrew_word: entry.hebrew_word,
    strict_renderings: entry.strict_renderings || [],
    disambiguation_status: entry.disambiguation_status || '',
    context_note: entry.context_note || '',
    possible_entries: rawPossibleEntries.map((candidate) => ({
      entry_key: candidate.entry_key || '',
      lemma: candidate.lemma || '',
      match_key: candidate.match_key || '',
      source_name: candidate.source_name || '',
      source_family: candidate.source_family || '',
      source_id: candidate.source_id || '',
      strict_renderings: candidate.strict_renderings || [],
      context_role: candidate.context_role || '',
      relation_label: candidate.relation_label || '',
    })),
    source_rows: primarySourceRows,
    secondary_source_rows: secondarySourceRows,
  };
}

function loadLexiconEntries(lexicalRoot) {
  const manifestPath = path.join(lexicalRoot, 'lexicon.json');
  const manifest = readJson(manifestPath);
  const entriesById = new Map();
  for (const layer of manifest.layer_files || []) {
    if (!layer.path) continue;
    const layerPath = path.join(lexicalRoot, layer.path);
    const layerJson = readJson(layerPath);
    for (const entry of layerJson.entries || []) {
      if (entry.entry_id) entriesById.set(String(entry.entry_id), entry);
    }
  }
  return { generatedAt: manifest.generated_at || null, entriesById };
}

function normalizeFormForPayload(form) {
  return {
    token_index_id: form.token_index_id || '',
    surface_word: form.surface_word || '',
    normalized_word: form.normalized_word || '',
    lexicon_entry_id: form.lexicon_entry_id || '',
    status: form.status || '',
    surface_renderings: form.surface_renderings || [],
    surface_context_status: form.surface_context_status || '',
    surface_context_note: form.surface_context_note || '',
    breakdown: (form.breakdown || []).map((part) => ({
      hebrew: part.hebrew || '',
      strict_renderings: part.strict_renderings || [],
    })),
  };
}

function makeSourceRowIds(sourceRowsById, sourceRowIdsByKey, rows) {
  const ids = [];
  for (const row of rows || []) {
    if (!row) continue;
    const key = `${row.source_family || ''}|${row.source_id || ''}|${row.license || ''}`;
    if (!sourceRowIdsByKey.has(key)) {
      sourceRowIdsByKey.set(key, key);
      sourceRowsById[key] = row;
    }
    ids.push(sourceRowIdsByKey.get(key));
  }
  return ids;
}

function findTokenIndexPath(lexicalRoot, workId) {
  const directPath = path.join(lexicalRoot, 'token-indexes', `${workId}.json`);
  if (fs.existsSync(directPath)) return directPath;

  const tokenIndexRoot = path.join(lexicalRoot, 'token-indexes');
  const stack = [tokenIndexRoot];
  while (stack.length) {
    const current = stack.pop();
    if (!current || !fs.existsSync(current)) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.isFile() && entry.name === `${workId}.json`) {
        return entryPath;
      }
    }
  }
  return '';
}

function writeWorkPayload({ workId, lexicalRoot, chunkSize, entriesById }) {
  const actualTokenIndexPath = findTokenIndexPath(lexicalRoot, workId);
  if (!fs.existsSync(actualTokenIndexPath)) {
    throw new Error(`Missing token index for ${workId}`);
  }

  const tokenIndex = readJson(actualTokenIndexPath);
  const forms = (tokenIndex.forms || [])
    .map(normalizeFormForPayload)
    .sort((a, b) => a.token_index_id.localeCompare(b.token_index_id));
  const compactEntriesById = new Map();
  for (const form of forms) {
    if (!form.lexicon_entry_id || compactEntriesById.has(form.lexicon_entry_id)) continue;
    const entry = entriesById.get(String(form.lexicon_entry_id));
    if (!entry) continue;
    compactEntriesById.set(form.lexicon_entry_id, compactEntry(entry));
  }

  const chunkDir = path.join(lexicalRoot, `${workId}-chunks`);
  fs.mkdirSync(chunkDir, { recursive: true });
  for (const fileName of fs.readdirSync(chunkDir)) {
    if (fileName.endsWith('.json')) fs.unlinkSync(path.join(chunkDir, fileName));
  }

  const chunks = [];
  const tokenChunks = {};
  for (let start = 0; start < forms.length; start += chunkSize) {
    const chunkForms = forms.slice(start, start + chunkSize);
    const chunkNumber = Math.floor(start / chunkSize);
    const chunkId = `${workId}-${String(chunkNumber).padStart(3, '0')}`;
    const chunkEntryIds = new Set();

    for (const form of chunkForms) {
      if (form.token_index_id) tokenChunks[form.token_index_id] = chunkId;
      if (form.lexicon_entry_id) chunkEntryIds.add(form.lexicon_entry_id);
    }

    const sourceRows = {};
    const sourceRowIdsByKey = new Map();
    const entries = [...chunkEntryIds].sort().flatMap((entryId) => {
      const entry = compactEntriesById.get(entryId);
      if (!entry) return [];
      return [{
        entry_id: entry.entry_id,
        hebrew_word: entry.hebrew_word,
        strict_renderings: entry.strict_renderings,
        disambiguation_status: entry.disambiguation_status,
        context_note: entry.context_note,
        possible_entries: entry.possible_entries,
        source_row_ids: makeSourceRowIds(sourceRows, sourceRowIdsByKey, entry.source_rows),
        secondary_source_row_ids: makeSourceRowIds(sourceRows, sourceRowIdsByKey, entry.secondary_source_rows),
      }];
    });

    writeJson(path.join(chunkDir, `${chunkId}.json`), {
      schema_version: 1,
      chunk_id: chunkId,
      token_index: {
        schema_version: 1,
        forms: chunkForms,
      },
      lexicon: {
        schema_version: 1,
        entries,
      },
      source_rows: sourceRows,
    });

    chunks.push({
      chunk_id: chunkId,
      url: `${workId}-chunks/${chunkId}.json`,
      token_count: chunkForms.length,
      entry_count: entries.length,
    });
  }

  writeJson(path.join(lexicalRoot, `${workId}.manifest.json`), {
    schema_version: 1,
    work_id: workId,
    generated_at: tokenIndex.generated_at || null,
    chunks,
    token_chunks: tokenChunks,
  });

  return {
    work_id: workId,
    token_count: forms.length,
    chunk_count: chunks.length,
    entry_count: compactEntriesById.size,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  if (!args.workIds.length) {
    throw new Error(`No work ids supplied.\n${usage()}`);
  }

  const { entriesById } = loadLexiconEntries(args.lexicalDir);
  const results = args.workIds.map((workId) => writeWorkPayload({
    workId,
    lexicalRoot: args.lexicalDir,
    chunkSize: args.chunkSize,
    entriesById,
  }));
  console.log(JSON.stringify({
    generated_at: new Date().toISOString(),
    work_count: results.length,
    results,
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
}

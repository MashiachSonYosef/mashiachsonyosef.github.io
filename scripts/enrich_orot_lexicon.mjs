import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const sourcePath = 'data/sources/orot.json';
const lexicalDir = 'data/lexical';
const lexiconPath = path.join(lexicalDir, 'lexicon.json');
const reportPath = 'reports/orot-lexical-coverage-report.md';

const userAgent = 'translation-workspace/1.0 (Orot lexical coverage; local research workspace)';
const wikidataLicense = {
  license: 'CC0',
  license_url: 'https://www.wikidata.org/wiki/Wikidata:Licensing',
};
const openScripturesLicense = {
  license: 'CC BY 4.0',
  license_url: 'https://creativecommons.org/licenses/by/4.0/',
};

const tokenRe = /[\u05D0-\u05EA][\u0591-\u05C7\u05D0-\u05EA\u05F3\u05F4'"]*/gu;
const niqqudRe = /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/gu;
const finalLetters = new Map([
  ['\u05DA', '\u05DB'],
  ['\u05DD', '\u05DE'],
  ['\u05DF', '\u05E0'],
  ['\u05E3', '\u05E4'],
  ['\u05E5', '\u05E6'],
]);
const safePrefixes = new Set(['\u05D5', '\u05D1', '\u05DB', '\u05DC', '\u05DE', '\u05D4', '\u05E9']);
const curatedEntryIds = new Set([
  'lex-yhwh-h3068',
  'lex-ruach-h7307',
  'lex-aph-h639',
  'lex-mashiach-h4899',
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value, 'utf8');
}

function stableId(prefix, value) {
  return `${prefix}-${crypto.createHash('sha1').update(value).digest('hex').slice(0, 12)}`;
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function normalizeHebrewPunctuation(value) {
  return String(value || '')
    .replace(/([\u0590-\u05FF])'/gu, '$1\u05F3')
    .replace(/([\u0590-\u05FF])"(?=[\u0590-\u05FF])/gu, '$1\u05F4');
}

function normalizeHebrewToken(value) {
  const stripped = normalizeHebrewPunctuation(value).replace(niqqudRe, '').replace(/\//g, '');
  return Array.from(stripped, (char) => finalLetters.get(char) || char).join('');
}

function normalizeHebrewTokenWithQubutsMater(value) {
  const text = normalizeHebrewPunctuation(value).replace(/\//g, '');
  const output = [];
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (!/[\u05D0-\u05EA]/u.test(char)) continue;
    output.push(finalLetters.get(char) || char);
    let markIndex = index + 1;
    let hasQubuts = false;
    while (markIndex < text.length && /[\u0591-\u05C7]/u.test(text[markIndex])) {
      if (text[markIndex] === '\u05BB') hasQubuts = true;
      markIndex += 1;
    }
    if (hasQubuts && text[markIndex] !== '\u05D5') output.push('\u05D5');
  }
  return output.join('');
}

function hasAbbreviationMark(value) {
  return /[\u05F3\u05F4'"]/.test(value);
}

function isAutoMatchable(normalized) {
  return Boolean(normalized && normalized.length >= 2 && !hasAbbreviationMark(normalized));
}

function getTokens(text) {
  return Array.from(String(text || '').matchAll(tokenRe), (match) => normalizeHebrewPunctuation(match[0]));
}

function getCandidateNormals(normalized) {
  const candidates = [];
  if (!normalized) return candidates;
  if (hasAbbreviationMark(normalized)) return [normalized];
  if (normalized.startsWith('\u05DB\u05E9') && normalized.length > 3) {
    candidates.push(normalized.slice(2));
  }
  candidates.push(normalized);

  function collectStrips(value, depth) {
    if (depth >= 2) return [];
    if (value.length <= 3) return [];
    const first = value[0];
    if (!safePrefixes.has(first)) return [];
    const stripped = value.slice(1);
    if (stripped.length < 2) return [];
    const deeper = collectStrips(stripped, depth + 1);
    if (stripped[0] === '\u05E9' && deeper.length) {
      return [...deeper, stripped];
    }
    return [stripped, ...deeper];
  }

  candidates.push(...collectStrips(normalized, 0));
  return candidates;
}

function getCandidateNormalsForRecord(normalized, surfaceForms) {
  const candidates = [];
  for (const surface of surfaceForms || []) {
    const qubutsNormal = normalizeHebrewTokenWithQubutsMater(surface);
    if (qubutsNormal && qubutsNormal !== normalized) {
      candidates.push(...getCandidateNormals(qubutsNormal));
    }
  }
  candidates.push(...getCandidateNormals(normalized));
  return unique(candidates);
}

function decodeXmlEntities(value) {
  return String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function stripTags(value) {
  return decodeXmlEntities(String(value || '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function parseAttributes(tag) {
  const attrs = {};
  for (const match of tag.matchAll(/([A-Za-z_:.-]+)="([^"]*)"/g)) {
    attrs[match[1]] = decodeXmlEntities(match[2]);
  }
  return attrs;
}

async function fetchText(url) {
  const response = await fetchWithRetry(url);
  return response.text();
}

async function fetchJson(url) {
  const response = await fetchWithRetry(url);
  return response.json();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, attempts = 6) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': userAgent } });
      if (response.ok) return response;
      if (![429, 500, 502, 503, 504].includes(response.status)) {
        throw new Error(`Fetch failed ${response.status} ${response.statusText}: ${url}`);
      }
      const retryAfter = Number(response.headers.get('retry-after') || 0);
      const waitMs = retryAfter ? retryAfter * 1000 : Math.min(30000, 1500 * attempt * attempt);
      console.log(`  HTTP ${response.status}; retrying in ${Math.round(waitMs / 1000)}s`);
      await sleep(waitMs);
    } catch (error) {
      lastError = error;
      const waitMs = Math.min(30000, 1500 * attempt * attempt);
      if (attempt === attempts) break;
      console.log(`  Network error; retrying in ${Math.round(waitMs / 1000)}s: ${error.message}`);
      await sleep(waitMs);
    }
  }
  if (lastError) throw lastError;
  throw new Error(`Fetch failed after retries: ${url}`);
}

async function sparql(query) {
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`;
  return fetchJson(url);
}

function extractOrotForms() {
  const source = readJson(sourcePath);
  const formsByNormalized = new Map();
  let occurrences = 0;

  for (const unit of source.units || []) {
    for (const paragraph of unit.hebrew || []) {
      for (const surface of getTokens(paragraph)) {
        occurrences += 1;
        const normalized = normalizeHebrewToken(surface);
        if (!normalized) continue;
        if (!formsByNormalized.has(normalized)) {
          formsByNormalized.set(normalized, {
            normalized_word: normalized,
            surface_forms: new Map(),
            first_refs: new Map(),
            occurrence_count: 0,
            candidates: getCandidateNormals(normalized),
          });
        }
        const row = formsByNormalized.get(normalized);
        row.occurrence_count += 1;
        row.surface_forms.set(surface, (row.surface_forms.get(surface) || 0) + 1);
        if (!row.first_refs.has(surface)) {
          row.first_refs.set(surface, {
            surface_word: surface,
            source_ref: unit.source_ref,
            anchor_id: unit.anchor_id,
          });
        }
      }
    }
  }

  const records = Array.from(formsByNormalized.values()).map((row) => {
    const surfaceForms = Array.from(row.surface_forms.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'he'))
      .map(([surface_word, count]) => ({ surface_word, count }));
    return {
      ...row,
      surface_forms: surfaceForms,
      first_refs: Array.from(row.first_refs.values()),
      candidates: getCandidateNormalsForRecord(row.normalized_word, surfaceForms.map((surface) => surface.surface_word)),
    };
  });

  return { source, records, occurrences };
}

async function loadWikidataLexemes(candidateSet) {
  console.log('Loading Wikidata Hebrew lexeme ids...');
  const rows = [];
  const pageSize = 5000;
  for (let offset = 0; ; offset += pageSize) {
    const query = `PREFIX dct: <http://purl.org/dc/terms/>
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wikibase: <http://wikiba.se/ontology#>
SELECT ?lexeme ?lemma WHERE {
  ?lexeme dct:language wd:Q9288; wikibase:lemma ?lemma.
}
LIMIT ${pageSize}
OFFSET ${offset}`;
    const json = await sparql(query);
    const bindings = json.results?.bindings || [];
    rows.push(...bindings);
    console.log(`  Wikidata lexeme id page offset ${offset}: ${bindings.length}`);
    if (bindings.length < pageSize) break;
  }

  const selectedIds = new Set();
  for (const row of rows) {
    const id = row.lexeme?.value?.split('/').pop();
    const lemma = row.lemma?.value;
    if (!id || !lemma) continue;
    if (candidateSet.has(normalizeHebrewToken(lemma))) selectedIds.add(id);
  }

  console.log(`Fetching ${selectedIds.size} Wikidata lexemes with Orot candidate lemmas...`);
  const entities = [];
  const ids = Array.from(selectedIds).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${batch.join('|')}&format=json&props=lemmas|forms|senses|claims`;
    const json = await fetchJson(url);
    entities.push(...Object.values(json.entities || {}).filter((entity) => !entity.missing));
    if ((i / 50) % 10 === 0) console.log(`  Wikidata entity batch ${i + batch.length}/${ids.length}`);
    await sleep(250);
  }

  const senseItemIds = new Set();
  for (const entity of entities) {
    for (const sense of entity.senses || []) {
      for (const claim of sense.claims?.P5137 || []) {
        const qid = claim.mainsnak?.datavalue?.value?.id;
        if (qid) senseItemIds.add(qid);
      }
    }
  }

  const itemLabels = new Map();
  const qids = Array.from(senseItemIds).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  for (let i = 0; i < qids.length; i += 50) {
    const batch = qids.slice(i, i + 50);
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${batch.join('|')}&format=json&props=labels&languages=en`;
    const json = await fetchJson(url);
    for (const [qid, entity] of Object.entries(json.entities || {})) {
      const label = entity.labels?.en?.value;
      if (label) itemLabels.set(qid, label);
    }
    await sleep(250);
  }

  const wikidataByNormal = new Map();
  for (const entity of entities) {
    const lexemeId = entity.id;
    const representations = [];
    for (const lemma of Object.values(entity.lemmas || {})) {
      if (lemma?.value) representations.push(lemma.value);
    }
    for (const form of entity.forms || []) {
      for (const representation of Object.values(form.representations || {})) {
        if (representation?.value) representations.push(representation.value);
      }
    }

    const strictRenderings = [];
    for (const sense of entity.senses || []) {
      for (const gloss of Object.values(sense.glosses || {})) {
        if (gloss.language === 'en' && gloss.value) strictRenderings.push(gloss.value);
      }
      for (const claim of sense.claims?.P5137 || []) {
        const qid = claim.mainsnak?.datavalue?.value?.id;
        const label = qid ? itemLabels.get(qid) : '';
        if (label) strictRenderings.push(label);
      }
    }

    const normals = unique(representations.map(normalizeHebrewToken).filter((normal) => candidateSet.has(normal)));
    if (!normals.length) continue;
    const row = {
      lexeme_id: lexemeId,
      source_url: `https://www.wikidata.org/wiki/Lexeme:${lexemeId}`,
      strict_renderings: unique(strictRenderings).slice(0, 8),
      forms: unique(representations),
    };
    for (const normal of normals) {
      if (!wikidataByNormal.has(normal)) wikidataByNormal.set(normal, []);
      wikidataByNormal.get(normal).push(row);
    }
  }

  return wikidataByNormal;
}

function parseStrongEntries(xml) {
  const strongById = new Map();
  const strongByNormal = new Map();
  for (const match of xml.matchAll(/<entry id="(H\d+)">([\s\S]*?)<\/entry>/g)) {
    const id = match[1];
    const body = match[2];
    const wordMatch = body.match(/<w\b([^>]*)>([\s\S]*?)<\/w>/);
    if (!wordMatch) continue;
    const attrs = parseAttributes(wordMatch[1]);
    const hebrew = stripTags(wordMatch[2]);
    const defMatch = body.match(/<meaning>([\s\S]*?)<\/meaning>/);
    const usageMatch = body.match(/<usage>([\s\S]*?)<\/usage>/);
    const rawMeaning = defMatch ? stripTags(defMatch[1]) : '';
    const rawUsage = usageMatch ? stripTags(usageMatch[1]) : '';
    const renderings = unique([
      ...rawMeaning.split(/[,;]|\bor\b/gi).map((part) => part.trim()),
      ...rawUsage.split(/[,;]/).map((part) => part.trim()),
    ])
      .filter((part) => part.length > 1 && !/^[()[\].\s-]+$/.test(part))
      .slice(0, 8);

    const entry = {
      strong_id: id,
      hebrew_word: hebrew,
      normalized_word: normalizeHebrewToken(hebrew),
      transliteration: attrs.xlit || attrs.pron || '',
      strict_renderings: renderings,
    };
    strongById.set(id, entry);
    if (entry.normalized_word) {
      if (!strongByNormal.has(entry.normalized_word)) strongByNormal.set(entry.normalized_word, []);
      strongByNormal.get(entry.normalized_word).push(entry);
    }
  }
  return { strongById, strongByNormal };
}

function extractStrongIds(lemma) {
  return unique(Array.from(String(lemma || '').matchAll(/\d+/g), (match) => `H${match[0]}`));
}

async function loadOpenScriptures(candidateSet) {
  console.log('Loading OpenScriptures HebrewLexicon...');
  const strongXml = await fetchText('https://raw.githubusercontent.com/openscriptures/HebrewLexicon/master/HebrewStrong.xml');
  const { strongById, strongByNormal } = parseStrongEntries(strongXml);

  console.log('Loading OpenScriptures morphHB WLC surface map...');
  const listing = await fetchJson('https://api.github.com/repos/openscriptures/morphhb/contents/wlc');
  const xmlFiles = (listing || [])
    .filter((row) => row.name?.endsWith('.xml') && row.download_url)
    .sort((a, b) => a.name.localeCompare(b.name));
  const morphByNormal = new Map();

  for (const [index, file] of xmlFiles.entries()) {
    const xml = await fetchText(file.download_url);
    for (const match of xml.matchAll(/<w\b([^>]*)>([\s\S]*?)<\/w>/g)) {
      const attrs = parseAttributes(match[1]);
      const strongIds = extractStrongIds(attrs.lemma);
      if (!strongIds.length) continue;
      const surface = stripTags(match[2]);
      const surfaceNormals = unique([
        normalizeHebrewToken(surface),
        ...String(surface).split('/').map(normalizeHebrewToken),
      ]).filter(Boolean);
      for (const normal of surfaceNormals) {
        if (!candidateSet.has(normal)) continue;
        if (!morphByNormal.has(normal)) morphByNormal.set(normal, new Set());
        for (const strongId of strongIds) morphByNormal.get(normal).add(strongId);
      }
    }
    if (index % 8 === 0) console.log(`  morphHB file ${index + 1}/${xmlFiles.length}: ${file.name}`);
  }

  const openByNormal = new Map();
  for (const normal of candidateSet) {
    const matches = [];
    for (const entry of strongByNormal.get(normal) || []) matches.push({ entry, via: 'hebrew_lexicon' });
    for (const strongId of morphByNormal.get(normal) || []) {
      const entry = strongById.get(strongId);
      if (entry) matches.push({ entry, via: 'morphhb' });
    }
    const deduped = [];
    const seen = new Set();
    for (const match of matches) {
      if (seen.has(match.entry.strong_id)) continue;
      seen.add(match.entry.strong_id);
      deduped.push(match);
    }
    if (deduped.length) openByNormal.set(normal, deduped);
  }

  return openByNormal;
}

function sourceRowKey(row) {
  return `${row.source_family}|${row.source_id}`;
}

function mergeSourceRows(existing, additions) {
  const rows = [];
  const seen = new Set();
  for (const row of [...(existing || []), ...(additions || [])]) {
    const key = sourceRowKey(row);
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(row);
  }
  return rows;
}

function makeWikidataSourceRow(matches) {
  const ids = unique(matches.map((match) => match.lexeme_id));
  return {
    source_name: 'Wikidata Lexeme',
    source_family: 'wikidata',
    source_id: ids.join('; '),
    source_url: ids.length ? `https://www.wikidata.org/wiki/Lexeme:${ids[0]}` : 'https://www.wikidata.org/wiki/Wikidata:Lexicographical_data',
    ...wikidataLicense,
    fields_used: ['lemma/form coverage', 'English sense glosses or sense-item labels where available'],
    notes: 'Matched Orot token by normalized Hebrew lemma/form. Wikidata Lexeme data is CC0.',
  };
}

function makeOpenScripturesRows(matches, usedMorphHB) {
  const strongIds = unique(matches.map((match) => match.entry.strong_id));
  const rows = [];
  if (usedMorphHB) {
    rows.push({
      source_name: 'OpenScriptures morphHB',
      source_family: 'openscriptures',
      source_id: strongIds.join('; '),
      source_url: 'https://github.com/openscriptures/morphhb/tree/master/wlc',
      ...openScripturesLicense,
      fields_used: ['Biblical Hebrew surface form to Strong lemma mapping'],
      notes: 'Used only where an Orot token matched a normalized WLC surface form.',
    });
  }
  rows.push({
    source_name: 'OpenScriptures HebrewLexicon',
    source_family: 'openscriptures',
    source_id: strongIds.join('; '),
    source_url: 'https://github.com/openscriptures/HebrewLexicon/blob/master/HebrewStrong.xml',
    ...openScripturesLicense,
    fields_used: ['transliteration', 'strict renderings'],
    notes: 'Definitions/renderings come from HebrewStrong.xml; roots are left blank unless independently available.',
  });
  return rows;
}

function loadExistingLexicon() {
  if (!fs.existsSync(lexiconPath)) {
    return {
      schema_version: 1,
      title: 'Lexical HUD lexicon entries',
      scope: 'Reusable lexical entries for HUD rendering. Token occurrence files reference these entries by lexicon_entry_id.',
      import_date: new Date().toISOString().slice(0, 10),
      license_policy: 'Lexical source rows remain separately attributed. Lexical data is not part of the owner\'s CC0 English translation overlay unless a row is itself CC0 or public domain.',
      entries: [],
    };
  }
  return readJson(lexiconPath);
}

function buildLexicon() {
  return {
    schema_version: 1,
    title: 'Lexical HUD lexicon entries',
    scope: 'Reusable lexical entries for HUD rendering. Token occurrence files reference these entries by lexicon_entry_id.',
    import_date: new Date().toISOString().slice(0, 10),
    license_policy: 'Lexical source rows remain separately attributed. Lexical data is not part of the owner\'s CC0 English translation overlay unless a row is itself CC0 or public domain.',
    entries: [],
  };
}

function displaySurface(record) {
  return record.surface_forms[0]?.surface_word || record.normalized_word;
}

function findFirstMatch(candidates, map) {
  for (const candidate of candidates) {
    const match = map.get(candidate);
    if (match && match.length) return { key: candidate, matches: match };
  }
  return null;
}

function findExistingEntry(candidates, map) {
  for (const candidate of candidates) {
    const match = map.get(candidate);
    if (match) return match;
  }
  return null;
}

function createOrUpdateEntry({ record, existingEntry, wikidataMatch, openMatch }) {
  const strictRenderings = [];
  const sourceRows = [];
  let transliteration = existingEntry?.transliteration || '';
  let root = existingEntry?.root || '';
  let rootTransliteration = existingEntry?.root_transliteration || '';
  const rootMeaning = [];

  if (existingEntry?.strict_renderings) strictRenderings.push(...existingEntry.strict_renderings);
  if (existingEntry?.root_meaning) rootMeaning.push(...existingEntry.root_meaning);
  if (existingEntry?.source_rows) sourceRows.push(...existingEntry.source_rows);

  const useWikidata = Boolean(wikidataMatch && !(record.normalized_word.length <= 2 && openMatch));
  if (useWikidata) {
    for (const match of wikidataMatch.matches) strictRenderings.push(...(match.strict_renderings || []));
    sourceRows.push(makeWikidataSourceRow(wikidataMatch.matches));
  }

  if (openMatch) {
    const usedMorphHB = openMatch.matches.some((match) => match.via === 'morphhb');
    for (const match of openMatch.matches) {
      if (!transliteration && match.entry.transliteration) transliteration = match.entry.transliteration;
      strictRenderings.push(...(match.entry.strict_renderings || []));
    }
    sourceRows.push(...makeOpenScripturesRows(openMatch.matches, usedMorphHB));
  }

  const entry = {
    entry_id: existingEntry?.entry_id || stableId('lex', record.normalized_word),
    hebrew_word: existingEntry?.hebrew_word || displaySurface(record),
    surface_forms: unique([
      ...(existingEntry?.surface_forms || []),
      ...record.surface_forms.map((surface) => surface.surface_word),
    ]),
    transliteration,
    strict_renderings: unique(strictRenderings).slice(0, 12),
    root,
    root_transliteration: rootTransliteration,
    root_meaning: unique(rootMeaning),
    source_rows: mergeSourceRows([], sourceRows),
  };

  if (!entry.strict_renderings.length && !entry.transliteration && !entry.source_rows.length) return null;
  return entry;
}

function existingEntryMaps(existingEntries) {
  const byNormal = new Map();
  const byId = new Map();
  for (const entry of existingEntries || []) {
    byId.set(entry.entry_id, entry);
    const forms = [entry.hebrew_word, ...(entry.surface_forms || [])].filter(Boolean);
    for (const form of forms) {
      const normal = normalizeHebrewToken(form);
      if (normal && !byNormal.has(normal)) byNormal.set(normal, entry);
    }
  }
  return { byNormal, byId };
}

function formatList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function getSampleRef(record) {
  const first = record.first_refs?.[0];
  if (!first) return 'ref unavailable';
  return `${first.source_ref} (#${first.anchor_id})`;
}

function formatMatchedSample(record, entry) {
  const renderings = entry.strict_renderings.slice(0, 3).join(', ') || 'N/A';
  const sourceFamilies = unique(entry.source_rows.map((row) => row.source_family || row.source_name)).join(' + ') || 'source metadata available';
  return `${displaySurface(record)} -> ${renderings} (${sourceFamilies}) — ${getSampleRef(record)}`;
}

function formatUnmatchedSample(record) {
  return `${displaySurface(record)} — ${getSampleRef(record)}`;
}

function percent(part, whole) {
  if (!whole) return '0.0%';
  return `${((part / whole) * 100).toFixed(1)}%`;
}

async function main() {
  const { records, occurrences } = extractOrotForms();
  const candidateSet = new Set(records.filter((record) => isAutoMatchable(record.normalized_word)).flatMap((record) => record.candidates));

  const [wikidataByNormal, openByNormal] = await Promise.all([
    loadWikidataLexemes(candidateSet),
    loadOpenScriptures(candidateSet),
  ]);

  const existingLexicon = loadExistingLexicon();
  const curatedEntries = (existingLexicon.entries || []).filter((entry) => curatedEntryIds.has(entry.entry_id));
  const { byNormal: existingByNormal } = existingEntryMaps(curatedEntries);
  const newLexicon = buildLexicon();
  const entriesById = new Map();
  const stats = {
    total_unique_surface_forms: records.reduce((sum, record) => sum + record.surface_forms.length, 0),
    total_occurrences: occurrences,
    matched_wikidata: 0,
    enriched_openscriptures: 0,
    matched_any: 0,
    unmatched: 0,
  };
  const matchedSamples = [];
  const unmatchedSamples = [];
  const testRefs = [
    'Orot, Lights from Darkness, Land of Israel 1:1',
    'Orot, Lights from Darkness, War 1:1',
    'Orot, Lights from Darkness, Lights of Rebirth 70:5',
  ];

  for (const record of records) {
    const existingEntry = findExistingEntry(record.candidates, existingByNormal);
    const allowAutoMatch = isAutoMatchable(record.normalized_word);
    const wikidataMatch = allowAutoMatch ? findFirstMatch(record.candidates, wikidataByNormal) : null;
    const openMatch = allowAutoMatch ? findFirstMatch(record.candidates, openByNormal) : null;
    const entry = createOrUpdateEntry({ record, existingEntry, wikidataMatch, openMatch });
    const surfaceFormCount = record.surface_forms.length;

    if (entry) {
      entriesById.set(entry.entry_id, entry);
      stats.matched_any += surfaceFormCount;
      const families = new Set(entry.source_rows.map((row) => row.source_family));
      if (families.has('wikidata')) stats.matched_wikidata += surfaceFormCount;
      if (families.has('openscriptures')) stats.enriched_openscriptures += surfaceFormCount;
      if (matchedSamples.length < 20) {
        matchedSamples.push(formatMatchedSample(record, entry));
      }
    } else {
      stats.unmatched += surfaceFormCount;
      if (unmatchedSamples.length < 20 && record.normalized_word.length > 2 && !hasAbbreviationMark(record.normalized_word)) {
        unmatchedSamples.push(formatUnmatchedSample(record));
      }
    }
  }

  newLexicon.entries = Array.from(entriesById.values()).sort((a, b) => {
    const left = normalizeHebrewToken(a.hebrew_word);
    const right = normalizeHebrewToken(b.hebrew_word);
    return left.localeCompare(right, 'he') || a.entry_id.localeCompare(b.entry_id);
  });

  writeJson(lexiconPath, newLexicon);

  const report = `# Orot Lexical Coverage Report

Generated: ${new Date().toISOString()}

## Scope

- Work: Orot only
- Hebrew source text changed: no
- Translation overlays changed: no
- Sources used: Wikidata Lexemes first; OpenScriptures morphHB + HebrewLexicon as fallback/enrichment
- Sources not used: Kaikki, Wiktionary, copyrighted translations

## Counts

- Total Orot unique surface forms: ${stats.total_unique_surface_forms}
- Total Orot token occurrences: ${stats.total_occurrences}
- Matched via Wikidata: ${stats.matched_wikidata}
- Enriched via OpenScriptures: ${stats.enriched_openscriptures}
- Matched by any source: ${stats.matched_any}
- Percent matched: ${percent(stats.matched_any, stats.total_unique_surface_forms)}
- Unmatched: ${stats.unmatched}

## Sample Matched Words

${formatList(matchedSamples)}

## Sample Unmatched Words

${formatList(unmatchedSamples)}

## Exact Orot Refs To Test

${formatList(testRefs)}
`;
  writeText(reportPath, report);

  console.log(JSON.stringify(stats, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const sourceDir = process.argv[2] || 'data/sources';
const lexicalDir = process.argv[3] || 'data/lexical';
const occurrencesDir = path.join(lexicalDir, 'occurrences');
const lexiconPath = path.join(lexicalDir, 'lexicon.json');
const tokenIndexPath = path.join(lexicalDir, 'token-index.json');
const reportPath = 'reports/orot-lexical-coverage-report.md';
const lexicalScope = {
  work_id: 'orot',
  label: 'Orot',
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

function normalizeHebrewPunctuation(value) {
  return String(value || '')
    .replace(/([\u0590-\u05FF])'/gu, '$1\u05F3')
    .replace(/([\u0590-\u05FF])"(?=[\u0590-\u05FF])/gu, '$1\u05F4');
}

function normalizeHebrewToken(value) {
  const stripped = normalizeHebrewPunctuation(value).replace(niqqudRe, '');
  return Array.from(stripped, (char) => finalLetters.get(char) || char).join('');
}

function normalizeHebrewTokenWithQubutsMater(value) {
  const text = normalizeHebrewPunctuation(value);
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

function getTokens(text) {
  return Array.from(String(text || '').matchAll(tokenRe), (match) => normalizeHebrewPunctuation(match[0]));
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function formatList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function percent(part, whole) {
  if (!whole) return '0.0%';
  return `${((part / whole) * 100).toFixed(1)}%`;
}

function loadLexicon() {
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

function sourceFamiliesFor(row) {
  const entry = lexiconById.get(row.lexicon_entry_id);
  return unique((entry?.source_rows || []).map((sourceRow) => sourceRow.source_family || sourceRow.source_name));
}

function renderingsFor(row) {
  const entry = lexiconById.get(row.lexicon_entry_id);
  const likely = (entry?.possible_entries || []).find((possibleEntry) => possibleEntry.context_role === 'likely_contextual');
  const surfaceRenderings = row.surface_renderings?.length ? row.surface_renderings : null;
  return (surfaceRenderings || likely?.strict_renderings || entry?.strict_renderings || []).slice(0, 3).join(', ') || 'N/A';
}

function getLeadingLamedBase(surfaceWord) {
  const normalized = normalizeHebrewPunctuation(surfaceWord);
  if (!normalized.startsWith('\u05DC')) return null;
  let index = 1;
  while (index < normalized.length && /[\u0591-\u05C7]/u.test(normalized[index])) index += 1;
  const baseSurface = normalized.slice(index);
  if (!baseSurface) return null;
  return {
    prefix_surface: '\u05DC\u05B8\u05BE',
    prefix_transliteration: 'la-',
    prefix_renderings: ['to', 'for', 'toward', 'belonging-to'],
    base_surface: baseSurface,
    base_normalized: normalizeHebrewTokenWithQubutsMater(baseSurface),
  };
}

function analyzeSurfaceForm(surfaceWord, entry) {
  const likely = (entry?.possible_entries || []).find((possibleEntry) => possibleEntry.context_role === 'likely_contextual');
  const lamed = getLeadingLamedBase(surfaceWord);
  if (!likely || !lamed) return null;

  const likelyLemmaNormal = normalizeHebrewTokenWithQubutsMater(likely.lemma || '');
  const possibleEntries = entry?.possible_entries || [];
  const baseRenderings = unique([
    ...(likely.strict_renderings || []),
    ...possibleEntries
      .filter((possibleEntry) => normalizeHebrewTokenWithQubutsMater(possibleEntry.lemma || '') === lamed.base_normalized)
      .flatMap((possibleEntry) => possibleEntry.strict_renderings || []),
  ]);
  const hasNation = likelyLemmaNormal === '\u05D0\u05D5\u05DE\u05D4'
    || lamed.base_normalized === '\u05D0\u05D5\u05DE\u05D4'
    || baseRenderings.some((rendering) => /nation|people/i.test(rendering));

  if (!hasNation) return null;

  return {
    surface_transliteration: 'la-ummah',
    surface_renderings: [
      'to the nation',
      'for the nation',
      'belonging to the nation',
      'of the nation',
    ],
    surface_context_status: 'resolved_prefix_base',
    surface_context_note: 'Resolved as lamed prefix plus the likely base lemma.',
    breakdown: [
      {
        hebrew: lamed.prefix_surface,
        transliteration: lamed.prefix_transliteration,
        strict_renderings: lamed.prefix_renderings,
      },
      {
        hebrew: lamed.base_surface,
        transliteration: 'ummah',
        strict_renderings: ['nation', 'people'],
      },
    ],
  };
}

function formatMatchedSample(row) {
  const families = sourceFamiliesFor(row).join(' + ') || 'source metadata available';
  return `${row.surface_word} -> ${renderingsFor(row)} (${families}) -- ${row.first_source_ref} (#${row.first_anchor_id})`;
}

function formatUnmatchedSample(row) {
  return `${row.surface_word} -- ${row.first_source_ref} (#${row.first_anchor_id})`;
}

const lexicon = loadLexicon();
const lexiconByNormalized = new Map();
const lexiconById = new Map((lexicon.entries || []).map((entry) => [entry.entry_id, entry]));
for (const entry of lexicon.entries || []) {
  const forms = [entry.hebrew_word, ...(entry.surface_forms || [])].filter(Boolean);
  for (const form of forms) {
    const normalized = normalizeHebrewToken(form);
    if (normalized && !lexiconByNormalized.has(normalized)) {
      lexiconByNormalized.set(normalized, entry.entry_id);
    }
  }
}

fs.mkdirSync(occurrencesDir, { recursive: true });
for (const oldFile of fs.readdirSync(occurrencesDir).filter((name) => name.endsWith('.json'))) {
  fs.unlinkSync(path.join(occurrencesDir, oldFile));
}

const tokenRows = new Map();
const sourceFiles = fs.readdirSync(sourceDir).filter((name) => name.endsWith('.json')).sort();
let totalOccurrences = 0;
let totalUnits = 0;

for (const fileName of sourceFiles) {
  const source = readJson(path.join(sourceDir, fileName));
  if (source.work_id !== lexicalScope.work_id) continue;

  const occurrenceUnits = {};
  let workOccurrences = 0;

  for (const unit of source.units || []) {
    totalUnits += 1;
    let unitOrdinal = 0;
    const paragraphs = [];

    for (let paragraphIndex = 0; paragraphIndex < (unit.hebrew || []).length; paragraphIndex += 1) {
      const rawParagraph = String(unit.hebrew[paragraphIndex] || '');
      const tokenIndexIds = [];
      for (const surfaceWord of getTokens(rawParagraph)) {
        unitOrdinal += 1;
        totalOccurrences += 1;
        workOccurrences += 1;

        const normalizedWord = normalizeHebrewToken(surfaceWord);
        const tokenIndexId = stableId('tok', surfaceWord);
        const lexiconEntryId = lexiconByNormalized.get(normalizedWord) || '';
        const status = lexiconEntryId ? 'matched' : 'unmatched';
        const entry = lexiconEntryId ? lexiconById.get(lexiconEntryId) : null;
        const surfaceAnalysis = entry ? analyzeSurfaceForm(surfaceWord, entry) : null;

        if (!tokenRows.has(tokenIndexId)) {
          tokenRows.set(tokenIndexId, {
            token_index_id: tokenIndexId,
            surface_word: surfaceWord,
            normalized_word: normalizedWord,
            lexicon_entry_id: lexiconEntryId,
            status,
            surface_transliteration: surfaceAnalysis?.surface_transliteration || '',
            surface_renderings: surfaceAnalysis?.surface_renderings || [],
            surface_context_status: surfaceAnalysis?.surface_context_status || '',
            surface_context_note: surfaceAnalysis?.surface_context_note || '',
            breakdown: surfaceAnalysis?.breakdown || [],
            first_source_ref: unit.source_ref,
            first_anchor_id: unit.anchor_id,
            occurrence_count: 0,
          });
        }
        tokenRows.get(tokenIndexId).occurrence_count += 1;

        tokenIndexIds.push(tokenIndexId);
      }

      paragraphs.push({
        paragraph_index: paragraphIndex,
        token_index_ids: tokenIndexIds,
      });
    }

    occurrenceUnits[unit.unit_id] = {
      unit_id: unit.unit_id,
      anchor_id: unit.anchor_id,
      source_ref: unit.source_ref,
      paragraphs,
    };
  }

  writeJson(path.join(occurrencesDir, `${source.work_id}.json`), {
    schema_version: 1,
    work_id: source.work_id,
    work_title: source.work_title,
    work_slug: source.work_slug,
    scope_label: lexicalScope.label,
    generated_at: new Date().toISOString(),
    total_occurrences: workOccurrences,
    units: occurrenceUnits,
  });
}

const forms = Array.from(tokenRows.values()).sort((a, b) => {
  const normalized = a.normalized_word.localeCompare(b.normalized_word, 'he');
  if (normalized !== 0) return normalized;
  return a.surface_word.localeCompare(b.surface_word, 'he');
});

const matchedForms = forms.filter((row) => row.status === 'matched');
const unmatchedForms = forms.filter((row) => row.status !== 'matched');
const wikidataMatchedForms = matchedForms.filter((row) => sourceFamiliesFor(row).includes('wikidata'));
const openScripturesMatchedForms = matchedForms.filter((row) => sourceFamiliesFor(row).includes('openscriptures'));

writeJson(tokenIndexPath, {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  source_dir: sourceDir,
  scope: lexicalScope,
  normalization_policy: {
    geresh: "ASCII apostrophe after Hebrew letters is normalized to Hebrew geresh U+05F3 for display/indexing.",
    gershayim: "ASCII double quote between Hebrew letters is normalized to Hebrew gershayim U+05F4 for display/indexing.",
    niqqud: 'Hebrew combining marks are stripped from normalized_word.',
    final_letters: 'Final kaf/mem/nun/pe/tsadi are normalized to medial forms in normalized_word.',
    surface_word: 'surface_word preserves the displayed source token apart from safe geresh normalization.',
  },
  total_units: totalUnits,
  total_occurrences: totalOccurrences,
  total_unique_surface_forms: forms.length,
  matched_surface_forms: matchedForms.length,
  matched_wikidata_surface_forms: wikidataMatchedForms.length,
  enriched_openscriptures_surface_forms: openScripturesMatchedForms.length,
  unmatched_surface_forms: unmatchedForms.length,
  forms,
});

const matchedSamples = matchedForms.filter((row) => renderingsFor(row) !== 'N/A').slice(0, 20).map(formatMatchedSample);
const unmatchedSamples = unmatchedForms
  .filter((row) => row.normalized_word.length > 2 && !/[\u05F3\u05F4'"]/.test(row.normalized_word))
  .slice(0, 20)
  .map(formatUnmatchedSample);
const testRefs = [
  'Orot, Lights from Darkness, Land of Israel 1:1',
  'Orot, Lights from Darkness, War 1:1',
  'Orot, Lights from Darkness, Lights of Rebirth 70:5',
];

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `# Orot Lexical Coverage Report

Generated: ${new Date().toISOString()}

## Scope

- Work: Orot only
- Hebrew source text changed: no
- Translation overlays changed: no
- Sources used: Wikidata Lexemes first; OpenScriptures morphHB + HebrewLexicon as fallback/enrichment
- Sources not used: Kaikki, Wiktionary, copyrighted translations
- Count source: generated HUD token index, which is the page-render source of truth
- TODO: externalize lexical JSON instead of embedding the full Orot lexical payload in the page HTML.

## Counts

- Total Orot unique surface forms: ${forms.length}
- Total Orot token occurrences: ${totalOccurrences}
- Total matched: ${matchedForms.length}
- Percent matched: ${percent(matchedForms.length, forms.length)}
- Matched via Wikidata: ${wikidataMatchedForms.length}
- Enriched via OpenScriptures: ${openScripturesMatchedForms.length}
- Unmatched: ${unmatchedForms.length}

## Sample Matched Words With Refs To Test

${formatList(matchedSamples)}

## Sample Unmatched Words

${formatList(unmatchedSamples)}

## Exact Orot Refs To Test

${formatList(testRefs)}
`, 'utf8');

console.log(JSON.stringify({
  total_units: totalUnits,
  total_occurrences: totalOccurrences,
  total_unique_surface_forms: forms.length,
  matched_surface_forms: matchedForms.length,
  matched_wikidata_surface_forms: wikidataMatchedForms.length,
  enriched_openscriptures_surface_forms: openScripturesMatchedForms.length,
  unmatched_surface_forms: unmatchedForms.length,
}, null, 2));

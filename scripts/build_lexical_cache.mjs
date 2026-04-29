import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const sourceDir = process.argv[2] || 'data/sources';
const lexicalDir = process.argv[3] || 'data/lexical';
const occurrencesDir = path.join(lexicalDir, 'occurrences');
const lexiconPath = path.join(lexicalDir, 'lexicon.json');
const tokenIndexPath = path.join(lexicalDir, 'token-index.json');

const tokenRe = /[\u05D0-\u05EA][\u0591-\u05C7\u05D0-\u05EA\u05F3\u05F4'"]*/gu;
const niqqudRe = /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/gu;
const finalLetters = new Map([
  ['ך', 'כ'],
  ['ם', 'מ'],
  ['ן', 'נ'],
  ['ף', 'פ'],
  ['ץ', 'צ'],
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

function getTokens(text) {
  return Array.from(String(text || '').matchAll(tokenRe), (match) => normalizeHebrewPunctuation(match[0]));
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

const lexicon = loadLexicon();
const lexiconByNormalized = new Map();
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

        if (!tokenRows.has(tokenIndexId)) {
          tokenRows.set(tokenIndexId, {
            token_index_id: tokenIndexId,
            surface_word: surfaceWord,
            normalized_word: normalizedWord,
            lexicon_entry_id: lexiconEntryId,
            status,
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

writeJson(tokenIndexPath, {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  source_dir: sourceDir,
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
  matched_surface_forms: forms.filter((row) => row.status === 'matched').length,
  unmatched_surface_forms: forms.filter((row) => row.status !== 'matched').length,
  forms,
});

console.log(JSON.stringify({
  total_units: totalUnits,
  total_occurrences: totalOccurrences,
  total_unique_surface_forms: forms.length,
  matched_surface_forms: forms.filter((row) => row.status === 'matched').length,
  unmatched_surface_forms: forms.filter((row) => row.status !== 'matched').length,
}, null, 2));

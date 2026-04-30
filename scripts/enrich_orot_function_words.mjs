import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const lexicalDir = 'data/lexical';
const tokenIndexPath = path.join(lexicalDir, 'token-index.json');
const manifestPath = path.join(lexicalDir, 'lexicon.json');
const occurrencePath = path.join(lexicalDir, 'occurrences', 'orot.json');
const layerPath = path.join(lexicalDir, 'source-layers', 'project-function-words.json');
const reportPath = path.join('reports', 'orot-function-word-enrichment-report.md');

const cp = (...hex) => hex.map((value) => String.fromCodePoint(Number.parseInt(value, 16))).join('');

const FUNCTION_WORDS = [
  { key: 'et', surface: cp('05D0', '05EA'), renderings: ['direct-object marker', 'with'] },
  { key: 'asher', surface: cp('05D0', '05E9', '05E8'), renderings: ['that', 'which', 'who'] },
  { key: 'el', surface: cp('05D0', '05DC'), renderings: ['to', 'toward', 'do not / not, when vocalization or context supports אַל'] },
  { key: 'lo', surface: cp('05DC', '05D0'), renderings: ['not', 'no'] },
  { key: 'ki', surface: cp('05DB', '05D9'), renderings: ['because', 'for', 'that', 'when'] },
  { key: 'rak', surface: cp('05E8', '05E7'), renderings: ['only', 'merely', 'just'] },
  { key: 'mah', surface: cp('05DE', '05D4'), renderings: ['what', 'what which', 'how'] },
  { key: 'im', surface: cp('05D0', '05DD'), renderings: ['if', 'whether'] },
  { key: 'ein', surface: cp('05D0', '05D9', '05DF'), renderings: ['there is not', 'is not', 'without'] },
  { key: 'zu', surface: cp('05D6', '05D5'), renderings: ['this', 'this one'] },
  { key: 'ken', surface: cp('05DB', '05DF'), renderings: ['so', 'thus', 'yes'] },
  { key: 'min', surface: cp('05DE', '05DF'), renderings: ['from', 'out of', 'than'] },
  { key: 'omnam', surface: cp('05D0', '05DE', '05E0', '05DD'), renderings: ['indeed', 'however', 'nevertheless'] },
  { key: 'anu', surface: cp('05D0', '05E0', '05D5'), renderings: ['we'] },
  { key: 'bein', surface: cp('05D1', '05D9', '05DF'), renderings: ['between', 'among'] },
  { key: 'ad', surface: cp('05E2', '05D3'), renderings: ['until', 'up to', 'as far as'] },
  { key: 'hu', surface: cp('05D4', '05D5', '05D0'), renderings: ['he', 'it', 'that is'] },
  { key: 'zeh', surface: cp('05D6', '05D4'), renderings: ['this', 'this one'] },
  { key: 'kol', surface: cp('05DB', '05DC'), renderings: ['all', 'every', 'any'] },
  { key: 'al', surface: cp('05E2', '05DC'), renderings: ['on', 'upon', 'over', 'concerning', 'about'] },
];

const niqqudRe = /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/gu;
const finalLetters = new Map([
  [cp('05DA'), cp('05DB')],
  [cp('05DD'), cp('05DE')],
  [cp('05DF'), cp('05E0')],
  [cp('05E3'), cp('05E4')],
  [cp('05E5'), cp('05E6')],
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

function codepoints(value) {
  return Array.from(String(value || ''), (char) => char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' ');
}

function assertCodepoints(label, value, expected) {
  const actual = codepoints(value);
  const expectedText = expected.join(' ');
  if (actual !== expectedText) throw new Error(`${label} codepoints mismatch. Expected ${expectedText}; got ${actual}`);
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function getExamples(occurrences) {
  const examples = new Map();
  for (const unit of Object.values(occurrences.units || {})) {
    for (const paragraph of unit.paragraphs || []) {
      for (const tokenId of paragraph.token_index_ids || []) {
        const refs = examples.get(tokenId) || [];
        if (refs.length < 3 && unit.source_ref && !refs.includes(unit.source_ref)) refs.push(unit.source_ref);
        examples.set(tokenId, refs);
      }
    }
  }
  return examples;
}

function makeEntry(item) {
  const sourceId = `project-function-word:${item.key}`;
  const rowKey = `workspace|${sourceId}`;
  const normalized = normalizeHebrewToken(item.surface);
  return {
    entry_id: stableId('lex-function-word', item.key),
    hebrew_word: item.surface,
    surface_forms: [item.surface, normalized].filter((value, index, array) => value && array.indexOf(value) === index),
    transliteration: '',
    strict_renderings: item.renderings,
    root: '',
    root_transliteration: '',
    root_meaning: [],
    disambiguation_status: 'likely',
    context_note: 'Resolved as a common Hebrew function word.',
    possible_entries_truncated: 0,
    possible_entries: [
      {
        entry_key: sourceId,
        lemma: item.surface,
        match_key: normalized,
        source_name: 'Project-authored function word table',
        source_family: 'workspace',
        source_id: sourceId,
        transliteration: '',
        strict_renderings: item.renderings,
        root: '',
        root_transliteration: '',
        root_meaning: [],
        context_role: 'likely_contextual',
        relation_label: 'common Hebrew function word',
        source_row_keys: [rowKey],
      },
    ],
    source_rows: [
      {
        source_name: 'Project-authored function word table',
        source_family: 'workspace',
        source_id: sourceId,
        source_url: 'local:project-function-word-table',
        license: 'project-authored / CC0',
        license_url: 'https://creativecommons.org/publicdomain/zero/1.0/',
        fields_used: ['closed-class function-word rule', 'strict renderings'],
        notes: 'Project-maintained grammar/function-word rule. No external dictionary text imported.',
      },
    ],
  };
}

function updateManifest(manifest, entryCount) {
  const layer = {
    layer_id: 'project-function-words',
    source_family: 'workspace',
    license: 'project-authored / CC0',
    path: 'source-layers/project-function-words.json',
    description: 'Project-authored conservative Hebrew function-word grammar rules.',
    entries: entryCount,
  };
  const layerFiles = (manifest.layer_files || []).filter((item) => item.layer_id !== layer.layer_id);
  const projectIndex = layerFiles.findIndex((item) => item.layer_id === 'project-overrides');
  const insertIndex = projectIndex >= 0 ? projectIndex + 1 : 0;
  layerFiles.splice(insertIndex, 0, layer);
  manifest.layer_files = layerFiles;
}

function topUnmatched(forms, limit) {
  return forms
    .filter((row) => row.status !== 'matched')
    .slice()
    .sort((a, b) => (b.occurrence_count || 0) - (a.occurrence_count || 0) || String(a.surface_word).localeCompare(String(b.surface_word), 'he'))
    .slice(0, limit);
}

function writeReport({ beforeMatched, afterMatched, changedRows, forms, examples }) {
  const rowsByNormalized = new Map();
  for (const row of changedRows) {
    const existing = rowsByNormalized.get(row.normalized_word);
    if (!existing || (row.occurrence_count || 0) > (existing.occurrence_count || 0)) {
      rowsByNormalized.set(row.normalized_word, row);
    }
  }
  const lines = [];
  lines.push('# Orot Function-Word Grammar Layer Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Scope');
  lines.push('');
  lines.push('- Work: Orot only');
  lines.push('- Source added: project-authored function-word grammar table only');
  lines.push('- New external sources imported: no');
  lines.push('- Broad vocabulary added: no');
  lines.push('- Hebrew source, anchors, overlays, and exports changed: no');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Matched before pass: ${beforeMatched}`);
  lines.push(`- Surface forms reranked/resolved by grammar function-word layer: ${changedRows.length}`);
  lines.push(`- Total matched after pass: ${afterMatched}`);
  lines.push(`- Still unmatched: ${forms.length - afterMatched}`);
  lines.push('');
  lines.push('## Function Words Added');
  lines.push('');
  lines.push('| Surface | Codepoints | Normalized | Strict renderings | Count | Example refs | Source/license |');
  lines.push('|---|---|---|---|---:|---|---|');
  for (const item of FUNCTION_WORDS) {
    const normalized = normalizeHebrewToken(item.surface);
    const matchingRows = changedRows.filter((row) => row.normalized_word === normalized);
    const count = matchingRows.reduce((sum, row) => sum + (row.occurrence_count || 0), 0);
    const refs = matchingRows.flatMap((row) => examples.get(row.token_index_id) || [row.first_source_ref].filter(Boolean)).slice(0, 3);
    lines.push(`| ${escapeCell(item.surface)} | ${codepoints(item.surface)} | ${escapeCell(normalized)} | ${escapeCell(item.renderings.join('; '))} | ${count} | ${escapeCell(refs.join('; '))} | Project-authored function word table / CC0 |`);
  }
  lines.push('');
  lines.push('## 20 Examples With Refs');
  lines.push('');
  lines.push('| Token | Renderings | Count | Example refs |');
  lines.push('|---|---|---:|---|');
  for (const item of FUNCTION_WORDS) {
    const normalized = normalizeHebrewToken(item.surface);
    const matchingRows = changedRows.filter((row) => row.normalized_word === normalized);
    const row = rowsByNormalized.get(normalized);
    if (!row) continue;
    const refs = matchingRows.flatMap((matchedRow) => examples.get(matchedRow.token_index_id) || [matchedRow.first_source_ref].filter(Boolean)).slice(0, 3);
    const count = matchingRows.reduce((sum, matchedRow) => sum + (matchedRow.occurrence_count || 0), 0);
    lines.push(`| ${escapeCell(row.surface_word)} | ${escapeCell(item.renderings.join('; '))} | ${count} | ${escapeCell(refs.join('; '))} |`);
  }
  lines.push('');
  lines.push('## Top 50 Remaining Unmatched');
  lines.push('');
  lines.push('| # | Surface | Normalized | Count | Example refs |');
  lines.push('|---:|---|---|---:|---|');
  topUnmatched(forms, 50).forEach((row, index) => {
    const refs = examples.get(row.token_index_id) || [row.first_source_ref].filter(Boolean);
    lines.push(`| ${index + 1} | ${escapeCell(row.surface_word)} | ${escapeCell(row.normalized_word)} | ${row.occurrence_count || 0} | ${escapeCell(refs.join('; '))} |`);
  });
  lines.push('');

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
}

function main() {
  const expectedCodepoints = new Map([
    ['et', ['05D0', '05EA']],
    ['asher', ['05D0', '05E9', '05E8']],
    ['el', ['05D0', '05DC']],
    ['lo', ['05DC', '05D0']],
    ['ki', ['05DB', '05D9']],
    ['rak', ['05E8', '05E7']],
    ['mah', ['05DE', '05D4']],
    ['im', ['05D0', '05DD']],
    ['ein', ['05D0', '05D9', '05DF']],
    ['zu', ['05D6', '05D5']],
    ['ken', ['05DB', '05DF']],
    ['min', ['05DE', '05DF']],
    ['omnam', ['05D0', '05DE', '05E0', '05DD']],
    ['anu', ['05D0', '05E0', '05D5']],
    ['bein', ['05D1', '05D9', '05DF']],
    ['ad', ['05E2', '05D3']],
    ['hu', ['05D4', '05D5', '05D0']],
    ['zeh', ['05D6', '05D4']],
    ['kol', ['05DB', '05DC']],
    ['al', ['05E2', '05DC']],
  ]);
  for (const item of FUNCTION_WORDS) {
    assertCodepoints(`surface ${item.key}`, item.surface, expectedCodepoints.get(item.key));
  }

  const tokenIndex = readJson(tokenIndexPath);
  const manifest = readJson(manifestPath);
  const occurrences = readJson(occurrencePath);
  const forms = tokenIndex.forms || [];

  const entries = FUNCTION_WORDS.map(makeEntry);
  const entriesByNormalized = new Map(FUNCTION_WORDS.map((item, index) => [normalizeHebrewToken(item.surface), { item, entry: entries[index] }]));
  const beforeMatched = forms.filter((row) => row.status === 'matched').length;
  const changedRows = [];

  for (const row of forms) {
    const normalized = row.normalized_word || normalizeHebrewToken(row.surface_word);
    if (!entriesByNormalized.has(normalized)) continue;
    const { item, entry } = entriesByNormalized.get(normalized);
    row.status = 'matched';
    row.match_method = 'project_function_word';
    row.lexicon_entry_id = entry.entry_id;
    row.surface_context_status = 'resolved_function_word';
    row.surface_context_note = 'Resolved as a common Hebrew function word.';
    row.surface_renderings = item.renderings;
    row.breakdown = [];
    changedRows.push(row);
  }

  const layer = {
    schema_version: 1,
    layer_id: 'project-function-words',
    source_family: 'workspace',
    license: 'project-authored / CC0',
    status: 'active',
    description: 'Project-authored conservative Hebrew function-word grammar rules. No external dictionary text imported.',
    generated_at: new Date().toISOString(),
    entries,
  };
  writeJson(layerPath, layer);

  updateManifest(manifest, entries.length);
  manifest.generated_at = new Date().toISOString();
  writeJson(manifestPath, manifest);

  const afterMatched = forms.filter((row) => row.status === 'matched').length;
  tokenIndex.generated_at = new Date().toISOString();
  tokenIndex.matched_surface_forms = afterMatched;
  tokenIndex.unmatched_surface_forms = forms.length - afterMatched;
  tokenIndex.matched_project_function_word_surface_forms = changedRows.length;
  writeJson(tokenIndexPath, tokenIndex);

  writeReport({
    beforeMatched,
    afterMatched,
    changedRows,
    forms,
    examples: getExamples(occurrences),
  });

  console.log(JSON.stringify({
    beforeMatched,
    newlyResolvedByFunctionWordLayer: changedRows.length,
    afterMatched,
    unmatchedAfterFunctionWords: forms.length - afterMatched,
    report: reportPath,
  }, null, 2));
}

main();

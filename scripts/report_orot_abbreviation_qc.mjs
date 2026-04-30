import fs from 'node:fs';
import path from 'node:path';

const lexicalDir = 'data/lexical';
const layerPath = path.join(lexicalDir, 'source-layers', 'project-abbreviations.json');
const tokenIndexPath = path.join(lexicalDir, 'token-index.json');
const occurrencesPath = path.join(lexicalDir, 'occurrences', 'orot.json');
const manifestPath = path.join(lexicalDir, 'orot.manifest.json');
const reportPath = path.join('reports', 'orot-abbreviation-qc-report.md');

const HEBREW_MARKS_RE = /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/g;
const FINAL_LETTERS = new Map([
  ['\u05DA', '\u05DB'],
  ['\u05DD', '\u05DE'],
  ['\u05DF', '\u05E0'],
  ['\u05E3', '\u05E4'],
  ['\u05E5', '\u05E6'],
]);

function cp(...hex) {
  return hex.map((value) => String.fromCharCode(Number.parseInt(value, 16))).join('');
}

function codepoints(value) {
  return Array.from(String(value || '')).map((char) => char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' ');
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

function canonicalQuote(value) {
  return String(value || '').normalize('NFC').replace(/"/g, '\u05F4').replace(/'/g, '\u05F3');
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
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

function loadChunks(manifest) {
  const chunksByToken = new Map();
  for (const chunk of manifest.chunks || []) {
    const chunkJson = readJson(path.join(lexicalDir, chunk.url));
    for (const row of chunkJson.token_index?.forms || []) {
      chunksByToken.set(row.token_index_id, { chunk: chunkJson, tokenRow: row });
    }
  }
  return chunksByToken;
}

function sourceRowsForEntry(chunk, entry) {
  return (entry.source_row_ids || []).map((id) => chunk.source_rows?.[id]).filter(Boolean);
}

function classifyTopUnmatched(row, knownKeys) {
  const normalized = row.normalized_word || '';
  const surface = row.surface_word || '';
  if (/['"\u05F3\u05F4]/.test(surface) || /['"\u05F3\u05F4]/.test(normalized)) return 'still abbreviation';
  if (/[\u05D0]$/.test(normalized) || /[\u05D3][\u05DE][\u05E9][\u05D9][\u05D7][\u05D0]/.test(normalized)) return 'Aramaic/rabbinic form';
  if (/(אלהי|אידיא|מוסר|חמרי|דתי|נשמתי|סבתי|רוחני|השקפ|ידיע|נטי|תוכנ|ענינ|אידיאל|מקורי|חוצפ|זוהמ|סגול|כללי)/.test(normalized)) {
    return 'Kook vocabulary / abstract noun-adjective';
  }
  const candidates = stemCandidates(normalized);
  if (candidates.some((candidate) => knownKeys.has(candidate))) return 'inflected form of known lemma';
  return 'unknown';
}

function stemCandidates(value) {
  const prefixes = ['', '\u05D5', '\u05D4', '\u05D1', '\u05DB', '\u05DC', '\u05DE', '\u05E9', '\u05D5\u05D4', '\u05D1\u05D4', '\u05DC\u05D4', '\u05E9\u05D4'];
  const suffixes = ['', '\u05D4', '\u05D5', '\u05DD', '\u05DF', '\u05D9\u05DD', '\u05D5\u05EA', '\u05D9\u05D5\u05EA', '\u05D9\u05EA', '\u05D9\u05D9\u05DD', '\u05D9\u05D5', '\u05D9\u05D4', '\u05E0\u05D5'];
  const out = new Set();
  for (const prefix of prefixes) {
    let current = value;
    if (prefix && current.startsWith(prefix) && current.length > prefix.length + 2) current = current.slice(prefix.length);
    for (const suffix of suffixes) {
      if (suffix && current.endsWith(suffix) && current.length > suffix.length + 2) out.add(current.slice(0, -suffix.length));
      out.add(current);
    }
  }
  return [...out].filter(Boolean);
}

function buildKnownKeys() {
  const lexicon = readJson(path.join(lexicalDir, 'lexicon.json'));
  const keys = new Set();
  for (const layer of lexicon.layer_files || []) {
    if (!layer.path || layer.layer_id === 'project-abbreviations') continue;
    const layerJson = readJson(path.join(lexicalDir, layer.path));
    for (const entry of layerJson.entries || []) {
      for (const value of [entry.hebrew_word, ...(entry.surface_forms || [])]) {
        const normalized = normalizeHebrew(value);
        if (normalized) keys.add(normalized);
      }
    }
  }
  return keys;
}

const layer = readJson(layerPath);
const tokenIndex = readJson(tokenIndexPath);
const occurrences = readJson(occurrencesPath);
const manifest = readJson(manifestPath);
const chunksByToken = loadChunks(manifest);
const examples = examplesByTokenId(occurrences);
const knownKeys = buildKnownKeys();

const errors = [];
const reportRows = [];

if (layer.layer_id !== 'project-abbreviations') errors.push('Layer id mismatch.');
if (layer.source_family !== 'workspace') errors.push(`Layer source_family is not workspace: ${layer.source_family}`);
if (layer.license !== 'N/A - project-authored lexical rules') errors.push(`Layer license mismatch: ${layer.license}`);

for (const entry of layer.entries || []) {
  const entryErrors = [];
  if (entry.source_rows?.some((row) => row.source_family !== 'workspace')) entryErrors.push('source row is not workspace');
  if (entry.source_rows?.some((row) => row.source_name !== 'Project-authored abbreviation table')) entryErrors.push('source row label mismatch');
  if (entry.source_rows?.some((row) => row.license !== 'N/A - project-authored lexical rule')) entryErrors.push('source row license mismatch');
  if (entry.source_rows?.some((row) => /wikidata|openscriptures|kaikki/i.test(`${row.source_family} ${row.source_name}`))) entryErrors.push('dictionary source mislabeled on abbreviation row');

  const surfaceForms = entry.surface_forms || [];
  const canonicalSurface = canonicalQuote(entry.hebrew_word);
  if (!surfaceForms.some((form) => canonicalQuote(form) === canonicalSurface)) entryErrors.push('quote variants do not normalize back to surface form');

  const tokenRows = (tokenIndex.forms || []).filter((row) => row.lexicon_entry_id === entry.entry_id);
  if (!tokenRows.length) entryErrors.push('no token-index row points to abbreviation entry');
  const tokenRow = tokenRows[0] || {};
  if (tokenRow.surface_word && canonicalQuote(tokenRow.surface_word) !== canonicalSurface) entryErrors.push('clicked surface form does not match abbreviation surface');
  if (tokenRow.surface_context_status !== 'resolved_abbreviation') entryErrors.push(`surface_context_status is not resolved_abbreviation: ${tokenRow.surface_context_status}`);

  let chunkEntry = null;
  let chunkSourceRows = [];
  let chunkToken = null;
  if (tokenRow.token_index_id && chunksByToken.has(tokenRow.token_index_id)) {
    const chunkInfo = chunksByToken.get(tokenRow.token_index_id);
    chunkToken = chunkInfo.tokenRow;
    chunkEntry = (chunkInfo.chunk.lexicon?.entries || []).find((item) => item.entry_id === entry.entry_id);
    if (!chunkEntry) entryErrors.push('generated chunk missing abbreviation entry');
    else {
      chunkSourceRows = sourceRowsForEntry(chunkInfo.chunk, chunkEntry);
      if (!chunkSourceRows.length) entryErrors.push('generated chunk missing source/license row');
      if (chunkSourceRows.some((row) => row.source_name !== 'Project-authored abbreviation table')) entryErrors.push('generated chunk source label mismatch');
      if (chunkSourceRows.some((row) => row.license !== 'N/A - project-authored lexical rule')) entryErrors.push('generated chunk source license mismatch');
    }
    if (!chunkToken?.breakdown?.length) entryErrors.push('generated chunk token has no expansion/breakdown rows for HUD');
  } else {
    entryErrors.push('token is not mapped to generated Orot lexical chunk');
  }

  if (entryErrors.length) errors.push(`${entry.entry_id}: ${entryErrors.join('; ')}`);

  reportRows.push({
    surface: entry.hebrew_word,
    codepoints: codepoints(entry.hebrew_word),
    expansion: entry.expansion || 'N/A',
    renderings: entry.strict_renderings || [],
    count: tokenRows.reduce((sum, row) => sum + (row.occurrence_count || 0), 0),
    refs: [...new Set(tokenRows.flatMap((row) => examples.get(row.token_index_id) || [row.first_source_ref].filter(Boolean)))].slice(0, 3),
    contextStatus: chunkEntry?.possible_entries?.some((item) => item.context_role === 'likely_contextual') ? 'likely contextual / abbreviation resolution' : 'not likely',
    sourceLabel: chunkSourceRows.map((row) => `${row.source_name} | ${row.license}`).filter(Boolean).join('; ') || 'N/A',
    checks: entryErrors.length ? `FAIL: ${entryErrors.join('; ')}` : 'PASS',
  });
}

const ambiguous = (tokenIndex.forms || []).find((row) => canonicalQuote(row.normalized_word) === cp('05DB', '05F4', '05D0'));
const ambiguousPass = Boolean(ambiguous && ambiguous.status !== 'matched');
if (!ambiguousPass) errors.push('Ambiguous abbreviation kaf-alef is no longer unresolved.');

const top50 = (tokenIndex.forms || [])
  .filter((row) => row.status !== 'matched')
  .sort((a, b) => (b.occurrence_count || 0) - (a.occurrence_count || 0) || String(a.surface_word).localeCompare(String(b.surface_word), 'he'))
  .slice(0, 50)
  .map((row) => ({
    row,
    refs: examples.get(row.token_index_id) || [row.first_source_ref].filter(Boolean),
    category: classifyTopUnmatched(row, knownKeys),
  }));

const categoryCounts = new Map();
for (const item of top50) categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1);

const lines = [];
lines.push('# Orot Abbreviation Layer QC Report');
lines.push('');
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push('');
lines.push('## Scope');
lines.push('');
lines.push('- Report-only QC pass');
lines.push('- New entries added: no');
lines.push('- HUD behavior changed: no');
lines.push('- Source imports: no');
lines.push('- Hebrew source, anchors, overlays, and exports changed: no');
lines.push('');
lines.push('## Validation Summary');
lines.push('');
lines.push(`- Project abbreviation entries inspected: ${(layer.entries || []).length}`);
lines.push(`- Layer source_family: ${layer.source_family}`);
lines.push(`- Layer license: ${layer.license}`);
lines.push(`- כ״א remains unresolved: ${ambiguousPass ? 'PASS' : 'FAIL'}`);
lines.push(`- QC result: ${errors.length ? 'FAIL' : 'PASS'}`);
if (errors.length) {
  lines.push('');
  lines.push('### QC Errors');
  for (const error of errors) lines.push(`- ${error}`);
}
lines.push('');
lines.push('## Added Abbreviations');
lines.push('');
lines.push('| Surface form | Codepoints | Expansion | Strict renderings | Count | Example refs | HUD status | Source/license label shown | QC |');
lines.push('|---|---|---|---|---:|---|---|---|---|');
for (const row of reportRows) {
  lines.push(`| ${escapeCell(row.surface)} | ${row.codepoints} | ${escapeCell(row.expansion)} | ${escapeCell(row.renderings.join('; '))} | ${row.count} | ${escapeCell(row.refs.join('; '))} | ${escapeCell(row.contextStatus)} | ${escapeCell(row.sourceLabel)} | ${escapeCell(row.checks)} |`);
}
lines.push('');
lines.push('## Remaining Unmatched Top 50 Diagnosis');
lines.push('');
lines.push('| Bucket | Count in top 50 |');
lines.push('|---|---:|');
for (const bucket of ['Kook vocabulary / abstract noun-adjective', 'inflected form of known lemma', 'still abbreviation', 'Aramaic/rabbinic form', 'unknown']) {
  lines.push(`| ${bucket} | ${categoryCounts.get(bucket) || 0} |`);
}
lines.push('');
lines.push('| # | Surface form | Normalized form | Count | Category | Example refs |');
lines.push('|---:|---|---|---:|---|---|');
top50.forEach((item, index) => {
  lines.push(`| ${index + 1} | ${escapeCell(item.row.surface_word)} | ${escapeCell(item.row.normalized_word)} | ${item.row.occurrence_count || 0} | ${escapeCell(item.category)} | ${escapeCell(item.refs.join('; '))} |`);
});
lines.push('');

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');

console.log(JSON.stringify({
  report: reportPath,
  qc: errors.length ? 'FAIL' : 'PASS',
  entries: (layer.entries || []).length,
  ambiguousKafAlefUnresolved: ambiguousPass,
  top50Buckets: Object.fromEntries(categoryCounts),
}, null, 2));

import fs from 'node:fs';
import path from 'node:path';

const lexicalDir = 'data/lexical';
const reportPath = 'reports/orot-unmatched-token-frequency-report.md';

const cp = (...hex) => hex.map((value) => String.fromCharCode(Number.parseInt(value, 16))).join('');
const tokenIndex = JSON.parse(fs.readFileSync(path.join(lexicalDir, 'token-index.json'), 'utf8'));
const occurrences = JSON.parse(fs.readFileSync(path.join(lexicalDir, 'occurrences', 'orot.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(lexicalDir, 'lexicon.json'), 'utf8'));

const entriesById = new Map();
for (const layer of manifest.layer_files || []) {
  if (!layer.path) continue;
  const layerPath = path.join(lexicalDir, layer.path);
  if (!fs.existsSync(layerPath)) continue;
  const layerJson = JSON.parse(fs.readFileSync(layerPath, 'utf8'));
  for (const entry of layerJson.entries || []) entriesById.set(entry.entry_id, entry);
}

const examplesByToken = new Map();
for (const unit of Object.values(occurrences.units || {})) {
  const seenInUnit = new Set();
  for (const paragraph of unit.paragraphs || []) {
    for (const tokenId of paragraph.token_index_ids || []) seenInUnit.add(tokenId);
  }
  for (const tokenId of seenInUnit) {
    const refs = examplesByToken.get(tokenId) || [];
    if (refs.length < 3 && !refs.includes(unit.source_ref)) refs.push(unit.source_ref);
    examplesByToken.set(tokenId, refs);
  }
}

const forms = tokenIndex.forms || [];
const matched = forms.filter((row) => row.status === 'matched');
const unmatched = forms.filter((row) => row.status !== 'matched');

function entryFamilies(row) {
  const entry = entriesById.get(row.lexicon_entry_id);
  return new Set((entry?.source_rows || [])
    .map((source) => source.source_family || source.source_name)
    .filter(Boolean));
}

const layerCounts = {
  project_overrides: matched.filter((row) => entryFamilies(row).has('workspace')).length,
  wikidata_cc0: matched.filter((row) => entryFamilies(row).has('wikidata')).length,
  openscriptures_cc_by_4: matched.filter((row) => entryFamilies(row).has('openscriptures')).length,
  parser_affix_resolution: matched.filter((row) => row.match_method === 'affix_parser').length,
  kaikki_placeholder: matched.filter((row) => {
    const families = entryFamilies(row);
    return families.has('kaikki') || families.has('wiktionary');
  }).length,
};

const prefixes = new Set([
  cp('05D5'),
  cp('05D4'),
  cp('05D1'),
  cp('05DB'),
  cp('05DC'),
  cp('05DE'),
  cp('05E9'),
]);
const prefixCombos = [
  cp('05DC', '05D4'),
  cp('05D5', '05DC'),
  cp('05D5', '05D1'),
  cp('05D5', '05D4'),
  cp('05E9', '05D4'),
  cp('05D1', '05D4'),
  cp('05DE', '05D4'),
  cp('05DB', '05D4'),
  cp('05D5', '05DB'),
];
const nounEndings = [
  cp('05D5', '05EA'),
  cp('05D9', '05DE'),
  cp('05D9', '05EA'),
  cp('05D9', '05D5', '05EA'),
  cp('05D9', '05D4', '05DE'),
  cp('05D9', '05D4', '05E0'),
  cp('05D9', '05D4'),
  cp('05D9', '05D5'),
  cp('05E0', '05D5'),
  cp('05DB', '05DE'),
  cp('05DB', '05E0'),
  cp('05D4', '05DE'),
  cp('05D4', '05E0'),
  cp('05EA', '05DE'),
  cp('05EA', '05E0'),
  cp('05EA', '05D9'),
  cp('05D4'),
];
const verbStarters = [
  cp('05D0'),
  cp('05D9'),
  cp('05EA'),
  cp('05E0'),
  cp('05D4', '05EA'),
  cp('05DC', '05D4'),
];
const verbEndings = [
  cp('05D5'),
  cp('05D4'),
  cp('05EA', '05D9'),
  cp('05E0', '05D5'),
  cp('05D9', '05DE'),
  cp('05D5', '05EA'),
];

const functionWords = new Set([
  cp('05D6', '05D4', '05D5'),
  cp('05D6', '05D5'),
  cp('05D6', '05D4'),
  cp('05D6', '05D0', '05EA'),
  cp('05D0', '05DC', '05D4'),
  cp('05D0', '05DC', '05D5'),
  cp('05D4', '05E0'),
  cp('05D4', '05D5', '05D0'),
  cp('05D4', '05D9', '05D0'),
  cp('05D4', '05DE'),
  cp('05D4', '05DE', '05D4'),
  cp('05DE', '05D9'),
  cp('05DE', '05D4'),
  cp('05DE', '05DE', '05D4'),
  cp('05E9', '05DE', '05D4'),
  cp('05E9', '05DB', '05E0'),
  cp('05E9', '05D4', '05E0'),
  cp('05E9', '05D0', '05D6'),
  cp('05E2', '05D3', '05D9', '05E0'),
  cp('05D3', '05D5', '05E7', '05D0'),
  cp('05D0', '05E2', '05E4'),
  cp('05DE', '05DE', '05D9', '05DC', '05D0'),
  cp('05DB', '05D3', '05D9'),
  cp('05D1', '05DC', '05D9'),
  cp('05DB', '05DC', '05D5', '05DE'),
  cp('05DB', '05DE', '05D5'),
  cp('05D0', '05DC', '05D0'),
  cp('05D0', '05D1', '05DC'),
  cp('05D0', '05DE', '05E0'),
  cp('05D0', '05E9', '05E8'),
  cp('05E2', '05DB'),
  cp('05E2', '05E4'),
  cp('05E2', '05DB', '05E4'),
  cp('05DB', '05D0'),
  cp('05D2', '05DB'),
  cp('05E2', '05D9'),
  cp('05D0', '05D0'),
  cp('05D0', '05DB'),
  cp('05D0', '05E4', '05D9'),
  cp('05DE', '05DE'),
  cp('05D5', '05DB', '05D5'),
  cp('05E2', '05DB', '05D5', '05DE'),
]);
const properHints = new Set([
  cp('05D0', '05D1', '05E8', '05D4', '05DE'),
  cp('05D9', '05E6', '05D7', '05E7'),
  cp('05D9', '05E2', '05E7', '05D1'),
  cp('05DE', '05E9', '05D4'),
  cp('05D0', '05D4', '05E8', '05E0'),
  cp('05D3', '05D5', '05D3'),
  cp('05E9', '05DC', '05DE', '05D4'),
  cp('05D9', '05E9', '05E8', '05D0', '05DC'),
  cp('05D9', '05E8', '05D5', '05E9', '05DC', '05D9', '05DE'),
  cp('05E6', '05D9', '05D5', '05E0'),
  cp('05D9', '05D5', '05E1', '05E4'),
  cp('05D9', '05D4', '05D5', '05D3', '05D4'),
  cp('05E8', '05D7', '05DC'),
  cp('05DC', '05D0', '05D4'),
  cp('05E2', '05E9', '05D5'),
  cp('05D0', '05E4', '05E8', '05D9', '05DE'),
  cp('05DE', '05E0', '05E9', '05D4'),
  cp('05D1', '05D1', '05DC'),
  cp('05D0', '05E9', '05D5', '05E8'),
  cp('05D0', '05D9', '05E8', '05D5', '05E4', '05D0'),
]);
const phraseHints = new Set([
  cp('05E2', '05D5', '05DE', '05E7'),
  cp('05D1', '05EA', '05D5', '05E8'),
  cp('05E2', '05DC', '05D9', '05D3', '05D9'),
  cp('05E2', '05DC', '05E4', '05D9'),
  cp('05D0', '05E2', '05E4'),
  cp('05E2', '05DB', '05E4'),
  cp('05D2', '05DB'),
  cp('05DB', '05D0'),
  cp('05E2', '05DB'),
  cp('05E2', '05E4'),
  cp('05E2', '05D9'),
]);

function hasAbbrev(value) {
  return Array.from(String(value || '')).some((char) => {
    const code = char.codePointAt(0);
    return code === 0x05F3 || code === 0x05F4 || code === 0x27 || code === 0x22;
  });
}

function startsWithAny(value, candidates) {
  return candidates.some((candidate) => value.startsWith(candidate));
}

function endsWithAny(value, candidates) {
  return candidates.some((candidate) => value.endsWith(candidate));
}

function categorize(row) {
  const surface = row.surface_word || '';
  const normalized = row.normalized_word || '';
  if (hasAbbrev(surface) || hasAbbrev(normalized)) return 'abbreviation';
  if (properHints.has(normalized) || /^[A-Z]/.test(surface)) return 'proper noun';
  if (functionWords.has(normalized) || normalized.length <= 2) return 'prefix/function word';
  if (phraseHints.has(normalized)) return 'phrase form';
  if (prefixCombos.some((combo) => normalized.startsWith(combo))) return 'prefix/function word';
  if (prefixes.has(Array.from(normalized)[0]) && normalized.length <= 5) return 'prefix/function word';
  if (startsWithAny(normalized, verbStarters) && normalized.length > 3 && (endsWithAny(normalized, verbEndings) || normalized.startsWith(cp('05DC', '05D4')))) return 'inflected verb';
  if (endsWithAny(normalized, nounEndings)) return 'inflected noun';
  if (prefixes.has(Array.from(normalized)[0]) && normalized.length > 4) return 'inflected noun';
  return 'unknown';
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

const top100 = unmatched
  .slice()
  .sort((a, b) => (b.occurrence_count || 0) - (a.occurrence_count || 0) || String(a.surface_word).localeCompare(String(b.surface_word), 'he'))
  .slice(0, 100)
  .map((row, index) => ({
    rank: index + 1,
    surface: row.surface_word,
    normalized: row.normalized_word,
    count: row.occurrence_count || 0,
    category: categorize(row),
    refs: examplesByToken.get(row.token_index_id) || [row.first_source_ref].filter(Boolean),
  }));

const categoryTotals = new Map();
for (const row of unmatched) {
  const category = categorize(row);
  const current = categoryTotals.get(category) || { unique: 0, occurrences: 0 };
  current.unique += 1;
  current.occurrences += row.occurrence_count || 0;
  categoryTotals.set(category, current);
}
const sortedCategories = Array.from(categoryTotals.entries()).sort((a, b) => b[1].occurrences - a[1].occurrences);

const lines = [];
lines.push('# Orot Unmatched Token Frequency Report');
lines.push('');
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push('');
lines.push('## Scope');
lines.push('');
lines.push('- Work: Orot only');
lines.push('- Source imports: none');
lines.push('- New definitions added: none');
lines.push('- HUD behavior changed: no');
lines.push('- Kaikki/Wiktionary data added: no');
lines.push('- Count source: current `data/lexical/token-index.json` plus `data/lexical/occurrences/orot.json`');
lines.push('');
lines.push('## Summary');
lines.push('');
lines.push(`- Total unique Orot surface forms: ${tokenIndex.total_unique_surface_forms ?? forms.length}`);
lines.push(`- Currently matched: ${matched.length}`);
lines.push(`- Currently unmatched: ${unmatched.length}`);
lines.push(`- Total Orot token occurrences: ${tokenIndex.total_occurrences}`);
lines.push('');
lines.push('## Matched By Layer');
lines.push('');
lines.push('Counts are unique surface-form rows. Source-family counts can overlap where one lexical entry contains multiple clean source families. Parser count is separate and based on `match_method`.');
lines.push('');
lines.push('| Layer | Count |');
lines.push('|---|---:|');
lines.push(`| Project overrides | ${layerCounts.project_overrides} |`);
lines.push(`| Wikidata CC0 | ${layerCounts.wikidata_cc0} |`);
lines.push(`| OpenScriptures CC BY 4.0 | ${layerCounts.openscriptures_cc_by_4} |`);
lines.push(`| Parser/affix resolution | ${layerCounts.parser_affix_resolution} |`);
lines.push(`| Kaikki/Wiktionary placeholder | ${layerCounts.kaikki_placeholder} |`);
lines.push('');
lines.push('## Unmatched Buckets');
lines.push('');
lines.push('| Mechanical category | Unique forms | Token occurrences |');
lines.push('|---|---:|---:|');
for (const [category, totals] of sortedCategories) lines.push(`| ${category} | ${totals.unique} | ${totals.occurrences} |`);

const largest = sortedCategories[0];
lines.push('');
lines.push('## Largest Missing Bucket');
lines.push('');
if (largest) {
  const [category, totals] = largest;
  lines.push(`The largest unmatched bucket by token occurrences appears to be **${category}**: ${totals.occurrences} occurrences across ${totals.unique} unique surface forms.`);
  if (category === 'inflected noun') lines.push('The practical implication is that the next safe coverage win is likely better morphology for prefixed/inflected nominal forms, not more UI work.');
  else if (category === 'abbreviation') lines.push('The practical implication is that abbreviation expansion should be handled as a separate project-authored rule layer, not by loose dictionary matching.');
  else if (category === 'prefix/function word') lines.push('The practical implication is that a small audited function-word/particle rule layer may resolve high-frequency tokens more safely than broad dictionary enrichment.');
  else lines.push('The practical implication is that this bucket needs manual review before broad automatic enrichment.');
}
lines.push('');
lines.push('## Top 100 Unmatched Tokens By Frequency');
lines.push('');
lines.push('| # | Surface form | Normalized form | Count | Mechanical category | Example refs |');
lines.push('|---:|---|---|---:|---|---|');
for (const row of top100) lines.push(`| ${row.rank} | ${escapeCell(row.surface)} | ${escapeCell(row.normalized)} | ${row.count} | ${escapeCell(row.category)} | ${escapeCell(row.refs.join('; '))} |`);
lines.push('');

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
console.log(JSON.stringify({
  total_unique: tokenIndex.total_unique_surface_forms ?? forms.length,
  matched: matched.length,
  unmatched: unmatched.length,
  layerCounts,
  largestBucket: largest ? { category: largest[0], ...largest[1] } : null,
  report: reportPath,
}, null, 2));

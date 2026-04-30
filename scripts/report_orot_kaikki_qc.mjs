import fs from 'node:fs';
import path from 'node:path';

const lexicalDir = 'data/lexical';
const reportPath = 'reports/orot-kaikki-qc-report.md';
const tokenIndex = JSON.parse(fs.readFileSync(path.join(lexicalDir, 'token-index.json'), 'utf8'));
const occurrences = JSON.parse(fs.readFileSync(path.join(lexicalDir, 'occurrences', 'orot.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(lexicalDir, 'lexicon.json'), 'utf8'));

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

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function sourceFamilies(entry) {
  return new Set((entry?.source_rows || []).map((row) => row.source_family || row.source_name).filter(Boolean));
}

function hasAbbreviation(value) {
  return /['"\u05F3\u05F4]/.test(String(value || ''));
}

function isShortLetter(value) {
  return Array.from(normalizeHebrew(value)).length <= 1;
}

function glossRisk(glosses) {
  const text = glosses.join(' | ').toLowerCase();
  const flags = [];
  if (!glosses.length) flags.push('no default rendering');
  if (glosses.some((gloss) => gloss.length > 75)) flags.push('long/broad gloss');
  if (/\bletter\b|\bnumeral\b|representation of laughter|figuratively|species|canis|gender/.test(text)) flags.push('noisy/broad English');
  return flags;
}

function getExamplesByToken() {
  const examples = new Map();
  for (const unit of Object.values(occurrences.units || {})) {
    const seenInUnit = new Set();
    for (const paragraph of unit.paragraphs || []) {
      for (const tokenId of paragraph.token_index_ids || []) seenInUnit.add(tokenId);
    }
    for (const tokenId of seenInUnit) {
      const refs = examples.get(tokenId) || [];
      if (refs.length < 3 && unit.source_ref && !refs.includes(unit.source_ref)) refs.push(unit.source_ref);
      examples.set(tokenId, refs);
    }
  }
  return examples;
}

const entriesById = new Map();
const cleanEntriesByNormalized = new Map();
for (const layer of manifest.layer_files || []) {
  if (!layer.path) continue;
  const layerJson = JSON.parse(fs.readFileSync(path.join(lexicalDir, layer.path), 'utf8'));
  for (const entry of layerJson.entries || []) {
    entriesById.set(entry.entry_id, entry);
    if (layer.source_family !== 'kaikki' && layer.source_family !== 'wiktionary') {
      const keys = new Set([normalizeHebrew(entry.hebrew_word)]);
      for (const form of entry.surface_forms || []) keys.add(normalizeHebrew(form));
      for (const key of keys) {
        if (!key) continue;
        if (!cleanEntriesByNormalized.has(key)) cleanEntriesByNormalized.set(key, new Set());
        for (const family of sourceFamilies(entry)) cleanEntriesByNormalized.get(key).add(family);
      }
    }
  }
}

const forms = tokenIndex.forms || [];
const examplesByToken = getExamplesByToken();
const kaikkiRows = forms
  .filter((row) => row.status === 'matched' && row.match_method === 'kaikki')
  .sort((a, b) => (b.occurrence_count || 0) - (a.occurrence_count || 0) || String(a.surface_word).localeCompare(String(b.surface_word), 'he'));

function summarizeKaikkiRow(row) {
  const entry = entriesById.get(row.lexicon_entry_id) || {};
  const possibleEntries = entry.possible_entries || [];
  const renderings = row.surface_renderings?.length ? row.surface_renderings : (entry.strict_renderings || []);
  const lemmas = [...new Set(possibleEntries.map((item) => item.lemma || item.match_key || entry.hebrew_word).filter(Boolean))];
  const roles = [...new Set(possibleEntries.map((item) => item.context_role || 'other_possible'))];
  const cleanFamilies = cleanEntriesByNormalized.get(row.normalized_word);
  const risks = [];

  if (possibleEntries.length > 1 || lemmas.length > 1) risks.push('homograph/multiple Kaikki candidates');
  if (entry.disambiguation_status !== 'likely' || !roles.includes('likely_contextual')) risks.push('context unresolved; should remain possible/secondary');
  if (normalizeHebrew(entry.hebrew_word) !== row.normalized_word) risks.push('surface/lemma spelling differs');
  if (hasAbbreviation(row.surface_word)) risks.push('abbreviation or citation marker');
  if (isShortLetter(row.surface_word)) risks.push('single-letter token');
  risks.push(...glossRisk(renderings));
  if (!renderings.length || hasAbbreviation(row.surface_word) || isShortLetter(row.surface_word)) risks.push('candidate for unresolved/default-hidden treatment');

  return {
    row,
    entry,
    renderings,
    lemmas,
    roles,
    cleanFamilies: cleanFamilies ? [...cleanFamilies].sort() : [],
    risks: [...new Set(risks)],
    refs: examplesByToken.get(row.token_index_id) || [row.first_source_ref].filter(Boolean),
  };
}

function canarySummary() {
  const laUmmahSurface = cp('05DC', '05B8', '05D0', '05BB', '05DE', '05B8', '05BC', '05D4');
  const betorSurface = cp('05D1', '05B0', '05BC', '05EA', '05D5', '05B9', '05E8');
  const shelNormalized = cp('05E9', '05DC');
  const laUmmah = forms.find((row) => row.surface_word === laUmmahSurface);
  const betor = forms.find((row) => row.surface_word === betorSurface);
  const shel = forms.find((row) => row.normalized_word === shelNormalized);
  const checks = [];

  const laEntry = entriesById.get(laUmmah?.lexicon_entry_id);
  checks.push({
    label: 'la-ummah',
    surface: laUmmah?.surface_word || 'MISSING',
    pass: Boolean(laUmmah && laUmmah.surface_context_status === 'resolved_prefix_base' && (laUmmah.surface_renderings || []).includes('to the nation') && laEntry && !sourceFamilies(laEntry).has('kaikki')),
    detail: laUmmah ? `${laUmmah.surface_context_status}; ${sourceFamilies(laEntry).size ? [...sourceFamilies(laEntry)].join(', ') : 'no source'}` : 'missing token',
  });

  const betorEntry = entriesById.get(betor?.lexicon_entry_id);
  checks.push({
    label: 'betor',
    surface: betor?.surface_word || 'MISSING',
    pass: Boolean(betor && betor.surface_context_status === 'resolved_fixed_expression' && (betor.surface_renderings || []).includes('as') && betorEntry && !sourceFamilies(betorEntry).has('kaikki')),
    detail: betor ? `${betor.surface_context_status}; ${sourceFamilies(betorEntry).size ? [...sourceFamilies(betorEntry)].join(', ') : 'no source'}` : 'missing token',
  });

  const shelEntry = entriesById.get(shel?.lexicon_entry_id);
  checks.push({
    label: 'shel',
    surface: shel?.surface_word || 'MISSING',
    pass: Boolean(shel && shel.match_method === 'direct' && (shel.surface_renderings || []).includes('of') && shelEntry && !sourceFamilies(shelEntry).has('kaikki')),
    detail: shel ? `${shel.match_method}; ${sourceFamilies(shelEntry).size ? [...sourceFamilies(shelEntry)].join(', ') : 'no source'}` : 'missing token',
  });
  return checks;
}

const top50Kaikki = kaikkiRows.slice(0, 50).map(summarizeKaikkiRow);
const riskyRows = kaikkiRows.map(summarizeKaikkiRow).filter((item) => item.risks.length).slice(0, 100);
const unmatchedTop50 = forms
  .filter((row) => row.status !== 'matched')
  .sort((a, b) => (b.occurrence_count || 0) - (a.occurrence_count || 0) || String(a.surface_word).localeCompare(String(b.surface_word), 'he'))
  .slice(0, 50);

const lines = [];
lines.push('# Orot Kaikki Lexical Enrichment QC Report');
lines.push('');
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push('');
lines.push('## Scope');
lines.push('');
lines.push('- Report-only QC pass');
lines.push('- Source imports: none');
lines.push('- New definitions: none');
lines.push('- HUD behavior changed: no');
lines.push('- Hebrew source, overlays, exports, and anchors changed: no');
lines.push('');
lines.push('## Summary');
lines.push('');
lines.push(`- Kaikki-matched Orot surface forms inspected: ${kaikkiRows.length}`);
lines.push(`- Highest-frequency Kaikki rows listed: ${top50Kaikki.length}`);
lines.push(`- Risk-flagged Kaikki rows sampled: ${riskyRows.length}`);
lines.push(`- Remaining unmatched surface forms after Kaikki: ${forms.filter((row) => row.status !== 'matched').length}`);
lines.push('');
lines.push('## Canaries');
lines.push('');
lines.push('| Canary | Surface | Result | Detail |');
lines.push('|---|---|---|---|');
for (const check of canarySummary()) {
  lines.push(`| ${escapeCell(check.label)} | ${escapeCell(check.surface)} | ${check.pass ? 'PASS' : 'FAIL'} | ${escapeCell(check.detail)} |`);
}
lines.push('');
lines.push('## 50 Highest-Frequency Tokens Newly Matched By Kaikki');
lines.push('');
lines.push('| # | Surface form | Normalized form | Count | Example refs | Kaikki lemma/spelling used | Strict renderings shown | Context status | Existing clean entry also exists | Risk flags |');
lines.push('|---:|---|---|---:|---|---|---|---|---|---|');
top50Kaikki.forEach((item, index) => {
  lines.push(`| ${index + 1} | ${escapeCell(item.row.surface_word)} | ${escapeCell(item.row.normalized_word)} | ${item.row.occurrence_count || 0} | ${escapeCell(item.refs.join('; '))} | ${escapeCell(item.lemmas.join('; ') || item.entry.hebrew_word || 'N/A')} | ${escapeCell(item.renderings.join('; ') || 'N/A')} | ${escapeCell(item.roles.includes('likely_contextual') ? 'likely contextual' : 'possible only')} | ${escapeCell(item.cleanFamilies.length ? item.cleanFamilies.join(', ') : 'no')} | ${escapeCell(item.risks.join('; ') || 'none')} |`);
});
lines.push('');
lines.push('## Risky Cases To Review');
lines.push('');
lines.push('| Surface form | Normalized form | Count | Kaikki lemma/spelling used | Renderings | Risk flags | Recommendation |');
lines.push('|---|---|---:|---|---|---|---|');
for (const item of riskyRows.slice(0, 50)) {
  const shouldUnresolve = item.risks.includes('candidate for unresolved/default-hidden treatment');
  const recommendation = shouldUnresolve ? 'Consider leaving unresolved or hiding as secondary.' : 'Keep as possible entry only unless context resolver improves.';
  lines.push(`| ${escapeCell(item.row.surface_word)} | ${escapeCell(item.row.normalized_word)} | ${item.row.occurrence_count || 0} | ${escapeCell(item.lemmas.join('; ') || item.entry.hebrew_word || 'N/A')} | ${escapeCell(item.renderings.join('; ') || 'N/A')} | ${escapeCell(item.risks.join('; '))} | ${escapeCell(recommendation)} |`);
}
lines.push('');
lines.push('## Remaining Unmatched Top 50 After Kaikki');
lines.push('');
lines.push('| # | Surface form | Normalized form | Count | Example refs |');
lines.push('|---:|---|---|---:|---|');
unmatchedTop50.forEach((row, index) => {
  const refs = examplesByToken.get(row.token_index_id) || [row.first_source_ref].filter(Boolean);
  lines.push(`| ${index + 1} | ${escapeCell(row.surface_word)} | ${escapeCell(row.normalized_word)} | ${row.occurrence_count || 0} | ${escapeCell(refs.join('; '))} |`);
});
lines.push('');

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');

console.log(JSON.stringify({
  report: reportPath,
  kaikkiMatched: kaikkiRows.length,
  topKaikkiRows: top50Kaikki.length,
  riskFlaggedSample: riskyRows.length,
  canaries: canarySummary(),
  remainingUnmatched: unmatchedTop50.length,
}, null, 2));

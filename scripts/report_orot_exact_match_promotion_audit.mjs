import fs from 'node:fs';
import path from 'node:path';

const lexicalDir = path.join('data', 'lexical');
const tokenIndexPath = path.join(lexicalDir, 'token-index.json');
const lexiconManifestPath = path.join(lexicalDir, 'lexicon.json');
const occurrencePath = path.join(lexicalDir, 'occurrences', 'orot.json');
const reportPath = path.join('reports', 'orot-exact-match-promotion-audit.md');

const tokenRe = /[\u05D0-\u05EA][\u0591-\u05C7\u05D0-\u05EA\u05F3\u05F4'"]*/gu;
const niqqudRe = /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/gu;
const niqqudTestRe = /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/u;
const finalLetters = new Map([
  ['\u05DA', '\u05DB'],
  ['\u05DD', '\u05DE'],
  ['\u05DF', '\u05E0'],
  ['\u05E3', '\u05E4'],
  ['\u05E5', '\u05E6'],
]);

const knownRiskyExactMatches = new Set([
  'אור',
  'אשר',
  'אבל',
  'רוח',
  'אלה',
  'עוד',
  'ציון',
  'בית',
]);

const knownFunctionWordsNeedingGrammarRules = new Set([
  'אוֹ',
  'עִם',
  'רַק',
  'את',
  'אשר',
  'אל',
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeHebrewPunctuation(value) {
  return String(value || '')
    .replace(/([\u0590-\u05FF])'/gu, '$1\u05F3')
    .replace(/([\u0590-\u05FF])"(?=[\u0590-\u05FF])/gu, '$1\u05F4')
    .normalize('NFC');
}

function normalizeHebrewToken(value) {
  const stripped = normalizeHebrewPunctuation(value).replace(niqqudRe, '');
  return Array.from(stripped, (char) => finalLetters.get(char) || char).join('');
}

function hasNiqqud(value) {
  return niqqudTestRe.test(String(value || ''));
}

function cleanRendering(value) {
  return String(value || '').trim().replace(/[.;]+$/u, '');
}

function isUsableShortRendering(value) {
  const rendering = cleanRendering(value);
  if (!rendering || rendering.length > 24) return false;
  if (/[()[\];,×+]/u.test(rendering)) return false;
  if (/\b(perhaps|properly|figuratively|literally|implication|transitive|intransitive|name|symbolical|typically|compare|probably|especially|specially|adverbially|partitively|hence|i\.e|adjective|conjunctional|preposition|genus|Mediterranean|coffee|oud|marble|castle|fort|munition|dream|sleep|Jukal|entry|entrance|Pistacia|mourning|grieving)\b/iu.test(rendering)) return false;
  if (/^(a|an|the)\s+/iu.test(rendering)) return false;
  if (/^[A-Z]/u.test(rendering) && !/^(Israel|Torah|God|Jerusalem)$/iu.test(rendering)) return false;
  return true;
}

function shortRenderings(candidate) {
  return Array.from(new Set((candidate.strict_renderings || [])
    .map(cleanRendering)
    .filter(isUsableShortRendering)))
    .slice(0, 4);
}

function visibleRenderings(entry) {
  const likely = (entry?.possible_entries || []).filter((candidate) => candidate.context_role === 'likely_contextual');
  return Array.from(new Set([
    ...(entry?.strict_renderings || []),
    ...likely.flatMap((candidate) => candidate.strict_renderings || []),
  ].map(cleanRendering).filter(isUsableShortRendering)));
}

function exactMatchKind(row, candidate) {
  const lemma = normalizeHebrewPunctuation(candidate.lemma || '');
  const surface = normalizeHebrewPunctuation(row.surface_word || '');
  if (lemma && lemma === surface && hasNiqqud(row.surface_word) && hasNiqqud(candidate.lemma)) {
    return 'exact vocalized source lemma';
  }
  if (hasNiqqud(row.surface_word) && hasNiqqud(candidate.lemma) && normalizeHebrewToken(candidate.lemma) === row.normalized_word) {
    return 'vocalized normalized source lemma';
  }
  if (!hasNiqqud(row.surface_word) && !hasNiqqud(candidate.lemma) && candidate.source_family === 'wikidata' && lemma === surface) {
    return 'exact unvocalized Wikidata lemma';
  }
  if (candidate.match_key && candidate.match_key === row.normalized_word && normalizeHebrewToken(candidate.lemma) === row.normalized_word) {
    return 'exact normalized match key';
  }
  return '';
}

function sourcePriority(candidate) {
  if (candidate.source_family === 'openscriptures') return 0;
  if (candidate.source_family === 'wikidata') return 1;
  return 2;
}

function entryMapFromManifest(manifest) {
  const entries = [];
  for (const layer of manifest.layer_files || []) {
    if (!layer.path) continue;
    const layerPath = path.join(lexicalDir, layer.path);
    if (!fs.existsSync(layerPath)) continue;
    const layerJson = readJson(layerPath);
    for (const entry of layerJson.entries || []) {
      entries.push({ ...entry, layer_path: layer.path });
    }
  }
  return new Map(entries.map((entry) => [entry.entry_id, entry]));
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

function classifyUnmatched(row) {
  const surface = String(row.surface_word || '');
  const normalized = String(row.normalized_word || '');
  if (/[\u05F3\u05F4'"]/u.test(surface)) return 'abbreviation or quote artifact';
  if (normalized.length <= 2) return 'function word or short form';
  if (/^[ובכלמשה]{1,2}[\u05D0-\u05EA]{3,}$/u.test(normalized)) return 'prefixed or inflected form';
  if (/[וי]$/u.test(normalized) || /[המנת]$/u.test(normalized)) return 'inflected noun/adjective/verb';
  return 'unknown';
}

function markdownCell(value) {
  return String(value ?? '').replace(/\|/gu, '\\|').replace(/\n/gu, ' ');
}

function formatCandidate(candidate) {
  return `${candidate.candidate.entry_key} / ${candidate.candidate.lemma} / ${candidate.renderings.join('; ')} / ${candidate.kind}`;
}

const tokenIndex = readJson(tokenIndexPath);
const manifest = readJson(lexiconManifestPath);
const occurrences = readJson(occurrencePath);
const entriesById = entryMapFromManifest(manifest);
const examples = examplesByTokenId(occurrences);

const auditRows = [];
const rejectedRows = [];

for (const row of tokenIndex.forms || []) {
  if (row.status !== 'matched' || !row.lexicon_entry_id) continue;
  if (['project_abbreviation', 'project_orot_technical_term', 'quote_artifact_cleanup', 'affix_parser'].includes(row.match_method)) continue;

  const entry = entriesById.get(row.lexicon_entry_id);
  if (!entry) continue;

  const currentRenderings = visibleRenderings(entry);
  if ((entry.possible_entries || []).some((candidate) => candidate.context_role === 'likely_contextual') && currentRenderings.length) continue;

  const exactCandidates = [];
  for (const candidate of entry.possible_entries || []) {
    if (!['openscriptures', 'wikidata'].includes(candidate.source_family)) continue;
    const kind = exactMatchKind(row, candidate);
    if (!kind) continue;
    const renderings = shortRenderings(candidate);
    if (!renderings.length) continue;
    exactCandidates.push({ candidate, kind, renderings });
  }
  if (!exactCandidates.length) continue;

  exactCandidates.sort((left, right) => {
    const leftExact = left.kind === 'exact vocalized source lemma' ? 0 : 1;
    const rightExact = right.kind === 'exact vocalized source lemma' ? 0 : 1;
    return leftExact - rightExact
      || sourcePriority(left.candidate) - sourcePriority(right.candidate)
      || String(left.candidate.source_id).localeCompare(String(right.candidate.source_id));
  });

  const vocalizedExact = exactCandidates.filter((item) => item.kind === 'exact vocalized source lemma');
  const distinctRenderingGroups = new Set(vocalizedExact.map((item) => item.renderings.join('|')));
  const safePromotion = vocalizedExact.length === 1
    && distinctRenderingGroups.size === 1
    && !knownFunctionWordsNeedingGrammarRules.has(row.surface_word)
    && !knownRiskyExactMatches.has(row.surface_word);

  const item = {
    row,
    entry,
    candidates: exactCandidates,
    examples: examples.get(row.token_index_id) || [row.first_source_ref].filter(Boolean),
  };

  if (safePromotion) {
    auditRows.push(item);
  } else {
    rejectedRows.push({
      ...item,
      reason: knownFunctionWordsNeedingGrammarRules.has(row.surface_word)
        ? 'function word needs explicit grammar rule'
        : knownRiskyExactMatches.has(row.surface_word)
          ? 'known risky Orot homograph'
          : 'ambiguous or unvocalized exact match',
    });
  }
}

const promotedRows = [];
const rejectedTop = rejectedRows
  .slice()
  .sort((left, right) => (right.row.occurrence_count || 0) - (left.row.occurrence_count || 0))
  .slice(0, 50);
const topUnmatched = (tokenIndex.forms || [])
  .filter((row) => row.status !== 'matched')
  .slice()
  .sort((left, right) => (right.occurrence_count || 0) - (left.occurrence_count || 0) || String(left.surface_word).localeCompare(String(right.surface_word), 'he'))
  .slice(0, 50);

const lines = [];
lines.push('# Orot Exact-Match Promotion Audit');
lines.push('');
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push('');
lines.push('## Scope');
lines.push('');
lines.push('- Work: Orot only');
lines.push('- New external sources imported: no');
lines.push('- New broad vocabulary added: no');
lines.push('- Hebrew source, anchors, overlays, and exports changed: no');
lines.push('- Policy: promote only exact, non-noisy source matches. Ambiguous unvocalized homographs are rejected.');
lines.push('');
lines.push('## Summary');
lines.push('');
lines.push(`- Matched before audit: ${tokenIndex.matched_surface_forms}`);
lines.push(`- Tokens promoted automatically: ${promotedRows.length}`);
lines.push(`- Matched after audit: ${tokenIndex.matched_surface_forms}`);
lines.push(`- Exact-match candidates rejected for risk/manual review: ${rejectedRows.length}`);
lines.push(`- Remaining unmatched: ${tokenIndex.unmatched_surface_forms}`);
lines.push('');
lines.push('## Automatically Promoted');
lines.push('');
lines.push('No additional Orot tokens were promoted in this pass. The audit found that the remaining candidates either need explicit grammar rules or are risky unvocalized homographs.');
lines.push('');
lines.push('## Rejected Risky Exact-Match Candidates');
lines.push('');
lines.push('| Token | Normalized | Count | Candidate examples | Reason | Example refs |');
lines.push('|---|---|---:|---|---|---|');
for (const item of rejectedTop) {
  lines.push(`| ${markdownCell(item.row.surface_word)} | ${markdownCell(item.row.normalized_word)} | ${item.row.occurrence_count || 0} | ${markdownCell(item.candidates.slice(0, 3).map(formatCandidate).join(' || '))} | ${markdownCell(item.reason)} | ${markdownCell(item.examples.join('; '))} |`);
}
lines.push('');
lines.push('## Remaining Top 50 Unmatched');
lines.push('');
lines.push('| Token | Normalized | Count | Category | Example refs |');
lines.push('|---|---|---:|---|---|');
for (const row of topUnmatched) {
  lines.push(`| ${markdownCell(row.surface_word)} | ${markdownCell(row.normalized_word)} | ${row.occurrence_count || 0} | ${classifyUnmatched(row)} | ${markdownCell((examples.get(row.token_index_id) || [row.first_source_ref].filter(Boolean)).join('; '))} |`);
}
lines.push('');

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');

console.log(JSON.stringify({
  matched_before: tokenIndex.matched_surface_forms,
  promoted: promotedRows.length,
  matched_after: tokenIndex.matched_surface_forms,
  rejected_risky_cases: rejectedRows.length,
  unmatched: tokenIndex.unmatched_surface_forms,
  report: reportPath,
}, null, 2));

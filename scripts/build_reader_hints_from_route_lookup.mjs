#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const DEFAULT_WORKS = ['esther', 'ezra', 'nehemiah', 'obadiah', 'malachi'];
const ROUTE_LOOKUP_MANIFEST = 'data/definitions/hud-route-lookup/manifest.json';
const OUTPUT_DIR = 'data/lexical/reader-hints';
const DEFAULT_REPORT = 'reports/reader-hints-from-route-lookup-report.md';

const productionSections = new Set([
  'strict_hebrew',
  'strict_aramaic',
  'morphology',
  'lemma',
  'subphrase_evidence',
  'biblical_paraphrase_evidence',
  'citable_paraphrase_evidence',
  'usage_evidence',
  'phrase_evidence',
]);
const routeSectionRank = new Map([
  ['strict_hebrew', 0],
  ['strict_aramaic', 1],
  ['morphology', 2],
  ['lemma', 3],
  ['subphrase_evidence', 4],
  ['biblical_paraphrase_evidence', 5],
  ['citable_paraphrase_evidence', 6],
  ['usage_evidence', 7],
  ['phrase_evidence', 8],
  ['audit', 9],
]);
const usageEvidenceRouteTypes = new Set([
  'usage_evidence',
  'phrase_evidence',
  'phrase_row',
  'phrase_occurrence',
  'subphrase_evidence',
  'source_phrase_evidence',
]);
const requiredSourceRowFields = ['source_name', 'source_id', 'source_url', 'license', 'license_url'];

function parseArgs(argv) {
  const args = { works: DEFAULT_WORKS, report: DEFAULT_REPORT };
  argv.forEach((arg) => {
    if (arg.startsWith('--works=')) args.works = arg.slice('--works='.length).split(',').map((item) => item.trim()).filter(Boolean);
    else if (arg.startsWith('--report=')) args.report = arg.slice('--report='.length);
  });
  return args;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  const target = path.join(REPO_ROOT, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(relativePath, value) {
  const target = path.join(REPO_ROOT, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value, 'utf8');
}

function cleanValues(value) {
  return Array.isArray(value) ? value.filter((item) => item !== undefined && item !== null) : [];
}

function firstPresentValue(values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') || '';
}

function normalizeHebrewKey(value) {
  return String(value || '')
    .normalize('NFC')
    .replace(/[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/g, '')
    .replace(/\u05DA/g, '\u05DB')
    .replace(/\u05DD/g, '\u05DE')
    .replace(/\u05DF/g, '\u05E0')
    .replace(/\u05E3/g, '\u05E4')
    .replace(/\u05E5/g, '\u05E6');
}

function codepointKey(value, prefixLength) {
  const chars = [...String(value || '')].slice(0, prefixLength);
  if (!chars.length) return 'empty';
  const first = chars[0].codePointAt(0);
  if (first < 0x05d0 || first > 0x05ea) return 'other';
  return chars.map((char) => char.codePointAt(0).toString(16).padStart(4, '0')).join('-');
}

function displayLicense(row) {
  const license = String(row?.license || '').trim();
  if (String(row?.source_family || '').toLowerCase() === 'workspace' && /^N\/A\s*-\s*project/i.test(license)) {
    return 'project-authored / CC0';
  }
  return license || 'N/A';
}

function sourceRowHasPublicFields(row) {
  return Boolean(
    row
    && requiredSourceRowFields.every((field) => String(row[field] || '').trim())
    && displayLicense(row) !== 'N/A'
  );
}

function routeSection(card) {
  return card.display_section || card.route_type || card.route_family || 'audit';
}

function isUsageEvidenceCard(card) {
  if (!card) return false;
  const routeFields = [card.display_section, card.route_type, card.route_family, card.answer_role, card.meaning_quality]
    .map((value) => String(value || '').toLowerCase().replace(/[\s-]+/g, '_'))
    .filter(Boolean);
  return routeFields.some((value) => usageEvidenceRouteTypes.has(value)) || Boolean(card.usage_note || card.frame_label);
}

function routeRenderings(card) {
  if (!card) return [];
  if (isUsageEvidenceCard(card)) {
    return [firstPresentValue([card.linked_route_definition, card.linked_definition, card.route_definition, card.route_definition_text]) || 'observed usage only'];
  }
  const genericUsage = 'Usage context only; no meaning is forced by this phrase row.';
  const values = [];
  const definition = firstPresentValue([card.definition, card.gloss]);
  if (definition && definition !== genericUsage) values.push(definition);
  const meaningClaim = firstPresentValue([card.meaning_claim]);
  if (meaningClaim) values.push(meaningClaim);
  return values;
}

function routeScore(card) {
  const base = Number.isFinite(card.adjusted_score)
    ? card.adjusted_score
    : (Number.isFinite(card.raw_score) ? card.raw_score : (Number.isFinite(card.confidence_percent) ? card.confidence_percent : 0));
  const penalty = Number.isFinite(card.lookup_penalty) ? card.lookup_penalty : 0;
  return Math.max(0, Math.round(base - penalty));
}

function compareRouteCards(leftCard, rightCard) {
  const left = [
    -(routeScore(leftCard) ?? -1000),
    routeSectionRank.get(routeSection(leftCard)) ?? 9,
    -(Number.isFinite(leftCard.answer_score) ? leftCard.answer_score : 0),
    String(leftCard.card_id || ''),
  ];
  const right = [
    -(routeScore(rightCard) ?? -1000),
    routeSectionRank.get(routeSection(rightCard)) ?? 9,
    -(Number.isFinite(rightCard.answer_score) ? rightCard.answer_score : 0),
    String(rightCard.card_id || ''),
  ];
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] < right[index]) return -1;
    if (left[index] > right[index]) return 1;
  }
  return 0;
}

function addLookupCandidate(map, key, relation, penalty = 0) {
  const normalized = normalizeHebrewKey(key);
  if (!normalized || map.has(normalized)) return;
  map.set(normalized, { key: normalized, relation, penalty });
}

function lookupCandidatesFor(clickedForm, normalized) {
  const candidates = new Map();
  addLookupCandidate(candidates, normalized || clickedForm, 'exact', 0);
  const primary = normalizeHebrewKey(normalized || clickedForm);
  String(primary || '').split(/[\u05BE-]/).filter((part) => part && part !== primary).forEach((part) => addLookupCandidate(candidates, part, 'maqaf component', 12));
  const prefixPattern = /^[\u05D5\u05D1\u05DB\u05DC\u05DE\u05D4\u05E9]/;
  for (let pass = 0; pass < 3; pass += 1) {
    [...candidates.values()].slice().forEach((candidate) => {
      if (candidate.key.length >= 4 && prefixPattern.test(candidate.key)) addLookupCandidate(candidates, candidate.key.slice(1), 'prefix-stripped candidate', 20 + pass * 4);
    });
  }
  [...candidates.values()].slice().forEach((candidate) => {
    if (!candidate.key.endsWith('\u05D9\u05DE')) return;
    const stem = candidate.key.slice(0, -2);
    if (stem.endsWith('\u05D4') && stem.length >= 3) addLookupCandidate(candidates, `${stem.slice(0, -1)}\u05D5\u05D4\u05D9\u05DE`, 'mater-expanded plural candidate', 14);
  });
  const suffixRules = [
    { suffix: '\u05D9\u05DE', relation: 'plural-suffix candidate', penalty: 18 },
    { suffix: '\u05D5\u05EA', relation: 'plural-suffix candidate', penalty: 18 },
    { suffix: '\u05D9\u05D4', relation: 'possessive-suffix candidate', penalty: 24 },
    { suffix: '\u05D9\u05D5', relation: 'possessive-suffix candidate', penalty: 24 },
    { suffix: '\u05D9\u05DB', relation: 'possessive-suffix candidate', penalty: 24 },
    { suffix: '\u05D9\u05DB\u05DE', relation: 'possessive-suffix candidate', penalty: 28 },
    { suffix: '\u05D9\u05DB\u05E0', relation: 'possessive-suffix candidate', penalty: 28 },
    { suffix: '\u05D4\u05DE', relation: 'possessive-suffix candidate', penalty: 28 },
    { suffix: '\u05D4\u05E0', relation: 'possessive-suffix candidate', penalty: 28 },
    { suffix: '\u05E0\u05D5', relation: 'possessive-suffix candidate', penalty: 24 },
    { suffix: '\u05DB', relation: 'possessive-suffix candidate', penalty: 24 },
    { suffix: '\u05D5', relation: 'possessive-suffix candidate', penalty: 24 },
    { suffix: '\u05D4', relation: 'suffix-stripped candidate', penalty: 24 },
    { suffix: '\u05D9', relation: 'suffix-stripped candidate', penalty: 24 },
  ];
  [...candidates.values()].slice().forEach((candidate) => {
    suffixRules.forEach((rule) => {
      if (candidate.key.endsWith(rule.suffix) && candidate.key.length - rule.suffix.length >= 3) {
        addLookupCandidate(candidates, candidate.key.slice(0, -rule.suffix.length), rule.relation, rule.penalty);
      }
    });
  });
  return [...candidates.values()];
}

function loadRouteLookup() {
  const manifest = readJson(ROUTE_LOOKUP_MANIFEST);
  const shardInfoByKey = new Map((manifest.shards || []).map((shard) => [shard.shard, shard]));
  const shardCache = new Map();
  const loadCards = (normalized) => {
    const shardKey = codepointKey(normalized, Number(manifest.prefix_length || 2));
    const shardInfo = shardInfoByKey.get(shardKey);
    if (!shardInfo?.path) return [];
    if (!shardCache.has(shardKey)) shardCache.set(shardKey, readJson(path.join(path.dirname(ROUTE_LOOKUP_MANIFEST), shardInfo.path)));
    return (shardCache.get(shardKey).routes_by_normalized?.[normalized] || []).slice();
  };
  return { loadCards };
}

function loadTokenRows(work) {
  const manifest = readJson(`data/lexical/${work}.manifest.json`);
  const byId = new Map();
  for (const chunk of manifest.chunks || []) {
    const chunkPath = chunk.url.replace(/^\.\//, '');
    const payload = readJson(path.join(path.dirname(`data/lexical/${work}.manifest.json`), chunkPath));
    for (const row of payload.token_index?.forms || []) byId.set(row.token_index_id, row);
  }
  const occurrences = readJson(`data/lexical/occurrences/${work}.json`);
  const orderedIds = [];
  Object.values(occurrences.units || {}).forEach((unit) => {
    (unit.paragraphs || []).forEach((paragraph) => {
      (paragraph.token_index_ids || []).forEach((tokenId) => orderedIds.push(tokenId));
    });
  });
  return { manifest, occurrences, orderedIds, byId };
}

function publicSourceRow(card) {
  return cleanValues(card.source_rows).find(sourceRowHasPublicFields) || null;
}

function bestRouteCardForToken(row, routeLookup) {
  const candidates = lookupCandidatesFor(row.surface_word, row.normalized_word || normalizeHebrewKey(row.surface_word));
  const cards = [];
  const seen = new Set();
  for (const candidate of candidates) {
    routeLookup.loadCards(candidate.key).forEach((card) => {
      const key = `${card.card_id || ''}|${candidate.key}`;
      if (seen.has(key)) return;
      seen.add(key);
      const enriched = {
        ...card,
        lookup_key: candidate.key,
        lookup_relation: candidate.relation,
        lookup_penalty: candidate.penalty,
      };
      if (isUsageEvidenceCard(enriched)) return;
      if (!productionSections.has(routeSection(enriched))) return;
      if (!routeRenderings(enriched).length) return;
      if (!publicSourceRow(enriched)) return;
      cards.push(enriched);
    });
  }
  return cards.sort(compareRouteCards)[0] || null;
}

function hintFromCard(tokenId, row, card) {
  const source = publicSourceRow(card);
  const display = routeRenderings(card)[0];
  const score = routeScore(card);
  return {
    display,
    match_percent: score,
    source: source.source_name,
    source_family: source.source_family || '',
    source_id: source.source_id,
    source_url: source.source_url,
    license: displayLicense(source),
    license_url: source.license_url,
    basis: 'current_route_candidate',
    candidate_status: 'candidate_not_authority',
    normalized: row.normalized_word || normalizeHebrewKey(row.surface_word),
    route_card_id: card.card_id || '',
    route_family: card.route_family || '',
    route_type: card.route_type || '',
    match_type: card.match_type || '',
    lookup_relation: card.lookup_relation || 'exact',
    status: 'reader_hint_not_translation',
    route_score_percent: score,
    score_source: 'route_card_score',
  };
}

function buildWork(work, routeLookup) {
  const { occurrences, orderedIds, byId } = loadTokenRows(work);
  const hints = {};
  let skippedNoTokenRow = 0;
  let skippedNoRouteCards = 0;
  let skippedNoSource = 0;
  let skippedNoDisplay = 0;
  const sourceFamilies = {};
  for (const tokenId of orderedIds) {
    const row = byId.get(tokenId);
    if (!row) {
      skippedNoTokenRow += 1;
      continue;
    }
    const card = bestRouteCardForToken(row, routeLookup);
    if (!card) {
      skippedNoRouteCards += 1;
      continue;
    }
    if (!publicSourceRow(card)) {
      skippedNoSource += 1;
      continue;
    }
    if (!routeRenderings(card).length) {
      skippedNoDisplay += 1;
      continue;
    }
    const hint = hintFromCard(tokenId, row, card);
    hints[tokenId] = hint;
    sourceFamilies[hint.source_family || 'unknown'] = (sourceFamilies[hint.source_family || 'unknown'] || 0) + 1;
  }
  const output = {
    schema_version: 2,
    scope_label: `bounded-route-lookup-${work}-reader-candidate-hints`,
    work_id: work,
    work_title: occurrences.work_title || work,
    work_slug: occurrences.work_slug || `tanakh/${work}`,
    publication_status: 'not_a_translation',
    generated_at: new Date().toISOString(),
    reader_surface_policy: {
      role: 'inline_reader_convenience_candidate',
      shows: ['english_counterpart_candidate', 'match_percent_when_available'],
      not_semantic_authority: true,
      not_translation: true,
      not_accepted_gloss: true,
      not_definition_truth: true,
      evidence_layer: 'Route HUD',
      selection_layer: 'user gloss selection overrides candidate display when present',
    },
    runtime_scope: {
      purpose: `Pre-click Reader Workbench English counterpart candidates for ${work}.`,
      note: 'Rows are current best available route candidates for reader convenience. They are not accepted translations, definition authority, or semantic truth.',
    },
    coverage: {
      total_token_occurrences: orderedIds.length,
      hint_count: Object.keys(hints).length,
      route_candidate_hint_count: Object.keys(hints).length,
      fallback_hint_count: 0,
      skipped_no_token_row: skippedNoTokenRow,
      skipped_no_route_cards: skippedNoRouteCards,
      skipped_no_public_source_license_row: skippedNoSource,
      skipped_no_display_text: skippedNoDisplay,
      basis_counts: {
        route_candidate: Object.keys(hints).length,
        fallback_reader_hint: 0,
      },
      source_family_counts: sourceFamilies,
    },
    hints,
  };
  const outputPath = `${OUTPUT_DIR}/${work}.json`;
  writeJson(outputPath, output);
  return { work, outputPath, coverage: output.coverage };
}

function reportFor(results) {
  const lines = [
    '# Reader Hints From Route Lookup Report',
    '',
    '- status: generated_bounded_reader_candidate_hints',
    '- input route lookup: `data/definitions/hud-route-lookup/manifest.json`',
    '- output scope: lexical pre-HUD reader convenience candidates only',
    '- boundary: not translation, not accepted gloss, not Definition authority, not source/license acceptance, not release/publication readiness',
    '',
    '| work | output | total token occurrences | hint count | skipped no route | skipped source/license |',
    '| --- | --- | ---: | ---: | ---: | ---: |',
  ];
  results.forEach((result) => {
    lines.push(`| ${result.work} | \`${result.outputPath}\` | ${result.coverage.total_token_occurrences} | ${result.coverage.hint_count} | ${result.coverage.skipped_no_route_cards} | ${result.coverage.skipped_no_public_source_license_row} |`);
  });
  lines.push('');
  return `${lines.join('\n')}\n`;
}

const args = parseArgs(process.argv.slice(2));
const routeLookup = loadRouteLookup();
const results = args.works.map((work) => buildWork(work, routeLookup));
writeText(args.report, reportFor(results));
console.log(`Built reader hints for ${results.length} works.`);
results.forEach((result) => {
  console.log(`${result.work}: ${result.coverage.hint_count}/${result.coverage.total_token_occurrences} hints -> ${result.outputPath}`);
});
console.log(`Report: ${args.report}`);

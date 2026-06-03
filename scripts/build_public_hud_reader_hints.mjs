#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_DENY_LEXICON_ENTRIES = [
  'lex-aph-h639',
  'lex-mashiach-h4899',
  'lex-ruach-h7307',
  'lex-yhwh-h3068',
];

const OLD_HUD_MARKERS = [
  'Clicked Hebrew form',
  'Best actual hit',
  'Full source and license rows',
  'Rank details',
  'allowLowConfidenceFallback',
  'data-hud-breakdown',
  'data-hud-renderings',
  'data-hud-potential',
  'data-hud-related',
  'data-hud-sources',
  'accepted_translation',
  'Accepted translation',
];

const productionSections = new Set([
  'strict_hebrew',
  'strict_aramaic',
  'morphology',
  'lemma',
  'subphrase_evidence',
  'biblical_paraphrase_evidence',
  'citable_paraphrase_evidence',
]);

const routeSectionRank = new Map([
  ['strict_hebrew', 0],
  ['strict_aramaic', 1],
  ['morphology', 2],
  ['lemma', 3],
  ['subphrase_evidence', 4],
  ['biblical_paraphrase_evidence', 5],
  ['citable_paraphrase_evidence', 6],
  ['phrase_evidence', 7],
  ['audit', 8],
]);

const usageEvidenceRouteTypes = new Set([
  'usage_evidence',
  'workbench_usage',
  'workbench_usage_evidence',
  'workbench_usage_commentary',
  'biblical_workbench',
  'biblical_workbench_usage',
  'source_workbench_usage',
  'observed_usage',
]);

function parseArgs(argv) {
  const options = {
    workId: '',
    publicRoot: process.cwd(),
    sourceRoot: process.cwd(),
    output: '',
    report: '',
    denyLexiconEntries: DEFAULT_DENY_LEXICON_ENTRIES.slice(),
    sourceClearanceReport: '',
    sourceClearanceProof: null,
    preserveExisting: true,
    dryRun: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => {
      index += 1;
      if (index >= argv.length) throw new Error(`Missing value for ${arg}`);
      return argv[index];
    };
    if (arg === '--work-id') options.workId = next();
    else if (arg === '--public-root') options.publicRoot = path.resolve(next());
    else if (arg === '--source-root') options.sourceRoot = path.resolve(next());
    else if (arg === '--output') options.output = path.resolve(next());
    else if (arg === '--report') options.report = path.resolve(next());
    else if (arg === '--deny-lexicon-entry') options.denyLexiconEntries.push(next());
    else if (arg === '--deny-lexicon-entries') options.denyLexiconEntries.push(...next().split(',').map((item) => item.trim()).filter(Boolean));
    else if (arg === '--source-clearance-report') options.sourceClearanceReport = path.resolve(next());
    else if (arg === '--replace-existing') options.preserveExisting = false;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  options.denyLexiconEntries = [...new Set(options.denyLexiconEntries)];
  if (options.help) {
    console.log([
      'Usage:',
      '  node scripts/build_public_hud_reader_hints.mjs --work-id orot --source-root <repo> --public-root <public-artifact>',
      '',
      'Builds public reader hints from existing public hints plus current route lookup answers.',
      'The output is reader-hint evidence only; it does not create accepted glosses or translations.',
    ].join('\n'));
    process.exit(0);
  }
  if (!options.workId) throw new Error('--work-id is required');
  if (!options.output) options.output = path.join(options.publicRoot, 'data', 'public-hud', options.workId, 'reader-hints.json');
  if (!options.report) options.report = path.join(options.publicRoot, 'reports', `agent10-${options.workId}-reader-hints-build-report.json`);
  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload)}\n`, 'utf8');
}

function sha256Text(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function byteLength(text) {
  return Buffer.byteLength(text, 'utf8');
}

const cleanValues = (values) => Array.isArray(values) ? values.filter(Boolean) : (values ? [values] : []);
const firstPresentValue = (values) => cleanValues(values).map((value) => String(value || '').trim()).find(Boolean) || '';

function normalizeHebrewDisplay(value) {
  return typeof value === 'string'
    ? value.replace(/([\u0590-\u05FF])'/g, '$1\u05F3').replace(/([\u0590-\u05FF])"(?=[\u0590-\u05FF])/g, '$1\u05F4')
    : value;
}

function normalizeHebrewKey(value) {
  return normalizeHebrewDisplay(String(value || ''))
    .normalize('NFC')
    .replace(/[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/g, '')
    .replace(/\u05DA/g, '\u05DB')
    .replace(/\u05DD/g, '\u05DE')
    .replace(/\u05DF/g, '\u05E0')
    .replace(/\u05E3/g, '\u05E4')
    .replace(/\u05E5/g, '\u05E6');
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

function answerRoleAllowsDefinition(role) {
  const cleanRole = String(role || '').toLowerCase().replace(/[\s-]+/g, '_');
  return ['', 'answer', 'definition', 'reader_answer', 'primary_definition'].includes(cleanRole);
}

function cardHasAnswerContract(card) {
  return Object.prototype.hasOwnProperty.call(card || {}, 'answer_eligible')
    || Object.prototype.hasOwnProperty.call(card || {}, 'answer_role');
}

function isAnswerEligible(card) {
  if (isUsageEvidenceCard(card)) return false;
  if (!card || !productionSections.has(routeSection(card)) || !routeRenderings(card).length) return false;
  if (card.answer_eligible === false || !answerRoleAllowsDefinition(card.answer_role)) return false;
  if (card.answer_eligible === true) return true;
  if (cardHasAnswerContract(card)) return false;
  return card.meaning_quality === 'definition' && !['phrase_evidence', 'subphrase_evidence'].includes(routeSection(card));
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

function answerTextKey(card) {
  return routeRenderings(card)
    .map((line) => String(line || '').replace(/\s+/g, ' ').trim().toLowerCase())
    .filter(Boolean)
    .join(' | ');
}

function answerAmbiguity(primary, candidates) {
  if (!primary) return { ambiguous: false, count: 0 };
  const topScore = routeScore(primary);
  const topRelation = primary.lookup_relation || 'exact';
  const close = candidates.filter((card) => (card.lookup_relation || 'exact') === topRelation && Math.abs(routeScore(card) - topScore) <= 6);
  const meanings = new Set(close.map(answerTextKey).filter(Boolean));
  return { ambiguous: meanings.size > 1, count: meanings.size };
}

function selectRouteAnswer(cards) {
  const candidates = cards.filter(isAnswerEligible).sort(compareRouteCards);
  const exactAnswer = candidates.filter((card) => (card.lookup_relation || 'exact') === 'exact').sort(compareRouteCards)[0];
  const selected = exactAnswer || candidates[0] || null;
  const ambiguity = answerAmbiguity(selected, candidates);
  return {
    answerCard: ambiguity.ambiguous ? null : selected,
    answerState: ambiguity.ambiguous ? 'ambiguous' : (selected ? 'definition' : 'none'),
    ambiguityCount: ambiguity.count,
    answerCandidateCount: candidates.length,
  };
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

function codepointKey(value, prefixLength) {
  const chars = [...String(value || '')].slice(0, prefixLength);
  if (!chars.length) return 'empty';
  const first = chars[0].codePointAt(0);
  if (first < 0x05d0 || first > 0x05ea) return 'other';
  return chars.map((char) => char.codePointAt(0).toString(16).padStart(4, '0')).join('-');
}

function sourceRowHasPublicFields(row) {
  return ['source_id', 'source_url', 'license', 'license_url'].every((field) => String(row?.[field] || '').trim());
}

function hintFromCard(tokenRow, card) {
  const sourceRow = cleanValues(card.source_rows).find(sourceRowHasPublicFields);
  if (!sourceRow) return null;
  return {
    display: routeRenderings(card).join('; '),
    match_percent: routeScore(card),
    source: sourceRow.source_name || '',
    source_family: sourceRow.source_family || '',
    source_id: sourceRow.source_id || '',
    source_url: sourceRow.source_url || '',
    license: sourceRow.license || '',
    license_url: sourceRow.license_url || '',
    basis: card.lookup_relation === 'exact' ? 'exact_current_route_answer_candidate' : 'lookup_candidate_current_route_answer_candidate',
    candidate_status: 'candidate_not_authority',
    normalized: tokenRow.normalized_word || '',
    lookup_key: card.lookup_key || tokenRow.normalized_word || '',
    lookup_relation: card.lookup_relation || 'exact',
    lookup_penalty: Number.isFinite(card.lookup_penalty) ? card.lookup_penalty : 0,
    route_card_id: card.card_id || '',
    route_family: card.route_family || '',
    route_type: card.route_type || '',
    match_type: card.match_type || '',
    status: 'reader_hint_not_translation',
  };
}

function collectOccurrenceCounts(occurrences) {
  const counts = new Map();
  for (const unit of Object.values(occurrences.units || {})) {
    for (const paragraph of unit.paragraphs || []) {
      for (const tokenId of paragraph.token_index_ids || []) counts.set(tokenId, (counts.get(tokenId) || 0) + 1);
    }
  }
  return counts;
}

function loadTokenRows(sourceRoot, workId, occurrenceCounts) {
  const manifestPath = path.join(sourceRoot, 'data', 'lexical', `${workId}.manifest.json`);
  const manifest = readJson(manifestPath);
  const rows = new Map();
  for (const chunk of manifest.chunks || []) {
    const payload = readJson(path.join(sourceRoot, 'data', 'lexical', chunk.url));
    for (const row of payload.token_index?.forms || []) {
      if (occurrenceCounts.has(row.token_index_id)) rows.set(row.token_index_id, row);
    }
  }
  return rows;
}

function makeRouteLoader(sourceRoot) {
  const lookupRoot = path.join(sourceRoot, 'data', 'definitions', 'hud-route-lookup');
  const manifest = readJson(path.join(lookupRoot, 'manifest.json'));
  const prefixLength = manifest.prefix_length || 3;
  const shardCache = new Map();
  let missingShards = 0;
  const loadRouteCards = (normalized) => {
    const shardKey = codepointKey(normalized, prefixLength);
    if (!shardCache.has(shardKey)) {
      const shardPath = path.join(lookupRoot, 'shards', `${shardKey}.json`);
      if (!fs.existsSync(shardPath)) {
        shardCache.set(shardKey, null);
        missingShards += 1;
      } else {
        shardCache.set(shardKey, readJson(shardPath));
      }
    }
    const shard = shardCache.get(shardKey);
    return (((shard || {}).routes_by_normalized || {})[normalized] || []).slice();
  };
  return {
    loadRouteCards,
    stats: () => ({ shardsRead: [...shardCache.values()].filter(Boolean).length, missingShards }),
  };
}

function hasDeniedCardDependency(card, needles) {
  const raw = JSON.stringify(card || '');
  return needles.some((needle) => raw.includes(needle));
}

function countOccurrences(tokenIds, occurrenceCounts) {
  return tokenIds.reduce((sum, tokenId) => sum + (occurrenceCounts.get(tokenId) || 0), 0);
}

function sortedTop(items, limit = 25) {
  return items
    .slice()
    .sort((left, right) => (right.occurrences || 0) - (left.occurrences || 0) || String(left.token_id || '').localeCompare(String(right.token_id || '')))
    .slice(0, limit);
}

function scanNeedles(text, needles) {
  return Object.fromEntries(needles.map((needle) => [needle, text.includes(needle) ? 1 : 0]));
}

function applySourceClearanceReport(options) {
  if (!options.sourceClearanceReport) return;
  const report = readJson(options.sourceClearanceReport);
  if (report?.artifact_type !== 'agent1_orot_fill_source_row_evidence') {
    throw new Error(`Unexpected source clearance artifact type in ${options.sourceClearanceReport}`);
  }
  if (report.status !== 'pipeline_source_rows_clear') {
    throw new Error(`Source clearance report is not clear: ${report.status}`);
  }
  if (report.summary?.incomplete_curated_rows_attached !== 0) {
    throw new Error('Source clearance report still has incomplete curated rows attached');
  }
  if (report.summary?.targets_missing_clean_chunk_attachment !== 0) {
    throw new Error('Source clearance report still has targets missing clean source attachment');
  }
  if (report.summary?.route_lookup_shard_hit_count !== 0) {
    throw new Error('Source clearance report must not have public route lookup shard hits before rebuild');
  }
  const clearedEntries = new Set((report.targets || [])
    .filter((target) => (
      target.status === 'pipeline_source_rows_clear'
      && target.exact_incomplete_curated_row_present === false
      && (target.incomplete_chunk_source_row_ids || []).length === 0
      && ((target.complete_primary_source_row_ids || []).length + (target.complete_secondary_source_row_ids || []).length) > 0
    ))
    .map((target) => target.entry_id));
  const before = options.denyLexiconEntries.slice();
  options.denyLexiconEntries = options.denyLexiconEntries.filter((entry) => !clearedEntries.has(entry));
  options.sourceClearanceProof = {
    report: options.sourceClearanceReport,
    status: report.status,
    cleared_entries: before.filter((entry) => clearedEntries.has(entry)),
    remaining_denied_entries: options.denyLexiconEntries,
    summary: report.summary,
    not_accepted: report.must_not_accept || [],
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  applySourceClearanceReport(options);
  const publicHudRoot = path.join(options.publicRoot, 'data', 'public-hud', options.workId);
  const occurrencesPath = path.join(publicHudRoot, 'occurrences.json');
  const existingHintsPath = path.join(publicHudRoot, 'reader-hints.json');
  const occurrences = readJson(occurrencesPath);
  const occurrenceCounts = collectOccurrenceCounts(occurrences);
  const existingHintsPayload = fs.existsSync(existingHintsPath)
    ? readJson(existingHintsPath)
    : { hints: {} };
  const existingHints = options.preserveExisting ? { ...(existingHintsPayload.hints || {}) } : {};
  const outputHints = { ...existingHints };
  const tokenRows = loadTokenRows(options.sourceRoot, options.workId, occurrenceCounts);
  const routeLoader = makeRouteLoader(options.sourceRoot);
  const denyLexiconEntries = new Set(options.denyLexiconEntries);
  const denyNeedles = [
    ...options.denyLexiconEntries,
    ...options.denyLexiconEntries.map((entry) => `curated|${entry}|source metadata incomplete`),
  ];

  const added = [];
  const skippedDeniedToken = [];
  const skippedDeniedCard = [];
  const skippedNoAnswer = [];
  const skippedMissingSource = [];
  const existingDeniedToken = [];

  for (const tokenId of occurrenceCounts.keys()) {
    const tokenRow = tokenRows.get(tokenId);
    if (!tokenRow) {
      if (!outputHints[tokenId]) skippedNoAnswer.push({ token_id: tokenId, occurrences: occurrenceCounts.get(tokenId) || 0, reason: 'missing_token_row' });
      continue;
    }
    if (outputHints[tokenId]) {
      if (denyLexiconEntries.has(tokenRow.lexicon_entry_id)) {
        existingDeniedToken.push({
          token_id: tokenId,
          occurrences: occurrenceCounts.get(tokenId) || 0,
          surface: tokenRow.surface_word || '',
          normalized: tokenRow.normalized_word || '',
          lexicon_entry_id: tokenRow.lexicon_entry_id || '',
        });
      }
      continue;
    }
    if (denyLexiconEntries.has(tokenRow.lexicon_entry_id)) {
      skippedDeniedToken.push({
        token_id: tokenId,
        occurrences: occurrenceCounts.get(tokenId) || 0,
        surface: tokenRow.surface_word || '',
        normalized: tokenRow.normalized_word || '',
        lexicon_entry_id: tokenRow.lexicon_entry_id || '',
      });
      continue;
    }
    const candidates = lookupCandidatesFor(tokenRow.surface_word, tokenRow.normalized_word);
    const cards = [];
    for (const candidate of candidates) {
      for (const card of routeLoader.loadRouteCards(candidate.key)) {
        cards.push({
          ...card,
          lookup_key: candidate.key,
          lookup_relation: candidate.relation,
          lookup_penalty: candidate.penalty,
        });
      }
    }
    const seen = new Set();
    const deduped = cards.filter((card) => {
      const key = `${card.card_id || ''}|${card.lookup_key || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const answer = selectRouteAnswer(deduped);
    if (!answer.answerCard) {
      skippedNoAnswer.push({
        token_id: tokenId,
        occurrences: occurrenceCounts.get(tokenId) || 0,
        surface: tokenRow.surface_word || '',
        normalized: tokenRow.normalized_word || '',
        reason: answer.answerState === 'ambiguous' ? 'ambiguous' : 'no_answer',
        candidate_count: answer.answerCandidateCount,
      });
      continue;
    }
    if (hasDeniedCardDependency(answer.answerCard, denyNeedles)) {
      skippedDeniedCard.push({
        token_id: tokenId,
        occurrences: occurrenceCounts.get(tokenId) || 0,
        surface: tokenRow.surface_word || '',
        normalized: tokenRow.normalized_word || '',
        card_id: answer.answerCard.card_id || '',
      });
      continue;
    }
    const hint = hintFromCard(tokenRow, answer.answerCard);
    if (!hint || !hint.display) {
      skippedMissingSource.push({
        token_id: tokenId,
        occurrences: occurrenceCounts.get(tokenId) || 0,
        surface: tokenRow.surface_word || '',
        normalized: tokenRow.normalized_word || '',
        card_id: answer.answerCard.card_id || '',
      });
      continue;
    }
    outputHints[tokenId] = hint;
    added.push({
      token_id: tokenId,
      occurrences: occurrenceCounts.get(tokenId) || 0,
      surface: tokenRow.surface_word || '',
      normalized: tokenRow.normalized_word || '',
      lookup_relation: hint.lookup_relation,
      match_percent: hint.match_percent,
      route_card_id: hint.route_card_id,
      source_family: hint.source_family,
      source_id: hint.source_id,
      display: hint.display.slice(0, 180),
    });
  }

  const generatedAt = new Date().toISOString();
  const outputPayload = {
    schema_version: 1,
    work_id: options.workId,
    generated_at: generatedAt,
    hint_policy: 'reader_hint_not_translation_not_definition_authority',
    basis: 'existing_public_hints_plus_source_clean_lookup_candidate_current_route_answer_candidate',
    counts: {
      occurrence_token_count: countOccurrences([...occurrenceCounts.keys()], occurrenceCounts),
      unique_token_id_count: occurrenceCounts.size,
      existing_hint_count: Object.keys(existingHints).length,
      added_hint_count: added.length,
      final_hint_count: Object.keys(outputHints).length,
      existing_hint_occurrences: countOccurrences(Object.keys(existingHints), occurrenceCounts),
      added_hint_occurrences: countOccurrences(added.map((item) => item.token_id), occurrenceCounts),
      final_hint_occurrences: countOccurrences(Object.keys(outputHints), occurrenceCounts),
    },
    hints: outputHints,
  };
  const outputText = `${JSON.stringify(outputPayload)}\n`;
  const denyScan = scanNeedles(outputText, denyNeedles);
  const oldMarkerScan = scanNeedles(outputText, OLD_HUD_MARKERS);
  const report = {
    schema_version: 1,
    artifact_type: 'public_hud_reader_hints_build_report',
    work_id: options.workId,
    generated_at: generatedAt,
    dry_run: options.dryRun,
    output_path: options.output,
    source_root: options.sourceRoot,
    public_root: options.publicRoot,
    claim_boundary: {
      highest_claim: 'reader hints generated from pipeline route data with denylist proof',
      not_accepted: [
        'qa_acceptance',
        'validated_runtime_acceptance',
        'source_provenance_acceptance',
        'publication_readiness',
        'definition_authority',
        'usage_as_definition_authority',
        'accepted_translation_text',
        'translation_output',
      ],
    },
    counts: outputPayload.counts,
    output_bytes: byteLength(outputText),
    output_sha256: sha256Text(outputText),
    denylist_proof: {
      denied_lexicon_entries: options.denyLexiconEntries,
      output_scan_hits: denyScan,
      output_scan_total: Object.values(denyScan).reduce((sum, value) => sum + value, 0),
      skipped_denied_token_count: skippedDeniedToken.length,
      skipped_denied_token_occurrences: countOccurrences(skippedDeniedToken.map((item) => item.token_id), occurrenceCounts),
      skipped_denied_card_count: skippedDeniedCard.length,
      skipped_denied_card_occurrences: countOccurrences(skippedDeniedCard.map((item) => item.token_id), occurrenceCounts),
      existing_hints_with_denied_lexicon_entry_count: existingDeniedToken.length,
      existing_hints_with_denied_lexicon_entry_occurrences: countOccurrences(existingDeniedToken.map((item) => item.token_id), occurrenceCounts),
      top_skipped_denied_tokens: sortedTop(skippedDeniedToken),
      top_existing_denied_tokens: sortedTop(existingDeniedToken),
    },
    source_clearance_proof: options.sourceClearanceProof,
    old_hud_marker_scan: {
      markers: OLD_HUD_MARKERS,
      output_scan_hits: oldMarkerScan,
      output_scan_total: Object.values(oldMarkerScan).reduce((sum, value) => sum + value, 0),
    },
    route_lookup_probe: routeLoader.stats(),
    skipped: {
      no_answer_or_ambiguous_count: skippedNoAnswer.length,
      no_answer_or_ambiguous_occurrences: countOccurrences(skippedNoAnswer.map((item) => item.token_id), occurrenceCounts),
      missing_source_count: skippedMissingSource.length,
      missing_source_occurrences: countOccurrences(skippedMissingSource.map((item) => item.token_id), occurrenceCounts),
      top_no_answer_or_ambiguous: sortedTop(skippedNoAnswer),
      top_missing_source: sortedTop(skippedMissingSource),
    },
    top_added_hints: sortedTop(added),
  };

  if (!options.dryRun) writeJson(options.output, outputPayload);
  writeJson(options.report, report);
  console.log(JSON.stringify({
    status: Object.values(denyScan).some(Boolean) || Object.values(oldMarkerScan).some(Boolean) ? 'warn' : 'ok',
    dry_run: options.dryRun,
    output: options.output,
    report: options.report,
    counts: outputPayload.counts,
    output_bytes: report.output_bytes,
    output_sha256: report.output_sha256,
    denylist_output_scan_total: report.denylist_proof.output_scan_total,
    old_hud_marker_output_scan_total: report.old_hud_marker_scan.output_scan_total,
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.stack || String(error));
  process.exit(1);
}

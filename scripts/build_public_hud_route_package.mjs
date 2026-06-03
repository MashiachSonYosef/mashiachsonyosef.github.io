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
    outputDir: '',
    report: '',
    topN: 50,
    maxCardsPerKey: 50,
    denyLexiconEntries: DEFAULT_DENY_LEXICON_ENTRIES.slice(),
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
    else if (arg === '--output-dir') options.outputDir = path.resolve(next());
    else if (arg === '--report') options.report = path.resolve(next());
    else if (arg === '--top-n') options.topN = Number.parseInt(next(), 10);
    else if (arg === '--max-cards-per-key') options.maxCardsPerKey = Number.parseInt(next(), 10);
    else if (arg === '--deny-lexicon-entry') options.denyLexiconEntries.push(next());
    else if (arg === '--deny-lexicon-entries') options.denyLexiconEntries.push(...next().split(',').map((item) => item.trim()).filter(Boolean));
    else if (arg === '--replace-existing') options.preserveExisting = false;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (options.help) {
    console.log([
      'Usage:',
      '  node scripts/build_public_hud_route_package.mjs --work-id orot --source-root <repo> --public-root <public-artifact> --top-n 50',
      '',
      'Builds a bounded public route lookup package from existing route lookup shards.',
      'The output is current-HUD evidence only; it does not create accepted glosses or translations.',
    ].join('\n'));
    process.exit(0);
  }
  if (!options.workId) throw new Error('--work-id is required');
  if (!Number.isInteger(options.topN) || options.topN <= 0) throw new Error('--top-n must be a positive integer');
  if (!Number.isInteger(options.maxCardsPerKey) || options.maxCardsPerKey <= 0) throw new Error('--max-cards-per-key must be a positive integer');
  options.denyLexiconEntries = [...new Set(options.denyLexiconEntries)];
  if (!options.outputDir) options.outputDir = path.join(options.publicRoot, 'data', 'public-hud', options.workId, 'route-lookup');
  if (!options.report) options.report = path.join(options.publicRoot, 'reports', `agent10-${options.workId}-route-package-build-report.json`);
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
    isUsageEvidenceCard(leftCard) ? 1 : 0,
    -(Number.isFinite(leftCard.answer_score) ? leftCard.answer_score : 0),
    String(leftCard.card_id || ''),
  ];
  const right = [
    -(routeScore(rightCard) ?? -1000),
    routeSectionRank.get(routeSection(rightCard)) ?? 9,
    isUsageEvidenceCard(rightCard) ? 1 : 0,
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

function publicSafeCard(card) {
  if (!card) return false;
  if (routeRenderings(card).length && cleanValues(card.source_rows).some(sourceRowHasPublicFields)) return true;
  return isUsageEvidenceCard(card) && cleanValues(card.source_rows).some(sourceRowHasPublicFields);
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
  const manifest = readJson(path.join(sourceRoot, 'data', 'lexical', `${workId}.manifest.json`));
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
  const cache = new Map();
  let missingShards = 0;
  const loadRouteCards = (normalized) => {
    const shardKey = codepointKey(normalized, prefixLength);
    if (!cache.has(shardKey)) {
      const shardPath = path.join(lookupRoot, 'shards', `${shardKey}.json`);
      if (!fs.existsSync(shardPath)) {
        cache.set(shardKey, null);
        missingShards += 1;
      } else {
        cache.set(shardKey, readJson(shardPath));
      }
    }
    const shard = cache.get(shardKey);
    return (((shard || {}).routes_by_normalized || {})[normalized] || []).slice();
  };
  return {
    prefixLength,
    loadRouteCards,
    stats: () => ({ shardsRead: [...cache.values()].filter(Boolean).length, missingShards }),
  };
}

function hasDeniedText(value, needles) {
  const raw = JSON.stringify(value || '');
  return needles.some((needle) => raw.includes(needle));
}

function scanNeedles(text, needles) {
  return Object.fromEntries(needles.map((needle) => [needle, text.includes(needle) ? 1 : 0]));
}

function sortedTop(items, limit = 25) {
  return items
    .slice()
    .sort((left, right) => (right.occurrences || 0) - (left.occurrences || 0) || String(left.token_id || '').localeCompare(String(right.token_id || '')))
    .slice(0, limit);
}

function removeGeneratedRouteLookup(outputDir) {
  const manifestPath = path.join(outputDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return;
  const current = readJson(manifestPath);
  for (const shard of current.shards || []) {
    if (!shard.path) continue;
    const shardPath = path.join(outputDir, shard.path);
    if (fs.existsSync(shardPath)) fs.rmSync(shardPath);
  }
}

function loadExistingRouteLookup(outputDir, denyNeedles) {
  const manifestPath = path.join(outputDir, 'manifest.json');
  const empty = {
    routeMaps: new Map(),
    route_key_count: 0,
    card_count: 0,
    manifest_sha256: null,
    skipped_denied_card_count: 0,
    missing_shard_count: 0,
  };
  if (!fs.existsSync(manifestPath)) return empty;
  const manifestText = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestText);
  const routeMaps = new Map();
  let routeKeyCount = 0;
  let cardCount = 0;
  let skippedDeniedCardCount = 0;
  let missingShardCount = 0;
  for (const shard of manifest.shards || []) {
    if (!shard.path) continue;
    const shardPath = path.join(outputDir, shard.path);
    if (!fs.existsSync(shardPath)) {
      missingShardCount += 1;
      continue;
    }
    const payload = readJson(shardPath);
    const shardKey = payload.shard || shard.shard || path.basename(shard.path, '.json');
    if (!routeMaps.has(shardKey)) routeMaps.set(shardKey, new Map());
    for (const [key, cards] of Object.entries(payload.routes_by_normalized || {})) {
      const keptCards = cleanValues(cards).filter((card) => !hasDeniedText(card, denyNeedles) && !hasDeniedText(card, OLD_HUD_MARKERS));
      skippedDeniedCardCount += cleanValues(cards).length - keptCards.length;
      if (!keptCards.length) continue;
      routeMaps.get(shardKey).set(key, keptCards);
      routeKeyCount += 1;
      cardCount += keptCards.length;
    }
  }
  return {
    routeMaps,
    route_key_count: routeKeyCount,
    card_count: cardCount,
    manifest_sha256: sha256Text(manifestText),
    skipped_denied_card_count: skippedDeniedCardCount,
    missing_shard_count: missingShardCount,
  };
}

function writeRouteLookupPackage(outputDir, manifest, shardPayloads) {
  const parentDir = path.dirname(outputDir);
  const tempDir = path.join(parentDir, `.${path.basename(outputDir)}-${process.pid}-${Date.now()}.tmp`);
  const backupDir = path.join(parentDir, `.${path.basename(outputDir)}-${process.pid}-${Date.now()}.bak`);
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.rmSync(backupDir, { recursive: true, force: true });
  for (const shard of shardPayloads) writeJson(path.join(tempDir, shard.path), shard.payload);
  writeJson(path.join(tempDir, 'manifest.json'), manifest);
  try {
    if (fs.existsSync(outputDir)) fs.renameSync(outputDir, backupDir);
    fs.renameSync(tempDir, outputDir);
    fs.rmSync(backupDir, { recursive: true, force: true });
  } catch (error) {
    fs.rmSync(outputDir, { recursive: true, force: true });
    if (fs.existsSync(backupDir)) fs.renameSync(backupDir, outputDir);
    fs.rmSync(tempDir, { recursive: true, force: true });
    throw error;
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const publicHudRoot = path.join(options.publicRoot, 'data', 'public-hud', options.workId);
  const occurrences = readJson(path.join(publicHudRoot, 'occurrences.json'));
  const readerHints = readJson(path.join(publicHudRoot, 'reader-hints.json'));
  const occurrenceCounts = collectOccurrenceCounts(occurrences);
  const tokenRows = loadTokenRows(options.sourceRoot, options.workId, occurrenceCounts);
  const routeLoader = makeRouteLoader(options.sourceRoot);
  const denyLexiconEntries = new Set(options.denyLexiconEntries);
  const denyNeedles = [
    ...options.denyLexiconEntries,
    ...options.denyLexiconEntries.map((entry) => `curated|${entry}|source metadata incomplete`),
  ];
  const hintIds = Object.keys(readerHints.hints || {});
  const selectedTokens = [];
  const skippedDeniedToken = [];
  const skippedMissingTokenRow = [];
  const skippedNoRouteCards = [];
  const skippedDeniedCardsOnly = [];

  for (const tokenId of hintIds) {
    const tokenRow = tokenRows.get(tokenId);
    if (!tokenRow) {
      skippedMissingTokenRow.push({ token_id: tokenId, occurrences: occurrenceCounts.get(tokenId) || 0 });
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
    let routeCardCount = 0;
    let deniedCardCount = 0;
    for (const candidate of candidates) {
      const cards = routeLoader.loadRouteCards(candidate.key);
      deniedCardCount += cards.filter((card) => hasDeniedText(card, denyNeedles)).length;
      routeCardCount += cards.filter((card) => !hasDeniedText(card, denyNeedles) && publicSafeCard(card)).length;
    }
    if (!routeCardCount) {
      skippedNoRouteCards.push({
        token_id: tokenId,
        occurrences: occurrenceCounts.get(tokenId) || 0,
        surface: tokenRow.surface_word || '',
        normalized: tokenRow.normalized_word || '',
      });
      continue;
    }
    if (deniedCardCount && !routeCardCount) {
      skippedDeniedCardsOnly.push({
        token_id: tokenId,
        occurrences: occurrenceCounts.get(tokenId) || 0,
        surface: tokenRow.surface_word || '',
        normalized: tokenRow.normalized_word || '',
      });
      continue;
    }
    selectedTokens.push({
      token_id: tokenId,
      occurrences: occurrenceCounts.get(tokenId) || 0,
      surface: tokenRow.surface_word || '',
      normalized: tokenRow.normalized_word || '',
      lexicon_entry_id: tokenRow.lexicon_entry_id || '',
      hint_display: String(readerHints.hints[tokenId]?.display || '').slice(0, 180),
      hint_match_percent: readerHints.hints[tokenId]?.match_percent || null,
      candidate_keys: candidates.map((candidate) => candidate.key),
    });
  }

  const selectedTop = selectedTokens
    .sort((left, right) => right.occurrences - left.occurrences || String(left.token_id).localeCompare(String(right.token_id)))
    .slice(0, options.topN);

  const routesByShard = new Map();
  const preservedExisting = options.preserveExisting ? loadExistingRouteLookup(options.outputDir, denyNeedles) : loadExistingRouteLookup('__missing__', denyNeedles);
  for (const [shardKey, routes] of preservedExisting.routeMaps) routesByShard.set(shardKey, new Map(routes));
  const selectedKeys = new Set();
  const truncatedKeys = [];
  const deniedCardsSkipped = [];
  for (const token of selectedTop) {
    for (const key of token.candidate_keys) {
      selectedKeys.add(key);
      const cards = routeLoader.loadRouteCards(key);
      const safeCards = [];
      let deniedForKey = 0;
      for (const card of cards) {
        if (hasDeniedText(card, denyNeedles)) {
          deniedForKey += 1;
          continue;
        }
        if (publicSafeCard(card)) safeCards.push(card);
      }
      if (deniedForKey) deniedCardsSkipped.push({ key, denied_cards: deniedForKey });
      if (!safeCards.length) continue;
      const limitedCards = safeCards.sort(compareRouteCards).slice(0, options.maxCardsPerKey);
      if (safeCards.length > limitedCards.length) truncatedKeys.push({ key, original_card_count: safeCards.length, kept_card_count: limitedCards.length });
      const shardKey = codepointKey(key, routeLoader.prefixLength);
      if (!routesByShard.has(shardKey)) routesByShard.set(shardKey, new Map());
      routesByShard.get(shardKey).set(key, limitedCards);
    }
  }

  const shardPayloads = [];
  for (const [shardKey, routes] of routesByShard) {
    const routesObject = Object.fromEntries([...routes.entries()].sort((left, right) => left[0].localeCompare(right[0])));
    const cardCount = Object.values(routesObject).reduce((sum, cards) => sum + cards.length, 0);
    const payload = {
      schema_version: 1,
      shard: shardKey,
      token_count: Object.keys(routesObject).length,
      card_count: cardCount,
      routes_by_normalized: routesObject,
    };
    const text = `${JSON.stringify(payload)}\n`;
    shardPayloads.push({
      shard: shardKey,
      path: `shards/${shardKey}.json`,
      token_count: payload.token_count,
      card_count: payload.card_count,
      byte_length: Buffer.byteLength(text, 'utf8'),
      sha256: sha256Text(text),
      payload,
      text,
    });
  }
  shardPayloads.sort((left, right) => left.shard.localeCompare(right.shard));

  const generatedAt = new Date().toISOString();
  const totalShardBytes = shardPayloads.reduce((sum, shard) => sum + shard.byte_length, 0);
  const maxShardBytes = shardPayloads.reduce((max, shard) => Math.max(max, shard.byte_length), 0);
  const publicRouteKeyCount = shardPayloads.reduce((sum, shard) => sum + shard.token_count, 0);
  const manifest = {
    schema_version: 1,
    published_at: generatedAt,
    public_lookup: `data/public-hud/${options.workId}/route-lookup`,
    lookup_strategy: `Bounded top-${options.topN} public route lookup for ${options.workId}; route cards are evidence, not accepted definitions.`,
    selection_policy: {
      token_source: 'current public reader hints',
      top_n: options.topN,
      ordering: 'descending occurrence count',
      max_cards_per_key: options.maxCardsPerKey,
      denied_lexicon_entry_count: options.denyLexiconEntries.length,
      preserve_existing_public_route_keys: options.preserveExisting,
    },
    publication_boundary: {
      publication_status: 'not_a_translation',
      validates: ['bounded_public_hud_route_lookup_manifest', 'bounded_public_hud_route_lookup_shard'],
      does_not_clear: ['translation_output', 'source_publication', 'accepted_definition_authority', 'publication_readiness'],
    },
    prefix_length: routeLoader.prefixLength,
    counts: {
      selected_token_count: selectedTop.length,
      selected_lookup_candidate_count: selectedKeys.size,
      preserved_existing_route_key_count: preservedExisting.route_key_count,
      preserved_existing_card_count: preservedExisting.card_count,
      distinct_normalized_tokens: publicRouteKeyCount,
      public_route_key_count: publicRouteKeyCount,
      shard_count: shardPayloads.length,
      card_count: shardPayloads.reduce((sum, shard) => sum + shard.card_count, 0),
      total_shard_bytes: totalShardBytes,
      max_shard_bytes: maxShardBytes,
      truncated_key_count: truncatedKeys.length,
    },
    selected_tokens: selectedTop,
    shards: shardPayloads.map(({ payload, text, ...shard }) => shard),
  };
  const manifestText = `${JSON.stringify(manifest)}\n`;
  const allOutputText = [manifestText, ...shardPayloads.map((shard) => shard.text)].join('\n');
  const denyScan = scanNeedles(allOutputText, denyNeedles);
  const oldHudScan = scanNeedles(allOutputText, OLD_HUD_MARKERS);

  const report = {
    schema_version: 1,
    artifact_type: 'public_hud_route_package_build_report',
    work_id: options.workId,
    generated_at: generatedAt,
    dry_run: options.dryRun,
    output_dir: options.outputDir,
    source_root: options.sourceRoot,
    public_root: options.publicRoot,
    claim_boundary: {
      highest_claim: `top-${options.topN} route package generated from pipeline route data with denylist proof`,
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
    counts: manifest.counts,
    manifest_bytes: Buffer.byteLength(manifestText, 'utf8'),
    manifest_sha256: sha256Text(manifestText),
    payload_bytes: totalShardBytes,
    payload_thresholds: {
      top_50_warn_bytes: 10 * 1024 * 1024,
      top_50_block_bytes: 25 * 1024 * 1024,
      top_50_warn_max_shard_bytes: 1 * 1024 * 1024,
      top_50_block_max_shard_bytes: 3 * 1024 * 1024,
    },
    denylist_proof: {
      denied_lexicon_entries: options.denyLexiconEntries,
      output_scan_hits: denyScan,
      output_scan_total: Object.values(denyScan).reduce((sum, value) => sum + value, 0),
      skipped_denied_token_count: skippedDeniedToken.length,
      skipped_denied_token_occurrences: skippedDeniedToken.reduce((sum, item) => sum + item.occurrences, 0),
      denied_cards_skipped_count: deniedCardsSkipped.reduce((sum, item) => sum + item.denied_cards, 0),
      top_skipped_denied_tokens: sortedTop(skippedDeniedToken),
    },
    old_hud_marker_scan: {
      markers: OLD_HUD_MARKERS,
      output_scan_hits: oldHudScan,
      output_scan_total: Object.values(oldHudScan).reduce((sum, value) => sum + value, 0),
    },
    route_lookup_probe: routeLoader.stats(),
    preserved_existing: {
      enabled: options.preserveExisting,
      route_key_count: preservedExisting.route_key_count,
      card_count: preservedExisting.card_count,
      manifest_sha256: preservedExisting.manifest_sha256,
      skipped_denied_card_count: preservedExisting.skipped_denied_card_count,
      missing_shard_count: preservedExisting.missing_shard_count,
    },
    skipped: {
      missing_token_row_count: skippedMissingTokenRow.length,
      no_route_cards_count: skippedNoRouteCards.length,
      denied_cards_only_count: skippedDeniedCardsOnly.length,
      top_no_route_cards: sortedTop(skippedNoRouteCards),
    },
    truncated_keys: truncatedKeys.slice(0, 100),
    selected_tokens: selectedTop,
  };

  if (!options.dryRun) {
    writeRouteLookupPackage(options.outputDir, manifest, shardPayloads);
  }
  writeJson(options.report, report);
  console.log(JSON.stringify({
    status: Object.values(denyScan).some(Boolean) || Object.values(oldHudScan).some(Boolean) ? 'warn' : 'ok',
    dry_run: options.dryRun,
    output_dir: options.outputDir,
    report: options.report,
    counts: manifest.counts,
    payload_bytes: totalShardBytes,
    max_shard_bytes: maxShardBytes,
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

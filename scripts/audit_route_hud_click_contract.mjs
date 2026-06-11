#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const HEBREW_TOKEN_RE = /[\u05D0-\u05EA][\u0591-\u05C7\u05D0-\u05EA\u05F3\u05F4'"\u05BE-]*/gu;
const REQUIRED_CONFIG_FIELDS = [
  'work_id',
  'work_slug',
  'manifest_url',
  'occurrence_url',
  'hud_route_lookup_manifest_url',
  'root_href',
];
const REQUIRED_RUNTIME_MARKERS = [
  "document.addEventListener('click'",
  "event.target.closest('[data-lexical-token]')",
  'renderWord(button)',
  'span.dataset.lexicalToken',
  'span.dataset.lexicalIndex',
  'span.dataset.lexicalTokenIds',
  'span.dataset.surfaceOccurrenceId',
  'span.dataset.lexicalSurface',
  "span.setAttribute('aria-haspopup', 'dialog')",
  "span.setAttribute('aria-controls', 'route-hud-panel')",
  'button.dataset.normalized',
  'loadRouteCardsForToken',
  'consumeAlignedToken',
  'selectRouteAnswer',
  'canSaveGlossSelection',
  'source_rows must include source_name, source_id, source_url, license, and license_url',
  'publication_status',
  'not_a_translation',
];
const REQUIRED_PAGE_MARKERS = [
  'data-lexical-unit',
  'data-lexical-paragraph',
  'data-lexical-slot',
  'data-lexical-config',
  'data-lexical-occurrences',
  'data-lexical-hud',
  'data-route-hud-panel',
  'data-reader-workbench',
  'hud_route_lookup_manifest_url',
  'data-hud-runtime-contract',
  'article.dataset.rankBasis',
  'Sources and licenses',
];
const FORBIDDEN_PAGE_MARKERS = [
  'Clicked Hebrew form',
  'Rank details',
  'No lexical entry yet.',
  'Potential options',
  'Show potential options',
  'allowLowConfidenceFallback',
  'data-hud-breakdown',
  'data-hud-renderings',
  'data-hud-potential',
  'data-hud-related',
  'data-hud-sources',
];
const SOURCE_FIELDS = ['source_name', 'source_id', 'source_url', 'license', 'license_url'];

function parseArgs(argv) {
  const args = {
    page: 'tanakh/genesis/index.html',
    report: 'reports/agent5-route-hud-click-prevalidation-2026-06-01.md',
    json: 'reports/agent5-route-hud-click-prevalidation-2026-06-01.json',
    sampleLimit: 36,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--page') args.page = argv[++index];
    else if (arg === '--report') args.report = argv[++index];
    else if (arg === '--json') args.json = argv[++index];
    else if (arg === '--sample-limit') args.sampleLimit = Number(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function usage() {
  return [
    'Usage:',
    '  node scripts/audit_route_hud_click_contract.mjs --page tanakh/genesis/index.html',
    '',
    'Performs static click-contract prevalidation for a route HUD / Reader Workbench page.',
  ].join('\n');
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function workspacePath(relPath) {
  const fullPath = path.resolve(root, relPath);
  if (fullPath !== root && !fullPath.startsWith(root + path.sep)) {
    throw new Error(`Path escapes workspace: ${relPath}`);
  }
  return fullPath;
}

function normalizeHref(value) {
  return String(value || '').replaceAll('&amp;', '&').replace(/^[./\\]+/, '').replaceAll('\\', '/');
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function resolveFromPage(pageRel, href) {
  const fullPath = path.resolve(path.dirname(workspacePath(pageRel)), String(href || '').replaceAll('&amp;', '&'));
  if (!fullPath.startsWith(root + path.sep)) throw new Error(`Resolved path escapes workspace: ${href}`);
  return fullPath;
}

function resolveFromFile(baseFile, href) {
  const fullPath = path.resolve(path.dirname(baseFile), String(href || '').replaceAll('&amp;', '&'));
  if (!fullPath.startsWith(root + path.sep)) throw new Error(`Resolved path escapes workspace: ${href}`);
  return fullPath;
}

function relFromRoot(fullPath) {
  return path.relative(root, fullPath).replaceAll('\\', '/');
}

function parseAttrs(tag) {
  const attrs = {};
  for (const match of tag.matchAll(/([\w:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    attrs[match[1]] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attrs;
}

function extractJsonScript(html, attrName) {
  const re = new RegExp(`<script\\b([^>]*)${attrName}([^>]*)>([\\s\\S]*?)<\\/script>`, 'i');
  const match = html.match(re);
  if (!match) return null;
  return {
    attrs: parseAttrs(`<script ${match[1]} ${attrName} ${match[2]}>`),
    text: match[3].trim(),
  };
}

function extractLinkedRuntime(html, pageRel) {
  const scripts = [];
  for (const match of html.matchAll(/<script\s+[^>]*src="([^"]*reader-workbench\.js)"[^>]*><\/script>/g)) {
    const src = match[1].replaceAll('&amp;', '&');
    const fullPath = resolveFromPage(pageRel, src);
    scripts.push({ src, fullPath, text: fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : '' });
  }
  return scripts;
}

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

function codepointKey(value, prefixLength) {
  const chars = [...String(value || '')].slice(0, prefixLength);
  if (!chars.length) return 'empty';
  const first = chars[0].codePointAt(0);
  if (first < 0x05d0 || first > 0x05ea) return 'other';
  return chars.map((char) => char.codePointAt(0).toString(16).padStart(4, '0')).join('-');
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
  String(primary || '').split(/[\u05BE-]/).filter((part) => part && part !== primary).forEach((part) => {
    addLookupCandidate(candidates, part, 'maqaf component', 12);
  });
  const prefixPattern = /^[\u05D5\u05D1\u05DB\u05DC\u05DE\u05D4\u05E9]/;
  for (let pass = 0; pass < 3; pass += 1) {
    [...candidates.values()].slice().forEach((candidate) => {
      if (candidate.key.length >= 4 && prefixPattern.test(candidate.key)) {
        addLookupCandidate(candidates, candidate.key.slice(1), 'prefix-stripped candidate', 20 + pass * 4);
      }
    });
  }
  [...candidates.values()].slice().forEach((candidate) => {
    if (!candidate.key.endsWith('\u05D9\u05DE')) return;
    const stem = candidate.key.slice(0, -2);
    if (stem.endsWith('\u05D4') && stem.length >= 3) {
      addLookupCandidate(candidates, `${stem.slice(0, -1)}\u05D5\u05D4\u05D9\u05DE`, 'mater-expanded plural candidate', 14);
    }
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

function hasPublicSourceRows(card) {
  const rows = Array.isArray(card?.source_rows) ? card.source_rows : [];
  return rows.length > 0 && rows.every((row) => SOURCE_FIELDS.every((field) => String(row?.[field] || '').trim()));
}

function asciiToken(value) {
  return [...String(value || '')].map((char) => {
    const codePoint = char.codePointAt(0);
    if (codePoint >= 0x20 && codePoint <= 0x7e) return char;
    return `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
  }).join(' ');
}

function sampleLabel(sample) {
  return `${sample.token_index_id} (${asciiToken(sample.surface_word)})`;
}

function isAnswerEligible(card) {
  const role = String(card?.answer_role || '').toLowerCase().replace(/[\s-]+/g, '_');
  return card?.answer_eligible === true && ['', 'answer', 'definition', 'reader_answer', 'primary_definition'].includes(role);
}

function buildTokenRows(manifestPath, tokenIds) {
  const manifest = readJson(manifestPath);
  const chunks = new Map();
  const tokenRows = new Map();
  const chunkById = new Map((manifest.chunks || []).map((chunk) => [chunk.chunk_id, chunk]));
  for (const tokenId of tokenIds) {
    const chunkId = manifest.token_chunks?.[tokenId];
    if (!chunkId || chunks.has(chunkId)) continue;
    const chunkInfo = chunkById.get(chunkId);
    if (!chunkInfo?.url) continue;
    const chunkPath = resolveFromFile(manifestPath, chunkInfo.url);
    const chunk = readJson(chunkPath);
    chunks.set(chunkId, chunk);
    for (const row of chunk.token_index?.forms || []) tokenRows.set(row.token_index_id, row);
  }
  return { manifest, tokenRows, loadedChunkCount: chunks.size };
}

function tokenAlignmentKey(value) {
  return normalizeHebrewKey(value).replace(/[\u05BE-]/g, '');
}

function consumeAlignedStaticToken(staticToken, tokenIds, tokenRows, state) {
  const target = tokenAlignmentKey(staticToken);
  let combined = '';
  const consumed = [];
  for (let offset = 0; state.index + offset < tokenIds.length && offset < 6; offset += 1) {
    const id = tokenIds[state.index + offset];
    const row = tokenRows.get(id) || {};
    const key = tokenAlignmentKey(row?.surface_word || row?.hebrew_word || row?.normalized_word || '');
    if (!key) break;
    combined += key;
    consumed.push({ id, row });
    if (combined === target) {
      state.index += consumed.length;
      return consumed;
    }
    if (!target.startsWith(combined)) break;
  }
  return null;
}

function paragraphTokensAlign(staticTokens, tokenIds, tokenRows) {
  const state = { index: 0 };
  for (const staticToken of staticTokens) {
    if (!consumeAlignedStaticToken(staticToken, tokenIds, tokenRows, state)) return false;
  }
  return state.index === tokenIds.length;
}

function extractUnitsAndParagraphs(html) {
  const units = new Map();
  for (const match of html.matchAll(/<section\b(?=[^>]*data-lexical-unit)[^>]*>[\s\S]*?<\/section>/g)) {
    const block = match[0];
    const openTag = block.match(/<section\b[^>]*>/)?.[0] || '';
    const attrs = parseAttrs(openTag);
    const id = attrs.id || attrs['data-unit-id'] || '';
    const paragraphs = [];
    for (const pMatch of block.matchAll(/<p\b(?=[^>]*data-lexical-paragraph)[^>]*>([\s\S]*?)<\/p>/g)) {
      const pAttrs = parseAttrs(pMatch[0].match(/<p\b[^>]*>/)?.[0] || '');
      const text = decodeHtmlEntities(pMatch[1].replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ''));
      const tokens = [...text.matchAll(HEBREW_TOKEN_RE)].map((tokenMatch) => tokenMatch[0]);
      paragraphs.push({
        index: Number(pAttrs['data-lexical-paragraph']),
        tokenCount: tokens.length,
        tokens,
      });
    }
    if (id) units.set(id, { id, sourceRef: attrs['data-source-ref'] || '', paragraphs });
  }
  return units;
}

function selectSampleRows(tokenRows, occurrenceTokenOrder, sampleLimit) {
  const rowsById = new Map([...tokenRows.values()].map((row) => [row.token_index_id, row]));
  const rows = occurrenceTokenOrder.map((tokenId) => rowsById.get(tokenId)).filter(Boolean);
  const selected = [];
  const seen = new Set();
  const add = (row, reason) => {
    if (!row || seen.has(row.token_index_id)) return;
    seen.add(row.token_index_id);
    selected.push({ row, reason });
  };
  rows.slice(0, 16).forEach((row) => add(row, 'opening_sequence'));
  rows.filter((row) => String(row.surface_word || '').includes('\u05BE')).slice(0, 10).forEach((row) => add(row, 'maqaf'));
  rows.filter((row) => /[\u05D9\u05DD\u05D5\u05EA\u05D4\u05DF\u05E0\u05DA\u05DB]$/.test(normalizeHebrewKey(row.normalized_word || row.surface_word || ''))).slice(0, 10).forEach((row) => add(row, 'suffix_candidate'));
  rows.filter((row) => /^[\u05D5\u05D1\u05DB\u05DC\u05DE\u05D4\u05E9]/.test(normalizeHebrewKey(row.normalized_word || row.surface_word || ''))).slice(0, 10).forEach((row) => add(row, 'prefix_candidate'));
  return selected.slice(0, sampleLimit);
}

function routeLookupForSample(sample, routeManifest, routeManifestPath, routeShardCache) {
  const prefixLength = Number(routeManifest.prefix_length || 2);
  const candidates = lookupCandidatesFor(sample.row.surface_word, sample.row.normalized_word || sample.row.surface_word);
  const shardByKey = new Map((routeManifest.shards || []).map((shard) => [shard.shard, shard]));
  const cards = [];
  const missingShards = [];
  for (const candidate of candidates) {
    const shardKey = codepointKey(candidate.key, prefixLength);
    const shardInfo = shardByKey.get(shardKey);
    if (!shardInfo?.path) {
      missingShards.push(shardKey);
      continue;
    }
    if (!routeShardCache.has(shardKey)) {
      routeShardCache.set(shardKey, readJson(resolveFromFile(routeManifestPath, shardInfo.path)));
    }
    const shard = routeShardCache.get(shardKey);
    for (const card of shard.routes_by_normalized?.[candidate.key] || []) {
      cards.push({ ...card, lookup_key: candidate.key, lookup_relation: candidate.relation, lookup_penalty: candidate.penalty });
    }
  }
  const answerCards = cards.filter(isAnswerEligible);
  return {
    token_index_id: sample.row.token_index_id,
    surface_word: sample.row.surface_word || '',
    normalized_word: sample.row.normalized_word || normalizeHebrewKey(sample.row.surface_word || ''),
    reason: sample.reason,
    candidates: candidates.map((candidate) => `${candidate.key}:${candidate.relation}`),
    card_count: cards.length,
    answer_eligible_count: answerCards.length,
    answer_eligible_with_source_rows: answerCards.filter(hasPublicSourceRows).length,
    any_card_with_source_rows: cards.some(hasPublicSourceRows),
    missing_shards: [...new Set(missingShards)],
  };
}

function writeReport(markdownPath, jsonPath, result) {
  const lines = [
    '# Agent 5 Route HUD Click Contract Prevalidation',
    '',
    `Generated: ${result.generated_at}`,
    '',
    `Verdict: ${result.verdict}`,
    '',
    'This is a static prevalidation artifact for Agent 6. It does not claim browser click proof; the in-app browser blocked direct file URL navigation for this page.',
    '',
    '## Scope',
    '',
    `- Page: ${result.page}`,
    `- Runtime: ${result.runtime_scripts.map((script) => script.path).join(', ') || 'none'}`,
    `- Occurrence artifact: ${result.artifacts.occurrences}`,
    `- Lexical manifest: ${result.artifacts.lexical_manifest}`,
    `- Route lookup manifest: ${result.artifacts.route_lookup_manifest}`,
    '',
    '## Contract Counts',
    '',
    `- Static units: ${result.counts.static_units}`,
    `- Occurrence units: ${result.counts.occurrence_units}`,
    `- Occurrence token placements: ${result.counts.occurrence_token_placements}`,
    `- Unique token ids: ${result.counts.unique_token_ids}`,
    `- Loaded lexical chunks: ${result.counts.loaded_lexical_chunks}`,
    `- Token rows resolved: ${result.counts.token_rows_resolved}`,
    `- Maqaf token rows: ${result.counts.maqaf_token_rows}`,
    `- Paragraph count mismatches: ${result.counts.paragraph_count_mismatches}`,
    `- Paragraph split-token alignments: ${result.counts.paragraph_split_token_alignments}`,
    `- Paragraph alignment failures: ${result.counts.paragraph_alignment_failures}`,
    `- Runtime required markers missing: ${result.counts.runtime_markers_missing}`,
    `- Page required markers missing: ${result.counts.page_markers_missing}`,
    `- Forbidden stale page markers: ${result.counts.forbidden_page_markers}`,
    '',
    '## Route Lookup Sample',
    '',
    `- Sampled token rows: ${result.counts.sampled_token_rows}`,
    `- Samples with route cards: ${result.counts.samples_with_route_cards}`,
    `- Samples with answer-eligible route cards: ${result.counts.samples_with_answer_eligible}`,
    `- Samples with answer-eligible source/license rows: ${result.counts.samples_with_answer_source_rows}`,
    `- Samples with missing lookup shards: ${result.counts.samples_with_missing_lookup_shards}`,
    '- Missing lookup shards are coverage metrics for no-route/generated candidates, not warnings by themselves.',
    '',
    '| reason | token id | surface codepoints | normalized codepoints | cards | answer eligible | answer source rows |',
    '|---|---:|---:|---:|---:|---:|---:|',
    ...result.route_samples.slice(0, 18).map((sample) => `| ${sample.reason} | ${sample.token_index_id} | ${asciiToken(sample.surface_word).replaceAll('|', '/')} | ${asciiToken(sample.normalized_word).replaceAll('|', '/')} | ${sample.card_count} | ${sample.answer_eligible_count} | ${sample.answer_eligible_with_source_rows} |`),
    '',
    '## Issues',
    '',
    ...(result.issues.length ? result.issues.map((issue) => `- ${issue}`) : ['- none']),
    '',
    '## Warnings',
    '',
    ...(result.warnings.length ? result.warnings.map((warning) => `- ${warning}`) : ['- none']),
    '',
    '## Agent 6 Boundary',
    '',
    '- Needs Agent 6 signoff before this can be treated as validation evidence.',
    '- Does not accept publication, source/provenance scope, Reader Workbench expansion, or live browser click reachability.',
    '- Publication remains blocked_no_render.',
    '',
  ];
  fs.writeFileSync(workspacePath(markdownPath), `${lines.join('\n')}\n`);
  fs.writeFileSync(workspacePath(jsonPath), `${JSON.stringify(result, null, 2)}\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  const pagePath = workspacePath(args.page);
  const html = fs.readFileSync(pagePath, 'utf8');
  const issues = [];
  const warnings = [];

  const pageMarkersMissing = REQUIRED_PAGE_MARKERS.filter((marker) => !html.includes(marker));
  pageMarkersMissing.forEach((marker) => issues.push(`missing required page marker: ${marker}`));
  const forbiddenPageMarkers = FORBIDDEN_PAGE_MARKERS.filter((marker) => html.includes(marker));
  forbiddenPageMarkers.forEach((marker) => issues.push(`contains stale/forbidden page marker: ${marker}`));

  const configNode = extractJsonScript(html, 'data-lexical-config');
  if (!configNode?.text) throw new Error(`Missing data-lexical-config in ${args.page}`);
  const config = JSON.parse(configNode.text);
  for (const field of REQUIRED_CONFIG_FIELDS) {
    if (!String(config[field] || '').trim()) issues.push(`data-lexical-config missing ${field}`);
  }

  const occurrenceNode = extractJsonScript(html, 'data-lexical-occurrences');
  const occurrenceHref = config.occurrence_url || occurrenceNode?.attrs?.['data-src'] || '';
  const occurrencePath = resolveFromPage(args.page, occurrenceHref);
  const occurrences = occurrenceNode?.text && occurrenceNode.text !== '{}'
    ? JSON.parse(occurrenceNode.text)
    : readJson(occurrencePath);
  const lexicalManifestPath = resolveFromPage(args.page, config.manifest_url);
  const routeManifestPath = resolveFromPage(args.page, config.hud_route_lookup_manifest_url);
  const routeManifest = readJson(routeManifestPath);
  const runtimeScripts = extractLinkedRuntime(html, args.page);
  if (!runtimeScripts.length) issues.push('missing linked reader-workbench.js runtime');
  runtimeScripts.forEach((script) => {
    if (!script.text) issues.push(`missing linked runtime script: ${script.src}`);
  });
  const runtimeText = runtimeScripts.map((script) => script.text).join('\n');
  const runtimeMarkersMissing = REQUIRED_RUNTIME_MARKERS.filter((marker) => !runtimeText.includes(marker));
  runtimeMarkersMissing.forEach((marker) => issues.push(`runtime missing marker: ${marker}`));

  const staticUnits = extractUnitsAndParagraphs(html);
  const occurrenceUnits = new Map(Object.entries(occurrences.units || {}));
  for (const unitId of occurrenceUnits.keys()) {
    if (!staticUnits.has(unitId)) issues.push(`occurrence unit missing from static page: ${unitId}`);
  }
  for (const unitId of staticUnits.keys()) {
    if (!occurrenceUnits.has(unitId)) warnings.push(`static page unit missing from occurrence artifact: ${unitId}`);
  }

  let occurrenceTokenPlacements = 0;
  const occurrenceTokenOrder = [];
  const paragraphCountMismatches = [];
  for (const [unitId, unitData] of occurrenceUnits.entries()) {
    const staticUnit = staticUnits.get(unitId);
    for (const paragraph of unitData.paragraphs || []) {
      const tokenIds = paragraph.token_index_ids || [];
      occurrenceTokenPlacements += tokenIds.length;
      occurrenceTokenOrder.push(...tokenIds);
      const staticParagraph = staticUnit?.paragraphs.find((item) => item.index === Number(paragraph.paragraph_index));
      if (staticParagraph && staticParagraph.tokenCount !== tokenIds.length) {
        paragraphCountMismatches.push({
          unitId,
          paragraphIndex: Number(paragraph.paragraph_index),
          staticCount: staticParagraph.tokenCount,
          occurrenceCount: tokenIds.length,
          staticTokens: staticParagraph.tokens,
          tokenIds,
        });
      }
    }
  }

  const uniqueTokenIds = [...new Set(occurrenceTokenOrder)];
  const { manifest: lexicalManifest, tokenRows, loadedChunkCount } = buildTokenRows(lexicalManifestPath, uniqueTokenIds);
  const missingChunkMappings = uniqueTokenIds.filter((tokenId) => !lexicalManifest.token_chunks?.[tokenId]);
  missingChunkMappings.slice(0, 25).forEach((tokenId) => issues.push(`token id missing lexical chunk mapping: ${tokenId}`));
  if (missingChunkMappings.length > 25) issues.push(`missing token chunk mappings truncated: ${missingChunkMappings.length - 25} more`);
  const missingTokenRows = uniqueTokenIds.filter((tokenId) => !tokenRows.has(tokenId));
  missingTokenRows.slice(0, 25).forEach((tokenId) => issues.push(`token id missing lexical row after chunk load: ${tokenId}`));
  if (missingTokenRows.length > 25) issues.push(`missing token rows truncated: ${missingTokenRows.length - 25} more`);

  const unalignedParagraphs = paragraphCountMismatches.filter((item) => !paragraphTokensAlign(item.staticTokens, item.tokenIds, tokenRows));
  const alignedSplitParagraphs = paragraphCountMismatches.length - unalignedParagraphs.length;
  unalignedParagraphs.slice(0, 25).forEach((item) => {
    issues.push(`paragraph token alignment mismatch: ${item.unitId} p${item.paragraphIndex}: static ${item.staticCount}, occurrence ${item.occurrenceCount}`);
  });
  if (unalignedParagraphs.length > 25) issues.push(`paragraph token alignment mismatches truncated: ${unalignedParagraphs.length - 25} more`);
  if (alignedSplitParagraphs) warnings.push(`paragraph count mismatches resolved by split-token alignment: ${alignedSplitParagraphs}`);

  const routeShardCache = new Map();
  const samples = selectSampleRows(tokenRows, occurrenceTokenOrder, args.sampleLimit);
  const routeSamples = samples.map((sample) => routeLookupForSample(sample, routeManifest, routeManifestPath, routeShardCache));
  routeSamples.filter((sample) => sample.card_count && sample.answer_eligible_count && !sample.answer_eligible_with_source_rows).forEach((sample) => {
    issues.push(`sample answer-eligible cards lack complete source/license rows: ${sampleLabel(sample)}`);
  });

  const tokenRowsArray = [...tokenRows.values()];
  const result = {
    generated_at: new Date().toISOString(),
    artifact_type: 'agent5_route_hud_click_contract_prevalidation',
    verdict: issues.length ? 'fail_static_contract' : 'pass_static_prevalidation_browser_click_unproven',
    page: args.page.replaceAll('\\', '/'),
    browser_click_proof: 'not_run_direct_file_url_blocked_by_in_app_browser_policy',
    artifacts: {
      occurrences: relFromRoot(occurrencePath),
      lexical_manifest: relFromRoot(lexicalManifestPath),
      route_lookup_manifest: relFromRoot(routeManifestPath),
      markdown_report: args.report.replaceAll('\\', '/'),
      json_report: args.json.replaceAll('\\', '/'),
    },
    runtime_scripts: runtimeScripts.map((script) => ({ src: normalizeHref(script.src), path: relFromRoot(script.fullPath), present: Boolean(script.text) })),
    counts: {
      static_units: staticUnits.size,
      occurrence_units: occurrenceUnits.size,
      occurrence_token_placements: occurrenceTokenPlacements,
      unique_token_ids: uniqueTokenIds.length,
      loaded_lexical_chunks: loadedChunkCount,
      token_rows_resolved: tokenRows.size,
      maqaf_token_rows: tokenRowsArray.filter((row) => String(row.surface_word || '').includes('\u05BE')).length,
      paragraph_count_mismatches: paragraphCountMismatches.length,
      paragraph_split_token_alignments: alignedSplitParagraphs,
      paragraph_alignment_failures: unalignedParagraphs.length,
      runtime_markers_missing: runtimeMarkersMissing.length,
      page_markers_missing: pageMarkersMissing.length,
      forbidden_page_markers: forbiddenPageMarkers.length,
      sampled_token_rows: routeSamples.length,
      samples_with_route_cards: routeSamples.filter((sample) => sample.card_count > 0).length,
      samples_with_answer_eligible: routeSamples.filter((sample) => sample.answer_eligible_count > 0).length,
      samples_with_answer_source_rows: routeSamples.filter((sample) => sample.answer_eligible_with_source_rows > 0).length,
      samples_with_missing_lookup_shards: routeSamples.filter((sample) => sample.missing_shards.length).length,
    },
    route_samples: routeSamples,
    issues,
    warnings,
  };

  writeReport(args.report, args.json, result);
  if (issues.length) {
    console.error(`Route HUD click contract prevalidation failed with ${issues.length} issue(s).`);
    console.error(`Report: ${args.report}`);
    process.exit(1);
  }
  console.log(`Route HUD click contract prevalidation passed: ${args.report}`);
}

try {
  main();
} catch (error) {
  console.error(error.stack || error.message);
  process.exit(1);
}

#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  workset: 'reports/agent12-agent3-route-selection-crossmatch-workset-2026-06-05.md',
  tokenIndex: 'data/lexical/token-indexes/orot.json',
  occurrences: 'data/lexical/occurrences/orot.json',
  readerHints: 'data/public-hud/orot/reader-hints.json',
  routeShardDir: 'data/definitions/hud-route-lookup/shards',
  output: 'reports/agent3-orot-route-selection-crossmatch-matrix-2026-06-05.json',
  report: 'reports/agent3-orot-route-selection-crossmatch-matrix-2026-06-05.md',
};

const options = parseArgs(process.argv.slice(2));
const tokenIndex = readJson(options.tokenIndex);
const occurrences = readJson(options.occurrences);
const readerHints = readJson(options.readerHints);
const worksetExists = fs.existsSync(abs(options.workset));

const GERESH = '\u05f3';
const targetForms = [
  { key: 'dalet_geresh', surface: `\u05d3${GERESH}`, base: `\u05d3${GERESH}`, expected_lexicon_entry_id: 'lex-yhwh-h3068' },
  { key: 'bet_dalet_geresh', surface: `\u05d1\u05d3${GERESH}`, base: `\u05d3${GERESH}`, expected_lexicon_entry_id: 'lex-yhwh-h3068' },
  { key: 'vav_dalet_geresh', surface: `\u05d5\u05d3${GERESH}`, base: `\u05d3${GERESH}`, expected_lexicon_entry_id: 'lex-yhwh-h3068' },
  { key: 'lamed_dalet_geresh', surface: `\u05dc\u05d3${GERESH}`, base: `\u05d3${GERESH}`, expected_lexicon_entry_id: 'lex-yhwh-h3068' },
  { key: 'heh_geresh', surface: `\u05d4${GERESH}`, base: `\u05d4${GERESH}`, expected_lexicon_entry_id: null },
  { key: 'bet_heh_geresh', surface: `\u05d1\u05d4${GERESH}`, base: `\u05d4${GERESH}`, expected_lexicon_entry_id: null },
  { key: 'lamed_heh_geresh', surface: `\u05dc\u05d4${GERESH}`, base: `\u05d4${GERESH}`, expected_lexicon_entry_id: null },
  { key: 'vav_heh_geresh', surface: `\u05d5\u05d4${GERESH}`, base: `\u05d4${GERESH}`, expected_lexicon_entry_id: null },
  { key: 'heh_dalet_geresh', surface: `\u05d4\u05d3${GERESH}`, base: `\u05d3${GERESH}`, expected_lexicon_entry_id: null },
  { key: 'heh_heh_geresh', surface: `\u05d4\u05d4${GERESH}`, base: `\u05d4${GERESH}`, expected_lexicon_entry_id: null },
];

const targetBySurface = new Map(targetForms.map((target) => [target.surface, target]));
const tokenRows = Object.values(tokenIndex.forms || {}).filter((row) => targetBySurface.has(row.normalized_word));
const tokenById = new Map(Object.values(tokenIndex.forms || {}).map((row) => [row.token_index_id, row]));
const occurrenceLinksByTokenId = buildOccurrenceLinks(tokenById, occurrences);

const rows = tokenRows.map((tokenRow) => buildMatrixRow(tokenRow));
const missingTargetForms = targetForms
  .filter((target) => !tokenRows.some((row) => row.normalized_word === target.surface))
  .map((target) => ({
    target_key: target.key,
    normalized: target.surface,
    base_normalized: target.base,
    status: 'target_form_not_present_in_orot_token_index',
  }));

const counts = {
  target_forms_declared: targetForms.length,
  target_forms_present: tokenRows.length,
  target_forms_absent: missingTargetForms.length,
  token_index_rows: rows.length,
  token_index_occurrences: sum(rows, (row) => row.occurrence_count),
  occurrence_links: sum(rows, (row) => row.occurrence_links.length),
  occurrence_count_mismatch_rows: rows.filter((row) => row.occurrence_count !== row.occurrence_links.length).length,
  reader_hint_rows: rows.filter((row) => row.selected_hint !== null).length,
  route_shards_present: rows.filter((row) => row.route_shard.exists).length,
  route_shards_missing: rows.filter((row) => !row.route_shard.exists).length,
  route_cards_available: sum(rows, (row) => row.route_shard.route_card_count),
  matching_route_card_rows: sum(rows, (row) => row.better_matching_route_cards.length),
  related_base_route_card_rows: sum(rows, (row) => row.related_base_route_cards.length),
  candidate_selection_mismatch_rows: rows.filter((row) => row.status === 'candidate_selection_mismatch').length,
  candidate_token_index_linkage_gap_rows: rows.filter((row) => row.status === 'candidate_token_index_linkage_gap').length,
  exact_blocker_rows: rows.filter((row) => row.status.startsWith('exact_blocker')).length,
  observed_usage_only_rows: rows.filter((row) => row.status === 'observed_usage_only').length,
  reader_facing_rows: 0,
  route_payload_field_hits: 0,
  forbidden_authority_field_hits: 0,
  definition_payload_fields: 0,
  source_text_read: 0,
  hud_files_written: 0,
  route_files_written: 0,
  public_runtime_mutations: 0,
  answer_selection_claims: 0,
  acceptance_claims: 0,
};

const artifact = {
  schema_version: 1,
  artifact_type: 'agent3_orot_route_selection_crossmatch_matrix',
  generated_at: new Date().toISOString(),
  generator: 'scripts/build_agent3_orot_route_selection_crossmatch_matrix.mjs',
  lane_owner: 'Agent 3',
  status: 'evidence-ready',
  workset: {
    source: options.workset,
    exists: worksetExists,
    supplied_by: 'Agent 12',
    target: 'Orot route-selection crossmatch for exact Divine Name abbreviation tokens',
  },
  scope: {
    work_id: tokenIndex.work_id || 'orot',
    work_title: tokenIndex.work_title || 'Orot',
    active_mode: 'WEEKLY_LEXICON_EXPANSION_GOAL_MODE',
    target_forms: targetForms.map((target) => ({
      target_key: target.key,
      normalized: target.surface,
      base_normalized: target.base,
      expected_lexicon_entry_id: target.expected_lexicon_entry_id,
    })),
    source_files: [
      options.workset,
      options.tokenIndex,
      options.occurrences,
      options.readerHints,
      `${options.routeShardDir}/05d3-05f3.json`,
      `${options.routeShardDir}/05d4-05f3.json`,
    ],
  },
  authority_boundary: {
    navigation_evidence_only: true,
    route_id_pointer_only: true,
    occurrence_link_packet_only: true,
    selected_hint_display_text_copied: false,
    route_definition_payload_copied: false,
    usage_as_definition_authority: false,
    definition_authority: false,
    answer_selection: false,
    route_ranking: false,
    semantic_arbitration: false,
    hud_write: false,
    public_runtime_mutation: false,
    source_license_acceptance: false,
    qa_acceptance: false,
    publication_readiness: false,
    accepted_gloss_text: false,
  },
  counts,
  missing_target_forms: missingTargetForms,
  rows,
  downstream_handoff: {
    package_owner: 'Agent 10',
    transform_owner_after_mechanical_review: 'Agent 2',
    qa_boundary_owner_if_needed: 'Agent 6',
    stop_condition:
      'Use this as evidence-only matrix input; route/hint selection changes, QA acceptance, and any public/runtime mutation remain outside Agent 3.',
  },
};

writeJson(options.output, artifact);
writeMarkdown(options.report, artifact);
console.log(
  `Agent 3 route-selection crossmatch matrix rows=${counts.token_index_rows} occurrences=${counts.occurrence_links} candidate_mismatch=${counts.candidate_selection_mismatch_rows} linkage_gap=${counts.candidate_token_index_linkage_gap_rows} blockers=${counts.exact_blocker_rows}`,
);

function buildMatrixRow(tokenRow) {
  const target = targetBySurface.get(tokenRow.normalized_word);
  const selectedHint = (readerHints.hints || {})[tokenRow.token_index_id] || null;
  const shard = readShard(tokenRow.normalized_word);
  const baseShard = target.base === tokenRow.normalized_word ? shard : readShard(target.base);
  const routeCards = shard.cards;
  const baseRouteCards = baseShard.cards;
  const selectedCard = routeCards.find((card) => card.card_id === selectedHint?.route_card_id) || null;
  const betterMatchingRouteCards = routeCards.filter((card) =>
    routeCardMatchesTokenLinkage(card, tokenRow, selectedHint),
  );
  const relatedBaseRouteCards =
    target.base === tokenRow.normalized_word
      ? []
      : baseRouteCards.filter((card) => routeCardMatchesExpectedBase(card, target));
  const selectedCardMatches = selectedCard
    ? betterMatchingRouteCards.some((card) => card.card_id === selectedCard.card_id)
    : false;
  const status = classifyStatus({
    tokenRow,
    selectedHint,
    shard,
    betterMatchingRouteCards,
    relatedBaseRouteCards,
    selectedCardMatches,
  });

  return {
    row_id: `agent3-orot-route-selection-${tokenRow.token_index_id}`,
    work_id: tokenRow.work_id || 'orot',
    work_title: tokenIndex.work_title || 'Orot',
    target_key: target.key,
    token_index_id: tokenRow.token_index_id,
    token_surface: tokenRow.surface_word,
    token_normalized: tokenRow.normalized_word,
    lexicon_entry_id: tokenRow.lexicon_entry_id || '',
    token_index_status: tokenRow.status || '',
    match_method: tokenRow.match_method || '',
    occurrence_count: Number(tokenRow.occurrence_count || 0),
    occurrence_links: occurrenceLinksByTokenId.get(tokenRow.token_index_id) || [],
    selected_hint: selectedHint
      ? {
          route_card_id: selectedHint.route_card_id || '',
          route_family: selectedHint.route_family || '',
          route_type: selectedHint.route_type || '',
          match_type: selectedHint.match_type || '',
          source_family: selectedHint.source_family || '',
          source_id: selectedHint.source_id || '',
          source_url: selectedHint.source_url || '',
          license: selectedHint.license || '',
          license_url: selectedHint.license_url || '',
          match_percent: selectedHint.match_percent ?? null,
          normalized: selectedHint.normalized || '',
          status: selectedHint.status || '',
          candidate_status: selectedHint.candidate_status || '',
          display_text_sha256: sha256(selectedHint.display || ''),
          display_class: classifyHintDisplay(selectedHint.display || ''),
        }
      : null,
    route_shard: {
      path: shard.path,
      exists: shard.exists,
      route_card_count: routeCards.length,
      answer_eligible_card_count: routeCards.filter((card) => card.answer_eligible).length,
      selected_card_exists: Boolean(selectedCard),
      selected_card_matches_token_linkage: selectedCardMatches,
    },
    better_matching_route_cards: betterMatchingRouteCards.map(compactRouteCard),
    related_base_route_cards: relatedBaseRouteCards.map(compactRouteCard),
    status,
    blocker: blockerForStatus(status),
    handoff_owner:
      status === 'candidate_selection_mismatch'
        ? 'Agent 10 package intake; Agent 2 selection transform if accepted downstream'
        : status === 'candidate_token_index_linkage_gap'
          ? 'Agent 10 package intake; Agent 2 token-index linkage review if accepted downstream'
          : status.startsWith('exact_blocker')
            ? 'Agent 3/Agent 2 exact mechanical route-shard or reader-hint input blocker'
            : 'Agent 10 package intake',
    boundary_note:
      'Evidence-only route-selection crossmatch. Card IDs and occurrence links are supplied for review; Agent 3 does not select answers, rank routes, or accept gloss text.',
  };
}

function buildOccurrenceLinks(tokenById, occurrencePacket) {
  const links = new Map();
  for (const unit of Object.values(occurrencePacket.units || {})) {
    for (const paragraph of unit.paragraphs || []) {
      const ids = paragraph.token_index_ids || [];
      for (let index = 0; index < ids.length; index += 1) {
        const tokenId = ids[index];
        if (!links.has(tokenId)) links.set(tokenId, []);
        const token = tokenById.get(tokenId);
        const windowStart = Math.max(0, index - 5);
        const windowEnd = Math.min(ids.length, index + 6);
        const contextTokens = ids.slice(windowStart, windowEnd).map((id, offset) => {
          const row = tokenById.get(id) || {};
          const absoluteIndex = windowStart + offset;
          return {
            token_index_id: id,
            surface: row.surface_word || '',
            normalized: row.normalized_word || '',
            lexicon_entry_id: row.lexicon_entry_id || '',
            role: absoluteIndex === index ? 'focus-token' : 'context',
          };
        });
        links.get(tokenId).push({
          occurrence_id: `${unit.unit_id}:p${paragraph.paragraph_index}:t${index}`,
          source_ref: unit.source_ref || '',
          work_page_anchor: `orot/index.html#${unit.anchor_id || unit.unit_id}`,
          anchor_id: unit.anchor_id || unit.unit_id || '',
          paragraph_index: Number(paragraph.paragraph_index || 0),
          token_position: index,
          token_surface: token?.surface_word || '',
          token_normalized: token?.normalized_word || '',
          context_snippet_hebrew: contextTokens
            .map((entry) => (entry.role === 'focus-token' ? `[${entry.surface}]` : entry.surface))
            .join(' '),
          context_tokens: contextTokens,
        });
      }
    }
  }
  return links;
}

function readShard(normalized) {
  const shardPath = path.join(options.routeShardDir, `${codepointKey(normalized)}.json`);
  if (!fs.existsSync(abs(shardPath))) return { path: shardPath, exists: false, cards: [] };
  const shard = readJson(shardPath);
  return {
    path: shardPath,
    exists: true,
    cards: Object.values(shard.routes_by_normalized || {}).flat(),
  };
}

function routeCardMatchesTokenLinkage(card, tokenRow, selectedHint) {
  if (!card || !tokenRow) return false;
  if (tokenRow.lexicon_entry_id === 'lex-yhwh-h3068') return routeCardMentionsH3068(card);
  if (tokenRow.normalized_word === `\u05d4${GERESH}`) {
    return (
      card.route_family === 'project_lexical' ||
      sourceRows(card).some((row) => String(row.source_id || '').includes('hashem'))
    );
  }
  return selectedHint?.route_card_id && card.card_id === selectedHint.route_card_id;
}

function routeCardMatchesExpectedBase(card, target) {
  if (target.expected_lexicon_entry_id === 'lex-yhwh-h3068') return routeCardMentionsH3068(card);
  if (target.base === `\u05d4${GERESH}`) {
    return (
      card.route_family === 'project_lexical' ||
      sourceRows(card).some((row) => String(row.source_id || '').includes('hashem'))
    );
  }
  return false;
}

function routeCardMentionsH3068(card) {
  return sourceRows(card).some((row) => {
    const sourceId = String(row.source_id || '');
    const notes = String(row.notes || '');
    return sourceId.includes('H3068') || sourceId.includes('lemma 3068') || notes.includes('3068');
  });
}

function compactRouteCard(card) {
  const rows = sourceRows(card);
  return {
    route_card_id: card.card_id || '',
    route_family: card.route_family || '',
    route_type: card.route_type || '',
    match_type: card.match_type || '',
    answer_eligible: Boolean(card.answer_eligible),
    answer_score: card.answer_score ?? null,
    raw_score: card.raw_score ?? null,
    adjusted_score: card.adjusted_score ?? null,
    source_families: unique(rows.map((row) => row.source_family || '').filter(Boolean)),
    source_ids: unique(rows.map((row) => row.source_id || '').filter(Boolean)),
    licenses: unique(rows.map((row) => row.license || '').filter(Boolean)),
    license_urls: unique(rows.map((row) => row.license_url || '').filter(Boolean)),
  };
}

function classifyStatus({
  tokenRow,
  selectedHint,
  shard,
  betterMatchingRouteCards,
  relatedBaseRouteCards,
  selectedCardMatches,
}) {
  if (
    tokenRow.lexicon_entry_id === 'lex-yhwh-h3068' &&
    selectedHint &&
    betterMatchingRouteCards.length > 0 &&
    !selectedCardMatches
  ) {
    return 'candidate_selection_mismatch';
  }
  if (tokenRow.lexicon_entry_id === 'lex-yhwh-h3068' && !selectedHint && !shard.exists) {
    return relatedBaseRouteCards.length > 0
      ? 'exact_blocker_missing_prefixed_route_shard_and_reader_hint'
      : 'exact_blocker_missing_route_shard_and_reader_hint';
  }
  if (!tokenRow.lexicon_entry_id && selectedHint && betterMatchingRouteCards.length > 0) {
    return 'candidate_token_index_linkage_gap';
  }
  return 'observed_usage_only';
}

function blockerForStatus(status) {
  if (status === 'candidate_selection_mismatch') {
    return 'selected reader hint route card does not match token-index lexical identity while a matching route-card pointer exists';
  }
  if (status === 'candidate_token_index_linkage_gap') {
    return 'token index has no lexicon_entry_id while route/hint evidence exists for this exact normalized token';
  }
  if (status === 'exact_blocker_missing_prefixed_route_shard_and_reader_hint') {
    return 'prefixed token has lex-yhwh-h3068 token-index linkage but no exact prefixed route shard and no reader-hint row';
  }
  if (status === 'exact_blocker_missing_route_shard_and_reader_hint') {
    return 'token has lexical linkage but no exact route shard and no reader-hint row';
  }
  return '';
}

function classifyHintDisplay(display) {
  if (display.includes('/\u00f0/')) return 'phonetic_symbol_card';
  if (/Tetragrammaton|YHWH|Hashem/i.test(display)) return 'divine_name_abbreviation_card';
  if (/\bfive\b|fifth/i.test(display)) return 'numeric_letter_card';
  return 'other_existing_hint_card';
}

function sourceRows(card) {
  return Array.isArray(card?.source_rows) ? card.source_rows : [];
}

function writeMarkdown(outputPath, artifact) {
  const lines = [
    '# Agent 3 Orot Route-Selection Crossmatch Matrix',
    '',
    `Generated: ${artifact.generated_at}`,
    '',
    'Status: evidence-ready. This is route-selection/navigation evidence only; it does not select answers, rank routes, write HUD files, or accept gloss text.',
    '',
    '## Counts',
    '',
    '| metric | count |',
    '|---|---:|',
    ...Object.entries(artifact.counts).map(([key, value]) => `| ${key} | ${value} |`),
    '',
    '## Matrix Rows',
    '',
    '| token | token_id | lexicon_entry_id | occurrences | hint | route shard | matching route pointers | status | blocker |',
    '|---|---|---|---:|---|---|---:|---|---|',
    ...artifact.rows.map((row) =>
      [
        row.token_normalized,
        row.token_index_id,
        row.lexicon_entry_id || '(blank)',
        row.occurrence_links.length,
        row.selected_hint ? row.selected_hint.route_card_id : '(none)',
        row.route_shard.exists ? row.route_shard.path : `(missing) ${row.route_shard.path}`,
        row.better_matching_route_cards.length || row.related_base_route_cards.length,
        row.status,
        row.blocker || '',
      ].join(' | '),
    ).map((row) => `| ${row} |`),
    '',
    '## Occurrence Samples',
    '',
    ...artifact.rows.flatMap((row) => [
      `### ${row.token_normalized} / ${row.token_index_id}`,
      '',
      `Occurrences: ${row.occurrence_links.length}. Showing first 5 only; full occurrence links are in the JSON artifact.`,
      '',
      '| source_ref | anchor | context |',
      '|---|---|---|',
      ...row.occurrence_links.slice(0, 5).map((occurrence) =>
        `| ${occurrence.source_ref} | ${occurrence.work_page_anchor} | ${occurrence.context_snippet_hebrew} |`,
      ),
      '',
    ]),
    '## Boundary',
    '',
    '- No route publication support, no Definition authority, no usage-as-definition authority, no answer selection, no accepted gloss/text, no QA/source/license/runtime/publication/product acceptance.',
    '- Selected hint display text and route definition payloads are intentionally not copied; this packet preserves route-card IDs, source/license pointers, hashes, and occurrence links for downstream review.',
  ];
  fs.writeFileSync(abs(outputPath), `${lines.join('\n')}\n`);
}

function writeJson(outputPath, value) {
  fs.mkdirSync(path.dirname(abs(outputPath)), { recursive: true });
  fs.writeFileSync(abs(outputPath), `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(abs(filePath), 'utf8'));
}

function codepointKey(value) {
  return [...value].map((char) => char.codePointAt(0).toString(16).padStart(4, '0')).join('-');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function unique(values) {
  return [...new Set(values)];
}

function sum(rows, callback) {
  return rows.reduce((total, row) => total + Number(callback(row) || 0), 0);
}

function abs(filePath) {
  return path.resolve(root, filePath);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (!key.startsWith('--') || value === undefined) continue;
    const normalizedKey = key.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (normalizedKey in parsed) parsed[normalizedKey] = cleanRelativePath(value);
  }
  return parsed;
}

function cleanRelativePath(value) {
  return value.replace(/^["']|["']$/g, '').replaceAll('\\', '/');
}

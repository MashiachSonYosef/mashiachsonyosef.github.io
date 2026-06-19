#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = new Map();
for (const arg of process.argv.slice(2)) {
  const [key, ...rest] = arg.split('=');
  if (key.startsWith('--')) args.set(key.slice(2), rest.length ? rest.join('=') : 'true');
}

const input = args.get('input');
const outJson = args.get('out-json');
const outMd = args.get('out-md');
if (!input || !outJson || !outMd) {
  console.error('usage: node scripts/build_visible_selector_occurrence_context_map.mjs --input=<context-map.json> --out-json=<out.json> --out-md=<out.md>');
  process.exit(2);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function clean(value) {
  return String(value ?? '').trim();
}

function tokensForParagraph(text) {
  return clean(text)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function contextFor(tokens, index, radius = 5) {
  return {
    source_context_before: tokens.slice(Math.max(0, index - radius), index).join(' '),
    source_token: tokens[index] ?? '',
    source_context_after: tokens.slice(index + 1, index + 1 + radius).join(' '),
  };
}

function comparableToken(value) {
  return clean(value)
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/[.,;:!?״׳"'()[\]{}<>]/g, '')
    .replace(/\u05BE/g, '')
    .trim();
}

function findSourceTokenIndex(sourceTokens, surfaceWord, ordinal, fallbackIndex) {
  const comparableSurface = comparableToken(surfaceWord);
  const matches = [];
  sourceTokens.forEach((token, index) => {
    if (comparableToken(token) === comparableSurface) matches.push(index);
  });
  if (matches[ordinal] !== undefined) return {
    index: matches[ordinal],
    method: 'surface_ordinal_match',
    candidate_match_count: matches.length,
  };
  if (matches.length === 1) return {
    index: matches[0],
    method: 'single_surface_match',
    candidate_match_count: matches.length,
  };
  return {
    index: fallbackIndex,
    method: 'token_position_fallback',
    candidate_match_count: matches.length,
  };
}

const sourceMap = readJson(input);
const header = sourceMap.header ?? {};
const workId = clean(header.target_work_id || sourceMap.target?.target_work_id || sourceMap.work_id);
if (!workId) throw new Error('input map missing target work id');

const sourceId = clean(header.source_id || sourceMap.target?.source_id || sourceMap.source_id);
const selectorLabel = clean(header.selector_label || sourceMap.target?.selector_label || sourceMap.selector_label);
const rows = Array.isArray(sourceMap.rows) ? sourceMap.rows : [];
if (!rows.length) throw new Error('input map has no rows');

const occurrencePath = path.join('data', 'lexical', 'occurrences', `${workId}.json`);
const sourcePath = path.join('data', 'sources', `${workId}.json`);
const occurrenceData = readJson(occurrencePath);
const sourceData = readJson(sourcePath);
const workSlug = clean(occurrenceData.work_slug || sourceData.work_slug || header.page_path?.replace(/\/index\.html$/, ''));
const tokenIndexPath = path.join('data', 'lexical', 'token-indexes', `${workSlug}.json`);
const tokenIndexData = readJson(tokenIndexPath);

const tokenIndexById = new Map((tokenIndexData.forms ?? []).map((row) => [row.token_index_id, row]));
const sourceUnitById = new Map((sourceData.units ?? []).map((unit) => [unit.unit_id, unit]));
const targetRows = rows.map((row) => ({
  ...row,
  token_id: clean(row.token_id),
}));
const targetIds = new Set(targetRows.map((row) => row.token_id));

const occurrenceRows = [];
for (const unit of Object.values(occurrenceData.units ?? {})) {
  const sourceUnit = sourceUnitById.get(unit.unit_id);
  const hebrewParagraphs = Array.isArray(sourceUnit?.hebrew) ? sourceUnit.hebrew : [];
  for (const paragraph of unit.paragraphs ?? []) {
    const tokenIds = paragraph.token_index_ids ?? [];
    const paragraphIndex = Number(paragraph.paragraph_index ?? 0);
    const sourceTokens = tokensForParagraph(hebrewParagraphs[paragraphIndex] ?? hebrewParagraphs[0] ?? '');
    const ordinalByTokenId = new Map();
    tokenIds.forEach((tokenId, tokenPosition) => {
      if (!targetIds.has(tokenId)) return;
      const ordinal = ordinalByTokenId.get(tokenId) ?? 0;
      ordinalByTokenId.set(tokenId, ordinal + 1);
      const target = targetRows.find((row) => row.token_id === tokenId);
      const tokenIndex = tokenIndexById.get(tokenId) ?? {};
      const sourceTokenMatch = findSourceTokenIndex(sourceTokens, tokenIndex.surface_word ?? '', ordinal, tokenPosition);
      const context = contextFor(sourceTokens, sourceTokenMatch.index);
      occurrenceRows.push({
        token_id: tokenId,
        source_id: sourceId,
        selector_label: selectorLabel,
        work_id: workId,
        unit_id: unit.unit_id,
        anchor_id: unit.anchor_id,
        source_ref: unit.source_ref,
        paragraph_index: paragraphIndex,
        occurrence_token_position: tokenPosition,
        source_token_position: sourceTokenMatch.index,
        token_count: tokenIds.length,
        source_token_count: sourceTokens.length,
        surface_word: tokenIndex.surface_word ?? '',
        normalized_word: tokenIndex.normalized_word ?? '',
        token_index_occurrence_count: Number(tokenIndex.occurrence_count ?? 0),
        source_context_before: context.source_context_before,
        source_token: context.source_token,
        source_context_after: context.source_context_after,
        source_token_match_method: sourceTokenMatch.method,
        source_token_candidate_match_count: sourceTokenMatch.candidate_match_count,
        source_token_matches_index_surface: comparableToken(context.source_token) === comparableToken(tokenIndex.surface_word),
        lookup_relation: clean(target.lookup_relation),
        current_hud_route_id_if_any: clean(target.current_hud_route_id_if_any),
        map_row_decision: clean(target.row_decision),
        map_row_blocker: target.row_blocker ?? [],
      });
    });
  }
}

const occurrenceCounts = new Map();
for (const row of occurrenceRows) {
  occurrenceCounts.set(row.token_id, (occurrenceCounts.get(row.token_id) ?? 0) + 1);
}

const tokenSummaries = targetRows.map((row) => {
  const tokenIndex = tokenIndexById.get(row.token_id) ?? {};
  const occurrenceCountObserved = occurrenceCounts.get(row.token_id) ?? 0;
  const tokenIndexOccurrenceCount = Number(tokenIndex.occurrence_count ?? 0);
  const tokenOccurrences = occurrenceRows.filter((occurrence) => occurrence.token_id === row.token_id);
  const distinctSourceRefs = new Set(tokenOccurrences.map((occurrence) => occurrence.source_ref)).size;
  const distinctSourceTokens = [...new Set(tokenOccurrences.map((occurrence) => occurrence.source_token).filter(Boolean))];
  return {
    token_id: row.token_id,
    surface_word: clean(tokenIndex.surface_word),
    normalized_word: clean(tokenIndex.normalized_word),
    lookup_relation: clean(row.lookup_relation),
    current_hud_route_id_if_any: clean(row.current_hud_route_id_if_any),
    occurrence_count_observed: occurrenceCountObserved,
    token_index_occurrence_count: tokenIndexOccurrenceCount,
    occurrence_count_matches_token_index: occurrenceCountObserved === tokenIndexOccurrenceCount,
    distinct_source_refs: distinctSourceRefs,
    distinct_source_tokens_count: distinctSourceTokens.length,
    sample_source_tokens: distinctSourceTokens.slice(0, 8),
    map_row_decision: clean(row.row_decision),
    map_row_blocker: row.row_blocker ?? [],
    structure_review_state: occurrenceCountObserved === 1 && clean(row.lookup_relation) === 'exact'
      ? 'single_occurrence_candidate_for_A12_context_rule_review'
      : 'requires_A3_structure_review_before_visible_slot',
  };
});

const exactRows = tokenSummaries.filter((row) => row.lookup_relation === 'exact').length;
const prefixRows = tokenSummaries.filter((row) => row.lookup_relation.includes('prefix')).length;
const mismatchRows = tokenSummaries.filter((row) => !row.occurrence_count_matches_token_index);
const singleOccurrenceCandidates = tokenSummaries.filter((row) => row.structure_review_state === 'single_occurrence_candidate_for_A12_context_rule_review');

const result = {
  schema: 'a13_visible_selector_occurrence_context_map_v1',
  date: '2026-06-19',
  status: singleOccurrenceCandidates.length ? 'full_occurrence_map_built_some_single_occurrence_candidates' : 'full_occurrence_map_built_all_rows_require_A3_structure_review',
  purpose: 'Provide full occurrence context rows for one visible-definition selector map without promoting selector labels to display text.',
  boundary: {
    report_only: true,
    routing: false,
    implementation_allowed: false,
    display_flip: false,
    render_runtime_repo_control_source_mutation: false,
    source_license_legal_acceptance: false,
    definition_authority: false,
    product_answer_accepted_text_acceptance: false,
    publication_release: false,
    project_authored_definitions: false,
  },
  input_map: input,
  source_artifacts: {
    occurrence_path: occurrencePath,
    token_index_path: tokenIndexPath,
    source_path: sourcePath,
  },
  selector: {
    source_id: sourceId,
    selector_label: selectorLabel,
    work_id: workId,
    work_slug: workSlug,
  },
  counts: {
    target_token_rows: targetRows.length,
    exact_lookup_rows: exactRows,
    prefix_or_affix_lookup_rows: prefixRows,
    occurrence_rows: occurrenceRows.length,
    token_count_mismatch_rows: mismatchRows.length,
    single_occurrence_candidates: singleOccurrenceCandidates.length,
    rows_requiring_A3_structure_review: tokenSummaries.length - singleOccurrenceCandidates.length,
  },
  token_summaries: tokenSummaries,
  occurrence_rows: occurrenceRows,
  decision: {
    visible_slot_candidate_now: false,
    display_state: 'N/A',
    reason: singleOccurrenceCandidates.length
      ? 'Full occurrence map exists, but any promotion still requires A3/A12 context rule review and A13 approval.'
      : 'Every target token row has multiple occurrences or prefix/affix relation risk; selector label cannot be promoted directly.',
    next_owner_if_used: 'A3 context/structure review from this full occurrence map only',
  },
  stop_condition: 'Occurrence context map is complete when observed counts match token-index counts for every target token id and no visible display claim is made.',
};

writeText(outJson, `${JSON.stringify(result, null, 2)}\n`);

const mdLines = [
  `A13_VISIBLE_SELECTOR_OCCURRENCE_CONTEXT_MAP | source_id | ${sourceId} | status | ${result.status}`,
  '',
  `Input map: \`${input}\``,
  '',
  'Counts:',
  `- target token rows: \`${result.counts.target_token_rows}\``,
  `- occurrence rows: \`${result.counts.occurrence_rows}\``,
  `- exact lookup rows: \`${result.counts.exact_lookup_rows}\``,
  `- prefix/affix lookup rows: \`${result.counts.prefix_or_affix_lookup_rows}\``,
  `- token count mismatches: \`${result.counts.token_count_mismatch_rows}\``,
  `- single occurrence candidates: \`${result.counts.single_occurrence_candidates}\``,
  '',
  'Token summaries:',
  '',
  '| token_id | surface | lookup | observed | token-index | state |',
  '|---|---:|---:|---:|---:|---|',
  ...tokenSummaries.map((row) => `| \`${row.token_id}\` | ${row.surface_word} | ${row.lookup_relation} | ${row.occurrence_count_observed} | ${row.token_index_occurrence_count} | ${row.structure_review_state} |`),
  '',
  'Decision:',
  `- visible_slot_candidate_now: \`${result.decision.visible_slot_candidate_now}\``,
  `- display_state: \`${result.decision.display_state}\``,
  `- next_owner_if_used: \`${result.decision.next_owner_if_used}\``,
  '',
  'Boundary:',
  'Report only. No display flip, render/runtime mutation, A10/A11 route, source/license/legal/Definition/product/answer/accepted-text/publication/release acceptance, or project-authored definition.',
];
writeText(outMd, `${mdLines.join('\n')}\n`);

console.log(JSON.stringify({
  ok: true,
  out_json: outJson,
  out_md: outMd,
  counts: result.counts,
}, null, 2));

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
const requestedWorkId = String(args.get('work-id') ?? '').trim();
const topIndex = Number(args.get('top-index') ?? 0);

if (!input || !outJson || !outMd) {
  console.error('usage: node scripts/build_visible_selector_context_map_from_expansion.mjs --input=<a7-expansion.json> [--work-id=<work>] [--top-index=0] --out-json=<out.json> --out-md=<out.md>');
  process.exit(2);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function maybeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return readJson(filePath);
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function clean(value) {
  return String(value ?? '').trim();
}

function sourceIdFromExpansion(expansion) {
  const fromLogic = clean(expansion.selector?.logic).match(/\bH\d+\b/);
  if (fromLogic) return fromLogic[0];
  for (const row of expansion.top_counts ?? []) {
    const countKey = Object.keys(row).find((key) => /^h\d+_count$/i.test(key));
    if (countKey) return countKey.replace(/_count$/i, '').toUpperCase();
  }
  return '';
}

function slugFromPagePath(pagePath) {
  return clean(pagePath).replace(/\/index\.html$/, '').replace(/\\/g, '/');
}

const expansion = readJson(input);
const sourceId = sourceIdFromExpansion(expansion);
if (!sourceId) throw new Error('could not determine source id from expansion packet');

const topCounts = expansion.top_counts ?? [];
const selectedTop = requestedWorkId
  ? topCounts.find((row) => clean(row.work_id) === requestedWorkId)
  : topCounts[topIndex];
if (!selectedTop) throw new Error(`could not find selected top_counts row: ${requestedWorkId || topIndex}`);

const workId = clean(selectedTop.work_id);
const pagePath = clean(selectedTop.page_path);
const readerHintPath = clean(selectedTop.reader_hint_path);
const workSlug = slugFromPagePath(pagePath);
const tokenIndexPath = path.join('data', 'lexical', 'token-indexes', `${workSlug}.json`);
const visibleSlotsPath = path.join('data', 'public-hud', workId, 'visible-display-slots.json');

const readerHints = readJson(readerHintPath);
const tokenIndex = readJson(tokenIndexPath);
const visibleSlots = maybeReadJson(visibleSlotsPath);

const formsByTokenId = new Map((tokenIndex.forms ?? []).map((row) => [row.token_index_id, row]));
const visibleSlotByTokenId = new Map((visibleSlots?.slots ?? []).map((row) => [row.token_id, row]));

const hintRows = [];
for (const [tokenId, hintValue] of Object.entries(readerHints.hints ?? {})) {
  const rows = Array.isArray(hintValue) ? hintValue : [hintValue];
  for (const hint of rows) {
    if (clean(hint?.source_id) !== sourceId) continue;
    const tokenIndexRow = formsByTokenId.get(tokenId) ?? {};
    const visibleSlot = visibleSlotByTokenId.get(tokenId);
    const lookupRelation = clean(hint.lookup_relation);
    const relationBlockers = lookupRelation === 'exact' ? [] : ['non_exact_relation_requires_A3_review'];
    const occurrenceCount = Number(tokenIndexRow.occurrence_count ?? 0);
    hintRows.push({
      token_id: tokenId,
      surface: clean(tokenIndexRow.surface_word),
      normalized: clean(tokenIndexRow.normalized_word || hint.normalized),
      source_id: sourceId,
      selector_label: clean(expansion.selector?.display_label || expansion.selector?.name),
      target_work_id: workId,
      page_path: pagePath,
      occurrence_count: occurrenceCount,
      current_bookpage_visible_text: clean(visibleSlot?.visible_text || 'N/A'),
      current_bookpage_visible_source: visibleSlot ? 'visible_slot_manifest_row_present' : 'no_visible_slot_manifest_row_for_token',
      current_hud_route_id_if_any: clean(hint.route_card_id),
      lookup_relation: lookupRelation,
      match_percent: Number(hint.match_percent ?? 0),
      route_score_percent: Number(hint.route_score_percent ?? 0),
      word_break_status: occurrenceCount === 1
        ? 'single_token_index_surface_form_single_occurrence'
        : 'single_token_index_surface_form_multiple_occurrences',
      maqaf_status: clean(tokenIndexRow.surface_word).includes('\u05BE') ? 'maqaf_in_surface_form' : 'no_maqaf_in_surface_form',
      phrase_or_compound_status: 'unknown_across_all_occurrences_representative_sample_only',
      context_status: `${clean(expansion.selector?.display_label || sourceId).toLowerCase().replace(/[^a-z0-9]+/g, '_')}_context_not_resolved`,
      row_decision: 'row_incomplete_keep_bank',
      row_blocker: [
        `${clean(expansion.selector?.display_label || sourceId).toLowerCase().replace(/[^a-z0-9]+/g, '_')}_context_not_resolved`,
        'bank_hold_selector_not_A13_visible_ready',
        ...relationBlockers,
        ...(occurrenceCount === 1 ? [] : ['surface_form_has_multiple_occurrences_full_occurrence_context_map_missing']),
      ],
    });
  }
}

hintRows.sort((a, b) => a.token_id.localeCompare(b.token_id));

const selectorLabel = clean(expansion.selector?.display_label || expansion.selector?.name);
const exactRows = hintRows.filter((row) => row.lookup_relation === 'exact').length;
const nonExactRows = hintRows.length - exactRows;
const singleRows = hintRows.filter((row) => row.occurrence_count === 1).length;
const exactSingleRows = hintRows.filter((row) => row.occurrence_count === 1 && row.lookup_relation === 'exact').length;

const result = {
  schema: 'a13_visible_selector_context_map_from_expansion_v1',
  date: '2026-06-19',
  status: 'selector_context_map_built_keep_NA',
  purpose: 'Convert one exact A7 selector expansion packet into a bounded top-work selector map for full occurrence review.',
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
  input_expansion_packet: input,
  selection_rule: requestedWorkId ? `requested work_id ${requestedWorkId}` : `top_counts index ${topIndex}`,
  source_artifacts: {
    reader_hints: readerHintPath,
    token_index: tokenIndexPath,
    visible_slots: fs.existsSync(visibleSlotsPath) ? visibleSlotsPath : null,
  },
  source_id: sourceId,
  selector_label: selectorLabel,
  target_work_id: workId,
  page_path: pagePath,
  rows: hintRows,
  summary: {
    expected_token_rows: selectedTop[`${sourceId.toLowerCase()}_count`] ?? hintRows.length,
    rows_returned: hintRows.length,
    rows_with_surface: hintRows.filter((row) => row.surface).length,
    visible_text_rows: hintRows.filter((row) => row.current_bookpage_visible_text !== 'N/A').length,
    exact_lookup_rows: exactRows,
    non_exact_relation_rows: nonExactRows,
    single_occurrence_rows: singleRows,
    exact_single_occurrence_rows: exactSingleRows,
    output_decision: 'bank_incomplete_keep_NA',
  },
  stop_condition: 'Selector map is complete when it covers the selected expansion-packet work and makes no visible display claim.',
};

const md = [
  `# ${sourceId} ${selectorLabel} selector context map`,
  '',
  `- status: ${result.status}`,
  `- input: ${input}`,
  `- work: ${workId}`,
  `- rows: ${hintRows.length}`,
  `- exact rows: ${exactRows}`,
  `- non-exact rows: ${nonExactRows}`,
  `- single occurrence rows: ${singleRows}`,
  `- exact single occurrence rows: ${exactSingleRows}`,
  `- boundary: report only; no display flip; no accepted text; no source/license/legal/Definition/product/release acceptance.`,
  '',
].join('\n');

writeText(outJson, `${JSON.stringify(result, null, 2)}\n`);
writeText(outMd, md);
console.log(JSON.stringify({ ok: true, out_json: outJson, out_md: outMd, summary: result.summary }, null, 2));

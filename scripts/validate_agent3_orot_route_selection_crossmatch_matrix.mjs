#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-orot-route-selection-crossmatch-matrix-2026-06-05.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(artifact.artifact_type === 'agent3_orot_route_selection_crossmatch_matrix', 'artifact_type mismatch');
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');
expect(artifact.authority_boundary?.navigation_evidence_only === true, 'navigation boundary missing');
expect(artifact.authority_boundary?.route_id_pointer_only === true, 'route-id pointer boundary missing');
expect(artifact.authority_boundary?.selected_hint_display_text_copied === false, 'selected hint display text must not be copied');
expect(artifact.authority_boundary?.route_definition_payload_copied === false, 'route definition payload must not be copied');
expect(artifact.authority_boundary?.usage_as_definition_authority === false, 'usage-as-definition authority must be false');
expect(artifact.authority_boundary?.definition_authority === false, 'definition authority must be false');
expect(artifact.authority_boundary?.answer_selection === false, 'answer selection must be false');
expect(artifact.authority_boundary?.hud_write === false, 'HUD write must be false');
expect(artifact.authority_boundary?.public_runtime_mutation === false, 'public runtime mutation must be false');
expect(artifact.authority_boundary?.accepted_gloss_text === false, 'accepted gloss text must be false');

const rows = artifact.rows || [];
const counts = artifact.counts || {};
expect(Array.isArray(rows), 'rows must be an array');
expect(rows.length === counts.token_index_rows, 'rows length must match token_index_rows');
expect(rows.length === 5, 'expected five present exact target token rows');
expect(counts.target_forms_declared === 10, 'expected ten declared exact target forms');
expect(counts.target_forms_absent === 5, 'expected five absent exact target forms');
expect(counts.occurrence_count_mismatch_rows === 0, 'occurrence counts must match occurrence links');
expect(counts.occurrence_links === counts.token_index_occurrences, 'linked occurrences must match token-index occurrence total');
expect(counts.occurrence_links === 359, 'expected 359 occurrence links for current Orot target rows');
expect(counts.candidate_selection_mismatch_rows === 1, 'expected one candidate selection mismatch row');
expect(counts.candidate_token_index_linkage_gap_rows === 1, 'expected one token-index linkage gap row');
expect(counts.exact_blocker_rows === 3, 'expected three exact blocker rows');
expect(counts.reader_facing_rows === 0, 'reader-facing rows must be zero');
expect(counts.route_payload_field_hits === 0, 'route payload field hits must be zero');
expect(counts.forbidden_authority_field_hits === 0, 'forbidden authority field hits must be zero');
expect(counts.definition_payload_fields === 0, 'definition payload fields must be zero');
expect(counts.source_text_read === 0, 'source text read must be zero');
expect(counts.hud_files_written === 0, 'HUD files written must be zero');
expect(counts.route_files_written === 0, 'route files written must be zero');
expect(counts.public_runtime_mutations === 0, 'public runtime mutations must be zero');
expect(counts.answer_selection_claims === 0, 'answer selection claims must be zero');
expect(counts.acceptance_claims === 0, 'acceptance claims must be zero');

for (const row of rows) {
  expect(Boolean(row.row_id), 'row_id missing');
  expect(row.work_id === 'orot', `${row.row_id} work_id must be orot`);
  expect(Boolean(row.token_index_id), `${row.row_id} token_index_id missing`);
  expect(Boolean(row.token_surface), `${row.row_id} token_surface missing`);
  expect(Boolean(row.token_normalized), `${row.row_id} token_normalized missing`);
  expect(Array.isArray(row.occurrence_links), `${row.row_id} occurrence_links missing`);
  expect(row.occurrence_links.length === row.occurrence_count, `${row.row_id} occurrence_count mismatch`);
  expect(
    ['candidate_selection_mismatch', 'candidate_token_index_linkage_gap', 'exact_blocker_missing_prefixed_route_shard_and_reader_hint', 'observed_usage_only'].includes(row.status),
    `${row.row_id} has unexpected status ${row.status}`,
  );
  if (row.status === 'candidate_selection_mismatch') {
    expect(row.selected_hint !== null, `${row.row_id} selection mismatch needs selected_hint`);
    expect(row.better_matching_route_cards.length > 0, `${row.row_id} selection mismatch needs better matching route card pointers`);
    expect(row.route_shard.selected_card_matches_token_linkage === false, `${row.row_id} selected card should not match token linkage`);
  }
  if (row.status === 'candidate_token_index_linkage_gap') {
    expect(row.lexicon_entry_id === '', `${row.row_id} linkage gap row should have blank lexicon_entry_id`);
    expect(row.better_matching_route_cards.length > 0, `${row.row_id} linkage gap needs route-card pointers`);
  }
  if (row.status.startsWith('exact_blocker')) {
    expect(row.route_shard.exists === false, `${row.row_id} blocker row should have missing exact shard`);
    expect(row.selected_hint === null, `${row.row_id} blocker row should have no selected hint`);
    expect(row.related_base_route_cards.length > 0, `${row.row_id} blocker row needs related base route pointers`);
  }
  for (const occurrence of row.occurrence_links) {
    expect(Boolean(occurrence.occurrence_id), `${row.row_id} occurrence_id missing`);
    expect(Boolean(occurrence.source_ref), `${row.row_id} source_ref missing`);
    expect(/^orot\/index\.html#/.test(occurrence.work_page_anchor || ''), `${row.row_id} work_page_anchor missing`);
    expect((occurrence.context_snippet_hebrew || '').includes(`[${row.token_surface}]`), `${row.row_id} focus marker missing`);
    expect(
      (occurrence.context_tokens || []).filter((token) => token.role === 'focus-token').length === 1,
      `${row.row_id} occurrence must have exactly one focus token`,
    );
  }
}

const forbiddenKeys = [];
walk(artifact, (key) => {
  if (['definition', 'display', 'plain_note', 'source_definition_surface', 'source_definition_normalized'].includes(key)) {
    forbiddenKeys.push(key);
  }
});
expect(forbiddenKeys.length === 0, `forbidden copied payload keys present: ${forbiddenKeys.join(', ')}`);

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}

console.log(
  `Agent 3 Orot route-selection crossmatch matrix passed: rows=${rows.length} occurrences=${counts.occurrence_links} mismatch=${counts.candidate_selection_mismatch_rows} linkage_gap=${counts.candidate_token_index_linkage_gap_rows} blockers=${counts.exact_blocker_rows}`,
);

function walk(value, callback) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, callback);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    callback(key, child);
    walk(child, callback);
  }
}

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, filePath), 'utf8'));
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (!key.startsWith('--') || value === undefined) continue;
    if (key === '--input') parsed.input = cleanRelativePath(value);
  }
  return parsed;
}

function cleanRelativePath(value) {
  return value.replace(/^["']|["']$/g, '').replaceAll('\\', '/');
}

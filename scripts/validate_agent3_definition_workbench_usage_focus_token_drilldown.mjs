import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ARTIFACT = 'data/definitions/agent3-definition-workbench-usage-focus-token-drilldown-reshit.json';
const REPORT = 'reports/agent3-definition-workbench-usage-focus-token-drilldown-reshit.md';

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function check(name, passed, detail, severity = 'required') {
  return { name, passed, detail, severity };
}

const packet = readJson(ARTIFACT);
const source = readJson(packet.source_artifacts?.concordance_navigation_packet || '');
const matrix = readJson(packet.source_artifacts?.concordance_token_matrix || '');
const counts = packet.counts || {};
const rows = Array.isArray(packet.occurrence_rows) ? packet.occurrence_rows : [];
const contextRows = Array.isArray(packet.context_token_rows) ? packet.context_token_rows : [];
const boundaries = packet.authority_boundary || {};
const focus = packet.focus_token_normalized;
const matrixRow = (matrix.token_rows || []).find((row) => row.token_normalized === focus);
const expectedRows = (source.navigation_rows || []).filter((row) => row.focus_normalized === focus || row.token_normalized === focus);
const checks = [];
const errors = [];

checks.push(check('report_exists', fs.existsSync(path.join(ROOT, REPORT)), REPORT));
checks.push(check('artifact_type', packet.artifact_type === 'agent3_definition_workbench_usage_focus_token_drilldown', packet.artifact_type));
checks.push(check('status_boundary', ['evidence-ready', 'awaiting-Agent-6'].includes(packet.status), packet.status));
checks.push(check('source_artifacts_exist', fs.existsSync(path.join(ROOT, packet.source_artifacts?.concordance_navigation_packet || '')) && fs.existsSync(path.join(ROOT, packet.source_artifacts?.concordance_token_matrix || '')), `${packet.source_artifacts?.concordance_navigation_packet}; ${packet.source_artifacts?.concordance_token_matrix}`));
checks.push(check('source_types', source.artifact_type === 'definition_workbench_usage_concordance_navigation_packet' && matrix.artifact_type === 'agent3_definition_workbench_usage_concordance_token_matrix', `${source.artifact_type}; ${matrix.artifact_type}`));
checks.push(check('focus_token_present', focus === 'ראשית' && Boolean(matrixRow), `${focus}; matrix row ${matrixRow ? 1 : 0}`));
checks.push(check('focus_rows_match_source', counts.focus_token_rows === rows.length && rows.length === expectedRows.length, `packet/source ${counts.focus_token_rows}/${rows.length}/${expectedRows.length}`));
checks.push(check('token_matrix_alignment', counts.token_matrix_occurrence_rows === matrixRow?.occurrence_row_count && counts.token_matrix_total_appearances === matrixRow?.total_appearances, `counts/matrix rows ${counts.token_matrix_occurrence_rows}/${matrixRow?.occurrence_row_count}; appearances ${counts.token_matrix_total_appearances}/${matrixRow?.total_appearances}`));
checks.push(check('metadata_complete', counts.rows_with_complete_metadata === rows.length && counts.rows_with_route_ids === rows.length, `metadata/routes ${counts.rows_with_complete_metadata}/${counts.rows_with_route_ids}/${rows.length}`));
checks.push(check('usage_only_no_authority_hits', counts.observed_usage_only_rows === rows.length && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0, `observed/reader/payload/forbidden ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`));
checks.push(check('diversity_counts_present', counts.source_refs > 0 && counts.works > 0 && counts.categories > 0 && counts.licenses > 0 && counts.context_token_rows > 0, `refs/works/categories/licenses/context ${counts.source_refs}/${counts.works}/${counts.categories}/${counts.licenses}/${counts.context_token_rows}`));
checks.push(check('route_concentration_preserved', counts.route_ids === 1, `route IDs ${counts.route_ids}`, 'warning'));
checks.push(check('no_broad_or_queue_side_effects', counts.source_text_read === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0, `sourceText/broad/queue/submitted ${counts.source_text_read}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`));

for (const key of ['observed_usage_only', 'focus_token_navigation_only', 'route_ids_only']) {
  checks.push(check(`boundary_true_${key}`, boundaries[key] === true, String(boundaries[key])));
}
for (const key of [
  'source_text_read',
  'broad_target_expansion',
  'reader_facing',
  'lexical_authority',
  'semantic_arbitration',
  'route_ranking',
  'visible_answer_selection',
  'copied_agent2_payloads',
  'publication_claim',
  'source_provenance_custody_claim',
  'accepted_text_claim',
  'agent6_acceptance_claim',
]) {
  checks.push(check(`boundary_false_${key}`, boundaries[key] === false, String(boundaries[key])));
}

let phraseAppearanceTotal = 0;
let focusAppearanceTotal = 0;
for (const [index, row] of rows.entries()) {
  const label = row.occurrence_id || `occurrence_rows[${index}]`;
  if (!row.navigation_row_id || !row.occurrence_id) errors.push(`${label}: missing IDs`);
  if (row.focus_normalized !== focus || row.token_normalized !== focus || row.token_key !== `he:${focus}`) errors.push(`${label}: focus token mismatch`);
  if (!row.source_ref || !/^https:\/\//.test(row.source_url || '') || !row.local_work_anchor) errors.push(`${label}: source links incomplete`);
  if (!row.license || !row.license_url || !row.version_title || !row.version_source) errors.push(`${label}: provenance incomplete`);
  if (!Array.isArray(row.related_agent2_route_ids) || row.related_agent2_route_ids.length !== 1) errors.push(`${label}: route IDs must preserve single route pointer`);
  if (row.row_label !== 'observed usage only') errors.push(`${label}: row_label invalid`);
  const boundary = row.usage_boundary || {};
  if (boundary.observed_usage_only !== true || boundary.reader_facing !== false || boundary.route_ids_only !== true || boundary.not_definition_authority !== true) {
    errors.push(`${label}: usage boundary invalid`);
  }
  const phraseTokens = Array.isArray(row.phrase_tokens) ? row.phrase_tokens : [];
  if (!phraseTokens.length) errors.push(`${label}: phrase_tokens missing`);
  const focusTokens = phraseTokens.filter((token) => token.focus_marked === true || token.role === 'focus');
  if (focusTokens.length !== 1 || focusTokens[0]?.normalized !== focus) errors.push(`${label}: must have exactly one marked focus token`);
  phraseAppearanceTotal += phraseTokens.length;
  focusAppearanceTotal += focusTokens.length;
}
checks.push(check('phrase_appearance_total_matches', phraseAppearanceTotal === counts.phrase_token_appearances && focusAppearanceTotal === counts.focus_appearances, `phrase/focus ${phraseAppearanceTotal}/${counts.phrase_token_appearances}; ${focusAppearanceTotal}/${counts.focus_appearances}`));

for (const [index, row] of contextRows.entries()) {
  const label = row.token_normalized || `context_token_rows[${index}]`;
  if (!row.token_normalized || row.token_normalized === focus) errors.push(`${label}: context token invalid`);
  if (!Number.isInteger(row.appearances) || row.appearances <= 0) errors.push(`${label}: appearances invalid`);
  if (!Array.isArray(row.top_frames) || !row.top_frames.length) errors.push(`${label}: top_frames missing`);
  if (row.row_label !== 'observed usage only' || row.reader_facing !== false || row.not_definition_authority !== true) errors.push(`${label}: usage boundary flags invalid`);
}

for (const packetCheck of packet.checks || []) {
  if (packetCheck.status === 'failed') errors.push(`packet check failed: ${packetCheck.id} ${packetCheck.detail || ''}`.trim());
}

for (const row of checks) {
  const prefix = row.passed ? 'PASS' : row.severity === 'warning' ? 'WARN' : 'FAIL';
  console.log(`${prefix} ${row.name}: ${row.detail}`);
  if (!row.passed && row.severity !== 'warning') errors.push(`${row.name}: ${row.detail}`);
}

if (errors.length) {
  console.error(`Validation failed (${errors.length})`);
  for (const error of errors.slice(0, 120)) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validation passed: focus ${focus}; rows ${counts.focus_token_rows}; context tokens ${counts.context_token_rows}`);

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ARTIFACT = 'data/definitions/agent3-definition-workbench-usage-concordance-token-matrix.json';
const REPORT = 'reports/agent3-definition-workbench-usage-concordance-token-matrix.md';

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function check(name, passed, detail, severity = 'required') {
  return { name, passed, detail, severity };
}

const packet = readJson(ARTIFACT);
const source = readJson(packet.source_artifacts?.concordance_navigation_packet || '');
const counts = packet.counts || {};
const boundaries = packet.authority_boundary || {};
const tokenRows = Array.isArray(packet.token_rows) ? packet.token_rows : [];
const checks = [];
const errors = [];

checks.push(check('report_exists', fs.existsSync(path.join(ROOT, REPORT)), REPORT));
checks.push(check('artifact_type', packet.artifact_type === 'agent3_definition_workbench_usage_concordance_token_matrix', packet.artifact_type));
checks.push(check('status_boundary', ['evidence-ready', 'awaiting-Agent-6'].includes(packet.status), packet.status));
checks.push(check('source_artifact_exists', fs.existsSync(path.join(ROOT, packet.source_artifacts?.concordance_navigation_packet || '')), packet.source_artifacts?.concordance_navigation_packet));
checks.push(check('source_row_count_matches', counts.source_navigation_rows === (source.navigation_rows || []).length && counts.source_navigation_rows === Number(source.counts?.navigation_rows || 0), `matrix/source/count ${counts.source_navigation_rows}/${(source.navigation_rows || []).length}/${source.counts?.navigation_rows}`));
checks.push(check('token_rows_match', counts.token_rows === tokenRows.length && counts.token_rows > 0 && counts.token_appearances > counts.source_navigation_rows, `token rows/len/appearances ${counts.token_rows}/${tokenRows.length}/${counts.token_appearances}`));
checks.push(check('phrase_token_coverage_complete', counts.rows_with_phrase_tokens === counts.source_navigation_rows && counts.rows_with_focus_token === counts.source_navigation_rows && counts.rows_with_context_token === counts.source_navigation_rows, `phrase/focus/context ${counts.rows_with_phrase_tokens}/${counts.rows_with_focus_token}/${counts.rows_with_context_token}`));
checks.push(check('cross_navigation_visible', counts.repeated_across_work_token_rows > 0 && counts.cross_category_token_rows > 0, `repeated-work/cross-category ${counts.repeated_across_work_token_rows}/${counts.cross_category_token_rows}`));
checks.push(check('metadata_complete', counts.rows_with_license_metadata === counts.source_navigation_rows && counts.rows_with_version_metadata === counts.source_navigation_rows && counts.rows_with_route_ids === counts.source_navigation_rows, `license/version/route ${counts.rows_with_license_metadata}/${counts.rows_with_version_metadata}/${counts.rows_with_route_ids}`));
checks.push(check('usage_only_no_authority_hits', counts.observed_usage_only_rows === counts.source_navigation_rows && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0, `observed/reader/payload/forbidden ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`));
checks.push(check('route_concentration_visible', counts.route_ids === 1, `route IDs ${counts.route_ids}`, 'warning'));
checks.push(check('no_broad_or_queue_side_effects', counts.source_text_read === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0, `sourceText/broad/queue/submitted ${counts.source_text_read}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`));

for (const key of ['observed_usage_only', 'concordance_token_navigation_only', 'route_ids_only']) {
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

let appearanceTotal = 0;
let focusTokenRows = 0;
for (const [index, row] of tokenRows.entries()) {
  const label = row.token_key || `token_rows[${index}]`;
  if (!row.token_key || !row.token_key.startsWith('he:')) errors.push(`${label}: token_key must start he:`);
  if (!row.token_normalized) errors.push(`${label}: token_normalized missing`);
  if (!Array.isArray(row.surface_samples) || row.surface_samples.length === 0) errors.push(`${label}: surface_samples missing`);
  for (const key of ['total_appearances', 'focus_appearances', 'context_appearances', 'repeated_focus_context_appearances', 'occurrence_row_count', 'source_ref_count', 'work_count', 'version_source_count']) {
    if (!Number.isInteger(row[key]) || row[key] < 0) errors.push(`${label}: ${key} must be non-negative integer`);
  }
  if (row.total_appearances <= 0) errors.push(`${label}: total_appearances must be positive`);
  if (row.focus_appearances + row.context_appearances + row.repeated_focus_context_appearances !== row.total_appearances) {
    errors.push(`${label}: role appearances must sum to total`);
  }
  if (!Array.isArray(row.categories) || !row.categories.length) errors.push(`${label}: categories missing`);
  if (!row.status_counts || typeof row.status_counts !== 'object') errors.push(`${label}: status_counts missing`);
  if (!Array.isArray(row.licenses) || !row.licenses.length) errors.push(`${label}: licenses missing`);
  if (!Array.isArray(row.route_ids) || row.route_ids.length !== 1) errors.push(`${label}: route_ids must contain the single current route ID`);
  if (!Array.isArray(row.sample_occurrences) || !row.sample_occurrences.length) errors.push(`${label}: sample_occurrences missing`);
  if (row.row_label !== 'observed usage only' || row.reader_facing !== false || row.not_definition_authority !== true) {
    errors.push(`${label}: usage-only boundary flags invalid`);
  }
  for (const sample of row.sample_occurrences || []) {
    if (!sample.occurrence_id || !sample.source_ref || !/^https:\/\//.test(sample.source_url || '')) errors.push(`${label}: sample source metadata incomplete`);
    if (!sample.local_work_anchor || !sample.license || !sample.license_url || !sample.version_title || !sample.version_source) errors.push(`${label}: sample provenance metadata incomplete`);
    if (sample.row_label !== 'observed usage only') errors.push(`${label}: sample row label invalid`);
  }
  appearanceTotal += row.total_appearances;
  if (row.focus_appearances > 0) focusTokenRows += 1;
}
checks.push(check('appearance_total_matches', appearanceTotal === counts.token_appearances, `token rows sum/count ${appearanceTotal}/${counts.token_appearances}`));
checks.push(check('focus_token_rows_match', focusTokenRows === counts.focus_token_rows, `focus token rows ${focusTokenRows}/${counts.focus_token_rows}`));

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
  for (const error of errors.slice(0, 100)) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validation passed: token rows ${counts.token_rows}; appearances ${counts.token_appearances}; source rows ${counts.source_navigation_rows}`);

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ARTIFACT = 'data/definitions/agent3-definition-workbench-usage-token-bridge-index.json';
const REPORT = 'reports/agent3-definition-workbench-usage-token-bridge-index.md';

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function check(name, passed, detail, severity = 'required') {
  return { name, passed, detail, severity };
}

const packet = readJson(ARTIFACT);
const source = readJson(packet.source_artifacts?.concordance_token_matrix || '');
const counts = packet.counts || {};
const boundaries = packet.authority_boundary || {};
const rows = Array.isArray(packet.bridge_rows) ? packet.bridge_rows : [];
const checks = [];
const errors = [];

checks.push(check('report_exists', fs.existsSync(path.join(ROOT, REPORT)), REPORT));
checks.push(check('artifact_type', packet.artifact_type === 'agent3_definition_workbench_usage_token_bridge_index', packet.artifact_type));
checks.push(check('status_boundary', ['evidence-ready', 'awaiting-Agent-6'].includes(packet.status), packet.status));
checks.push(check('source_artifact_exists', fs.existsSync(path.join(ROOT, packet.source_artifacts?.concordance_token_matrix || '')), packet.source_artifacts?.concordance_token_matrix));
checks.push(check('source_token_count_matches', counts.source_token_rows === (source.token_rows || []).length && counts.source_token_rows === Number(source.counts?.token_rows || 0), `bridge/source/count ${counts.source_token_rows}/${(source.token_rows || []).length}/${source.counts?.token_rows}`));
checks.push(check('bridge_rows_present', counts.bridge_rows === rows.length && counts.bridge_rows > 0 && counts.bridge_rows <= counts.source_token_rows, `bridge/source ${counts.bridge_rows}/${rows.length}/${counts.source_token_rows}`));
checks.push(check('bridge_kinds_visible', counts.cross_work_bridge_rows > 0 && counts.cross_category_bridge_rows > 0 && counts.cross_license_bridge_rows > 0 && counts.cross_cluster_bridge_rows > 0 && counts.high_recurrence_bridge_rows > 0, `work/category/license/cluster/high ${counts.cross_work_bridge_rows}/${counts.cross_category_bridge_rows}/${counts.cross_license_bridge_rows}/${counts.cross_cluster_bridge_rows}/${counts.high_recurrence_bridge_rows}`));
checks.push(check('sample_metadata_complete', counts.bridge_rows_with_samples === counts.bridge_rows && counts.bridge_rows_with_license_metadata === counts.bridge_rows && counts.bridge_rows_with_version_metadata === counts.bridge_rows && counts.bridge_rows_with_route_ids === counts.bridge_rows, `samples/license/version/routes ${counts.bridge_rows_with_samples}/${counts.bridge_rows_with_license_metadata}/${counts.bridge_rows_with_version_metadata}/${counts.bridge_rows_with_route_ids}`));
checks.push(check('usage_only_no_authority_hits', counts.observed_usage_only_rows === counts.bridge_rows && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0, `observed/reader/payload/forbidden ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`));
checks.push(check('route_concentration_preserved', Object.keys(source.route_counts || {}).length === 1, `route IDs ${Object.keys(source.route_counts || {}).length}`, 'warning'));
checks.push(check('no_broad_or_queue_side_effects', counts.source_text_read === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0, `sourceText/broad/queue/submitted ${counts.source_text_read}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`));

for (const key of ['observed_usage_only', 'token_bridge_navigation_only', 'route_ids_only']) {
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

const seen = new Set();
let appearanceTotal = 0;
for (const [index, row] of rows.entries()) {
  const label = row.token_key || `bridge_rows[${index}]`;
  if (seen.has(row.token_key)) errors.push(`${label}: duplicate token bridge`);
  seen.add(row.token_key);
  if (!row.bridge_id || !row.token_key || !row.token_key.startsWith('he:')) errors.push(`${label}: missing bridge/token key`);
  if (!Array.isArray(row.bridge_kinds) || row.bridge_kinds.length === 0) errors.push(`${label}: bridge_kinds missing`);
  if (!Number.isInteger(row.bridge_score) || row.bridge_score <= 0) errors.push(`${label}: bridge_score invalid`);
  for (const numericKey of ['total_appearances', 'occurrence_row_count', 'focus_appearances', 'context_appearances', 'repeated_focus_context_appearances', 'work_count', 'source_ref_count', 'version_source_count']) {
    if (!Number.isInteger(row[numericKey]) || row[numericKey] < 0) errors.push(`${label}: ${numericKey} must be non-negative integer`);
  }
  if (!Array.isArray(row.categories) || !row.categories.length) errors.push(`${label}: categories missing`);
  if (!row.status_counts || typeof row.status_counts !== 'object') errors.push(`${label}: status_counts missing`);
  if (!Array.isArray(row.licenses) || !row.licenses.length) errors.push(`${label}: licenses missing`);
  if (!Array.isArray(row.route_ids) || row.route_ids.length !== 1) errors.push(`${label}: route_ids must preserve single Agent 2 route ID`);
  if (!Array.isArray(row.sample_occurrences) || !row.sample_occurrences.length) errors.push(`${label}: sample_occurrences missing`);
  if (row.row_label !== 'observed usage only' || row.reader_facing !== false || row.not_definition_authority !== true) errors.push(`${label}: usage boundary flags invalid`);
  for (const sample of row.sample_occurrences || []) {
    if (!sample.occurrence_id || !sample.source_ref || !/^https:\/\//.test(sample.source_url || '')) errors.push(`${label}: sample source metadata incomplete`);
    if (!sample.local_work_anchor || !sample.license || !sample.license_url || !sample.version_title || !sample.version_source) errors.push(`${label}: sample provenance metadata incomplete`);
    if (!Array.isArray(sample.related_agent2_route_ids) || !sample.related_agent2_route_ids.length) errors.push(`${label}: sample route IDs missing`);
    if (sample.row_label !== 'observed usage only') errors.push(`${label}: sample row label invalid`);
  }
  appearanceTotal += row.total_appearances;
}

checks.push(check('bridge_appearance_total_matches', appearanceTotal === counts.bridge_appearances, `sum/count ${appearanceTotal}/${counts.bridge_appearances}`));

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

console.log(`Validation passed: bridge rows ${counts.bridge_rows}; source token rows ${counts.source_token_rows}`);

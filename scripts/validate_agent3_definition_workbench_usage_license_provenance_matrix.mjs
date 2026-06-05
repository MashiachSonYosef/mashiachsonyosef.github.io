import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ARTIFACT = 'data/definitions/agent3-definition-workbench-usage-license-provenance-matrix.json';
const REPORT = 'reports/agent3-definition-workbench-usage-license-provenance-matrix.md';
const ALLOWED_LICENSES = new Set(['Public Domain', 'CC0', 'CC-BY', 'CC-BY-SA']);

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
const checks = [];
const errors = [];

checks.push(check('report_exists', fs.existsSync(path.join(ROOT, REPORT)), REPORT));
checks.push(check('artifact_type', packet.artifact_type === 'agent3_definition_workbench_usage_license_provenance_matrix', packet.artifact_type));
checks.push(check('status_boundary', ['evidence-ready', 'awaiting-Agent-6'].includes(packet.status), packet.status));
checks.push(check('source_artifacts_exist', Object.values(packet.source_artifacts || {}).every((relPath) => fs.existsSync(path.join(ROOT, relPath))), JSON.stringify(packet.source_artifacts || {})));
checks.push(check('row_count_matches_source', counts.navigation_rows === (source.navigation_rows || []).length && counts.navigation_rows === Number(source.counts?.navigation_rows || 0), `matrix/source/count ${counts.navigation_rows}/${(source.navigation_rows || []).length}/${source.counts?.navigation_rows}`));
checks.push(check('license_metadata_complete', counts.metadata_complete_rows === counts.navigation_rows && counts.allowed_license_rows === counts.navigation_rows && counts.disallowed_license_rows === 0, `metadata/allowed/disallowed ${counts.metadata_complete_rows}/${counts.allowed_license_rows}/${counts.disallowed_license_rows}`));
checks.push(check('license_spread_visible', counts.license_count === Object.keys(packet.license_counts || {}).length && counts.license_count >= 4 && counts.license_url_count >= 4 && counts.version_source_count > 100, `licenses/license URLs/version sources ${counts.license_count}/${counts.license_url_count}/${counts.version_source_count}`));
checks.push(check('category_status_spread_visible', counts.category_count === Object.keys(packet.category_counts || {}).length && counts.category_count >= 10 && counts.status_count === 3, `categories/statuses ${counts.category_count}/${counts.status_count}`));
checks.push(check('matrix_rows_present', counts.license_version_rows === (packet.license_version_rows || []).length && counts.license_category_rows === (packet.license_category_rows || []).length && counts.license_status_category_rows === (packet.license_status_category_rows || []).length && counts.license_route_rows === (packet.license_route_rows || []).length, `version/category/status/route ${counts.license_version_rows}/${counts.license_category_rows}/${counts.license_status_category_rows}/${counts.license_route_rows}`));
checks.push(check('route_id_only_boundary', counts.route_ids === 1 && counts.route_pointer_rows === 1 && counts.route_pointer_payload_hits === 0 && counts.route_pointer_metadata_hits === 0, `routes/pointers/payload/metadata ${counts.route_ids}/${counts.route_pointer_rows}/${counts.route_pointer_payload_hits}/${counts.route_pointer_metadata_hits}`, 'warning'));
checks.push(check('usage_only_no_authority_hits', counts.observed_usage_only_rows === counts.navigation_rows && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0, `observed/reader/payload/forbidden ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`));
checks.push(check('no_broad_or_queue_side_effects', counts.source_text_read === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0, `sourceText/broad/queue/submitted ${counts.source_text_read}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`));

for (const key of ['observed_usage_only', 'license_provenance_navigation_only', 'route_ids_only']) {
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

for (const row of packet.license_summary_rows || []) {
  if (!ALLOWED_LICENSES.has(row.license)) errors.push(`unexpected license in summary: ${row.license}`);
  if (row.allowed_for_usage_navigation !== true) errors.push(`license not marked allowed: ${row.license}`);
  if (!Array.isArray(row.license_urls) || row.license_urls.length === 0) errors.push(`license summary missing URLs: ${row.license}`);
  if (!Array.isArray(row.categories) || row.categories.length === 0) errors.push(`license summary missing categories: ${row.license}`);
}

for (const row of packet.license_version_rows || []) {
  if (!ALLOWED_LICENSES.has(row.license)) errors.push(`unexpected license in version row: ${row.license}`);
  if (!/^https?:\/\//.test(row.license_url || '')) errors.push(`license_version row missing license URL: ${row.license}`);
  if (!row.version_title || !/^https?:\/\//.test(row.version_source || '')) errors.push(`license_version row missing version metadata: ${row.version_title}`);
  if (!Number.isInteger(row.row_count) || row.row_count <= 0) errors.push(`license_version row_count invalid: ${row.version_title}`);
}

for (const row of packet.license_status_category_rows || []) {
  if (!ALLOWED_LICENSES.has(row.license)) errors.push(`unexpected license in status-category row: ${row.license}`);
  if (!['supported', 'candidate', 'weak'].includes(row.status)) errors.push(`unexpected status in status-category row: ${row.status}`);
  if (!row.category) errors.push('status-category row missing category');
  if (!Number.isInteger(row.row_count) || row.row_count <= 0) errors.push(`status-category row_count invalid: ${row.license}/${row.category}/${row.status}`);
}

for (const row of packet.checks || []) {
  if (row.status === 'failed') errors.push(`packet check failed: ${row.id} ${row.detail || ''}`.trim());
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

console.log(`Validation passed: rows ${counts.navigation_rows}; licenses ${counts.license_count}; version sources ${counts.version_source_count}`);

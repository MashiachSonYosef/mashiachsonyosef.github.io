import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ARTIFACT = 'data/definitions/agent3-definition-workbench-usage-token-bridge-consumer-addendum.json';
const REPORT = 'reports/agent3-definition-workbench-usage-token-bridge-consumer-addendum.md';

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function check(name, passed, detail, severity = 'required') {
  return { name, passed, detail, severity };
}

const packet = readJson(ARTIFACT);
const sourceBridge = readJson(packet.source_artifacts?.token_bridge_index || '');
const counts = packet.counts || {};
const boundaries = packet.authority_boundary || {};
const rows = Array.isArray(packet.selected_rows) ? packet.selected_rows : [];
const checks = [];
const errors = [];

checks.push(check('report_exists', fs.existsSync(path.join(ROOT, REPORT)), REPORT));
checks.push(check('artifact_type', packet.artifact_type === 'agent3_definition_workbench_usage_token_bridge_consumer_addendum', packet.artifact_type));
checks.push(check('status_boundary', ['evidence-ready', 'awaiting-Agent-6'].includes(packet.status), packet.status));
checks.push(check('source_bridge_type', sourceBridge.artifact_type === 'agent3_definition_workbench_usage_token_bridge_index', sourceBridge.artifact_type));
checks.push(check('source_bridge_count_matches', counts.source_bridge_rows === sourceBridge.counts?.bridge_rows && counts.bridge_rows_present === (sourceBridge.bridge_rows || []).length, `packet/source ${counts.source_bridge_rows}/${sourceBridge.counts?.bridge_rows}; actual ${counts.bridge_rows_present}/${(sourceBridge.bridge_rows || []).length}`));
checks.push(check('selected_rows_present', counts.selected_consumer_rows === rows.length && rows.length > 0 && rows.length <= counts.source_bridge_rows, `selected/source ${counts.selected_consumer_rows}/${rows.length}/${counts.source_bridge_rows}`));
checks.push(check('selected_link_metadata_complete', counts.selected_rows_with_sample_links === rows.length && counts.selected_rows_with_source_links === rows.length && counts.selected_rows_with_license_metadata === rows.length && counts.selected_rows_with_version_metadata === rows.length && counts.selected_rows_with_route_ids === rows.length, `sample/source/license/version/routes ${counts.selected_rows_with_sample_links}/${counts.selected_rows_with_source_links}/${counts.selected_rows_with_license_metadata}/${counts.selected_rows_with_version_metadata}/${counts.selected_rows_with_route_ids}`));
checks.push(check('usage_only_no_authority_hits', counts.observed_usage_only_rows === rows.length && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0, `observed/reader/payload/forbidden ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`));
checks.push(check('route_concentration_preserved', counts.all_route_ids === 1 && counts.selected_route_ids === 1, `all/selected route IDs ${counts.all_route_ids}/${counts.selected_route_ids}`, 'warning'));
checks.push(check('no_mutation_or_expansion', counts.source_text_read === 0 && counts.broad_target_expansion === 0 && counts.consumer_manifest_mutated === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0, `sourceText/broad/manifest/queue/submitted ${counts.source_text_read}/${counts.broad_target_expansion}/${counts.consumer_manifest_mutated}/${counts.queue_mutations}/${counts.submitted_to_agent6}`));

for (const [key, relPath] of Object.entries(packet.source_artifacts || {})) {
  checks.push(check(`source_artifact_exists_${key}`, fs.existsSync(path.join(ROOT, relPath)), relPath));
}

for (const key of ['observed_usage_only', 'token_bridge_navigation_only', 'route_ids_only']) {
  checks.push(check(`boundary_true_${key}`, boundaries[key] === true, String(boundaries[key])));
}
for (const key of [
  'source_text_read',
  'broad_target_expansion',
  'consumer_manifest_mutated',
  'queue_mutated',
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
let sampleCount = 0;
for (const [index, row] of rows.entries()) {
  const label = row.token_key || `selected_rows[${index}]`;
  if (seen.has(row.token_key)) errors.push(`${label}: duplicate selected token`);
  seen.add(row.token_key);
  if (!row.bridge_id || !row.token_key || !row.token_key.startsWith('he:')) errors.push(`${label}: missing bridge/token key`);
  if (!Array.isArray(row.bridge_kinds) || !row.bridge_kinds.length) errors.push(`${label}: bridge_kinds missing`);
  if (!Number.isInteger(row.bridge_score) || row.bridge_score <= 0) errors.push(`${label}: bridge_score invalid`);
  if (!Array.isArray(row.route_ids) || row.route_ids.length !== 1) errors.push(`${label}: route_ids must preserve single Agent 2 route ID`);
  if (row.row_label !== 'observed usage only' || row.reader_facing !== false || row.not_definition_authority !== true) errors.push(`${label}: usage boundary flags invalid`);
  if (row.consumer_action !== 'link_to_usage_navigation_only_resolve_agent2_payloads_elsewhere') errors.push(`${label}: consumer_action invalid`);
  if (!Array.isArray(row.sample_occurrence_links) || !row.sample_occurrence_links.length) errors.push(`${label}: sample_occurrence_links missing`);
  for (const sample of row.sample_occurrence_links || []) {
    if (!sample.occurrence_id || !sample.source_ref || !/^https:\/\//.test(sample.source_url || '') || !sample.local_work_anchor) errors.push(`${label}: sample source link metadata incomplete`);
    if (!sample.license || !sample.license_url || !sample.version_title || !sample.version_source) errors.push(`${label}: sample provenance metadata incomplete`);
    if (!Array.isArray(sample.related_agent2_route_ids) || sample.related_agent2_route_ids.length !== 1) errors.push(`${label}: sample route IDs invalid`);
    if (sample.row_label !== 'observed usage only') errors.push(`${label}: sample row label invalid`);
    sampleCount += 1;
  }
}
checks.push(check('selected_sample_count_matches', sampleCount === counts.selected_sample_links, `sum/count ${sampleCount}/${counts.selected_sample_links}`));

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

console.log(`Validation passed: selected rows ${counts.selected_consumer_rows}; source bridge rows ${counts.source_bridge_rows}`);

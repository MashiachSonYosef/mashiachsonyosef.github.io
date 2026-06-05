import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ARTIFACT = 'data/definitions/agent3-definition-workbench-usage-focus-frame-summary-reshit.json';
const REPORT = 'reports/agent3-definition-workbench-usage-focus-frame-summary-reshit.md';

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function check(name, passed, detail, severity = 'required') {
  return { name, passed, detail, severity };
}

const packet = readJson(ARTIFACT);
const source = readJson(packet.source_artifacts?.focus_token_drilldown || '');
const counts = packet.counts || {};
const boundaries = packet.authority_boundary || {};
const frameRows = Array.isArray(packet.frame_rows) ? packet.frame_rows : [];
const sourceRows = Array.isArray(source.occurrence_rows) ? source.occurrence_rows : [];
const checks = [];
const errors = [];

checks.push(check('report_exists', fs.existsSync(path.join(ROOT, REPORT)), REPORT));
checks.push(check('artifact_type', packet.artifact_type === 'agent3_definition_workbench_usage_focus_frame_summary', packet.artifact_type));
checks.push(check('status_boundary', ['evidence-ready', 'awaiting-Agent-6'].includes(packet.status), packet.status));
checks.push(check('source_artifact_exists', fs.existsSync(path.join(ROOT, packet.source_artifacts?.focus_token_drilldown || '')), packet.source_artifacts?.focus_token_drilldown));
checks.push(check('source_type', source.artifact_type === 'agent3_definition_workbench_usage_focus_token_drilldown', source.artifact_type));
checks.push(check('focus_token_present', packet.focus_token_normalized === source.focus_token_normalized && packet.focus_token_normalized === 'ראשית', `${packet.focus_token_normalized}/${source.focus_token_normalized}`));
checks.push(check('source_row_count_matches', counts.source_drilldown_rows === source.counts?.focus_token_rows && counts.summarized_rows === sourceRows.length, `summary/source ${counts.source_drilldown_rows}/${source.counts?.focus_token_rows}; rows ${counts.summarized_rows}/${sourceRows.length}`));
checks.push(check('frame_rows_present', counts.frame_rows === frameRows.length && frameRows.length > 0, `frames ${counts.frame_rows}/${frameRows.length}`));
checks.push(check('frame_rows_cover_source', frameRows.reduce((sum, row) => sum + row.row_count, 0) === sourceRows.length, `frame sum/source ${frameRows.reduce((sum, row) => sum + row.row_count, 0)}/${sourceRows.length}`));
checks.push(check('metadata_complete', counts.rows_with_complete_metadata === sourceRows.length && counts.rows_with_route_ids === sourceRows.length, `metadata/routes/source ${counts.rows_with_complete_metadata}/${counts.rows_with_route_ids}/${sourceRows.length}`));
checks.push(check('usage_only_no_authority_hits', counts.observed_usage_only_rows === sourceRows.length && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0, `observed/reader/payload/forbidden ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`));
checks.push(check('route_concentration_preserved', counts.route_ids === 1, `route IDs ${counts.route_ids}`, 'warning'));
checks.push(check('no_broad_or_queue_side_effects', counts.source_text_read === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0, `sourceText/broad/queue/submitted ${counts.source_text_read}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`));

for (const key of ['observed_usage_only', 'focus_frame_summary_only', 'route_ids_only']) {
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

const sourceFrameCounts = new Map();
for (const row of sourceRows) {
  sourceFrameCounts.set(row.usage_frame_label, (sourceFrameCounts.get(row.usage_frame_label) || 0) + 1);
}

for (const row of frameRows) {
  const label = row.frame_label;
  if (!label) errors.push('frame row missing label');
  if (row.row_count !== sourceFrameCounts.get(label)) errors.push(`${label}: row_count mismatch ${row.row_count}/${sourceFrameCounts.get(label)}`);
  if (!Number.isInteger(row.source_ref_count) || row.source_ref_count <= 0) errors.push(`${label}: source_ref_count invalid`);
  if (!Number.isInteger(row.work_count) || row.work_count <= 0) errors.push(`${label}: work_count invalid`);
  if (!Array.isArray(row.category_counts) || !row.category_counts.length) errors.push(`${label}: category_counts missing`);
  if (!Array.isArray(row.status_counts) || !row.status_counts.length) errors.push(`${label}: status_counts missing`);
  if (!Array.isArray(row.license_counts) || !row.license_counts.length) errors.push(`${label}: license_counts missing`);
  if (!Array.isArray(row.route_ids) || row.route_ids.length !== 1) errors.push(`${label}: route_ids must preserve single route pointer`);
  if (!Array.isArray(row.top_context_tokens) || !row.top_context_tokens.length) errors.push(`${label}: top_context_tokens missing`);
  if (!Array.isArray(row.top_works) || !row.top_works.length) errors.push(`${label}: top_works missing`);
  if (!Array.isArray(row.sample_occurrences) || !row.sample_occurrences.length) errors.push(`${label}: sample_occurrences missing`);
  if (row.row_label !== 'observed usage only' || row.reader_facing !== false || row.not_definition_authority !== true) errors.push(`${label}: usage boundary flags invalid`);
  for (const sample of row.sample_occurrences || []) {
    if (!sample.occurrence_id || !sample.source_ref || !/^https:\/\//.test(sample.source_url || '') || !sample.local_work_anchor) errors.push(`${label}: sample link metadata incomplete`);
    if (!sample.license || !sample.version_title || !sample.version_source) errors.push(`${label}: sample provenance incomplete`);
    if (!Array.isArray(sample.related_agent2_route_ids) || sample.related_agent2_route_ids.length !== 1) errors.push(`${label}: sample route IDs invalid`);
    if (sample.row_label !== 'observed usage only') errors.push(`${label}: sample row label invalid`);
  }
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

console.log(`Validation passed: frames ${counts.frame_rows}; rows ${counts.summarized_rows}`);

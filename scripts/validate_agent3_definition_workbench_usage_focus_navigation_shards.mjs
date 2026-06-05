import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ARTIFACT = 'data/definitions/agent3-definition-workbench-usage-focus-navigation-shards-reshit.json';
const REPORT = 'reports/agent3-definition-workbench-usage-focus-navigation-shards-reshit.md';

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function check(name, passed, detail, severity = 'required') {
  return { name, passed, detail, severity };
}

const packet = readJson(ARTIFACT);
const drilldown = readJson(packet.source_artifacts?.focus_token_drilldown || '');
const frameSummary = readJson(packet.source_artifacts?.focus_frame_summary || '');
const counts = packet.counts || {};
const boundaries = packet.authority_boundary || {};
const shards = Array.isArray(packet.shard_rows) ? packet.shard_rows : [];
const sourceRows = Array.isArray(drilldown.occurrence_rows) ? drilldown.occurrence_rows : [];
const checks = [];
const errors = [];

checks.push(check('report_exists', fs.existsSync(path.join(ROOT, REPORT)), REPORT));
checks.push(check('artifact_type', packet.artifact_type === 'agent3_definition_workbench_usage_focus_navigation_shards', packet.artifact_type));
checks.push(check('status_boundary', ['evidence-ready', 'awaiting-Agent-6'].includes(packet.status), packet.status));
checks.push(check('source_artifacts_exist', fs.existsSync(path.join(ROOT, packet.source_artifacts?.focus_token_drilldown || '')) && fs.existsSync(path.join(ROOT, packet.source_artifacts?.focus_frame_summary || '')), `${packet.source_artifacts?.focus_token_drilldown}; ${packet.source_artifacts?.focus_frame_summary}`));
checks.push(check('source_types', drilldown.artifact_type === 'agent3_definition_workbench_usage_focus_token_drilldown' && frameSummary.artifact_type === 'agent3_definition_workbench_usage_focus_frame_summary', `${drilldown.artifact_type}; ${frameSummary.artifact_type}`));
checks.push(check('focus_token_present', packet.focus_token_normalized === drilldown.focus_token_normalized && packet.focus_token_normalized === frameSummary.focus_token_normalized && packet.focus_token_normalized === 'ראשית', `${packet.focus_token_normalized}/${drilldown.focus_token_normalized}/${frameSummary.focus_token_normalized}`));
checks.push(check('source_row_count_matches', counts.source_rows === sourceRows.length && counts.source_drilldown_rows === drilldown.counts?.focus_token_rows && counts.source_frame_summary_rows === frameSummary.counts?.summarized_rows, `source/drilldown/frame ${counts.source_rows}/${drilldown.counts?.focus_token_rows}/${frameSummary.counts?.summarized_rows}`));
checks.push(check('shards_present', counts.shard_rows === shards.length && counts.shard_rows > 0 && counts.frame_category_shards > 0 && counts.frame_license_shards > 0 && counts.frame_status_shards > 0 && counts.category_license_shards > 0 && counts.work_frame_shards > 0, `total/types ${counts.shard_rows}/${shards.length}; ${counts.frame_category_shards}/${counts.frame_license_shards}/${counts.frame_status_shards}/${counts.category_license_shards}/${counts.work_frame_shards}`));
checks.push(check('metadata_complete', counts.rows_with_complete_metadata === sourceRows.length && counts.rows_with_route_ids === sourceRows.length, `metadata/routes/source ${counts.rows_with_complete_metadata}/${counts.rows_with_route_ids}/${sourceRows.length}`));
checks.push(check('usage_only_no_authority_hits', counts.observed_usage_only_rows === sourceRows.length && counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0, `observed/reader/payload/forbidden ${counts.observed_usage_only_rows}/${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`));
checks.push(check('route_concentration_preserved', counts.route_ids === 1, `route IDs ${counts.route_ids}`, 'warning'));
checks.push(check('no_broad_or_queue_side_effects', counts.source_text_read === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0, `sourceText/broad/queue/submitted ${counts.source_text_read}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`));

for (const key of ['observed_usage_only', 'focus_navigation_shards_only', 'route_ids_only']) {
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

const validTypes = new Set(['frame_category', 'frame_license', 'frame_status', 'category_license', 'work_frame']);
const seen = new Set();
const typeCounts = new Map();
for (const shard of shards) {
  const label = `${shard.shard_type}:${shard.shard_key}`;
  if (seen.has(label)) errors.push(`${label}: duplicate shard`);
  seen.add(label);
  typeCounts.set(shard.shard_type, (typeCounts.get(shard.shard_type) || 0) + 1);
  if (!validTypes.has(shard.shard_type)) errors.push(`${label}: invalid shard_type`);
  if (!Array.isArray(shard.shard_parts) || shard.shard_parts.length !== 2) errors.push(`${label}: shard_parts invalid`);
  if (!Number.isInteger(shard.row_count) || shard.row_count <= 0) errors.push(`${label}: row_count invalid`);
  if (!Number.isInteger(shard.source_ref_count) || shard.source_ref_count <= 0) errors.push(`${label}: source_ref_count invalid`);
  if (!Number.isInteger(shard.work_count) || shard.work_count <= 0) errors.push(`${label}: work_count invalid`);
  if (!Number.isInteger(shard.license_count) || shard.license_count <= 0) errors.push(`${label}: license_count invalid`);
  if (!Array.isArray(shard.route_ids) || shard.route_ids.length !== 1) errors.push(`${label}: route_ids must preserve single route pointer`);
  if (!Array.isArray(shard.occurrence_ids) || shard.occurrence_ids.length !== shard.row_count) errors.push(`${label}: occurrence_ids count mismatch`);
  if (!Array.isArray(shard.sample_occurrences) || !shard.sample_occurrences.length) errors.push(`${label}: sample_occurrences missing`);
  if (shard.row_label !== 'observed usage only' || shard.reader_facing !== false || shard.not_definition_authority !== true) errors.push(`${label}: usage boundary flags invalid`);
  for (const sample of shard.sample_occurrences || []) {
    if (!sample.occurrence_id || !sample.source_ref || !/^https:\/\//.test(sample.source_url || '') || !sample.local_work_anchor) errors.push(`${label}: sample source link incomplete`);
    if (!sample.license || !sample.version_title || !sample.version_source) errors.push(`${label}: sample provenance incomplete`);
    if (!Array.isArray(sample.related_agent2_route_ids) || sample.related_agent2_route_ids.length !== 1) errors.push(`${label}: sample route IDs invalid`);
    if (sample.row_label !== 'observed usage only') errors.push(`${label}: sample row label invalid`);
  }
}

checks.push(check('shard_type_counts_match', typeCounts.get('frame_category') === counts.frame_category_shards && typeCounts.get('frame_license') === counts.frame_license_shards && typeCounts.get('frame_status') === counts.frame_status_shards && typeCounts.get('category_license') === counts.category_license_shards && typeCounts.get('work_frame') === counts.work_frame_shards, `types ${typeCounts.get('frame_category')}/${typeCounts.get('frame_license')}/${typeCounts.get('frame_status')}/${typeCounts.get('category_license')}/${typeCounts.get('work_frame')}`));

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

console.log(`Validation passed: shards ${counts.shard_rows}; source rows ${counts.source_rows}`);

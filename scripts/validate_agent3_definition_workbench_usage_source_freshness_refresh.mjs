import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ARTIFACT = 'reports/agent3-definition-workbench-usage-source-freshness-refresh-2026-06-02.json';
const REPORT = 'reports/agent3-definition-workbench-usage-source-freshness-refresh-2026-06-02.md';

const packet = readJson(ARTIFACT);
const counts = packet.counts || {};
const dirtyRows = Array.isArray(packet.dirty_source_rows) ? packet.dirty_source_rows : [];
const impactedRows = Array.isArray(packet.impacted_usage_rows) ? packet.impacted_usage_rows : [];
const checks = [];
const errors = [];

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function currentDirtySourceCount() {
  const output = execFileSync('git', ['status', '--porcelain=v1', '--', 'data/sources'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return output.split(/\r?\n/).filter(Boolean).length;
}

function check(name, passed, detail, severity = 'required') {
  checks.push({ name, passed, detail, severity });
}

function requireFalseBoundary(key) {
  check(`boundary_false_${key}`, packet.authority_boundary?.[key] === false, String(packet.authority_boundary?.[key]));
}

check('report_exists', fs.existsSync(path.join(ROOT, REPORT)), REPORT);
check('artifact_type', packet.artifact_type === 'agent3_definition_workbench_usage_source_freshness_refresh', packet.artifact_type);
check('status_boundary', ['evidence-ready', 'awaiting-Agent-6'].includes(packet.status), packet.status);
check('chosen_path', packet.chosen_path === 'source_freshness_impact_refresh', packet.chosen_path);
check('lane_owner', packet.lane_owner === 'Agent 3', packet.lane_owner);
check('observed_usage_only', packet.authority_boundary?.observed_usage_only === true, String(packet.authority_boundary?.observed_usage_only));
check('freshness_impact_only', packet.authority_boundary?.freshness_impact_only === true, String(packet.authority_boundary?.freshness_impact_only));

for (const key of [
  'source_text_read',
  'broad_target_expansion',
  'promoted_run_targets',
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
  requireFalseBoundary(key);
}

for (const [name, relPath] of Object.entries(packet.source_artifacts || {})) {
  check(`source_artifact_${name}`, fs.existsSync(path.join(ROOT, relPath)), relPath);
}

const liveDirtyCount = currentDirtySourceCount();
check('live_dirty_source_count_matches', counts.git_dirty_source_files === liveDirtyCount && dirtyRows.length === liveDirtyCount, `artifact/live/rows ${counts.git_dirty_source_files}/${liveDirtyCount}/${dirtyRows.length}`);
check('dirty_split_matches', counts.git_modified_source_files + counts.git_untracked_source_files === counts.git_dirty_source_files, `modified/untracked/dirty ${counts.git_modified_source_files}/${counts.git_untracked_source_files}/${counts.git_dirty_source_files}`);
check('overlap_split_matches', counts.dirty_sources_with_current_usage_overlap + counts.dirty_sources_without_current_usage_overlap === counts.git_dirty_source_files, `overlap/no-overlap/dirty ${counts.dirty_sources_with_current_usage_overlap}/${counts.dirty_sources_without_current_usage_overlap}/${counts.git_dirty_source_files}`);
check('impacted_rows_match', counts.impacted_navigation_rows === impactedRows.length, `count/rows ${counts.impacted_navigation_rows}/${impactedRows.length}`);
check('no_direct_overlap_currently', counts.dirty_sources_with_current_usage_overlap === 0 && counts.impacted_navigation_rows === 0 && counts.impacted_selected_support_rows === 0 && counts.impacted_route_ids === 0, `source/rows/selected/routes ${counts.dirty_sources_with_current_usage_overlap}/${counts.impacted_navigation_rows}/${counts.impacted_selected_support_rows}/${counts.impacted_route_ids}`, 'warning');
check('metadata_complete', counts.navigation_rows_with_source_url === counts.current_navigation_rows && counts.navigation_rows_with_local_work_anchor === counts.current_navigation_rows && counts.navigation_rows_with_context === counts.current_navigation_rows && counts.navigation_rows_with_focus === counts.current_navigation_rows && counts.navigation_rows_with_license === counts.current_navigation_rows && counts.navigation_rows_with_version === counts.current_navigation_rows, `rows/source/anchor/context/focus/license/version ${counts.current_navigation_rows}/${counts.navigation_rows_with_source_url}/${counts.navigation_rows_with_local_work_anchor}/${counts.navigation_rows_with_context}/${counts.navigation_rows_with_focus}/${counts.navigation_rows_with_license}/${counts.navigation_rows_with_version}`);
check('usage_only_no_authority_hits', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 && counts.source_text_read === 0, `reader/payload/forbidden/sourceText ${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}/${counts.source_text_read}`);
check('no_promoted_targets', counts.promoted_run_targets === 0 && counts.broad_target_expansion === 0, `promoted/broad ${counts.promoted_run_targets}/${counts.broad_target_expansion}`);
check('queue_not_mutated', counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0, `queue/submitted ${counts.queue_mutations}/${counts.submitted_to_agent6}`);
check('prior_cache_delta_visible', Number.isInteger(counts.current_vs_prior_pending_delta) && counts.prior_cached_pending_refresh_files !== counts.git_dirty_source_files, `prior/current/delta ${counts.prior_cached_pending_refresh_files}/${counts.git_dirty_source_files}/${counts.current_vs_prior_pending_delta}`, 'warning');

const sourceFiles = new Set();
for (const [index, row] of dirtyRows.entries()) {
  const label = row.source_file || `dirty_source_rows[${index}]`;
  if (sourceFiles.has(row.source_file)) errors.push(`duplicate source file: ${row.source_file}`);
  sourceFiles.add(row.source_file);
  if (!String(row.source_file || '').startsWith('data/sources/') || !String(row.source_file || '').endsWith('.json')) errors.push(`${label}: source_file must be data/sources/*.json`);
  if (!row.source_slug) errors.push(`${label}: source_slug missing`);
  if (![' M', 'M ', 'MM', '??'].includes(row.status_code)) errors.push(`${label}: unexpected status_code ${row.status_code}`);
  if (!['current_usage_overlap_refresh_review', 'no_current_usage_overlap'].includes(row.impact_status)) errors.push(`${label}: invalid impact_status`);
  if (row.promotion_status !== 'not_promoted') errors.push(`${label}: promotion_status must be not_promoted`);
  for (const numericKey of ['navigation_rows', 'selected_support_rows', 'supported_rows', 'candidate_rows', 'weak_rows', 'source_refs', 'works']) {
    if (!Number.isInteger(row[numericKey]) || row[numericKey] < 0) errors.push(`${label}: ${numericKey} must be non-negative integer`);
  }
  if (!Array.isArray(row.categories) || !Array.isArray(row.clusters) || !Array.isArray(row.route_ids) || !Array.isArray(row.impacted_occurrence_ids)) errors.push(`${label}: array fields missing`);
  if (!row.reason) errors.push(`${label}: reason missing`);
}

for (const [index, row] of impactedRows.entries()) {
  const label = row.occurrence_id || `impacted_usage_rows[${index}]`;
  if (!row.occurrence_id) errors.push(`${label}: occurrence_id missing`);
  if (!row.source_ref) errors.push(`${label}: source_ref missing`);
  if (!/^https:\/\//.test(row.source_url || '')) errors.push(`${label}: source_url must be https`);
  if (!row.local_work_anchor) errors.push(`${label}: local_work_anchor missing`);
  if (!['supported', 'candidate', 'weak'].includes(row.status)) errors.push(`${label}: invalid status`);
  if (row.row_label !== 'observed usage only') errors.push(`${label}: row_label must be observed usage only`);
  if (row.reader_facing !== false || row.not_definition_authority !== true) errors.push(`${label}: authority boundary flags invalid`);
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
  for (const error of errors.slice(0, 80)) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validation passed: dirty sources ${counts.git_dirty_source_files}; overlap ${counts.dirty_sources_with_current_usage_overlap}; impacted rows ${counts.impacted_navigation_rows}`);

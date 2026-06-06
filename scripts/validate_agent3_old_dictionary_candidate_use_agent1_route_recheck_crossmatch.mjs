#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaults = {
  input: 'reports/agent3-old-dictionary-candidate-use-agent1-route-recheck-crossmatch-2026-06-06.json',
};

const options = parseArgs(process.argv.slice(2));
const artifact = readJson(options.input);
const errors = [];

expect(artifact.schema_version === 1, 'schema_version must be 1');
expect(
  artifact.artifact_type === 'agent3_old_dictionary_candidate_use_agent1_route_recheck_crossmatch',
  'artifact_type mismatch',
);
expect(artifact.status === 'evidence-ready', 'status must be evidence-ready');

const boundary = artifact.authority_boundary || {};
for (const key of ['linkage_navigation_only', 'route_recheck_crossmatch_only', 'external_route_status_observation_only']) {
  expect(boundary[key] === true, `authority_boundary.${key} must be true`);
}
for (const key of [
  'source_citation_supplied_by_agent3',
  'source_provenance_acceptance',
  'source_license_acceptance',
  'source_legal_acceptance',
  'transform_authority',
  'source_text_read',
  'candidate_text_export',
  'definition_content_storage',
  'lemma_content_storage',
  'reader_hint_content_storage',
  'usage_as_definition_authority',
  'definition_authority',
  'answer_selection',
  'answer_eligibility',
  'route_ranking',
  'qa_acceptance',
  'publication_readiness',
  'public_runtime_mutation',
  'accepted_gloss_text',
  'delivery_attempted_by_agent3',
  'release_action',
]) {
  expect(boundary[key] === false, `authority_boundary.${key} must be false`);
}

const counts = artifact.counts || {};
const routeRows = artifact.route_recheck_rows || [];

expect(routeRows.length === counts.route_recheck_rows, 'route row length mismatch');
expect(counts.route_recheck_rows === 1, 'expected one route recheck row');
expect(counts.attempted_target_matches_registry_rows === 1, 'expected attempted target to match registry');
expect(counts.registry_postdates_route_blocker_rows === 1, 'expected registry to postdate route blocker');
expect(counts.route_recheck_required_rows === 1, 'expected one route recheck required row');
expect(counts.route_blocker_preserved_rows === 0, 'expected zero preserved route blocker rows');
expect(counts.row_dependency_rows === 78, 'expected 78 dependency rows');
expect(counts.row_dependency_occurrences === 1461, 'expected 1461 dependency occurrences');
expect(counts.source_citation_missing_rows === 78, 'expected 78 missing source-citation rows');
expect(counts.transform_rule_missing_rows === 78, 'expected 78 missing transform-rule rows');
expect(counts.agent10_workset_rows === 78, 'expected Agent 10 workset rows 78');
expect(counts.agent10_workset_occurrences === 1461, 'expected Agent 10 workset occurrences 1461');
expect(counts.source_rid_references === 393, 'expected 393 source RID references');
expect(counts.unique_source_rids === 344, 'expected 344 unique source RIDs');
expect(counts.exact_blocker_rows === 5, 'expected 5 exact blocker rows');
expect(counts.source_citation_supplied_rows === 0, 'expected 0 supplied source-citation rows');
expect(counts.transform_ready_rows === 0, 'expected 0 transform-ready rows');
expect(counts.delivery_attempts_by_agent3 === 0, 'expected 0 Agent 3 delivery attempts');

for (const key of [
  'candidate_text_rows',
  'definition_content_rows',
  'lemma_content_rows',
  'reader_hint_content_rows',
  'answer_rows',
  'answer_eligible_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'source_text_rows',
  'accepted_text_rows',
  'public_runtime_mutation',
  'export_rows',
  'release_actions',
  'source_acceptance_claims',
  'route_payload_field_hits',
  'forbidden_payload_field_hits',
  'acceptance_claims',
]) {
  expect(counts[key] === 0, `${key} must be zero`);
}

const row = routeRows[0] || {};
expect(row.attempted_target_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'attempted target mismatch');
expect(row.registry_target_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'registry target mismatch');
expect(row.registry_current_live_thread_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current live thread mismatch');
expect(row.registry_thread_title === 'Agent 1 - importer', 'Agent 1 thread title mismatch');
expect(row.registry_discovery_status === 'new_agent1_direct_route_available', 'Agent 1 discovery status mismatch');
expect(row.registry_routing_blocker === 'resolved_missing_live_thread_id_for_new_agent1', 'registry routing blocker mismatch');
expect(row.registry_current_goal_status === 'active_in_goals_1_sqlite', 'current goal status mismatch');
expect(row.route_target_matches_registry === true, 'route target should match registry');
expect(row.registry_postdates_route_blocker === true, 'registry should postdate route blocker');
expect(
  row.route_recheck_status === 'recheck_required_current_registry_contradicts_older_route_blocker',
  'route recheck status mismatch',
);
expect(row.evidence_role === 'route_recheck_navigation_only_no_delivery_or_acceptance', 'evidence role mismatch');

expect(artifact.dependency_summary?.source_citation_or_url_supplied_now === false, 'source citation supplied flag mismatch');
expect(artifact.dependency_summary?.transform_rule_supplied_now === false, 'transform rule supplied flag mismatch');
expect(
  artifact.downstream_handoff?.exact_current_blocker ===
    'route_recheck_required_before_reusing_stale_agent1_route_blocker; source_citation_or_url_and_transform_rule_still_missing',
  'exact current blocker mismatch',
);

const forbiddenKeys = [];
walk(artifact, (key, child, parentKey) => {
  if (parentKey === 'authority_boundary') return;
  if (
    [
      'surface',
      'normalized',
      'token_surface',
      'token_normalized',
      'focus_surface',
      'focus_normalized',
      'candidate_text',
      'definition_text',
      'source_text',
      'accepted_text',
      'display_text',
      'route_payload',
      'public_domain_headwords',
      'public_domain_rids',
      'source_headwords',
    ].includes(key)
  ) {
    forbiddenKeys.push(key);
  }
});
expect(forbiddenKeys.length === 0, `forbidden payload keys present: ${forbiddenKeys.join(', ')}`);

const stopCondition = artifact.downstream_handoff?.stop_condition || '';
expect(stopCondition.includes('route-recheck crossmatch'), 'stop condition must identify route-recheck crossmatch');
expect(stopCondition.includes('does not deliver the workset'), 'stop condition must block delivery');
expect(stopCondition.includes('source/license/legal'), 'stop condition must block source/license/legal acceptance');
expect(stopCondition.includes('accepted text'), 'stop condition must block accepted text');

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}

console.log(
  `Agent 3 Agent1 route recheck passed: rows=${counts.route_recheck_rows} recheck=${counts.route_recheck_required_rows} missing_citation=${counts.source_citation_missing_rows}`,
);

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function walk(value, callback, parentKey = '') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, callback, parentKey);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    callback(key, child, parentKey);
    walk(child, callback, key);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(root, filePath), 'utf8'));
}

function cleanRelativePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function valueAfterEquals(arg) {
  const index = arg.indexOf('=');
  return index === -1 ? '' : arg.slice(index + 1);
}

function parseArgs(args) {
  const parsed = { ...defaults };
  for (const arg of args) {
    if (arg.startsWith('--input=')) parsed.input = cleanRelativePath(valueAfterEquals(arg));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

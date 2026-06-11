#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packetPath = process.argv[2] || 'reports/agent10-agent6-ready-old-dictionary-morphology-candidate-use-boundary-packet-2026-06-05.json';
const packet = readJson(packetPath);
const source = readJson('reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json');
const issues = [];

expect(packet.artifact_type === 'agent10_agent6_ready_old_dictionary_morphology_candidate_use_boundary_packet', 'artifact_type mismatch');
expect(packet.review_scope === 'nonpublic_old_dictionary_morphology_candidate_use_boundary_only', 'review_scope mismatch');
expect(packet.source_lane_owner?.agent_id === '019e975d-dc9f-7020-a7c8-885d083a837e', 'current Agent 1 source-lane owner missing');

const subset = packet.exact_subset || {};
const sourceSubset = source.exact_subset_for_future_question || {};
expect(subset.row_source_path === 'reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json', 'row_source_path mismatch');
expect(subset.row_source_pointer === 'exact_subset_for_future_question.queue_ids', 'row_source_pointer mismatch');
expect(subset.relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning', 'relation_status mismatch');
expect(subset.relation_basis === 'exact_after_mark_strip', 'relation_basis mismatch');
expect(subset.row_count === 78, 'row_count must be 78');
expect(subset.occurrence_count === 1461, 'occurrence_count must be 1461');
expect(subset.license_lane === 'commercial_clean_candidate', 'license_lane must be commercial_clean_candidate');
expect(Array.isArray(sourceSubset.queue_ids) && sourceSubset.queue_ids.length === 78, 'source queue_ids must contain 78 rows');
expect(sourceSubset.occurrence_count === 1461, 'source occurrence_count must be 1461');

const expectedFamilies = new Set(['BDB Aramaic Dictionary', 'BDB Dictionary', 'Jastrow Dictionary']);
for (const family of subset.source_families || []) {
  expect(expectedFamilies.has(family), `unexpected source family ${family}`);
}
expect((subset.source_families || []).length === 3, 'source_families must contain 3 entries');

const groups = subset.source_family_group_counts || {};
expect(groups['BDB Aramaic Dictionary']?.planning_rows_with_family === 21, 'BDB Aramaic row count mismatch');
expect(groups['BDB Aramaic Dictionary']?.planning_occurrences_with_family === 616, 'BDB Aramaic occurrence count mismatch');
expect(groups['BDB Dictionary']?.planning_rows_with_family === 63, 'BDB row count mismatch');
expect(groups['BDB Dictionary']?.planning_occurrences_with_family === 1271, 'BDB occurrence count mismatch');
expect(groups['Jastrow Dictionary']?.planning_rows_with_family === 75, 'Jastrow row count mismatch');
expect(groups['Jastrow Dictionary']?.planning_occurrences_with_family === 1417, 'Jastrow occurrence count mismatch');

const excluded = packet.excluded_rows || {};
expect(excluded.morphology_blocked_rows === 219, 'morphology_blocked_rows must be 219');
expect(excluded.prefix_or_clitic_possible_rows === 129, 'prefix_or_clitic_possible_rows must be 129');
expect(excluded.needs_morphology_disambiguation_rows === 90, 'needs_morphology_disambiguation_rows must be 90');

const request = packet.candidate_use_request || {};
expect(request.requested_candidate_use_scope === 'nonpublic_candidate_use_planning_input_only', 'candidate use scope mismatch');
expect(request.agent2_may_author_nonpublic_candidate_package_if_warn_accepted === true, 'Agent 2 nonpublic package authoring request must be explicit');
for (const key of [
  'agent2_may_store_definition_text_now',
  'agent2_may_store_lemma_text_now',
  'agent2_may_store_reader_hint_text_now',
  'agent2_may_export_candidate_text_now',
  'agent2_may_emit_public_reader_output_now',
  'agent2_may_create_answer_eligible_rows_now',
  'agent2_may_write_route_jsonl_or_shards_now',
  'agent2_may_mutate_runtime_or_public_files_now',
  'agent2_may_claim_source_license_legal_acceptance_now',
  'commercial_export_allowed_now',
  'release_action_allowed_now',
]) {
  expect(request[key] === false, `candidate_use_request.${key} must be false`);
}

for (const [key, value] of Object.entries(packet.zero_counters || {})) {
  expect(value === 0, `zero_counters.${key} must be 0`);
}

expect(packet.delivery_state?.status === 'agent6_ready_not_delivered_by_agent10_in_this_artifact', 'delivery_state.status mismatch');
expect(packet.exact_blocker_if_not_routed === 'await_agent6_candidate_use_boundary_for_78_old_dictionary_morphology_planning_rows', 'exact blocker mismatch');

if (issues.length) {
  console.error(`Agent10 old-dictionary morphology candidate-use boundary packet validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent10 old-dictionary morphology candidate-use boundary packet validation passed. Rows: ${subset.row_count}; occurrences: ${subset.occurrence_count}.`);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

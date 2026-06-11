#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const handoffPath = process.argv[2] || 'reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json';
const handoff = readJson(handoffPath);
const issues = [];

expect(handoff.artifact_type === 'agent2_agent10_candidate_use_preflight_handoff', 'artifact_type mismatch');
expect(handoff.status === 'preflight_handoff_only_candidate_use_blocked', 'status mismatch');
expect(handoff.inputs?.morphology_matrix === 'reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json', 'morphology matrix input mismatch');
expect(handoff.inputs?.candidate_use_blocker === 'reports/agent2-morphology-planning-candidate-use-blocker-2026-06-05.json', 'candidate-use blocker input mismatch');

expect(handoff.request_to_agent10?.current_agent2_authority === 'nonpublic_morphology_planning_evidence_only', 'Agent2 authority mismatch');
expect(handoff.request_to_agent10?.current_agent2_candidate_use_allowed === false, 'candidate-use must remain false');
expect(handoff.request_to_agent10?.current_agent2_transform_allowed === false, 'transform must remain false');

expect(handoff.exact_subset_for_future_question?.relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning', 'future subset relation status mismatch');
expect(handoff.exact_subset_for_future_question?.row_count === 78, 'future subset row count must be 78');
expect(handoff.exact_subset_for_future_question?.occurrence_count === 1461, 'future subset occurrence count must be 1461');
expect(Array.isArray(handoff.exact_subset_for_future_question?.queue_ids) && handoff.exact_subset_for_future_question.queue_ids.length === 78, 'queue_ids must contain 78 entries');
expect(Array.isArray(handoff.exact_subset_for_future_question?.token_ids) && handoff.exact_subset_for_future_question.token_ids.length === 78, 'token_ids must contain 78 entries');
expect(Array.isArray(handoff.rows) && handoff.rows.length === 78, 'rows must contain 78 entries');

const queueIds = new Set();
const tokenIds = new Set();
for (const row of handoff.rows || []) {
  expect(!queueIds.has(row.queue_id), `duplicate queue_id ${row.queue_id}`);
  expect(!tokenIds.has(row.token_id), `duplicate token_id ${row.token_id}`);
  queueIds.add(row.queue_id);
  tokenIds.add(row.token_id);
  expect(row.relation_basis === 'exact_after_mark_strip', `${row.queue_id} relation basis mismatch`);
  expect(row.downstream_blocker === 'missing_exact_agent6_row_subset_candidate_use_package_for_downstream_use', `${row.queue_id} downstream blocker mismatch`);
  expect(Array.isArray(row.source_families) && row.source_families.length > 0, `${row.queue_id} source_families missing`);
  expect(Array.isArray(row.source_rids) && row.source_rids.length > 0, `${row.queue_id} source_rids missing`);
  for (const key of [
    'candidate_text_rows_now',
    'definition_candidate_rows_now',
    'lemma_candidate_rows_now',
    'reader_hint_candidate_rows_now',
    'answer_eligible_rows_now',
    'public_emit_rows_now',
  ]) {
    expect(row[key] === 0, `${row.queue_id}.${key} must be 0`);
  }
}

for (const field of [
  'row_subset_id',
  'queue_id',
  'token_id',
  'lexicon_entry_id',
  'source_family',
  'license_lane',
  'source_rids',
  'morphology_relation_basis',
  'candidate_use_scope',
  'allowed_fields',
  'disallowed_fields',
  'commercial_export_allowed',
  'answer_eligible',
  'public_emit',
  'definition_content_storage',
  'candidate_text_export',
]) {
  expect(handoff.required_agent6_question_fields?.includes(field), `missing required Agent6 field: ${field}`);
}

for (const [key, value] of Object.entries(handoff.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
}

expect(handoff.exact_blocker_until_agent10_agent6_packet_exists === 'agent10_agent6_exact_candidate_use_packet_missing_for_78_morphology_planning_rows', 'exact blocker mismatch');
expect(handoff.stop_condition?.includes('not an Agent6 delivery'), 'stop condition must say not an Agent6 delivery');
expect(handoff.stop_condition?.includes('not a candidate-use package'), 'stop condition must say not candidate-use package');

for (const boundary of [
  'No Definition authority',
  'No answer acceptance',
  'No source/license/legal acceptance',
  'No accepted gloss/text',
  'No public/runtime mutation',
  'No candidate text export',
  'No NC commercial authorization',
  'No release action',
]) {
  expect(handoff.non_acceptance_boundary?.includes(boundary), `missing non-acceptance boundary: ${boundary}`);
}

if (issues.length) {
  console.error(`Agent 2 Agent10 candidate-use preflight handoff validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 Agent10 candidate-use preflight handoff validation passed. Rows: 78; candidate-use rows: 0.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

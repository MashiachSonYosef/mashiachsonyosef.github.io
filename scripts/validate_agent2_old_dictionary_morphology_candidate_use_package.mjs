#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packagePath = process.argv[2] || 'reports/agent2-old-dictionary-morphology-candidate-use-package-2026-06-05.json';
const handoffPath = 'reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json';
const pkg = readJson(packagePath);
const handoff = readJson(handoffPath);
const issues = [];

expect(pkg.artifact_type === 'agent2_old_dictionary_morphology_candidate_use_package', 'artifact_type mismatch');
expect(pkg.status === 'nonpublic_candidate_use_planning_package_authored_no_text_output', 'status mismatch');
expect(pkg.inputs?.agent6_verdict === 'reports/agent6-old-dictionary-morphology-candidate-use-boundary-verdict-2026-06-05.json', 'Agent6 verdict input mismatch');
expect(pkg.inputs?.agent10_verdict_consumption === 'reports/agent10-agent6-old-dictionary-morphology-candidate-use-verdict-consumption-2026-06-05.json', 'Agent10 consumption input mismatch');
expect(pkg.inputs?.exact_row_source === handoffPath, 'exact row source mismatch');
expect(pkg.inputs?.exact_row_source_pointer === 'exact_subset_for_future_question.queue_ids', 'exact row pointer mismatch');

expect(pkg.accepted_boundary_consumed?.disposition === 'warn_accepted_nonpublic_candidate_use_planning_input_only', 'accepted disposition mismatch');
expect(pkg.accepted_boundary_consumed?.rows === 78, 'accepted rows must be 78');
expect(pkg.accepted_boundary_consumed?.occurrences === 1461, 'accepted occurrences must be 1461');
expect(pkg.accepted_boundary_consumed?.license_lane === 'commercial_clean_candidate', 'accepted license lane mismatch');
expect(pkg.accepted_boundary_consumed?.preview_relation_class === 'exact_after_mark_strip', 'accepted relation class mismatch');
expect(pkg.accepted_boundary_consumed?.agent2_morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning', 'accepted morphology status mismatch');
expect(pkg.accepted_boundary_consumed?.noncommercial_educational_candidate_rows === 0, 'accepted NC rows must be 0');

expect(pkg.counts?.package_rows === 78, 'package rows must be 78');
expect(pkg.counts?.package_occurrences === 1461, 'package occurrences must be 1461');
expect(pkg.counts?.unique_queue_ids === 78, 'unique queue IDs must be 78');
expect(pkg.counts?.commercial_clean_candidate_rows === 78, 'commercial-clean rows must be 78');
expect(pkg.counts?.noncommercial_educational_candidate_rows === 0, 'NC rows must be 0');
expect(pkg.counts?.morphology_blocked_rows_excluded === 219, 'blocked morphology rows excluded must be 219');
expect(pkg.counts?.exact_after_mark_strip_rows === 78, 'exact-after-mark-strip rows must be 78');

const expectedIds = new Set(handoff.exact_subset_for_future_question.queue_ids);
expect(Array.isArray(pkg.rows) && pkg.rows.length === 78, 'rows must contain 78 entries');
const seen = new Set();
const requiredFields = [
  'queue_id',
  'token_id',
  'lexicon_entry_id',
  'occurrences',
  'source_family',
  'license_lane',
  'source_rids',
  'morphology_relation_basis',
  'agent2_morphology_relation_status',
  'candidate_use_scope',
  'derived_from_nc',
  'commercial_export_allowed',
  'attribution_required',
  'corpus_contamination',
  'answer_eligible',
  'public_emit',
  'agent6_boundary_required',
];

for (const row of pkg.rows || []) {
  for (const field of requiredFields) expect(Object.hasOwn(row, field), `${row.queue_id || 'row'} missing field ${field}`);
  expect(expectedIds.has(row.queue_id), `${row.queue_id} not in exact handoff queue IDs`);
  expect(!seen.has(row.queue_id), `duplicate queue_id ${row.queue_id}`);
  seen.add(row.queue_id);
  expect(typeof row.token_id === 'string' && row.token_id.startsWith('tok-'), `${row.queue_id} token_id invalid`);
  expect(row.lexicon_entry_id === null || typeof row.lexicon_entry_id === 'string', `${row.queue_id} lexicon_entry_id must preserve string or null source value`);
  expect(Number.isInteger(row.occurrences) && row.occurrences > 0, `${row.queue_id} occurrences invalid`);
  expect(Array.isArray(row.source_family) && row.source_family.length > 0, `${row.queue_id} source_family must be nonempty array`);
  expect(row.license_lane === 'commercial_clean_candidate', `${row.queue_id} license_lane mismatch`);
  expect(Array.isArray(row.source_rids) && row.source_rids.length > 0, `${row.queue_id} source_rids must be nonempty array`);
  expect(row.morphology_relation_basis === 'exact_after_mark_strip', `${row.queue_id} morphology_relation_basis mismatch`);
  expect(row.agent2_morphology_relation_status === 'agent2_morphology_relation_approved_for_nonpublic_planning', `${row.queue_id} morphology status mismatch`);
  expect(row.candidate_use_scope === 'nonpublic_candidate_use_planning_input_only', `${row.queue_id} candidate_use_scope mismatch`);
  expect(row.derived_from_nc === false, `${row.queue_id} derived_from_nc must be false`);
  expect(row.commercial_export_allowed === false, `${row.queue_id} commercial_export_allowed must be false`);
  expect(row.attribution_required === false, `${row.queue_id} attribution_required must be false`);
  expect(row.corpus_contamination === false, `${row.queue_id} corpus_contamination must be false`);
  expect(row.answer_eligible === false, `${row.queue_id} answer_eligible must be false`);
  expect(row.public_emit === false, `${row.queue_id} public_emit must be false`);
  expect(row.agent6_boundary_required === true, `${row.queue_id} agent6_boundary_required must be true`);
}
expect(seen.size === expectedIds.size, 'package queue IDs must exactly match handoff queue IDs');

for (const [key, value] of Object.entries(pkg.zero_output_counts || {})) {
  expect(value === 0, `zero_output_counts.${key} must be 0`);
}
for (const key of [
  'candidate_text_rows',
  'definition_content_rows',
  'lemma_content_rows',
  'reader_hint_content_rows',
  'answer_rows',
  'answer_eligible_rows',
  'public_emit_rows',
  'route_jsonl_rows',
  'route_shard_writes',
  'public_runtime_mutation',
]) {
  expect(pkg.counts?.[key] === 0, `counts.${key} must be 0`);
}

for (const blocker of [
  'candidate_text_export_blocked',
  'definition_lemma_reader_hint_content_storage_blocked',
  'actual_text_storage_transform_output_export_answer_or_runtime_mutation_requires_new_agent6_verdict',
  '219_morphology_blocked_rows_excluded',
]) {
  expect(pkg.blockers_preserved?.includes(blocker), `missing blocker: ${blocker}`);
}

for (const boundary of [
  'No Definition authority',
  'No answer acceptance',
  'No answer eligibility',
  'No source/license/legal acceptance',
  'No accepted gloss/text',
  'No public/runtime mutation',
  'No route-shard edit',
  'No candidate text export',
  'No definition/lemma/reader-hint content storage',
  'No commercial export authorization',
  'No NC commercial authorization',
  'No release action',
]) {
  expect(pkg.non_acceptance_boundary?.includes(boundary), `missing non-acceptance boundary: ${boundary}`);
}

if (issues.length) {
  console.error(`Agent 2 old-dictionary morphology candidate-use package validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 old-dictionary morphology candidate-use package validation passed. Rows: 78; occurrences: 1461; text/output rows: 0.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

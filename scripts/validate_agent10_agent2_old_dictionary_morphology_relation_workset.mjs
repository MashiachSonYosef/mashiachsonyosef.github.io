#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent10-agent2-ready-old-dictionary-commercial-clean-morphology-relation-workset-2026-06-05.json';
const artifact = readJson(artifactPath);
const issues = [];

expect(artifact.artifact_type === 'agent10_agent2_ready_old_dictionary_commercial_clean_morphology_relation_workset', 'artifact_type mismatch');
expect(artifact.status === 'agent2_ready_nonpublic_morphology_relation_workset_no_candidate_text', 'status mismatch');
expect(artifact.counts?.unique_preview_rows === 297, 'unique commercial-clean preview row count must be 297');
expect(artifact.counts?.unique_preview_occurrences === 5747, 'unique commercial-clean preview occurrences must be 5747');
expect(artifact.counts?.commercial_clean_source_families === 3, 'commercial-clean source family count must be 3');
expect(artifact.counts?.commercial_clean_source_family_hit_rows === 500, 'commercial-clean source-family hit rows must be 500');
expect(artifact.counts?.commercial_clean_source_family_hit_occurrences === 10940, 'commercial-clean source-family hit occurrences must be 10940');
expect(Array.isArray(artifact.rows) && artifact.rows.length === 297, 'rows must contain 297 entries');

const expectedRelationCounts = {
  exact_after_mark_strip: [78, 1461],
  needs_morphology_disambiguation: [90, 1251],
  prefix_or_clitic_possible: [129, 3035],
};
for (const [name, [rows, occurrences]] of Object.entries(expectedRelationCounts)) {
  expect(artifact.relation_class_counts?.[name]?.rows === rows, `${name} row count mismatch`);
  expect(artifact.relation_class_counts?.[name]?.occurrences === occurrences, `${name} occurrence count mismatch`);
}

const familyTotals = artifact.commercial_family_hit_totals || {};
for (const name of ['BDB Dictionary', 'BDB Aramaic Dictionary', 'Jastrow Dictionary']) {
  expect(familyTotals[name]?.license_lane === 'commercial_clean_candidate', `${name} lane mismatch`);
}

const seen = new Set();
for (const row of artifact.rows || []) {
  expect(typeof row.token_id === 'string' && row.token_id.length > 0, 'row token_id missing');
  expect(!seen.has(row.queue_id), `duplicate queue_id ${row.queue_id}`);
  seen.add(row.queue_id);
  expect(Array.isArray(row.public_domain_lexicons) && row.public_domain_lexicons.length > 0, `${row.queue_id} public_domain_lexicons missing`);
  expect(row.answer_eligible_rows_now === 0, `${row.queue_id} answer_eligible_rows_now must be 0`);
  expect(row.public_emit_rows_now === 0, `${row.queue_id} public_emit_rows_now must be 0`);
  expect(row.candidate_text_rows_now === 0, `${row.queue_id} candidate_text_rows_now must be 0`);
}

for (const [key, value] of Object.entries(artifact.zero_counters || {})) {
  expect(value === 0, `zero_counters.${key} must be 0`);
}

expect(artifact.agent6_boundary_need?.startsWith('None for this Agent2-ready morphology workset.'), 'Agent 6 boundary need must be none for current workset');
expect(artifact.exact_blockers_preserved?.includes('missing_approved_morphology_relation_for_definition_lemma_reader_hint_transform'), 'morphology blocker missing');
expect(artifact.exact_blockers_preserved?.includes('missing_exact_row_subset_candidate_use_package'), 'candidate-use package blocker missing');

if (issues.length) {
  console.error(`Agent10 Agent2 old-dictionary morphology relation workset validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent10 Agent2 old-dictionary morphology relation workset validation passed. Rows: 297; occurrences: 5747.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function expect(condition, message) {
  if (!condition) issues.push(message);
}

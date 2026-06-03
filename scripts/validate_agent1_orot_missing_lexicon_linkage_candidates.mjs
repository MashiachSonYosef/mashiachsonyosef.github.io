#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const report = process.argv[2] || 'reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-03.json';
const data = JSON.parse(fs.readFileSync(path.join(root, report), 'utf8'));
const issues = [];

expect(data.artifact_type === 'agent1_orot_missing_lexicon_linkage_candidates', 'unexpected artifact_type');
expect(data.boundary?.status === 'evidence_only_candidate_buckets_no_source_mutation', 'unexpected boundary status');
expect(data.boundary?.not_source_custody === true, 'missing not_source_custody boundary');
expect(data.boundary?.not_definition_authority === true, 'missing not_definition_authority boundary');
expect(data.boundary?.not_public_runtime_acceptance === true, 'missing not_public_runtime_acceptance boundary');
expect(data.outputs?.source_mutation === null, 'source mutation output must be null');
expect(data.outputs?.lexical_payload_mutation === null, 'lexical payload mutation output must be null');
expect(data.counts?.missing_lexicon_linkage_rows === 13, 'expected 13 missing linkage rows');
expect(data.counts?.missing_lexicon_linkage_occurrences === 129, 'expected 129 missing linkage occurrences');
expect(data.counts?.mutation_rows_emitted === 0, 'mutation rows emitted must be 0');
expect(data.counts?.source_rows_emitted === 0, 'source rows emitted must be 0');
expect(data.counts?.lexicon_entry_ids_assigned === 0, 'lexicon_entry_ids_assigned must be 0');

const expectedBuckets = {
  no_current_stem_source_candidate_found: 3,
  single_stem_candidate_found_current_pipeline: 6,
  project_preferred_function_word_stem_candidate_exists: 3,
  multi_stem_no_project_preferred_candidate: 1,
};
for (const [bucket, expected] of Object.entries(expectedBuckets)) {
  expect(data.counts?.bucket_counts?.[bucket] === expected, `bucket ${bucket} expected ${expected}`);
}

for (const row of data.candidates || []) {
  expect(row.missing_field === 'lexicon_entry_id', `${row.queue_id} missing_field must be lexicon_entry_id`);
  expect(row.mutation_allowed_here === false, `${row.queue_id} mutation_allowed_here must be false`);
  expect(Array.isArray(row.not_claimed) && row.not_claimed.includes('source custody'), `${row.queue_id} missing source custody not_claimed`);
  for (const edge of row.candidate_edges || []) {
    expect(edge.promote_to_answer === false, `${row.queue_id} candidate edge must not promote_to_answer`);
  }
}

if (issues.length) {
  console.error(`Agent 1 Orot missing lexicon linkage candidate validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Agent 1 Orot missing lexicon linkage candidate validation passed for ${report}.`);

function expect(condition, message) {
  if (!condition) issues.push(message);
}

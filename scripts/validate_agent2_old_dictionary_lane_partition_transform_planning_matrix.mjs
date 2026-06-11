import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent2-old-dictionary-lane-partition-transform-planning-matrix-2026-06-04.json';
const artifact = readJson(artifactPath);
const issues = [];

function expect(condition, message) {
  if (!condition) issues.push(message);
}

expect(artifact.schema_version === '1.0', 'schema_version must be 1.0');
expect(artifact.artifact_type === 'agent2_old_dictionary_lane_partition_transform_planning_matrix', 'artifact_type mismatch');
expect(artifact.status === 'nonpublic_lane_partition_transform_planning_matrix_pre_agent6_boundary', 'status mismatch');
expect(fs.existsSync(path.join(root, artifact.inputs?.agent1_export_partitions || '')), 'agent1 export partition input missing');
expect(fs.existsSync(path.join(root, artifact.inputs?.agent2_old_dictionary_lane_intake || '')), 'agent2 intake input missing');

const counts = artifact.matrix_counts || {};
expect(counts.source_family_rows === 5, 'source_family_rows must be 5');
expect(counts.commercial_clean_candidate_source_families === 3, 'commercial_clean source families must be 3');
expect(counts.noncommercial_educational_candidate_source_families === 1, 'NC source families must be 1');
expect(counts.metadata_or_link_only_source_families === 0, 'metadata/link-only source families must be 0');
expect(counts.blocked_or_needs_review_source_families === 1, 'blocked/review source families must be 1');
expect(counts.candidate_text_rows_now === 0, 'candidate_text_rows_now must be 0');
expect(counts.definition_content_rows_now === 0, 'definition_content_rows_now must be 0');
expect(counts.answer_eligible_rows_now === 0, 'answer_eligible_rows_now must be 0');
expect(counts.public_emit_rows_now === 0, 'public_emit_rows_now must be 0');

for (const row of artifact.matrix_rows || []) {
  expect(row.agent6_boundary_required === true, `${row.source_family} must require Agent 6 boundary`);
  expect(row.candidate_text_rows_now === 0, `${row.source_family} candidate text rows must be 0`);
  expect(row.definition_content_rows_now === 0, `${row.source_family} definition content rows must be 0`);
  expect(row.answer_eligible_rows_now === 0, `${row.source_family} answer eligible rows must be 0`);
  expect(row.public_emit_rows_now === 0, `${row.source_family} public emit rows must be 0`);
  if (row.license_lane === 'noncommercial_educational_candidate') {
    expect(row.derived_from_nc === true, 'NC derived_from_nc must be true');
    expect(row.commercial_export_allowed === false, 'NC commercial_export_allowed must be false');
    expect(row.attribution_required === true, 'NC attribution_required must be true');
    expect(row.owner_use_attestation === 'noncommercial_educational_zero_profit_zero_kickback', 'NC owner_use_attestation mismatch');
    expect(row.corpus_contamination === false, 'NC corpus_contamination must be false');
  }
  if (row.license_lane === 'blocked_or_needs_review') {
    expect(row.commercial_export_allowed === false, 'blocked commercial_export_allowed must be false');
    expect((row.missing_evidence || []).length > 0, 'blocked row must preserve missing evidence');
  }
}

for (const [key, value] of Object.entries(artifact.zero_emission_counters || {})) {
  expect(value === 0, `zero_emission_counters.${key} must be 0`);
}

expect(artifact.allowed_pipeline_effect_now?.may_generate_lane_partition_planning_rows === true, 'lane planning must be allowed');
expect(artifact.allowed_pipeline_effect_now?.may_generate_candidate_text_rows === false, 'candidate text generation must be false');
expect(artifact.exact_blocker === 'old_dictionary_candidate_text_consumption_export_storage_requires_new_exact_agent6_boundary', 'exact blocker mismatch');

if (issues.length) {
  console.error(`Agent 2 old-dictionary lane partition transform planning matrix validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 old-dictionary lane partition transform planning matrix validation passed. Source-family rows: 5; candidate text rows: 0.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent2-workbench-source-name-partition-transform-planning-matrix-2026-06-04.json';
const artifact = readJson(artifactPath);
const issues = [];

function expect(condition, message) {
  if (!condition) issues.push(message);
}

expect(artifact.schema_version === '1.0', 'schema_version must be 1.0');
expect(artifact.artifact_type === 'agent2_workbench_source_name_partition_transform_planning_matrix', 'artifact_type mismatch');
expect(artifact.status === 'nonpublic_workbench_source_name_partition_transform_planning_matrix_pre_agent6_boundary', 'status mismatch');
expect(fs.existsSync(path.join(root, artifact.inputs?.agent1_full_source_name_custody_partitions || '')), 'Agent 1 full source-name partition input missing');
expect(fs.existsSync(path.join(root, artifact.inputs?.agent2_broad_workbench_token_inventory_5000_return || '')), 'Agent 2 token inventory return input missing');

const sourceCounts = artifact.source_partition_counts || {};
expect(sourceCounts.parsed_rows === 105747, 'parsed_rows must be 105747');
expect(sourceCounts.source_row_count === 105747, 'source_row_count must be 105747');
expect(sourceCounts.unique_source_id_count === 1144, 'unique_source_id_count must be 1144');
expect(sourceCounts.unique_work_count === 1112, 'unique_work_count must be 1112');
expect(sourceCounts.source_name_partition_count === 351, 'source_name_partition_count must be 351');
expect(sourceCounts.full_partition_count === 351, 'full_partition_count must be 351');

const tokenCounts = artifact.token_inventory_counts || {};
expect(tokenCounts.token_inventory_top_rows === 5000, 'token_inventory_top_rows must be 5000');
expect(tokenCounts.distinct_normalized_tokens === 698873, 'distinct_normalized_tokens must be 698873');
expect(tokenCounts.total_tokens === 75290880, 'total_tokens must be 75290880');
expect(tokenCounts.token_rows_with_source_name_partition_join === 0, 'token_rows_with_source_name_partition_join must be 0');

const licenseBuckets = artifact.license_bucket_counts || {};
expect(licenseBuckets['Public Domain']?.partition_count === 307, 'Public Domain partition_count must be 307');
expect(licenseBuckets['Public Domain']?.source_row_count === 99045, 'Public Domain source_row_count must be 99045');
expect(licenseBuckets['CC-BY-SA']?.partition_count === 37, 'CC-BY-SA partition_count must be 37');
expect(licenseBuckets['CC-BY-SA']?.source_row_count === 5581, 'CC-BY-SA source_row_count must be 5581');
expect(licenseBuckets['CC-BY']?.partition_count === 5, 'CC-BY partition_count must be 5');
expect(licenseBuckets['CC-BY']?.source_row_count === 625, 'CC-BY source_row_count must be 625');
expect(licenseBuckets.CC0?.partition_count === 2, 'CC0 partition_count must be 2');
expect(licenseBuckets.CC0?.source_row_count === 496, 'CC0 source_row_count must be 496');

const laneBuckets = artifact.lane_bucket_counts || {};
expect(laneBuckets.commercial_clean_candidate?.partition_count === 351, 'commercial_clean_candidate partition_count must be 351');
expect(laneBuckets.commercial_clean_candidate?.source_row_count === 105747, 'commercial_clean_candidate source_row_count must be 105747');
expect(!laneBuckets.noncommercial_educational_candidate, 'noncommercial_educational_candidate lane must not be present for this artifact');

const boundaryCounts = artifact.boundary_sensitive_counts || {};
expect(boundaryCounts.share_alike_required_partitions === 37, 'share_alike_required_partitions must be 37');
expect(boundaryCounts.share_alike_required_source_rows === 5581, 'share_alike_required_source_rows must be 5581');
expect(boundaryCounts.attribution_required_partitions === 42, 'attribution_required_partitions must be 42');
expect(boundaryCounts.attribution_required_source_rows === 6206, 'attribution_required_source_rows must be 6206');
expect(boundaryCounts.commercial_export_blocked_partitions_now === 37, 'commercial_export_blocked_partitions_now must be 37');
expect(boundaryCounts.commercial_export_blocked_source_rows_now === 5581, 'commercial_export_blocked_source_rows_now must be 5581');

const matrixRows = artifact.matrix_rows || [];
expect(matrixRows.length === 351, 'matrix_rows length must be 351');

for (const row of matrixRows) {
  expect(row.license_lane === 'commercial_clean_candidate', `${row.source_name} must preserve commercial_clean_candidate lane`);
  expect(row.derived_from_nc === false, `${row.source_name} derived_from_nc must be false`);
  expect(row.corpus_contamination === false, `${row.source_name} corpus_contamination must be false`);
  expect(row.agent6_boundary_required === true, `${row.source_name} must require Agent 6 boundary`);
  expect(row.answer_eligible === false, `${row.source_name} answer_eligible must be false`);
  expect(row.public_emit === false, `${row.source_name} public_emit must be false`);
  expect(row.definition_content_storage_now === false, `${row.source_name} definition_content_storage_now must be false`);
  expect(row.candidate_text_rows_now === 0, `${row.source_name} candidate_text_rows_now must be 0`);
  expect(row.lemma_candidate_rows_now === 0, `${row.source_name} lemma_candidate_rows_now must be 0`);
  expect(row.reader_hint_candidate_rows_now === 0, `${row.source_name} reader_hint_candidate_rows_now must be 0`);
  expect(row.definition_candidate_rows_now === 0, `${row.source_name} definition_candidate_rows_now must be 0`);
  if (row.share_alike_required === true) {
    expect(row.commercial_export_allowed === false, `${row.source_name} share-alike row commercial_export_allowed must be false`);
    expect(row.blocker_to_transform_candidates === 'cc_by_sa_share_alike_boundary_and_per_token_source_name_partition_join_required', `${row.source_name} share-alike blocker mismatch`);
  }
}

const transformCounts = artifact.transform_candidate_counts || {};
expect(transformCounts.source_name_partition_planning_rows === 351, 'source_name_partition_planning_rows must be 351');
expect(transformCounts.definition_candidate_rows === 0, 'definition_candidate_rows must be 0');
expect(transformCounts.reader_hint_candidate_rows === 0, 'reader_hint_candidate_rows must be 0');
expect(transformCounts.lemma_candidate_rows === 0, 'lemma_candidate_rows must be 0');
expect(transformCounts.candidate_text_rows === 0, 'candidate_text_rows must be 0');

for (const [key, value] of Object.entries(artifact.zero_emission_counters || {})) {
  expect(value === 0, `zero_emission_counters.${key} must be 0`);
}

expect(artifact.missing_field_blocker === 'workbench_token_inventory_missing_per_token_source_name_license_partition_join_before_definition_lemma_reader_hint_candidates', 'missing_field_blocker mismatch');
for (const field of [
  'token_inventory.rows[].source_name',
  'token_inventory.rows[].source_family',
  'token_inventory.rows[].license_label',
  'token_inventory.rows[].license_lane',
  'token_inventory.rows[].source_url_or_citation',
  'token_inventory.rows[].source_name_partition_id',
  'token_inventory.rows[].agent6_boundary_required',
]) {
  expect((artifact.missing_fields || []).includes(field), `missing_fields must include ${field}`);
}

expect(/Agent 10 first/.test(artifact.handoff_owner || ''), 'handoff_owner must name Agent 10 first');
expect(/Agent 6/.test(artifact.handoff_owner || ''), 'handoff_owner must name Agent 6 boundary route');

if (issues.length) {
  console.error(`Agent 2 workbench source-name partition transform planning matrix validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 workbench source-name partition transform planning matrix validation passed. Partitions: 351; source rows: 105747; candidate rows: 0.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = process.argv[2] || 'reports/agent2-workbench-source-license-lane-transform-planning-matrix-2026-06-04.json';
const artifact = readJson(artifactPath);
const issues = [];

function expect(condition, message) {
  if (!condition) issues.push(message);
}

expect(artifact.schema_version === '1.0', 'schema_version must be 1.0');
expect(artifact.artifact_type === 'agent2_workbench_source_license_lane_transform_planning_matrix', 'artifact_type mismatch');
expect(artifact.status === 'nonpublic_workbench_source_license_lane_transform_planning_matrix_pre_agent6_boundary', 'status mismatch');
expect(fs.existsSync(path.join(root, artifact.inputs?.agent1_source_license_custody_inventory || '')), 'Agent 1 source/license custody inventory input missing');
expect(fs.existsSync(path.join(root, artifact.inputs?.agent2_broad_workbench_token_inventory_5000_return || '')), 'Agent 2 token inventory return input missing');

const sourceCounts = artifact.source_license_inventory_counts || {};
expect(sourceCounts.input_file_count === 10, 'input_file_count must be 10');
expect(sourceCounts.source_row_count === 105747, 'source_row_count must be 105747');
expect(sourceCounts.unique_work_count === 1112, 'unique_work_count must be 1112');
expect(sourceCounts.unique_source_id_count === 1144, 'unique_source_id_count must be 1144');

for (const [field, count] of Object.entries(sourceCounts.required_field_missing_counts || {})) {
  expect(count === 0, `required_field_missing_counts.${field} must be 0`);
}

const tokenCounts = artifact.token_inventory_counts || {};
expect(tokenCounts.token_inventory_top_rows === 5000, 'token_inventory_top_rows must be 5000');
expect(tokenCounts.distinct_normalized_tokens === 698873, 'distinct_normalized_tokens must be 698873');
expect(tokenCounts.total_tokens === 75290880, 'total_tokens must be 75290880');
expect(tokenCounts.token_rows_with_source_license_join === 0, 'token_rows_with_source_license_join must be 0');

const laneSplit = artifact.lane_split || {};
expect(laneSplit.commercial_clean_candidate_license_rows === 4, 'commercial clean license rows must be 4');
expect(laneSplit.noncommercial_educational_candidate_license_rows === 0, 'NC license rows must be 0');
expect(laneSplit.metadata_or_link_only_license_rows === 0, 'metadata/link-only license rows must be 0');
expect(laneSplit.blocked_or_needs_review_license_rows === 0, 'blocked/review license rows must be 0');
expect(laneSplit.commercial_clean_candidate_source_rows === 105747, 'commercial clean source rows must be 105747');
expect(laneSplit.noncommercial_educational_candidate_source_rows === 0, 'NC source rows must be 0');
expect(laneSplit.unclassified_rows_consumed_as_candidate_text === 0, 'unclassified candidate text consumption must be 0');

const matrixRows = artifact.matrix_rows || [];
expect(matrixRows.length === 4, 'matrix_rows length must be 4');

const byLicense = new Map(matrixRows.map((row) => [row.license_label, row]));
expect(byLicense.get('Public Domain')?.source_row_count === 99045, 'Public Domain source_row_count must be 99045');
expect(byLicense.get('CC-BY-SA')?.source_row_count === 5581, 'CC-BY-SA source_row_count must be 5581');
expect(byLicense.get('CC-BY')?.source_row_count === 625, 'CC-BY source_row_count must be 625');
expect(byLicense.get('CC0')?.source_row_count === 496, 'CC0 source_row_count must be 496');
expect(byLicense.get('CC-BY-SA')?.share_alike_required === true, 'CC-BY-SA share_alike_required must be true');
expect(byLicense.get('CC-BY-SA')?.commercial_export_allowed === false, 'CC-BY-SA commercial_export_allowed must be false');
expect(byLicense.get('CC-BY-SA')?.blocker_to_definition_lemma_reader_hint_candidates === 'cc_by_sa_share_alike_boundary_and_per_token_source_license_join_required', 'CC-BY-SA blocker mismatch');

for (const row of matrixRows) {
  expect(row.license_lane === 'commercial_clean_candidate', `${row.license_label} must preserve commercial_clean_candidate lane`);
  expect(row.derived_from_nc === false, `${row.license_label} derived_from_nc must be false`);
  expect(row.corpus_contamination === false, `${row.license_label} corpus_contamination must be false`);
  expect(row.agent6_boundary_required === true, `${row.license_label} must require Agent 6 boundary`);
  expect(row.candidate_text_rows_now === 0, `${row.license_label} candidate_text_rows_now must be 0`);
  expect(row.definition_content_rows_now === 0, `${row.license_label} definition_content_rows_now must be 0`);
  expect(row.answer_eligible_rows_now === 0, `${row.license_label} answer_eligible_rows_now must be 0`);
  expect(row.public_emit_rows_now === 0, `${row.license_label} public_emit_rows_now must be 0`);
}

const transformCounts = artifact.transform_candidate_counts || {};
expect(transformCounts.definition_candidate_rows === 0, 'definition_candidate_rows must be 0');
expect(transformCounts.reader_hint_candidate_rows === 0, 'reader_hint_candidate_rows must be 0');
expect(transformCounts.lemma_candidate_rows === 0, 'lemma_candidate_rows must be 0');
expect(transformCounts.candidate_text_rows === 0, 'candidate_text_rows must be 0');
expect(transformCounts.source_license_lane_planning_rows === 4, 'source_license_lane_planning_rows must be 4');

for (const [key, value] of Object.entries(artifact.zero_emission_counters || {})) {
  expect(value === 0, `zero_emission_counters.${key} must be 0`);
}

expect(artifact.missing_field_blocker === 'workbench_token_inventory_missing_per_token_source_license_join_before_definition_lemma_reader_hint_candidates', 'missing_field_blocker mismatch');
for (const field of [
  'token_inventory.rows[].source_family',
  'token_inventory.rows[].source_name',
  'token_inventory.rows[].license_label',
  'token_inventory.rows[].license_lane',
  'token_inventory.rows[].source_url_or_citation',
  'token_inventory.rows[].agent6_boundary_required',
]) {
  expect((artifact.missing_fields || []).includes(field), `missing_fields must include ${field}`);
}

expect(/Agent 10 first/.test(artifact.handoff_owner || ''), 'handoff_owner must name Agent 10 first');
expect(/Agent 6/.test(artifact.handoff_owner || ''), 'handoff_owner must name Agent 6 boundary route');

if (issues.length) {
  console.error(`Agent 2 workbench source-license lane transform planning matrix validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Agent 2 workbench source-license lane transform planning matrix validation passed. License rows: 4; source rows: 105747; candidate rows: 0.');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

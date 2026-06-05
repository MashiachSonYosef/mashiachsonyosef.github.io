#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-handoff-manifest-reshit.json';
const reportPath = 'reports/agent3-definition-workbench-usage-collision-work-category-handoff-manifest-reshit.md';

const artifact = readJson(artifactPath);
const report = fs.readFileSync(path.join(root, reportPath), 'utf8');
const counts = artifact.counts || {};
const boundary = artifact.authority_boundary || {};
const entries = artifact.manifest_entries || [];
const checks = [];

check('artifact_type', artifact.artifact_type === 'agent3_definition_workbench_usage_collision_work_category_handoff_manifest', artifact.artifact_type);
check('status_boundary', artifact.status === 'evidence-ready', artifact.status);
check('entry_count', entries.length === 6 && counts.manifest_entries === 6, `entries ${entries.length}/${counts.manifest_entries}`);
check('data_report_validator_present', counts.entries_with_data_report_validator === 6 && entries.every((entry) => entry.data_exists && entry.report_exists && entry.validator_exists), `present ${counts.entries_with_data_report_validator}/6`);
check('artifact_types_match', counts.entries_with_expected_type === 6 && entries.every((entry) => entry.type_matches), `type matches ${counts.entries_with_expected_type}/6`);
check('entries_evidence_ready', counts.evidence_ready_entries === 6 && entries.every((entry) => entry.status === 'evidence-ready'), `ready ${counts.evidence_ready_entries}/6`);
check('source_files_exist', entries.every((entry) => exists(entry.data_path) && exists(entry.report_path) && exists(entry.validator_path)), 'all data/report/validator paths exist');
check('single_focus_route_visible', counts.focus_tokens === 1 && counts.route_ids === 1, `focus/route ${counts.focus_tokens}/${counts.route_ids}`);
check('work_category_counts', counts.source_occurrence_rows === 106 && counts.category_index_rows === 8 && counts.work_index_rows === 24 && counts.category_license_index_rows === 8, `source/category/work/category-license ${counts.source_occurrence_rows}/${counts.category_index_rows}/${counts.work_index_rows}/${counts.category_license_index_rows}`);
check('queue_coverage_counts', counts.queue_links === 200 && counts.categories_with_multiple_works === 7 && counts.works_with_multiple_source_refs === 12 && counts.category_license_rows_with_multiple_works === 7, `queue/category/work/category-license ${counts.queue_links}/${counts.categories_with_multiple_works}/${counts.works_with_multiple_source_refs}/${counts.category_license_rows_with_multiple_works}`);
check('metadata_observed_complete', counts.rows_with_complete_metadata === 106 && counts.rows_labeled_observed_usage_only === 106, `metadata/observed ${counts.rows_with_complete_metadata}/${counts.rows_labeled_observed_usage_only}`);
check('occurrence_locator_counts', counts.occurrence_locator_rows === 96 && counts.occurrence_locator_duplicate_grouped_rows === 10, `locator/duplicates ${counts.occurrence_locator_rows}/${counts.occurrence_locator_duplicate_grouped_rows}`);
check('provenance_locator_counts', counts.provenance_locator_rows === 96 && counts.provenance_license_buckets === 2 && counts.provenance_version_source_buckets === 22, `rows/license/version-source ${counts.provenance_locator_rows}/${counts.provenance_license_buckets}/${counts.provenance_version_source_buckets}`);
check('repeat_locator_counts', counts.source_ref_repeat_buckets === 23 && counts.source_ref_repeat_rows === 70 && counts.phrase_context_repeat_buckets === 7 && counts.phrase_context_repeat_rows === 14, `source-ref buckets/rows ${counts.source_ref_repeat_buckets}/${counts.source_ref_repeat_rows}; snippet buckets/rows ${counts.phrase_context_repeat_buckets}/${counts.phrase_context_repeat_rows}`);
check('cross_work_snippet_counts', counts.cross_work_snippet_buckets === 3 && counts.cross_work_snippet_occurrence_rows === 6, `buckets/rows ${counts.cross_work_snippet_buckets}/${counts.cross_work_snippet_occurrence_rows}`);
check('validation_run_counts', counts.validation_commands === 2 && counts.validation_commands_passed === 2 && counts.validation_commands_failed === 0, `commands ${counts.validation_commands}; passed/failed ${counts.validation_commands_passed}/${counts.validation_commands_failed}`);
check('no_reader_payload_authority_hits', counts.total_reader_facing_rows === 0 && counts.total_route_payload_field_hits === 0 && counts.total_forbidden_authority_field_hits === 0, `reader/payload/forbidden ${counts.total_reader_facing_rows}/${counts.total_route_payload_field_hits}/${counts.total_forbidden_authority_field_hits}`);
check('no_source_broad_queue_side_effects', counts.total_source_text_reads === 0 && counts.total_broad_target_expansion === 0 && counts.total_queue_mutations === 0 && counts.total_submitted_to_agent6 === 0, `source/broad/queue/submitted ${counts.total_source_text_reads}/${counts.total_broad_target_expansion}/${counts.total_queue_mutations}/${counts.total_submitted_to_agent6}`);
check('authority_boundary_false_flags', boundary.usage_navigation_only === true && boundary.observed_usage_only === true && boundary.route_ids_only === true && boundary.definition_authority === false && boundary.reviewed_lexical_authority === false && boundary.semantic_arbitration === false && boundary.route_ranking === false && boundary.visible_answer_selection === false && boundary.copied_route_payloads === false && boundary.accepted_text_output === false && boundary.publication_claim === false && boundary.source_text_read === false && boundary.broad_target_expansion === false && boundary.agent6_accepted === false, JSON.stringify(boundary));
check('report_non_authority_wording', report.includes('work/category handoff only') && report.includes('cross-work snippet') && report.includes('not Definition authority') && report.includes('does not copy route payloads') && report.includes('not accepted text'), 'report carries non-authority boundary wording');
check('all_embedded_checks_passed', (artifact.checks || []).every((row) => row.status === 'passed'), `${(artifact.checks || []).filter((row) => row.status === 'passed').length}/${(artifact.checks || []).length}`);

for (const row of checks) {
  console.log(`${row.passed ? 'PASS' : 'FAIL'} ${row.name}: ${row.detail}`);
}

const failed = checks.filter((row) => !row.passed);
if (failed.length) {
  console.error(`Validation failed: ${failed.map((row) => row.name).join(', ')}`);
  process.exit(1);
}

console.log(`Agent 3 collision work/category handoff manifest validation passed: entries ${counts.manifest_entries}; source rows ${counts.source_occurrence_rows}; locator rows ${counts.occurrence_locator_rows}; queue links ${counts.queue_links}`);

function check(name, passed, detail) {
  checks.push({ name, passed, detail });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

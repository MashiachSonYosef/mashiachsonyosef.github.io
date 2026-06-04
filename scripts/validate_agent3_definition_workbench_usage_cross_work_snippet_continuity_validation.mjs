#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = 'data/definitions/agent3-definition-workbench-usage-cross-work-snippet-continuity-validation-2026-06-04.json';
const reportPath = 'reports/agent3-definition-workbench-usage-cross-work-snippet-continuity-validation-2026-06-04.md';

const artifact = readJson(artifactPath);
const report = fs.readFileSync(path.join(root, reportPath), 'utf8');
const counts = artifact.counts || {};
const boundary = artifact.authority_boundary || {};
const commandResults = artifact.command_results || [];
const checks = [];

check('artifact_type', artifact.artifact_type === 'agent3_definition_workbench_usage_cross_work_snippet_continuity_validation', artifact.artifact_type);
check('status_boundary', artifact.status === 'evidence-ready', artifact.status);
check('source_artifacts_exist', exists(artifact.source_artifacts?.cross_work_snippet_locator) && exists(artifact.source_artifacts?.agent3_state), JSON.stringify(artifact.source_artifacts));
check('command_results_passed', commandResults.length === 2 && commandResults.every((row) => row.passed && row.exit_code === 0 && row.validator_exists && row.data_exists), `commands ${commandResults.length}; failed ${commandResults.filter((row) => !row.passed).length}`);
check('validation_counts', counts.validation_commands === 2 && counts.commands_passed === 2 && counts.commands_failed === 0 && counts.validators_present === 2 && counts.data_paths_present === 2, `commands/pass/fail validators/data ${counts.validation_commands}/${counts.commands_passed}/${counts.commands_failed} ${counts.validators_present}/${counts.data_paths_present}`);
check('cross_work_counts_stable', counts.source_repeat_locator_rows === 96 && counts.source_phrase_context_repeat_buckets === 7 && counts.cross_work_snippet_buckets === 3 && counts.cross_category_buckets === 1 && counts.cross_work_snippet_occurrence_rows === 6, `source/repeat/cross/category/rows ${counts.source_repeat_locator_rows}/${counts.source_phrase_context_repeat_buckets}/${counts.cross_work_snippet_buckets}/${counts.cross_category_buckets}/${counts.cross_work_snippet_occurrence_rows}`);
check('links_and_metadata_complete', counts.rows_with_source_ref === 6 && counts.rows_with_source_url === 6 && counts.rows_with_local_work_anchor === 6 && counts.rows_with_license === 6 && counts.rows_with_version === 6 && counts.rows_with_route_ids === 6, `ref/url/anchor/license/version/route ${counts.rows_with_source_ref}/${counts.rows_with_source_url}/${counts.rows_with_local_work_anchor}/${counts.rows_with_license}/${counts.rows_with_version}/${counts.rows_with_route_ids}`);
check('observed_usage_complete', counts.rows_labeled_observed_usage_only === 6, `observed ${counts.rows_labeled_observed_usage_only}/6`);
check('diversity_stable', counts.distinct_works === 6 && counts.distinct_categories === 4 && counts.distinct_licenses === 2 && counts.distinct_route_ids === 1, `work/category/license/route ${counts.distinct_works}/${counts.distinct_categories}/${counts.distinct_licenses}/${counts.distinct_route_ids}`);
check('no_reader_payload_authority_or_semantic_claims', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 && counts.semantic_independence_claims === 0, `reader/payload/forbidden/semantic ${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}/${counts.semantic_independence_claims}`);
check('no_source_broad_queue_side_effects', counts.source_text_reads === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0, `source/broad/queue/submitted ${counts.source_text_reads}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`);
check('authority_boundary_false_flags', boundary.usage_navigation_only === true && boundary.continuity_validation_only === true && boundary.observed_usage_only === true && boundary.route_ids_only === true && boundary.definition_authority === false && boundary.reviewed_lexical_authority === false && boundary.semantic_independence === false && boundary.semantic_arbitration === false && boundary.route_ranking === false && boundary.visible_answer_selection === false && boundary.copied_route_payloads === false && boundary.accepted_text_output === false && boundary.publication_claim === false && boundary.source_text_read === false && boundary.broad_target_expansion === false && boundary.agent6_accepted === false, JSON.stringify(boundary));
check('report_non_authority_wording', report.includes('continuity validation only') && report.includes('not Definition authority') && report.includes('does not claim Agent 6 acceptance') && report.includes('not accepted text'), 'report carries continuity-only boundary wording');
check('all_embedded_checks_passed', (artifact.checks || []).every((row) => row.status === 'passed'), `${(artifact.checks || []).filter((row) => row.status === 'passed').length}/${(artifact.checks || []).length}`);

for (const row of checks) {
  console.log(`${row.passed ? 'PASS' : 'FAIL'} ${row.name}: ${row.detail}`);
}

const failed = checks.filter((row) => !row.passed);
if (failed.length) {
  console.error(`Validation failed: ${failed.map((row) => row.name).join(', ')}`);
  process.exit(1);
}

console.log(`Agent 3 cross-work snippet continuity validation passed: commands ${counts.commands_passed}/${counts.validation_commands}; rows ${counts.cross_work_snippet_occurrence_rows}`);

function check(name, passed, detail) {
  checks.push({ name, passed, detail });
}

function exists(relativePath) {
  return Boolean(relativePath) && fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

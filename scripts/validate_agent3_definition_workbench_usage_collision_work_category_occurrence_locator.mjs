#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-occurrence-locator-reshit.json';
const reportPath = 'reports/agent3-definition-workbench-usage-collision-work-category-occurrence-locator-reshit.md';

const artifact = readJson(artifactPath);
const report = fs.readFileSync(path.join(root, reportPath), 'utf8');
const counts = artifact.counts || {};
const boundary = artifact.authority_boundary || {};
const rows = artifact.occurrence_locator_rows || [];
const checks = [];

check('artifact_type', artifact.artifact_type === 'agent3_definition_workbench_usage_collision_work_category_occurrence_locator', artifact.artifact_type);
check('status_boundary', artifact.status === 'evidence-ready', artifact.status);
check('source_artifact_exists', exists(artifact.source_artifacts?.collision_work_category_index), artifact.source_artifacts?.collision_work_category_index);
check('row_counts', rows.length === 96 && counts.unique_locator_rows === 96 && counts.source_grouped_occurrence_rows === 106, `rows/source ${rows.length}/${counts.unique_locator_rows}/${counts.source_grouped_occurrence_rows}`);
check('unique_occurrence_ids', new Set(rows.map((row) => row.occurrence_id)).size === rows.length, `unique ${new Set(rows.map((row) => row.occurrence_id)).size}/${rows.length}`);
check('clickable_links_complete', counts.rows_with_source_url === 96 && counts.rows_with_local_work_anchor === 96 && rows.every((row) => row.source_url && row.local_work_anchor), `source-url/local-anchor ${counts.rows_with_source_url}/${counts.rows_with_local_work_anchor}`);
check('context_complete', counts.rows_with_source_ref === 96 && counts.rows_with_phrase_context_snippet === 96 && rows.every((row) => row.source_ref && row.phrase_context_snippet), `source-ref/context ${counts.rows_with_source_ref}/${counts.rows_with_phrase_context_snippet}`);
check('metadata_complete', counts.rows_with_work_id === 96 && counts.rows_with_work_title === 96 && counts.rows_with_category === 96 && counts.rows_with_license === 96 && counts.rows_with_version === 96, `work/title/category/license/version ${counts.rows_with_work_id}/${counts.rows_with_work_title}/${counts.rows_with_category}/${counts.rows_with_license}/${counts.rows_with_version}`);
check('route_ids_only_complete', counts.rows_with_route_ids === 96 && counts.distinct_route_ids === 1 && rows.every((row) => Array.isArray(row.related_agent2_route_ids) && row.related_agent2_route_ids.length > 0), `route rows/distinct ${counts.rows_with_route_ids}/${counts.distinct_route_ids}`);
check('observed_usage_only', counts.rows_labeled_observed_usage_only === 96 && rows.every((row) => row.row_label === 'observed usage only' && row.not_definition_authority === true), `observed ${counts.rows_labeled_observed_usage_only}/96`);
check('bucket_links_visible', counts.category_index_rows === 8 && counts.work_index_rows === 24 && counts.category_license_index_rows === 8 && counts.rows_with_category_bucket_links === 58 && counts.rows_with_work_bucket_links === 96 && counts.rows_with_category_license_bucket_links === 58 && counts.locator_membership_links === 212 && rows.every((row) => row.works.length), `category/work/category-license rows ${counts.rows_with_category_bucket_links}/${counts.rows_with_work_bucket_links}/${counts.rows_with_category_license_bucket_links}; buckets ${counts.category_index_rows}/${counts.work_index_rows}/${counts.category_license_index_rows}; links ${counts.locator_membership_links}`);
check('source_work_license_diversity', counts.distinct_source_refs === 49 && counts.distinct_works === 24 && counts.distinct_categories === 8 && counts.distinct_licenses === 2 && counts.distinct_version_sources === 22, `source/work/category/license/version-source ${counts.distinct_source_refs}/${counts.distinct_works}/${counts.distinct_categories}/${counts.distinct_licenses}/${counts.distinct_version_sources}`);
check('no_reader_payload_authority_hits', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 && rows.every((row) => row.reader_facing === false), `reader/payload/forbidden ${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`);
check('no_source_broad_queue_side_effects', counts.source_text_reads === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0, `source/broad/queue/submitted ${counts.source_text_reads}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`);
check('authority_boundary_false_flags', boundary.usage_navigation_only === true && boundary.occurrence_locator_only === true && boundary.observed_usage_only === true && boundary.route_ids_only === true && boundary.definition_authority === false && boundary.reviewed_lexical_authority === false && boundary.semantic_arbitration === false && boundary.route_ranking === false && boundary.visible_answer_selection === false && boundary.copied_route_payloads === false && boundary.accepted_text_output === false && boundary.publication_claim === false && boundary.source_text_read === false && boundary.broad_target_expansion === false && boundary.agent6_accepted === false, JSON.stringify(boundary));
check('report_non_authority_wording', report.includes('occurrence-link navigation only') && report.includes('not Definition authority') && report.includes('without copying Agent 2 route payloads') && report.includes('not accepted text'), 'report carries non-authority boundary wording');
check('all_embedded_checks_passed', (artifact.checks || []).every((row) => row.status === 'passed'), `${(artifact.checks || []).filter((row) => row.status === 'passed').length}/${(artifact.checks || []).length}`);

for (const row of checks) {
  console.log(`${row.passed ? 'PASS' : 'FAIL'} ${row.name}: ${row.detail}`);
}

const failed = checks.filter((row) => !row.passed);
if (failed.length) {
  console.error(`Validation failed: ${failed.map((row) => row.name).join(', ')}`);
  process.exit(1);
}

console.log(`Agent 3 collision work/category occurrence locator validation passed: rows ${counts.unique_locator_rows}; anchors ${counts.rows_with_local_work_anchor}/${counts.unique_locator_rows}`);

function check(name, passed, detail) {
  checks.push({ name, passed, detail });
}

function exists(relativePath) {
  return Boolean(relativePath) && fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

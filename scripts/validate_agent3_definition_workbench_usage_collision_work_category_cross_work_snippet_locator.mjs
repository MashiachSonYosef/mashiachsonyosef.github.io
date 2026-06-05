#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-cross-work-snippet-locator-reshit.json';
const reportPath = 'reports/agent3-definition-workbench-usage-collision-work-category-cross-work-snippet-locator-reshit.md';

const artifact = readJson(artifactPath);
const report = fs.readFileSync(path.join(root, reportPath), 'utf8');
const counts = artifact.counts || {};
const boundary = artifact.authority_boundary || {};
const buckets = artifact.cross_work_snippet_index || [];
const rows = buckets.flatMap((bucket) => bucket.sample_occurrences || []);
const checks = [];

check('artifact_type', artifact.artifact_type === 'agent3_definition_workbench_usage_collision_work_category_cross_work_snippet_locator', artifact.artifact_type);
check('status_boundary', artifact.status === 'evidence-ready', artifact.status);
check('source_artifact_exists', exists(artifact.source_artifacts?.source_ref_repeat_locator), artifact.source_artifacts?.source_ref_repeat_locator);
check('source_repeat_locator_visible', counts.source_repeat_locator_rows === 96 && counts.source_phrase_context_repeat_buckets === 7, `source rows/repeat snippets ${counts.source_repeat_locator_rows}/${counts.source_phrase_context_repeat_buckets}`);
check('cross_work_snippet_counts', buckets.length === 3 && counts.cross_work_snippet_buckets === 3 && counts.cross_work_only_buckets === 3 && counts.cross_category_buckets === 1 && counts.cross_work_snippet_occurrence_rows === 6 && rows.length === 6, `buckets/cross-work/cross-category/rows ${buckets.length}/${counts.cross_work_only_buckets}/${counts.cross_category_buckets}/${rows.length}`);
check('bucket_shape', buckets.every((bucket) => bucket.cross_work === true && bucket.occurrence_count === 2 && bucket.work_count === 2 && bucket.route_ids.length === 1 && bucket.semantic_independence_claimed === false && bucket.reader_facing === false), 'all buckets are two-row cross-work route-pointer review buckets');
check('clickable_metadata_complete', counts.rows_with_source_ref === 6 && counts.rows_with_source_url === 6 && counts.rows_with_local_work_anchor === 6 && counts.rows_with_phrase_context_snippet === 6 && counts.rows_with_license === 6 && counts.rows_with_version === 6 && rows.every((row) => row.source_ref && row.source_url && row.local_work_anchor && row.phrase_context_snippet && row.license && row.license_url && row.version_title && row.version_source), `ref/url/anchor/context/license/version ${counts.rows_with_source_ref}/${counts.rows_with_source_url}/${counts.rows_with_local_work_anchor}/${counts.rows_with_phrase_context_snippet}/${counts.rows_with_license}/${counts.rows_with_version}`);
check('route_ids_only_visible', counts.rows_with_route_ids === 6 && counts.distinct_route_ids === 1 && rows.every((row) => Array.isArray(row.related_agent2_route_ids) && row.related_agent2_route_ids.length === 1), `route rows/distinct ${counts.rows_with_route_ids}/${counts.distinct_route_ids}`);
check('observed_usage_labels_complete', counts.rows_labeled_observed_usage_only === 6 && rows.every((row) => row.row_label === 'observed usage only' && row.not_definition_authority === true && row.reader_facing === false), `observed ${counts.rows_labeled_observed_usage_only}/6`);
check('cross_work_diversity_visible', counts.distinct_source_refs === 6 && counts.distinct_local_anchors === 6 && counts.distinct_works === 6 && counts.distinct_categories === 4 && counts.distinct_licenses === 2, `source/anchor/work/category/license ${counts.distinct_source_refs}/${counts.distinct_local_anchors}/${counts.distinct_works}/${counts.distinct_categories}/${counts.distinct_licenses}`);
check('no_reader_payload_authority_or_semantic_claims', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0 && counts.semantic_independence_claims === 0, `reader/payload/forbidden/semantic ${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}/${counts.semantic_independence_claims}`);
check('no_source_broad_queue_side_effects', counts.source_text_reads === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0, `source/broad/queue/submitted ${counts.source_text_reads}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`);
check('authority_boundary_false_flags', boundary.usage_navigation_only === true && boundary.cross_work_snippet_locator_only === true && boundary.observed_usage_only === true && boundary.route_ids_only === true && boundary.definition_authority === false && boundary.reviewed_lexical_authority === false && boundary.semantic_independence === false && boundary.semantic_arbitration === false && boundary.route_ranking === false && boundary.visible_answer_selection === false && boundary.copied_route_payloads === false && boundary.accepted_text_output === false && boundary.publication_claim === false && boundary.source_text_read === false && boundary.broad_target_expansion === false && boundary.agent6_accepted === false, JSON.stringify(boundary));
check('report_non_authority_wording', report.includes('cross-work snippet navigation only') && report.includes('not Definition authority') && report.includes('not semantic confirmation') && report.includes('not semantic independence') && report.includes('not accepted text'), 'report carries non-authority and no-semantic-independence wording');
check('all_embedded_checks_passed', (artifact.checks || []).every((row) => row.status === 'passed'), `${(artifact.checks || []).filter((row) => row.status === 'passed').length}/${(artifact.checks || []).length}`);

for (const row of checks) {
  console.log(`${row.passed ? 'PASS' : 'FAIL'} ${row.name}: ${row.detail}`);
}

const failed = checks.filter((row) => !row.passed);
if (failed.length) {
  console.error(`Validation failed: ${failed.map((row) => row.name).join(', ')}`);
  process.exit(1);
}

console.log(`Agent 3 cross-work snippet locator validation passed: buckets ${counts.cross_work_snippet_buckets}; rows ${counts.cross_work_snippet_occurrence_rows}`);

function check(name, passed, detail) {
  checks.push({ name, passed, detail });
}

function exists(relativePath) {
  return Boolean(relativePath) && fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

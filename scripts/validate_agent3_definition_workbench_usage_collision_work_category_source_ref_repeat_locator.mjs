#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-source-ref-repeat-locator-reshit.json';
const reportPath = 'reports/agent3-definition-workbench-usage-collision-work-category-source-ref-repeat-locator-reshit.md';

const artifact = readJson(artifactPath);
const report = fs.readFileSync(path.join(root, reportPath), 'utf8');
const counts = artifact.counts || {};
const boundary = artifact.authority_boundary || {};
const sourceBuckets = artifact.source_ref_repeat_index || [];
const anchorBuckets = artifact.local_anchor_repeat_index || [];
const snippetBuckets = artifact.phrase_context_repeat_index || [];
const allBuckets = [...sourceBuckets, ...anchorBuckets, ...snippetBuckets];
const checks = [];

check('artifact_type', artifact.artifact_type === 'agent3_definition_workbench_usage_collision_work_category_source_ref_repeat_locator', artifact.artifact_type);
check('status_boundary', artifact.status === 'evidence-ready', artifact.status);
check('source_artifact_exists', exists(artifact.source_artifacts?.collision_work_category_occurrence_locator), artifact.source_artifacts?.collision_work_category_occurrence_locator);
check('source_locator_rows', counts.source_locator_rows === 96, `rows ${counts.source_locator_rows}`);
check('source_ref_repeat_counts', counts.source_ref_buckets === 49 && sourceBuckets.length === 23 && counts.source_ref_repeat_buckets === 23 && counts.source_ref_repeat_rows === 70 && counts.max_source_ref_repeat_count === 5, `source buckets/repeat buckets/repeat rows/max ${counts.source_ref_buckets}/${counts.source_ref_repeat_buckets}/${counts.source_ref_repeat_rows}/${counts.max_source_ref_repeat_count}`);
check('local_anchor_repeat_counts', counts.local_anchor_buckets === 49 && anchorBuckets.length === 23 && counts.local_anchor_repeat_buckets === 23 && counts.local_anchor_repeat_rows === 70, `anchor buckets/repeat buckets/repeat rows ${counts.local_anchor_buckets}/${counts.local_anchor_repeat_buckets}/${counts.local_anchor_repeat_rows}`);
check('phrase_context_repeat_counts', counts.phrase_context_buckets === 89 && snippetBuckets.length === 7 && counts.phrase_context_repeat_buckets === 7 && counts.phrase_context_repeat_rows === 14, `snippet buckets/repeat buckets/repeat rows ${counts.phrase_context_buckets}/${counts.phrase_context_repeat_buckets}/${counts.phrase_context_repeat_rows}`);
check('cross_frame_snippet_counts', counts.cross_work_phrase_context_repeat_buckets === 3 && counts.cross_category_phrase_context_repeat_buckets === 1, `cross-work/cross-category ${counts.cross_work_phrase_context_repeat_buckets}/${counts.cross_category_phrase_context_repeat_buckets}`);
check('clickable_metadata_complete', counts.rows_with_source_url === 96 && counts.rows_with_local_work_anchor === 96 && counts.rows_with_phrase_context_snippet === 96 && counts.rows_with_license === 96 && counts.rows_with_version === 96, `source/local/context/license/version ${counts.rows_with_source_url}/${counts.rows_with_local_work_anchor}/${counts.rows_with_phrase_context_snippet}/${counts.rows_with_license}/${counts.rows_with_version}`);
check('route_ids_only_visible', counts.rows_with_route_ids === 96 && counts.distinct_route_ids === 1 && allBuckets.every((bucket) => Array.isArray(bucket.route_ids) && bucket.route_ids.length === 1), `route rows/distinct ${counts.rows_with_route_ids}/${counts.distinct_route_ids}`);
check('observed_usage_bucket_labels', allBuckets.every((bucket) => bucket.row_label === 'observed usage only' && bucket.reader_facing === false && bucket.not_definition_authority === true), 'all buckets observed-usage-only');
check('bucket_sample_metadata', allBuckets.every((bucket) => (bucket.sample_occurrences || []).every((row) => row.source_url && row.local_work_anchor && row.phrase_context_snippet && row.license && row.license_url && row.version_title && row.version_source && Array.isArray(row.related_agent2_route_ids))), 'bucket samples preserve links/provenance/route IDs');
check('work_category_license_visibility', counts.distinct_works === 24 && counts.distinct_categories === 8 && counts.distinct_licenses === 2, `work/category/license ${counts.distinct_works}/${counts.distinct_categories}/${counts.distinct_licenses}`);
check('no_reader_payload_authority_hits', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0, `reader/payload/forbidden ${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`);
check('no_source_broad_queue_side_effects', counts.source_text_reads === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0, `source/broad/queue/submitted ${counts.source_text_reads}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`);
check('authority_boundary_false_flags', boundary.usage_navigation_only === true && boundary.source_ref_repeat_locator_only === true && boundary.observed_usage_only === true && boundary.route_ids_only === true && boundary.definition_authority === false && boundary.reviewed_lexical_authority === false && boundary.semantic_arbitration === false && boundary.route_ranking === false && boundary.visible_answer_selection === false && boundary.copied_route_payloads === false && boundary.accepted_text_output === false && boundary.publication_claim === false && boundary.source_text_read === false && boundary.broad_target_expansion === false && boundary.agent6_accepted === false, JSON.stringify(boundary));
check('report_non_authority_wording', report.includes('repeat-navigation evidence only') && report.includes('not Definition authority') && report.includes('not semantic arbitration') && report.includes('not accepted text'), 'report carries non-authority boundary wording');
check('all_embedded_checks_passed', (artifact.checks || []).every((row) => row.status === 'passed'), `${(artifact.checks || []).filter((row) => row.status === 'passed').length}/${(artifact.checks || []).length}`);

for (const row of checks) {
  console.log(`${row.passed ? 'PASS' : 'FAIL'} ${row.name}: ${row.detail}`);
}

const failed = checks.filter((row) => !row.passed);
if (failed.length) {
  console.error(`Validation failed: ${failed.map((row) => row.name).join(', ')}`);
  process.exit(1);
}

console.log(`Agent 3 source-ref repeat locator validation passed: repeated refs ${counts.source_ref_repeat_buckets}; repeated rows ${counts.source_ref_repeat_rows}`);

function check(name, passed, detail) {
  checks.push({ name, passed, detail });
}

function exists(relativePath) {
  return Boolean(relativePath) && fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

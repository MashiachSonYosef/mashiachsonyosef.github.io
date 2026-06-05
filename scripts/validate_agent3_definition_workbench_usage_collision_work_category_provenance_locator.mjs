#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-provenance-locator-reshit.json';
const reportPath = 'reports/agent3-definition-workbench-usage-collision-work-category-provenance-locator-reshit.md';

const artifact = readJson(artifactPath);
const report = fs.readFileSync(path.join(root, reportPath), 'utf8');
const counts = artifact.counts || {};
const boundary = artifact.authority_boundary || {};
const licenseRows = artifact.license_index || [];
const versionRows = artifact.version_source_index || [];
const licenseVersionRows = artifact.license_version_index || [];
const checks = [];

check('artifact_type', artifact.artifact_type === 'agent3_definition_workbench_usage_collision_work_category_provenance_locator', artifact.artifact_type);
check('status_boundary', artifact.status === 'evidence-ready', artifact.status);
check('source_artifact_exists', exists(artifact.source_artifacts?.collision_work_category_occurrence_locator), artifact.source_artifacts?.collision_work_category_occurrence_locator);
check('source_locator_rows', counts.source_locator_rows === 96, `rows ${counts.source_locator_rows}`);
check('license_bucket_counts', counts.license_index_rows === 2 && licenseRows.length === 2 && counts.public_domain_occurrence_rows === 94 && counts.cc_by_sa_occurrence_rows === 2, `license/public-domain/cc-by-sa ${counts.license_index_rows}/${counts.public_domain_occurrence_rows}/${counts.cc_by_sa_occurrence_rows}`);
check('version_bucket_counts', counts.version_source_index_rows === 22 && versionRows.length === 22 && counts.license_version_index_rows === 22 && licenseVersionRows.length === 22, `version/license-version ${counts.version_source_index_rows}/${counts.license_version_index_rows}`);
check('provenance_metadata_complete', counts.rows_with_license_url === 96 && counts.rows_with_version_title === 96 && counts.rows_with_version_source === 96, `license-url/version-title/version-source ${counts.rows_with_license_url}/${counts.rows_with_version_title}/${counts.rows_with_version_source}`);
check('clickable_context_complete', counts.rows_with_source_url === 96 && counts.rows_with_local_work_anchor === 96 && counts.rows_with_phrase_context_snippet === 96, `source-url/local-anchor/context ${counts.rows_with_source_url}/${counts.rows_with_local_work_anchor}/${counts.rows_with_phrase_context_snippet}`);
check('route_ids_only_visible', counts.rows_with_route_ids === 96 && counts.distinct_route_ids === 1 && allBucketsRouteIdsOnly(), `route rows/distinct ${counts.rows_with_route_ids}/${counts.distinct_route_ids}`);
check('observed_usage_bucket_labels', [...licenseRows, ...versionRows, ...licenseVersionRows].every((row) => row.row_label === 'observed usage only' && row.reader_facing === false && row.not_definition_authority === true && row.source_provenance_custody_accepted === false), 'all buckets observed-usage-only and not custody accepted');
check('source_work_category_visibility', counts.distinct_source_refs === 49 && counts.distinct_works === 24 && counts.distinct_categories === 8 && counts.distinct_version_sources === 22, `source/work/category/version-source ${counts.distinct_source_refs}/${counts.distinct_works}/${counts.distinct_categories}/${counts.distinct_version_sources}`);
check('bucket_sample_metadata', [...licenseRows, ...versionRows, ...licenseVersionRows].every((bucket) => (bucket.sample_occurrences || []).every((row) => row.source_url && row.local_work_anchor && row.license && row.license_url && row.version_title && row.version_source && Array.isArray(row.related_agent2_route_ids))), 'bucket sample rows preserve links/provenance/route IDs');
check('no_reader_payload_authority_hits', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0, `reader/payload/forbidden ${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`);
check('no_source_broad_queue_side_effects', counts.source_text_reads === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0, `source/broad/queue/submitted ${counts.source_text_reads}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`);
check('authority_boundary_false_flags', boundary.usage_navigation_only === true && boundary.provenance_locator_only === true && boundary.observed_usage_only === true && boundary.route_ids_only === true && boundary.definition_authority === false && boundary.reviewed_lexical_authority === false && boundary.source_provenance_custody_accepted === false && boundary.semantic_arbitration === false && boundary.route_ranking === false && boundary.visible_answer_selection === false && boundary.copied_route_payloads === false && boundary.accepted_text_output === false && boundary.publication_claim === false && boundary.source_text_read === false && boundary.broad_target_expansion === false && boundary.agent6_accepted === false, JSON.stringify(boundary));
check('report_non_authority_wording', report.includes('provenance navigation only') && report.includes('not Definition authority') && report.includes('not source/provenance custody acceptance') && report.includes('does not copy Agent 2 route payloads') && report.includes('not accepted text'), 'report carries non-authority and non-custody boundary wording');
check('all_embedded_checks_passed', (artifact.checks || []).every((row) => row.status === 'passed'), `${(artifact.checks || []).filter((row) => row.status === 'passed').length}/${(artifact.checks || []).length}`);

for (const row of checks) {
  console.log(`${row.passed ? 'PASS' : 'FAIL'} ${row.name}: ${row.detail}`);
}

const failed = checks.filter((row) => !row.passed);
if (failed.length) {
  console.error(`Validation failed: ${failed.map((row) => row.name).join(', ')}`);
  process.exit(1);
}

console.log(`Agent 3 collision work/category provenance locator validation passed: rows ${counts.source_locator_rows}; licenses ${counts.license_index_rows}; version sources ${counts.version_source_index_rows}`);

function allBucketsRouteIdsOnly() {
  return [...licenseRows, ...versionRows, ...licenseVersionRows].every((bucket) => Array.isArray(bucket.route_ids) && bucket.route_ids.length === 1 && bucket.route_ids[0] === 'def-kaikki-lemma-e4f94cd5131316a8');
}

function check(name, passed, detail) {
  checks.push({ name, passed, detail });
}

function exists(relativePath) {
  return Boolean(relativePath) && fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

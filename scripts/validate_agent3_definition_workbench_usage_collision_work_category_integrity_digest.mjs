#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifactPath = 'data/definitions/agent3-definition-workbench-usage-collision-work-category-integrity-digest-reshit.json';
const reportPath = 'reports/agent3-definition-workbench-usage-collision-work-category-integrity-digest-reshit.md';

const artifact = readJson(artifactPath);
const report = fs.readFileSync(path.join(root, reportPath), 'utf8');
const counts = artifact.counts || {};
const boundary = artifact.authority_boundary || {};
const digestEntries = artifact.digest_entries || [];
const checks = [];

check('artifact_type', artifact.artifact_type === 'agent3_definition_workbench_usage_collision_work_category_integrity_digest', artifact.artifact_type);
check('status_boundary', artifact.status === 'evidence-ready', artifact.status);
check('digest_entry_count', digestEntries.length === 22 && counts.digest_entries === 22, `entries ${digestEntries.length}/${counts.digest_entries}`);
check('all_digest_files_present', counts.files_present === 22 && counts.files_missing === 0 && digestEntries.every((entry) => entry.exists), `present/missing ${counts.files_present}/${counts.files_missing}`);
check('hashes_match_current_files', digestEntries.every(hashMatches), 'all SHA-256 hashes match current files');
check('manifest_counts_visible', counts.manifest_entries === 6 && counts.evidence_ready_entries === 6, `manifest/evidence-ready ${counts.manifest_entries}/${counts.evidence_ready_entries}`);
check('work_category_counts_visible', counts.source_occurrence_rows === 106 && counts.category_index_rows === 8 && counts.work_index_rows === 24 && counts.category_license_index_rows === 8, `source/category/work/category-license ${counts.source_occurrence_rows}/${counts.category_index_rows}/${counts.work_index_rows}/${counts.category_license_index_rows}`);
check('locator_chain_counts_visible', counts.occurrence_locator_rows === 96 && counts.provenance_locator_rows === 96 && counts.source_ref_repeat_buckets === 23 && counts.source_ref_repeat_rows === 70 && counts.cross_work_snippet_buckets === 3 && counts.cross_work_snippet_occurrence_rows === 6, `occ/prov/repeat/cross ${counts.occurrence_locator_rows}/${counts.provenance_locator_rows}/${counts.source_ref_repeat_buckets}-${counts.source_ref_repeat_rows}/${counts.cross_work_snippet_buckets}-${counts.cross_work_snippet_occurrence_rows}`);
check('queue_route_validation_visible', counts.queue_links === 200 && counts.route_ids === 1 && counts.validation_commands === 2 && counts.validation_commands_passed === 2 && counts.validation_commands_failed === 0, `queue/route/commands/pass/fail ${counts.queue_links}/${counts.route_ids}/${counts.validation_commands}/${counts.validation_commands_passed}/${counts.validation_commands_failed}`);
check('no_reader_payload_authority_hits', counts.reader_facing_rows === 0 && counts.route_payload_field_hits === 0 && counts.forbidden_authority_field_hits === 0, `reader/payload/forbidden ${counts.reader_facing_rows}/${counts.route_payload_field_hits}/${counts.forbidden_authority_field_hits}`);
check('no_source_broad_queue_side_effects', counts.source_text_reads === 0 && counts.broad_target_expansion === 0 && counts.queue_mutations === 0 && counts.submitted_to_agent6 === 0, `source/broad/queue/submitted ${counts.source_text_reads}/${counts.broad_target_expansion}/${counts.queue_mutations}/${counts.submitted_to_agent6}`);
check('authority_boundary_false_flags', boundary.usage_navigation_only === true && boundary.integrity_digest_only === true && boundary.observed_usage_only === true && boundary.route_ids_only === true && boundary.definition_authority === false && boundary.reviewed_lexical_authority === false && boundary.semantic_arbitration === false && boundary.route_ranking === false && boundary.visible_answer_selection === false && boundary.copied_route_payloads === false && boundary.accepted_text_output === false && boundary.publication_claim === false && boundary.source_text_read === false && boundary.broad_target_expansion === false && boundary.agent6_accepted === false, JSON.stringify(boundary));
check('report_non_authority_wording', report.includes('integrity/drift evidence only') && report.includes('not Definition authority') && report.includes('not copied Agent 2 payloads') && report.includes('not accepted text'), 'report carries non-authority boundary wording');
check('all_embedded_checks_passed', (artifact.checks || []).every((row) => row.status === 'passed'), `${(artifact.checks || []).filter((row) => row.status === 'passed').length}/${(artifact.checks || []).length}`);

for (const row of checks) {
  console.log(`${row.passed ? 'PASS' : 'FAIL'} ${row.name}: ${row.detail}`);
}

const failed = checks.filter((row) => !row.passed);
if (failed.length) {
  console.error(`Validation failed: ${failed.map((row) => row.name).join(', ')}`);
  process.exit(1);
}

console.log(`Agent 3 collision work/category integrity digest validation passed: files ${counts.files_present}/${counts.digest_entries}; bytes ${counts.total_bytes}`);

function hashMatches(entry) {
  const absPath = path.join(root, entry.path);
  if (!fs.existsSync(absPath)) return false;
  const bytes = fs.readFileSync(absPath);
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  return bytes.length === entry.bytes && sha256 === entry.sha256;
}

function check(name, passed, detail) {
  checks.push({ name, passed, detail });
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

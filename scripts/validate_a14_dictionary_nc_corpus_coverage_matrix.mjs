#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MATRIX_JSON = 'reports/a14-dictionary-nc-corpus-coverage-matrix-2026-06-11.json';
const MATRIX_MD = 'reports/a14-dictionary-nc-corpus-coverage-matrix-2026-06-11.md';
const PIPELINE_JSON = 'reports/a14-dictionary-nc-corpus-expansion-pipeline-spec-2026-06-11.json';
const PIPELINE_MD = 'reports/a14-dictionary-nc-corpus-expansion-pipeline-spec-2026-06-11.md';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function listCount(relativeDir, ext) {
  return fs.readdirSync(path.join(ROOT, relativeDir)).filter((name) => name.endsWith(ext)).length;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const matrix = readJson(MATRIX_JSON);
const markdown = fs.readFileSync(path.join(ROOT, MATRIX_MD), 'utf8');
const pipeline = readJson(PIPELINE_JSON);
const pipelineMarkdown = fs.readFileSync(path.join(ROOT, PIPELINE_MD), 'utf8');
const coverageCount = listCount('data/reports/coverage', '.json');
const unresolvedCount = listCount('data/lexical/unresolved', '.csv');

if (matrix.artifact_type !== 'a14_dictionary_nc_corpus_coverage_matrix') {
  fail(`Unexpected artifact_type: ${matrix.artifact_type}`);
}
if (matrix.status !== 'evidence_matrix_ready_no_active_dictionary_or_nc_output') {
  fail(`Unexpected status: ${matrix.status}`);
}
if (matrix.counts.coverage_json_files !== coverageCount) {
  fail(`Coverage file count mismatch: ${matrix.counts.coverage_json_files} !== ${coverageCount}`);
}
if (matrix.counts.unresolved_csv_files !== unresolvedCount) {
  fail(`Unresolved file count mismatch: ${matrix.counts.unresolved_csv_files} !== ${unresolvedCount}`);
}
if (matrix.counts.work_rows !== matrix.counts.coverage_json_files) {
  fail(`Work row count mismatch: ${matrix.counts.work_rows} !== ${matrix.counts.coverage_json_files}`);
}
if (matrix.boundary.old_dictionary_active_output_allowed !== false) {
  fail('Old dictionary active output boundary must be false.');
}
if (matrix.boundary.old_dictionary_prehud_allowed !== false) {
  fail('Old dictionary preHUD boundary must be false.');
}
if (matrix.boundary.old_dictionary_display_eligible !== false) {
  fail('Old dictionary display eligibility boundary must be false.');
}
if (matrix.counts.gap_manifest_prehud_allowed_rows !== 0) {
  fail(`Gap manifest preHUD rows must remain 0, got ${matrix.counts.gap_manifest_prehud_allowed_rows}`);
}
if (!matrix.source_lane_summary?.source_families?.length) {
  fail('Missing source family summary.');
}
if (matrix.source_lane_summary.active_destination_safe_for_old_dictionaries_now !== false) {
  fail('Active destination safe flag must remain false for old dictionaries.');
}
const hasNc = matrix.source_lane_summary.source_families.some(
  (family) => family.license_lane === 'noncommercial_educational_candidate',
);
if (!hasNc) fail('Missing noncommercial educational candidate source family.');

for (const row of matrix.work_rows || []) {
  if (row.old_dictionary_active_output_allowed !== false) {
    fail(`Work row ${row.work_id} has active output allowed.`);
  }
  if (row.old_dictionary_prehud_allowed !== false) {
    fail(`Work row ${row.work_id} has preHUD allowed.`);
  }
  if (row.old_dictionary_display_eligible !== false) {
    fail(`Work row ${row.work_id} has display eligible.`);
  }
}

if (!markdown.includes('Evidence matrix only')) {
  fail('Markdown report is missing evidence-only boundary text.');
}
if (!markdown.includes('No preHUD')) {
  fail('Markdown report is missing preHUD boundary text.');
}
if (pipeline.artifact_type !== 'a14_dictionary_nc_corpus_expansion_pipeline_spec') {
  fail(`Unexpected pipeline artifact_type: ${pipeline.artifact_type}`);
}
if (pipeline.boundary?.active_lexical_source_layer_mutation !== false) {
  fail('Pipeline must not allow active lexical source-layer mutation.');
}
if (pipeline.boundary?.prehud_display_promotion !== false) {
  fail('Pipeline must not allow preHUD display promotion.');
}
if (pipeline.current_findings?.old_dictionary_source_family_join_current_matches_work_count !== matrix.counts.works_with_old_dictionary_candidate_hits) {
  fail('Pipeline current finding does not match matrix old-dictionary work count.');
}
const stepIds = new Set((pipeline.pipeline_steps || []).map((step) => step.pipeline_step));
for (const requiredStep of [
  'dictionary_nc_corpus_matrix',
  'corpus_wide_dictionary_candidate_generation',
  'source_boundary_clearance',
  'definition_transform_readiness',
  'example_work_lock',
]) {
  if (!stepIds.has(requiredStep)) fail(`Pipeline spec missing step ${requiredStep}`);
}
if (!pipelineMarkdown.includes('not yet 1400-work active output')) {
  fail('Pipeline markdown must state the active-output blocker.');
}

console.log(
  `A14 dictionary/NC corpus coverage matrix validation passed: works ${matrix.counts.work_rows}; matched works ${matrix.counts.works_with_old_dictionary_candidate_hits}; NC works ${matrix.counts.works_with_nc_evidence_hits}; pipeline steps ${stepIds.size}.`,
);
